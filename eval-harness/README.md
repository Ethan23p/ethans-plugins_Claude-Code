# eval-harness

Claude Code plugin for building agentic eval harnesses on the Claude Agent SDK — evaluating a system by having a real, controlled Claude instance operate it across scripted turns.

## Prerequisites

- **Bun** (the runtime targets it; adaptable to Node).
- **`@anthropic-ai/claude-agent-sdk`** in the target project: `bun add @anthropic-ai/claude-agent-sdk`.
- **One credential**, either:
  - `CLAUDE_CODE_OAUTH_TOKEN` — generate with `claude setup-token` (subscription billing), or
  - `ANTHROPIC_API_KEY` (API billing).

  Put one in `.env` and gitignore it. See `skills/eval-harness/runtime/.env.example`. The runtime preflights and fails legibly when neither is set.

## What it does

Activates the `eval-harness` skill, which carries two things worth keeping:

**A reference runtime** (`skills/eval-harness/runtime/`) — a scenario-agnostic driver that runs one persistent streaming-input session across scripted user turns, with deterministic gates between them, a fresh sandbox per run, full transcript and cost capture, and an optional LLM-as-judge slot. Copy it into a project and own it; it is a starting point, not a dependency. All Agent-SDK knowledge is confined to two files, so an SDK bump has one blast radius.

**The SDK's undocumented behavioral facts** (`references/sdk-claims.md`) — the things that cost real debugging time to learn: which message signals turn completion, whether usage counters are cumulative, that Bash exit codes aren't exposed, that `env` replaces rather than merges. Each is version-stamped and paired with a way to re-verify it.

## Why it distrusts its own notes

SDK behavior drifts silently. In one observed case a `^0.3.214` dependency resolved forward to `0.3.251` on a routine install — 37 patch versions of unverified change, no warning.

So the skill ranks the installed `sdk.d.ts` and a fresh transcript *above* its own documentation, and ships `verify-claims.ts`, which re-checks four behavioral claims offline against a captured transcript for free:

```bash
bun run testing/harness/verify-claims.ts     # E1–E4; no API calls
bun run testing/evals/eval_smoke.ts          # ~$0.02; settles credentials, refreshes the transcript
```

It reports FAIL (the claim is now false) separately from INCONCLUSIVE (this transcript couldn't exercise it) — absence of evidence is never scored as confirmation.

Same instinct as `logseq-interface`: defer to the live authoritative source, and document only what it doesn't cover.
