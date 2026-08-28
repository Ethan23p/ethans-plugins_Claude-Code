---
name: eval-harness
description: This skill should be used when building, running, or debugging an agentic eval harness against the Claude Agent SDK — multi-turn scenario runs driven by a scripted user, deterministic gates between turns, transcript and cost capture, sandboxed runs, or LLM-as-judge grading. Also applies to requests about evaluating a CLI or agent-facing tool by having a real Claude instance operate it, to red-to-green eval-driven development loops, and to debugging why an SDK-driven multi-turn session hangs, desyncs, or misreports cost.
---

# Eval Harness

A reference implementation and the hard-won facts behind it, for evaluating a
system by having a **real, controlled Claude instance operate it** across scripted
turns while deterministic gates assert correctness between them.

Use it when the question is "can an agent actually work this thing," not "does
this function return the right value." Unit tests answer the second question far
more cheaply; reach for the harness only for what genuinely requires an agent in
the loop.

## Verify before trusting this skill

Everything here about SDK behavior was true at a specific version and may not be
true at yours. In one observed case `^0.3.214` resolved forward to `0.3.251` on a
routine install — 37 patch versions of unverified drift, no warning.

So, in order:

1. **Read `references/sdk-claims.md`** before writing or debugging runtime code.
   Every behavioral claim carries an executable check.
2. **For option shapes, grep the installed `sdk.d.ts`** — it matches the exact
   version on disk and outranks anything written here. The recipe is in
   `sdk-claims.md`.
3. **For behavior, run the checks** — `verify-claims.ts` re-verifies claims E1–E4
   offline against a captured transcript, free. One smoke run settles the rest.
4. **Official docs**: <https://platform.claude.com/docs/en/agent-sdk/overview>.

Never repair the turn-completion loop from memory. Run the verifier first — it
tells you whether the claim broke or the code did.

## Architecture

Three roles, kept strictly apart:

| Role | Intelligence | Where it lives |
|---|---|---|
| In-loop Claude | full agentic loop — the thing under indirect evaluation | one `query()` session, streaming input |
| Simulated user | none; scripted lines | the scenario's `turns[]` |
| Grader | deterministic gates, plus optional LLM-as-judge | `gate()` callbacks; the `grade()` hook |

**The one architectural rule: all SDK knowledge lives in `runtime.ts` and
`judge.ts`.** Eval definitions are plain TypeScript against an SDK-free contract
in `types.ts`. This is what gives an SDK bump a single blast radius instead of
one spread across every eval. Preserve it — if an eval file needs to import the
SDK, the runtime is missing a feature; add it there.

## Getting started

1. **Copy the runtime** from `${CLAUDE_PLUGIN_ROOT}/skills/eval-harness/runtime/`
   into the project, conventionally `testing/harness/`. Copy `eval_smoke.ts` to
   `testing/evals/`. These are a starting point to own and adapt, not a
   dependency to track.
2. **Install**: `bun add @anthropic-ai/claude-agent-sdk`. The runtime targets Bun
   (`executable: "bun"`); on Node, change that and load `.env` explicitly.
3. **Credentials** — either works:
   - `CLAUDE_CODE_OAUTH_TOKEN` from `claude setup-token` (subscription billing), or
   - `ANTHROPIC_API_KEY` (API billing).

   Put one in `.env` and **gitignore it**. The runtime preflights and fails with a
   legible message when neither is set, and keeps exactly one live so an auth
   failure names one cause.
4. **Run the smoke eval first**, before writing anything against your own system.
   It has no dependency on the system under test, so it separates "my harness is
   broken" from "my system is broken" — two failures that look identical from a
   red gate. It also produces the transcript `verify-claims.ts` needs.
5. **Add scripts**:
   ```json
   "eval:smoke":    "bun run testing/evals/eval_smoke.ts",
   "verify:claims": "bun run testing/harness/verify-claims.ts",
   "typecheck":     "tsc --noEmit"
   ```
   Include `typecheck`. The runtime's own origin had no typecheck step and
   carried a live type error in `report.ts` because of it.

## Writing an eval

```ts
const scenario: ScenarioDefinition = {
  name: "walking-skeleton",
  sandbox: { fixtures: "./fixtures" },   // copied into a fresh temp dir = session cwd
  agent: {
    model: "claude-haiku-4-5-20251001",  // cheapest model that can do the job
    tools: ["Bash", "Read"],
    plugins: [{ type: "local", path: pluginDir }],  // the surface under test
    skills: "all",
    maxTurnsPerMessage: 25,              // G3: a WHOLE-SESSION brake
    maxBudgetUsd: 2.0,
  },
  turns: [
    {
      user: "Set up a list to track these files.",
      gate: async (ctx) => {
        ctx.assert(await exists(ctx.sandboxPath("out.sqlite")), "store created");
        const r = await ctx.exec("mycli status");        // real exit code (E4)
        ctx.assert(r.exitCode === 0, "status exits 0");
      },
    },
  ],
  grade: async (transcript) => ({ ... }),  // optional LLM-as-judge
};
process.exit((await runScenario(scenario)).pass ? 0 : 1);
```

Guidance that matters:

- **Gates collect, they don't throw.** `ctx.assert` records a labeled outcome;
  the run continues so one execution yields the full picture. Label assertions so
  a failure reads without opening the transcript.
- **Test how the agent *meets* your system.** If it ships a skill or plugin, pass
  `plugins`/`skills` rather than priming via `systemPrompt` — a preamble tests a
  surface the real operator never sees. (This path is `U1` — unverified; check it
  before depending on it.)
- **Use `ctx.exec()` for exit codes and state introspection.** The SDK does not
  report Bash exit codes (E4), and running your CLI as a real subprocess is the
  more honest assertion anyway.
- **Assert on `bashCommands` to check approach, not just outcome** — e.g. that
  the agent ran `init` rather than hand-writing the file.
- **Scripted user turns should read like a person**, not like instructions to a
  test fixture. The agent's ability to interpret a natural request is part of what
  is being evaluated.

## Two layers, different jobs

Keep deterministic tests separate from agentic evals, because they differ in cost
by three orders of magnitude:

- `testing/tests/` — bun unit and contract tests. Free, instant, run constantly.
  Invoke the CLI as a subprocess rather than importing internals, so the process
  boundary is what's under test.
- `testing/evals/` — agentic scenarios. Cost money and minutes; run deliberately.

Most of what feels like it needs an eval doesn't. Push everything you can down to
the cheap layer, and let the eval carry only what requires a real agent.

## Cost and debuggability

- Set `maxBudgetUsd` and `maxTurnsPerMessage` on every scenario. An agentic loop
  with no brake can spend indefinitely.
- Artifacts land under `testing/artifacts/<name>-<timestamp>/` on every run, pass
  or fail: `transcript.json`, a readable `transcript.md`, and `summary.json`.
  They are flushed **after every turn**, so a run that times out or is killed
  still leaves evidence. A summary marked `partial: true` means the run died
  early.
- Progress goes to stderr, the report to stdout.
- Gitignore `testing/artifacts/` — transcripts are local history, and they embed
  whatever your fixtures contain.

## When a run misbehaves

- **Hangs with no result** → check E1/E3 in `sdk-claims.md`. Do not switch to
  `session_state_changed` without verifying.
- **Costs look wrong** → E2 (per-turn vs cumulative).
- **Auth errors** → E5. Confirm exactly one credential is set, and remember `env`
  replaces rather than merges the child environment.
- **Exact-content gate fails on Windows** → G1, line endings.
- **Late turn dies `error_max_turns`** → G3, the brake is session-wide.
- **A claim itself broke** → fix the runtime, then update `sdk-claims.md` with the
  new version stamp. The file is meant to be corrected, not preserved.
