---
name: logseq-interface
description: This skill should be used when a request involves a Logseq graph — reading or writing pages, blocks, tasks, tags, or properties; running Datascript queries; or running and interpreting `logseq` CLI commands. Also applies when requests mention the user's notes, journal entries, or personal knowledge base without naming Logseq.
---

# Logseq Interface

Guidance for working in Ethan's Logseq graph through the `logseq` CLI.

Logseq and its CLI evolve quickly. This skill deliberately holds no copy of
what they already document — it covers the environment, the graph semantics the
CLI does not explain, the boundary the CLI is running behind, and how Ethan
wants the graph written to. Where a claim here could go stale, a verification
case sits beside it; run it rather than trusting the claim.

Source of truth for everything in this skill is the graph page
[[Logseq-Interface]]. If this file and that page disagree, the page wins and
this file wants updating.

## The CLI documents itself — read that first

A PreToolUse hook (`hooks/preload-logseq.js`) runs `logseq skill show` and
`logseq graph list` whenever this skill is invoked and injects their output
above as context. Read the `skill show` output in full before anything else: it
is authoritative for command usage, anti-patterns, and best practices, and it
supersedes memory or prior context.

If that output is absent, the hook did not fire — most often because the
installed plugin cache is behind the source. Run both commands by hand and
mention the gap.

For anything unfamiliar, `logseq <command> --help` and `logseq example <command>`
are the live answer. Options change; do not work from memory.

## Graph resolution

Default graph: `${user_config.default_graph}`. Use it directly — no discovery
call needed.

Fallback: if that graph errors, consult the preloaded `graph list` output and
pick the obvious match; ask only if several plausibly match.

## The graph is bounded — expect holes

Reads and writes both run behind **Bounded-Graph-Access**, a shim that replaces
`logseq` on the PATH. This is not a failure mode to debug; it is the intended
posture, and it changes what you should conclude from a thin result.

- Reads are filtered on the way **out**. Content outside the allowed set is
  withheld *in place* — the `db/id`, the indentation and the tree glyphs
  survive, so the graph never appears smaller than it is. Markers say why:
  `[not included]` (never in scope — no decision implied, and reasonable to ask
  about) or `[excluded]` (deliberately behind an exclude tag — a different kind
  of ask). Pages may be named in their marker; blocks may not, since a block's
  title is its content.
- Writes are declined on the way **in**, before they run. Only the
  workspace subtree — [[Claude's Workspace]] — is writable.
- An empty or sparse result is therefore ambiguous between "nothing there" and
  "nothing visible". Say which you mean, or say you cannot tell.

*Verify the boundary is live:*
`logseq search block --content "the"` — withheld rows return as ids with
`[not included]` / `[excluded]` in place of content, and runs of three or more
collapse to `… N not included …`.
`logseq upsert block --target-id <an id outside the workspace> --content "x"` —
declined before it runs.

If reads come back **unfiltered**, suspect a shell alias or function shadowing
the shim before anything else; `which logseq` cannot see one. Check with
`type -a logseq` in an interactive shell.

Fuller guidance, the current state of the feature, and its open work:
`Bounded-Graph-Access/` beside this file.

## Reading

- Default to human output. It prints the `db/id` on every line and stays
  readable. Pair it with `--linked-references false`.
- Reach for `--output json` when you specifically need per-block `block/refs`
  (unambiguous ref bindings), timestamps and other metadata, or programmatic
  parsing.
- `show --page <title> --linked-references false` returns the full block tree.
  Omit the flag only when linked references are actually wanted.
- `show --id` takes one `db/id` or an EDN vector of ids — the precise
  multi-block fetch.
- One full-page call beats piecemeal reads. Large output is acceptable and
  preferred over too little.

## Graph semantics the CLI does not explain

- Embedded blocks materialize inline as children whose `block/page` is a
  *different* page. Check `block/page` before assuming a block is local to the
  page being read.
- `[[Bracketed titles]]` may resolve to blocks, not pages. If `show --page`
  returns page-not-found and you arrived from a referring page, reuse the
  `db/id` already in that page's `block/refs` (json) or Referenced Entities
  footer (human). Fall back to `search block --content` → `show --id` only when
  there is no referring page — on common words it returns large, low-signal
  output.
- In-content references render as `[[title]]` in a DB graph (this skill's
  default). The `((uuid))` block-ref form is MD-graph-only. Resolve a ref via
  the target's `block/title` or `show`.
- There is no `uuid->label` map. Refs serialize as bare `{:db/id N}`; the label
  comes from the target's `block/title` (json) or the Referenced Entities
  footer (human).
- `db/id`s are terse and stable within a session; UUIDs are durable. Use UUIDs
  in anything written back as a lasting reference.
- Human `show` omits `block/created-at` / `block/updated-at`, but `--output
  json` carries both on every node — recency questions need no separate
  Datascript `query`.
  *Verify:* `logseq show --id <any> --output json | grep -c created-at` → nonzero.

## Writing

- Whole block trees author in one call: `upsert block --blocks-file <file.edn>`
  with nested `:block/children`. Prefer this over per-block calls for any
  hierarchical content, and for any prose carrying apostrophes or quotes —
  shell quoting is the main write friction, and an EDN file sidesteps it.
- `--target-id` places a block relative to an existing one; `--pos` chooses
  where (`first-child` / `last-child` / `sibling`). **Omitted, `--pos` defaults
  to `last-child`.** `--parent` is not a valid option.
  *Verify (2026-09-06):* create a block with `--target-id <parent that already
  has children>` and no `--pos`; read back — its `block/parent` is the target
  and its `block/order` sorts after the existing children.
- **Update mode preserves newlines.** `upsert block --id --content` stores
  multi-line content intact, blank-line paragraph breaks included. An older
  warning that it truncates at the first newline is **no longer true**.
  *Verify (2026-09-06):* update a scratch block with two lines, then
  `show --id <id> --output json` — `block/title` carries a real `\n`.
- **Upsert output confirms nothing.** Both create and update return a bare
  `result  -` with no content echoed. Read back when the write matters.
- **Blocks move.** `upsert block --id <existing> --target-id <new parent>
  --pos <position>` relocates rather than edits: the block keeps its `db/id`
  and its descendants travel with it. This is the CLI's own third `upsert
  block` example, where it reads as an edit and is easy to miss. It makes
  reorganizing non-destructive — prefer it over delete-and-recreate, which
  breaks ids and refs.
  *Verify (2026-09-06):* build `A > payload` and a sibling `B`; move `payload`
  under `B`, then move `B` under `A`. Read back — `A > B > payload`, all three
  ids unchanged.
- `remove block --id` takes the block's descendants with it.
- Batch *create* of a tree works in one call; batch *update* does not — each
  existing block is its own call.
- Task state is structured data, not content: `upsert task --status <status>`,
  and keep `TODO` / `DOING` / `DONE` out of `--content`. Tags go in
  `--update-tags` as an EDN vector, never as content hashtags or a
  comma-separated string.

## Block structure conventions

Ethan's graph style, not CLI facts.

- Heading blocks are heading-only. Content always goes in a child block, never
  on the same block as the heading.
- Subtitle exception: a crisp one-liner subtitle may live on line 2 of the
  heading block (a real newline in the EDN string). Remaining body goes in a
  child of that block. Use selectively — it is not the default.
- Paragraph breaks within a prose block use a blank line (two newlines in the
  EDN string). Two related paragraphs belong in one block; do not split them
  into siblings.
- Parallel or enumerable items — lists, taxonomy entries, procedure steps — are
  each their own sibling child block. Do not pack them into one multi-line
  block.

## Talking to Ethan about the graph

Ethan cannot see `db/id`s or UUIDs. Logseq surfaces neither, not even for
navigation, so an identifier in a message to him is an anchor he cannot follow.

Anchor relatively instead — page, then heading path, then the text itself:

> On [[Logseq-Interface]] under "Overview → Quirks of Logseq", "<this>" should
> be "<that>".

Identifiers are still the right currency *between* commands. Keep them there.

## Working with Ethan

From [[Logseq-Interface]] → "Guiding Principles". These govern anything durable
you write, in the graph or in this plugin.

- Guide, don't instruct. Direct instruction breaks down the moment something is
  slightly off; guidance degrades gracefully.
- Respect the reader's intelligence — an agent reading this is capable. Be
  precise and explicit, and leave room for its own judgement.
- Reserve space for uncertainty, and put verification beside every claim that
  could rot. A claim about a bug or a quirk should arrive with a cheap command
  that settles it.
- Don't restate what Logseq or Ethan's own tooling already documents. Point at
  it instead, even when pointing is clunkier.
- Minimalist in aesthetic and in principle. Neutral, precise voice — not the
  assistant voice.
- Be explicit about expectations and boundaries.

## Feedback

Observations about this interface — friction, surprises, corrections — go on
[[Claude's Workspace]] under "Direct Feedback from Claude Instances". That
section carries its own conventions and a template; read them there before
appending.

In short: entries are dated and signed, claims carry a minimal runnable
verification case, and nothing is trusted until independently verified.
Verified items get promoted into this skill. Do not edit this skill directly
from a single session's experience.
