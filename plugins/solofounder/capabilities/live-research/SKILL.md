---
name: live-research
description: Use before recommending any technology, framework, library, API, model version, or pricing — LLM training data is always stale, verify with live documentation before any recommendation
---

# Live Research

## Overview

LLM training data is 1-2 years old. Every technology recommendation based on memory alone is potentially wrong — outdated versions, deprecated APIs, renamed packages, changed pricing, new better alternatives.

**Core principle:** Never recommend a specific version, framework, API, or model from memory. Always verify with live documentation first.

**Violating this rule produces confident, detailed, wrong advice — the most dangerous kind.**

## When to Use

Before ANY output that depends on current state of the world:

- **Framework/library versions** — "Use React Native 0.84" → is 0.76 actually the latest?
- **AI model recommendations** — "Use GPT-4" → is there a newer model? What's the current pricing?
- **API endpoints/syntax** — "Call /v1/completions" → has the API changed?
- **Package names** — "npm install X" → does X still exist? Was it renamed?
- **Pricing/limits** — "The free tier includes..." → has pricing changed?
- **Best practices** — "Use X pattern" → is this still the recommended approach?
- **Platform requirements** — "Requires iOS 16+" → what's the current minimum?
- **Service availability** — "Deploy to X" → is X still available/recommended?
- **UI/UX design** — "Design a dashboard" → what do top-rated current designs look like on Dribbble/Behance? What are current design trends, not 2-year-old patterns from training data?

## The Rule

```
NEVER RECOMMEND FROM MEMORY ALONE.

Before suggesting any technology, version, API, model, or
tool — verify it exists, is current, and works as described
by checking live documentation.

"I'm fairly sure it's version X" is not verification.
"The docs say it's version X" is verification.
```

## How to Verify

Use available research tools in this order of preference:

1. **Official documentation** — fetch the actual docs page (WebFetch/WebSearch)
2. **Package registries** — npm, PyPI, crates.io, pub.dev for current versions
3. **GitHub releases** — check latest release tags
4. **API reference** — verify endpoints, parameters, response formats

## What to Research

When making technology decisions, verify ALL of these:

**Frameworks & Libraries:**
- Current stable version
- Supported platform versions (iOS, Android, Node.js minimum)
- Breaking changes from last major version
- Active maintenance status (last commit, open issues)

**AI Models & APIs:**
- Current model names and IDs
- Pricing per token/request
- Rate limits
- API version and endpoint URLs
- Available features (vision, function calling, etc.)

**Cloud Services:**
- Current pricing tiers
- Free tier limits
- Available regions
- Any recent deprecations

**Dependencies:**
- Current version on package registry
- Peer dependency requirements
- Known vulnerabilities (npm audit, etc.)

**UI/UX & Visual Design:**
Before any design stage (wireframes, visual design, component library), research current design trends and top-rated work in the specific category:

- **Dribbble** — search for the specific app type (e.g., "language learning app", "dashboard design", "onboarding flow"). Study the most liked/viewed shots for current patterns, color trends, layout approaches.
- **Behance** — search for complete case studies in the domain. Behance projects show full design processes, not just final screens — study the thinking behind the design.
- **Apple/Google design guidelines** — verify current Human Interface Guidelines (iOS) and Material Design (Android) recommendations. These update regularly.
- **Competitor apps** — check current versions of competitor apps on App Store / Play Store for their latest design approaches.

This is NOT copying — it's understanding what "good" looks like right now. An LLM generating UI from 2-year-old training data produces outdated design. Current design references show what users expect today.

**Design Research Process:**

Design research is a visual, interactive process — not a text dump. Use the mockup server (`solofounder:mockup-server`) to present findings visually and have a real design conversation with the user.

#### Phase 1: Research & Collect

Search Dribbble, Behance, competitor apps, and Awwwards for 15-20 candidates:

- **Dribbble** — search the specific app type. Collect image URLs, designer names, shot titles.
- **Behance** — search for complete case studies. These show process, not just final screens.
- **Competitors** — screenshot current versions of competing products.
- **Awwwards** — check for award-winning sites in the category.

For each candidate, capture:
- **Image URL** (the actual design shot, not the page URL)
- **Source & designer**
- **What's notable** — specific observations: color approach, layout pattern, typography choice, interaction style
- **Style tags** — categorize: minimal, bold, dark, playful, editorial, typographic, illustrative, etc.

#### Phase 2: Curate

From 15-20 candidates, select 6-8 that represent **different design directions**. Don't pick 6 variations of the same style — pick references that show genuinely different approaches.

Group them by direction:
- e.g., "Clean & Minimal" (2 refs), "Bold & Colorful" (2 refs), "Editorial & Typographic" (2 refs), "Playful & Illustrated" (2 refs)

#### Phase 3: Present Gallery (Mockup Server)

Start the mockup server and present a visual gallery page. Use the design research gallery pattern (see `solofounder:mockup-server` for the template).

**Gallery page must include:**

1. **Visual cards** for each curated reference — showing the actual design image, not a description
2. **AI analysis per card** — 1-2 sentences on what's notable about this specific design
3. **Style tags** on each card — so the user can see patterns across references
4. **Multi-select enabled** — user clicks to select favorites (can select multiple)
5. **AI Suggestions section** at the bottom of the page:
   - "Based on the project direction and what I've seen, here's what I'd recommend..."
   - Suggest specific combinations: "The color palette from Reference #3 with the layout approach from Reference #1"
   - Explain why these elements work together

**Tell the user:**
> "I've researched current designs in [category] and curated 6-8 references showing different directions. Take a look in the browser — click the ones that resonate with you. You can select multiple. I've also included my suggestions for combinations at the bottom."

#### Phase 4: Discuss & Refine

After the user selects favorites and provides feedback:

1. **Read selections** from mockup server events (`$STATE_DIR/events`)
2. **Read terminal feedback** — the user may explain what they like about their choices
3. **Present a refinement page** showing:
   - The selected references side by side (split view)
   - **"What I'd take from each"** — specific design elements to extract from each reference
   - **Proposed design direction** — a synthesis combining the best elements
   - **Mood board** (optional) — color swatches, typography samples, layout pattern pulled from references
4. **Ask for confirmation or adjustments:**
   > "Based on your picks, here's the design direction I'd propose. Does this capture what you're going for, or should I adjust?"

If the user wants changes, iterate:
- Swap out references, re-search specific styles, adjust the synthesis
- Each iteration gets a new page (never reuse filenames)

#### Phase 5: Lock Direction

Once the user approves:

1. **Save to `.solofounder/design-references/`:**
   ```
   .solofounder/design-references/
     references.md            ← curated list with URLs, notes, and user selections
     direction.md             ← approved design direction synthesis
     inspiration/             ← saved screenshots for offline reference (use Playwright)
   ```
2. **Lock references** — the selected references and direction become the design contract
3. **All subsequent design stages** receive the approved references and direction in their context

**References are saved and persist.** Every design specialist gets the approved references in their context. This ensures visual consistency across stages and sessions.

#### Capturing Screenshots for Persistence

Design URLs can change or go down. After locking direction, use Playwright to capture screenshots of the approved references:

```
Save screenshots to: .solofounder/design-references/inspiration/
  reference-1-[short-name].png
  reference-2-[short-name].png
  ...
```

This ensures the design direction survives even if source URLs become unavailable.

**Brand Book Generation:**

For new projects without existing brand identity, the Flow Composer should include a **Brand Book** stage before visual design. This stage produces:

```
.solofounder/brand/
  brand-book.md              ← Complete brand guidelines
```

**Brand book contents:**
- **Brand personality** — tone, voice, values (playful vs serious, minimal vs rich)
- **Color palette** — primary, secondary, accent, semantic (success/warning/error), with exact hex values. Derived from design references + user preferences.
- **Typography** — font families (heading, body, mono), size scale, weights. Verified with live research for availability (Google Fonts, system fonts, licensing).
- **Spacing & layout** — spacing scale, border radii, grid system, breakpoints
- **Iconography** — icon style (outlined/filled/duotone), icon library (verified current version)
- **Photography/illustration style** — if applicable, style direction for images
- **Component patterns** — button styles, card styles, input styles, navigation patterns
- **Motion & animation** — animation philosophy (subtle vs expressive), timing curves
- **Do's and Don'ts** — explicit examples of on-brand vs off-brand choices

**The brand book is a contract** — same as an approved visual design. All design and implementation must follow it. If a specialist produces UI that contradicts the brand book, that's an EXCEPTION.

**When to generate a brand book:**
- **New project, no existing brand** → always generate one
- **Existing project with established brand** → read existing styles, document them as a brand book for consistency
- **Existing project with brand book** → load it, follow it

## Red Flags — STOP

| Thought | Reality |
|---------|---------|
| "I'm pretty sure the latest version is X" | You don't know. Check. |
| "This API endpoint should work" | APIs change. Verify with current docs. |
| "The pricing is roughly $X" | Pricing changes. Check the pricing page. |
| "This framework supports Y" | Support changes between versions. Verify. |
| "Everyone uses X for this" | X might have been replaced by Y. Research. |
| "I remember this from my training" | Training data is stale. Verify. |

## Integration with Flow Composer

The Flow Composer should mark stages where live research is required:

- **Architecture stages** — ALWAYS require live research before recommending stack
- **Design stages** — ALWAYS require design research (Dribbble/Behance/competitors) before wireframing or visual design. Include a Brand Book stage for new projects.
- **Implementation stages** — verify dependency versions before writing package.json/Gemfile/etc.
- **AI integration stages** — verify model names, pricing, API syntax before designing prompts

Specialist roles generated by the Role Generator should include "verify with live docs" in their review checklists for any technology-specific items.

## Output Format

When presenting researched information, cite the source:

```
React Native current stable: 0.84.1
Source: https://reactnative.dev/blog (verified live)

Claude API current models: claude-opus-4-6, claude-sonnet-4-6
Source: https://docs.anthropic.com/en/docs/models (verified live)
```

Never present technology recommendations without a source. If you cannot verify live, state explicitly: "I could not verify this with live documentation — this is from training data and may be outdated."
