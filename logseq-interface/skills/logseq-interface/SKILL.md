---
name: logseq-interface
description: Operate the Logseq command-line interface to inspect or modify graphs, pages, blocks, tasks, tags, and properties; run Datascript queries; show page/block trees; manage graphs and db-worker-node servers. Use when a request involves running `logseq` commands or interpreting CLI output.
---

# Logseq CLI

Before executing any logseq commands, run the following to load the full, up-to-date skill documentation from the CLI itself:

```bash
logseq skill show
```

Read that output in full before proceeding. It is the authoritative source for command usage, anti-patterns, and best practices — do not rely on memory or prior context instead.

## Quick orientation

- `logseq --help` — top-level commands and global flags
- `logseq <command> --help` — command-specific options
- `logseq example <command>` — runnable examples (source of truth for syntax)
- `logseq graph list` — list available graphs; use `-g <name>` to target one
- `--output json` — machine-readable output when you need to parse results
