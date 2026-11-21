import importlib.util
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import patch

SCRIPTS = Path(__file__).resolve().parents[1] / 'scripts'
sys.path.insert(0, str(SCRIPTS))
import resolve_fact_checks as resolver


class ResolutionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / '_editorial/drafts').mkdir(parents=True)
        self.topic = {'id': 'example', 'title': 'Example article', 'status': 'ready', 'issue_number': 1, 'publishAt': '2026-11-30T12:00:00+08:00'}
        self.record = {'issues': [], 'editorial_review': {'corrections': ['Removed an unsupported optional claim.']}}

    def run_case(self, state='OPEN'):
        (self.root / '_editorial/queue.json').write_text(json.dumps({'topics': [self.topic]}))
        (self.root / '_editorial/drafts/example.json').write_text(json.dumps(self.record))
        with patch.object(resolver, '__file__', str(self.root / 'scripts/resolve_fact_checks.py')), \
             patch.dict(os.environ, {'GITHUB_REPOSITORY': 'example/repo'}), \
             patch.object(resolver.subprocess, 'run', side_effect=[SimpleNamespace(returncode=0, stdout=json.dumps({'state': state})), SimpleNamespace(returncode=0, stdout='')]) as commands, \
             patch.object(resolver, 'send') as message:
            resolver.main()
            return commands, message

    def test_blocked_article_does_not_close_issue(self):
        self.topic['status'] = 'needs_verification'
        commands, message = self.run_case()
        commands.assert_not_called()
        message.assert_not_called()

    def test_already_closed_does_not_send_duplicate(self):
        commands, message = self.run_case('CLOSED')
        self.assertEqual(commands.call_count, 1)
        message.assert_not_called()

    def test_ready_article_closes_issue_and_sends_schedule(self):
        commands, message = self.run_case()
        self.assertEqual(commands.call_count, 2)
        self.assertIn('close', commands.call_args.args[0])
        self.assertIn('2026-11-30', message.call_args.args[0])
        self.assertIn('remains unpublished', message.call_args.args[0])

    def test_unresolved_draft_cannot_close(self):
        self.record['issues'] = [{'reason': 'Still missing evidence'}]
        with self.assertRaises(RuntimeError):
            self.run_case()


if __name__ == '__main__':
    unittest.main()
