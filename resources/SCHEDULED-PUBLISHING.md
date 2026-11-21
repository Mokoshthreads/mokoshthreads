# Weekly Resources publishing

Publishing is scheduled for **Mondays at 12:00 noon UTC+8** (Malaysia/Singapore), equivalent to **Monday 04:00 UTC**. GitHub Actions uses `0 4 * * 1`. Scheduled runs can be delayed by GitHub; this is a target time rather than a guaranteed exact-minute service.

## Queue a finished article

1. Finish and verify the article HTML, photographs, citations and links. Add the page and assets to the repository.
2. Add its normal entry in `resources/resources.json`, with these additional fields:

```json
{
  "id": "example-article",
  "title": "Example Article",
  "url": "./example-article/",
  "published": false,
  "featured": false,
  "readyToPublish": true,
  "publishAt": "2026-11-23T12:00:00+08:00"
}
```

Include the other normal catalogue fields (category, excerpt, image, date, readingTime and tags) as for existing articles. `publishAt` must be a Monday at noon UTC+8, including an explicit timezone. Change the example date to the intended Monday. Merely having an old `date` does not schedule an article. Unfinished entries should omit `readyToPublish` or set it to `false`.

3. Commit and push to `main`. The Monday workflow changes due entries to `published: true`, records their publication date, clears their ready flag and features the most recently scheduled released article. Previously published articles remain available. If several queued articles are due, they are all released on that run.

This schedules the Resources listing, not article writing or source verification. Existing pending article titles are not automatically approved or written. No future articles were queued as part of installing the scheduler.

## Checks and manual recovery

- Dry run: `python3 scripts/publish_resources.py`
- Simulate a cutoff without writing: `python3 scripts/publish_resources.py --now 2026-11-23T04:00:00Z`
- Tests: `python3 -m unittest discover -s tests -p 'test_publish_resources.py'`
- GitHub: **Actions → Publish scheduled Resources articles → Run workflow** on `main`.

Manual runs use the latest Monday noon cutoff, so they cannot release a future Monday's article early. A delayed run catches up overdue queued articles. Running the workflow again does not publish an article twice. Missing article pages or invalid ready schedules stop publication before any catalogue edits are written.

The workflow uses GitHub's built-in `GITHUB_TOKEN` with repository-content and Pages write permissions; no personal token is required. It commits the changed catalogue to `main` and explicitly requests a Pages build through GitHub's API, preserving the site's existing branch-based Pages configuration. The rebuild request also runs on a no-op retry, so a failed request can be retried after the metadata commit succeeded.

GitHub Actions must remain enabled, and repository/organisation policies and branch rules must allow the workflow's write permissions. Check the Actions run for the Pages build request result. A successful request queues a build; Pages deployment completion is separate. This workflow was tested locally; its hosted token permissions and Pages rebuild must be confirmed by a hosted run. It does not change Pages source settings.

## Managed editorial series

The sixteen-topic queue in `_editorial/queue.json` is researched by the separate drafting workflow. Its approved HTML is held in `_editorial/ready/` until release, rather than being placed in the public article folder early. The publisher supports this staged path for entries with `series: "weekly-editorial"`. It releases that series in order, at most once per Monday slot, and moves the HTML into Resources when due. An unresolved earlier topic blocks later series topics. Existing ordinary entries keep the rules above. See `_editorial/README.md` for source checks, evidence requests, schedule dates and API limits.
