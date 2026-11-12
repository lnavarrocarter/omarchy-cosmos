import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import system_probe as sp  # noqa: E402


class SystemProbeTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def test_ram_uses_available_memory(self):
        (self.root / 'meminfo').write_text('MemTotal: 1000 kB\nMemFree: 100 kB\nMemAvailable: 250 kB\n')
        self.assertEqual(sp.ram(self.root), 75.0)

    def test_cpu_from_two_samples(self):
        samples = iter(['cpu  100 0 100 800 0 0 0 0\n', 'cpu  150 0 150 900 0 0 0 0\n'])
        stat = self.root / 'stat'

        def fake_sleep(_):
            stat.write_text(next(samples))
        stat.write_text(next(samples))
        with mock.patch.object(sp.time, 'sleep', fake_sleep):
            self.assertEqual(sp.cpu(self.root), 50.0)

    def test_amd_counter_and_garbage(self):
        for i, v in enumerate(['37', 'nope']):
            d = self.root / f'card{i}' / 'device'
            d.mkdir(parents=True)
            (d / 'gpu_busy_percent').write_text(v)
        self.assertEqual(sp.amd(self.root), [{'usage': 37.0}])

    def test_values_are_clamped(self):
        self.assertEqual(sp.clamp('140'), 100.0)
        self.assertEqual(sp.clamp(-3), 0.0)
        self.assertIsNone(sp.clamp('x'))

    def test_no_workbench_no_projects(self):
        self.assertEqual(sp.projects(self.root / 'missing.py'), [])

    def test_project_names_are_cleaned_and_bounded(self):
        probe = self.root / 'probe.py'
        names = ['<img src=x>Kua', 'a' * 90] + ['p%d' % i for i in range(20)]
        probe.write_text('import json\nprint(json.dumps({"projects": %s}))\n'
                         % json.dumps([{'name': n, 'path': '/secret'} for n in names]))
        out = sp.projects(probe)
        self.assertEqual(len(out), sp.MAX_PROJECTS)
        self.assertEqual(out[0], {'name': 'img srcxKua'})
        self.assertEqual(len(out[1]['name']), 40)
        self.assertNotIn('/secret', json.dumps(out))

    def test_snapshot_shape(self):
        with mock.patch.object(sp, 'cpu', return_value=10.0), mock.patch.object(sp, 'ram', return_value=20.0), \
                mock.patch.object(sp, 'nvidia', return_value=[]), mock.patch.object(sp, 'amd', return_value=[]):
            self.assertEqual(sp.snapshot(), {'cpu': 10.0, 'ram': 20.0, 'gpus': []})


if __name__ == '__main__':
    unittest.main()
