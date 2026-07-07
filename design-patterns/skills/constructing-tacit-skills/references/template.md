# Tacit Skill Template

Copy this skeleton when constructing a new tacit skill. Replace bracketed fields. Keep the SKILL.md body close to this length — the loader is thin by design.

## Directory layout

```
<skill-name>/
├── SKILL.md
└── references/
    └── source.md
```

## SKILL.md skeleton

```markdown
---
name: [skill-name, lowercase-hyphenated]
description: This skill should be used when working on [domain / task types during which the frame should be active — e.g. "designing or reviewing evaluations for agentic systems"], including when the user mentions [key terms from the source's vocabulary]. Loads [source title] by [author] verbatim as framing context.
version: 0.1.0
---

# [Skill Title]

Before proceeding with the task, read `references/source.md` in its entirety. Read it whole — do not search, skim, or excerpt it. The text is loaded verbatim because its precise formulation is the payload; work on the task should proceed in its frame and vocabulary as naturally applicable.

## Maintenance note

The verbatim content in `references/source.md` is intentional. Do not summarize, compress, shard, or paraphrase it in future edits. General skill-authoring guidance favoring conciseness and progressive disclosure applies to procedural skills; this is a tacit-knowledge skill, and holistic verbatim loading is its correct architecture. Update the source only by re-capturing from the canonical URL and updating the provenance header.
```

## source.md provenance header

Begin `references/source.md` with:

```markdown
<!--
PROVENANCE
Canonical URL: [url]
Author(s): [names]
Published: [date, as stated by source]
Captured: [date of capture]
Capture method: [fetched live / copied from context / other]
Verbatim except: [e.g. "navigation and footer removed" — keep this list short and honest]
-->

[full verbatim source text]
```

## Checks before shipping

- Description names tasks and domain terms, not just the source title.
- SKILL.md contains no summary of the source.
- source.md diff-checked against the canonical original (spot-check at minimum).
- Provenance header complete.
- Maintenance note present.
