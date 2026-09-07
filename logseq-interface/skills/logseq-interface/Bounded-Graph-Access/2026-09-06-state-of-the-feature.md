# State of the feature — 2026-09-06

Dated snapshot, observed live from this machine. Supplementary: it ages, and
the repo (`Ethan23p/extending-logseq-ethan`, `Bounded-Graph-Access/`) does not.
Where this disagrees with `PLAN.md` or `HANDOFF.md`, they win.

## Live install

| | |
|---|---|
| resolved `logseq` | `/c/Users/Ethan/bin/logseq` |
| package running | `E:/Hume General/Bounded-Graph-Access-Logseq/Bounded-Graph-Access` |
| stamped at install | commit `dfe9e0e`, 2026-09-01 |
| that clone's HEAD now | `78ff643` |
| graph | `Logseq-DB-Aurelius` |
| include / exclude | `#creative` / `#private` |
| workspace | `claude's workspace` |

**Two clones exist**, both of `extending-logseq-ethan`, both currently at
`78ff643`:

- `E:/Hume General/Bounded-Graph-Access-Logseq/…` — **the live one**
- `E:/Hume General/Repos/Logseq-Tooling/…` — the one filed under Repos

They agree today, so nothing is broken. But a `git pull` in the Repos clone
upgrades nothing, and the divergence would be silent. Worth collapsing to one.
`cat ~/bin/logseq` is the check.

## Verified working, this date

```bash
logseq search block --content "the"
```
Withheld rows return as bare ids carrying `[not included]` / `[excluded]`;
runs of three or more collapse to `… N not included …`. Real hits render in
full. Page markers name the page (`[not included: Library]`); block markers do
not.

```bash
logseq upsert block --target-id 42420 --content "boundary probe"
# → bounded-graph-access: declined — target 42420 is outside the workspace boundary.
```

```bash
logseq upsert block --target-id 182 --blocks-file <tree.edn>   # inside the workspace
# → succeeds
```

Reads inside the boundary are annotated rather than merely filtered: a
`--output json` node carries `"access":"not included"` on withheld refs
(observed on `logseq.property/created-by-ref`), so json consumers see the same
distinction the human renderer draws.

## Outstanding work, against `HANDOFF.md`

All three numbered work items are **unstarted** as of this date. The decline
prefix observed above (`declined —`) is itself the tell for item 3.

| item | state | evidence |
|---|---|---|
| 1 — reference-admitted anchors | not started | `grep -c "block/refs" src/scope.js` → `0` |
| 2 — config in package dir, profiles | not started | no `packageDir` / `activeProfile` in `src/config.js`; live config still at `~/.bounded-graph-access.json` |
| 3 — error vocabulary + free-standing page rule | not started | `src/main.js` emits `declined —` in all four places; none of the four new prefixes appear |
| 3a — `--target-uuid` in `TARGET_FLAGS` | not fixed | `src/writes.js:26` lists `--id --target-id --uuid --target-page --page`; `--target-uuid` absent |

Done out of band and confirmed present: the guard fixes (Electron 12315 denial,
heredoc stripping) with `test/guard.test.js`.

**Practical consequence for Claude today:** `upsert block --target-uuid <uuid>`
is a legitimate, fully bounded write that will be declined for "names no
target". Use `--target-id` until item 3a lands.

**Practical consequence today, item 1:** journal entries written *about* an
included project are still outside the boundary — they're children of a journal
node, not of the project node. `show --page <project>` renders a Linked
References section that comes back almost entirely blank. That is the boundary
working as currently specified, not a bug.

## Re-check next time

- `cat ~/bin/logseq` — did the live clone change?
- `grep -c "block/refs" src/scope.js` — has item 1 landed? If so, this file's
  "journal is invisible" note is obsolete.
- Does a decline still say `declined —`, or one of the four new prefixes?
