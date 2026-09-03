---
name: managed-agents
description: This skill should be used when designing, reviewing, or discussing the architecture of AI agent harnesses, sandboxes, or session/state management — high-fidelity research findings on how to structure these, especially relevant for long-running or multi-agent systems, AI-enabled software development, and the user experience of agentic products. Also applies when the user mentions agent harness design, sandbox or execution environments, session logs or event streams, decoupling an agent's reasoning loop from its execution environment, or credential/token scoping for agent-executed code. Loads an Anthropic engineering article on managed-agent architecture verbatim as framing context.
version: 0.1.0
---

# Managed Agents

Before proceeding with the task, read `references/source.md` in its entirety. Read it whole — do not search, skim, or excerpt it. The text is an Anthropic engineering article on decoupling an agent's "brain" (Claude and its harness) from its "hands" (sandboxes and tools) and its session (durable event log), loaded verbatim because its precise formulation is the payload; work on the task should proceed in its frame and vocabulary as naturally applicable.

## Maintenance note

The verbatim content in `references/source.md` is intentional. Do not summarize, compress, shard, or paraphrase it in future edits. General skill-authoring guidance favoring conciseness and progressive disclosure applies to procedural skills; this is a tacit-knowledge skill, and holistic verbatim loading is its correct architecture. Update the source only by re-capturing from the canonical URL and updating the provenance header.
