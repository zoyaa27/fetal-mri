# Design Brainstorm — Fetal Brain MRI Biometry Calculator

The tool lives at the intersection of *high-stakes clinical reporting* and
*editorial, teachable statistics* (the Z-Scores primer PDF is written like a
New Yorker explainer). Three distinct stylistic directions below.

<response>
<text>
**Direction A — "Editorial Clinical" (New England Journal × Stripe docs)**

- **Design Movement:** Editorial / scientific-publication aesthetics, echoing
  the educational Z-scores deck. Think NEJM or Nature figures, Stripe-doc
  precision, Linear-grade restraint.
- **Core Principles:** (1) Radical legibility — serif display, generous
  leading; (2) Calm precision — numbers and z-scores treated as typographic
  first-class citizens; (3) Clinical neutrality — no dark mode, no gradients,
  no alarm reds unless clinically warranted; (4) Evidence-first — every
  assertion is next to its source.
- **Color Philosophy:** Off-white paper background (#FBFAF7), ink near-black
  (#14181F), deep scholarly teal (#046C4E) for headings and positive accents,
  muted navy (#1D3557) for data. Clinical state colors used sparingly:
  jade (#046C4E), amber (#B45309), vermilion (#B91C1C) — desaturated so they
  feel like a printed journal rather than a dashboard.
- **Layout Paradigm:** Two-column editorial layout framed by a thin ruled
  border. Sticky top "case bar" with GA. Body uses a 12-column grid but with
  asymmetric column widths (7/5) to emphasize the data-entry column. Marginal
  notes on the right margin for citations — like a medical textbook.
- **Signature Elements:** (1) A hairline 1px rule separating sections,
  reminiscent of a print journal; (2) small-caps section labels
  ("§ Posterior fossa"); (3) a miniature bell-curve glyph next to every
  z-score that fills up to the measured value.
- **Interaction Philosophy:** Inputs behave like writing on paper — focus
  underlines in ink, no heavy shadows. Results appear with a soft fade. Hovers
  reveal marginalia (definition + citation) rather than tooltips that look
  like popovers. The experience should feel like annotating a clinical chart.
- **Animation:** Very restrained. 160 ms fades, 1 ms per character for the
  report-preview typing effect, gentle number transitions using framer-motion's
  spring with low tension.
- **Typography:** Display: "Fraunces" (variable serif, SOFT axis) at 40–64 px
  for h1/h2, tight tracking. Body: "Inter Tight" 15/24. Numerics: "IBM Plex
  Mono" for measurements and z-scores so digits align and feel like lab output.
</text>
<probability>0.08</probability>
</response>

<response>
<text>
**Direction B — "Clinical Instrument" (medical-device console)**

- **Design Movement:** High-contrast data console inspired by Siemens Healthineers
  / Philips viewer workstations, PACS UIs, and Bloomberg terminal density.
- **Core Principles:** (1) Information density without clutter; (2) Predictable
  zones — operator-grade muscle memory; (3) Dark surface preferred to reduce
  glare in reading rooms; (4) Every pixel earns its place.
- **Color Philosophy:** Deep charcoal surface (#0E1116) with layered slate
  panels (#161B22, #1F2630). Primary accent: medical cyan (#22D3EE) for active
  state. Status palette: jade #10B981, amber #F59E0B, coral #F87171 — full
  saturation because it is mission-critical. Sparse use of orange for caution.
- **Layout Paradigm:** Three-zone fixed layout: left command rail (GA, context
  chips), center data grid (parameters as dense rows with inline z-scale bar),
  right live report panel. No scrolling of the shell; only the parameter list
  scrolls internally.
- **Signature Elements:** (1) Horizontal z-scale ribbon per parameter showing
  −3σ…+3σ with a glowing marker at the measured z; (2) status LEDs (1-pixel
  circles) next to each row; (3) monospace numerical readouts reminiscent of
  a ventilator display.
- **Interaction Philosophy:** Keyboard-first. Number entry with auto-advance,
  keyboard shortcuts for "Copy report" and "Clear". Hover reveals an
  instrument-like callout with definition and source.
- **Animation:** Snappy, under 120 ms. A subtle data-flow pulse when values
  change. Z-marker animates along the ribbon with ease-out-cubic. Typing
  transitions in the report are instant.
- **Typography:** Display: "Space Grotesk" 600; Body: "Inter" 14/20; Numerics:
  "JetBrains Mono" — all favoring clarity at small sizes.
</text>
<probability>0.06</probability>
</response>

<response>
<text>
**Direction C — "Field Notebook" (warm, tactile, teaching-hospital feel)**

- **Design Movement:** Hand-crafted scientific notebook, echoing the warm
  editorial tone of the Z-scores primer, with light tactile paper textures
  and annotation-style interactions.
- **Core Principles:** (1) Human warmth without losing clinical rigor; (2)
  An explicitly pedagogical tone — this tool also teaches trainees; (3)
  Layered hierarchy — headline, body, and source visible at a glance;
  (4) Print-inspired accents without skeuomorphism.
- **Color Philosophy:** Parchment cream (#F5EFE4) background, ink navy
  (#102A43) primary text, forest accent (#1B5E3A) for positive / normal,
  ochre (#B97309) for caution, terracotta (#B3462A) for rare. A single deep
  indigo (#2E2B5F) used for interactive elements.
- **Layout Paradigm:** "Open notebook" — left page is the data-entry form,
  right page is the live radiology report. A soft inner shadow in the spine
  between columns hints at paper. At the top, a ribbon holds the GA input
  like a running header. The differential-diagnosis engine appears as a
  "margin note" tab that slides out from the right edge.
- **Signature Elements:** (1) Faint dotted baseline grid behind text for
  notebook feel; (2) citation chips styled like footnote anchors (small
  superscript with a dotted underline); (3) a hand-drawn bell curve sparkline
  next to each parameter row that shades the tail where the z-score lands.
- **Interaction Philosophy:** Clicks feel like writing — inputs have a small
  elastic bounce on focus; hovering a parameter name unfolds a margin card
  with the ISUOG-style definition and primary source.
- **Animation:** Gentle ease-in-out across 220 ms; a subtle "paper rustle"
  translateY on first render of each panel; the report preview "writes itself"
  one sentence at a time.
- **Typography:** Display: "Fraunces" 72/68 for the landing header, "Newsreader"
  600 for section titles. Body: "Source Serif 4" 16/26. Numerics and codes:
  "JetBrains Mono" 14/20. Small-caps via OpenType features for labels.
</text>
<probability>0.09</probability>
</response>

---

## Chosen direction

**Direction A — "Editorial Clinical."** It best matches the tone of the
existing Z-Scores explainer PDF and the design document's insistence on
"clean, high-contrast, medical-grade UI" (§4.3). It also carries the most
credibility for a QI-study artifact that will be reviewed by neuroradiology
faculty: it looks like something that could appear in a journal figure, not
a SaaS dashboard.

Key style rules to enforce across every file:

- Serif display (Fraunces) + sans body (Inter Tight) + monospace for numbers.
- Background #FBFAF7, ink #14181F, primary accent deep teal #046C4E.
- 1 px hairline rules instead of rounded cards wherever possible.
- Small-caps section labels; measured, academic language.
- Citations always shown inline as `[Kyriakopoulou 2017]` chips with tooltips.
- Status palette desaturated; never fully saturated red/amber.
- Motion: 160 ms fades, framer-motion springs with low tension; no bouncing.
