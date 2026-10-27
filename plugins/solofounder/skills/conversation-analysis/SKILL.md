---
name: conversation-analysis
description: Use after every completed flow — analyzes the entire conversation to identify improvements, updates cross-project learning, and generates retrospective
---

# Conversation Analysis

## Overview

The learning engine of SoloFounder. After every completed flow, the Conversation Analyst reviews the entire session — every decision, every exception, every iteration, every surprise — and produces actionable improvements.

**This is not optional.** It runs after every flow. It is the final stage, automatically appended by the Flow Composer.

**Core principle:** The richest data source for improvement is the conversation itself. Metrics capture WHAT happened. Conversation analysis understands WHY.

## When to Use

Always. After every completed flow. The Flow Composer appends a Learn stage to every flow, which invokes this skill.

Do not skip. Do not abbreviate. Do not say "nothing notable happened." Every conversation has learnings.

## The Five Analysis Dimensions

### 1. Wasted Work

- What was produced and then thrown away?
- What questions should have been asked earlier in the flow?
- What information was available but not used?
- What stages had to re-run and why?
- What work was done based on a misunderstanding?

**What to look for:** Deleted deliverables, re-dispatched stages, specialist output that was overridden, user corrections that invalidated prior work.

**Output format:**
```markdown
### Wasted Work
- [Description of wasted work] — **Root cause:** [why it happened] — **Prevention:** [how to avoid next time]
```

### 2. Misalignment

- Where did user and agent mean different things?
- Where did user correct an agent's understanding?
- Were there ambiguous terms that caused confusion?
- How many iterations were needed to reach shared understanding?

**What to look for:** User corrections ("no, I meant..."), terms used differently by user and agent, questions that had to be re-asked with different phrasing.

**Output format:**
```markdown
### Misalignment
- **Term/concept:** [what was ambiguous] — **User meant:** [X] — **Agent interpreted:** [Y] — **Prevention:** [clarification strategy for future]
```

### 3. Exception Archaeology

- For each exception raised during the flow: was the root cause visible earlier?
- Could an earlier stage have prevented it?
- Did a specialist have the information but miss it?
- Was it a knowledge gap (didn't know) or an attention gap (knew but missed)?

**What to look for:** Exceptions where the fix information existed in an earlier stage's input or output. Patterns where certain exception types recur across flows.

**Output format:**
```markdown
### Exception Archaeology
- **Exception:** [what was raised] — **Stage raised:** [N] — **Could have been caught at:** [stage M] — **By:** [which role] — **Gap type:** knowledge | attention — **Prevention:** [what to add to earlier stage or role checklist]
```

### 4. Agent & Role Effectiveness

- Which specialists gave advice that was actually used?
- Which specialists' concerns turned out to be real issues?
- Were specialists specialized enough for this project?
- What domain knowledge was missing from role definitions?
- Which arbitrations happened and could they have been prevented?

**What to look for:** Specialist output that was ignored (low value signal), specialist findings that prevented real problems (high value signal), moments where a specialist lacked specific knowledge, conflicts that the role definitions should have anticipated.

**Output format:**
```markdown
### Role Effectiveness
| Role | Findings | Acted On | Value | Notes |
|------|----------|----------|-------|-------|
| [name] | [count] | [count] | high/moderate/low | [what was missing or exceptional] |
```

### 5. Flow Effectiveness

- Were the right stages in the right order?
- Were any stages unnecessary for this request?
- Were any stages missing that should have been there?
- Did the Flow Composer's design match what actually happened?

**What to look for:** Stages that produced no meaningful output (unnecessary), moments where the user or agent wished for a stage that didn't exist (missing), stages that needed to be reordered during execution (wrong order).

**Output format:**
```markdown
### Flow Effectiveness
- **Unnecessary stages:** [list, or "none"]
- **Missing stages:** [list with what they would have done, or "none"]
- **Reordering needed:** [what should have come before what, or "none"]
- **Flow Composer accuracy:** [how well the generated flow matched the actual need]
```

## Three Outputs

### Output 1: Project Retrospective

Save to `.solofounder/retrospective.md`:

```markdown
# Retrospective: [Request Summary]
Date: [date]

## Flow Summary
- Domain: [domain]
- Stages executed: [N]
- Stages re-run: [N] (reasons: ...)
- Exceptions raised: [N], resolved: [N]
- Conflicts: [N], resolved by arbiter: [N], escalated to user: [N]

## Wasted Work
[findings from dimension 1]

## Misalignment
[findings from dimension 2]

## Exception Archaeology
[findings from dimension 3]

## Role Effectiveness
[findings from dimension 4]

## Flow Effectiveness
[findings from dimension 5]

## Improvements Proposed
[summary of all learning updates below]
```

### Output 2: Learning Updates

Update `~/.solofounder/learning/` files. Create directories if they don't exist.

**Stack-specific patterns** (`~/.solofounder/learning/stacks/[stack-name].md`):

If this was a software project with a detectable tech stack, add patterns learned:
```markdown
# [Stack Name] Patterns

## From [project/request] ([date])
- [Pattern learned: what to do or avoid, with context]
```

Append to existing file if it exists. Each entry should be specific enough that a future role can act on it.

**Domain-specific patterns** (`~/.solofounder/learning/domains/[domain-name].md`):

Add patterns specific to this domain (marketing, legal, etc.):
```markdown
# [Domain] Patterns

## From [project/request] ([date])
- [Pattern learned]
```

**Role effectiveness** (`~/.solofounder/learning/roles/effectiveness.jsonl`):

Append one record per role that participated:
```jsonl
{"role":"[name]","domain":"[domain]","stack":"[stack]","findings":[N],"acted_on":[N],"value":"high|moderate|low","request":"[summary]","date":"[date]"}
```

**Conflict patterns** (`~/.solofounder/learning/conflicts/patterns.jsonl`):

If conflicts occurred, append:
```jsonl
{"between":["role-a","role-b"],"topic":"[what they disagreed on]","resolution":"[how it was resolved]","iterations":[N],"escalated":[boolean],"prevention":"[how to prevent in future]","date":"[date]"}
```

### Output 3: Role Refinements

Update `.solofounder/roles/[role-name].md` for roles that participated in this flow:

- Add new Known Patterns based on what was learned
- Update Review Checklist if exceptions revealed gaps
- Update Exception Criteria if new blocking conditions were discovered

Only update roles where the analysis found specific, actionable improvements. Don't add vague notes.

## Insights Synthesis

After updating raw learning files, regenerate `~/.solofounder/learning/insights.md`. This is the file loaded at every session start — it must be concise and actionable.

**Structure:**

```markdown
# SoloFounder Cross-Project Learning
Last updated: [date]

## Flow Composition Patterns
[What the Flow Composer should know when generating flows]
- [Pattern]: [when it applies]

## Role Patterns
[What the Role Generator should know when creating roles]
- [Pattern]: [when it applies]

## Recurring Issues
[Issues that appeared across multiple projects]
- [Issue]: [how it's been addressed]

## Stack-Specific
[Pointers to detailed stack files]
- [Stack]: see stacks/[name].md ([N] patterns)

## Domain-Specific
[Pointers to detailed domain files]
- [Domain]: see domains/[name].md ([N] patterns)
```

**Keep insights.md under 200 lines.** It's loaded into every session's context. Be concise. Point to detailed files for depth.

## Compound Effect

```
Project 1:  No prior learning. Baseline established.
            Everything is new — more exceptions, more misalignment.

Project 3:  Initial patterns applied. Flow Composer generates
            better flows. Known issues pre-addressed.

Project 5:  System is meaningfully personalized. Roles come
            pre-loaded with stack expertise. Exceptions rare
            because known patterns are addressed in design.

Project 10: Flow Composer rarely needs user adjustment.
            Specialists are deeply knowledgeable about this
            user's tech stack and domain. Learning compounds.
```

## Key Principles

- **Every flow produces learning.** Even "everything went perfectly" is data (confirms current approach works).
- **Learning is specific and actionable.** "Improve error handling" is not learning. "ASP.NET projects: check for missing anti-forgery tokens on POST endpoints" is learning.
- **Insights.md is curated, not dumped.** Keep it concise. Don't append endlessly — synthesize and consolidate.
- **Prevention over detection.** The goal is not to catch issues better, but to prevent them from occurring. Learning should flow backward in the pipeline.
- **Roles get smarter.** Every project refines the roles. Layer 3 (Known Patterns) grows with real, tested knowledge.
