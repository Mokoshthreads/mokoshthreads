#!/usr/bin/env python3
"""Send a plain-text editorial alert using GitHub Actions secrets."""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


def issue_message(event):
    issue = event['issue']
    return (
        'Mokosh Threads — fact-check needed\n\n'
        + issue['title'] + '\n\n'
        + issue['html_url'] + '\n\n'
        + (issue.get('body') or 'Open the linked issue for the claim, sources and evidence needed.')
    )[:4000]


def send(message, token, chat_id, opener=urllib.request.urlopen):
    if not token or not chat_id:
        raise ValueError('Save both TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID as repository Actions secrets.')
    if not message.strip():
        raise ValueError('The notification message is empty.')
    payload = json.dumps({'chat_id': chat_id, 'text': message[:4000],
                          'link_preview_options': {'is_disabled': True}}).encode()
    request = urllib.request.Request(
        'https://api.telegram.org/bot' + token + '/sendMessage',
        data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with opener(request, timeout=20) as response:
            result = json.loads(response.read())
    except urllib.error.HTTPError as error:
        # Never echo request URLs or Telegram response bodies: they can contain credentials/IDs.
        raise RuntimeError(f'Telegram rejected the message (HTTP {error.code}). Check the bot token, chat ID and that you pressed Start.') from None
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        raise RuntimeError('Could not confirm Telegram delivery. Check the workflow network connection and bot settings.') from None
    if result.get('ok') is not True:
        raise RuntimeError('Telegram did not accept the notification. Check the configured bot and chat.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--issue', action='store_true')
    args = parser.parse_args()
    try:
        if args.issue:
            message = issue_message(json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text()))
        else:
            message = os.environ.get('TELEGRAM_MESSAGE', '')
        send(message, os.environ.get('TELEGRAM_BOT_TOKEN'), os.environ.get('TELEGRAM_CHAT_ID'))
    except (ValueError, RuntimeError, KeyError, OSError) as error:
        # Unknown OS errors could embed the token-bearing URL; use generic text for those.
        print(str(error) if isinstance(error, (ValueError, RuntimeError)) else 'Notification configuration is incomplete.', file=sys.stderr)
        return 1
    print('Telegram accepted the notification.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
