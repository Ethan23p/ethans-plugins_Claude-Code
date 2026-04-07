#!/usr/bin/env python3
"""Fetch a Logseq block by UUID with children, recursively resolving {{embed}} references.

Usage: python get_block.py <uuid> [--max-depth N]
"""
import argparse
import json
import re
import sys
import urllib.request

API = "http://localhost:12315/api"
TOKEN = "Claude-Logseq"


def fetch_block(uuid: str) -> dict | None:
    data = json.dumps({
        "method": "logseq.Editor.getBlock",
        "args": [uuid, {"includeChildren": True}]
    }).encode()
    req = urllib.request.Request(API, data=data, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TOKEN}",
    })
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            return result if isinstance(result, dict) and "content" in result else None
    except Exception:
        return None


def print_block(block: dict, indent: int = 0, depth: int = 0, max_depth: int = 5):
    content = block.get("content", "")
    # Strip property lines (id::, collapsed::, etc.)
    lines = [l for l in content.split("\n") if not re.match(r"^[a-zA-Z_-]+:: ", l)]
    text = "\n".join(lines).strip()

    prefix = "  " * indent
    if text:
        for i, line in enumerate(text.split("\n")):
            print(f"{prefix}- {line}" if i == 0 else f"{prefix}  {line}")

    # Resolve {{embed ((uuid))}} references
    embeds = re.findall(r"\{\{embed \(\(([0-9a-f-]+)\)\)\}\}", content)
    for embed_uuid in embeds:
        if depth < max_depth:
            embedded = fetch_block(embed_uuid)
            if embedded:
                print(f"{prefix}  [embed: {embed_uuid}]")
                print_block(embedded, indent + 1, depth + 1, max_depth)
                for child in embedded.get("children", []):
                    print_block(child, indent + 2, depth + 1, max_depth)
            else:
                print(f"{prefix}  (could not resolve embed {embed_uuid})")
        else:
            print(f"{prefix}  (max depth reached for embed {embed_uuid})")

    for child in block.get("children", []):
        print_block(child, indent + 1, depth, max_depth)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch Logseq block by UUID with recursive embed resolution")
    parser.add_argument("uuid", help="Block UUID to fetch")
    parser.add_argument("--max-depth", type=int, default=5, help="Max embed recursion depth (default: 5)")
    args = parser.parse_args()

    block = fetch_block(args.uuid)
    if block is None:
        print(f"Error: could not fetch block {args.uuid}", file=sys.stderr)
        sys.exit(1)

    print_block(block, max_depth=args.max_depth)
