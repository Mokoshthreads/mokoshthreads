#!/usr/bin/env python3
"""Release explicitly ready Resources articles at Monday 12:00 UTC+8 cutoffs."""
import argparse
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit, unquote

LOCAL = timezone(timedelta(hours=8))


def monday_cutoff(now):
    local = now.astimezone(LOCAL)
    cutoff = (local - timedelta(days=local.weekday())).replace(hour=12, minute=0, second=0, microsecond=0)
    return cutoff if cutoff <= local else cutoff - timedelta(days=7)


def publish(data, root, now):
    cutoff = monday_cutoff(now)
    due = []
    # Validate every queued entry before mutating the catalogue.
    for item in data['resources']:
        if item.get('published') is True or item.get('readyToPublish') is not True:
            continue
        raw = item.get('publishAt')
        if not raw:
            raise ValueError(f"{item['id']}: ready articles require publishAt")
        when = datetime.fromisoformat(raw.replace('Z', '+00:00'))
        if when.tzinfo is None:
            raise ValueError(f"{item['id']}: publishAt requires an explicit timezone")
        local = when.astimezone(LOCAL)
        if local.weekday() != 0 or (local.hour, local.minute, local.second, local.microsecond) != (12, 0, 0, 0):
            raise ValueError(f"{item['id']}: publishAt must be a Monday at 12:00 UTC+8")
        url = urlsplit(item['url'])
        if url.scheme or url.netloc or url.query or url.fragment:
            raise ValueError(f"{item['id']}: article URL must be a local Resources path")
        target = (root / 'resources' / unquote(url.path)).resolve()
        if not target.is_relative_to((root / 'resources').resolve()):
            raise ValueError(f"{item['id']}: article URL escapes Resources")
        if target.suffix != '.html':
            target /= 'index.html'
        if not target.is_file():
            raise ValueError(f"{item['id']}: article page is missing: {target}")
        if when <= cutoff:
            due.append((when, item))
    if not due:
        return []
    due.sort(key=lambda pair: (pair[0], pair[1]['id']))
    for when, item in due:
        item['published'] = True
        item['readyToPublish'] = False
        item['date'] = when.astimezone(LOCAL).date().isoformat()
    newest = due[-1][1]
    for item in data['resources']:
        item['featured'] = item is newest
    return [item['id'] for _, item in due]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--now', help='ISO timestamp override for testing; must include timezone')
    parser.add_argument('--write', action='store_true', help='Save releases; otherwise report a dry run')
    args = parser.parse_args()
    now = datetime.fromisoformat(args.now.replace('Z', '+00:00')) if args.now else datetime.now(timezone.utc)
    if now.tzinfo is None:
        parser.error('--now must include a timezone')
    path = args.root / 'resources/resources.json'
    data = json.loads(path.read_text())
    released = publish(data, args.root.resolve(), now)
    if released and args.write:
        temp = path.with_suffix('.json.tmp')
        temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        temp.replace(path)
    print(('Released: ' if args.write else 'Would release: ') + (', '.join(released) if released else 'no articles due'))


if __name__ == '__main__':
    main()
