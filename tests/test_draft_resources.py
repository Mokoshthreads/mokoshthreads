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

class RequestedTopicTests(unittest.TestCase):
    def test_requested_topic_does_not_draft_the_next_queued_article(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / '_editorial').mkdir()
            queue = {'topics': [
                {'id': 'first', 'title': 'First', 'category': 'Guides', 'publishAt': '2026-11-30T12:00:00+08:00'},
                {'id': 'requested', 'title': 'Requested', 'category': 'Guides', 'publishAt': '2026-12-07T12:00:00+08:00'}]}
            (root / '_editorial/queue.json').write_text(json.dumps(queue))
            draft = {'title': 'Requested', 'description': 'Summary', 'sections': [], 'concerns': []}
            with patch.object(drafting, '__file__', str(root / 'scripts/draft_resources.py')), \
                 patch.object(sys, 'argv', ['draft_resources.py', '--limit', '1', '--topic', 'requested']), \
                 patch.object(drafting, 'process', return_value=(draft, {}, [])) as process, \
                 patch.object(drafting, 'render_article', return_value='<h1>Requested</h1>'), \
                 patch.object(drafting, 'update_catalogue'):
                self.assertEqual(drafting.main(), 0)
            self.assertEqual(process.call_count, 1)
            self.assertEqual(process.call_args.args[1]['id'], 'requested')
            saved = json.loads((root / '_editorial/queue.json').read_text())
            self.assertNotIn('status', saved['topics'][0])
            self.assertEqual(saved['topics'][1]['status'], 'ready')

class GroundedSchemaTests(DraftingTests):
    def test_evidence_choices_are_real_source_substrings(self):
        schema = drafting.grounded_schema(self.sources, 'Camera history')
        sections = schema['properties']['sections']
        paragraphs = sections['items']['properties']['paragraphs']
        self.assertEqual((sections['minItems'], sections['maxItems']), (5, 5))
        self.assertEqual((paragraphs['minItems'], paragraphs['maxItems']), (2, 2))
        evidence = paragraphs['items']['properties']['evidence']['items']['properties']
        self.assertEqual(set(evidence['source_id']['enum']), set(self.sources))
        passages = drafting.evidence_passages(self.sources, 'Camera history')
        for passage_id in evidence['quote']['enum']:
            passage = passages[passage_id]
            self.assertIn(passage['quote'], self.sources[passage['source_id']]['text'])
        import re
        pattern = paragraphs['items']['properties']['text']['pattern']
        self.assertIsNone(re.fullmatch(pattern, ' '.join(['word'] * 49)))
        self.assertIsNotNone(re.fullmatch(pattern, ' '.join(['word'] * 50)))
        self.assertIsNotNone(re.fullmatch(pattern, ' '.join(['word'] * 80)))
        self.assertIsNone(re.fullmatch(pattern, ' '.join(['word'] * 81)))

    def test_retry_refetches_cached_urls_without_another_search_call(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            path = root / '_editorial/drafts/example.json'
            path.parent.mkdir(parents=True)
            path.write_text(json.dumps({'sources': self.sources}))
            review = {'approved': True, 'issues': []}
            with patch.object(drafting, 'api', side_effect=[(self.draft, {}), (review, {})]) as api, \
                 patch.object(drafting, 'fetch_source', side_effect=[self.sources['s1'], self.sources['s2']]) as fetch:
                _, _, issues = drafting.process(root, {'id': 'example', 'title': 'Example'})
            self.assertEqual(fetch.call_count, 2)
            self.assertEqual(api.call_count, 2)
            self.assertEqual(issues, [])
            self.assertTrue(all(not call.kwargs.get('research') for call in api.call_args_list))


class CanonicalCitationTests(unittest.TestCase):
    def test_citation_comes_from_the_real_selected_passage(self):
        draft = {'sections': [{'paragraphs': [{'text': 'Example', 'source_ids': ['s2'],
            'evidence': [{'source_id': 's2', 'quote': 's1-p1'}]}]}]}
        passages = {'s1-p1': {'source_id': 's1', 'quote': 'Actual retrieved source passage.'}}
        drafting.resolve_evidence(draft, passages)
        paragraph = draft['sections'][0]['paragraphs'][0]
        self.assertEqual(paragraph['source_ids'], ['s1'])
        self.assertEqual(paragraph['evidence'][0]['source_id'], 's1')
        self.assertEqual(paragraph['evidence'][0]['quote'], 'Actual retrieved source passage.')
