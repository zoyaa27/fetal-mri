/*
 * Validation & worked-examples page.
 *
 * Style note: keeps the "Editorial Clinical" design language used in Home —
 * journal-style headers (font-display), small caps for metadata, monospace
 * numerics, and the deep-teal accent. All numeric tables are *computed live
 * from the same engine* the calculator uses, so anything published here is
 * exactly what users see in the worksheet.
 */
import { Link } from "wouter";
import { ArrowLeft, BookOpen } from "lucide-react";

import {
  PARAMETERS,
  GROUP_ORDER,
  mu,
  sigma,
  zscore,
  formatZ,
  formatPct,
} from "@/lib/biometry";

const GA_GRID = [22, 26, 30, 34, 38];

/* ---------- Worked examples ----------
 *
 * Each row is *manually authored* but the z and centile columns are computed
 * by the same `zscore()` function the worksheet uses, so the page stays in
 * lock-step with the engine even if the coefficients are ever updated.
 */
type Worked = {
  paramId: string;
  ga: { weeks: number; days: number };
  value: number;
  expectation: string;
  source: string;
};

const WORKED: Worked[] = [
  {
    paramId: "skull_bpd",
    ga: { weeks: 22, days: 0 },
    value: 53.0,
    expectation: "near 50th centile (Tilea 2009 reports mean ≈ 53 mm at 22 w)",
    source: "Tilea 2009, Table 2",
  },
  {
    paramId: "tcd",
    ga: { weeks: 30, days: 0 },
    value: 36.1,
    expectation: "near 50th centile (Xia 2021 reports 50th = 36.1 mm at 30 w)",
    source: "Xia 2021, Table 2c",
  },
  {
    paramId: "tcd",
    ga: { weeks: 22, days: 0 },
    value: 22.3,
    expectation: "near 50th centile (Xia 2021 reports 50th = 22.3 mm at 22 w)",
    source: "Xia 2021, Table 2c",
  },
  {
    paramId: "pons_ap",
    ga: { weeks: 28, days: 0 },
    value: 9.96,
    expectation:
      "near 50th centile per Dovjak 2021 linear model (k=0.38, d=−0.68 → 9.96 mm)",
    source: "Dovjak 2021, Table 1 (50th)",
  },
  {
    paramId: "vermis_cc",
    ga: { weeks: 28, days: 0 },
    value: 15.62,
    expectation:
      "near 50th centile per Dovjak 2021 (k=0.84, d=−7.90 → 15.62 mm)",
    source: "Dovjak 2021, Table 1 (50th)",
  },
  {
    paramId: "atrial_left",
    ga: { weeks: 30, days: 0 },
    value: 6.7,
    expectation: "near 50th centile; threshold for VM remains a fixed 10 mm",
    source: "Cardoza 1988; Salomon 2007",
  },
  {
    paramId: "csp_width",
    ga: { weeks: 30, days: 0 },
    value: 7.7,
    expectation: "near 50th centile per Kertes 2021 (~6–8 mm at 28–34 w)",
    source: "Kertes 2021",
  },
  {
    paramId: "cc_length",
    ga: { weeks: 28, days: 0 },
    value: 33.4,
    expectation:
      "near 50th centile per Conte 2018 / Tilea 2009 (~33 mm at 28 w)",
    source: "Conte 2018",
  },
  // An intentional "abnormal" worked case
  {
    paramId: "atrial_left",
    ga: { weeks: 24, days: 0 },
    value: 17.0,
    expectation:
      "severe ventriculomegaly trigger (≥15 mm); engine should fire DX_SEVERE_VM",
    source: "Cardoza 1988",
  },
  {
    paramId: "pons_ap",
    ga: { weeks: 28, days: 0 },
    value: 6.5,
    expectation:
      "z ≈ −5; engine should fire pontocerebellar-hypoplasia DX (PCH)",
    source: "Dovjak 2021 — below 5th percentile",
  },
];

const ALL_PARAMS = [...PARAMETERS];
const findParam = (id: string) => ALL_PARAMS.find(p => p.id === id)!;

const fmtMm = (v: number) => v.toFixed(2);

export default function Validation() {
  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)]">
      {/* Banner */}
      <div className="border-b border-[color:var(--rule)] bg-[color:var(--paper)]/70 backdrop-blur-sm sticky top-0 z-30">
        <div className="container py-4 flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--teal)] flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back to worksheet
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/methodology"
              className="text-xs smallcaps text-[color:var(--ink-soft)] hover:text-[color:var(--teal)] flex items-center gap-1.5"
            >
              <BookOpen className="h-3 w-3" /> Methodology
            </Link>
          </div>
        </div>
      </div>

      <main className="container py-12 max-w-[920px]">
        <div className="smallcaps text-[color:var(--teal)]">
          Validation &amp; provenance
        </div>
        <h1 className="font-display text-[44px] leading-[1.05] tracking-tight mt-1">
          What the numbers mean — and where they come from.
        </h1>
        <p className="text-[15px] text-[color:var(--ink-soft)] mt-4 max-w-[58ch]">
          Every z-scored measurement entered into the worksheet is converted to
          a centile using its source-registry model. Most standard brain
          measurements use{" "}
          <a
            href="https://link.springer.com/article/10.1007/s00247-025-06403-2"
            className="cite"
          >
            Luis 2025 (auto-proc-SVRTK)
          </a>
          , while posterior-fossa, Chiari-marker, and extra-axial CSF rows use
          their own cited sources. Third-ventricle width is handled as a raw 3.5
          mm threshold input until a verified z-score source is encoded. This
          page documents the exact coefficients used, shows the resulting growth
          references at standard ages, and prints a battery of worked examples
          so anyone can reproduce the calculation by hand.
        </p>

        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 0</div>
          <h2 className="font-display text-[28px] mt-1">
            Validation philosophy
          </h2>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            The measurement layer is the radiologist-entered millimetre or
            degree value; the interpretation layer converts that value into a
            z-score, percentile, and differential list.{" "}
            {"Phase 1 validates the interpretation layer only"} by comparing
            calculator z-scores against expert ground-truth measurements and
            reader-assigned reference values.
          </p>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            Future Phase 2 work validates AI-pre-filled measurements against
            expert measurements within published inter-rater limits. The
            validation plan therefore requires internal and external cohorts:
            one to prove local performance and one to prove generalization
            across sites, vendors, and field strengths.
          </p>
        </section>

        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 0.1</div>
          <h2 className="font-display text-[28px] mt-1">
            FeTA 2024 external cohort
          </h2>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            FeTA 2024 provides {"300 super-resolution-reconstructed T2 volumes"}{" "}
            across five sites: Kispi, Medical University of Vienna, CHUV,{" "}
            {"UCSF Benioff"}, and {"King's College London"}. The acquisition
            spread includes {"0.55 T, 1.5 T, and 3 T"} scanners and{" "}
            {"Siemens, GE, Philips, and Siemens Free.Max"} vendor classes.
          </p>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            The external cohort includes approximately {"130 pathological"} and{" "}
            {"170 neurotypical"} cases, with recruited categories including
            ventriculomegaly, corpus callosum malformations,{" "}
            {"posterior-fossa malformations"}, and open spina bifida.
          </p>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            Each case carries{" "}
            {"five expert-measured biometric ground-truth values"}:{" "}
            {"brain biparietal diameter"}, {"skull biparietal diameter"},{" "}
            {"transverse cerebellar diameter"}, {"corpus callosum length"}, and{" "}
            {"vermis cranio-caudal height"}.
          </p>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            {"brain occipito-frontal diameter"},{" "}
            {"vermis antero-posterior diameter"},{" "}
            {"pons antero-posterior diameter"}, and{" "}
            {"left and right atrial diameters"} are{" "}
            {"derivable from the released segmentation masks"}. CSP width,
            third-ventricle width, high-fidelity atrial diameters, and TDPF/CSA
            are {"not directly recoverable from FeTA"} and remain assigned to
            the institutional cohort.
          </p>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            The access plan uses the {"120-case training set"} for immediate
            labeled analysis and treats the {"180-case test set"} as a
            challenge-held benchmark requiring an addendum for per-condition
            labels.
          </p>
        </section>

        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 0.2</div>
          <h2 className="font-display text-[28px] mt-1">
            FeTA 2024 validation endpoints
          </h2>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            The FeTA 2024 cohort supports four manuscript-grade endpoints for
            the interpretation layer: {"per-parameter agreement"},{" "}
            {"multi-site, multi-vendor, multi-field-strength robustness"},{" "}
            pathology-versus-neurotypical comparison, and overall ROC-AUC for
            any abnormal trigger fired.
          </p>
        </section>

        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 0.3</div>
          <h2 className="font-display text-[28px] mt-1">
            Institutional validation cohort
          </h2>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            The 60-case institutional cohort targets 20 neurotypical scans,{" "}
            {"20 mild-or-moderate pathology"} scans, and {"20 severe pathology"}{" "}
            scans from a single-site consecutive fetal brain MRI series.
          </p>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            The cohort supplies {"expert ground-truth measurements"},{" "}
            per-condition labels, the{" "}
            {"with-tool-versus-without-tool reader study"}, and{" "}
            {"inter-rater reliability"} evidence requested for clinical-utility
            reporting.
          </p>
        </section>

        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 0.4</div>
          <h2 className="font-display text-[28px] mt-1">
            Dataset cross-reference
          </h2>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            The dHCP fetal release was considered for validation but{" "}
            {"lacks expert-measured biometry"} and{" "}
            {"does not include case-level pathology labels"}, so it is reserved
            for possible Phase 2 measurement-layer validation.
          </p>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            The Luis 2025 normative cohort remains a source-registry reference
            distribution. It cannot serve as an independent endpoint because
            using the same cohort for model coefficients and validation would
            create circular validation; instead, future cohorts are checked
            against it through the source-registry acceptance criterion.
          </p>
        </section>

        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 0.5</div>
          <h2 className="font-display text-[28px] mt-1">Validation timeline</h2>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            External validation starts with the Synapse Data Access Request and
            parallel Data Transfer Agreement. The expected sequence is{" "}
            {"two-to-four-week access"} followed by{" "}
            {"three-to-four-week analysis"} of per-parameter agreement,
            robustness, pathology comparison, and overall discrimination.
          </p>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            Institutional validation runs in parallel with a{" "}
            {"four-to-six-week IRB submission"}, then a{" "}
            {"six-to-twelve-week reader study"} once the cohort and approval are
            available. The planned end-to-end target is a{" "}
            {"six-to-nine-month manuscript path"}.
          </p>
        </section>

        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 0.6</div>
          <h2 className="font-display text-[28px] mt-1">
            Publication-readiness audit
          </h2>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            The manuscript package should be mapped before radiologist handoff
            to the reporting standards reviewers now expect for imaging decision
            support:{" "}
            <a href="https://doi.org/10.1136/bmj-2023-078378" className="cite">
              TRIPOD+AI
            </a>{" "}
            for prediction-model transparency,{" "}
            <a href="https://doi.org/10.1148/ryai.2020200029" className="cite">
              CLAIM
            </a>{" "}
            for imaging-AI and image-analysis reporting,{" "}
            <a
              href="https://doi.org/10.1136/bmjqs-2015-004411"
              className="cite"
            >
              SQUIRE 2.0
            </a>{" "}
            for the QI pre/post implementation study, STARD-AI development
            guidance for diagnostic-accuracy claims, and{" "}
            <a
              href="https://doi.org/10.1038/s41591-022-01772-9"
              className="cite"
            >
              DECIDE-AI
            </a>{" "}
            / CONSORT-AI for any prospective clinical-decision-support or
            intervention study.
          </p>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            Phase 1 should therefore report discrimination, calibration, and
            clinical utility rather than only unit-test pass rates. Required
            statistics are calibration-in-the-large, calibration slope,{" "}
            {"Brier score"}, ROC-AUC, PR-AUC for imbalanced endpoints,
            sensitivity and specificity with Wilson confidence intervals at
            locked thresholds, and {"decision-curve net benefit"} across
            plausible follow-up thresholds. The pre/post report-audit metrics
            should include average time to report, all-required-measurement
            completion, explicit z-score documentation, explicit percentile
            documentation, and recommendation congruence. The{" "}
            {"reader-study timing"}, report completeness, z-score documentation
            rate, recommendation congruence, NASA Task Load Index, and{" "}
            {"System Usability Scale"} provide the QI and workflow endpoints.
          </p>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            Zalevskyi 2026 shows why the current manual-entry scope is
            defensible: in the FeTA 2024 biometry estimation task, the{" "}
            {"best model reached 7.72% MAPE"} while{" "}
            {"inter-rater MAPE of 5.38%"} remained lower, and many methods did
            not beat a gestational-age baseline. The same paper identifies
            acquisition site, super-resolution strategy, and {"image quality"}{" "}
            as major domain-shift drivers, so the external validation table must
            stratify results by site, vendor, field strength, SVR method, and
            motion/image-quality tier.
          </p>
        </section>

        {/* §1 model */}
        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 1</div>
          <h2 className="font-display text-[28px] mt-1">The model</h2>
          <p className="text-[15px] mt-3 max-w-[58ch]">
            For every parameter and every gestational age (decimal weeks):
          </p>
          <pre className="mt-4 px-5 py-4 text-[13.5px] font-numeric whitespace-pre-wrap bg-white border border-[color:var(--rule)] rounded-sm">
            {`mean(GA) = a · GA² + b · GA + c        (quadratic mean curve)
SD(GA)   = a5 · GA + b5                (linear, heteroscedastic SD)
z        = (value_mm − mean) / SD
percentile = Φ(z) × 100                (standard normal CDF)`}
          </pre>
          <p className="text-[14px] text-[color:var(--ink-soft)] mt-4 max-w-[58ch]">
            Coefficients are taken verbatim from the Luis 2025 open-source
            pipeline (see{" "}
            <a
              href="https://github.com/SVRTK/auto-proc-svrtk/blob/main/scripts/auto-reporting-brain-biometry.py"
              className="cite"
            >
              auto-reporting-brain-biometry.py
            </a>
            ). The cohort comprises 406 normative datasets across 19–40 weeks
            GA. We treat 20–40 w as the validated range; results outside this
            window are flagged as <em>extrapolated</em>. The TDPF/CSA,
            posterior-fossa consensus rows, and extra-axial CSF rows use their
            own source records where Luis does not provide the active model.
            Third-ventricle width is not z-scored in this release; it is
            interpreted by the raw 3.5 mm threshold only.
          </p>
        </section>

        {/* §2 coefficients */}
        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 2</div>
          <h2 className="font-display text-[28px] mt-1">
            Models &amp; sources in use
          </h2>
          <p className="text-[14px] text-[color:var(--ink-soft)] mt-3 max-w-[58ch]">
            Each parameter records the published model used to compute its
            z-score and the secondary independent reference shown alongside for
            cross-validation. Three model families are supported: quadratic-mean
            / linear-SD (Luis 2025 and Kyriakopoulou 2017 extra-cerebral CSF),
            per-percentile linear equations (Dovjak 2021, with σ derived as{" "}
            <span className="font-numeric">
              (p<sub>95</sub>−p<sub>5</sub>) / (2·1.645)
            </span>
            ). A linear mean/SD model is available in the calculation library
            for future verified sources, but is not active in the current
            z-score registry. The extra-axial CSF row uses the exact
            Kyriakopoulou 2017 supplementary workbook row 19 coefficients.
            Third-ventricle width is excluded from this z-score table and
            remains a raw-threshold auxiliary input.
          </p>
          <div className="overflow-x-auto mt-4 border border-[color:var(--rule)] rounded-sm bg-white">
            <table className="w-full text-[13px] font-numeric">
              <thead className="bg-[color:var(--paper)]">
                <tr className="text-left">
                  {[
                    "Parameter",
                    "Primary model",
                    "Equation form",
                    "Cross-check",
                  ].map(h => (
                    <th
                      key={h}
                      className="px-3 py-2 smallcaps text-[color:var(--ink-soft)] font-normal border-b border-[color:var(--rule)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_PARAMS.map(p => {
                  const m = p.model;
                  let form = "";
                  if (m.kind === "luis-quadratic") {
                    form = `μ = ${m.a.toFixed(4)}·GA² ${m.b >= 0 ? "+" : "−"} ${Math.abs(m.b).toFixed(4)}·GA ${m.c >= 0 ? "+" : "−"} ${Math.abs(m.c).toFixed(4)}; σ = ${m.a5.toFixed(4)}·GA ${m.b5 >= 0 ? "+" : "−"} ${Math.abs(m.b5).toFixed(4)}`;
                  } else if (m.kind === "dovjak-percentile") {
                    form = `p₅ = ${m.p5.k.toFixed(2)}·GA ${m.p5.d >= 0 ? "+" : "−"} ${Math.abs(m.p5.d).toFixed(2)}; p₉₅ = ${m.p95.k.toFixed(2)}·GA ${m.p95.d >= 0 ? "+" : "−"} ${Math.abs(m.p95.d).toFixed(2)}`;
                  } else {
                    form = `μ = ${m.mMu.toFixed(2)}·GA ${m.bMu >= 0 ? "+" : "−"} ${Math.abs(m.bMu).toFixed(2)}; σ = ${m.sigma.toFixed(2)} mm`;
                  }
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-[color:var(--rule)]/60 last:border-0 align-top"
                    >
                      <td className="px-3 py-2 font-sans">{p.short}</td>
                      <td className="px-3 py-2 font-sans text-[12px]">
                        {p.primary.label}
                      </td>
                      <td className="px-3 py-2 text-[12px]">{form}</td>
                      <td className="px-3 py-2 font-sans text-[12px] text-[color:var(--ink-soft)]">
                        {p.secondary?.label ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* §3 growth charts */}
        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 3</div>
          <h2 className="font-display text-[28px] mt-1">
            Growth references at standard ages
          </h2>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            Mean ± 1.645·SD (i.e. 5th–95th centiles) at five reference
            gestational ages, computed live by the engine.
          </p>

          {GROUP_ORDER.map(group => {
            const inGroup = ALL_PARAMS.filter(p => p.group === group);
            if (inGroup.length === 0) return null;
            return (
              <div key={group} className="mt-8">
                <h3 className="font-display text-[18px]">§ {group}</h3>
                <div className="overflow-x-auto mt-2 border border-[color:var(--rule)] rounded-sm bg-white">
                  <table className="w-full text-[12.5px] font-numeric">
                    <thead className="bg-[color:var(--paper)]">
                      <tr className="text-left">
                        <th className="px-3 py-2 smallcaps text-[color:var(--ink-soft)] font-normal border-b border-[color:var(--rule)]">
                          Parameter
                        </th>
                        {GA_GRID.map(g => (
                          <th
                            key={g}
                            colSpan={2}
                            className="px-3 py-2 smallcaps text-center text-[color:var(--ink-soft)] font-normal border-b border-l border-[color:var(--rule)]"
                          >
                            {g} w
                          </th>
                        ))}
                      </tr>
                      <tr className="text-left text-[10.5px]">
                        <th className="px-3 py-1 border-b border-[color:var(--rule)]" />
                        {GA_GRID.map(g => (
                          <>
                            <th
                              key={`${g}-mu`}
                              className="px-3 py-1 smallcaps text-center text-[color:var(--ink-soft)] font-normal border-b border-l border-[color:var(--rule)]"
                            >
                              μ
                            </th>
                            <th
                              key={`${g}-band`}
                              className="px-3 py-1 smallcaps text-center text-[color:var(--ink-soft)] font-normal border-b border-[color:var(--rule)]"
                            >
                              5–95
                            </th>
                          </>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inGroup.map(p => (
                        <tr
                          key={p.id}
                          className="border-b border-[color:var(--rule)]/60 last:border-0"
                        >
                          <td className="px-3 py-2 font-sans">{p.short}</td>
                          {GA_GRID.map(g => {
                            const m = mu(p, g);
                            const s = sigma(p, g);
                            const lo = m - 1.645 * s;
                            const hi = m + 1.645 * s;
                            return (
                              <>
                                <td
                                  key={`${p.id}-${g}-mu`}
                                  className="px-3 py-2 text-center border-l border-[color:var(--rule)]/30"
                                >
                                  {fmtMm(m)}
                                </td>
                                <td
                                  key={`${p.id}-${g}-band`}
                                  className="px-3 py-2 text-center text-[color:var(--ink-soft)]"
                                >
                                  {fmtMm(lo)}–{fmtMm(hi)}
                                </td>
                              </>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </section>

        {/* §4 worked examples */}
        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 4</div>
          <h2 className="font-display text-[28px] mt-1">Worked examples</h2>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            Each row was constructed by reading a known reference value from a
            primary publication and then asking the engine what z-score it
            produces. Because the calculator uses parameter-specific registry
            models, normal-mean values should land near z = 0, and below-5th /
            above-95th values should land at |z| ≥ 1.645.
          </p>
          <div className="overflow-x-auto mt-4 border border-[color:var(--rule)] rounded-sm bg-white">
            <table className="w-full text-[13px] font-numeric">
              <thead className="bg-[color:var(--paper)]">
                <tr className="text-left">
                  {[
                    "Parameter",
                    "GA",
                    "Value (mm)",
                    "μ(GA)",
                    "SD(GA)",
                    "z",
                    "Centile",
                    "Expected behaviour",
                    "Source",
                  ].map(h => (
                    <th
                      key={h}
                      className="px-3 py-2 smallcaps text-[color:var(--ink-soft)] font-normal border-b border-[color:var(--rule)] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WORKED.map((w, i) => {
                  const p = findParam(w.paramId);
                  const r = zscore(p, w.ga, w.value);
                  if (!r) return null;
                  const tone =
                    r.band === "normal"
                      ? "var(--state-normal)"
                      : r.band === "note"
                        ? "var(--state-note)"
                        : r.band === "watch"
                          ? "var(--state-watch)"
                          : "var(--state-rare)";
                  return (
                    <tr
                      key={i}
                      className="border-b border-[color:var(--rule)]/60 last:border-0"
                    >
                      <td className="px-3 py-2 font-sans">{p.short}</td>
                      <td className="px-3 py-2">
                        {w.ga.weeks}w {w.ga.days}d
                      </td>
                      <td className="px-3 py-2">{w.value.toFixed(2)}</td>
                      <td className="px-3 py-2">{r.mu.toFixed(2)}</td>
                      <td className="px-3 py-2">{r.sigma.toFixed(2)}</td>
                      <td className="px-3 py-2" style={{ color: tone }}>
                        {formatZ(r.z)}
                      </td>
                      <td className="px-3 py-2">{formatPct(r.percentile)}</td>
                      <td className="px-3 py-2 font-sans text-[12px] text-[color:var(--ink-soft)] max-w-[260px]">
                        {w.expectation}
                      </td>
                      <td className="px-3 py-2 font-sans text-[11.5px] text-[color:var(--ink-soft)] whitespace-nowrap">
                        {w.source}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* §5 differential triggers */}
        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 5</div>
          <h2 className="font-display text-[28px] mt-1">
            Differential-diagnosis triggers
          </h2>
          <p className="text-[15px] mt-3 text-[color:var(--ink-soft)] max-w-[58ch]">
            Triggers fire on either fixed millimetre thresholds (independent of
            GA) or on z-score thresholds against the model above. The same
            evidence-based table is used regardless of GA.
          </p>
          <div className="overflow-x-auto mt-4 border border-[color:var(--rule)] rounded-sm bg-white">
            <table className="w-full text-[13px] font-numeric">
              <thead className="bg-[color:var(--paper)]">
                <tr className="text-left">
                  {["Trigger", "Condition", "Type"].map(h => (
                    <th
                      key={h}
                      className="px-3 py-2 smallcaps text-[color:var(--ink-soft)] font-normal border-b border-[color:var(--rule)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-sans">
                {[
                  [
                    "Severe ventriculomegaly",
                    "max(atrial L, atrial R) ≥ 15 mm",
                    "fixed mm",
                  ],
                  [
                    "Mild–moderate VM",
                    "max(atrial L, atrial R) ≥ 10 mm",
                    "fixed mm",
                  ],
                  [
                    "Asymmetric ventricles",
                    "|atrial L − atrial R| > 2 mm",
                    "fixed mm",
                  ],
                  ["Absent / narrow CSP", "CSP width < 1 mm", "fixed mm"],
                  ["Enlarged CSP", "CSP width > 10 mm", "fixed mm"],
                  ["Short CC", "CC length z < −1.645 (5th centile)", "z-score"],
                  ["Small pons", "Pons AP z < −1.645", "z-score"],
                  ["Small TCD", "TCD z < −1.645", "z-score"],
                  ["Wide third ventricle", "3rd-V width > 3.5 mm", "fixed mm"],
                  [
                    "Widened extra-axial CSF",
                    "Extra-axial CSF z > +1.645",
                    "z-score",
                  ],
                ].map(([t, c, k]) => (
                  <tr
                    key={t}
                    className="border-b border-[color:var(--rule)]/60 last:border-0"
                  >
                    <td className="px-3 py-2">{t}</td>
                    <td className="px-3 py-2 font-numeric text-[12.5px]">
                      {c}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--ink-soft)]">
                      {k}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* §6 limitations */}
        <section className="mt-14">
          <div className="smallcaps text-[color:var(--ink-soft)]">§ 6</div>
          <h2 className="font-display text-[28px] mt-1">Known limitations</h2>
          <ul className="mt-4 space-y-3 text-[15px] max-w-[60ch]">
            <li>
              <strong>GA range.</strong> The Luis 2025 coefficients are
              validated for 20–40 w GA. Inputs at 18–20 w extrapolate the
              quadratic outside the fitting domain and the result is flagged
              accordingly in the worksheet.
            </li>
            <li>
              <strong>Field strength &amp; acquisition.</strong> The pipeline
              was developed on 0.55–3 T T2-weighted reconstructed volumes.
              Z-scores derived from native (non-reconstructed) 2D HASTE may
              differ slightly because of partial-volume effects.
            </li>
            <li>
              <strong>Population specificity.</strong> The cohort is largely UK
              / European fetuses; ethnic and population variation is not
              modelled. The cross-validation column in §2 lists the
              parameter-specific primary references that can serve as a second
              opinion when local growth differs.
            </li>
            <li>
              <strong>
                Atrial diameter is laterality-symmetric in the model.
              </strong>{" "}
              Luis 2025 uses the same coefficients for left and right atrial
              diameters; the asymmetry trigger compares the raw millimetre
              values, not the z-scores.
            </li>
            <li>
              <strong>Differential engine is rules-based.</strong> Triggers
              encode published thresholds and named differentials but do not
              attempt to compute Bayesian posterior probabilities from the full
              constellation of measurements.
            </li>
          </ul>
        </section>

        <div className="mt-16 border-t border-[color:var(--rule)] pt-6 text-[12px] text-[color:var(--ink-soft)]">
          Coefficients last cross-checked against the published source on 27 Apr
          2026.
        </div>
      </main>
    </div>
  );
}
