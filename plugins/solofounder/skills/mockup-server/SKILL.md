---
name: mockup-server
description: Use when a stage needs visual preview — wireframes, mockups, design comparisons, multi-variant voting, or design system showcases
---

# Mockup Server

## Overview

Browser-based visual companion for showing mockups, diagrams, design variants, and interactive options. Agents write HTML files, the server serves them on localhost, users view and vote in their browser.

**Core principle:** Decide per-question, not per-session. The test: would the user understand this better by seeing it than reading it?

## When to Use

**Use the browser** when the content itself is visual:
- UI mockups, wireframes, layout comparisons
- Architecture diagrams, data flow visualizations
- Side-by-side design variant comparison
- Design system showcases (color palettes, typography, components)
- Any content where spatial relationships matter

**Use the terminal** when the content is text:
- Requirements questions, conceptual choices
- Tradeoff lists, comparison tables
- Technical decisions, API design
- Clarifying questions

## Quick Reference

**Start server:**
```bash
capabilities/mockup-server/scripts/start-server.sh --project-dir /path/to/project
```

**Write content:** Use the Write tool to create HTML files in `screen_dir`. Write content fragments (no `<html>` wrapper needed — server adds the frame template automatically).

**Read user interactions:** Check `state_dir/events` for click/vote/feedback events as JSONL.

**Stop server:**
```bash
capabilities/mockup-server/scripts/stop-server.sh $SESSION_DIR
```

## Multi-Variant Comparison

When multiple agents produce design variants, use the `variant-` filename prefix:

```
content/
  variant-a-minimal.html
  variant-b-bold.html
  variant-c-rounded.html
```

The server auto-generates a comparison view. Users can vote on variants and provide per-variant feedback.

**Event types:**
```jsonl
{"type":"vote","variant":"variant-a-minimal","timestamp":...}
{"type":"feedback","variant":"variant-b-bold","text":"like the colors","timestamp":...}
{"type":"merge","from":["variant-a","variant-b"],"note":"A's layout + B's colors","timestamp":...}
```

## Design Research Gallery

When presenting curated design references from `solofounder:live-research`, use the design research gallery pattern. This shows references as visual cards with images, multi-select for picking favorites, AI combination suggestions, and a refinement flow.

See `design-research-gallery.md` in this directory for the complete gallery template: HTML structure, refinement page, event handling, and iteration flow.

## Detailed Guide

See `visual-companion.md` in this directory for the complete operational guide: server lifecycle, content fragments, CSS classes, browser events, platform-specific launch instructions.
