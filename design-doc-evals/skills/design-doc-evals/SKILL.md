---
name: design-doc-evals
description: >-
  Authors the "Testing & Evaluation" section of a software design document
  from the other sections of that document. Use this whenever the user hands
  you a design doc, spec, PRD, or architecture document with sections like
  Vision / Goal State / Guiding Principles / Technical Spec / Roadmap filled
  out and asks you to write, draft, fill in, or complete the testing, eval,
  QA, or acceptance-criteria portion — even if they just say "do the testing
  section for me" or "I always get stuck on evals, can you handle this part."
  Trigger it for design-time test/eval planning (deriving what to test from
  intent), NOT for writing actual test code against an existing codebase.
---

# Authoring the Testing & Evaluation section

## What this task actually is

Writing the Testing & Evaluation section of a design doc is a **translation
problem**: turning the prose intent expressed in the rest of the document
(Vision, Goal State, Guiding Principles, Technical Spec, Ideation, Roadmap)
into checkable assertions about whether the thing works.

This is a task you are genuinely strong at, and you should take real ownership
of it. A well-written design doc *leaks* requirements between its lines —
constraints that are implied but never stated explicitly. Surfacing those and
making them testable is high-value close-reading work. Be thorough and
confident about the derivable part.

But there is a specific, dangerous failure mode to avoid (see below). The whole
craft of this section is knowing which part you can derive and which part you
must ask about.

## The 80 you derive, the 20 you must not invent

**Derive freely** (this follows from what the user wrote — be exhaustive):
- The test taxonomy that fits the architecture: unit, integration, end-to-end,
  property-based, contract, regression, load/soak — whichever the system needs.
- Happy paths for every capability named in the spec.
- A thorough sweep of error conditions, boundaries, and edge cases.
- Security and input-validation cases (injection, authz, overflow, malformed
  input) — the generic adversarial surface.
- Requirements that the other sections *implied but never stated* — call these
  out; they are the most valuable thing you contribute.
- The *structure* of metrics: latency, throughput, error rate, correctness —
  phrased as assertions with a named threshold slot.

**Do NOT invent — ask instead** (this is judgment that lives in the user's head,
not in the document):
- **Numeric thresholds and acceptance bars.** You can write "p95 latency < X";
  you cannot know whether X is 200ms or 2s before the user feels the product is
  broken. That is a product judgment, not a derivation.
- **What "good" means for taste-laden goals.** "Onboarding feels effortless"
  has no honest proxy metric you can pull from the air. If you invent one, the
  user will optimize the number and lose the thing it stood for (Goodhart's
  law). Name the criterion; ask the user how they'd know it was met.
- **Domain-specific failure modes.** You know generic adversarial cases well.
  You do NOT have the scar tissue for "the thing that actually bites apps like
  *this* one in production." Ask the user what has burned them or systems like
  theirs before.
- **Prioritization.** Which handful of tests carry most of the risk is a
  judgment call. Offer a ranked cut, but flag it as your guess and let the user
  re-rank.

### Why the line matters

The failure mode to fear is **not** an empty section. It is a confident-looking,
*wrong* section — one that rests on invented thresholds and confabulated
acceptance criteria, looking rigorous while resting on nothing. That is worse
than blank, because it gets trusted. No downstream skill of yours recovers a
judgment that was never made upstream; you can only fabricate a plausible
substitute, which is the trap. So when a threshold or success-definition isn't
in the document, treat that as a question to surface, never a blank to fill.

## Ask the right questions (the highest-leverage move)

A good clarifying question does more than fill a gap — it forces the user to
either pin down something they were defining only implicitly, or realize the
idea wasn't fully grounded. You hold real power in the interaction by asking the
*right* question at the right altitude. Use it.

Before drafting, scan the filled-out sections and extract every place where a
test would need a number, a bar, or a definition of success that the document
doesn't supply. Then ask about those — batched, specific, and grounded in what
they wrote. Good questions sound like:

- "Your Goal State says 'fast.' Fast enough that *what* — a user never waits on
  a spinner? What's the wait that would feel broken?"
- "Guiding Principles favor X over Y. When they conflict in practice, which test
  should *fail the build*? That tells me what you actually consider non-negotiable."
- "What's the worst plausible failure for an app like this — the one that would
  make you say 'we should have caught that'? I want a test guarding it."

Often the honest fix is that these judgments are *misfiled*: a latency bar
really belongs in Guiding Principles, the one metric that defines success
belongs in Goal State. When you ask, you're not just filling the test section —
you're helping pull buried commitments back into the document where they belong.
Say so when it's true.

## Spirit: evals grounded in reality, not vanity

(In the spirit of Anthropic's "Demystifying evals for AI agents.") A few
principles to carry into the section:

- **Measure what matters to the user, not what's easy to measure.** A clean
  proxy that misses the real outcome is worse than a messy direct measure.
- **Ground cases in real or realistic scenarios**, not abstractions. Tie each
  test back to a capability or risk named in the doc.
- **Start with a small, representative, high-signal set**, then say how it
  grows. A focused suite that catches real regressions beats a giant one nobody
  trusts or maintains.
- **Mix programmatic checks with judgment-based ones** where output quality is
  subjective — and be explicit about which is which, since they fail differently.
- **Name the feedback loop**: how results feed iteration, what a failing eval
  triggers. An eval with no consequence is decoration.

## Output format: mark DERIVED vs ASSUMED

Write the full section, but make the two registers visually distinct so the user
can see exactly where their judgment is required and spend their attention only
there.

- Tag derived content as **[DERIVED]** — "this follows from what you wrote."
- Tag anything where you had to supply a threshold, criterion, or guess as
  **[ASSUMED]** — "I invented this; confirm or correct it."
- End the section with an **Open Questions / Assumptions to Confirm** punch-list:
  a tight, numbered list of every [ASSUMED] item and every clarifying question,
  so the user has one checklist that captures all the judgment calls in one place.

This is the division of labor the section is built around: you supply the
throughput and the enumeration; the user supplies the bars that define truth.
The punch-list is where you hand the truth-defining work back to them, cleanly.

## Working flow

1. Read every other section of the design doc closely. Note both explicit
   requirements and implied ones.
2. Before writing, surface your clarifying questions (the threshold/bar/
   success-definition gaps). Batch them. If the user wants you to draft first
   and ask after, do that — but then the draft must be honest with [ASSUMED]
   tags rather than confidently filling the gaps.
3. Draft the section: derived content thorough and confident; assumed content
   tagged and minimal.
4. Close with the Open Questions / Assumptions punch-list.
5. Offer to fold confirmed answers back into the relevant upstream sections
   (Guiding Principles, Goal State) where the judgment really belongs.
