# SoloFounder — Product Design Spec

## 1. Product Overview

SoloFounder is a skill-based AI virtual team system for solopreneurs. One founder gives any request — building software, planning marketing, reviewing contracts, designing operations — and the system dynamically composes the right team and workflow to execute it.

### How It Works

1. **Flow Composer** analyzes the request, designs the optimal sequence of stages
2. **Role Generator** creates exactly the specialist roles this flow needs
3. Stages execute with specialists participating at each gate
4. **Conversation Analyst** reviews everything post-completion, updates cross-project learning

Nothing is hardcoded except battle-tested disciplines and tools. Flows, stages, roles, and stage content are all generated per-request.

### Target User

Solo founder who runs a full company with AI agents filling specialist roles — architect, designer, security engineer, marketing strategist, contract lawyer, data analyst — whatever the request demands.

### Architecture Approach

Skills (markdown) + capabilities (markdown) + mockup server (Node.js) + file conventions for state. No custom CLI, no custom runtime. The LLM is the orchestrator, the host tool (Claude Code, Cursor, etc.) is the runtime, files on disk are the state.

### Five Iron Laws

Every agent, every stage, every role is governed by these laws. They are enforcement mechanisms with rationalization tables and red flags, not guidelines.

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
   This applies to every output at every level: generated flows,
   generated roles, stage deliverables, tasks within stages,
   conflict resolutions, and the conversation analysis itself.
   No output moves forward unchecked.
```

### Universal Review/Verification Loop

Every output in the system — no matter how meta — passes through the same loop before it's considered done:

```
Output produced
  |
  v
REVIEW
  - Is it correct? (does it match the intent/requirements?)
  - Is it complete? (are there gaps, missing pieces, placeholders?)
  - Is it consistent? (does it contradict other outputs in the flow?)
  |
  v
Review passed? --NO--> fix, re-produce, re-review
  |
  YES
  |
  v
VERIFY
  - Can the output be validated against objective criteria?
  - If code: tests pass, design match confirmed
  - If document: no contradictions, no ambiguity, no gaps
  - If flow/roles: user approves
  - If conflict resolution: both specialists agreed
  - If conversation analysis: insights are actionable, not vague
  |
  v
Verified? --NO--> fix, re-verify
  |
  YES
  |
  v
Done. Proceed.
```

This applies at every level:

| Output | Reviewed By | Verified By |
|---|---|---|
| Generated flow | Flow Composer self-review | User approval |
| Generated roles | Role Generator self-review | User approval |
| Stage deliverable | Specialist agents (parallel) | User approval at gate |
| Conflict resolution | Both specialists | Agreement or user decision |
| Exception fix | Specialist who raised it | Re-run stage |
| Implementation code | Code review specialists | Tests pass + design match |
| Conversation analysis | Self-review (no placeholders, actionable) | Insights written to learning files |
| Learning updates | Cross-reference with existing learning | No contradictions with current state |

**Self-review is not optional.** Before any output is presented for external review (by other agents or the user), the producing agent must self-review against the criteria above. This catches obvious issues before consuming reviewer attention.

**Verification is not "it looks right."** Verification means running an objective check — tests, diff against design, structural validation. "I'm confident it's correct" is not verification. Evidence is verification.

---

## 2. Architecture

Two layers: static (small, battle-tested) and dynamic (generated per-request).

### Static Layer

**Meta-skills** (orchestrate the system):
- `using-solofounder` — Bootstrap: Iron Laws, capability index, learning injection
- `flow-composer` — Analyze any request, generate flow definition
- `role-generator` — Generate specialist roles with domain-specific expertise
- `conversation-analysis` — Post-completion learning engine

**Capabilities** (tools and disciplines stages can use):
- `tdd-methodology` — RED-GREEN-REFACTOR with Iron Laws, anti-rationalization tables
- `systematic-debugging` — 4-phase root cause investigation, defense-in-depth
- `verification` — Evidence before claims, fresh verification before completion assertions
- `exception-enforcement` — Iron Laws application, structured exception format
- `mockup-server` — Visual preview server: multi-variant comparison, voting, design gallery

### Dynamic Layer

Everything the user sees — flows, stages, roles, stage content — is generated per-request:
- Flow definition (stages, order, gates, deliverables)
- Specialist roles (expertise, checklists, exception criteria)
- Stage content (goals, success criteria, capability usage)

### Flow Execution Sequence

```
User request arrives
       |
       v
USING-SOLOFOUNDER (bootstrap, every session)
  - Load Iron Laws into context
  - Read ~/.solofounder/learning/insights.md
  - Read .solofounder/roles/ if project has prior roles
  - Hand off to Flow Composer
       |
       v
FLOW COMPOSER
  - Analyze request (domain, scope, deliverables)
  - Read project context (files, stack, existing work)
  - Read domain learning (if exists)
  - Generate flow: stages, order, gates, capabilities
  - Save to .solofounder/flow.md
  - Present flow to user for approval
  - Hand off to Role Generator
       |
       v
ROLE GENERATOR
  - Read approved flow
  - Detect project profile (if applicable)
  - Read existing .solofounder/roles/ (if returning project)
  - Read stack/domain learning
  - Generate specialist roles for each stage
  - Save to .solofounder/roles/
  - Present team composition to user for approval
       |
       v
STAGE EXECUTION (generated stages, sequential)
  For each stage in flow:
    - Load stage definition + relevant capabilities
    - Dispatch specialist role agents (parallel)
    - Synthesize outputs, flag conflicts
    - If conflict: arbiter resolution (up to 3 iterations, then user)
    - Gate: user approves deliverable or EXCEPTION
    - Record stage outcomes to insights/stages/*.jsonl
    - Transition to next stage
       |
       v
CONVERSATION ANALYSIS (always, after completion)
  - Analyze entire conversation
  - Identify: wasted work, misalignment, escaped defects,
    agent effectiveness, flow effectiveness
  - Update ~/.solofounder/learning/
  - Generate retrospective.md
  - Propose improvements to flow/role definitions
```

---

## 3. Flow Composer

The Flow Composer takes any request and produces a flow definition — the sequence of stages, what each stage does, which capabilities it uses, and what deliverable it produces.

### Flow Definition Format

Generated and saved to `.solofounder/flow.md`:

```markdown
# Flow: [Request Summary]

## Context
- Domain: [e.g., software/marketing/legal/operations]
- Project: [detected project info or "new"]
- Scope: [single deliverable / multi-stage project]

## Stages

### Stage 1: [Name]
- Goal: [What this stage produces]
- Deliverable: [Specific output file/artifact]
- Capabilities: [Which static capabilities this stage uses, if any]
- Specialists: [Which roles participate]
- Gate: [What must be true to proceed]

### Stage 2: [Name]
...

## Exception Handling
- Any stage failure blocks the entire flow
- Exceptions include: what failed, which stage, which role, fix, downstream impact
- No stage proceeds until previous stage's gate is passed
```

### How the Flow Composer Decides

Reads:
1. The user's request
2. Project context (existing files, stack, prior `.solofounder/` state)
3. Domain learning (`~/.solofounder/learning/domains/` if this domain has been seen before)
4. Available capabilities (what tools/disciplines exist in `capabilities/`)

Generates stages by reasoning about:
- What needs to be understood before anything is built (research, brainstorming)
- What needs to be designed before it can be executed (mockups, specs, strategies)
- What needs to be validated before it's finalized (review gates, specialist input)
- What the deliverable is and what steps produce it
- What could go wrong and where specialist review prevents it

### Flow Examples

**Software: "Build a user dashboard with analytics"**

```
Stage 1: Brainstorm — explore requirements, data sources, user needs
         Specialists: Product Analyst, Backend Architect
         Gate: user approves design direction

Stage 2: Wireframe — layout options, multi-variant voting
         Capabilities: mockup-server
         Specialists: UI Designer, Data Visualization Specialist
         Gate: user approves wireframe

Stage 3: Visual Design — polished UI, component library, all states
         Capabilities: mockup-server
         Specialists: UI Designer, UX Reviewer
         Gate: user approves visual design (frozen as contract)

Stage 4: Plan + Review — task decomposition, specialist review
         Capabilities: exception-enforcement
         Specialists: Backend Architect, Security Specialist, Performance Engineer
         Gate: all exceptions resolved, user approves plan

Stage 5: Implement — TDD, code against approved design
         Capabilities: tdd-methodology, systematic-debugging, verification
         Specialists: React/TypeScript Specialist, Node.js Backend Specialist
         Gate: all tests pass, visual match confirmed

Stage 6: Learn — conversation analysis, update learning
```

**Marketing: "Create a content marketing strategy for our B2B SaaS"**

```
Stage 1: Discovery — understand product, market position, competitors
         Specialists: Market Analyst, Competitor Researcher
         Gate: user confirms market understanding

Stage 2: Audience Analysis — define ICPs, pain points, content preferences
         Specialists: Market Analyst, Content Strategist
         Gate: user approves audience definitions

Stage 3: Strategy Document — channels, content pillars, cadence, KPIs
         Specialists: Content Strategist, SEO Specialist, Growth Advisor
         Gate: user approves strategy

Stage 4: Editorial Calendar — 90-day plan with topics, formats, channels
         Specialists: Content Strategist, SEO Specialist
         Gate: user approves calendar

Stage 5: Learn
```

**Legal: "Review this partnership agreement"**

```
Stage 1: Document Analysis — read contract, identify key terms and obligations
         Specialists: Contract Attorney, Business Analyst
         Gate: analysis presented to user

Stage 2: Risk Assessment — flag unfavorable terms, missing protections
         Specialists: Contract Attorney, Risk Analyst
         Gate: user reviews risks

Stage 3: Negotiation Brief — recommended changes, priority, alternative language
         Specialists: Contract Attorney, Negotiation Strategist
         Gate: user approves brief

Stage 4: Learn
```

### Flow Approval Gate

After generating the flow, the Flow Composer presents it to the user for approval. The flow does not execute until approved. If the user wants changes (add a stage, remove a role, reorder), the Flow Composer adjusts and re-presents.

### Returning to an Existing Project

When a project already has `.solofounder/flow.md` and `.solofounder/roles/` from a prior session:

- **New request in same project:** Flow Composer generates a new flow for the new request. Prior roles are available for reuse — the Role Generator loads existing roles from `.solofounder/roles/` and reuses or updates them rather than generating from scratch.
- **Continuing prior work:** If the user's request is to continue a previously started flow, the Flow Composer reads the existing `flow.md`, identifies which stages are complete (via `insights/stages/`), and resumes from the next incomplete stage. No re-generation needed.

---

## 4. Role Generator

Takes the approved flow and creates specialist role definitions — not generic agents, but deeply specialized for this specific project and request.

### Role Definition Format

Each role saved to `.solofounder/roles/[role-name].md`:

```markdown
---
name: [role-name]
domain: [e.g., software/marketing/legal]
stack: [e.g., "C# ASP.NET 10 + EF Core" or "B2B SaaS Content"]
generated: [date]
request: [which request generated this role]
---

# [Role Title]

## Expertise
[What this specialist knows. Specific technologies, methodologies,
frameworks, domain knowledge. NOT generic.]

## Review Checklist
[What this specialist checks for when reviewing deliverables.
Specific to the stack/domain.]

## Exception Criteria
[What this specialist considers a blocking issue.
Specific conditions that halt the pipeline.]

## Known Patterns
[Injected from ~/.solofounder/learning/ if this stack/domain
has been seen before. Empty on first encounter.]
```

### Role Generation: 3-Layer Composition

```
Layer 1: ROLE FOUNDATION
"You are a [specific title]. Your expertise is [domain]."
Core responsibilities, review methodology, output format.

Layer 2: STACK/DOMAIN SPECIALIZATION
"This project uses [specific technologies/context].
 Concerns specific to this stack: [list]
 Patterns to follow: [list]
 Anti-patterns to catch: [list]"

Layer 3: CROSS-PROJECT LEARNING
"From past projects with this stack/domain:
 - [Pattern 1 learned from previous work]
 - [Pattern 2 learned from previous work]
 Pay extra attention to: [recurring issues]"
```

### Role Lifecycle

- **Generated** when a new flow requires a specialist not in `.solofounder/roles/`
- **Reused** when a returning project already has the role defined
- **Refined** by the conversation analysis feedback loop after each completion
- **Learning shared** across projects via `~/.solofounder/learning/` (stack and domain patterns are injected into Layer 3 of future roles)

### Role Approval Gate

After generating roles, the Role Generator presents the team composition to the user. No execution until approved. User can adjust roles or their expertise.

---

## 5. Stage Execution & Exception Handling

### Stage Execution Pattern

Every generated stage executes the same pattern:

```
Stage begins
  |
  v
LOAD CONTEXT
  - Stage definition from flow.md
  - Relevant capabilities (if any)
  - Specialist role definitions for this stage
  - Previous stage's deliverable (input artifact)
  - Iron Laws
  |
  v
DISPATCH SPECIALISTS (parallel)
  Each specialist agent gets:
    - Their role definition
    - The stage goal and deliverable format
    - Input from previous stage
    - Relevant capabilities to apply
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
  - Merge specialist outputs
  - Deduplicate overlapping concerns
  - Flag CONFLICTS (specialist A vs specialist B)
  - Collect all exceptions
  |
  v
Any exceptions? --YES--> HALT, present to user, fix, re-run stage
  |
  NO
  |
  v
Any conflicts? --YES--> ARBITER RESOLUTION (see below)
  |
  NO
  |
  v
CROSS-REVIEW
  - Specialists review the synthesized output (not just their own piece)
  - Does the merged output hold together?
  - Does combining outputs introduce contradictions?
  - Any new exceptions from seeing the full picture?
  |
  v
New exceptions? --YES--> HALT, fix, re-synthesize
  |
  NO
  |
  v
VERIFY
  - Objective validation against stage success criteria
  - If code: tests pass, design match
  - If document: no contradictions, no gaps, no placeholders
  - If design: all states covered, accessibility checked
  |
  v
Verified? --NO--> fix, re-verify
  |
  YES
  |
  v
GATE: Present deliverable to user
  User approves --> record outcomes, next stage
  User requests changes --> iterate within stage
```

### Conflict Resolution

When specialists disagree, an arbiter agent resolves it before involving the user.

**Arbiter generation:** The arbiter is not a standing role. It's generated on-demand by the Role Generator, specialized for the conflict's domain (e.g., Staff Engineer for perf vs security, VP Product for scope vs timeline, General Counsel for legal vs business).

**Resolution process:**

```
Conflict detected
  |
  v
Generate arbiter (specialized for this conflict type)
  |
  v
Iteration 1:
  Arbiter proposes resolution
  Both specialists review
  |
  +--> AGREED --> proceed with resolution
  |
  +--> OBJECTION --> specialist explains why
       Arbiter adjusts proposal
       |
       v
Iteration 2: (same pattern)
  |
  v
Iteration 3: (same pattern)
  |
  v
Still no agreement after 3 iterations:
  ESCALATE TO USER
  - The conflict (what each specialist wants and why)
  - What the arbiter proposed
  - Why they couldn't agree
  - Clear options with trade-offs
  - Arbiter's recommendation
  User decides. Decision is final.
```

**Conflict recording:** Every conflict and resolution is recorded to `.solofounder/insights/conflicts/conflicts.jsonl` for the feedback loop. If the same conflict type recurs across projects, the learning gets injected into future role definitions to prevent the conflict at design stage.

### Exception Format

Every exception follows a structured format:

```markdown
## EXCEPTION — [Stage Name]

**Raised by:** [Specialist role name]
**Severity:** BLOCKING (always — no non-blocking exceptions exist)

**What failed:** [Specific thing that's wrong]
**Where:** [Stage, deliverable, specific section/component]
**Why it blocks:** [What downstream stages can't proceed without this]
**What was attempted:** [What the specialist tried or considered]
**Proposed fix:** [Actionable, specific]
**Impact if not fixed:** [What breaks, what's at risk]
```

There are no severity levels. If a specialist raises it, it blocks. If it's not worth blocking for, the specialist shouldn't raise it.

### Stage Outcome Recording

After each stage completes, outcomes are recorded to `.solofounder/insights/stages/`:

```jsonl
{"stage":"plan-review",
 "specialists":["azure-security","efcore-data","react-frontend"],
 "exceptions_raised":2,
 "exceptions_by_role":{"azure-security":1,"efcore-data":1},
 "conflicts":1,"conflict_resolution":"arbiter-iteration-2",
 "escalated_to_user":false,
 "iterations":1,"user_changes_requested":0,
 "deliverable":".solofounder/plan.md"}
```

---

## 6. Conversation Analysis & Feedback Loop

The learning engine. Runs after every completed flow — no exceptions, not optional, not skippable.

### Five Analysis Dimensions

**1. Wasted Work**
- What was produced and then thrown away?
- What questions should have been asked earlier?
- What information was available but not used?
- What stages had to re-run and why?

**2. Misalignment**
- Where did user and agent mean different things?
- Where did user correct an agent's understanding?
- Were there ambiguous terms that caused confusion?

**3. Exception Archaeology**
- For each exception: was the root cause visible earlier in the flow?
- Could an earlier stage have prevented it?
- Did a specialist have the information but miss it?
- Was it a knowledge gap or an attention gap?

**4. Agent & Role Effectiveness**
- Which specialists gave advice that was actually used?
- Which specialists' concerns turned out to be real?
- Were specialists specialized enough for this project?
- What domain knowledge was missing from role definitions?
- Which arbitrations happened and could they have been prevented?

**5. Flow Effectiveness**
- Were the right stages in the right order?
- Were any stages unnecessary?
- Were any stages missing that should have been there?
- Did the Flow Composer's design match what actually happened?

### Three Outputs

**1. Project retrospective** — `.solofounder/retrospective.md`

Human-readable analysis of what happened, what went well, what to improve.

**2. Learning updates** — `~/.solofounder/learning/`

Structured updates to stack-specific patterns, domain patterns, role effectiveness, and conflict patterns. This is the cross-project knowledge that compounds over time.

**3. Role refinements** — `.solofounder/roles/`

Updates to this project's specialist role definitions based on what was learned.

### Insights Synthesis

The Conversation Analyst maintains `~/.solofounder/learning/insights.md` — a synthesized, curated summary of all cross-project learning. This is the only learning file injected at session start (keeps context small). Raw JSONL data is read on-demand by the analyst, not loaded every session.

Example:

```markdown
# SoloFounder Cross-Project Learning
Last updated: 2026-04-01

## Flow Composition Patterns
- UI projects: add terminology clarification sub-step in brainstorm
- Projects with auth + caching: involve Security from Stage 1
- Small projects (<5 pages): combine Frontend + Designer roles

## Role Patterns
- Azure Security Specialist: consistently high value for ASP.NET projects
- Separate Performance role only for high-concurrency projects
- Arbiter conflicts avg 1.8 iterations to resolve (rarely escalate)

## Recurring Issues
- "missing-error-states" in UI design: added to Designer checklist
- PII in caching: now raised at brainstorm stage
- Ambiguous terminology: terminology step added to brainstorm

## Stack-Specific
- C# ASP.NET: see stacks/csharp-aspnet-efcore.md
- Next.js: see stacks/nextjs-typescript.md
```

### Compound Effect

The system improves with every project. Early projects have more exceptions, conflicts, and misalignment. Later projects benefit from accumulated learning — the Flow Composer generates better flows, the Role Generator creates more knowledgeable specialists, known issues are pre-addressed.

---

## 7. File Structure

### Repository (what ships)

```
solofounder/
  skills/
    using-solofounder/
      SKILL.md
    flow-composer/
      SKILL.md
    role-generator/
      SKILL.md
    conversation-analysis/
      SKILL.md

  capabilities/
    tdd-methodology/
      SKILL.md
    systematic-debugging/
      SKILL.md
      root-cause-tracing.md
    verification/
      SKILL.md
    exception-enforcement/
      SKILL.md
    mockup-server/
      SKILL.md
      visual-companion.md
      scripts/
        server.cjs
        helper.js
        frame-template.html
        start-server.sh
        stop-server.sh

  hooks/
    session-start
    hooks.json
    hooks-cursor.json

  .claude-plugin/
    plugin.json

  .cursor-plugin/
    plugin.json

  tests/

  CLAUDE.md
  README.md
  package.json
```

### Runtime (generated per-project)

```
project/.solofounder/
  flow.md
  roles/
    [role-name].md
  insights/
    stages/*.jsonl
    conflicts/
      conflicts.jsonl
  designs/
  brainstorm/
    [session-id]/
      content/
      state/
  retrospective.md
```

### Cross-Project Learning (user-level)

```
~/.solofounder/
  learning/
    insights.md
    stacks/
      [stack-name].md
    domains/
      [domain-name].md
    roles/
      effectiveness.jsonl
    conflicts/
      patterns.jsonl
```

### Conventions

1. **Skills vs Capabilities:** `skills/` orchestrate (the brain). `capabilities/` are tools and disciplines stages can use (the toolbox). Capability content is injected into specialist context, not invoked directly.

2. **Generated content in `.solofounder/`:** Never pollutes project root. User adds to `.gitignore` or commits for history.

3. **Learning in `~/.solofounder/learning/`:** Survives across projects. Only `insights.md` is injected at session start.

4. **No cold start dependency:** Each flow is self-contained. Roles reference learning if available, work without it.

---

## 8. Mockup Server Extensions

### Core Server

- HTTP + WebSocket server on `localhost:<port>`
- Serves HTML from `content/` directory
- Click-to-select voting, events as JSONL
- CSS framework with options, cards, mockups, split views
- File watching via `fs.watch()`, WebSocket reload
- Zero dependencies (Node.js built-ins only)

**Multi-Variant Comparison:**

When multiple designer agents produce variants, the server auto-generates a comparison page:

```
content/
  variant-a-minimal.html
  variant-b-bold.html
  variant-c-rounded.html
  _compare.html              <-- auto-generated
```

Convention: files prefixed `variant-` trigger comparison mode. The server builds `_compare.html` with tabbed or side-by-side view and per-variant voting.

**Extended Event Types:**

```jsonl
{"type":"vote","variant":"variant-a-minimal","timestamp":...}
{"type":"feedback","variant":"variant-b-bold","text":"like the color palette","timestamp":...}
{"type":"merge","from":["variant-a-minimal","variant-b-bold"],"note":"A's layout + B's colors","timestamp":...}
```

**Design System CSS:**

Additional utility classes for visual design stage:

```css
.color-swatch { ... }
.type-scale { ... }
.spacing-demo { ... }
.component-grid { ... }
.state-row { ... }
.state-label { ... }
```

### Design Principles

Zero dependencies, file watching, WebSocket reload, session directories, platform detection, lifecycle management, start/stop scripts.
