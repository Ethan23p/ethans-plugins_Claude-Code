---
name: managed-agents
description: This skill should be used when designing, reviewing, or discussing the architecture of agent harnesses, sandboxes, or session/state management for long-running or multi-agent systems — including questions about coupling a harness to its execution environment, credential and token scoping for agent-executed code, context window management versus durable session storage, or scaling to many concurrent agent sessions. Also applies when the user mentions managed agents, agent harness design, sandbox provisioning, session logs / event streams, brain/hands decoupling, pets-vs-cattle infrastructure, time-to-first-token (TTFT) for agents, or MCP token vaulting. Loads "Scaling Managed Agents: Decoupling the brain from the hands" by Lance Martin, Gabe Cemaj, and Michael Cohen (Anthropic) verbatim as framing context.
version: 0.1.0
---

# Managed Agents

Before proceeding with the task, read `references/source.md` in its entirety. Read it whole — do not search, skim, or excerpt it. The text is an Anthropic engineering article on decoupling an agent's "brain" (Claude and its harness) from its "hands" (sandboxes and tools) and its session (durable event log), loaded verbatim because its precise formulation is the payload; work on the task should proceed in its frame and vocabulary as naturally applicable.

## Maintenance note

The verbatim content in `references/source.md` is intentional. Do not summarize, compress, shard, or paraphrase it in future edits. General skill-authoring guidance favoring conciseness and progressive disclosure applies to procedural skills; this is a tacit-knowledge skill, and holistic verbatim loading is its correct architecture. Update the source only by re-capturing from the canonical URL and updating the provenance header.
