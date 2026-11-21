#!/usr/bin/env python3
"""Close fact-check issues after their queued article has been marked ready."""
import json
import os
from pathlib import Path
import subprocess
from telegram_notify import send


def main():
    root = Path(__file__).resolve().parents[1]
    queue = json.loads((root / '_editorial/queue.json').read_text())
    repo = os.environ['GITHUB_REPOSITORY']
    for topic in queue['topics']:
        number = topic.get('issue_number')
        if topic.get('status') not in ('ready', 'published') or not isinstance(number, int):
            continue
        result = subprocess.run(['gh', 'issue', 'view', str(number), '--repo', repo, '--json', 'state'], capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError('Could not check the fact-check issue state.')
        if json.loads(result.stdout)['state'] != 'OPEN':
            continue
        record = json.loads((root / '_editorial/drafts' / (topic['id'] + '.json')).read_text())
        if record.get('issues'):
            raise RuntimeError('Refusing to close an issue with unresolved draft checks.')
        notes = record.get('editorial_review', {}).get('corrections', [])
        if topic['status'] == 'published':
            article_url = 'https://mokoshthreads.com/resources/' + topic.get('slug', topic['id']) + '/'
            comment = 'The source checks and article review are complete. The article has been published at the user’s request: ' + article_url
            notification = 'Published after source checking: ' + article_url
        else:
            comment = ('The article has been revised and is staged for its weekly publication slot: '
                       + topic['publishAt'] + '. It has not been published early.\n\n'
                       + '\n'.join('- ' + note for note in notes))
            notification = 'Queued for ' + topic['publishAt'] + '\nThe revised article is ready and remains unpublished until its slot.'
        result = subprocess.run(['gh', 'issue', 'close', str(number), '--repo', repo, '--comment', comment], capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError('Could not close the resolved fact-check issue.')
        url = f'https://github.com/{repo}/issues/{number}'
        send('Mokosh Threads — fact-check resolved\n\n' + topic['title'] + '\n' + notification + '\n' + url,
             os.environ.get('TELEGRAM_BOT_TOKEN'), os.environ.get('TELEGRAM_CHAT_ID'))
        print(f'Resolved fact-check issue #{number}.')


if __name__ == '__main__':
    main()
