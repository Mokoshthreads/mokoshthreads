import importlib.util
import io
import json
import unittest
import urllib.error
from pathlib import Path

spec = importlib.util.spec_from_file_location('notifier', Path(__file__).resolve().parents[1] / 'scripts/telegram_notify.py')
notifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(notifier)


class TelegramTests(unittest.TestCase):
    def test_send_payload_and_length(self):
        captured = []
        def opener(request, timeout):
            captured.append(json.loads(request.data))
            return io.BytesIO(b'{"ok": true}')
        notifier.send('X' * 5000, 'test-token', 'test-chat', opener)
        self.assertEqual(len(captured[0]['text']), 4000)
        self.assertEqual(captured[0]['chat_id'], 'test-chat')
        self.assertNotIn('parse_mode', captured[0])

    def test_missing_secret_never_sends(self):
        with self.assertRaises(ValueError):
            notifier.send('Message', '', 'chat')

    def test_api_error_redacts_sensitive_details(self):
        def opener(request, timeout):
            raise urllib.error.HTTPError('https://secret-url', 403, 'secret-response', {}, None)
        with self.assertRaises(RuntimeError) as error:
            notifier.send('Message', 'secret-token', 'secret-chat', opener)
        self.assertNotIn('secret', str(error.exception))
        self.assertIn('403', str(error.exception))

    def test_rejected_api_response_is_failure(self):
        def opener(request, timeout):
            return io.BytesIO(b'{"ok": false}')
        with self.assertRaises(RuntimeError):
            notifier.send('Message', 'test-token', 'test-chat', opener)

    def test_issue_alert_keeps_claim_evidence_and_link(self):
        message = notifier.issue_message({'issue': {'title': 'Verify article date',
            'html_url': 'https://github.com/example/repo/issues/1',
            'body': 'Claim: 1967. Source: catalogue. Evidence needed: dated factory record.'}})
        self.assertIn('1967', message)
        self.assertIn('Evidence needed', message)
        self.assertIn('/issues/1', message)


if __name__ == '__main__':
    unittest.main()
