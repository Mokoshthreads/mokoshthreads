# Telegram editorial alerts

Repository Actions secrets required:

- `TELEGRAM_BOT_TOKEN`: the token supplied by BotFather.
- `TELEGRAM_CHAT_ID`: the intended recipient's numeric chat ID.

Open the new bot in Telegram and press **Start** before testing. Never commit these secret values to the repository or paste them into an issue.

## Send the first test

Open **Actions → Telegram editorial alerts → Run workflow**, select `main`, then click **Run workflow** again. A successful run sends a connection-test message to the configured chat. The notifier logs that Telegram accepted the message without printing its token, chat ID or API response. Hosted delivery has not been verified merely by installing these files.

## Request factual evidence

Create a GitHub issue describing the article, the exact claim, the references checked and the evidence required. Then apply the label `fact-check` (create the label if needed). Applying that label triggers a Telegram message with the issue title, link and description. Messages are plain text, limited to 4,000 characters; the linked issue retains the complete request.

Example issue body:

```text
Article: Raketa: The Watchmaker of Petrodvorets
Claim to verify: [precise factual statement]
Sources checked: [full URLs and the relevant conflicting passages]
Evidence needed: [for example, a dated factory catalogue page]
Article status: Draft, readyToPublish=false
```

Keep the article's `readyToPublish` value false until the evidence has been reviewed. Labels send notifications; they do not change publication metadata or verify a fact. GitHub events created with its built-in GITHUB_TOKEN do not trigger another workflow: any future automated drafting job should call `scripts/telegram_notify.py --issue` directly with its generated event file, rather than relying on its own issue creation to trigger an alert.

Weekly publishing failures also attempt a Telegram alert containing a link to the failed run. A successful build request is not reported as proof that Pages has deployed.

## Scope

This connection sends messages from GitHub Actions. The **Research and draft Resources articles** workflow now uses it directly when source checking needs evidence or drafting fails. See `_editorial/README.md` for the sixteen-topic queue and checking rules. Telegram reply monitoring is not configured; supply evidence in the linked GitHub issue or the development chat. Saving an API key does not by itself prove API billing, tool access or hosted drafting are working: check the first drafting run.

If a test fails, inspect the Actions run. Confirm both repository secret names, the token, recipient ID, and that the recipient pressed Start. Error output deliberately excludes token-bearing URLs and Telegram response bodies.
