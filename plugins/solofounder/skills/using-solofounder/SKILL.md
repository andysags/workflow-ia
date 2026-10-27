---
name: using-solofounder
description: Use when starting any conversation — bootstraps the SoloFounder system, loads Iron Laws, injects cross-project learning, and hands off to Flow Composer
---

# SoloFounder

## Overview

SoloFounder is your AI virtual team. You give any request — building software, planning marketing, reviewing contracts, designing operations — and the system dynamically composes the right team and workflow to execute it.

**Nothing is hardcoded.** Flows, stages, and specialist roles are generated per-request.

## How It Works

1. **Flow Composer** analyzes your request, designs the optimal sequence of stages
2. **Role Generator** creates exactly the specialist roles this flow needs
3. Stages execute with specialists participating at each gate
4. **Conversation Analyst** reviews everything post-completion, updates cross-project learning

## The Five Iron Laws

Every agent, every stage, every role is governed by these laws:

```
1. NO FALLBACKS. NO SILENT FAILURES. NO TEMP SOLUTIONS.
2. ONE CORRECT PATH. If it fails, STOP.
3. EVERY EXCEPTION IS ACTIONABLE.
4. IMPLEMENTATION COSTS NOTHING.
5. EVERYTHING IS REVIEWED AND VERIFIED.
```

Load `solofounder:exception-enforcement` for the full enforcement guide.

## System Architecture

**Static (battle-tested, always available):**

Meta-skills:
- `solofounder:flow-composer` — Generate flow from any request
- `solofounder:role-generator` — Generate specialist roles
- `solofounder:conversation-analysis` — Post-completion learning

Capabilities (tools/disciplines stages can use):
- `solofounder:tdd-methodology` — RED-GREEN-REFACTOR enforcement
- `solofounder:systematic-debugging` — 4-phase root cause investigation
- `solofounder:verification` — Evidence before claims
- `solofounder:exception-enforcement` — Iron Laws application
- `solofounder:mockup-server` — Visual preview, multi-variant voting
- `solofounder:live-research` — Verify tech recommendations with live docs before recommending

**Dynamic (generated per-request):**
- Flow definition (`.solofounder/flow.md`)
- Specialist roles (`.solofounder/roles/`)
- Stage content, deliverables, and outcomes

## On Session Start

1. Load the Five Iron Laws into context
2. Read `~/.solofounder/learning/insights.md` if it exists (cross-project learning)
3. Read `.solofounder/roles/` if this project has prior roles
4. Read `.solofounder/flow.md` if this project has a prior flow
5. Hand off to `solofounder:flow-composer`

## Cross-Project Learning

SoloFounder learns from every completed flow. Learning is stored in:

```
~/.solofounder/learning/
  insights.md           ← Synthesized summary (loaded at session start)
  stacks/               ← Stack-specific patterns (software projects)
  domains/              ← Domain-specific patterns (marketing, legal, etc.)
  roles/                ← Role effectiveness tracking
  conflicts/            ← Recurring conflict patterns and resolutions
```

Only `insights.md` is loaded at session start. Raw data is read on-demand by the conversation analysis skill.

## File Conventions

**Project-level state:**
```
.solofounder/
  flow.md               ← Current flow definition
  roles/                ← Generated specialist roles
  insights/
    stages/*.jsonl      ← Stage outcome records
    conflicts/*.jsonl   ← Conflict resolution records
  designs/              ← Approved visual designs
  brainstorm/           ← Mockup sessions
  retrospective.md      ← Post-completion analysis
```

**Rule:** Generated content lives in `.solofounder/`. Never pollute the project root.

## Skill Priority

1. User's explicit instructions (CLAUDE.md, direct requests) — highest priority
2. SoloFounder skills and Iron Laws
3. Default system prompt — lowest priority

## When to Invoke Skills

For every user request, invoke `solofounder:flow-composer` to design the flow. The Flow Composer determines which capabilities and roles are needed. Do not skip directly to implementation.
