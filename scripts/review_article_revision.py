#!/usr/bin/env python3
"""Research an explicitly requested revision without changing the published site."""
import argparse
import copy
import json
from pathlib import Path
import shutil
import tempfile
from draft_resources import PipelineError, process, save_json


def review_revision(root, topic_id, title):
    queue = json.loads((root / '_editorial/queue.json').read_text())
    topic = next((copy.deepcopy(t) for t in queue['topics'] if t['id'] == topic_id), None)
    if topic is None or topic.get('status') != 'published':
        raise ValueError('Revision review requires an existing published queue topic.')
    if not title.strip():
        raise ValueError('A revision title is required.')
    topic['title'] = title
    # A revision is separate from old publication issues and scheduling state.
    topic.pop('issue_number', None)
    topic.pop('issue_url', None)
    with tempfile.TemporaryDirectory(prefix='article-revision-') as temp:
        scratch = Path(temp)
        for source_dir, target_dir in [('prepared-revisions', 'prepared'), ('revision-evidence', 'evidence'), ('revisions', 'drafts')]:
            suffix = '.txt' if source_dir == 'revision-evidence' else '.json'
            source = root / '_editorial' / source_dir / (topic_id + suffix)
            if source.exists():
                target = scratch / '_editorial' / target_dir / source.name
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(source, target)
        draft, sources, issues = process(scratch, topic)
    # Preserve our prose and an audit trail, without committing third-party page text.
    if draft:
        for section in draft['sections']:
            for paragraph in section['paragraphs']:
                paragraph.pop('evidence', None)
    record = {'title': title, 'draft': draft, 'issues': issues,
              'sources': {sid: {'url': s['url'], 'sha256': s['sha256']} for sid, s in sources.items()}}
    save_json(root / '_editorial/revisions' / (topic_id + '.json'), record)
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--topic', required=True)
    parser.add_argument('--title', required=True)
    args = parser.parse_args()
    try:
        record = review_revision(Path(__file__).resolve().parents[1], args.topic, args.title)
    except (PipelineError, ValueError, OSError) as error:
        print('Revision review stopped: ' + str(error))
        return 1
    print('Revision review: ' + ('needs verification' if record['issues'] else 'passed'))
    for issue in record['issues']:
        print(issue['claim'] + ': ' + issue['reason'])
    return 1 if record['issues'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
