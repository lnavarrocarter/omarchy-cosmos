import json
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import planet_ai as pa  # noqa: E402


class CleanTest(unittest.TestCase):
    def test_keeps_only_valid_values(self):
        spec = pa.clean({'style': 'plaid', 'colors': ['#AABBCC', 'red', '#000000', 7], 'rings': 'yes',
                         'ringColors': ['nope'], 'spot': '#zzzzzz', 'rim': '#FFFFFF',
                         'name': '<img src=x>Nova' + 'x' * 80})
        self.assertEqual(spec['style'], 'bands')
        self.assertEqual(spec['colors'], ['#aabbcc', '#000000'])
        self.assertIs(spec['rings'], True)
        self.assertNotIn('ringColors', spec)
        self.assertNotIn('spot', spec)
        self.assertEqual(spec['rim'], '#ffffff')
        self.assertNotIn('<', spec['name'])
        self.assertLessEqual(len(spec['name']), 40)

    def test_rejects_too_few_colours_and_non_objects(self):
        self.assertIsNone(pa.clean({'colors': ['#111111']}))
        self.assertIsNone(pa.clean('planet'))


class OfflineTest(unittest.TestCase):
    def read(self, text):
        return pa.clean(pa.offline(text))

    def test_styles_and_rings(self):
        ice = self.read('un mundo helado azul con anillos rosados')
        self.assertEqual(ice['style'], 'ice')
        self.assertTrue(ice['rings'])
        self.assertEqual(ice['ringColors'][0], pa.RAMPS['pink'][3], 'rosados -> pink rings')
        self.assertEqual(self.read('planeta de lava')['style'], 'lava')
        self.assertEqual(self.read('gigante morado con tormentas')['style'], 'storm')
        self.assertFalse(self.read('desierto rojo sin anillos')['rings'])
        self.assertEqual(self.read('a frozen world with pink rings')['ringColors'][0], pa.RAMPS['pink'][3])

    def test_ocean_keeps_water_blue_and_land_green(self):
        p = self.read('a green ocean world with white clouds')
        self.assertEqual(p['style'], 'ocean')
        self.assertEqual(p['colors'][0], pa.RAMPS['blue'][1])
        self.assertEqual(p['colors'][2], pa.RAMPS['green'][2])

    def test_anything_gives_a_planet(self):
        for text in ['xyz', '!!!', 'qwerty uiop', 'a' * 300]:
            self.assertIsNotNone(self.read(text), text)


class CreateTest(unittest.TestCase):
    def test_auto_skips_claude_unless_allowed(self):
        calls = []
        out = pa.create('blue ice', claude_fn=lambda *a: calls.append('claude'),
                        ollama_fn=lambda *a: {'style': 'ice', 'colors': ['#111111', '#222222'], 'rings': True,
                                              'ringColors': ['#333333'], 'spot': '#444444', 'rim': '#555555',
                                              'name': 'Glace'})
        self.assertEqual(out['engine'], 'ollama')
        self.assertEqual(calls, [])
        self.assertEqual(out['planet']['name'], 'Glace')
        self.assertTrue(0 <= out['planet']['seed'] < 1000)

    def test_failures_fall_through_to_offline(self):
        def broken(*a):
            raise OSError('connection refused')
        out = pa.create('lava', claude_on=True, claude_fn=broken, ollama_fn=broken)
        self.assertEqual(out['engine'], 'offline')
        self.assertEqual(len(out['notes']), 2)

    def test_offline_engine_never_touches_models(self):
        def boom(*a):
            raise AssertionError('called')
        self.assertEqual(pa.create('ice', engine='offline', claude_on=True, claude_fn=boom, ollama_fn=boom)['engine'],
                         'offline')

    def test_description_is_bounded(self):
        seen = []
        pa.create('x ' * 500, engine='ollama', ollama_fn=lambda t, *a: seen.append(t) or {})
        self.assertLessEqual(len(seen[0]), pa.MAX_DESCRIPTION)
        with self.assertRaises(ValueError):
            pa.create('   ')


class OllamaTest(unittest.TestCase):
    def test_request_shape_and_model_discovery(self):
        sent = []

        def opener(url, payload=None, timeout=90):
            sent.append((url, payload))
            if url.endswith('/api/tags'):
                return {'models': [{'name': 'qwen3:8b'}]}
            return {'response': json.dumps({'style': 'ice', 'colors': ['#111111', '#222222']})}
        out = pa.ollama('cold', 'http://127.0.0.1:11434/', '', opener=opener)
        self.assertEqual(out['style'], 'ice')
        url, body = sent[1]
        self.assertEqual(url, 'http://127.0.0.1:11434/api/generate')
        self.assertEqual(body['model'], 'qwen3:8b')
        self.assertEqual(body['format'], pa.SCHEMA)
        self.assertFalse(body['stream'])

    def test_bad_url_is_refused(self):
        with self.assertRaises(ValueError):
            pa.ollama('x', 'file:///etc/passwd', 'm', opener=lambda *a, **k: {})


class ClaudeTest(unittest.TestCase):
    def fake_sdk(self, stop='end_turn', text='{"style": "lava", "colors": ["#111111", "#ff9447"]}'):
        captured = {}

        class Messages:
            def create(self, **kw):
                captured.update(kw)
                return SimpleNamespace(stop_reason=stop, content=[SimpleNamespace(type='text', text=text)])

        class Client:
            def __init__(self, **kw):
                captured['client'] = kw
                self.beta = SimpleNamespace(messages=Messages())
        return SimpleNamespace(Anthropic=Client), captured

    def test_request_uses_structured_output_and_fallbacks(self):
        sdk, sent = self.fake_sdk()
        out = pa.claude('a lava world', '', sdk=sdk)
        self.assertEqual(out['style'], 'lava')
        self.assertEqual(sent['model'], pa.DEFAULT_CLAUDE_MODEL)
        self.assertEqual(sent['fallbacks'], 'default')
        self.assertIn('server-side-fallback-2026-07-01', sent['betas'])
        self.assertEqual(sent['output_config']['format']['schema'], pa.SCHEMA)
        self.assertNotIn('thinking', sent)

    def test_refusal_is_an_error(self):
        sdk, _ = self.fake_sdk(stop='refusal', text='')
        with self.assertRaises(RuntimeError):
            pa.claude('x', 'claude-opus-5-5', sdk=sdk)


if __name__ == '__main__':
    unittest.main()
