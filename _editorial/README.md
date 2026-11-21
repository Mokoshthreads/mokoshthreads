# Weekly editorial queue

The sixteen agreed topics are in `queue.json`, in their intended publication order. Publication slots run from **30 November 2026 to 15 March 2027**, every Monday at **12:00 UTC+8**. Existing articles remain available.

## Automatic drafting

**Research and draft Resources articles** runs at **10:00 UTC+8, Tuesday–Sunday**. It attempts up to three previously unprocessed topics per run, stopping after the sixteen-topic queue has been processed. The installation/configuration push triggers a one-topic test. Editing that workflow later triggers another one-topic run; generated draft commits do not.

GitHub Actions secrets:

- `OPENAI_API_KEY` — OpenAI API key with API billing enabled.
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` — the tested notification connection.

The default model is `gpt-4.1`. Optional repository Actions variable `OPENAI_DRAFT_MODEL` can override it, but the replacement must support Responses, web search and JSON-schema structured output. API usage is billed separately from ChatGPT. An attempt has one web-research call (at most four web-search tool calls), one drafting call and, if preliminary checks pass, one separate review call. Output limits are set in the script. There are no automatic paid retries inside a run. A manually requested retry incurs further usage.

No API or bot credentials are read from the repository or committed to it. The hosted run must confirm the key, model/tool access, account billing and source connectivity. Local tests use fixtures and mocked network calls and do not establish those hosted capabilities.

## How checking works

1. Web research seeks factory histories, museums, archives and original catalogues, with web-search citations.
2. Only URLs actually returned as web-tool citations are source candidates. The runner retrieves up to six public HTTPS pages as full text. Non-text pages, short/error pages, blocked pages, oversized pages and private-network destinations do not qualify.
3. An article must cite at least two source domains. Every paragraph needs source references and exact supporting passages that can be matched to the retrieved page text. Articles are 450–950 words in three to seven sections.
4. A separate AI review checks the full article against the retrieved texts, including whether a matching passage actually supports its claim, source quality, conflicting dates, unsupported certainty and excessive copying.
5. Unresolved issues keep the article out of the release queue. A GitHub issue records the claim, sources and evidence needed, and the workflow sends its link and details directly through Telegram.

This is automated source checking, not a guarantee of truth. Two websites may repeat the same error; a model may miss one. Important uncertainty must be surfaced for evidence rather than silently approved. Full third-party source pages and internal evidence quotations are not committed: draft records retain our original prose, source URLs, source hashes and check outcomes.

## Draft storage and publication

- `queued`: not yet attempted.
- `needs_verification`: blocked. The issue and Telegram alert explain what is needed. Automatic daily runs move on to other topics without repeatedly charging for the blocked topic.
- `ready`: the source and review checks passed. HTML is staged in `_editorial/ready/<slug>/index.html`, and the catalogue entry is set to `published: false`, `readyToPublish: true`.

The default branch-based Jekyll Pages build excludes the underscore-prefixed `_editorial` directory. Ready article HTML is moved into its public `resources/<slug>/` folder only when the publication workflow releases it. Generated HTML is escaped; researchers cannot insert arbitrary HTML or scripts. Existing published pages are never overwritten by drafting.

Only one member of this editorial series is released per weekly slot. A later topic cannot skip an earlier unresolved one. If a slot is missed, the first eligible article uses the next successful Monday cutoff; the backlog is not published in a batch. The catalogue and generated article date are updated to that actual slot. General articles outside this series retain the previous scheduler behaviour.

Publishing and drafting share a GitHub Actions concurrency group to avoid overlapping bot pushes. Progress is committed even if a later topic fails. If the repository push fails, the run retains a seven-day recovery artifact containing generated editorial/resources files.

## Supply evidence and retry

Add source URLs, relevant passages or transcriptions of catalogue scans to the linked GitHub issue. Owner/member/collaborator comments become research leads on retry. Alternatively, add a text file `_editorial/evidence/<topic-id>.txt`. The next research attempt must still check accessible sources; supplying a lead does not automatically approve a claim. If an original scan cannot be checked automatically, resolve it in the development chat with human review rather than bypassing the checks.

Then go to **Actions → Research and draft Resources articles → Run workflow**. Set **max_articles** to `1` for a small test, and enable **retry_blocked** when retrying after providing evidence. This retries blocked topics in queue order. Generated GitHub issues notify Telegram directly because GITHUB_TOKEN-created events do not start another workflow.

Telegram replies are not monitored. Provide evidence in GitHub or the development chat. A successful test bot message proves messaging only, not AI drafting. A workflow failure sends a separate alert with the run URL.

## Local checks

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_*.py'
python3 scripts/publish_resources.py --now 2026-11-30T04:00:00Z
```

The second command is a dry run. Do not invoke the drafting script locally without knowingly configuring paid API access; its calls are real.

## Editorial resolution of supplied evidence

When source excerpts are reviewed in the development chat, the corrected draft and its review decisions can be recorded in `_editorial/drafts/` and `_editorial/evidence/`, then the topic marked ready with staged HTML. A push updating the queue or evidence triggers **Resolve completed editorial fact checks**, which closes open issues only for ready topics whose draft record contains no unresolved issues, and sends a Telegram confirmation with the scheduled date. This does not publish the page early or weaken the automated checks for other topics.
