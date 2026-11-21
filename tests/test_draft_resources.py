import copy
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
from datetime import datetime

SCRIPTS = Path(__file__).resolve().parents[1] / 'scripts'
sys.path.insert(0, str(SCRIPTS))
import draft_resources as drafting


class DraftingTests(unittest.TestCase):
    def setUp(self):
        self.sources = {
            's1': {'url': 'https://museum.example/history', 'text': 'The factory started making mechanical watches during this period.', 'sha256': 'a'},
            's2': {'url': 'https://archive.example/catalogue', 'text': 'The catalogue describes the movement and its construction in detail.', 'sha256': 'b'}}
        self.draft = {'title': 'Example', 'description': 'A sourced introduction.', 'concerns': [], 'sections': []}
        for i in range(3):
            paragraphs = []
            for sid in ['s1', 's2']:
                paragraphs.append({'text': ' '.join(['Editorial'] * 80), 'source_ids': [sid],
                    'evidence': [{'source_id': sid, 'quote': self.sources[sid]['text']}]})
            self.draft['sections'].append({'heading': 'Section ' + str(i), 'paragraphs': paragraphs})

    def test_complete_citations_and_matched_evidence_pass(self):
        self.assertEqual(drafting.validate_draft(self.draft, self.sources), [])

    def test_invented_evidence_fails(self):
        self.draft['sections'][0]['paragraphs'][0]['evidence'][0]['quote'] = 'This is not present in the real retrieved source page.'
        self.assertTrue(drafting.validate_draft(self.draft, self.sources))

    def test_uncited_paragraph_fails(self):
        self.draft['sections'][0]['paragraphs'][0]['source_ids'] = []
        self.assertTrue(drafting.validate_draft(self.draft, self.sources))

    def test_one_domain_cannot_pass_as_two_sources(self):
        self.sources['s2']['url'] = 'https://museum.example/another-page'
        self.assertTrue(drafting.validate_draft(self.draft, self.sources))

    def test_incomplete_ai_response_is_not_approved(self):
        with self.assertRaises(drafting.PipelineError):
            drafting.response_text({'status': 'incomplete', 'output': []})

    def test_only_tool_citations_become_source_candidates(self):
        result = {'output': [{'type': 'message', 'content': [{'type': 'output_text',
            'text': 'https://invented.example', 'annotations': [
                {'type': 'url_citation', 'url': 'https://museum.example/history'},
                {'type': 'url_citation', 'url': 'https://museum.example/history'}]}]}]}
        self.assertEqual(drafting.cited_urls(result), ['https://museum.example/history'])

    def test_private_source_url_rejected(self):
        with patch.object(drafting.socket, 'getaddrinfo', return_value=[(2, 1, 6, '', ('127.0.0.1', 443))]):
            with self.assertRaises(ValueError):
                drafting.public_url('https://internal.example/document')

    def test_independent_review_can_block_matched_sources(self):
        search = {'output': [{'content': [{'annotations': [
            {'type': 'url_citation', 'url': self.sources[s]['url']} for s in ['s1', 's2']]}]}]}
        review = {'approved': False, 'issues': [{'claim': 'Date', 'reason': 'Conflict', 'evidence_needed': 'A factory record', 'source_urls': []}]}
        with patch.object(drafting, 'api', side_effect=[('research', search), (self.draft, {}), (review, {})]), \
             patch.object(drafting, 'fetch_source', side_effect=[self.sources['s1'], self.sources['s2']]):
            _, _, issues = drafting.process(Path('/tmp'), {'title': 'Example', 'id': 'example'})
        self.assertEqual(issues[0]['reason'], 'Conflict')

    def test_renderer_escapes_generated_html(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            template = root / 'resources/history-of-vostok-watches/index.html'
            template.parent.mkdir(parents=True)
            template.write_text('<body><header>Header</header><main class="article"></main>  <footer>Footer</footer></body></html>')
            topic = {'id': 'example', 'title': 'Example', 'category': 'Guides', 'publishAt': '2026-11-30T12:00:00+08:00'}
            self.draft['sections'][0]['paragraphs'][0]['text'] = '<script>alert(1)</script>'
            rendered = drafting.render_article(root, topic, self.draft, self.sources)
            self.assertIn('&lt;script&gt;', rendered)
            self.assertNotIn('<script>alert', rendered)
            self.assertIn('source-1', rendered)

    def test_queue_has_sixteen_sequential_monday_slots(self):
        root = Path(__file__).resolve().parents[1]
        topics = json.loads((root / '_editorial/queue.json').read_text())['topics']
        self.assertEqual(len(topics), 16)
        self.assertEqual(len({t['id'] for t in topics}), 16)
        dates = [datetime.fromisoformat(t['publishAt']) for t in topics]
        self.assertTrue(all(d.weekday() == 0 and d.hour == 12 and d.utcoffset().total_seconds() == 8 * 3600 for d in dates))
        self.assertTrue(all((b - a).days == 7 for a, b in zip(dates, dates[1:])))


if __name__ == '__main__':
    unittest.main()
