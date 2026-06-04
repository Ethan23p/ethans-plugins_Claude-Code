---
name: explorer-pattern
description: >
  This skill should be used when a task requires searching, surveying, or
  gathering from a space too large or noisy to load directly into context —
  codebases, document corpora, the web, databases, large tool/API surfaces,
  log streams, environments, or candidate-solution spaces. It covers the
  Explorer (a.k.a. Explorer-Summarizer) pattern: delegating broad traversal
  to isolated explorers that return only a compressed artifact, keeping the
  orchestrator's context clean. Applicable whenever the work involves "explore
  X and report back," parallel search, subagent delegation, context/token
  pressure from retrieval, or scaling search beyond a single context window —
  even when those phrases aren't used explicitly.
version: 0.1.0
---

# The Explorer Pattern

## Core idea

An **explorer** traverses a large space in an isolated context and returns only
a **compressed artifact** to the **orchestrator**. The explorer spends tokens
freely; the orchestrator never sees them. The boundary between the two is where
compression is enforced — preserving the orchestrator's finite attention budget
is the entire point.

This is a specialization of the orchestrator-workers workflow where the worker's
defining job is *compression*: distilling a large traversal into a small return.

**Invariant:** exploration tokens are disposable; only the artifact crosses the boundary.

## Where the boundary sits

The space and the explorer are not fixed to filesystems and web search.

**The space** is anything too large or noisy to bring into context whole: a
codebase, a document corpus, the web, a database or large query result, a
many-tool / many-endpoint API surface, a log or telemetry stream, a running
environment (game, simulation, sandbox), or a space of candidate solutions.

**The explorer** is wherever compression happens — not necessarily a second agent.
Three implementation seams are available depending on the substrate:

| Seam | Mechanism | When to use |
|------|-----------|-------------|
| **Agent boundary** | Subagent explores and returns a summary | Multi-agent setup; space requires autonomous navigation |
| **Tool-result boundary** | Code filters or aggregates tool output before it enters context | Single-agent; e.g. dynamic filtering, code-over-MCP |
| **Note boundary** | Exploration written to file; only a digest is read back | Persistence across context resets; long-running tasks |

All three are the same primitive at a different seam. Choose the seam that fits
the substrate available.

## Design parameters

Decide these explicitly before building:

1. **Space + access primitives** — How does the explorer move through the space
   (queries, grep/glob, API calls, sampling)? Confirm the space is actually too
   large or noisy for direct retrieval; if it fits, skip the pattern.
2. **Explorer task spec** — Each explorer needs an objective, an output format,
   guidance on which tools/sources to use, and clear task boundaries. Vague specs
   cause explorers to duplicate each other's work or leave gaps.
3. **Return artifact** — Define its shape and a token budget. A useful norm:
   tens of thousands of tokens explored distilled to ~1–2k returned. Make the
   format structured so the orchestrator can synthesize without re-parsing prose.
4. **Fan-out + scaling** — One explorer or many in parallel? Scale effort to task
   complexity, and encode that rule explicitly; explorers misjudge effort on their
   own (a simple lookup needs one explorer, not fifty).
5. **Compression substrate** — Agent vs. code-filter vs. note-to-file, per the
   seam chosen above.
6. **Synthesis** — How the orchestrator combines artifacts into the result, and
   whether it can spawn a second round based on what came back.

## Minimal recipe

1. Confirm the space warrants delegation (large/noisy; won't fit cleanly).
2. Give the explorer its access primitives.
3. Write the explorer task spec (objective, output format, tool guidance, boundaries).
4. Set the return budget and artifact schema.
5. Pick the compression substrate.
6. Set fan-out and scaling rules.
7. Define the orchestrator's synthesis (and re-spawn) step.

Bias toward the simplest version that works: a single explorer with a tight spec,
expanded to parallel fan-out only when breadth demands it.

## When not to use it

- **Tight interdependence / shared context** — Tasks where explorers must share
  state or coordinate moment-to-moment (most multi-file coding) suit this poorly;
  agents coordinate weakly in real time.
- **Cost** — Parallel multi-agent runs spend far more tokens than a single context
  (roughly an order of magnitude over plain chat). Reserve for tasks whose value
  justifies it.
- **Answer fits in context** — If direct retrieval suffices, retrieve directly.

Common failure modes: vague specs (duplication/gaps) and over-fanning (too many
explorers for a small task).

## Examples

- **`examples/codebase-audit.md`** — end-to-end instantiation of all six design
  parameters for a parallel security audit; shows how to write the explorer task
  spec and constrain the return artifact.

## Source material

These sources carry tacit calibration the summary above cannot convey. Consult
them directly when designing a non-trivial instance — particularly the
multi-agent research system post, which is the canonical production instantiation.

- **How we built our multi-agent research system** (Jun 2025) — the canonical
  production instance. Orchestrator-worker architecture, "search is compression,"
  delegation/task-spec lessons, effort-scaling rules, token economics, the full
  process diagram. **Read this first.**
  https://www.anthropic.com/engineering/multi-agent-research-system

- **Effective context engineering for AI agents** (Sep 2025) — the clearest
  statement of the compress-on-boundary primitive (the ~1–2k-token return),
  the attention-budget framing, and just-in-time retrieval.
  https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

- **Building effective agents** (Dec 2024) — the parent orchestrator-workers
  workflow and when to prefer workflows vs. agents.
  https://www.anthropic.com/engineering/building-effective-agents

- **Building agents with the Claude Agent SDK** (Sep 2025) — subagents as
  context managers, the "return only relevant excerpts" directive, and the
  gather → act → verify loop the explorer sits inside.
  https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk

- **Claude Code: best practices** + **subagents docs** — the codebase-native
  instance; the built-in read-only reconnaissance explorers (Explore/Plan).
  https://www.anthropic.com/engineering/claude-code-best-practices
  https://docs.claude.com/en/api/agent-sdk/subagents

- **Web fetch tool** — the single-agent, tool-result-boundary variant: code
  filters fetched content before it enters context.
  https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool

- **Code execution with MCP** (Nov 2025) — compressing tool definitions and
  results via code; progressive disclosure of a large tool surface.
  https://www.anthropic.com/engineering/code-execution-with-mcp

- **Building a C compiler with a team of parallel Claudes** (Feb 2026) — *(contrast
  case)* the peer-swarm variant: lateral specialization over shared state rather
  than vertical compression. Useful for understanding the boundary of where this
  pattern ends and peer coordination begins.
  https://www.anthropic.com/engineering/building-c-compiler
