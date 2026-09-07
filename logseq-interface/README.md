# logseq-interface

Claude Code plugin for agentic interaction with Ethan's Logseq graph via the
`logseq` CLI.

## Prerequisites

- The `logseq` CLI on PATH. `logseq --help` verifies it.
- Optionally, [Bounded-Graph-Access](#bounded-graph-access) installed. The skill
  works without it; with it, reads are filtered and writes are confined to a
  workspace subtree.

## What it does

Activates the `logseq-interface` skill. A PreToolUse hook runs `logseq skill
show` and `logseq graph list` at invocation and injects their output as
context, so Claude starts from the CLI's own current documentation without
spending turns on it — and so this plugin never has to carry a stale copy.

What the skill adds is only what the CLI doesn't cover:

- **Environment** — the default graph, and how to recover if it errors.
- **The boundary** — that reads are filtered and writes are bounded, what the
  withheld-content markers mean, and why a thin result is ambiguous rather than
  conclusive.
- **Graph semantics** — embedded blocks, ref resolution in a DB graph, id
  durability, where timestamps live.
- **Ethan's conventions** — block structure and prose formatting; anchoring
  references by page and heading rather than by `db/id`, which Logseq never
  shows him.
- **Working principles** — guide rather than instruct, verification beside
  every perishable claim, no duplication of documentation that already exists.

## Source of truth

The graph page `[[Logseq-Interface]]` is canonical. This plugin is downstream
of it. If the two disagree, the page is right and the plugin wants a redraft.

Feedback from sessions accumulates on `[[Claude's Workspace]]` under "Direct
Feedback from Claude Instances", and is promoted into the skill once verified —
never edited into the skill straight from one session's experience.

## Bounded-Graph-Access

`skills/logseq-interface/Bounded-Graph-Access/` carries guidance for working
inside the boundary — the markers, the decline vocabulary, the named costs, the
failure mode to suspect first — plus dated snapshots of the feature's live
state. The design itself lives in its own repo
(`Ethan23p/extending-logseq-ethan`) and is not duplicated here.

## Layout

```
logseq-interface/
├── .claude-plugin/plugin.json      default_graph user config
├── hooks/
│   ├── hooks.json                  PreToolUse, scoped to Skill(logseq-interface)
│   └── preload-logseq.js           injects `skill show` + `graph list`; fails open
└── skills/logseq-interface/
    ├── SKILL.md
    └── Bounded-Graph-Access/
        ├── README.md               durable: how to work inside the boundary
        └── YYYY-MM-DD-*.md         dated snapshots of live state
```
