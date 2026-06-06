/*
 * Design: "Editorial Clinical" — a self-contained editorial explaining
 * z-scores and the calculator's math. Mirrors the tone of the "Z-Scores,
 * Normal Distributions, and Fetal MRI" primer (Khanna 2026).
 */
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import ZScoreBar from "@/components/ZScoreBar";
import {
  PARAMETERS_ALL,
  computeCrossValidationAudits,
  sourceRegistryFor,
} from "@/lib/biometry";

const tierLabel = (tier?: string) => tier ?? "unclassified";

const statusClass = (status: string) => {
  if (status === "pass") return "text-[color:var(--state-normal)]";
  if (status === "partial-fail") return "text-[color:var(--state-watch)]";
  return "text-[color:var(--state-rare)]";
};

export default function Methodology() {
  const audits = computeCrossValidationAudits();
  const verificationRows = PARAMETERS_ALL.flatMap(param =>
    sourceRegistryFor(param).map(entry => ({
      parameter: param.short,
      source: entry.source.label,
      tier: entry.verificationTier,
      date: entry.verificationDate,
    }))
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-[color:var(--rule)]">
        <div className="container py-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--teal)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to calculator
          </Link>
          <div className="smallcaps text-[color:var(--ink-soft)]">
            Methodology
          </div>
        </div>
      </header>

      <main className="container max-w-[760px] py-16">
        <div className="smallcaps text-[color:var(--teal)] mb-4">
          Prepared as a methods note
        </div>
        <h1 className="font-display text-[52px] leading-[1.05] tracking-tight mb-4">
          Turning fetal brain measurements into clinical meaning
        </h1>
        <p className="text-[color:var(--ink-soft)] text-lg leading-relaxed mb-10">
          A single number, on its own, almost never tells you whether something
          is normal. This calculator converts every biometric measurement into a{" "}
          <em>z-score</em> — a common, unit-free language that lets a 22-week
          vermis and a 34-week corpus callosum be judged on the same ruler.
        </p>

        <section className="space-y-4 mb-12">
          <h2 className="font-display text-2xl">What a z-score is</h2>
          <p>
            Every normative fetal-MRI dataset tells us, for a given gestational
            age, what the <em>typical</em> measurement (μ) and the{" "}
            <em>spread</em> (σ) of that measurement are. The z-score is simply:
          </p>
          <div className="border border-[color:var(--rule)] rounded-sm p-6 flex items-center justify-center font-numeric text-2xl text-[color:var(--teal)]">
            z = (x − μ) / σ
          </div>
          <p>
            A z of 0 means the measurement sits exactly at the mean. A z of +1
            means one standard deviation above, −1 means one below. Because
            z-scores are unitless, they allow every parameter in the study to be
            compared on the same chart, regardless of scale.
          </p>
        </section>

        <section className="space-y-4 mb-12">
          <h2 className="font-display text-2xl">
            How the size of z maps to how rare something is
          </h2>
          <div className="border border-[color:var(--rule)] rounded-sm divide-y divide-[color:var(--rule)]">
            {[
              {
                z: "|z| ≤ 1",
                rarity: "Within the most common 68%",
                note: "Unremarkable",
                band: "normal" as const,
                zv: 0.5,
              },
              {
                z: "1 < |z| ≤ 2",
                rarity: "Outside central 68%, inside central 95%",
                note: "Worth noting",
                band: "note" as const,
                zv: 1.4,
              },
              {
                z: "2 < |z| ≤ 3",
                rarity: "In the outer 5%",
                note: "Uncommon — take a closer look",
                band: "watch" as const,
                zv: 2.4,
              },
              {
                z: "|z| > 3",
                rarity: "In the outermost 0.3%",
                note: "Genuinely rare — triggers further evaluation",
                band: "rare" as const,
                zv: 3.1,
              },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center">
                <div className="col-span-3 font-numeric text-sm">{row.z}</div>
                <div className="col-span-2">
                  <ZScoreBar z={row.zv} band={row.band} compact />
                </div>
                <div className="col-span-4 text-sm">{row.rarity}</div>
                <div className="col-span-3 smallcaps text-[color:var(--ink-soft)]">
                  {row.note}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-[color:var(--ink-soft)]">
            This mapping is simply the familiar 68-95-99.7 rule, re-expressed as
            a decision aid for reading-room workflow.
          </p>
        </section>

        <section className="space-y-4 mb-12">
          <h2 className="font-display text-2xl">
            Where the reference curves come from
          </h2>
          <p>
            Every μ(GA) and σ(GA) curve in the calculator is tied to a
            peer-reviewed source record. Most coefficients are transcribed
            directly from source tables, workbooks, or scripts; any future
            approximation row must disclose its caveat in the row-level source
            detail. Three model forms are used:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Luis 2025</strong> (auto-proc-SVRTK pipeline; n = 406
              fetuses, 20–40 weeks GA) provides quadratic-mean / linear-SD
              coefficients for all 13 standard parameters. μ(GA) =
              a·GA² + b·GA + c, σ(GA) = a₅·GA + b₅.
            </li>
            <li>
              <strong>Dovjak 2021</strong> publishes per-percentile linear
              equations for transcerebellar diameter, vermian height, vermian
              AP, and pons AP, validated 14.0-39.3 weeks. μ(GA) is taken as the
              midpoint of the 5th and 95th centile lines and σ(GA) as
              (p₉₅ − p₅) / (2·1.6449), assuming Gaussianity.
            </li>
            <li>
              Third-ventricle width is handled conservatively as a raw 3.5 mm
              threshold input. The prior Birnbaum/Hertzberg cross-modality
              z-score approximation is disabled until a clinician verifies a
              source transcription or accepts a cross-modality model.
            </li>
            <li>
              <strong>Woitek 2014</strong> drives the TDPF and
              clivus-supraocciput angle models used by the Chiari II / open
              neural tube defect discriminator.
            </li>
            <li>
              <strong>Kyriakopoulou 2017</strong> provides the extra-cerebral
              CSF model from supplementary workbook row 19. The calculator uses
              the transcribed quadratic mean / linear SD coefficients for the
              direct extra-axial CSF z-score.
            </li>
          </ul>
          <p>
            The calculator always operates in multi-source consensus mode. Every
            applicable source in a parameter registry is evaluated, the
            consensus z-score is the mean across in-range sources, and any
            in-range source spread of Delta z ≥ 1.0 is surfaced as a
            disagreement badge and report note.
          </p>
        </section>

        <section className="space-y-5 mb-12">
          <h2 className="font-display text-2xl">
            Periodic source cross-validation audit
          </h2>
          <p>
            On every release, parameters with more than one registry source are
            sampled at half-week increments across the overlap. The line glyphs
            show per-source mean curves, while the bars show the standardized
            mean divergence against the 0.5 SD acceptance threshold.
          </p>
          <div className="space-y-4">
            {audits.map(audit => {
              const allMeans = audit.samples.flatMap(sample =>
                Object.values(sample.means)
              );
              const minMean = Math.min(...allMeans);
              const maxMean = Math.max(...allMeans);
              const yFor = (value: number) => {
                if (maxMean === minMean) return 30;
                return 54 - ((value - minMean) / (maxMean - minMean)) * 48;
              };
              const xFor = (index: number) =>
                audit.samples.length <= 1
                  ? 0
                  : (index / (audit.samples.length - 1)) * 220;

              return (
                <article
                  key={audit.parameterId}
                  className="border border-[color:var(--rule)] rounded-sm p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-display text-xl">
                      {audit.parameterName}
                    </h3>
                    <div className={`smallcaps ${statusClass(audit.status)}`}>
                      {audit.status} · max Delta {audit.maxDelta.toFixed(2)}
                    </div>
                  </div>
                  <p className="text-sm text-[color:var(--ink-soft)] mt-1">
                    Overlap {audit.overlap[0]}–{audit.overlap[1]} weeks ·{" "}
                    {audit.sources.map(source => source.label).join(" vs ")}
                  </p>
                  <svg
                    viewBox="0 0 220 60"
                    className="w-full h-20 mt-3 border border-[color:var(--rule)] bg-white"
                    role="img"
                    aria-label={`${audit.parameterName} source mean curves`}
                  >
                    {audit.sources.map((source, sourceIndex) => (
                      <polyline
                        key={source.label}
                        fill="none"
                        stroke={
                          sourceIndex === 0 ? "var(--teal)" : "var(--ink-soft)"
                        }
                        strokeWidth="2"
                        points={audit.samples
                          .map(
                            (sample, index) =>
                              `${xFor(index).toFixed(1)},${yFor(
                                sample.means[source.label]
                              ).toFixed(1)}`
                          )
                          .join(" ")}
                      />
                    ))}
                  </svg>
                  <div
                    className="mt-2 grid items-end gap-px h-10"
                    style={{
                      gridTemplateColumns: `repeat(${audit.samples.length}, minmax(2px, 1fr))`,
                    }}
                    aria-label={`${audit.parameterName} disagreement bars`}
                  >
                    {audit.samples.map(sample => (
                      <span
                        key={sample.gaWeeks}
                        title={`${sample.gaWeeks}w: Delta ${sample.maxDelta.toFixed(2)}`}
                        className={
                          sample.maxDelta > 0.5
                            ? "bg-[color:var(--state-watch)]"
                            : "bg-[color:var(--state-normal)]"
                        }
                        style={{
                          height: `${Math.max(3, Math.min(40, sample.maxDelta * 22))}px`,
                        }}
                      />
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 mb-12">
          <h2 className="font-display text-2xl">Source verification tiers</h2>
          <p>
            Each registry line carries a verification tier so the provenance of
            every displayed z-score remains visible: byte-identical,
            transcribed, derived, or approximation.
          </p>
          <div className="border border-[color:var(--rule)] rounded-sm divide-y divide-[color:var(--rule)] max-h-[360px] overflow-auto">
            {verificationRows.map(row => (
              <div
                key={`${row.parameter}-${row.source}`}
                className="grid grid-cols-12 gap-3 p-3 text-sm"
              >
                <div className="col-span-3 font-display">{row.parameter}</div>
                <div className="col-span-3">{row.source}</div>
                <div className="col-span-3 smallcaps">
                  {tierLabel(row.tier)}
                </div>
                <div className="col-span-3 font-numeric text-[color:var(--ink-soft)]">
                  {row.date ?? "not dated"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 mb-12">
          <h2 className="font-display text-2xl">
            QI deployment tracking protocol
          </h2>
          <p>
            The pre-intervention phase audits 100 historical fetal MRI reports
            to establish baseline average time to report,{" "}
            {"measurement completeness"}, and frequency of explicit{" "}
            {"z-score and percentile documentation"}.
          </p>
          <p>
            The intervention phase deploys the calculator to the neuroradiology
            team. The post-intervention phase audits 100 new reports produced
            with the tool and compares the same endpoints against baseline to
            assess completeness, standardization, and reduced reporting time.
          </p>
        </section>

        <section className="space-y-4 mb-12">
          <h2 className="font-display text-2xl">
            Differential-diagnosis engine
          </h2>
          <p>
            When a measurement crosses a clinically recognized threshold —
            ventriculomegaly at 10 mm, for example, or an absent cavum septum
            pellucidum — the calculator surfaces a curated, citation-grounded
            differential diagnosis drawn from peer-reviewed literature (Malinger
            2005, Pagani 2014, Giorgione 2022, van Dijk 2018, Sun 2024,
            Hertzberg 1997, and others). Every likelihood shown is accompanied
            by its primary source so the clinician can audit the reasoning
            before dictating a report.
          </p>
        </section>

        <section className="space-y-4 mb-12">
          <h2 className="font-display text-2xl">
            Optional GenAI / RAG report module
          </h2>
          <p>
            The optional GenAI / RAG report module is implemented as a guarded
            report-generation path. Findings remain deterministic string
            interpolation, and any impression synthesis is constrained by the
            prompt: "You must only use the provided numerical data and retrieved
            literature to generate the report.{" "}
            {"Do not introduce external medical claims"}."
          </p>
          <p>
            The curated knowledge bank scope is the peer-reviewed paper set in
            SPEC.md plus ISUOG guidance, ESPR guidance, and authoritative fetal
            neuroradiology textbooks. When internal retrieval is insufficient,
            the fallback plan uses Bio.Entrez with a Boolean PubMed query,
            retrieves the top 3 abstracts, and injects temporary abstracts only.
            Every agentic-search claim requires radiologist review and a{" "}
            {"PMID hyperlink"}.
          </p>
          <p>
            Post-generation verification checks the generated report against the
            original numeric inputs; if a measurement anchor is missing, report
            generation falls back to the safe deterministic template. Backend
            recommendations remain deployment metadata: llama.cpp for local
            inference and Google AI Studio, Groq Cloud, Hugging Face Serverless
            Inference API, or OpenRouter for free-tier cloud evaluation.
            networkCallsEnabled remains false in the client-side calculator.
          </p>
        </section>

        <section className="space-y-4 mb-12">
          <h2 className="font-display text-2xl">Privacy &amp; workflow</h2>
          <p>
            Phase 1 Epic Radiant integration is a custom hyperlink from the
            Radiant Learning Home or toolbar that opens the calculator URL in
            the default system browser. SMART-on-FHIR launch is deferred because
            manual gestational-age entry is faster than the security and build
            overhead of handling hospital context tokens.
          </p>
          <p>
            PowerScribe integration remains a plain text clipboard path: the
            radiologist copies the generated report, places the cursor in the
            PowerScribe Findings field, and pastes with Ctrl+V or the
            platform-equivalent paste command. The copied payload contains line
            breaks only, with no HTML or PHI-bearing fields.
          </p>
          <p>
            The calculator is entirely client-side. No patient data is ever
            transmitted, stored, or logged. Refreshing the page clears every
            input. Because no PHI is handled, the calculator sits outside HIPAA
            data-hosting scope — which is what makes the TI-RADS-style
            workflow-integration model feasible at scale.
          </p>
        </section>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[color:var(--teal)] border-b border-[color:var(--teal)]/40 pb-0.5 hover:border-[color:var(--teal)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the calculator
        </Link>
      </main>
    </div>
  );
}
