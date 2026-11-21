import copy
import importlib.util
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

spec = importlib.util.spec_from_file_location('scheduler', Path(__file__).resolve().parents[1] / 'scripts/publish_resources.py')
scheduler = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scheduler)


class SchedulingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        page = self.root / 'resources/example/index.html'
        page.parent.mkdir(parents=True)
        page.write_text('<h1>Prepared article</h1>')
        self.data = {'resources': [
            {'id': 'existing', 'published': True, 'featured': True},
            {'id': 'queued', 'published': False, 'featured': False, 'readyToPublish': True,
             'publishAt': '2026-11-23T12:00:00+08:00', 'url': './example/'}]}

    def run_at(self, time):
        return scheduler.publish(self.data, self.root, datetime.fromisoformat(time))

    def test_no_early_release(self):
        before = copy.deepcopy(self.data)
        self.assertEqual(self.run_at('2026-11-23T03:59:59+00:00'), [])
        self.assertEqual(self.data, before)

    def test_exact_release_and_idempotence(self):
        self.assertEqual(self.run_at('2026-11-23T04:00:00+00:00'), ['queued'])
        self.assertTrue(self.data['resources'][1]['published'])
        self.assertEqual(self.data['resources'][1]['date'], '2026-11-23')
        self.assertFalse(self.data['resources'][0]['featured'])
        self.assertTrue(self.data['resources'][1]['featured'])
        self.assertEqual(self.run_at('2026-11-23T04:15:00+00:00'), [])

    def test_delayed_run_catches_up(self):
        self.assertEqual(self.run_at('2026-11-24T10:00:00+00:00'), ['queued'])

    def test_unready_placeholder_stays_unpublished(self):
        self.data['resources'][1].pop('readyToPublish')
        self.assertEqual(self.run_at('2026-11-30T04:00:00+00:00'), [])

    def test_missing_page_prevents_release(self):
        self.data['resources'][1]['url'] = './not-written/'
        before = copy.deepcopy(self.data)
        with self.assertRaises(ValueError):
            self.run_at('2026-11-23T04:00:00+00:00')
        self.assertEqual(self.data, before)

    def test_timezone_required(self):
        self.data['resources'][1]['publishAt'] = '2026-11-23T12:00:00'
        with self.assertRaises(ValueError):
            self.run_at('2026-11-23T04:00:00+00:00')

    def test_wrong_weekday_rejected(self):
        self.data['resources'][1]['publishAt'] = '2026-11-24T12:00:00+08:00'
        with self.assertRaises(ValueError):
            self.run_at('2026-11-30T04:00:00+00:00')

    def test_future_week_waits(self):
        self.assertEqual(self.run_at('2026-11-22T04:00:00+00:00'), [])


if __name__ == '__main__':
    unittest.main()

class EditorialSeriesTests(SchedulingTests):
    def setUp(self):
        super().setUp()
        self.data['resources'][1].update(series='weekly-editorial', seriesOrder=1)
        later = dict(self.data['resources'][1], id='second', seriesOrder=2,
                     publishAt='2026-11-30T12:00:00+08:00')
        self.data['resources'].append(later)

    def test_backlog_releases_only_one_per_week(self):
        self.assertEqual(self.run_at('2026-12-07T04:00:00+00:00'), ['queued'])
        self.assertEqual(self.data['resources'][1]['date'], '2026-12-07')
        self.assertEqual(self.run_at('2026-12-07T04:15:00+00:00'), [])
        self.assertEqual(self.run_at('2026-12-14T04:00:00+00:00'), ['second'])

    def test_later_article_cannot_skip_blocked_first_topic(self):
        self.data['resources'][1]['readyToPublish'] = False
        self.assertEqual(self.run_at('2026-12-07T04:00:00+00:00'), [])

    # Inherited tests use a single queued article; ignore the second series entry
    # for those fixture-based checks.
    def test_future_week_waits(self):
        self.assertEqual(self.run_at('2026-11-22T04:00:00+00:00'), [])

class StagedArticleTests(unittest.TestCase):
    def test_ready_page_stays_staged_until_actual_release(self):
        import subprocess
        import json
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp).resolve()
            staged = root / '_editorial/ready/example/index.html'
            staged.parent.mkdir(parents=True)
            staged.write_text('<h1>Article</h1><time datetime="2026-11-23">2026-11-23</time>')
            catalogue = root / 'resources/resources.json'
            catalogue.parent.mkdir()
            data = {'resources': [{'id': 'example', 'published': False, 'readyToPublish': True,
                'publishAt': '2026-11-23T12:00:00+08:00', 'url': './example/',
                'series': 'weekly-editorial', 'seriesOrder': 1, 'featured': False}]}
            catalogue.write_text(json.dumps(data))
            script = Path(__file__).resolve().parents[1] / 'scripts/publish_resources.py'
            subprocess.run(['python3', str(script), '--root', str(root), '--now', '2026-11-23T03:59:59Z', '--write'], check=True, capture_output=True)
            self.assertTrue(staged.exists())
            self.assertFalse((root / 'resources/example/index.html').exists())
            subprocess.run(['python3', str(script), '--root', str(root), '--now', '2026-11-30T04:00:00Z', '--write'], check=True, capture_output=True)
            self.assertFalse(staged.exists())
            self.assertIn('datetime="2026-11-30"', (root / 'resources/example/index.html').read_text())
            self.assertTrue(json.loads(catalogue.read_text())['resources'][0]['published'])
