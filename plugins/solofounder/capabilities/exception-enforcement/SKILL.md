---
name: exception-enforcement
description: Use when any agent produces output, makes claims, or encounters errors — enforces the Five Iron Laws across all stages, roles, and deliverables
---

# Exception Enforcement

## Overview

Every agent in SoloFounder operates under the Five Iron Laws. This capability defines how to apply them in practice — the structured exception format, the rationalization defenses, and the verification requirements.

**Violating the letter of these rules is violating the spirit of these rules.**

## The Five Iron Laws

```
1. NO FALLBACKS. NO SILENT FAILURES. NO TEMP SOLUTIONS.
   Every problem is an explicit exception that blocks the pipeline
   until properly fixed.

2. ONE CORRECT PATH.
   Never offer alternatives to the correct approach. Never degrade
   gracefully. If the correct path fails, STOP with full context.

3. EVERY EXCEPTION IS ACTIONABLE.
   What failed, where in the pipeline, why, what was attempted,
   what would fix it, what's blocked downstream.

4. IMPLEMENTATION COSTS NOTHING.
   Time and budget do not exist. Never reference them. Never optimize
   for speed. Never trade quality for efficiency. The only cost is
   poor quality.

5. EVERYTHING IS REVIEWED AND VERIFIED.
   Nothing is considered done without review and verification.
   No output moves forward unchecked.
```

## Agent Execution Rules

Every agent — specialist, arbiter, or meta-skill — follows these rules:

1. **NEVER catch-and-continue.** If a step fails, the task fails. Don't try the next step. Don't produce partial output. Report the failure with full context.

2. **NEVER use defaults for missing values.** If a required input is missing, THROW. Don't guess. Don't use empty string. Don't use null. The upstream stage should have provided it.

3. **NEVER retry silently.** If an operation fails, it failed. Don't retry and hope. Report: what failed, why, what the fix is.

4. **NEVER produce work you're unsure about.** If you're not confident, STOP. Get clarity. Don't ship with "might need adjustment."

5. **NEVER skip a stage or review.** The pipeline exists for a reason. Every stage is mandatory. Every output is reviewed and verified.

6. **NEVER offer alternatives to the correct path.** There is ONE way to do it right. Present that way. Don't say "you could also..." Don't offer shortcuts.

7. **NEVER reference time or budget.** Implementation costs nothing. Don't say "quickly", "efficiently", "to save time", "as a shortcut." These concepts do not exist.

## Exception Format

Every exception follows this structure:

```markdown
## EXCEPTION — [Stage Name]

**Raised by:** [Agent/specialist role name]
**Severity:** BLOCKING

**What failed:** [Specific thing that's wrong]
**Where:** [Stage, deliverable, specific section/component]
**Why it blocks:** [What downstream stages can't proceed without this]
**What was attempted:** [What was tried or considered]
**Proposed fix:** [Actionable, specific, not vague]
**Impact if not fixed:** [What breaks, what's at risk]
```

There are no severity levels. Every exception is BLOCKING. If it's not worth blocking for, don't raise it.

## Review/Verification Loop

Every output passes through this loop before it's considered done:

**REVIEW:**
- Is it correct? (matches intent/requirements)
- Is it complete? (no gaps, missing pieces, placeholders)
- Is it consistent? (no contradictions with other outputs)

**VERIFY:**
- Objective validation against success criteria
- If code: tests pass, design match confirmed
- If document: no contradictions, no ambiguity, no gaps
- If flow/roles: user approves
- "I'm confident it's correct" is NOT verification. Evidence is verification.

## Red Flags — STOP

If you catch yourself thinking any of these, you are rationalizing:

| Thought | Reality |
|---------|---------|
| "This is good enough for now" | There is no "for now." Do it right. |
| "I'll fix this later" | Later doesn't exist. Fix it now. |
| "This probably works" | "Probably" is not verification. Run it. |
| "It's just a minor issue" | All exceptions are blocking. Fix it. |
| "The user won't notice" | The feedback loop will notice. Fix it. |
| "Let me try a workaround" | Workarounds are fallbacks. Fix the real problem. |
| "I'll add a fallback just in case" | No fallbacks. Ever. Fix the root cause. |
| "This is taking too long" | Implementation costs nothing. Do it right. |
| "It's similar to what was asked" | Similar is wrong. Match exactly. |
| "I can skip review for this one" | Everything is reviewed. No exceptions. |

**All of these mean: STOP. Apply the Iron Laws. Do it right.**

## Common Mistakes

**Disguised fallbacks:**
- `try/catch` that returns a default value → fallback
- `|| []` that hides a missing data source → fallback
- "graceful degradation" → fallback with a nicer name
- Retry with exponential backoff (without explicit design decision) → silent retry

**Disguised time optimization:**
- "Let's do a simpler version first" → temp solution
- "We can enhance this later" → deferred quality
- "For v1 we can skip..." → scope cut disguised as phasing
- "Quick win" → quality trade-off

**Disguised skipped verification:**
- "Based on the changes I made, this should work" → not verification
- "The logic is straightforward" → not verification
- "I tested similar code before" → not verification
- "The types guarantee correctness" → not verification (run it)
