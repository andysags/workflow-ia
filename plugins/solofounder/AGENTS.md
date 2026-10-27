# SoloFounder — Contributor Guidelines

## Project Structure

```
skills/           Meta-skills that orchestrate (the brain)
capabilities/     Battle-tested disciplines and tools (the toolbox)
hooks/            Platform integration (session start context injection)
.claude-plugin/   Claude Code plugin manifest
.cursor-plugin/   Cursor plugin manifest
docs/             Specs and plans
```

## The Five Iron Laws

All contributions must respect:

1. No fallbacks. No silent failures. No temp solutions.
2. One correct path. If it fails, STOP.
3. Every exception is actionable.
4. Implementation costs nothing. Never trade quality for speed.
5. Everything is reviewed and verified.

## Key Decisions

- **Zero dependencies.** No npm packages. Node.js built-ins only for the mockup server.
- **Skills are markdown.** No custom runtime. The LLM is the orchestrator.
- **Dynamic over static.** Flows, stages, and roles are generated per-request, not hardcoded.
- **Capabilities are battle-tested.** TDD, debugging, verification — these are proven and should not be casually modified.
- **`solofounder:` namespace.** All skills and capabilities use the `solofounder:` prefix.
- **Clarify before acting.** Every request starts with clarifying questions (with options and a recommended path) before any flow is designed. Never assume — ask.
- **Unlimited dev resources.** Development time and compute are unlimited. Never trade quality for speed. Only optimize for runtime performance — what end users experience.

## Spec

Full product design: `docs/solofounder/specs/2026-04-01-solofounder-design.md`
