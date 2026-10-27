# Stage Execution

How the Flow Composer executes each stage in an approved flow. This pattern applies to every stage regardless of domain.

## Artifact Registry

Every completed stage registers its artifacts in `.solofounder/artifacts.md`. This file is the single source of truth for what has been produced and where it lives. In long sessions, this prevents context drift — any specialist or stage can check the registry to know what exists.

**Format:**
```markdown
# Artifact Registry

## Stage 1: [Name] — completed [date]
- **[Artifact Name]** → `[file path]` — [one-line status: complete / partial / superseded]

## Stage 2: [Name] — completed [date]
- **[Artifact Name]** → `[file path]` — [status]
```

The registry is updated at the end of every stage (in the "Record Stage Outcomes" step). It is loaded at the start of every stage as part of LOAD CONTEXT.

## Execution Pattern

```
Stage begins
  |
  v
LOAD CONTEXT
  - Stage definition from .solofounder/flow.md (including artifact specs and completion checklist)
  - Artifact registry from .solofounder/artifacts.md (what prior stages produced)
  - Input artifacts (read the actual files listed in stage's "Inputs" field)
  - Relevant capability SKILL.md content (if stage uses capabilities)
  - Specialist role definitions from .solofounder/roles/
  - Iron Laws from solofounder:exception-enforcement
  |
  v
DISPATCH SPECIALISTS (parallel via Agent tool)
  Each specialist agent gets:
    - Their role definition (from .solofounder/roles/[name].md)
    - The stage goal and deliverable format
    - Input from previous stage
    - Relevant capability content to apply
    - Iron Laws
  Each produces: output (self-reviewed) + exceptions (if any)
  |
  v
SELF-REVIEW (each specialist, before returning output)
  - Is my output correct and complete?
  - Does it match the stage goal?
  - Are there gaps or placeholders?
  - Does it contradict other inputs?
  - If not satisfied: fix and re-review before returning
  |
  v
SYNTHESIZE
  - Merge specialist outputs into unified stage deliverable
  - Deduplicate overlapping concerns
  - Flag CONFLICTS (specialist A disagrees with specialist B)
  - Collect all exceptions
  |
  v
Any exceptions? --YES--> HALT (see Exception Handling below)
  |
  NO
  |
  v
Any conflicts? --YES--> ARBITER RESOLUTION (see Conflict Resolution below)
  |
  NO
  |
  v
CROSS-REVIEW
  - Dispatch specialists again to review the SYNTHESIZED output
  - Does the merged deliverable hold together?
  - Does combining outputs introduce contradictions?
  - Any new exceptions from seeing the full picture?
  |
  v
New exceptions? --YES--> HALT, fix, re-synthesize
  |
  NO
  |
  v
VERIFY (against artifact specs + completion checklist)
  - Check each artifact against its definition from flow.md:
    - Does it have all required sections?
    - Does it satisfy its "complete when" criteria?
    - Is it written to the correct file path?
  - Walk the completion checklist item by item — each must be independently verified
  - Domain-specific checks still apply:
    - If code: tests pass, design match confirmed
    - If document: no contradictions, no gaps, no placeholders
    - If design: all states covered, accessibility checked
  - "I'm confident it's correct" is NOT verification
  |
  v
Verified? --NO--> fix, re-verify
  |
  YES
  |
  v
GATE: Present deliverable to user
  User approves --> record outcomes, transition to next stage
  User requests changes --> iterate within stage (re-dispatch or refine)
```

## Dispatching Specialists

Use the Agent tool to dispatch each specialist in parallel. Each agent gets a self-contained prompt:

```
Agent tool:
  description: "[Stage name] - [Specialist role name]"
  prompt: |
    You are a [Role Title] working on Stage N: [Stage Name].

    ## Your Role
    [Full content of .solofounder/roles/[name].md]

    ## Stage Goal
    [Goal from flow.md]

    ## Artifact Specs
    [Artifact definitions from flow.md — name, file path, format, required sections, "complete when" criteria]
    These specs are your contract. Your output must satisfy them.

    ## Completion Checklist
    [The stage's completion checklist from flow.md]
    Your output must help satisfy these items. Flag any items you cannot satisfy with a reason.

    ## Inputs (from previous stages)
    [Actual content of input artifacts — read the files, don't just list paths]

    ## Artifact Registry (what exists so far)
    [Content of .solofounder/artifacts.md — so you know the full context of prior work]

    ## Capabilities
    [Content of any capability SKILL.md this stage uses]

    ## Iron Laws
    [Content of solofounder:exception-enforcement]

    ## Your Job
    1. Produce your output addressing the stage goal from your specialist perspective
    2. Check your output against the artifact specs — does it have all required sections? Does it satisfy "complete when"?
    3. Self-review before returning (is it correct, complete, consistent?)
    4. If you find issues that block the stage, raise an EXCEPTION (see Iron Laws)
    5. Return your output + any exceptions

    Report format:
    - Output: [your deliverable, structured per artifact specs]
    - Checklist status: [which completion checklist items your output satisfies]
    - Exceptions: [list, or "none"]
    - Concerns: [anything worth flagging but not blocking]
```

## Synthesis

After all specialists return, the Flow Composer:

1. **Merges outputs** into a unified stage deliverable
2. **Deduplicates** overlapping points (e.g., two specialists both flagging the same issue)
3. **Flags conflicts** where specialists disagree (Specialist A recommends X, Specialist B recommends Y)
4. **Collects exceptions** from all specialists into a single list

## Exception Handling

When any specialist raises an exception:

1. **HALT** — do not proceed to the next step
2. **Present to user** with full context:
   - What failed (from the exception)
   - Which specialist raised it
   - Proposed fix
   - What's blocked downstream
3. **Fix** — either the user provides direction or the specialist is re-dispatched with corrected input
4. **Re-run** — re-dispatch affected specialists, re-synthesize

## Conflict Resolution

When specialists disagree, an arbiter resolves it before involving the user.

### Process

```
Conflict detected between Specialist A and Specialist B
  |
  v
Invoke solofounder:role-generator to generate arbiter
  (specialized for THIS conflict's domain)
  |
  v
ITERATION 1:
  Arbiter reviews both positions
  Arbiter proposes resolution
  Both specialists review the proposal
  |
  +--> AGREED --> proceed with resolution
  |
  +--> OBJECTION --> specialist explains why it doesn't work
       |
       v
ITERATION 2:
  Arbiter adjusts proposal based on objection
  Both specialists review again
  |
  +--> AGREED --> proceed
  +--> OBJECTION --> iteration 3
       |
       v
ITERATION 3: (same pattern)
  |
  v
Still no agreement after 3 iterations:
  ESCALATE TO USER
  Present:
    - The conflict (what each specialist wants and why)
    - What the arbiter proposed across 3 iterations
    - Why they couldn't agree
    - Clear options with trade-offs
    - Arbiter's recommendation
  User decides. Decision is final.
```

### Arbiter Prompt

```
Agent tool:
  description: "Arbiter for [conflict topic]"
  prompt: |
    You are a [domain-appropriate title] arbitrating a conflict.

    ## The Conflict
    **Specialist A ([role]):** [their position and reasoning]
    **Specialist B ([role]):** [their position and reasoning]

    ## Context
    [Stage goal, project context, relevant constraints]

    ## Your Job
    1. Understand both positions fully
    2. Propose a resolution that satisfies the core concerns of BOTH specialists
    3. If one position is clearly correct, explain why to the other
    4. Your proposal must be specific and actionable, not a vague compromise

    ## Iron Laws Apply
    - No fallbacks or workarounds
    - No "do both" unless it genuinely makes sense
    - No splitting the difference without technical justification
```

## Cross-Review

After synthesis (and conflict resolution if needed), dispatch specialists again to review the MERGED output:

```
Agent tool:
  description: "Cross-review - [Specialist role name]"
  prompt: |
    You previously contributed to Stage N: [Stage Name].

    The synthesized output combining all specialist contributions is below.
    Review it as a whole — not just your piece.

    ## Synthesized Deliverable
    [The merged output]

    ## Check for:
    - Does the merged output hold together as a whole?
    - Does combining contributions introduce contradictions?
    - Are there gaps that fall between specialist areas?
    - Any new exceptions from seeing the full picture?

    Report: APPROVED or EXCEPTION (with details)
```

## Verification

Before presenting to the user, verify against the stage's gate criteria:

- **If code:** Run tests. Compare against design. Check all edge cases handled.
- **If document:** Scan for contradictions, gaps, placeholders. Check internal consistency.
- **If design:** Verify all states designed (empty, loading, error, success). Check accessibility.
- **If strategy:** Check all requirements from brainstorm addressed. Check actionability.

**"I'm confident it's correct" is NOT verification.** Verification means running an objective check.

## Recording Stage Outcomes

After each stage completes, do two things:

### 1. Update Artifact Registry

Append to `.solofounder/artifacts.md`:

```markdown
## Stage N: [Name] — completed [date]
- **[Artifact Name]** → `[file path]` — complete
```

This keeps the registry current. Every subsequent stage loads this file to know what's available.

### 2. Record Stage Metrics

Record to `.solofounder/insights/stages/[stage-name].jsonl`:

```jsonl
{"stage":"[name]",
 "specialists":["role-a","role-b"],
 "artifacts_produced":["path-a","path-b"],
 "completion_checklist_items":[total],
 "checklist_passed_first_try":[number that passed without iteration],
 "exceptions_raised":[number],
 "exceptions_by_role":{"role-a":[n],"role-b":[n]},
 "conflicts":[number],
 "conflict_resolution":"[arbiter-iteration-N | escalated-to-user | none]",
 "escalated_to_user":[boolean],
 "iterations":[number of stage iterations],
 "user_changes_requested":[number]}
```

## Transitioning to Next Stage

After the gate passes:
1. Record stage outcomes
2. Load next stage definition from flow.md
3. Use current stage's deliverable as input for next stage
4. Repeat the execution pattern

After the last stage (before Learn):
1. Invoke `solofounder:conversation-analysis` for the Learn stage
2. Flow is complete
