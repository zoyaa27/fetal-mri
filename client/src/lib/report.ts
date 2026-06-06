/*
 * Structured report generator — ESPR-inspired sections. Deterministic string
 * interpolation (spec §4.11.4 "Deterministic Data Anchoring"), never LLM.
 */

import {
  AUXILIARY_MEASUREMENTS,
  Differential,
  GA,
  GROUP_ORDER,
  Parameter,
  PARAMETERS_ALL,
  QUALITATIVE_FINDINGS,
  ZResult,
  formatPct,
  formatZ,
  gaToDecimalWeeks,
} from "./biometry";

export type ReportContext = {
  ga: GA;
  fieldStrength: string; // "1.5T" | "3T" | "0.55T"
  motion: string; // "None" | "Mild" | "Moderate" | "Severe"
  clinicalIndication?: string;
  values: Record<string, number | null>;
  zs: Record<string, ZResult | null>;
  dxs: Differential[];
};

const bandPhrase = (z: number) => {
  const a = Math.abs(z);
  if (a <= 1) return "within the normal range";
  if (a <= 2) return "mildly deviated from the expected mean";
  if (a <= 3) return "moderately deviated from the expected mean";
  return "markedly deviated from the expected mean";
};

const paramLine = (p: Parameter, x: number, zr: ZResult): string => {
  const flag = zr.extrapolated ? " [case GA outside every source range]" : "";
  const unit = p.unit === "degrees" ? "degrees" : "mm";
  const agreement =
    zr.disagreementWidth == null
      ? `agreement: ${zr.agreementState}`
      : `agreement: ${zr.agreementState}, Delta z ${zr.disagreementWidth.toFixed(2)}`;
  const sources = zr.sourceDetails
    .map(source => {
      const range = `${source.gaRange[0]}-${source.gaRange[1]}w`;
      const rangeTag = source.inRange
        ? `in-range ${range}`
        : `extrapolated ${range}`;
      const modalityTag = source.crossModality ? ", cross-modality" : "";
      const verificationTag = source.verificationTier
        ? `, verification ${source.verificationTier}${
            source.verificationDate ? ` (${source.verificationDate})` : ""
          }`
        : "";
      const caveatTag = source.caveat ? `, caveat: ${source.caveat}` : "";
      return `${source.sourceLabel} z ${formatZ(source.z)} (${formatPct(
        source.percentile
      )}, mu ${source.mu.toFixed(2)}, sigma ${source.sigma.toFixed(
        2
      )}, ${rangeTag}${modalityTag}${verificationTag}${caveatTag})`;
    })
    .join("; ");
  return `${p.name}: ${x.toFixed(1)} ${unit} (consensus z ${formatZ(
    zr.z
  )}, ${formatPct(zr.percentile)} percentile; ${agreement})${flag} - ${bandPhrase(
    zr.z
  )}. Sources: ${sources}.`;
};

const auxiliaryLine = (
  field: (typeof AUXILIARY_MEASUREMENTS)[number],
  x: number
): string => {
  const unit = field.unit === "degrees" ? "degrees" : "mm";
  return `${field.name}: ${x.toFixed(1)} ${unit} (raw threshold input).`;
};

const qualitativeLine = (
  finding: (typeof QUALITATIVE_FINDINGS)[number]
): string =>
  `${finding.name}: entered qualitative/context input. ${finding.finding}`;

const dxSourceCitation = (dx: Differential): string => {
  const sources = [`${dx.primary.label} ${dx.primary.url}`];
  if (dx.secondary) sources.push(`${dx.secondary.label} ${dx.secondary.url}`);
  return ` Sources: ${sources.join("; ")}`;
};

export function generateReport(ctx: ReportContext): string {
  const { ga, fieldStrength, motion, values, zs, dxs } = ctx;
  const gaLabel = `${ga.weeks}w ${ga.days}d (${gaToDecimalWeeks(ga).toFixed(1)} weeks)`;

  const lines: string[] = [];
  lines.push("CLINICAL INDICATION");
  const clinicalIndication = ctx.clinicalIndication?.trim();
  if (clinicalIndication) lines.push(clinicalIndication);
  lines.push("");

  lines.push("TECHNIQUE");
  lines.push(
    "Calculator operated in multi-source consensus mode: consensus z-score is the arithmetic mean across in-range sources, and source disagreement is flagged at Delta z >= 1.0 SD between in-range sources."
  );
  lines.push(
    `Multiplanar T2-weighted single-shot fast spin-echo imaging of the fetal brain at ${fieldStrength}. Gestational age: ${gaLabel}. Motion artefact: ${motion.toLowerCase()}.`
  );
  if (dxs.some(dx => dx.id === "chiari-ii-ontd")) {
    lines.push(
      "Research-mode Chiari II / ONTD discriminator: posterior probabilities are model-derived and require local cohort calibration before clinical reliance."
    );
  }
  lines.push("");

  lines.push("FINDINGS");
  const disagreeingRows: { parameter: Parameter; result: ZResult }[] = [];
  for (const group of GROUP_ORDER) {
    const inGroup = PARAMETERS_ALL.filter(p => p.group === group);
    const measured = inGroup.filter(p => values[p.id] != null);
    if (measured.length === 0) continue;
    lines.push(`— ${group.toUpperCase()} —`);
    for (const p of measured) {
      const x = values[p.id]!;
      const zr = zs[p.id]!;
      if (zr.agreementState === "disagree") {
        disagreeingRows.push({ parameter: p, result: zr });
      }
      lines.push(`  • ${paramLine(p, x, zr)}`);
    }
    lines.push("");
  }

  if (disagreeingRows.length > 0) {
    lines.push("SOURCE-AGREEMENT NOTES");
    for (const row of disagreeingRows) {
      const detail = row.result.sourceDetails
        .map(source => `${source.sourceLabel} z ${formatZ(source.z)}`)
        .join("; ");
      lines.push(
        `${row.parameter.name} Delta z ${row.result.disagreementWidth?.toFixed(
          2
        )}: ${detail}.`
      );
    }
    lines.push("");
  }

  const measuredAuxiliary = AUXILIARY_MEASUREMENTS.filter(
    field => values[field.id] != null
  );
  if (measuredAuxiliary.length > 0) {
    lines.push("AUXILIARY INPUTS");
    for (const field of measuredAuxiliary) {
      lines.push(`  • ${auxiliaryLine(field, values[field.id]!)}`);
    }
    lines.push("");
  }

  const enteredQualitative = QUALITATIVE_FINDINGS.filter(
    finding => (values[finding.id] ?? 0) > 0
  );
  if (enteredQualitative.length > 0) {
    lines.push("QUALITATIVE / CONTEXT INPUTS");
    for (const finding of enteredQualitative) {
      lines.push(`  • ${qualitativeLine(finding)}`);
    }
    lines.push("");
  }

  lines.push("IMPRESSION");
  const anyZAbnormal = PARAMETERS_ALL.some(p => {
    const z = zs[p.id];
    return z != null && Math.abs(z.z) > 2;
  });
  const anyAbnormal = anyZAbnormal || dxs.length > 0;
  const qualitativeMcmImpression =
    (values.qualitative_mcm_panel ?? 0) > 0
      ? "Isolated mega cisterna magna with persistent Blake's pouch — likely benign normal variant."
      : undefined;
  if (qualitativeMcmImpression) {
    lines.push(qualitativeMcmImpression);
  } else if (!anyAbnormal && Object.values(values).some(v => v != null)) {
    lines.push("No abnormal biometric findings.");
  } else if (anyAbnormal) {
    const hpeImpression = dxs.find(
      dx => dx.id === "hpe-pattern"
    )?.impressionLine;
    const hpeDwmImpression =
      hpeImpression && dxs.some(dx => dx.id === "dwm-pattern")
        ? `${hpeImpression} Dandy-Walker spectrum with elevated tegmento-vermian angle is also present.`
        : undefined;
    const accImpression = dxs.find(
      dx => dx.id === "acc-pattern"
    )?.impressionLine;
    const accDwmImpression =
      accImpression && dxs.some(dx => dx.id === "dwm-pattern")
        ? `${accImpression} Dandy-Walker spectrum with elevated tegmento-vermian angle is also present.`
        : undefined;
    const combinedCerebellarHypoplasiaImpression =
      dxs.some(dx => dx.id === "vermis-small") &&
      dxs.some(dx => dx.id === "tcd-small") &&
      !dxs.some(dx => dx.id === "dwm-pattern")
        ? "Combined small TCD and small vermis pattern raises concern for cerebellar agenesis or pontocerebellar hypoplasia."
        : undefined;
    const qualitativeCmvImpression =
      (values.qualitative_cmv_panel ?? 0) > 0 &&
      dxs.some(dx => dx.id === "microcephaly") &&
      dxs.some(dx => dx.id === "mild-vm") &&
      !dxs.some(dx => dx.id === "hpe-pattern")
        ? "Microcephaly with ventriculomegaly and qualitative CMV findings suggests congenital CMV infection."
        : undefined;
    const brainVolumeLossImpression =
      !qualitativeCmvImpression &&
      (values.growth_restriction_context ?? 0) <= 0 &&
      dxs.some(dx => dx.id === "microcephaly") &&
      dxs.some(dx => dx.id === "mild-vm") &&
      dxs.some(dx => dx.id === "extra-axial-wide") &&
      !dxs.some(dx => dx.id === "hpe-pattern")
        ? "Microcephaly with ventriculomegaly and widened extra-axial CSF suggests congenital CMV or another intrauterine destructive insult."
        : undefined;
    const growthRestrictionMicrocephalyImpression =
      (values.growth_restriction_context ?? 0) > 0 &&
      dxs.some(dx => dx.id === "microcephaly") &&
      !qualitativeCmvImpression
        ? "Microcephaly with entered growth-restriction context favors symmetric IUGR-associated microcephaly over primary microcephaly."
        : undefined;
    const extraAxialIugrImpression =
      !qualitativeCmvImpression &&
      !brainVolumeLossImpression &&
      !growthRestrictionMicrocephalyImpression &&
      dxs.some(dx => dx.id === "microcephaly") &&
      dxs.some(dx => dx.id === "extra-axial-wide") &&
      !dxs.some(dx => dx.id === "mild-vm") &&
      !dxs.some(dx => dx.id === "severe-vm") &&
      !dxs.some(dx => dx.id === "hpe-pattern")
        ? "Microcephaly with widened extra-axial CSF suggests IUGR-associated extra-axial-space prominence; correlate with fetal growth parameters and placental insufficiency."
        : undefined;
    const overgrowthMacrocerebellumImpression =
      dxs.some(dx => dx.id === "tcd-large") &&
      dxs.some(dx => dx.id === "macrocephaly") &&
      !dxs.some(dx => dx.id === "hydrocephalus-pattern")
        ? "Macrocerebellum with macrocephaly raises concern for fetal overgrowth syndromes such as Sotos or Beckwith-Wiedemann syndrome."
        : undefined;
    const overgrowthMacrocephalyCallosumImpression =
      dxs.some(dx => dx.id === "macrocephaly") &&
      dxs.some(dx => dx.id === "cc-thick")
        ? "Macrocephaly with thick corpus callosum raises concern for a fetal overgrowth-syndrome combined pattern."
        : undefined;
    const overgrowthThickCallosumImpression =
      dxs.some(dx => dx.id === "tcd-large") &&
      dxs.some(dx => dx.id === "cc-thick") &&
      !dxs.some(dx => dx.id === "hydrocephalus-pattern")
        ? "Macrocerebellum with thick corpus callosum raises concern for a fetal overgrowth syndrome."
        : undefined;
    const overgrowthPonsCallosumImpression =
      dxs.some(dx => dx.id === "pons-large") &&
      dxs.some(dx => dx.id === "cc-thick")
        ? "Large pons with thick corpus callosum strongly suggests a fetal overgrowth-syndrome pattern."
        : undefined;
    const overgrowthPonsMacrocephalyImpression =
      dxs.some(dx => dx.id === "pons-large") &&
      dxs.some(dx => dx.id === "macrocephaly") &&
      !dxs.some(dx => dx.id === "hydrocephalus-pattern")
        ? "Large pons with macrocephaly raises concern for a fetal overgrowth-syndrome pattern."
        : undefined;
    const overgrowthPonsMacrocerebellumImpression =
      dxs.some(dx => dx.id === "pons-large") &&
      dxs.some(dx => dx.id === "tcd-large")
        ? "Large pons with macrocerebellum raises concern for a fetal overgrowth-syndrome pattern."
        : undefined;
    const hemisphericSide =
      values.brain_ofd_left != null && values.brain_ofd_right != null
        ? values.brain_ofd_left > values.brain_ofd_right
          ? "Right"
          : values.brain_ofd_right > values.brain_ofd_left
            ? "Left"
            : "Unilateral"
        : "Unilateral";
    const hemisphericDisruptionImpression =
      dxs.some(dx => dx.id === "brain-asym") &&
      dxs.some(dx => dx.id === "asym-vent") &&
      (dxs.some(dx => dx.id === "mild-vm") ||
        dxs.some(dx => dx.id === "mod-vm") ||
        dxs.some(dx => dx.id === "severe-vm")) &&
      !dxs.some(dx => dx.id === "hydrocephalus-pattern") &&
      !dxs.some(dx => dx.id === "acc-pattern") &&
      !dxs.some(dx => dx.id === "hpe-pattern")
        ? `${hemisphericSide} cerebral hemispheric asymmetry with ipsilateral ventriculomegaly suggests unilateral encephaloclastic insult or porencephaly.`
        : undefined;
    const unilateralSevereVmImpression =
      dxs.some(dx => dx.id === "severe-vm") &&
      dxs.some(dx => dx.id === "asym-vent") &&
      !dxs.some(dx => dx.id === "mild-vm") &&
      !dxs.some(dx => dx.id === "hydrocephalus-pattern") &&
      !dxs.some(dx => dx.id === "acc-pattern") &&
      !dxs.some(dx => dx.id === "hpe-pattern")
        ? "Unilateral severe ventriculomegaly with marked ventricular asymmetry is suspicious for unilateral haemorrhage or encephaloclastic insult."
        : undefined;
    const isolatedPonsHypoplasiaImpression =
      dxs.some(dx => dx.id === "pons-small") &&
      !dxs.some(dx => dx.id === "tcd-small") &&
      !dxs.some(dx => dx.id === "vermis-small") &&
      !dxs.some(dx => dx.id === "pch-pattern")
        ? "Isolated brainstem (pontine) hypoplasia — non-PCH; consider PMM2-CDG and other isolated brainstem disorders."
        : undefined;
    const isolatedThirdVentricleImpression =
      dxs.some(dx => dx.id === "third-v-wide") &&
      !dxs.some(dx => dx.id === "mild-vm") &&
      !dxs.some(dx => dx.id === "severe-vm") &&
      !dxs.some(dx => dx.id === "hydrocephalus-pattern")
        ? "Isolated third ventricle prominence — uncommon; consider early aqueductal stenosis or measurement-technique error; recommend short-interval follow-up."
        : undefined;
    const deterministicImpression = dxs.reduce<Differential | undefined>(
      (best, dx) => {
        if (!dx.impressionLine) return best;
        if (!best) return dx;
        return (dx.impressionPriority ?? 0) > (best.impressionPriority ?? 0)
          ? dx
          : best;
      },
      undefined
    );
    if (
      hpeDwmImpression ||
      accDwmImpression ||
      combinedCerebellarHypoplasiaImpression ||
      qualitativeCmvImpression ||
      brainVolumeLossImpression ||
      growthRestrictionMicrocephalyImpression ||
      extraAxialIugrImpression ||
      overgrowthMacrocerebellumImpression ||
      overgrowthMacrocephalyCallosumImpression ||
      overgrowthThickCallosumImpression ||
      overgrowthPonsCallosumImpression ||
      overgrowthPonsMacrocephalyImpression ||
      overgrowthPonsMacrocerebellumImpression ||
      hemisphericDisruptionImpression ||
      unilateralSevereVmImpression ||
      isolatedPonsHypoplasiaImpression ||
      isolatedThirdVentricleImpression ||
      deterministicImpression?.impressionLine
    ) {
      lines.push(
        hpeDwmImpression ??
          accDwmImpression ??
          combinedCerebellarHypoplasiaImpression ??
          qualitativeCmvImpression ??
          brainVolumeLossImpression ??
          growthRestrictionMicrocephalyImpression ??
          extraAxialIugrImpression ??
          overgrowthMacrocerebellumImpression ??
          overgrowthMacrocephalyCallosumImpression ??
          overgrowthThickCallosumImpression ??
          overgrowthPonsCallosumImpression ??
          overgrowthPonsMacrocephalyImpression ??
          overgrowthPonsMacrocerebellumImpression ??
          hemisphericDisruptionImpression ??
          unilateralSevereVmImpression ??
          isolatedPonsHypoplasiaImpression ??
          isolatedThirdVentricleImpression ??
          deterministicImpression!.impressionLine!
      );
      lines.push("");
      lines.push("Differential considerations ranked by likelihood:");
    } else {
      lines.push(
        "Biometric deviations were identified (see FINDINGS). The following differential considerations are suggested by the calculator's evidence-based trigger engine, ranked by likelihood:"
      );
    }
    dxs.forEach((dx, i) => {
      lines.push(
        `  ${i + 1}. ${dx.title} — ${dx.severity.toUpperCase()} — ${
          dx.oneLine
        }${dxSourceCitation(dx)}`
      );
    });
    lines.push("");
    lines.push(
      "Correlation with detailed neurosonography, maternal history, genetic testing, and TORCH screening is recommended as clinically appropriate."
    );
  } else {
    lines.push(
      "No measurements entered. Please enter biometric values to generate an impression."
    );
  }

  lines.push("");
  lines.push(
    "— Generated by the Fetal Brain MRI Biometry Calculator. Deterministic string interpolation; no PHI stored."
  );

  return lines.join("\n");
}
