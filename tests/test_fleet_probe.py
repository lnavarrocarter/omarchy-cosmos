import json
import sys
import tempfile
import unittest
from datetime import datetime
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import fleet_probe  # noqa: E402


def iso(ts):
    return datetime.fromtimestamp(ts).astimezone().isoformat()


class FakeHub:
    def __init__(self, tasks, online=True):
        self.tasks = tasks
        self.online = online

    def snapshot(self):
        return {'status': 'ready', 'online': self.online, 'tasks': self.tasks}


class FleetProbeTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        self.claude = root / 'claude'
        self.codex = root / 'codex'
        (self.claude / 'proj').mkdir(parents=True)
        (self.codex / '2026' / '11' / '11').mkdir(parents=True)
        self.patches = [
            mock.patch.object(fleet_probe, 'CACHE', root / 'cache' / 'fleet.json'),
            mock.patch.object(fleet_probe, 'CLAUDE_ROOT', self.claude),
            mock.patch.object(fleet_probe, 'CODEX_ROOT', self.codex),
            mock.patch.object(fleet_probe, 'HUB_CLIENT', root / 'missing.py'),
        ]
        for p in self.patches:
            p.start()
        self.now = datetime.now().replace(hour=12, minute=0, second=0, microsecond=0).timestamp()

    def tearDown(self):
        for p in self.patches:
            p.stop()
        self.tmp.cleanup()

    def write(self, path, records):
        with open(path, 'a') as handle:
            for record in records:
                handle.write(json.dumps(record) + '\n')

    def claude_assistant(self, ts, mid, inp=100, out=50, cache=10, cache_read=999999):
        return {'type': 'assistant', 'timestamp': iso(ts), 'message': {
            'id': mid, 'content': [{'type': 'text', 'text': 'SECRET ANSWER'}],
            'usage': {'input_tokens': inp, 'output_tokens': out,
                      'cache_creation_input_tokens': cache, 'cache_read_input_tokens': cache_read}}}

    def claude_prompt(self, ts, text='SECRET PROMPT'):
        return {'type': 'user', 'timestamp': iso(ts), 'message': {'content': text}}

    def test_claude_tokens_prompts_and_dedupe(self):
        log = self.claude / 'proj' / 's.jsonl'
        self.write(log, [
            self.claude_prompt(self.now - 30),
            self.claude_assistant(self.now - 29, 'm1'),
            self.claude_assistant(self.now - 29, 'm1'),  # streamed duplicate
            {'type': 'user', 'timestamp': iso(self.now - 28),
             'message': {'content': [{'type': 'tool_result', 'content': 'x'}]}},
            self.claude_assistant(self.now - 27, 'm2', 1, 1, 0),
        ])
        snap = fleet_probe.snapshot(now=self.now, use_hub=False)
        claude = snap['agents']['claude']
        self.assertEqual(claude['tokens_today'], 160 + 2)
        self.assertEqual(claude['prompts_today'], 1)
        self.assertEqual(len(snap['events']), 1)
        self.assertEqual(snap['events'][0]['agent'], 'claude')

    def test_incremental_reads_only_new_lines(self):
        log = self.claude / 'proj' / 's.jsonl'
        self.write(log, [self.claude_assistant(self.now - 60, 'a')])
        fleet_probe.snapshot(now=self.now, use_hub=False)
        self.write(log, [self.claude_assistant(self.now - 5, 'b')])
        snap = fleet_probe.snapshot(now=self.now, use_hub=False)
        self.assertEqual(snap['agents']['claude']['tokens_today'], 320)

    def test_yesterday_records_do_not_count(self):
        log = self.claude / 'proj' / 's.jsonl'
        self.write(log, [self.claude_assistant(self.now - 86400, 'old'), self.claude_prompt(self.now - 86400)])
        snap = fleet_probe.snapshot(now=self.now, use_hub=False)
        self.assertEqual(snap['agents']['claude']['tokens_today'], 0)
        self.assertEqual(snap['agents']['claude']['prompts_today'], 0)

    def test_codex_counts_fresh_input_and_output(self):
        log = self.codex / '2026' / '11' / '11' / 'r.jsonl'
        self.write(log, [
            {'type': 'response_item', 'timestamp': iso(self.now - 11), 'payload': {
                'type': 'message', 'role': 'user', 'content': [{'type': 'input_text', 'text': '<environment_context>x'}]}},
            {'type': 'response_item', 'timestamp': iso(self.now - 10), 'payload': {
                'type': 'message', 'role': 'user', 'content': [{'type': 'input_text', 'text': 'SECRET'}]}},
            {'type': 'event_msg', 'timestamp': iso(self.now - 9), 'payload': {'type': 'token_count', 'info': {
                'last_token_usage': {'input_tokens': 1000, 'cached_input_tokens': 800, 'output_tokens': 40}}}},
        ])
        snap = fleet_probe.snapshot(now=self.now, use_hub=False)
        self.assertEqual(snap['agents']['codex']['tokens_today'], 240)
        self.assertEqual(snap['agents']['codex']['prompts_today'], 1)

    def test_output_never_contains_message_text(self):
        log = self.claude / 'proj' / 's.jsonl'
        self.write(log, [self.claude_prompt(self.now - 3, '<img src=x> SECRET PROMPT'),
                         self.claude_assistant(self.now - 2, 'z')])
        hub = FakeHub([{'id': 'a' * 32, 'status': 'running', 'execution': 'claude',
                        'summary': 'SECRET SUMMARY', 'metrics': None}])
        out = json.dumps(fleet_probe.snapshot(now=self.now, hub_client=hub))
        self.assertNotIn('SECRET', out)
        self.assertNotIn('<img', out)

    def test_hub_tokens_count_once_and_skip_history(self):
        done = {'id': 'b' * 32, 'status': 'completed', 'execution': 'auto',
                'metrics': {'engine': 'copilot', 'elapsed_ms': 3000,
                            'external_tokens': {'input': 900, 'output': 100}, 'local_tokens': None}}
        # First run: already finished task is history.
        snap = fleet_probe.snapshot(now=self.now, hub_client=FakeHub([done]))
        self.assertEqual(snap['agents']['copilot']['tokens_today'], 0)
        task = snap['hub']['tasks'][0]
        self.assertEqual((task['engine'], task['tokens'], task['status']), ('copilot', 1000, 'completed'))
        # A task that finishes later counts once.
        new = dict(done, id='c' * 32)
        fleet_probe.snapshot(now=self.now, hub_client=FakeHub([new, done]))
        snap = fleet_probe.snapshot(now=self.now, hub_client=FakeHub([new, done]))
        self.assertEqual(snap['agents']['copilot']['tokens_today'], 1000)

    def test_workspaces_are_validated_aliases(self):
        class Hub(FakeHub):
            def snapshot(self):
                d = super().snapshot()
                d['workspaces'] = ['hub', '<b>x</b>', 'a' * 81, 'work_bench-2']
                return d
        hub = Hub([{'id': 'd' * 32, 'status': 'running', 'execution': 'codex', 'workspace': '<img src=x>'},
                   {'id': 'e' * 32, 'status': 'queued', 'execution': 'codex', 'workspace': 'hub'}])
        snap = fleet_probe.snapshot(now=self.now, hub_client=hub)
        self.assertEqual(snap['hub']['workspaces'], ['hub', 'work_bench-2'])
        self.assertEqual([t['workspace'] for t in snap['hub']['tasks']], ['', 'hub'])

    def test_broken_hub_reports_unavailable(self):
        class Broken:
            def snapshot(self):
                raise ValueError('boom')
        snap = fleet_probe.snapshot(now=self.now, hub_client=Broken())
        self.assertEqual(snap['hub'], {'online': False, 'status': 'unavailable', 'tasks': [], 'workspaces': []})

    def test_garbage_lines_and_huge_numbers_are_ignored(self):
        log = self.claude / 'proj' / 's.jsonl'
        with open(log, 'w') as handle:
            handle.write('not json\n{"type": "assistant"}\n')
        self.write(log, [self.claude_assistant(self.now - 1, 'h', inp=10 ** 12, out=-5, cache='x')])
        snap = fleet_probe.snapshot(now=self.now, use_hub=False)
        self.assertEqual(snap['agents']['claude']['tokens_today'], 0)

    def codex_log(self, records):
        log = self.codex / '2026' / '11' / '11' / 'r.jsonl'
        self.write(log, records)
        return log

    def codex_event(self, ts, payload):
        return {'type': 'event_msg', 'timestamp': iso(ts), 'payload': payload}

    def codex_user(self, ts, text):
        return {'type': 'response_item', 'timestamp': iso(ts), 'payload': {
            'type': 'message', 'role': 'user', 'content': [{'type': 'input_text', 'text': text}]}}

    def codex_usage(self, ts, inp=100, cached=0, out=10, limits=None):
        return self.codex_event(ts, {'type': 'token_count', 'rate_limits': limits, 'info': {
            'last_token_usage': {'input_tokens': inp, 'cached_input_tokens': cached, 'output_tokens': out}}})

    def test_codex_subagent_and_preamble_are_not_prompts(self):
        self.codex_log([
            {'type': 'session_meta', 'timestamp': iso(self.now - 50), 'payload': {'source': 'cli'}},
            self.codex_user(self.now - 49, '# AGENTS.md instructions for /x SECRET'),
            self.codex_user(self.now - 48, 'SECRET typed'),
        ])
        sub = self.codex / '2026' / '11' / '11' / 'guardian.jsonl'
        self.write(sub, [
            {'type': 'session_meta', 'timestamp': iso(self.now - 40), 'payload': {'source': {'subagent': {'other': 'guardian'}}}},
            self.codex_usage(self.now - 40, 5000, 0, 0),  # replay of the parent's last usage
            self.codex_user(self.now - 39, 'SECRET review this'),
            self.codex_usage(self.now - 30, 300, 100, 20),
        ])
        snap = fleet_probe.snapshot(now=self.now, use_hub=False)
        codex = snap['agents']['codex']
        self.assertEqual(codex['prompts_today'], 1)
        self.assertEqual(codex['tokens_today'], 220)
        self.assertNotIn('SECRET', json.dumps(snap))

    def test_codex_plan_limits_size_fuel(self):
        limits = {'primary': {'used_percent': 12.0, 'window_minutes': 300, 'resets_at': self.now + 600},
                  'secondary': {'used_percent': 51.0, 'window_minutes': 10080, 'resets_at': self.now + 86400}}
        self.codex_log([self.codex_usage(self.now - 20, limits=limits)])
        snap = fleet_probe.snapshot(now=self.now, use_hub=False)
        self.assertEqual(snap['agents']['codex']['limit_used'], 51.0)
        self.assertNotIn('limit_used', snap['agents']['claude'])
        # A window that already reset no longer counts.
        snap = fleet_probe.snapshot(now=self.now + 90000, use_hub=False)
        self.assertEqual(snap['agents']['codex'].get('limit_used'), 0.0)

    def test_open_codex_turn_is_busy_until_it_ends(self):
        self.codex_log([self.codex_event(self.now - 600, {'type': 'task_started'}),
                        self.codex_user(self.now - 599, 'go')])
        snap = fleet_probe.snapshot(now=self.now, use_hub=False)
        self.assertTrue(snap['agents']['codex']['busy'])
        self.assertLess(snap['agents']['codex']['last_activity'], self.now - 500)
        self.codex_log([self.codex_event(self.now - 1, {'type': 'task_complete'})])
        snap = fleet_probe.snapshot(now=self.now, use_hub=False)
        self.assertFalse(snap['agents']['codex']['busy'])

    def test_ollama_journal_counts_numbers_only(self):
        t = self.now - 100
        lines = [
            '%.6f host ollama[1]: <|im_start|>user' % t,
            '%.6f host ollama[1]: SECRET PROMPT eval time = 5 ms / 999 tokens' % t,
            '%.6f host ollama[1]: slot launch_slot_: id  0 | task 0 | processing task, is_child = 0' % t,
            '%.6f host ollama[1]: slot print_timing: id  0 | task 0 | prompt eval time =     340.01 ms /   199 tokens (x)' % (t + 2),
            '%.6f host ollama[1]: slot print_timing: id  0 | task 0 |        eval time =    2122.35 ms /    92 tokens (x)' % (t + 2),
            '%.6f host ollama[1]: slot print_timing: id  0 | task 0 |       total time =    2462.36 ms /   291 tokens' % (t + 2),
            '%.6f host ollama[1]: slot      release: id  0 | task 0 | stop processing: n_tokens = 290, truncated = 0' % (t + 2),
            '-- cursor: s=abc',
        ]
        calls = []

        def reader(unit, cursor, since):
            calls.append((unit, cursor))
            return (lines if cursor is None else []), 's=abc'
        snap = fleet_probe.snapshot(now=self.now, use_hub=False, ollama_unit='workbench-ollama', journal_reader=reader)
        local = snap['agents']['local']
        self.assertEqual((local['tokens_today'], local['prompts_today']), (291, 1))
        self.assertFalse(local['busy'])
        self.assertEqual(snap['events'][-1]['agent'], 'local')
        snap = fleet_probe.snapshot(now=self.now, use_hub=False, ollama_unit='workbench-ollama', journal_reader=reader)
        self.assertEqual(snap['agents']['local']['tokens_today'], 291)
        self.assertEqual(calls, [('workbench-ollama', None), ('workbench-ollama', 's=abc')])
        self.assertNotIn('SECRET', json.dumps(snap))
        self.assertNotIn('im_start', fleet_probe.CACHE.read_text())

    def test_ollama_generation_in_progress_is_busy(self):
        line = '%.6f h o[1]: slot launch_slot_: id  0 | task 3 | processing task, is_child = 0' % (self.now - 5)
        snap = fleet_probe.snapshot(now=self.now, use_hub=False, ollama_unit='u',
                                    journal_reader=lambda *a: ([line], 'c'))
        self.assertTrue(snap['agents']['local']['busy'])

    def test_quick_hub_task_is_flagged_recent_once(self):
        queued = {'id': 'f' * 32, 'status': 'queued', 'execution': 'local', 'metrics': None}
        fleet_probe.snapshot(now=self.now, hub_client=FakeHub([queued]))
        done = dict(queued, status='completed', metrics={'engine': 'local', 'elapsed_ms': 900,
                                                         'local_tokens': {'input': 200, 'output': 50}})
        snap = fleet_probe.snapshot(now=self.now + 10, hub_client=FakeHub([done]))
        self.assertTrue(snap['hub']['tasks'][0]['recent'])
        self.assertEqual(snap['agents']['local']['tokens_today'], 250)
        snap = fleet_probe.snapshot(now=self.now + 20, hub_client=FakeHub([done]))
        self.assertNotIn('recent', snap['hub']['tasks'][0])

    def test_finished_after_a_long_gap_is_not_recent(self):
        fleet_probe.snapshot(now=self.now, hub_client=FakeHub([]))
        done = {'id': '1' * 32, 'status': 'completed', 'execution': 'codex', 'metrics': None}
        snap = fleet_probe.snapshot(now=self.now + 3600, hub_client=FakeHub([done]))
        self.assertNotIn('recent', snap['hub']['tasks'][0])

    def test_local_hub_tokens_not_doubled_with_ollama_journal(self):
        fleet_probe.snapshot(now=self.now, hub_client=FakeHub([]), ollama_unit='u', journal_reader=lambda *a: ([], None))
        done = {'id': '2' * 32, 'status': 'completed', 'execution': 'auto',
                'metrics': {'engine': 'none', 'elapsed_ms': 90, 'local_tokens': {'input': 70, 'output': 5}}}
        snap = fleet_probe.snapshot(now=self.now + 5, hub_client=FakeHub([done]), ollama_unit='u',
                                    journal_reader=lambda *a: ([], None))
        task = snap['hub']['tasks'][0]
        self.assertEqual((task['engine'], task['recent']), ('local', True))
        self.assertEqual(snap['agents']['local']['tokens_today'], 0)
        self.assertEqual(snap['agents']['local']['last_activity'], self.now + 5)

    def test_cli_rejects_option_like_unit(self):
        self.assertFalse(fleet_probe.UNIT.fullmatch('--since=x'))
        self.assertTrue(fleet_probe.UNIT.fullmatch('system:ollama'))


if __name__ == '__main__':
    unittest.main()
