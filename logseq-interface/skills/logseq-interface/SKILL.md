---
name: logseq-interface
description: This skill should be used when a request involves a Logseq graph — reading or writing pages, blocks, tasks, tags, or properties; running Datascript queries; or running and interpreting `logseq` CLI commands. Also applies when requests mention the user's notes, journal entries, or personal knowledge base without naming Logseq.
---

# Logseq Interface

Guidance for the `logseq` CLI. The CLI documents itself well; this skill covers only what it doesn't — environment defaults and graph semantics.

## Load CLI documentation first

The output of `logseq skill show` and `logseq graph list` is already preloaded above as context — a PreToolUse hook (`hooks/preload-logseq.js`) runs them automatically whenever this skill is invoked, so there's no need to call either yourself. Read the `skill show` output in full before any other command: it is the authoritative source for command usage, anti-patterns, and best practices — defer to it over memory or prior context. Before any unfamiliar command, check `logseq <command> --help` and `logseq example <command>`; options change as the CLI evolves.

## Graph resolution

Default graph: `${user_config.default_graph}` — use it directly, no discovery call needed.

Fallback: if that graph errors, consult the preloaded `logseq graph list` output above and pick the obvious match; ask only if several plausibly match.

## Reading

- Default to human output — it prints the db/id on every line and stays readable; pair it with `--linked-references false`. Reach for `--output json` only when you specifically need per-block `block/refs` (unambiguous ref bindings), timestamps and other metadata, or programmatic parsing.
- `show --page <title> --linked-references false` returns the full block tree; omit `--linked-references false` only when linked references are explicitly needed. There is no `uuid->label` map — refs serialize as bare `{:db/id N}`; take the label from the target node's `block/title` (json) or the Referenced Entities footer (human).
- `show --id` accepts one db/id or an EDN vector of ids — the precise multi-block fetch.
- One full-page call beats piecemeal reads; large output is acceptable and preferred over too little.

## Graph semantics the CLI does not explain

- Embedded blocks materialize inline as children whose `block/page` is a *different* page. Check `block/page` before assuming a block is local to the page being read.
- `[[Bracketed titles]]` may resolve to blocks, not pages. If `show --page` returns page-not-found and you arrived from a referring page, reuse the db/id already in that page's `block/refs` (json) or Referenced Entities footer (human); fall back to `search block --content` → `show --id` only when there is no referring page — on common words it returns large, low-signal output.
- In-content references render as `[[title]]` in a DB graph (this skill's default); the `((uuid))` block-ref form is MD-graph-only. Resolve a ref via the target's `block/title` or `show`.
- db/ids are terse and stable within a session; UUIDs are durable. Use UUIDs in anything written back as a lasting reference.
- Human `show` omits `block/created-at` / `block/updated-at`, but `--output json` carries both on every node — read the json and recency questions need no separate Datascript `query`.

## Writing

- Whole block trees can be authored in one call: `upsert block --blocks-file <file.edn>` with nested `:block/children`. Prefer this over per-block calls for any hierarchical content.
- `--target-id` places a block relative to an existing one; `--pos` chooses where (`first-child` / `last-child` / `sibling`), defaulting to a child when omitted. `--parent` is not a valid option.
- `upsert block --id --content` (update mode) silently truncates at the first newline — only line 1 is stored; the rest is dropped without error. For multi-line blocks, delete and recreate under the parent using `--blocks-file`.
- Upsert output confirms the write for single-line content; for multi-line, read back to confirm.
- Shell quoting is the main write friction; prefer `--blocks-file` for prose containing apostrophes or quotes.

## Block structure conventions

- Heading blocks are heading-only — content always goes in a child block, never on the same block as the heading.
- Subtitle exception: a one-liner subtitle may live on line 2 of the heading block (real newline in the EDN string). Remaining body goes in a child of that block. Use selectively.
- Paragraph breaks within a prose block use a blank line (two newlines in the EDN string). Two related paragraphs belong in one block — do not split them into siblings.
- Parallel/enumerable items (lists, taxonomy entries, procedure steps) are each their own sibling child block. Do not pack them into a single multi-line block.

## Feedback

Record observations about this interface — friction, surprises, corrections — on the graph page `Logseq Interface` under "Direct Feedback from Claude instances (not verified)": append children under that heading block via `--target-id`, creating the section if absent. Verified items get promoted into this skill; do not edit this skill directly from a single session's experience.
