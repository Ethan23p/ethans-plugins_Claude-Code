# Agent SDK claims — and how to re-verify each one

> **Provenance.** Behavioral claims E1–E5 were first observed against
> `@anthropic-ai/claude-agent-sdk@0.3.214` (2026-07-17), then **re-verified in
> full against `0.3.251` (2026-08-28)** — a live smoke run plus
> `verify-claims.ts` returning 4/4 on the resulting transcript. Static type
> shapes were re-checked at the same version. Nothing here is guaranteed for the
> version *you* have installed.
>
> **This file is a starting hypothesis, not an authority.** Treat it the way you'd
> treat a colleague's notes from last quarter: useful for knowing *what to check*,
> never a substitute for checking.

## Why this file distrusts itself

In a single afternoon of use, `^0.3.214` resolved forward to `0.3.251` — 37 patch
versions of unverified behavioral drift, silently, on one `bun install`. Nothing
warned about it. That is the normal case, not a mishap.

So every claim below carries an executable check, and the cheap ones run offline
for free.

## Authoritative sources, in order of authority

1. **The installed type definitions** — `node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts`.
   This is the ground truth for *shapes*, it matches the exact version you have,
   and it is on disk right now. Grep it before trusting any option name, union
   member, or field in this file.
2. **A fresh transcript from your own run** — ground truth for *behavior*.
   `verify-claims.ts` reads one and re-checks E1–E4.
3. **The package README** — `node_modules/@anthropic-ai/claude-agent-sdk/README.md`,
   which ships with the version installed.
4. **Official docs** — <https://platform.claude.com/docs/en/agent-sdk/overview>
   (linked from that README). Repo and issues:
   <https://github.com/anthropics/claude-agent-sdk-typescript>.

This file ranks below all four. When it disagrees with them, they win and this
file should be corrected.

### Checking an option shape yourself

Options is one large type. Confirm both that a field exists and that it is
*inside* `Options` rather than a neighbouring type:

```bash
SDK=node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts
grep -n "^export declare type Options = {" "$SDK"      # where Options starts
grep -n "^export declare type " "$SDK" | head -80      # where the next type starts
grep -n "    skills?:\|    plugins?:" "$SDK"           # the field's line
```

If the field's line number falls between the two boundaries, it is a real
`Options` field. (At 0.3.251: `Options` spans 1391–2211; `plugins` 1860;
`skills` 2079; `SdkPluginConfig` 4696. Those numbers WILL rot — the recipe won't.)

Then let the compiler confirm it: a `tsc --noEmit` pass catches a shape that
moved far more reliably than reading does.

## Running the checks

```bash
bun run testing/harness/verify-claims.ts             # newest artifact; E1–E4; free, offline
bun run testing/harness/verify-claims.ts <file>      # a specific transcript.json
bun run testing/evals/eval_smoke.ts                  # live; ~$0.02, ~40s; settles E5 and refreshes the transcript
```

`verify-claims.ts` distinguishes **FAIL** (the claim is now false — fix the
runtime) from **INCONCLUSIVE** (this transcript couldn't exercise the claim —
not evidence of anything). Only FAIL exits non-zero.

---

## E — behavioral claims the runtime depends on

| ID | Claim | Why the runtime cares | How to re-verify |
|---|---|---|---|
| **E1** | Exactly one `result` message per user turn, after that turn's assistant messages. | The turn-completion signal the whole loop keys on. Zero or two per turn desyncs turns from gates, and every downstream assertion lands on the wrong turn. | `verify-claims.ts` — counts `system/init` vs `result` messages (each turn opens with one init, closes with one result) and rejects two adjacent results. Deliberately independent of the runtime's own bookkeeping, so it can't confirm itself. |
| **E2** | `usage` and `total_cost_usd` on each `result` are **per-turn, not cumulative**. | `buildStats` sums them. If they were cumulative, every reported cost and token count would be inflated — silently, and plausibly. | `verify-claims.ts` — looks for a counter that *decreased* between consecutive turns, impossible for a cumulative counter. It checks all five (input, output, cache-read, **cache-creation**, cost): cache-creation is in practice the likeliest to drop, and an earlier version that skipped it reported INCONCLUSIVE on a run whose evidence was sitting right there. Reports INCONCLUSIVE rather than PASS when nothing decreased — absence isn't proof. |
| **E3** | `session_state_changed` is **never emitted** in streaming-input mode. | It is *typed* as the authoritative turn-over signal, so it reads like the correct thing to key on. Doing so hangs forever. | `verify-claims.ts` — asserts no message carries that subtype. If one ever appears, the documented fallback becomes viable and E1/E3 both need revisiting. |
| **E4** | **Bash exit codes are not exposed.** The Bash `tool_use_result` carries only `{stdout, stderr, interrupted, isImage, noOutputExpected}`. | `transcript.ts::bashExitCode` therefore *derives* a code: 0 from a non-error result, else parses `"Exit code N"` from the text, else 1. Any gate needing a true exit code must use `ctx.exec()` instead — which is also the more honest test, since it exercises your CLI as a real subprocess. | `verify-claims.ts` — dumps the key set of every Bash tool result and fails if any exit-code-like field appears. If one does, replace the derivation rather than leaving it to shadow the real value. |
| **E5** | Either credential works: `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`) or `ANTHROPIC_API_KEY`. | The runtime keeps exactly one live so a failure names one cause; it preflights and fails legibly when neither is set. | `eval_smoke.ts` completing at all. A missing or expired credential surfaces as a fatal runtime error in the report, not a gate failure. |

## U — known-unverified

| ID | Gap | How to close it |
|---|---|---|
| **U1** | Whether `plugins` + `skills` actually **load under `settingSources: []`**. Isolation blocks skills *discovered* from settings; these are passed explicitly, so they should survive — but that is reasoning, not evidence. | A scenario with `plugins: [{type:'local', path: pluginDir}], skills: 'all'` whose first turn asks the agent to list its available skills, gated on the plugin's skill appearing. Cheap, and worth doing before building an eval that depends on the skill surface. |
| **U2** | Behavior at *your* installed version. Verified at 0.3.214 and 0.3.251; unverified at anything newer. | `bun run testing/evals/eval_smoke.ts && bun run testing/harness/verify-claims.ts` — one live run (~$0.04, ~20s) settles all five. Repeat after every SDK bump; E1–E4 are precisely the claims a bump can break silently. |

## G — gotchas that cost real debugging time

| ID | Gotcha | Handling |
|---|---|---|
| **G1** | `echo >` appends `\n`, and Windows tools emit `\r\n`. Exact-content gates fail on whitespace you didn't ask for. | Normalize with a `norm()` helper before comparing (`eval_smoke.ts` has one). Its turn-1 gate would fail on Windows without it, which makes the smoke eval the standing regression test for this. |
| **G2** | "No stray files" gates written with a raw `readdir` spuriously report the harness's own config dir. | Assert against `stats.sandboxBefore` / `sandboxAfter`, which already filter it. |
| **G3** | `maxTurnsPerMessage` maps to SDK `maxTurns`, which is a **whole-session** brake, not per-message. The name misleads. | Budget it across the entire scenario. Symptom of getting it wrong: a late turn ends `error_max_turns`, which the runtime records as a failing gate and halts on. |
| **G4** | `haltOnGateFailure` defaults to **false** — all turns still run after a failure. A non-success `result` subtype halts regardless. | Set it `true` when later turns are meaningless once an early one fails; leave it false when you want the full picture from one run. |
| **G5** | `Read` tool failures return a plain **string** `tool_use_result`, not an object. | `flattenContent` in `transcript.ts` handles both shapes. Don't assume object access when reading `toolResults[].content` in a gate. |

## Environment notes

- **`env` REPLACES the subprocess environment; it does not merge.** Spread
  `process.env` or the child starts with almost nothing. This is the single
  easiest way to break the harness in a way that looks like an auth bug.
- **Nested-session hygiene.** The harness often runs *inside* a Claude Code
  session. Strip `CLAUDECODE` and `CLAUDE_CODE_ENTRYPOINT` so the child doesn't
  inherit the parent's identity, and point `CLAUDE_CONFIG_DIR` at a
  scenario-local directory.
- **Isolation.** `settingSources: []` (no user/project settings, no CLAUDE.md)
  and `persistSession: false` (no writes to the real session store) keep a run
  from depending on, or polluting, the developer's own configuration.
- **Bun auto-loads `.env`.** Under Node, load it explicitly.
