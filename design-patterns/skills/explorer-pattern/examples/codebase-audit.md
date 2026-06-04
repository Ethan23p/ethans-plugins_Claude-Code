# Example: Codebase security audit

**Task:** Audit a large codebase for hardcoded secrets and unsafe input handling.

**Why the pattern applies:** The codebase has 200+ files. Loading them all into
orchestrator context would consume the budget before any analysis begins.

---

## Parameter decisions

| Parameter | Choice | Reasoning |
|-----------|--------|-----------|
| Space + access primitives | `grep`/`glob` by module directory | Each module is independently traversable; file I/O is fast |
| Explorer task spec | "Find hardcoded secrets and unvalidated inputs in this module. Return: file path, line number, pattern matched, severity (high/medium/low), one-sentence description." | Structured output so orchestrator can aggregate without re-parsing |
| Return artifact | JSON list, max 20 findings, ~1k tokens per explorer | Keeps each return small; orchestrator sees aggregate, not raw files |
| Fan-out | One explorer per top-level module, spawned in parallel | Modules are independent; parallel cuts wall time by ~10x |
| Compression substrate | Agent boundary (subagent per module) | Requires judgment on whether a pattern is actually a secret; code filter alone insufficient |
| Synthesis | Orchestrator deduplicates, ranks by severity, groups by file, drafts a findings report | Second-round explorers dispatched only for high-severity items needing deeper context |

---

## Explorer task spec (sent to each subagent)

```
Audit the module at [PATH] for:
1. Hardcoded secrets (API keys, passwords, tokens) — grep for common patterns
2. Unvalidated external inputs — trace user-supplied values to sinks

Return a JSON array. Each item: {"file": str, "line": int, "pattern": str,
"severity": "high"|"medium"|"low", "note": str (one sentence)}.
Cap at 20 items. If nothing found, return [].
Do not summarize in prose — structured output only.
```

---

## Notes

- The output format constraint ("structured output only") is load-bearing: it
  prevents explorers from spending return budget on explanation prose.
- The 20-item cap is a compression guard, not a quality cap — high-severity items
  trigger a second-round explorer with a narrower scope.
- This is an agent-boundary instantiation. The same audit could use a
  tool-result boundary if the patterns were mechanical enough for `grep` alone.
