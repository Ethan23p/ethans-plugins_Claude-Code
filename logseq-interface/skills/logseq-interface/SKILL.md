---
name: logseq-interface
description: This skill should be used when a request involves a Logseq graph — reading or writing pages, blocks, tasks, tags, or properties; running Datascript queries; or running and interpreting `logseq` CLI commands. Also applies when requests mention the user's notes, journal entries, or personal knowledge base without naming Logseq.
---

# Logseq Interface

Guidance for the `logseq` CLI. The CLI documents itself well; this skill covers only what it doesn't — environment defaults and graph semantics.

## Load CLI documentation first

Run `logseq skill show` and read the output in full before any other command. It is the authoritative source for command usage, anti-patterns, and best practices — defer to it over memory or prior context. Before any unfamiliar command, check `logseq <command> --help` and `logseq example <command>`; options change as the CLI evolves.

## Graph resolution

Default: the graph is `Logseq-DB-Desktop-Epictetus` — use it directly, no discovery call needed.

Fallback: if that graph errors, run `logseq graph list` and pick the obvious match; ask only if several plausibly match.

## Reading

- Use `--output json` for anything that will be parsed or quoted; human output carries ANSI codes and tree glyphs.
- `show --page <title> --output json` returns the full block tree, a `uuid->label` map, and a trailing `linked-references` section. Pass `--linked-references false` to suppress it; omit or set `true` when references are needed.
- `show --id` accepts one db/id or an EDN vector of ids — the precise multi-block fetch.
- One full-page call beats piecemeal reads; large output is acceptable and preferred over too little.

## Graph semantics the CLI does not explain

- Embedded blocks materialize inline as children whose `block/page` is a *different* page. Check `block/page` before assuming a block is local to the page being read.
- `[[Bracketed titles]]` may resolve to blocks, not pages. If `show --page` returns page-not-found, fall back to `search block --content` → `show --id`.
- `((uuid))` in content is a block reference; resolve it via the `uuid->label` map or `show`.
- db/ids are terse and stable within a session; UUIDs are durable. Use UUIDs in anything written back as a lasting reference.
- `show` omits `block/created-at` / `block/updated-at`. Recency questions require a Datascript `query` selecting those attributes.

## Writing

- Whole block trees can be authored in one call: `upsert block --blocks-file <file.edn>` with nested `:block/children`. Prefer this over per-block calls for any hierarchical content.
- `--target-id` appends children to an existing block; `--parent` is not a valid option.
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
