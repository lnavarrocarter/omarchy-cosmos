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


if __name__ == '__main__':
    unittest.main()
