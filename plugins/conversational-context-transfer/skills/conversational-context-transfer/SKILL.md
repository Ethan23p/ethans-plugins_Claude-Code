---
name: conversational-context-transfer
description: "**Conversational Context Transfer**: Builds rich, Claude-readable context documents through structured conversation. Use this skill whenever a user wants to teach Claude about something — themselves, a project, a person, a domain, a business, a relationship — or wants to transfer nuanced context for future interactions. MANDATORY TRIGGERS: 'get to know me', 'learn about me/my...', 'I want to give you context', 'build a profile', 'remember this about me', 'create a context document', 'personal context', any request to create persistent context through dialogue rather than dictation, any mention of teaching Claude about a subject through conversation, requests to reduce repetition across sessions, or wanting future Claude instances to 'already know' something."
---

# Conversational Context Transfer

Build rich, structured context documents through natural conversation — optimized for future Claude consumption.

## What This Skill Does

This skill guides you through a conversational extraction process where you probe a user about a subject (often themselves, but could be anything), progressively build a structured context document, and deliver an artifact that future Claude instances can read and immediately act on.

The output is a living markdown document designed to onboard a Claude instance in under 30 seconds (via Quick Reference) while providing deep context for nuanced interactions.

## Why This Approach Works

People carry enormous context that's hard to dump into a document cold. But in conversation, the right question at the right time unlocks it naturally — and the answer often reveals far more than what was asked. This skill exploits that by structuring the *conversation*, not the user's output. The user talks naturally; you do the structuring.

The key insight: optimize for the *reader* of the final document (a future Claude instance), not the *writer* (the current conversation). The document should enable fast onboarding, not mirror the order things were discussed.

---

## Process Overview

```
1. Scope & Setup       → Understand the subject, create plan + context files
2. Extraction Rounds   → Conversational probing, 1–2 questions per turn
3. Review Checkpoints  → Pause, identify gaps, let user prioritize
4. Restructure         → Optimize document for reader, not writer
5. Finalize            → User review, last additions, done
```

---

## Phase 1: Scope & Setup

### Understand the Subject

Before asking anything, establish:

- **What is the subject?** (themselves, a project, a person, a domain, etc.)
- **Who is the audience?** (future Claude instances, other people, the user themselves?)
- **What's the purpose?** (make interactions feel organic, reduce repetition, inform decisions, etc.)
- **What files should be used?** (user may have specific filenames in mind; otherwise default to `plan.md` and `context_[subject].md` in workspace)

If the user has already provided context (e.g., "turn this conversation into a context document"), extract what you can from history first and confirm before probing further.

### Create the Plan File

The plan file tracks your strategy and progress. It should include:

- **Domains to cover**: Map the territory before exploring it. Adjust domains to the subject — for a person, this might include Professional, Personal, Values, Interests, Communication Style. For a project, it might be Architecture, Goals, Constraints, History, Stakeholders.
- **Conversation rounds**: Group related domains. Typically 3–4 rounds.
- **Review checkpoints**: Explicitly scheduled after rounds 2–3.
- **Progress log**: Track what's been covered, what's thin, what's left.

### Create the Context File (scaffold)

Start with YAML frontmatter, a header, and section stubs. The structure will evolve — this is a scaffold, not a contract.

**YAML frontmatter** provides machine-parseable metadata so systems managing multiple context files can index them without reading full documents. Always include:

```yaml
---
subject: [Name or title]
type: [person | project | domain | business | relationship]
version: 1.0
created: [date]
last_updated: [date]
primary_use: [claude_onboarding | decision_support | project_reference | etc.]
related_docs: []
---
```

Always include these structural elements in the initial scaffold:
- A `Quick Reference` section (will be filled during restructure)
- A `How to Engage [Subject]` section for people-subjects (communication/interaction patterns)
- Domain-specific sections with `_TBD_` placeholders
- A `Changelog` section at the bottom — even a simple dated list of major updates. This gives the document a temporal dimension cheaply, and provides seed data if the context is ever migrated to a time-aware store.

---

## Phase 2: Extraction Rounds

This is the core of the skill. The quality of the output depends almost entirely on the quality of the questions.

### Question Design Principles

**High-yield openers first.** Ask questions that naturally reveal multiple domains at once. "What do you do, and what's taking up most of your mental energy right now?" covers professional context, current priorities, and emotional state in a single prompt.

**1–2 questions per turn, maximum.** Never fire a list of questions. The user will answer the first one or two and forget the rest. One well-chosen question beats five decent ones.

**Open-ended, not categorical.** "Tell me about your situation" beats "Are you employed?" The former invites narrative; the latter invites a yes/no.

**Follow energy, not script.** If the user goes deep on something you didn't plan to cover yet, follow them. The plan is a guide, not a rail. You can always come back to missed domains later.

**Acknowledge before advancing.** After the user shares something substantive, reflect it back briefly — draw a connection, name a pattern, or note what it tells you — before moving to the next question. This signals genuine engagement and often prompts the user to add nuance they otherwise wouldn't.

### The Extraction Loop

For each round:

1. **Ask** 1–2 high-yield questions targeting the round's domains
2. **Listen** — let the user's answer reveal structure; don't impose your expectations
3. **Reflect** — briefly acknowledge what was shared, draw connections if they exist
4. **Document** — update the context file incrementally after each round (not at the end)
5. **Repeat** until the round's domains feel covered

### Handling Common Patterns

- **User wants to defer**: "We'll come back to that" → Respect it. Note it in the plan as a gap to revisit.
- **User provides artifacts**: Resumes, documents, links → Process them, extract what you can, but ask what's current vs. outdated. Documents often trail reality.
- **User gives much more than asked**: Great. Capture everything. Don't truncate their momentum.
- **User gives terse answers**: Try a different angle. Sometimes "what does your day actually look like?" unlocks what "tell me about your work" didn't.
- **Contradictions surface**: Note them gently. "Earlier you mentioned X, but this sounds different — which is more current?" People's self-understanding evolves mid-conversation.

---

## Phase 3: Review Checkpoints

After 2–3 extraction rounds, pause and explicitly review:

1. **Read the full context file** — not from memory, actually re-read it
2. **Identify thin areas** — sections with little content or content that's inferred rather than stated
3. **Identify assumptions** — flag anything you wrote that the user didn't actually say (mark with qualifiers like "likely" or "seems to")
4. **Present gaps to the user** — name them clearly, let the user decide which are worth filling now vs. later vs. never
5. **Update the plan** — mark completed rounds, note what's left

The checkpoint is also a good moment to ask: "Is there anything about [subject] that feels important but hasn't come up yet?" Users often have things they want to share but weren't prompted for.

---

## Phase 4: Restructure

This is where most of the skill's value is created. The document grew in conversation-order. Now restructure it for the reader.

### Restructure Principles

**Lead with actionable context.** A future Claude instance needs to know how to behave *before* it needs biographical detail. Put the Quick Reference table and "How to Engage" section at the top.

**Quick Reference table**: A scannable table that captures identity, current situation, and engagement style in ~7 rows. This is the 30-second onboarding. A Claude instance that reads only this table should be able to have a noticeably better interaction than one with no context.

**"How to Engage" section** (for people-subjects): Communication preferences, thinking style, what they want from Claude, observed interaction patterns. This shapes every future interaction — it's the highest-leverage section in the document.

**Current situation before history.** What's happening now matters more than what happened before. Background and history go in later sections for reference.

**Deduplicate ruthlessly.** During extraction, the same fact often surfaces in multiple contexts. In the final document, each fact lives in one place with cross-references if needed.

**Use the user's language.** When someone describes themselves as a "systems-minded architect," use that phrase — don't paraphrase it into something blander. Their self-description is data.

### Suggested Document Structure (for person-subjects)

```
1. Quick Reference (table)
2. How to Engage [Name]
3. Current Situation (what's happening now)
4. Background (history, education, skills)
5. Personal Life (relationships, social)
6. Inner World (interests, values, worldview, quirks)
7. Goals & Aspirations
```

For non-person subjects, adapt the structure to what makes sense — but the principle holds: actionable context first, reference material second.

---

## Phase 5: Finalize

1. **User review**: Share the restructured document. Ask if anything feels wrong, missing, or mischaracterized.
2. **Last-call probe**: "Is there anything we haven't covered that you'd want a future Claude to just *know*?"
3. **Update metadata**: Set `last_updated` in frontmatter, bump `version` if substantial changes were made.
4. **Add changelog entry**: Note what was covered in this session (e.g., "Initial context build — professional, personal, values, goals").
5. **Update the plan**: Mark finalization complete.
6. **Optionally analyze the interaction itself**: If relevant, note what worked in the conversation — communication patterns, preferred question types, pacing — and add it to the document. These meta-observations are often the most valuable part for future instances.

---

## Edge Cases & Guidance

**Updating an existing context document**: If a context file already exists, read it first. Don't start from scratch — identify what's outdated or thin and probe only those areas. The user shouldn't have to re-explain what's already captured.

**Multiple subjects**: If the user wants context on several related things (e.g., themselves + their business + a project), create separate documents with cross-references rather than one massive file.

**Sensitive information**: The user is trusting you with personal context. Don't editorialize or pathologize. If someone says "I'm schizoid," document it as their self-description, not as a clinical assessment. Reflect their framing.

**The document is a living artifact**: Remind the user that this can be updated in future sessions. It doesn't need to be perfect or complete — it needs to be *useful*.
