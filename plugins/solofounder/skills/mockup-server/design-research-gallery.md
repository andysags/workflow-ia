# Design Research Gallery Pattern

How to present curated design references to the user using the mockup server. Used during the Design Research stage when `solofounder:live-research` has collected and curated references.

## Gallery Page Template

Write this as a content fragment (no `<html>` wrapper — the server adds the frame template). Use the `.cards` CSS class with `data-multiselect` for multi-selection.

```html
<h2>Design Research: [Category]</h2>
<p class="subtitle">I've curated [N] references from Dribbble, Behance, and competitors. Click the ones that resonate — you can select multiple. My suggestions are at the bottom.</p>

<div class="label">References</div>

<div class="cards" data-multiselect>

  <div class="card" data-choice="ref-1" onclick="toggleSelect(this)">
    <div class="card-image">
      <img src="[IMAGE_URL]" alt="[Design title]"
           style="width:100%; height:100%; object-fit:cover;"
           onerror="this.parentElement.innerHTML='<div style=\'padding:2rem;color:var(--text-tertiary)\'>Image unavailable</div>'">
    </div>
    <div class="card-body">
      <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem; flex-wrap:wrap">
        <span class="tag">[style-tag]</span>
        <span class="tag">[style-tag]</span>
      </div>
      <h3>[Design Title]</h3>
      <p>[AI analysis: what's notable about this design — be specific about color, layout, typography, interaction patterns]</p>
      <p style="font-size:0.75rem; color:var(--text-tertiary); margin-top:0.5rem">[Source] — [Designer/Studio]</p>
    </div>
  </div>

  <!-- Repeat for each curated reference (6-8 total) -->

</div>

<!-- AI Suggestions Section -->
<div style="margin-top:2.5rem; padding:1.5rem; background:var(--bg-secondary); border:1px solid var(--border); border-radius:12px">
  <div class="label">My Suggestions</div>
  <h3>Recommended Direction</h3>
  <p style="color:var(--text-secondary); margin-bottom:1rem">
    Based on the project goals and current design trends, here's what I'd recommend:
  </p>

  <div style="margin-bottom:1rem">
    <strong>Color approach:</strong> [Specific suggestion referencing specific cards, e.g., "The muted earth tones from Reference #3 — they convey trust without being corporate"]
  </div>
  <div style="margin-bottom:1rem">
    <strong>Layout pattern:</strong> [e.g., "The asymmetric grid from Reference #1 — it creates visual interest while keeping content scannable"]
  </div>
  <div style="margin-bottom:1rem">
    <strong>Typography:</strong> [e.g., "The bold sans-serif headings from Reference #5 paired with the readable body text style from Reference #2"]
  </div>
  <div>
    <strong>Overall feel:</strong> [e.g., "Combine #1's spacious layout with #3's warm palette and #5's confident typography for a design that feels premium but approachable"]
  </div>
</div>
```

### Style Tag CSS

Add this inline style block at the top of the gallery page for the tag styling:

```html
<style>
  .tag {
    display: inline-block;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
</style>
```

## Refinement Page Template

After the user selects favorites, present a refinement page showing the synthesis.

```html
<h2>Design Direction: Synthesis</h2>
<p class="subtitle">Based on your selections, here's the design direction I'd propose.</p>

<!-- Show selected references side by side -->
<div class="label">Your Selected References</div>
<div class="split">
  <div class="mockup">
    <div class="mockup-header">Reference #[N] — [Title]</div>
    <div class="mockup-body">
      <img src="[IMAGE_URL]" style="width:100%; border-radius:4px">
      <p style="margin-top:0.75rem; font-size:0.85rem; color:var(--text-secondary)">
        <strong>What I'd take from this:</strong> [specific elements — e.g., "the card-based layout, the generous whitespace between sections, the subtle shadow depth"]
      </p>
    </div>
  </div>
  <div class="mockup">
    <div class="mockup-header">Reference #[N] — [Title]</div>
    <div class="mockup-body">
      <img src="[IMAGE_URL]" style="width:100%; border-radius:4px">
      <p style="margin-top:0.75rem; font-size:0.85rem; color:var(--text-secondary)">
        <strong>What I'd take from this:</strong> [specific elements]
      </p>
    </div>
  </div>
</div>

<!-- Proposed Direction -->
<div style="margin-top:2rem">
  <div class="label">Proposed Design Direction</div>

  <div class="mockup">
    <div class="mockup-header">Color Palette (extracted from references)</div>
    <div class="mockup-body">
      <div class="color-row">
        <div class="color-swatch" style="background:[hex]">[hex]</div>
        <div class="color-swatch" style="background:[hex]">[hex]</div>
        <div class="color-swatch" style="background:[hex]">[hex]</div>
        <div class="color-swatch" style="background:[hex]">[hex]</div>
        <div class="color-swatch" style="background:[hex]">[hex]</div>
      </div>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.75rem">
        [Why this palette — which references it draws from and why these colors work for the project]
      </p>
    </div>
  </div>

  <div class="mockup">
    <div class="mockup-header">Typography Direction</div>
    <div class="mockup-body">
      <div class="type-scale">
        <div class="type-sample">
          <div class="label">Headings</div>
          <div style="font-size:1.5rem; font-weight:700">[Font name] — Bold, confident, [characteristic]</div>
        </div>
        <div class="type-sample">
          <div class="label">Body</div>
          <div style="font-size:1rem">[Font name] — Clean, readable, [characteristic]</div>
        </div>
      </div>
    </div>
  </div>

  <div class="mockup">
    <div class="mockup-header">Layout & Spacing Approach</div>
    <div class="mockup-body">
      <p style="font-size:0.85rem; color:var(--text-secondary)">
        [Describe the layout philosophy — e.g., "Card-based with generous padding (24-32px), asymmetric grids for feature sections, full-bleed hero areas. Inspired by Reference #1's spacious feel combined with Reference #4's content hierarchy."]
      </p>
    </div>
  </div>
</div>

<!-- Confirmation -->
<div style="margin-top:2rem">
  <div class="options">
    <div class="option" data-choice="approve" onclick="toggleSelect(this)">
      <div class="letter">A</div>
      <div class="content">
        <h3>Approve this direction</h3>
        <p>Lock these references and this synthesis as the design contract</p>
      </div>
    </div>
    <div class="option" data-choice="adjust" onclick="toggleSelect(this)">
      <div class="letter">B</div>
      <div class="content">
        <h3>Adjust</h3>
        <p>I like the direction but want to change some elements — I'll explain in the terminal</p>
      </div>
    </div>
    <div class="option" data-choice="research-more" onclick="toggleSelect(this)">
      <div class="letter">C</div>
      <div class="content">
        <h3>Research more</h3>
        <p>I want to see different references — the current ones don't capture what I'm looking for</p>
      </div>
    </div>
  </div>
</div>
```

## Event Handling

### Gallery Page Events

The user can multi-select cards. Events look like:
```jsonl
{"type":"click","choice":"ref-1","text":"Reference card 1","timestamp":...}
{"type":"click","choice":"ref-3","text":"Reference card 3","timestamp":...}
{"type":"click","choice":"ref-5","text":"Reference card 5","timestamp":...}
```

Multiple clicks on the same card toggle selection. The set of unique choices with odd click counts = currently selected.

### Refinement Page Events

```jsonl
{"type":"click","choice":"approve","text":"Approve this direction","timestamp":...}
```

- `approve` → lock direction, save to `.solofounder/design-references/`, proceed
- `adjust` → read terminal feedback, iterate with a new refinement page
- `research-more` → go back to Phase 1, re-search with adjusted criteria

## Key Principles

- **Show, don't describe.** Embed actual design images. Don't describe a design in text when you can show it.
- **Multi-select, not single-select.** Users rarely like ONE reference entirely — they like elements from several. Let them pick multiple and explain what they like about each.
- **AI suggests combinations.** Don't just show references — suggest how to combine elements. "The color palette from #3 with the layout from #1" is actionable direction.
- **Iterate visually.** The refinement page shows the synthesis visually (color swatches, typography samples) — not as a text description. The user should SEE the proposed direction.
- **Capture screenshots for persistence.** After locking, use Playwright to screenshot the approved references so the direction survives even if source URLs go down.
