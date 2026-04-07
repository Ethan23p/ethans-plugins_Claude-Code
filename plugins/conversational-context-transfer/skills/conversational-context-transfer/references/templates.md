# Conversational Context Transfer — Templates

Reference templates for context documents and plan files. Adapt to the subject — these are starting points, not rigid forms.

---

## Plan File Template (for person-subject)

```markdown
# Context-Building Plan: [Subject Name]

## Goal
Build `context_[name].md` — a rich, Claude-readable snapshot of [Subject] that makes future interactions feel organic and reduces repetition.

## Principles
- Minimize cognitive load: ask open, high-yield questions; let answers branch naturally
- Conversational, not interrogative: 1–2 questions per turn max
- Breadth first, depth second: cover all domains before going deep on any
- Iterative review: reassess gaps after each round

---

## Domains to Cover

| Domain | Key Info | Status |
|--------|----------|--------|
| Professional | Role, industry, skills, career stage, goals | ⬜ |
| Daily life | Location, living situation, schedule/rhythms | ⬜ |
| Relationships | Family, partner, close social circle | ⬜ |
| Interests & hobbies | Fun, curiosity, passions | ⬜ |
| Values & worldview | What matters, how they think | ⬜ |
| Current projects/challenges | What's on their plate | ⬜ |
| Tools & workflow | Apps, platforms, how they work | ⬜ |
| Communication preferences | Tone, depth, formality | ⬜ |
| Goals & aspirations | Short-term, long-term | ⬜ |
| Practical details | Time zone, age/life stage, recurring needs | ⬜ |

---

## Conversation Rounds

### Round 1 — High-yield openers
- Situation & work
- Current priorities / mental energy

### Round 2 — Life & interests
- Living situation, relationships
- Interests, curiosities

### Round 3 — Values, preferences, quirks
- Worldview, what they care about
- How they like to be engaged

### Review Checkpoint
After Round 3: review document, identify thin areas, probe selectively.

### Round 4 — Gap-filling
Targeted follow-ups on sparse areas.

---

## Progress Log
- [ ] Round 1 complete
- [ ] Round 2 complete
- [ ] Round 3 complete
- [ ] Review checkpoint done
- [ ] Round 4 complete
- [ ] context file finalized
```

---

## Context Document Template (for person-subject)

```markdown
---
subject: [Full Name]
type: person
version: 1.0
created: [date]
last_updated: [date]
primary_use: claude_onboarding
related_docs: []
---

# Context: [Name]

> Living document — updated through conversation. For use by Claude instances to make interactions feel organic and avoid repetition. Read the Quick Reference first; go deeper as needed.

---

## Quick Reference

| | |
|---|---|
| **Who** | [Name, age, pronouns. Location. Living situation.] |
| **What they're doing** | [Current role/pursuit, 1–2 sentences] |
| **Key context** | [The thing a Claude instance most needs to know — financial situation, major constraint, active project, etc.] |
| **How they think** | [Thinking style in their own words] |
| **How to engage** | [Tone, challenge level, what they want from Claude] |
| **What they use Claude for** | [Primary use cases] |
| **Contact** | [As relevant] |

---

## How to Engage [Name]

[Communication preferences, thinking style, what they want from Claude, observed interaction patterns. This is the highest-leverage section.]

---

## Current Situation

[What's happening now — work, projects, daily life, finances if relevant]

---

## Background

[History, education, skills, career journey — reference material]

---

## Personal Life

[Relationships, social circle, living situation]

---

## Inner World

[Interests, values, worldview, personality, quirks]

---

## Goals & Aspirations

[Near-term, medium-term, long-term, underlying drives]

---

## Changelog

| Date | Summary |
|------|---------|
| [date] | Initial context build — [domains covered] |
```

---

## Context Document Template (for project-subject)

```markdown
---
subject: [Project Name]
type: project
version: 1.0
created: [date]
last_updated: [date]
primary_use: project_reference
related_docs: []
---

# Context: [Project Name]

> Living document — updated through conversation. For use by Claude instances working on or discussing this project.

---

## Quick Reference

| | |
|---|---|
| **What** | [One-line description] |
| **Tech stack** | [Languages, frameworks, infrastructure] |
| **Status** | [Current phase, % complete, what's next] |
| **Owner** | [Who's building it, team size] |
| **Why it exists** | [Core motivation, problem being solved] |
| **Key constraint** | [Time, money, scope, skill — whatever's tightest] |

---

## Vision & Goals

[What success looks like, short and long term]

---

## Architecture & Design

[How it's built, key decisions, patterns used]

---

## Current State

[What's done, what's in progress, what's blocked]

---

## History & Decisions

[How we got here, pivots, lessons learned]

---

## Stakeholders & Users

[Who cares about this, who uses it, who's involved]

---

## Open Questions

[Unresolved decisions, uncertainties, things to figure out]

---

## Changelog

| Date | Summary |
|------|---------|
| [date] | Initial context build — [scope covered] |
```

---

## Adapting Templates

These templates are for the two most common subjects (a person, a project). For other subjects (a business, a domain, a relationship), adapt freely — the principles stay the same:

1. **Quick Reference at the top** — scannable, actionable
2. **Engagement guidance early** — how should Claude interact with this context?
3. **Current state before history** — what's happening now matters more
4. **Deduplicate** — each fact lives in one place
5. **Use the subject's language** — don't paraphrase away meaning
