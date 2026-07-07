---
name: constructing-tacit-skills
description: This skill should be used when the user asks to "build a tacit skill", "create a tacit-knowledge skill", "load a paper into a skill", "preserve verbatim content in a skill", "make a frame-conditioning skill", or wants a skill whose purpose is to prime an agent with a source text's ontology rather than provide situational procedures.
version: 0.1.0
---

# Constructing Tacit Skills

Guidance for authoring **tacit-knowledge skills**: skills that place a source text, verbatim and whole, into an agent's context so that its ontology, vocabulary, and framing inform all subsequent work.

## The two skill types

| | Procedural skill | Tacit skill |
|---|---|---|
| Goal | Situational lookup | Ambient frame-conditioning |
| Relevance | Separable — a shard applies to a situation | Non-separable — the whole text is the unit |
| Loading | Progressive disclosure, sharded references | Holistic front-loading, verbatim |
| Content form | Distilled instructions, scripts | Preserved authorial text |
| Compression | Safe and desirable | Lossy in unpredictable ways — avoid |

Build a tacit skill when the goal is to make a specific authorial formulation dominate over the model's diffuse prior on the topic. Precise wording carries tacit knowledge — emphasis, ordering, hedges, terminology choices — that paraphrase destroys unpredictably.

## Relationship to official best practices

The [skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) ("concise is key", "the context window is a public good", shard when SKILL.md grows) describe the procedural type. A tacit skill deviates deliberately on one axis: **the source text is not sharded and not summarized.** This is a permitted use of the format, not a violation of it — the [Agent Skills architecture](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) supports effectively unbounded bundled content, loaded when the skill triggers. The deviation must be stated inside the tacit skill itself (see template) so that future maintenance passes do not "optimize" the verbatim content back into shards.

Everything else in the official guidance still applies: precise third-person description with trigger conditions, lean SKILL.md, clear file references, iteration based on observed use.

## Construction procedure

### 1. Select and bound the source

- One source text per tacit skill — bundled frames dilute and interfere. If two texts are needed, prefer two skills; they compose.
- The source must genuinely be frame-type content: a paper, essay, or spec whose value is its way of carving the domain. Situational how-to content, even when unpredictably needed, is procedural — build that as a normal sharded skill.

### 2. Capture verbatim with provenance

- Copy the source text whole into `references/source.md`. Do not summarize, reorder, or "clean up" beyond removing navigation chrome and boilerplate.
- Prefer capture while the source is present in context (fetched, uploaded) over reconstruction from training data, which is reconstructive and error-prone. Spot-check against the original.
- Record provenance in a header block: canonical URL, author, publication date, capture date. Frame-type sources go stale; provenance makes staleness checkable.
- Respect licensing. For sources that cannot be redistributed, store a pointer plus a fetch instruction instead, and note the tradeoff: live fetch reintroduces variability that bundling was meant to remove.

### 3. Write the SKILL.md as a thin loader

The SKILL.md of a tacit skill is short. Its jobs:

1. **Trigger accurately.** The frontmatter description names the domain and the tasks during which the frame should be active — not just the source's title.
2. **Instruct whole-loading.** The first instruction is to read `references/source.md` in its entirety before proceeding. State explicitly: read whole, not searched or skimmed.
3. **Orient, minimally.** One or two sentences on what the source is and why it is loaded verbatim. Neutral register; no assistant voice; no summary of the source (a summary competes with the frame it precedes).
4. **Protect the invariant.** Include the maintenance note that the verbatim content is intentional and must not be compressed, sharded, or paraphrased in future edits.

Use `references/template.md` as the skeleton.

### 4. Trust the loaded frame

Once the source is in context, subsequent work proceeds normally, informed by it. Do not add compliance mechanisms — mandatory vocabulary checks, forced restatements, output-format policing. Presence is the mechanism; the agent's ordinary competence does the rest. If outputs seem uninformed by the source across real uses, check the trigger description first (the most common failure is the skill never loading), then source length and placement. Adjust the skill; do not add enforcement.

## Additional resources

- **`references/template.md`** — Skeleton SKILL.md for a new tacit skill, with the provenance header format.
