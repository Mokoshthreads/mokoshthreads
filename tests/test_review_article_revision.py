import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import review_article_revision as revision


class RevisionTests(unittest.TestCase):
    def test_review_keeps_published_site_and_queue_unchanged_even_when_blocked(self):
        for issues in ([], [{'claim': 'Example', 'reason': 'Unsupported'}]):
            with self.subTest(issues=issues), tempfile.TemporaryDirectory() as temp:
                root = Path(temp)
                (root / '_editorial').mkdir()
                queue = {'topics': [{'id': 'example', 'title': 'Old title', 'status': 'published', 'issue_number': 8}]}
                (root / '_editorial/queue.json').write_text(json.dumps(queue))
                (root / 'resources/example').mkdir(parents=True)
                (root / 'resources/example/index.html').write_text('Published page')
                (root / 'resources/resources.json').write_text('Published catalogue')
                before = {p.relative_to(root): p.read_bytes() for p in root.rglob('*') if p.is_file()}
                draft = {'sections': [{'paragraphs': [{'text': 'Revised prose', 'evidence': [{'quote': 'Third-party page text'}]}]}]}
                sources = {'s1': {'url': 'https://museum.example/text', 'sha256': 'abc', 'text': 'Third-party page text'}}
                with patch.object(revision, 'process', return_value=(draft, sources, issues)) as process:
                    record = revision.review_revision(root, 'example', 'New title')
                for name, contents in before.items():
                    self.assertEqual((root / name).read_bytes(), contents)
                self.assertEqual(process.call_args.args[1]['title'], 'New title')
                self.assertNotIn('issue_number', process.call_args.args[1])
                self.assertEqual(record['issues'], issues)
                self.assertNotIn('Third-party page text', (root / '_editorial/revisions/example.json').read_text())

    def test_revision_requires_a_published_topic(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / '_editorial').mkdir()
            (root / '_editorial/queue.json').write_text('{"topics": [{"id": "example", "status": "queued"}]}')
            with self.assertRaises(ValueError), patch.object(revision, 'process') as process:
                revision.review_revision(root, 'example', 'New title')
            process.assert_not_called()
