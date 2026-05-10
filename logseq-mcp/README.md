# logseq-mcp

Wires the [Logseq](https://logseq.com) MCP server into Claude Code / Cowork via a plugin so you don't have to re-register it per environment.

The plugin runs `logseq mcp-server --stdio`, which is shipped with `@logseq/cli`. By default it talks to the **running Logseq desktop app** through its local HTTP API server — so the agent and the editor share the same live graph.

## Prerequisites

1. **Install the Logseq CLI** (one time, globally):

   ```bash
   npm install -g @logseq/cli
   ```

   Then verify with `logseq doctor`.

2. **Turn on the desktop HTTP API server.** In Logseq desktop: Settings → Features → enable **HTTP APIs server**, and generate a token.

3. **Export the token in your shell** so the MCP server inherits it:

   ```bash
   # macOS/Linux (~/.zshrc or ~/.bashrc)
   export LOGSEQ_API_SERVER_TOKEN="<your-token>"

   # Windows PowerShell ($PROFILE)
   $env:LOGSEQ_API_SERVER_TOKEN = "<your-token>"
   ```

   The Logseq CLI auto-picks up `LOGSEQ_API_SERVER_TOKEN`; no further config needed.

## Install

From inside Claude Code:

```
/plugin marketplace add Ethan23p/ethans-plugins_Claude-Code
/plugin install logseq-mcp
```

The `mcpServers` block in `.claude-plugin/plugin.json` is wired automatically on install.

## Tools exposed

The MCP server exposes a small, deliberately curated surface:

| Tool | Purpose |
|---|---|
| `listPages` | List all pages in the active graph |
| `getPage` | Get a page's content tree (incl. blocks, properties, tags) |
| `searchBlocks` | Substring search over block titles |
| `listTags` | List tags (optionally with parents and tag-properties) |
| `listProperties` | List properties (optionally with type/cardinality) |
| `upsertNodes` | Batched create/edit transaction across pages, blocks, tags, properties — supports `dry-run` |

`upsertNodes` is the entire write surface; the description string in the upstream source is written for LLMs and is worth reading once.

## Switching to offline / local mode

If you want the MCP to read directly from a graph's SQLite file instead of going through the running desktop (useful for batch jobs or when desktop isn't running), edit the `args` in `.claude-plugin/plugin.json` to:

```json
"args": ["mcp-server", "--stdio", "-g", "<graph-name>"]
```

Don't run this concurrently with the desktop writing to the same graph.

## Caveats

- Logseq DB is in beta and the MCP surface evolves. Pin the CLI version (`npm install -g @logseq/cli@<version>`) if you want stability.
- The plugin assumes `logseq` is on `PATH`. If `which logseq` works in the shell that launched Claude Code, the MCP will resolve.
- Claude Desktop and other clients (Cursor, etc.) don't share Claude Code's plugin system — for those, register the same MCP via their own config files (`claude_desktop_config.json`, etc.).

## References

- [Logseq CLI README](https://github.com/logseq/logseq/blob/master/deps/cli/README.md)
- [`@logseq/cli` on npm](https://www.npmjs.com/package/@logseq/cli)
- [Claude Code plugins reference](https://code.claude.com/docs/en/plugins-reference)
