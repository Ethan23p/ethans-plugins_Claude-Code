# bounded-graph-access

One-command install for [Bounded-Graph-Access][repo] — the boundary that gives
an agent part of a Logseq graph by filtering what the `logseq` CLI *returns*,
leaving what it is *asked* completely unfettered.

```bash
./bootstrap.sh          # install
./bootstrap.sh --check  # is the live install actually current?
```

Run it from Git Bash.

## This is not a Claude Code plugin, and should not become one

It sits in this repo because this is where the personal Claude ecosystem lives,
not because Claude Code can install it. Nothing here is registered in
`.claude-plugin/marketplace.json`, and the absence is deliberate — **please
don't add it.**

The feature works by replacing the `logseq` on your PATH, so that every call on
the machine passes through the filter regardless of who made it. PATH is not
something a plugin can claim. A plugin could ship the `PreToolUse` bypass guard,
since that part is genuinely hook-shaped, but the guard only declines calls that
try to *go around* the shim — shipping it alone would be shipping the lock
without the door, and would split one feature across two install mechanisms with
two update paths.

## Why this is a bootstrap and not a copy of the source

The package's installer writes shims that point at whatever directory it was run
from, and never copies itself anywhere. Its own README is blunt about the
consequence:

> Install from where the package will permanently live. […] not from a directory
> you copied by hand — a copy has no way to tell you it has fallen behind, and
> the entry points will keep aiming at it.

So vendoring the source into this repo would create precisely the stale
second copy the design warns against. Instead `bootstrap.sh` parks a **sparse
clone** of the canonical repo at a stable path you choose and hands off to that
clone's own `install.sh`. There is exactly one copy of the code on the machine,
it knows what commit it is on, and it can be updated.

## What `bootstrap.sh` does

1. **Preflight** — git, Node 18+, and `cygpath` (Git Bash) present.
2. **Asks where the clone should permanently live.** This path is baked into the
   shims, so a scratch directory is the wrong answer.
3. **Sparse-clones** `Ethan23p/extending-logseq-ethan` filtered to
   `Bounded-Graph-Access/*` with `--filter=blob:none` — the subdirectory
   without the rest of the repo's history in blobs. An existing checkout at that
   path is adopted and offered an update rather than re-cloned.
4. **Runs the package's offline test suite** to confirm the checkout is sound.
   No graph required.
5. **Hands off** to `install.sh`, the real seven-stage wizard: configure what is
   visible, back up the existing shim, install both entry points, put the
   directory ahead of `WindowsApps` on the Windows PATH, verify, and optionally
   add the `PreToolUse` guard.

Everything after step 5 — configuration, uninstall, the costs and limits of the
approach — is documented in the package itself, which is the authority. Read
`README.md` and `PLAN.md` in the clone.

## Upgrading

```bash
git -C <clone> pull --ff-only
```

That is the whole procedure. The shims and the guard hook name absolute paths
*inside* the clone, so a pull moves the running code; there is nothing to
re-point and no reinstall step.

## `--check`, and the failure it exists for

An install can serve stale code while looking perfectly healthy. If the clone is
parked on an old feature branch, `git status` reports *"up to date with
origin/that-branch"* — true, reassuring, and entirely beside the point. Neither
stamp saves you either: the commit in `~/bin/logseq`'s header and `BGA_COMMIT` in
`.install-state` are written at install time and never touched by a pull, so a
healthy install carries a stale-looking stamp and a stale one carries a
plausible stamp.

`./bootstrap.sh --check` reads the shim to find what is *actually* live, then
compares that checkout against `origin/main` and tells you the honest answer.

[repo]: https://github.com/Ethan23p/extending-logseq-ethan/tree/main/Bounded-Graph-Access
