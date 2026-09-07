# Bounded-Graph-Access

Durable guidance for working *inside* the boundary. For the design itself —
the mechanism, the closure, the approaches ruled out — the source repo is
authoritative and this file deliberately does not restate it:

- `PLAN.md` — the design, and the closed doors
- `HANDOFF.md` — what changes next and why
- `README.md` — install, configure, verify, uninstall

Repo: `Ethan23p/extending-logseq-ethan`, subdirectory `Bounded-Graph-Access/`.

Dated snapshots of the feature's live state live beside this file. They are
supplementary and they age; the repo does not.

---

## What it is, in one paragraph

A shim replaces `logseq` on the PATH. Input is unfettered — every command,
flag and composition works unchanged. **Reads are judged on the way out**
against an allowed set and anything outside it is withheld in place. **Writes
are judged on the way in** against a workspace subtree and declined if they
fall outside it. The two halves share only the closure and never call each
other.

The allowed set is `(#creative ∪ workspace) − #private`, inherited down
`:block/parent`. The workspace — [[Claude's Workspace]] — is in the read set by
function, so an agent can see what it just wrote.

## For Claude: how to behave inside it

**Treat a thin result as ambiguous.** Withheld content leaves its `db/id`,
indentation and tree glyphs behind, so the shape of the graph is honest even
when its content isn't. What you cannot conclude from a sparse result is that
the graph is sparse. Say which you mean, or say you can't tell.

**Read the markers; they carry a real distinction.**

| marker | means | reasonable response |
|---|---|---|
| `[not included]` | never pulled into scope. No decision implied. | Fine to ask Ethan to tag it in. |
| `[excluded]` | sits under a deliberate exclude tag. | A different kind of ask. Usually: don't. |
| `… N not included …` | three or more consecutive flat withheld rows of one category | Nothing lost but individual ids. |

Pages may be named inside their marker — `[not included: Library]` — because a
page title is a name. Blocks may not, because a block's title *is* its content.

**A decline is a bound, not an error.** `out of bounds:` / `unsupported:` /
`unknown target:` / `unfilterable:` (older builds emit a single `declined —`)
mean the boundary held. Upstream Logseq errors are never masked: reads bail on
a non-zero exit *before* filtering, and writes are declined *before*
forwarding, so nothing here swallows or rewrites a real CLI error.

**Don't route around it.** Calling the real binary by absolute path, or the
db-worker HTTP server, or the Electron API on 12315, defeats the boundary. A
`PreToolUse` guard declines all of these inside Claude Code. Being declined
there is the system working.

**Costs worth knowing before you blame a bug:**

- `--output edn` is declined on filtered reads — no EDN parser here, and
  passing it through unfiltered would be a hole. Use human or `--output json`.
- Human-mode `query` passes only for aggregates. Numbers describing the graph's
  shape pass; anything else is declined with a pointer to `--output json`.
- Withheld table rows lose trailing column padding. The id column stays
  aligned. Cosmetic.
- Warm cost ≈ 1s (one staleness query); a cold rebuild ≈ 3s.
- The allowed set is derived and cached. New content is invisible until the
  cache refreshes — which fails safe.

## For Ethan: the levers

Config keys — `graph`, `includeTags`, `excludeTags`, `workspacePage`,
`logseqExe` / `logseqCli`. Every key optional; defaults in `src/config.js`.

- **Something Claude should see but can't** → tag the node. Descendants follow;
  no per-node work.
- **Something Claude shouldn't see** → put it under an exclude tag. Deny wins
  over include, always.
- **The shim never mutates its own config.** Claude's shell calls go through
  the shim, so a config-writing subcommand would be a lever the agent could
  pull on itself. Changing a boundary is a hand-edit.

## The failure mode to suspect first

If reads come back **unfiltered**, it is almost always name resolution, and
almost always a shell alias or function — which outranks PATH outright and
which `which logseq` structurally cannot see, being an external program that
only searches PATH. Neither can a non-interactive script; aliases aren't
loaded there.

```bash
type -a logseq          # in an INTERACTIVE shell — the only reliable check
which logseq            # PATH only; will look correct while the boundary is dead
cat ~/bin/logseq        # names the package, the commit, and the uninstall command
```

This has happened once for real: a May-era `alias logseq=` in `.bashrc`
defeated the boundary completely in Git Bash while PowerShell worked fine —
which is exactly how it presented.

**Second thing to check: which clone is actually live.** The entry points are
stamped with the package path they were installed from and never move
themselves. A `git pull` in a *different* clone of the same repo upgrades
nothing. `cat ~/bin/logseq` names the live one.

## Honest limits

A shim is a guardrail, not a sandbox. The threat model is drift, not an
adversary — Ethan's stated bar is that this be the path of least resistance,
so that Claude reaches for it by default. Security is a later nice-to-have, not
the current claim.

Three doors exist: the CLI, the db-worker HTTP server, and the Electron API on
12315. One is bounded. The `PreToolUse` guard closes the Claude-Code-shaped
path to the other two, which is not the same as closing them.
