---
name: Logseq Guide
description: This skill should be used when interacting with Logseq in any capacity — reading pages, fetching blocks, resolving "{{embed}}" references, querying content, or when the user mentions "Logseq", "block UUID", "embedded blocks", "referenced content", or page names in [[double bracket]] notation. It provides best practices for choosing between MCP tools and the direct Logseq API.
---

# Logseq Guide

Best practices for working with the user's Logseq graph. Use MCP tools as the default, fall back to the direct Logseq HTTP API when block-level depth is needed.

## Decision: MCP Tools vs Direct API

### Use MCP tools (`mcp__mcp-logseq__*`) for:

- Reading full pages (`get_page_content`)
- Searching across pages (`search`)
- Creating/updating pages and blocks (`create_page`, `update_block`, `insert_nested_block`)
- Running DSL queries (`query`)
- Listing pages, namespaces, backlinks

### Use the bundled script or direct API when:

- Content contains `{{embed ((uuid))}}` references that need resolving
- A block UUID is known and its full child tree is needed
- MCP query results return only top-level block text without children
- Resolving a chain of nested/referenced blocks

The MCP `query` tool does not return block children or full content ([mcp-logseq#25](https://github.com/ergut/mcp-logseq/issues/25)). This is the primary gap the direct API fills.

## Fetching Blocks with the Script

The bundled `scripts/get_block.py` fetches a block by UUID with its full child tree and recursively resolves all `{{embed}}` references into readable indented output.

```bash
python3 scripts/get_block.py <uuid>
python3 scripts/get_block.py <uuid> --max-depth 3
```

No external dependencies — uses only Python standard library and `urllib`.

## Calling the Logseq API Directly

When the script is unavailable or a different API method is needed:

```bash
curl -s -X POST http://localhost:12315/api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer Claude-Logseq" \
  -d '{"method": "logseq.Editor.getBlock", "args": ["<uuid>", {"includeChildren": true}]}'
```

The API mirrors the Logseq plugin SDK. Useful methods:
- `logseq.Editor.getBlock` — single block with children
- `logseq.Editor.getPage` — page metadata
- `logseq.Editor.getPageBlocksTree` — full block tree for a page
- `logseq.DB.q` — DSL query with raw results

**Auth:** Bearer token `Claude-Logseq`, endpoint `http://localhost:12315/api`. Requires Logseq running with API server enabled (Settings > Features).

## Finding Block UUIDs

Block UUIDs appear as:
- `{{embed ((uuid))}}` in page content
- `id:: uuid` property lines on blocks

To look up a block by its `id::` property via MCP query:
```
(property id "<uuid>")
```
This finds the block but not its children — use the script or direct API for the full tree.
