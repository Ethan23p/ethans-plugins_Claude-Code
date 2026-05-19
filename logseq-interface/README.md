# logseq-cli

Claude Code plugin for agentic interaction with Logseq graphs via the `logseq` CLI.

## Prerequisites

The `logseq` CLI must be installed and available on your PATH. Run `logseq --help` to verify.

## What it does

Activates the `logseq-cli` skill, which loads Claude with the CLI's own up-to-date documentation before executing any commands. This keeps the skill resilient to CLI updates — no static documentation to go stale.

Supports the full `logseq` command surface: reading and writing pages, blocks, tasks, tags, and properties; Datascript queries; graph management; and db-worker-node server lifecycle.
