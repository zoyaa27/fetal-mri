# Fetal Brain MRI Biometry Calculator — Technical Specification

---

## Table of Contents

1. [Overview](#1-overview)
2. [Biometric Parameters](#2-biometric-parameters)
3. [Normative Reference Data](#3-normative-reference-data)
4. [Mathematical Model](#4-mathematical-model)
5. [System Architecture](#5-system-architecture)
6. [UI/UX Specification](#6-uiux-specification)
7. [Differential Diagnosis Engine](#7-differential-diagnosis-engine)
8. [GenAI Report Generation Module](#8-genai-report-generation-module)
9. [Integration & Workflow](#9-integration--workflow)
10. [Security & Compliance](#10-security--compliance)
11. [Validation Strategy](#11-validation-strategy)
12. [QI Study Protocol](#12-qi-study-protocol)
13. [Future Work (Phase 2)](#13-future-work-phase-2)
14. [References](#14-references)

---

## 1. Overview

A web-based, offline-capable fetal brain MRI biometry calculator for radiologists. Radiologists manually enter linear measurements (mm); the system computes z-scores and percentiles against gestational-age-matched normative curves, generates structured report text, and surfaces evidence-based differential diagnoses when values cross predefined thresholds.

**Modeled after:** TI-RADS calculator (Ng et al. 2022 [1]) — the same workflow-integration and pre/post QI study design.

**Gap addressed:** No publicly available, browser-based tool aggregates multiple peer-reviewed fetal brain MRI normative datasets, computes z-scores/percentiles, and outputs structured report text ready for PACS/EHR paste-in.

---

## 2. Biometric Parameters

The calculator supports **15 parameters** (13 core + 2 Chiari II posterior-fossa parameters added in Phase 1 per Section 6.5).

### 2.1 Core Parameters (13)

| Group | Parameter | Abbreviation | Unit |
|---|---|---|---|
| Global Brain / Skull | Skull biparietal diameter | Skull BPD | mm |
| Global Brain / Skull | Skull occipito-frontal diameter | Skull OFD | mm |
| Global Brain / Skull | Brain biparietal diameter | Brain BPD | mm |
| Global Brain / Skull | Brain occipito-frontal diameter | Brain OFD | mm |
| Ventricular System | Left atrial (ventricular) diameter | Atrial L | mm |
| Ventricular System | Right atrial (ventricular) diameter | Atrial R | mm |
| Ventricular System | Third ventricle width | 3V | mm |
| Midline Structures | Corpus callosum length | CC length | mm |
| Midline Structures | Cavum septum pellucidum width | CSP | mm |
| Posterior Fossa | Transcerebellar diameter | TCD | mm |
| Posterior Fossa | Vermian height (cranio-caudal) | Vermis CC | mm |
| Posterior Fossa | Vermian antero-posterior diameter | Vermis AP | mm |
| Brainstem | Pons antero-posterior diameter | Pons AP | mm |

### 2.2 Chiari II / Posterior Fossa Parameters (Phase 1 addition)

| Parameter | Abbreviation | Unit | Validated GA range |
|---|---|---|---|
| Maximum transverse diameter of posterior fossa | TDPF | mm | 21–37 weeks |
| Clivus-supraocciput angle | CSA | degrees | 21–37 weeks |

Values outside the validated GA range shall be flagged **"Extrapolated"** in the parameter row.

### 2.3 Derived / Audit-Recommended Parameters (Phase 1 UI addition)

Per the differential diagnosis coverage audit (Section 4.7 of the design doc), the following additional input fields shall be included:

- **Cisterna Magna Depth** (mm) — triggers mega cisterna magna / Blake's pouch / arachnoid cyst differential when >10 mm
- **Tegmento-Vermian Angle** (degrees) — triggers Dandy-Walker spectrum differential when >23° at mid-gestation

---

## 3. Normative Reference Data

### 3.1 Primary Sources by Parameter

| Parameter | Default Source | Data Format |
|---|---|---|
| Skull BPD, Skull OFD | Tilea et al. 2009 [7] | Full regression equations (mean + SD) in paper appendix |
| Brain BPD, Brain OFD, TCD | Kyriakopoulou et al. 2017 [3] | Centile tables (5th, 50th, 95th) in supplementary materials |
| Atrial diameter (L & R) | Luis et al. 2025 [2] | Quadratic polynomial formulas; open-source repository |
| Corpus callosum length | Corroenne et al. 2023 [8] | Systematic review; per-paper regression models |
| CSP width | Kertes et al. 2021 [9] | Regression equations + raw scatter data |
| Vermis CC, Vermis AP, Pons AP | Vatansever et al. 2013 [10] | Regression equations for mean + SD |
| Pons AP (primary) | Dovjak et al. 2021 [11] | Centile tables + regression models in supplementary data |
| Third ventricle width | Birnbaum et al. 2018 | Normative data from 3D transvaginal neurosonography study |
| TDPF, CSA | Woitek et al. 2014 [43] | OLS-fitted quadratic mean / linear SD (coefficients below) |

### 3.2 Woitek 2014 Normative Table (TDPF & CSA, controls, n=44)

| GA (wks) | n | TDPF mean (mm) | TDPF SD (mm) | CSA mean (°) | CSA SD (°) |
|---|---|---|---|---|---|
| 21 | 3 | 20.5 | 1.9 | 73.7 | 5.5 |
| 22 | 4 | 23.4 | 2.1 | 75.5 | 6.3 |
| 23 | 4 | 25.6 | 2.5 | 77.2 | 5.8 |
| 24 | 4 | 27.2 | 2.0 | 78.0 | 6.7 |
| 25 | 5 | 28.7 | 2.2 | 78.6 | 5.5 |
| 26 | 4 | 30.0 | 1.5 | 79.6 | 6.6 |
| 27 | 3 | 31.4 | 1.8 | 79.9 | 7.4 |
| 28 | 3 | 32.4 | 2.4 | 80.4 | 6.8 |
| 29 | 2 | 33.6 | 1.5 | 80.0 | 7.0 |
| 30 | 2 | 34.5 | 2.0 | 80.2 | 5.5 |
| 31 | 1 | 35.7 | — | 80.0 | — |
| 32 | 2 | 36.8 | 1.5 | 78.5 | 5.0 |
| 33 | 1 | 37.4 | — | 78.0 | — |
| 34 | 2 | 38.2 | 2.5 | 77.5 | 6.0 |
| 35 | 1 | 39.0 | — | 77.0 | — |
| 36 | 1 | 39.8 | — | 76.5 | — |
| 37 | 2 | 40.5 | 2.5 | 76.0 | 6.0 |

---

## 4. Mathematical Model

### 4.1 Z-Score Formula

```
Z = (x − μ(GA)) / σ(GA)
```

where `x` is the user's measurement in mm (or degrees), `μ(GA)` is the expected mean, and `σ(GA)` is the standard deviation, both as a function of gestational age in weeks.

Percentile = Φ(Z) × 100, where Φ is the standard-normal CDF (`scipy.stats.norm.cdf`).

### 4.2 Regression Equation Method (Primary)

For sources that publish polynomial regression formulas (Tilea [7], Vatansever [10], Kertes [9]), encode the coefficients directly and compute μ and σ analytically:

```python
mu = a0 + a1*GA + a2*GA**2  # quadratic example
sd = b0 + b1*GA              # linear SD
```

### 4.3 Centile Table Interpolation Method (Fallback)

For sources that publish only centile tables (Kyriakopoulou [3], Dovjak [11]):

1. Store weekly 5th, 50th, and 95th centile values as static JSON reference data.
2. Apply **monotone cubic spline interpolation** (`scipy.interpolate.PchipInterpolator`) to the `ga_weeks` and `centile_50` arrays to estimate μ at any fractional GA.
3. Recover σ as the average of the two implied SDs:
   - `σ_upper = (centile_95 − centile_50) / 1.645`
   - `σ_lower = (centile_50 − centile_05) / 1.645`
   - `σ = (σ_upper + σ_lower) / 2`

### 4.4 Static Reference Data Schema

```json
{
  "parameter_id": "brain_bpd",
  "source": "Kyriakopoulou 2017",
  "data": [
    {"ga_weeks": 20, "centile_5": 41.2, "centile_50": 45.1, "centile_95": 49.0},
    {"ga_weeks": 21, "centile_5": 44.5, "centile_50": 48.6, "centile_95": 52.7}
  ]
}
```

### 4.5 Woitek 2014 Fitted Coefficients (TDPF & CSA)

**TDPF:**
```
μ(GA) = −0.01307·GA² + 2.55571·GA − 21.71   [mm]
σ(GA) = 0.06716·GA + 0.547                   [mm]
RMSE vs. published per-week means: 0.6 mm
```

**CSA:**
```
μ(GA) = −0.04767·GA² + 4.20404·GA + 1.73    [degrees]
σ(GA) = 0.01814·GA + 5.821                   [degrees]
RMSE vs. published per-week means: 2.1°
```

### 4.6 Worked Example (TDPF + CSA at GA = 24w 0d)

- Input: TDPF = 24.0 mm, CSA = 55.0°, GA = 24 weeks
- μ_TDPF = −0.01307×576 + 2.55571×24 − 21.71 = **32.21 mm** → Z_TDPF = (24.0 − 32.21) / 2.16 = **−3.80** (<5th %ile)
- μ_CSA = −0.04767×576 + 4.20404×24 + 1.73 = **75.23°** → Z_CSA = (55.0 − 75.23) / 6.26 = **−3.23** (<5th %ile)
- Both severely below normal → triggers Chiari II / ONTD differential card.

### 4.7 Mahalanobis Discriminator (Chiari II Joint Test)

Combines Z_TDPF and Z_CSA into a Mahalanobis distance from three group centroids:

```
D²_group = (z − μ_group)ᵀ · Σ_group⁻¹ · (z − μ_group)
p_group = exp(−D²_group / 2) / Σ exp(−D²_group / 2)
```

**Group centroids (Woitek 2014):**

| Group | μ_zTDPF | μ_zCSA | σ_zTDPF | σ_zCSA | n |
|---|---|---|---|---|---|
| Controls | 0.0 | 0.0 | 1.0 | 1.0 | 44 |
| Open NTD (ONTD) | −3.6 | −2.6 | 0.9 | 1.1 | 44 |
| Closed NTD (CNTD) | −1.4 | −0.6 | 1.0 | 1.0 | 13 |

Covariance between Z_TDPF and Z_CSA in ONTD group ≈ +0.54 (r ≈ 0.5).

**Trigger condition:** Z_TDPF < −2.0 AND Z_CSA < −2.0 AND p_ONTD > 0.5

**Published discriminator performance (Woitek 2014):** ~91% sensitivity, ~93% specificity for ONTD vs. controls.

---

## 5. System Architecture

### 5.1 Stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI (Python 3.11+) |
| Frontend rendering | Jinja2 templates + HTMX (dynamic updates, no heavy JS build) |
| Styling | Tailwind CSS (CDN or bundled) |
| Math | `numpy` (polynomial evaluation), `scipy.interpolate.PchipInterpolator` (splines), `scipy.stats.norm` (CDF lookups) |
| AI inference (optional) | `llama.cpp` (local) or cloud API (see Section 8) |
| RAG vector store | Embedded vector DB pre-loaded with ~36 peer-reviewed papers + ISUOG/ESPR guidelines |
| PubMed fallback | `Bio.Entrez` (Biopython) |

### 5.2 Deployment

- **Primary:** Standalone executable via **PyInstaller** — runs on any clinical workstation, no internet required.
- **Alternative:** Lightweight **Docker container** for networked deployments.
- **Design constraint:** Entirely client-side / locally executed. No PHI transmitted to any remote server.

### 5.3 Gestational Age Input

- Weeks dropdown: **18–40**
- Days dropdown: **0–6**
- Internal representation: fractional weeks (e.g., 24w 3d → 24.429)

---

## 6. UI/UX Specification

### 6.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR (sticky): GA input | Sample buttons | Clear | Copy │
├─────────────────────────────────────────────────────────────┤
│  CONTEXT PANEL (collapsible):                               │
│    Field Strength | Motion Severity | Reference Chart Set   │
├──────────────────────────┬──────────────────────────────────┤
│  LEFT: DATA ENTRY        │  RIGHT: REPORT PREVIEW           │
│  13+ parameter rows      │  Live-updating structured text   │
│  [Parameter] [mm input]  │  PowerScribe-ready               │
│  Z: x.xx | xx %ile       │                                  │
│  [distribution marker]   │  [Copy to Clipboard button]      │
└──────────────────────────┴──────────────────────────────────┘
```

### 6.2 Parameter Row Behavior

Each parameter row contains:
- Parameter name + info icon (hover → tooltip)
- Numeric input field (mm or degrees)
- Dynamic output: `Z: [value], [value]th %ile`
- Mini distribution curve with marker showing where the value falls
- Color coding: **green** (normal), **yellow** (borderline, 5th–10th or 90th–95th %ile), **red** (abnormal, <5th or >95th %ile)

### 6.3 Parameter Grouping (tab or section headers)

1. Global Brain / Skull
2. Ventricular System
3. Midline Structures
4. Posterior Fossa
5. Brainstem

### 6.4 Report Preview (right panel)

- Updates in real time as values are entered
- Format: plain text with clear line breaks (PowerScribe-compatible)
- Example line: `Skull BPD: 62 mm (Z: +0.5, 69th percentile)`
- Sections: TECHNIQUE · FINDINGS (by group) · IMPRESSION
- Abnormal values flagged with "— narrowly/markedly deviated from expected mean"

### 6.5 Action Buttons

| Button | Behavior |
|---|---|
| Copy to Clipboard | Copies plain-text report; user pastes into PowerScribe |
| Clear All | Resets all inputs and outputs |
| Sample: Normal | Pre-fills a representative normal case |
| Sample: Flagged | Pre-fills a case with 2+ abnormal values |
| Methodology | Opens/links reference source attribution panel |

### 6.6 Tooltip Content

Each parameter has a hover tooltip with: **Definition**, **How to Measure**, **Clinical Significance**, **Primary Source**, **Secondary Source**.

See design doc Section 4.5 for the full validated text for all 13+ parameters.

---

## 7. Differential Diagnosis Engine

When a measurement crosses a predefined threshold, the UI renders a differential diagnosis card in the right panel (below the report preview or in a dedicated drawer). Each card contains: trigger condition, clinical summary, ranked diagnosis table with estimated likelihoods and evidence-based rationales, recommended next steps, and limitations.

### 7.1 Trigger Summary

| # | Trigger | Key threshold |
|---|---|---|
| 1 | Mild–moderate ventriculomegaly | Atrial diameter ≥10 mm and <15 mm |
| 2 | Severe ventriculomegaly | Atrial diameter ≥15 mm |
| 3 | Ventricular asymmetry | R vs L difference >2 mm |
| 4 | Cerebellar hypoplasia | TCD <5th %ile for GA |
| 5 | Vermian hypoplasia / Dandy-Walker | Vermis CC or AP <5th %ile |
| 6 | Fetal microcephaly | Skull BPD and HC <3rd %ile |
| 7 | Fetal macrocephaly | Skull BPD and HC >97th %ile |
| 8 | Brain volume loss / atrophy | Brain BPD/OFD discordant from skull BPD/OFD |
| 9 | Absent CSP | CSP width absent or <1 mm |
| 10 | Enlarged / cystic CSP | CSP width >10 mm |
| 11 | ACC / dysgenesis | Corpus callosum <5th %ile or not visualized |
| 12 | Pontocerebellar hypoplasia | Pons AP <5th %ile |
| 13 | Third ventricle dilatation | Third ventricle width >3.5 mm |
| 14 | Chiari II / ONTD | Z_TDPF < −2.0 AND Z_CSA < −2.0 AND p_ONTD > 0.5 |
| 15 | Mega cisterna magna / Blake's pouch | Cisterna magna depth >10 mm |

### 7.2 Audit-Identified Coverage Gaps (Phase 1 additions)

- **Rhombencephalosynapsis:** TCD <5th %ile + absent primary fissure (qualitative flag)
- **Colpocephaly:** Atrial diameter >10 mm with normal frontal horns (derived trigger)
- **TVA abnormality:** Tegmento-vermian angle >23° at mid-gestation

### 7.3 Differential Card Format

```
TRIGGER FIRED
[Title in bold]
[Clinical summary — 2–3 sentences]

┌────────────────────────┬─────────────────┬────────────────────────────┐
│ Diagnosis              │ Est. Likelihood  │ Rationale + Citation       │
├────────────────────────┼─────────────────┼────────────────────────────┤
│ ...                    │ ...             │ ...                        │
└────────────────────────┴─────────────────┴────────────────────────────┘

Recommended Next Steps: [text]
Limitations: [text]
Primary Source: [citation + URL]
Secondary Source: [citation + URL]
```

---

## 8. GenAI Report Generation Module

Optional module. Employs a **RAG + deterministic guardrails** architecture to prevent hallucination.

### 8.1 Output Format

Follows the ESPR Fetal Task Force structured reporting template [39]:

1. **Clinical Indication** — from EHR context or manual entry
2. **Technique** — standard boilerplate
3. **Findings** — deterministic string interpolation from calculator outputs (no LLM)
4. **Impression** — LLM-synthesized, grounded in RAG-retrieved literature

### 8.2 RAG Architecture

1. **Knowledge Bank:** Vector DB pre-loaded with ~36 peer-reviewed papers cited in this spec, ISUOG and ESPR guidelines, and authoritative fetal neuroradiology textbooks.
2. **Retrieval:** On abnormal measurement detection, query vector DB for relevant differential diagnoses and prognostic data.
3. **Prompt injection:** Retrieved chunks + exact numerical inputs + z-scores injected into system prompt with strict instruction: *"Only use provided numerical data and retrieved literature. Do not introduce external medical claims."*

### 8.3 Agentic PubMed Fallback

Triggered when the combination of abnormal findings is not covered by the internal knowledge bank.

```python
from Bio import Entrez
# Query format:
# "{finding_1} AND {finding_2} AND fetal MRI AND differential diagnosis"
# Fetch top 3 abstracts via Entrez.efetch
# Inject into context window
# Flag all claims from agentic search in UI with PMID hyperlink
```

### 8.4 Hallucination Guardrails

| Guardrail | Implementation |
|---|---|
| Deterministic data anchoring | Findings section uses string interpolation only; LLM writes Impression only |
| Citation grounding | Every DDx in Impression must cite a specific retrieved chunk |
| Post-generation verification | Secondary judge LLM cross-checks generated text vs. numerical inputs; mismatch → fallback to deterministic template |

### 8.5 Supported Inference Backends

**Local / on-device (zero cost, maximum privacy):**

| Model | Notes |
|---|---|
| Gemma 4 (4B) / MedGemma 1.5 | Google open-weight, April 2026; runs on standard laptop CPU |
| Llama 4 Scout | Meta multimodal open-weight |
| Phi-3.5-mini (3.8B) | Microsoft; optimized for edge/CPU |

**Free-tier cloud APIs (de-identified prompts only):**

| Provider | Model |
|---|---|
| Google AI Studio | Gemini 3 Flash Preview / Gemini 3.1 Flash-Lite |
| Groq Cloud | Llama 3.3 70B (LPU inference) |
| Hugging Face Serverless Inference API | Open-source models |
| OpenRouter | Meta Llama 3, Mistral |

---

## 9. Integration & Workflow

### 9.1 Epic Radiant Integration

- Configure a custom hyperlink in the Epic Radiant "Learning Home" or a dedicated toolbar button.
- Opens calculator URL in the default system browser.
- Phase 1: **no SMART-on-FHIR required** — manual GA entry takes <2 seconds and avoids complex IT security review.

### 9.2 Nuance PowerScribe Integration

1. Radiologist completes measurements in calculator.
2. Clicks **"Copy to Clipboard"**.
3. Switches to PowerScribe, places cursor in the "Findings" section.
4. Pastes (Ctrl+V).

Report text must be **plain text with clear line breaks** — no HTML, no markdown.

---

## 10. Security & Compliance

| Requirement | Implementation |
|---|---|
| No PHI storage | Entirely client-side; no data transmitted to any server |
| Stateless | Page refresh clears all data |
| HIPAA | No PHI collected, transmitted, or stored → expected to fall outside strict HIPAA data-hosting requirements, accelerating IRB/QI approval |

---

## 11. Validation Strategy

### 11.1 Philosophy

Two separate validation layers:

- **Interpretation layer (Phase 1):** Validate that z-scores computed from expert ground-truth measurements agree with reference z-scores from the published normative models.
- **Measurement layer (Phase 2):** Validate that AI-pre-filled measurements agree with expert measurements within published inter-rater limits.

Both internal (single-institution) and external (multi-site) cohorts are required.

### 11.2 External Validation Cohort: FeTA 2024

**Dataset:** Zalevskyi et al., Med Image Anal 2026 [39]

| Property | Value |
|---|---|
| N | 300 super-resolution-reconstructed T2w volumes |
| Sites | 5 (Zurich Kispi, Vienna, CHUV Lausanne, UCSF, King's College London) |
| Field strengths | 0.55T, 1.5T, 3T |
| Vendors | Siemens, GE, Philips, Siemens Free.Max |
| GA range | 18.1–35.5 weeks |
| Pathology labels | ~130 pathological, ~170 neurotypical |
| Pathology categories | Ventriculomegaly, CC malformations, posterior-fossa malformations, open spina bifida |

**Ground-truth biometry available per case (5 direct, 4 derivable):**

- Direct: Brain BPD, Skull BPD, TCD, Corpus callosum length, Vermis CC height
- Derivable from segmentation masks: Brain OFD, Vermis AP, Pons AP, Atrial diameters (L/R)
- Not in FeTA (→ institutional cohort): CSP width, Third ventricle width, high-fidelity atrial diameters, Chiari II parameters

**Access:** Training portion (120 cases) downloadable under non-commercial research license via Synapse (Kispi) and custom DTA (Vienna). Test set (180 cases) requires research-extension DTA addendum.

### 11.3 Manuscript-Grade Endpoints (FeTA, n=120)

1. **Per-parameter agreement:** MAE and MAPE between calculator z-scores and reference z-scores (Luis 2025 for global/ventricular/midline; Dovjak 2021 for posterior fossa/brainstem; Birnbaum 2018 for 3rd ventricle; Woitek 2014 for Chiari II parameters)
2. **Multi-site/multi-vendor robustness:** Per-site, per-vendor, per-field-strength agreement
3. **Pathology vs. neurotypical comparison:** Z-score distribution difference between subsets
4. **Overall discrimination:** ROC-AUC for "any abnormal trigger fired" as binary pathology discriminator

### 11.4 Institutional Validation Cohort

| Stratum | N |
|---|---|
| Neurotypical | 20 |
| Mild/moderate pathology (isolated VM, CSP variation, mild posterior-fossa hypoplasia) | 20 |
| Severe pathology (severe VM, ACC, Chiari II + MMC, Dandy-Walker) | 20 |
| **Total** | **60** |

**Endpoints (institutional cohort):**

- Expert ground-truth for the 5 parameters not covered by FeTA
- Per-condition sensitivity, specificity, ROC-AUC
- With-tool vs. without-tool reader study (2–5 blinded radiologists, 2-week washout, counterbalanced ordering)
  - Metrics: reading time, structured-report completeness, NASA Task Load Index, System Usability Scale
- Inter-rater reliability: Cohen's/Fleiss's κ, ICC

**Regulatory path:** Expected to qualify as Quality Improvement or minimal-risk human-subjects research (waiver of consent). IRB submission is the collaborator institution's responsibility.

### 11.5 Timeline

| Milestone | Estimated duration |
|---|---|
| Synapse/DTA data access request | 2–4 weeks |
| FeTA analysis (agreement, robustness, discrimination) | 3–4 weeks |
| IRB submission drafting and submission | 4–6 weeks (parallel) |
| Institutional cohort recruitment + reader study | 6–12 weeks after IRB approval |
| Manuscript writing (parallel) | Ongoing |
| **Total to submittable manuscript** | **6–9 months** |

### 11.6 Datasets Considered and Rejected

| Dataset | Reason rejected |
|---|---|
| dHCP fetal release (~280 volumes, 3T) | No expert-measured biometry for calculator parameters; no case-level pathology labels; suitable for Phase 2 measurement-layer validation only |
| Luis 2025 normative cohort (n=406) | Cannot be used as validation cohort (circular validation — it is the normative source) |

---

## 12. QI Study Protocol

Mirrors the TI-RADS calculator study design (Ng et al. 2022 [1]).

**Pre-intervention:** Audit 100 historical fetal MRI reports.
- Baseline metrics: average time to report, % of reports containing all required measurements, frequency of explicit z-score/percentile documentation.

**Intervention:** Deploy calculator to the neuroradiology team.

**Post-intervention:** Audit 100 new reports generated with the tool.
- Compare pre/post metrics to demonstrate improved completeness, standardization, and reduced reporting time.

---

## 13. Future Work (Phase 2)

**Trigger:** Successful adoption and validation of Phase 1 manual-entry calculator.

**Goal:** Integrate AI-automated measurement pre-filling.

**Pipeline:** Open-source auto-proc-SVRTK 3-D U-Net (Luis et al. 2025 [2])
- Input: 3-D SVR NIfTI file uploaded by user
- Output: Automated landmark detection → pre-filled calculator input fields → radiologist approval

**Context:** FeTA 2024 challenge results show best AI MAPE = 7.72% vs. inter-rater MAPE = 5.38%; automated biometry remains challenging, justifying the Phase 1 manual-entry strategy.

**Publication:** Technically focused follow-up paper evaluating AI accuracy against the Phase 1 manual measurement dataset.

---

## 14. References

| # | Citation |
|---|---|
| [1] | Ng YS et al. Use of Web-Based Calculator for ACR TI-RADS. J Digit Imaging. 2022. https://link.springer.com/article/10.1007/s10278-021-00542-2 |
| [2] | Luis A et al. Automated fetal brain biometry reporting for 3D T2w MRI. Pediatr Radiol. 2025. https://link.springer.com/article/10.1007/s00247-025-06403-2 |
| [3] | Kyriakopoulou V et al. Normative biometry of the fetal brain using MRI. Brain Struct Funct. 2017. https://link.springer.com/article/10.1007/s00429-016-1342-6 |
| [7] | Tilea B et al. Cerebral biometry in fetal MRI: new reference data. Ultrasound Obstet Gynecol. 2009. https://obgyn.onlinelibrary.wiley.com/doi/full/10.1002/uog.6276 |
| [8] | Corroenne R et al. Corpus callosal reference ranges: systematic review. Ultrasound Obstet Gynecol. 2023. https://obgyn.onlinelibrary.wiley.com/doi/10.1002/uog.26187 |
| [9] | Kertes I et al. Normal fetal CSP in MR imaging — new biometric data. Eur J Radiol. 2021. https://doi.org/10.1016/j.ejrad.2020.109470 |
| [10] | Vatansever D et al. Multidimensional analysis of fetal posterior fossa. Cerebellum. 2013. https://link.springer.com/article/10.1007/S12311-013-0470-2 |
| [11] | Dovjak GO et al. Normal human brainstem development in vivo. Ultrasound Obstet Gynecol. 2021. https://obgyn.onlinelibrary.wiley.com/doi/full/10.1002/uog.22162 |
| [39] | Zalevskyi V et al. Advances in automated fetal brain MRI: FeTA 2024 challenge. Med Image Anal. 2026. https://www.sciencedirect.com/science/article/pii/S1361841526000101 |
| [43] | Woitek R et al. MR-based morphometry of the posterior fossa in fetuses with NTDs. PLOS One. 2014. https://pmc.ncbi.nlm.nih.gov/articles/PMC4231033/ |
| [44] | Aertsen M et al. Reliability of MRI-Based Posterior Fossa Measurements in Open Spinal Dysraphism. AJNR. 2019. https://www.ajnr.org/content/40/1/191 |
| [45] | D'Addario V et al. The clivus-supraocciput angle for Chiari II diagnosis. Ultrasound Obstet Gynecol. 2001. https://obgyn.onlinelibrary.wiley.com/doi/abs/10.1046/j.1469-0705.2001.00409.x |

*Full reference list of all 46 citations available in the source design document (Khanna, April 2026).*