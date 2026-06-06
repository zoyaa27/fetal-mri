import { describe, expect, it } from "vitest";

import {
  AUXILIARY_MEASUREMENTS,
  PARAMETERS_ALL,
  QUALITATIVE_FINDINGS,
  computeCrossValidationAudits,
  evaluateAll,
  fitLinearMeanSdSource,
  fitPerPercentileLinearSource,
  mu,
  parseGestationalAge,
  sigma,
  sourceRegistryFor,
  validateSourceRegistryExtension,
  zscore,
} from "./biometry";
import { generateReport } from "./report";

const byId = (id: string) => {
  const param = PARAMETERS_ALL.find(p => p.id === id);
  if (!param) throw new Error(`Missing parameter ${id}`);
  return param;
};

describe("SPEC §4.7 auxiliary posterior-fossa inputs", () => {
  it("surfaces cisterna magna depth and TVA without adding z-scored parameters", () => {
    expect(AUXILIARY_MEASUREMENTS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "cisterna_magna_depth",
          group: "Posterior fossa",
          unit: "mm",
        }),
        expect.objectContaining({
          id: "tva",
          group: "Posterior fossa",
          unit: "degrees",
        }),
      ])
    );
    expect(PARAMETERS_ALL.map(param => param.id)).not.toEqual(
      expect.arrayContaining(["cisterna_magna_depth", "tva"])
    );
  });
});

describe("qualitative/context UI finding registry", () => {
  it("surfaces every manual engine/report flag outside the numeric registries", () => {
    const ids = QUALITATIVE_FINDINGS.map(finding => finding.id);
    const numericIds = new Set([
      ...PARAMETERS_ALL.map(param => param.id),
      ...AUXILIARY_MEASUREMENTS.map(field => field.id),
    ]);

    expect(ids).toEqual(
      expect.arrayContaining([
        "qualitative_heterotopia_panel",
        "qualitative_interhemispheric_cyst_panel",
        "qualitative_sod_panel",
        "qualitative_cavum_vergae_panel",
        "qualitative_hpe_panel",
        "qualitative_cmv_panel",
        "qualitative_absent_primary_fissure",
        "qualitative_mcm_panel",
        "qualitative_blakes_pouch_panel",
        "growth_restriction_context",
      ])
    );
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(numericIds.has(id)).toBe(false);
    }
    expect(QUALITATIVE_FINDINGS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "qualitative_absent_primary_fissure",
          group: "Posterior fossa",
        }),
        expect.objectContaining({
          id: "growth_restriction_context",
          group: "Global brain / skull",
        }),
      ])
    );
  });
});

describe("qualitative/context report findings", () => {
  it("renders SPEC §4.8 manual qualitative inputs without z-scores", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      growth_restriction_context: 1,
      qualitative_cmv_panel: 1,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const qualitativeSection = report
      .split("QUALITATIVE / CONTEXT INPUTS")[1]
      .split("IMPRESSION")[0];

    expect(report).toContain("QUALITATIVE / CONTEXT INPUTS");
    expect(qualitativeSection).toContain(
      "Growth-restriction context: entered qualitative/context input."
    );
    expect(qualitativeSection).toContain(
      "CMV infection findings: entered qualitative/context input."
    );
    expect(qualitativeSection).not.toContain("consensus z");
    expect(qualitativeSection).not.toContain("Sources:");
  });
});

describe("auxiliary measurement report findings", () => {
  it("renders SPEC §4.8 raw-threshold auxiliary inputs without z-scores", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      cisterna_magna_depth: 12,
      tva: 30,
      frontal_horn_left: 9,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });

    expect(report).toContain("AUXILIARY INPUTS");
    expect(report).toContain(
      "Cisterna magna depth: 12.0 mm (raw threshold input)."
    );
    expect(report).toContain(
      "Tegmento-vermian angle: 30.0 degrees (raw threshold input)."
    );
    expect(report).toContain(
      "Frontal horn width — left: 9.0 mm (raw threshold input)."
    );
  });
});

describe("SPEC §4.7 colpocephaly comparison", () => {
  it("requires atrial dilation with a normal same-side frontal horn", () => {
    expect(AUXILIARY_MEASUREMENTS.map(field => field.id)).toEqual(
      expect.arrayContaining(["frontal_horn_left", "frontal_horn_right"])
    );

    const ga = { weeks: 28, days: 0 };
    const atriumOnly = evaluateAll({ atrial_left: 10.1 }, ga).dxs.map(
      dx => dx.id
    );
    const enlargedFrontalHorn = evaluateAll(
      { atrial_left: 10.1, frontal_horn_left: 10 },
      ga
    ).dxs.map(dx => dx.id);
    const colpocephaly = evaluateAll(
      { atrial_left: 10.1, frontal_horn_left: 9.9 },
      ga
    ).dxs.map(dx => dx.id);

    expect(atriumOnly).not.toContain("colpocephaly-pattern");
    expect(enlargedFrontalHorn).not.toContain("colpocephaly-pattern");
    expect(colpocephaly).toContain("colpocephaly-pattern");
  });
});

describe("multi-source consensus reconciliation", () => {
  it("uses the audited Dovjak 2021 14.0-39.3 week range in every exposed registry row", () => {
    for (const parameterId of ["tcd", "vermis_cc", "vermis_ap", "pons_ap"]) {
      const parameter = byId(parameterId);
      const dovjakEntry = sourceRegistryFor(parameter).find(
        entry => entry.source.label === "Dovjak 2021"
      );

      expect(parameter.gaRange).toEqual([14, 39.3]);
      expect(dovjakEntry?.gaRange).toEqual([14, 39.3]);
    }
  });

  it("evaluates every TCD source and computes consensus from in-range sources", () => {
    const result = zscore(byId("tcd"), { weeks: 28, days: 0 }, 33);

    expect(result).not.toBeNull();
    expect(result!.sourceDetails).toHaveLength(2);
    expect(result!.z).toBeCloseTo(0.326, 2);
    expect(result!.agreementState).toBe("agree");
    expect(result!.disagreementWidth).toBeCloseTo(0.98, 2);

    expect(result!.sourceDetails.map(s => s.sourceLabel)).toEqual([
      "Luis 2025",
      "Dovjak 2021",
    ]);
    expect(result!.sourceDetails[0]).toMatchObject({
      inRange: true,
      sourceLabel: "Luis 2025",
    });
    expect(result!.sourceDetails[0].z).toBeCloseTo(0.817, 2);
    expect(result!.sourceDetails[1].z).toBeCloseTo(-0.167, 2);
  });

  it("flags disagreement when in-range TCD source z-scores differ by at least 1 SD", () => {
    const result = zscore(byId("tcd"), { weeks: 28, days: 0 }, 33.2);

    expect(result).not.toBeNull();
    expect(result!.agreementState).toBe("disagree");
    expect(result!.disagreementWidth).toBeGreaterThanOrEqual(1);
    expect(result!.sourceDetails[0].z).toBeCloseTo(0.96, 2);
    expect(result!.sourceDetails[1].z).toBeCloseTo(-0.06, 2);
  });
});

describe("gestational-age parsing", () => {
  it("accepts weeks-plus-days and decimal-week input forms", () => {
    expect(parseGestationalAge("24+3")).toEqual({ weeks: 24, days: 3 });
    expect(parseGestationalAge("24w 3d")).toEqual({ weeks: 24, days: 3 });
    expect(parseGestationalAge("24.5 w")).toEqual({ weeks: 24, days: 4 });
  });

  it("rejects invalid day values", () => {
    expect(parseGestationalAge("24+7")).toBeNull();
  });
});

describe("centile-table source fitting", () => {
  it("fits SPEC §4.2.5 per-week centile rows into a per-percentile linear model", () => {
    const fit = fitPerPercentileLinearSource([
      { gaWeeks: 20, centile5: 18, centile95: 30 },
      { gaWeeks: 24, centile5: 22, centile95: 36 },
      { gaWeeks: 28, centile5: 26, centile95: 42 },
    ]);

    expect(fit.model).toEqual({
      kind: "dovjak-percentile",
      p5: { k: 1, d: -2 },
      p95: { k: 1.5, d: 0 },
    });
    expect(fit.residualRmse.p5).toBeCloseTo(0, 12);
    expect(fit.residualRmse.p95).toBeCloseTo(0, 12);
  });

  it("rejects underdetermined centile tables", () => {
    expect(() =>
      fitPerPercentileLinearSource([
        { gaWeeks: 20, centile5: 18, centile95: 30 },
      ])
    ).toThrow("At least two centile rows are required");
  });
});

describe("mean-SD table source fitting", () => {
  it("fits SPEC §4.2.5 per-week mean/SD rows into a linear-mean constant-SD model", () => {
    const fit = fitLinearMeanSdSource([
      { gaWeeks: 20, mean: 41, sd: 1.5 },
      { gaWeeks: 24, mean: 49, sd: 1.7 },
      { gaWeeks: 28, mean: 57, sd: 1.6 },
    ]);

    expect(fit.model.mMu).toBeCloseTo(2, 12);
    expect(fit.model.bMu).toBeCloseTo(1, 12);
    expect(fit.model.sigma).toBeCloseTo(1.6, 12);
    expect(fit.residualRmse.mean).toBeCloseTo(0, 12);
    expect(fit.residualRmse.sd).toBeCloseTo(Math.sqrt(0.02 / 3), 12);
  });

  it("rejects non-positive SD rows", () => {
    expect(() =>
      fitLinearMeanSdSource([
        { gaWeeks: 20, mean: 41, sd: 1.5 },
        { gaWeeks: 24, mean: 49, sd: 0 },
      ])
    ).toThrow("SD values must be positive");
  });
});

describe("structured report source provenance", () => {
  it("leaves Clinical Indication blank unless EHR context supplies text", () => {
    const report = generateReport({
      ga: { weeks: 28, days: 0 },
      fieldStrength: "1.5T",
      motion: "None",
      values: {},
      zs: {},
      dxs: [],
    });
    const prefilled = generateReport({
      ga: { weeks: 28, days: 0 },
      fieldStrength: "1.5T",
      motion: "None",
      clinicalIndication: "Known fetal ventriculomegaly.",
      values: {},
      zs: {},
      dxs: [],
    });

    expect(report).toMatch(/^CLINICAL INDICATION\n\nTECHNIQUE/);
    expect(prefilled).toContain(
      "CLINICAL INDICATION\nKnown fetal ventriculomegaly.\n\nTECHNIQUE"
    );
  });

  it("starts the Technique section with the fixed multi-source consensus sentence", () => {
    const report = generateReport({
      ga: { weeks: 28, days: 0 },
      fieldStrength: "1.5T",
      motion: "None",
      values: {},
      zs: {},
      dxs: [],
    });
    const techniqueLines = report
      .split("TECHNIQUE\n")[1]
      .split("\n\n")[0]
      .split("\n");

    expect(techniqueLines[0]).toBe(
      "Calculator operated in multi-source consensus mode: consensus z-score is the arithmetic mean across in-range sources, and source disagreement is flagged at Delta z >= 1.0 SD between in-range sources."
    );
  });

  it("includes per-source values and source-agreement notes for disagreeing rows", () => {
    const ga = { weeks: 28, days: 0 };
    const tcd = byId("tcd");
    const zr = zscore(tcd, ga, 33.2);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values: { tcd: 33.2 },
      zs: { tcd: zr },
      dxs: [],
    });

    expect(report).toContain("multi-source consensus mode");
    expect(report).toContain("Transcerebellar diameter: 33.2 mm");
    expect(report).toContain("agreement: disagree");
    expect(report).toContain("Luis 2025 z +0.96");
    expect(report).toContain("Dovjak 2021 z -0.06");
    expect(report).toContain("SOURCE-AGREEMENT NOTES");
    expect(report).toContain("Transcerebellar diameter Delta z 1.03");
  });

  it("places source-agreement notes immediately after Findings before auxiliary inputs", () => {
    const ga = { weeks: 28, days: 0 };
    const values = { tcd: 33.2, cisterna_magna_depth: 11 };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const findingsIndex = report.indexOf("FINDINGS");
    const notesIndex = report.indexOf("SOURCE-AGREEMENT NOTES");
    const auxiliaryIndex = report.indexOf("AUXILIARY INPUTS");

    expect(notesIndex).toBeGreaterThan(findingsIndex);
    expect(auxiliaryIndex).toBeGreaterThan(notesIndex);
    expect(report.slice(findingsIndex, notesIndex)).not.toContain(
      "AUXILIARY INPUTS"
    );
  });
});

describe("normal-control report impression", () => {
  it("uses the TEST.md normal-control impression line", () => {
    const ga = { weeks: 28, days: 0 };
    const skullBpd = byId("skull_bpd");
    const zr = zscore(skullBpd, ga, 75.5);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values: { skull_bpd: 75.5 },
      zs: { skull_bpd: zr },
      dxs: [],
    });

    expect(report).toContain("IMPRESSION\nNo abnormal biometric findings.");
  });
});

describe("mild ventriculomegaly report impression", () => {
  it("uses the TEST.md Case M1 isolated mild VM impression line", () => {
    const ga = { weeks: 24, days: 0 };
    const values = {
      atrial_left: 11,
      atrial_right: 11,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });

    expect(dxs.map(dx => dx.id)).toContain("mild-vm");
    expect(report).toContain(
      "Isolated mild ventriculomegaly; consider postnatal MRI follow-up. Pooled neurodevelopmental delay rate ~7.9% (Pagani 2014)."
    );
  });

  it("citation-grounds generated Impression differential lines", () => {
    const ga = { weeks: 24, days: 0 };
    const values = {
      atrial_left: 11,
      atrial_right: 11,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });

    expect(report).toContain(
      "Mild ventriculomegaly (atrial 10–12 mm) — WATCH — Atrial diameter 10–12 mm — soft marker. Sources: Pagani 2014 https://pubmed.ncbi.nlm.nih.gov/24623452/; SMFM 2018 https://www.ajog.org/article/S0002-9378(18)30336-3/fulltext"
    );
  });
});

describe("SPEC §7.4 mild ventriculomegaly likelihood manifest", () => {
  it("keeps the transcribed Pagani statistic but qualitative-labels estimate rows", () => {
    const ga = { weeks: 24, days: 0 };
    const values = {
      atrial_left: 11,
      atrial_right: 11,
    };
    const { dxs } = evaluateAll(values, ga);
    const mildVm = dxs.find(dx => dx.id === "mild-vm");

    expect(mildVm?.rows.map(row => row.likelihood)).toEqual([
      "Most cases",
      "Minority",
      "Minority",
      "Minority",
      "Minority",
      "Rare",
    ]);
    expect(mildVm?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~70|~10|~5|~2/
    );
    expect(mildVm?.rows[0].rationale).toContain(
      "Neurodevelopmental delay ~7.9% in isolated mild VM (Pagani 2014)."
    );
  });
});

describe("moderate ventriculomegaly report impression", () => {
  it("uses the TEST.md Case M4 moderate VM follow-up impression line", () => {
    const ga = { weeks: 26, days: 0 };
    const values = {
      atrial_left: 13.5,
      atrial_right: 13.5,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("mod-vm");
    expect(dxIds).not.toContain("severe-vm");
    expect(dxIds).not.toContain("asym-vent");
    expect(report).toContain(
      "Moderate ventriculomegaly (12–14.9 mm); recommend follow-up imaging to detect progression toward severe ventriculomegaly and evaluate associated anomalies."
    );
  });
});

describe("SPEC §7.4 moderate ventriculomegaly likelihood manifest", () => {
  it("qualitative-labels the estimate-only moderate-VM likelihood rows", () => {
    const ga = { weeks: 26, days: 0 };
    const values = {
      atrial_left: 13.5,
      atrial_right: 13.5,
    };
    const { dxs } = evaluateAll(values, ga);
    const modVm = dxs.find(dx => dx.id === "mod-vm");

    expect(modVm?.rows.map(row => row.likelihood)).toEqual([
      "Common",
      "Minority",
      "Common",
      "Rare",
    ]);
    expect(modVm?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~30|~10|~50|~3/
    );
  });
});

describe("near-severe ventriculomegaly boundary report impression", () => {
  it("uses the TEST.md Case M2 approaching-severe-threshold wording", () => {
    const ga = { weeks: 32, days: 0 };
    const values = {
      atrial_left: 14.5,
      atrial_right: 14.5,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("mod-vm");
    expect(dxIds).not.toContain("severe-vm");
    expect(report).toContain(
      "Moderate ventriculomegaly approaching the severe threshold (15 mm); recommend short-interval follow-up imaging to detect progression."
    );
  });
});

describe("asymmetric mild ventriculomegaly report impression", () => {
  it("uses the TEST.md Case M3 asymmetric mild VM impression line", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      atrial_right: 12,
      atrial_left: 7.4,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });

    expect(dxs.map(dx => dx.id)).toEqual(
      expect.arrayContaining(["mild-vm", "asym-vent"])
    );
    expect(report).toContain(
      "Right-sided mild ventriculomegaly with marked side-to-side asymmetry; recommend dedicated workup for unilateral causes (intra-ventricular obstruction, encephaloclastic insult, germinal matrix haemorrhage)."
    );
  });
});

describe("pure ventricular asymmetry report classification", () => {
  it("uses TEST.md Case AS1 as an abnormal DDx-card case", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      atrial_right: 9.3,
      atrial_left: 7.2,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("asym-vent");
    expect(dxIds).not.toContain("mild-vm");
    expect(dxIds).not.toContain("severe-vm");
    expect(report).not.toContain("No abnormal biometric findings.");
    expect(report).toContain("Asymmetric lateral ventricles");
  });
});

describe("hemispheric asymmetry z-delta boundary", () => {
  it("does not fire TEST.md §24 hemispheric asymmetry below the >2 SD threshold", () => {
    const ga = { weeks: 30, days: 0 };
    const gaWeeks = 30;
    const left = byId("brain_ofd_left");
    const right = byId("brain_ofd_right");
    const values = {
      brain_ofd_left: mu(left, gaWeeks) + 0.8 * sigma(left, gaWeeks),
      brain_ofd_right: mu(right, gaWeeks) - 0.8 * sigma(right, gaWeeks),
    };
    const rawPct =
      Math.abs(values.brain_ofd_left - values.brain_ofd_right) /
      ((values.brain_ofd_left + values.brain_ofd_right) / 2);
    const { zs, dxs } = evaluateAll(values, ga);
    const deltaZ = Math.abs(zs.brain_ofd_left!.z - zs.brain_ofd_right!.z);

    expect(rawPct).toBeGreaterThan(0.05);
    expect(deltaZ).toBeGreaterThan(1.5);
    expect(deltaZ).toBeLessThan(2);
    expect(dxs.map(dx => dx.id)).not.toContain("brain-asym");
  });

  it("fires TEST.md §24 hemispheric asymmetry above the >2 SD threshold", () => {
    const ga = { weeks: 30, days: 0 };
    const gaWeeks = 30;
    const left = byId("brain_ofd_left");
    const right = byId("brain_ofd_right");
    const values = {
      brain_ofd_left: mu(left, gaWeeks) + 1.1 * sigma(left, gaWeeks),
      brain_ofd_right: mu(right, gaWeeks) - 1.1 * sigma(right, gaWeeks),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const deltaZ = Math.abs(zs.brain_ofd_left!.z - zs.brain_ofd_right!.z);

    expect(deltaZ).toBeGreaterThan(2);
    expect(dxs.map(dx => dx.id)).toContain("brain-asym");
  });
});

describe("hemispheric disruption report impression", () => {
  it("uses TEST.md Case HA1 combined asymmetry plus ventriculomegaly wording", () => {
    const ga = { weeks: 28, days: 0 };
    const gaWeeks = 28;
    const brainOfd = byId("brain_ofd_right");
    const values = {
      brain_ofd_left: mu(byId("brain_ofd_left"), gaWeeks),
      brain_ofd_right: mu(brainOfd, gaWeeks) - 2.2 * sigma(brainOfd, gaWeeks),
      atrial_right: 12,
      atrial_left: 8,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["brain-asym", "asym-vent", "mild-vm"])
    );
    expect(report).toContain(
      "Right cerebral hemispheric asymmetry with ipsilateral ventriculomegaly suggests unilateral encephaloclastic insult or porencephaly."
    );
  });
});

describe("unilateral severe VM asymmetry report impression", () => {
  it("uses the TEST.md Case AS6 unilateral destructive-insult wording", () => {
    const ga = { weeks: 32, days: 0 };
    const values = {
      atrial_right: 15,
      atrial_left: 7.6,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(expect.arrayContaining(["severe-vm", "asym-vent"]));
    expect(dxIds).not.toContain("mild-vm");
    expect(report).toContain(
      "Unilateral severe ventriculomegaly with marked ventricular asymmetry is suspicious for unilateral haemorrhage or encephaloclastic insult."
    );
  });
});

describe("isolated severe ventriculomegaly report impression", () => {
  it("uses the TEST.md Case S3 isolated severe VM impression line", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      atrial_right: 17.5,
      atrial_left: 17.5,
      csp_width: 4.4,
      cc_length: 32.5,
      third_ventricle: 2,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("severe-vm");
    expect(dxIds).not.toContain("mild-vm");
    expect(dxIds).not.toContain("hydrocephalus-pattern");
    expect(dxIds).not.toContain("acc-pattern");
    expect(dxIds).not.toContain("hpe-pattern");
    expect(report).toContain(
      "Apparently isolated severe ventriculomegaly. Postnatal MRI is recommended to confirm the absence of associated anomalies. Per Carta 2018: ~80% survival, ~40% normal neurodevelopment among survivors."
    );
  });
});

describe("SPEC §7.4 severe ventriculomegaly likelihood manifest", () => {
  it("qualitative-labels severe-VM estimates and uses the corrected aqueductal source", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      atrial_right: 17.5,
      atrial_left: 17.5,
      third_ventricle: 2,
    };
    const { dxs } = evaluateAll(values, ga);
    const severeVm = dxs.find(dx => dx.id === "severe-vm");

    expect(severeVm?.rows.map(row => row.likelihood)).toEqual([
      "Common",
      "High",
      "Significant",
      "Rare",
      "Minority",
    ]);
    expect(severeVm?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~20|~1|~10/
    );
    expect(severeVm?.rows[0].rationale).toContain("Heaphy-Henault 2018");
    expect(severeVm?.rows[0].rationale).not.toContain("Garel 2018");
  });
});

describe("SPEC §7.4 absent-CSP likelihood manifest", () => {
  it("qualitative-labels absent-CSP estimates while preserving the ACC rationale", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      csp_width: 0,
    };
    const { dxs } = evaluateAll(values, ga);
    const absentCsp = dxs.find(dx => dx.id === "absent-csp");

    expect(absentCsp?.rows.map(row => row.likelihood)).toEqual([
      "Common",
      "Common",
      "Minority",
      "Minority",
      "Rare",
    ]);
    expect(absentCsp?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~50|~55|~10|~5|<5/
    );
    expect(absentCsp?.rows[1].rationale).toContain(
      "Absent CSP in ~2/3 of ACC cases (SMFM 2020)."
    );
  });
});

describe("SPEC §7.4 enlarged-CSP likelihood manifest", () => {
  it("qualitative-labels the estimate-only enlarged-CSP likelihood rows", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      csp_width: 11,
    };
    const { dxs } = evaluateAll(values, ga);
    const enlargedCsp = dxs.find(dx => dx.id === "enlarged-csp");

    expect(enlargedCsp?.rows.map(row => row.likelihood)).toEqual([
      "Most cases",
      "Minority",
      "Rare",
      "Rare",
      "Very rare",
    ]);
    expect(enlargedCsp?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~85|~5|<5|~1|<1/
    );
  });
});

describe("SPEC §7.4 complete-ACC likelihood manifest", () => {
  it("keeps the Santo isolated-ACC statistic but qualitative-labels approximate rows", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      cc_length: 1,
    };
    const { dxs } = evaluateAll(values, ga);
    const completeAcc = dxs.find(dx => dx.id === "cc-absent");

    expect(completeAcc?.rows.map(row => row.likelihood)).toEqual([
      "~65–75%",
      "Minority",
      "Minority",
      "Variable",
    ]);
    expect(completeAcc?.rows[0].rationale).toContain(
      "Normal neurodevelopment in 65–75% of isolated ACC (Santo 2012)."
    );
    expect(
      completeAcc?.rows
        .slice(1)
        .map(row => row.likelihood)
        .join(" ")
    ).not.toMatch(/~30|~15/);
  });
});

describe("SPEC §7.4 partial-ACC likelihood manifest", () => {
  it("qualitative-labels the estimate-only partial/hypogenesis CC rows", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      cc_length: 30,
    };
    const { dxs } = evaluateAll(values, ga);
    const partialAcc = dxs.find(dx => dx.id === "cc-short");

    expect(partialAcc?.rows.map(row => row.likelihood)).toEqual([
      "Most common",
      "Minority",
      "Minority",
      "Variable",
    ]);
    expect(partialAcc?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~50|~25|~15/
    );
    expect(partialAcc?.rows[1].rationale).toContain("Sun 2024");
  });
});

describe("SPEC §7.4 small-pons likelihood manifest", () => {
  it("qualitative-labels small-pons estimate rows while preserving van Dijk attribution", () => {
    const ga = { weeks: 32, days: 0 };
    const values = {
      pons_ap: 9,
    };
    const { dxs } = evaluateAll(values, ga);
    const smallPons = dxs.find(dx => dx.id === "pons-small");

    expect(smallPons?.rows.map(row => row.likelihood)).toEqual([
      "Most common",
      "Minority",
      "Minority",
      "Rare",
      "Rare",
      "Modest",
    ]);
    expect(smallPons?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~40|~10|~5/
    );
    expect(smallPons?.rows[0].rationale).toContain("van Dijk 2018");
  });
});

describe("SPEC §7.4 small-vermis likelihood manifest", () => {
  it("qualitative-labels the estimate-only small-vermis likelihood rows", () => {
    const ga = { weeks: 26, days: 0 };
    const values = {
      vermis_cc: 11.5,
      vermis_ap: 5.3,
    };
    const { dxs } = evaluateAll(values, ga);
    const smallVermis = dxs.find(dx => dx.id === "vermis-small");

    expect(smallVermis?.rows.map(row => row.likelihood)).toEqual([
      "Common",
      "Minority",
      "Minority",
      "Minority",
    ]);
    expect(smallVermis?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~30|~20|~10|~15/
    );
  });
});

describe("SPEC §7.4 third-ventricle likelihood manifest", () => {
  it("qualitative-labels the wide-third-ventricle estimate rows", () => {
    const ga = { weeks: 30, days: 0 };
    const values = {
      third_ventricle: 4,
    };
    const { dxs } = evaluateAll(values, ga);
    const thirdVentricle = dxs.find(dx => dx.id === "third-v-wide");

    expect(thirdVentricle?.rows.map(row => row.likelihood)).toEqual([
      "Common",
      "Minority",
      "Minority",
      "Rare",
    ]);
    expect(
      thirdVentricle?.rows.map(row => row.likelihood).join(" ")
    ).not.toMatch(/~55|~10|~5/);
  });
});

describe("SPEC §7.4 microcephaly likelihood manifest", () => {
  it("qualitative-labels the estimate-only microcephaly likelihood rows", () => {
    const ga = { weeks: 30, days: 0 };
    const gaWeeks = 30;
    const skullBpd = byId("skull_bpd");
    const values = {
      skull_bpd: mu(skullBpd, gaWeeks) - 1.9 * sigma(skullBpd, gaWeeks),
    };
    const { dxs } = evaluateAll(values, ga);
    const microcephaly = dxs.find(dx => dx.id === "microcephaly");

    expect(microcephaly?.rows.map(row => row.likelihood)).toEqual([
      "Common",
      "Minority",
      "Minority",
      "Minority",
      "Minority",
    ]);
    expect(microcephaly?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~30|~15|~10/
    );
  });
});

describe("SPEC §7.4 macrocephaly likelihood manifest", () => {
  it("qualitative-labels the estimate-only macrocephaly likelihood rows", () => {
    const ga = { weeks: 30, days: 0 };
    const gaWeeks = 30;
    const skullBpd = byId("skull_bpd");
    const values = {
      skull_bpd: mu(skullBpd, gaWeeks) + 1.9 * sigma(skullBpd, gaWeeks),
    };
    const { dxs } = evaluateAll(values, ga);
    const macrocephaly = dxs.find(dx => dx.id === "macrocephaly");

    expect(macrocephaly?.rows.map(row => row.likelihood)).toEqual([
      "Common",
      "Minority",
      "Minority",
      "Rare",
    ]);
    expect(macrocephaly?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~30|~20|~15|~5/
    );
  });
});

describe("SPEC §7.4 hydrocephalus-pattern likelihood manifest", () => {
  it("qualitative-labels the estimate-only hydrocephalus combined-pattern rows", () => {
    const ga = { weeks: 26, days: 0 };
    const values = {
      atrial_right: 18,
      atrial_left: 18,
      csp_width: 3.9,
      cc_length: 28,
      third_ventricle: 4.5,
    };
    const { dxs } = evaluateAll(values, ga);
    const hydrocephalus = dxs.find(dx => dx.id === "hydrocephalus-pattern");

    expect(hydrocephalus?.rows.map(row => row.likelihood)).toEqual([
      "Most common",
      "Rare",
      "Minority",
    ]);
    expect(
      hydrocephalus?.rows.map(row => row.likelihood).join(" ")
    ).not.toMatch(/~70|~5|~10/);
  });
});

describe("SPEC §7.4 HPE-pattern likelihood manifest", () => {
  it("qualitative-labels the estimate-only HPE combined-pattern rows", () => {
    const ga = { weeks: 32, days: 0 };
    const values = {
      skull_bpd: 75,
      skull_ofd: 95,
      brain_bpd: 73,
      brain_ofd_left: 92,
      brain_ofd_right: 92,
      atrial_right: 20,
      atrial_left: 20,
      csp_width: 0,
      cc_length: 0,
    };
    const { dxs } = evaluateAll(values, ga);
    const hpe = dxs.find(dx => dx.id === "hpe-pattern");

    expect(hpe?.rows.map(row => row.likelihood)).toEqual([
      "Most common",
      "Minority",
      "Rare",
    ]);
    expect(hpe?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~70|~15|~5/
    );
  });
});

describe("SPEC §7.4 ACC-pattern likelihood manifest", () => {
  it("qualitative-labels the estimate-only ACC combined-pattern rows", () => {
    const ga = { weeks: 24, days: 0 };
    const values = {
      skull_bpd: 60.6,
      skull_ofd: 84.5,
      brain_bpd: 58.4,
      brain_ofd_left: 79.5,
      brain_ofd_right: 79.6,
      atrial_right: 16,
      atrial_left: 16,
      csp_width: 0,
      cc_length: 0,
      third_ventricle: 1.5,
    };
    const { dxs } = evaluateAll(values, ga);
    const acc = dxs.find(dx => dx.id === "acc-pattern");

    expect(acc?.rows.map(row => row.likelihood)).toEqual([
      "Most common",
      "Minority",
      "Minority",
    ]);
    expect(acc?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~70|~25|~10/
    );
  });
});

describe("SPEC §7.4 DWM-pattern likelihood manifest", () => {
  it("qualitative-labels the estimate-only Dandy-Walker combined-pattern rows", () => {
    const ga = { weeks: 28, days: 0 };
    const gaWeeks = 28;
    const values = {
      vermis_cc:
        mu(byId("vermis_cc"), gaWeeks) -
        1.9 * sigma(byId("vermis_cc"), gaWeeks),
      vermis_ap:
        mu(byId("vermis_ap"), gaWeeks) -
        1.9 * sigma(byId("vermis_ap"), gaWeeks),
      tva: 60,
      tcd: mu(byId("tcd"), gaWeeks),
      pons_ap: mu(byId("pons_ap"), gaWeeks),
    };
    const { dxs } = evaluateAll(values, ga);
    const dwm = dxs.find(dx => dx.id === "dwm-pattern");

    expect(dwm?.rows.map(row => row.likelihood)).toEqual([
      "Most common",
      "Minority",
      "Minority",
    ]);
    expect(dwm?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~60|~25|~10/
    );
  });
});

describe("SPEC §7.4 PCH-pattern likelihood manifest", () => {
  it("qualitative-labels the estimate-only pontocerebellar-hypoplasia combined-pattern rows", () => {
    const ga = { weeks: 28, days: 0 };
    const gaWeeks = 28;
    const values = {
      pons_ap:
        mu(byId("pons_ap"), gaWeeks) - 1.9 * sigma(byId("pons_ap"), gaWeeks),
      vermis_cc:
        mu(byId("vermis_cc"), gaWeeks) -
        1.9 * sigma(byId("vermis_cc"), gaWeeks),
      tcd: mu(byId("tcd"), gaWeeks),
    };
    const { dxs } = evaluateAll(values, ga);
    const pch = dxs.find(dx => dx.id === "pch-pattern");

    expect(pch?.rows.map(row => row.likelihood)).toEqual([
      "Most common",
      "Minority",
      "Minority",
      "Rare",
    ]);
    expect(pch?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~50|~15|~20|~5/
    );
  });
});

describe("hemispheric-asymmetry likelihood labels", () => {
  it("qualitative-labels the estimate-only brain-asym likelihood rows", () => {
    const ga = { weeks: 30, days: 0 };
    const gaWeeks = 30;
    const left = byId("brain_ofd_left");
    const right = byId("brain_ofd_right");
    const values = {
      brain_ofd_left: mu(left, gaWeeks) + 1.1 * sigma(left, gaWeeks),
      brain_ofd_right: mu(right, gaWeeks) - 1.1 * sigma(right, gaWeeks),
    };
    const { dxs } = evaluateAll(values, ga);
    const brainAsym = dxs.find(dx => dx.id === "brain-asym");

    expect(brainAsym?.rows.map(row => row.likelihood)).toEqual([
      "Minority",
      "Minority",
      "Minority",
      "Rare",
    ]);
    expect(brainAsym?.rows.map(row => row.likelihood).join(" ")).not.toMatch(
      /~25|~15|~5/
    );
  });
});

describe("aqueductal-stenosis pattern report impression", () => {
  it("uses the TEST.md Case S1 triventricular hydrocephalus impression line", () => {
    const ga = { weeks: 26, days: 0 };
    const values = {
      skull_bpd: 72,
      skull_ofd: 100,
      brain_bpd: 65.5,
      brain_ofd_left: 88,
      brain_ofd_right: 88.1,
      atrial_right: 18,
      atrial_left: 18,
      csp_width: 3.9,
      cc_length: 28,
      third_ventricle: 4.5,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining([
        "severe-vm",
        "third-v-wide",
        "macrocephaly",
        "hydrocephalus-pattern",
      ])
    );
    expect(dxIds).not.toContain("mild-vm");
    expect(dxIds).not.toContain("acc-pattern");
    expect(dxIds).not.toContain("hpe-pattern");
    expect(report).toContain(
      "Severe triventricular hydrocephalus with preserved CSP and macrocephaly — pattern most consistent with congenital aqueductal stenosis."
    );
  });

  it("fires the TEST.md Case AS-P2 early-evolving aqueductal-stenosis pattern", () => {
    const ga = { weeks: 30, days: 0 };
    const gaWeeks = 30;
    const values = {
      atrial_right: 14,
      atrial_left: 14,
      csp_width: 7.7,
      cc_length: 36,
      third_ventricle: 5.5,
      skull_bpd: 79,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining([
        "mod-vm",
        "third-v-wide",
        "hydrocephalus-pattern",
      ])
    );
    expect(dxIds).not.toContain("severe-vm");
    expect(dxIds).not.toContain("macrocephaly");
    expect(report).toContain(
      "Early triventricular hydrocephalus pattern with preserved CSP; findings may represent evolving aqueductal stenosis."
    );
  });
});

describe("aqueductal-stenosis absent-CSP negative control", () => {
  it("does not fire hydrocephalus-pattern for TEST.md Case AS-P3", () => {
    const { dxs } = evaluateAll(
      {
        atrial_right: 18,
        atrial_left: 18,
        csp_width: 0,
        third_ventricle: 4,
      },
      { weeks: 28, days: 0 }
    );
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["severe-vm", "absent-csp", "third-v-wide"])
    );
    expect(dxIds).not.toContain("hydrocephalus-pattern");
  });
});

describe("isolated third-ventricle report impression", () => {
  it("uses the TEST.md Case TV2 short-interval follow-up impression", () => {
    const ga = { weeks: 30, days: 0 };
    const values = {
      third_ventricle: 4,
      atrial_right: 8,
      atrial_left: 8,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("third-v-wide");
    expect(dxIds).not.toContain("mild-vm");
    expect(dxIds).not.toContain("severe-vm");
    expect(dxIds).not.toContain("hydrocephalus-pattern");
    expect(report).toContain(
      "Isolated third ventricle prominence — uncommon; consider early aqueductal stenosis or measurement-technique error; recommend short-interval follow-up."
    );
  });
});

describe("ACC pattern report impression", () => {
  it("uses the TEST.md Case S2 complete ACC impression line", () => {
    const ga = { weeks: 24, days: 0 };
    const values = {
      skull_bpd: 60.6,
      skull_ofd: 84.5,
      brain_bpd: 58.4,
      brain_ofd_left: 79.5,
      brain_ofd_right: 79.6,
      atrial_right: 16,
      atrial_left: 16,
      csp_width: 0,
      cc_length: 0,
      third_ventricle: 1.5,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining([
        "severe-vm",
        "absent-csp",
        "cc-absent",
        "acc-pattern",
      ])
    );
    expect(dxIds).not.toContain("mild-vm");
    expect(dxIds).not.toContain("hydrocephalus-pattern");
    expect(dxIds).not.toContain("hpe-pattern");
    expect(report).toContain(
      "Complete agenesis of the corpus callosum with associated colpocephaly. Counselling per Santo 2012: 65–75% normal neurodevelopment when isolated; 30% monogenic aetiology."
    );
  });
});

describe("ACC heterotopia qualitative add-on", () => {
  it("uses the TEST.md Case A2 heterotopia toggle without changing ACC thresholds", () => {
    const ga = { weeks: 36, days: 3 };
    const baseValues = {
      csp_width: 0,
      cc_length: 0,
      atrial_right: 13,
      atrial_left: 13,
    };
    const baseIds = evaluateAll(baseValues, ga).dxs.map(dx => dx.id);
    const { zs, dxs } = evaluateAll(
      { ...baseValues, qualitative_heterotopia_panel: 1 },
      ga
    );
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values: { ...baseValues, qualitative_heterotopia_panel: 1 },
      zs,
      dxs,
    });
    const toggledIds = dxs.map(dx => dx.id);

    expect(baseIds).toContain("acc-pattern");
    expect(baseIds).not.toContain("heterotopia-dd");
    expect(toggledIds).toEqual(
      expect.arrayContaining(["acc-pattern", "heterotopia-dd"])
    );
    expect(report).toContain(
      "Associated heterotopia / cortical malformation qualitative add-on"
    );
  });
});

describe("ACC interhemispheric-cyst qualitative add-on", () => {
  it("uses the TEST.md Case A5 interhemispheric-cyst toggle without changing ACC thresholds", () => {
    const ga = { weeks: 24, days: 0 };
    const baseValues = {
      csp_width: 0,
      cc_length: 0,
      atrial_right: 16,
      atrial_left: 16,
      brain_ofd_left: 65.1,
      brain_ofd_right: 65.1,
    };
    const baseIds = evaluateAll(baseValues, ga).dxs.map(dx => dx.id);
    const { zs, dxs } = evaluateAll(
      { ...baseValues, qualitative_interhemispheric_cyst_panel: 1 },
      ga
    );
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values: { ...baseValues, qualitative_interhemispheric_cyst_panel: 1 },
      zs,
      dxs,
    });
    const toggledIds = dxs.map(dx => dx.id);

    expect(baseIds).toEqual(
      expect.arrayContaining(["severe-vm", "acc-pattern"])
    );
    expect(baseIds).not.toContain("interhemispheric-cyst-dd");
    expect(toggledIds).toEqual(
      expect.arrayContaining(["acc-pattern", "interhemispheric-cyst-dd"])
    );
    expect(report).toContain("Interhemispheric cyst qualitative add-on");
  });
});

describe("isolated absent CSP report impression", () => {
  it("uses the TEST.md Case CSP-A3 midline-screening impression", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      csp_width: 0,
      cc_length: 32,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("absent-csp");
    expect(dxIds).not.toContain("acc-pattern");
    expect(dxIds).not.toContain("hpe-pattern");
    expect(report).toContain(
      "Absent cavum septum pellucidum; evaluate for septo-optic dysplasia, corpus callosum abnormality, and mild holoprosencephaly-spectrum findings."
    );
  });
});

describe("absent CSP SOD qualitative manual entry", () => {
  it("adds the TEST.md Case CSP-A3 small-optic-apparatus advisory without replacing absent-CSP wording", () => {
    const ga = { weeks: 28, days: 0 };
    const baseValues = {
      csp_width: 0,
      cc_length: 32,
    };
    const baseIds = evaluateAll(baseValues, ga).dxs.map(dx => dx.id);
    const toggled = evaluateAll(
      { ...baseValues, qualitative_sod_panel: 1 },
      ga
    );
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values: { ...baseValues, qualitative_sod_panel: 1 },
      zs: toggled.zs,
      dxs: toggled.dxs,
    });

    expect(baseIds).toContain("absent-csp");
    expect(baseIds).not.toContain("sod-dd");
    expect(baseIds).not.toContain("acc-pattern");
    expect(baseIds).not.toContain("hpe-pattern");
    expect(toggled.dxs.map(dx => dx.id)).toEqual(
      expect.arrayContaining(["absent-csp", "sod-dd"])
    );
    expect(report).toContain(
      "Absent cavum septum pellucidum; evaluate for septo-optic dysplasia, corpus callosum abnormality, and mild holoprosencephaly-spectrum findings."
    );
    expect(report).toContain("Septo-optic dysplasia qualitative add-on");
  });
});

describe("isolated enlarged CSP report impression", () => {
  it("uses the TEST.md Case CSP-E1 benign-variant impression", () => {
    const ga = { weeks: 32, days: 0 };
    const values = {
      csp_width: 11.5,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });

    expect(dxs.map(dx => dx.id)).toEqual(["enlarged-csp"]);
    expect(report).toContain(
      "Isolated enlarged CSP / cavum vergae is usually benign; correlate for cavum velum interpositum cyst or associated anomalies."
    );
  });
});

describe("enlarged CSP cavum-vergae qualitative label", () => {
  it("adds the TEST.md Case CSP-E3 cavum-vergae label only when entered", () => {
    const ga = { weeks: 28, days: 0 };
    const baseValues = {
      csp_width: 13,
    };
    const baseIds = evaluateAll(baseValues, ga).dxs.map(dx => dx.id);
    const toggled = evaluateAll(
      { ...baseValues, qualitative_cavum_vergae_panel: 1 },
      ga
    );
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values: { ...baseValues, qualitative_cavum_vergae_panel: 1 },
      zs: toggled.zs,
      dxs: toggled.dxs,
    });

    expect(baseIds).toEqual(["enlarged-csp"]);
    expect(toggled.dxs.map(dx => dx.id)).toEqual(
      expect.arrayContaining(["enlarged-csp", "cavum-vergae-dd"])
    );
    expect(report).toContain("Cavum vergae qualitative add-on");
  });
});

describe("short corpus callosum report impression", () => {
  it("uses the TEST.md Case A4 partial corpus-callosum impression", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      csp_width: 7.6,
      cc_length: 29.4,
      atrial_right: 7.4,
      atrial_left: 7.4,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("cc-short");
    expect(dxIds).not.toContain("cc-absent");
    expect(dxIds).not.toContain("acc-pattern");
    expect(report).toContain(
      "Partial / hypogenetic corpus callosum; postnatal MRI is recommended for confirmation."
    );
  });
});

describe("HPE pattern report impression", () => {
  it("uses the TEST.md Case S5 alobar HPE impression line", () => {
    const ga = { weeks: 32, days: 0 };
    const values = {
      skull_bpd: 75,
      skull_ofd: 95,
      brain_bpd: 73,
      brain_ofd_left: 92,
      brain_ofd_right: 92,
      atrial_right: 20,
      atrial_left: 20,
      csp_width: 0,
      cc_length: 0,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining([
        "severe-vm",
        "absent-csp",
        "cc-absent",
        "microcephaly",
        "hpe-pattern",
      ])
    );
    expect(dxIds).not.toContain("acc-pattern");
    expect(dxIds).not.toContain("hydrocephalus-pattern");
    expect(report).toContain(
      "Alobar holoprosencephaly. Counselling per Malinger 2013: poor prognosis; chromosomal microarray and exome sequencing indicated."
    );
  });

  it("fires HPE at the TEST.md §19 3rd-percentile microcephaly threshold", () => {
    const ga = { weeks: 28, days: 0 };
    const gaWeeks = 28;
    const skullBpd = byId("skull_bpd");
    const values = {
      skull_bpd: mu(skullBpd, gaWeeks) - 1.9 * sigma(skullBpd, gaWeeks),
      atrial_right: 16,
      atrial_left: 16,
      csp_width: 0,
      cc_length: mu(byId("cc_length"), gaWeeks),
    };
    const { dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining([
        "severe-vm",
        "absent-csp",
        "microcephaly",
        "hpe-pattern",
      ])
    );
    expect(dxIds).not.toContain("acc-pattern");
  });

  it("requires qualitative TEST.md Case HPE3 findings for mild-range HPE pattern", () => {
    const ga = { weeks: 30, days: 0 };
    const gaWeeks = 30;
    const baseValues = {
      skull_bpd:
        mu(byId("skull_bpd"), gaWeeks) -
        1.9 * sigma(byId("skull_bpd"), gaWeeks),
      atrial_right: 12,
      atrial_left: 12,
      csp_width: 0,
      cc_length: mu(byId("cc_length"), gaWeeks),
    };
    const withoutQualitative = evaluateAll(baseValues, ga).dxs.map(dx => dx.id);
    const withQualitative = evaluateAll(
      { ...baseValues, qualitative_hpe_panel: 1 },
      ga
    ).dxs.map(dx => dx.id);

    expect(withoutQualitative).toEqual(
      expect.arrayContaining(["mild-vm", "absent-csp", "microcephaly"])
    );
    expect(withoutQualitative).not.toContain("hpe-pattern");
    expect(withQualitative).toEqual(
      expect.arrayContaining([
        "mild-vm",
        "absent-csp",
        "microcephaly",
        "hpe-pattern",
      ])
    );
  });
});

describe("combined HPE and Dandy-Walker report impression", () => {
  it("enumerates both TEST.md §16/§27 combined-pattern diagnoses", () => {
    const ga = { weeks: 26, days: 0 };
    const gaWeeks = 26;
    const values = {
      skull_bpd:
        mu(byId("skull_bpd"), gaWeeks) -
        1.9 * sigma(byId("skull_bpd"), gaWeeks),
      atrial_right: 18,
      atrial_left: 18,
      csp_width: 0,
      cc_length: 0,
      vermis_cc:
        mu(byId("vermis_cc"), gaWeeks) -
        1.9 * sigma(byId("vermis_cc"), gaWeeks),
      vermis_ap:
        mu(byId("vermis_ap"), gaWeeks) -
        1.9 * sigma(byId("vermis_ap"), gaWeeks),
      tva: 95,
      tcd: mu(byId("tcd"), gaWeeks),
      pons_ap: mu(byId("pons_ap"), gaWeeks),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["hpe-pattern", "dwm-pattern"])
    );
    expect(report).toContain(
      "Alobar holoprosencephaly. Counselling per Malinger 2013: poor prognosis; chromosomal microarray and exome sequencing indicated. Dandy-Walker spectrum with elevated tegmento-vermian angle is also present."
    );
  });
});

describe("CMV qualitative microcephaly report impression", () => {
  it("uses the TEST.md Case MC5 qualitative CMV add-on and impression", () => {
    const ga = { weeks: 32, days: 0 };
    const baseValues = {
      skull_bpd: 76,
      brain_bpd: 70,
      atrial_right: 12,
      atrial_left: 12,
    };
    const values = {
      ...baseValues,
      qualitative_cmv_panel: 1,
    };
    const baseIds = evaluateAll(baseValues, ga).dxs.map(dx => dx.id);
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(baseIds).toEqual(
      expect.arrayContaining(["microcephaly", "mild-vm"])
    );
    expect(baseIds).not.toContain("cmv-dd");
    expect(dxIds).toEqual(
      expect.arrayContaining(["microcephaly", "mild-vm", "cmv-dd"])
    );
    expect(report).toContain(
      "Microcephaly with ventriculomegaly and qualitative CMV findings suggests congenital CMV infection."
    );
    expect(report).toContain("Congenital CMV qualitative add-on");
  });
});

describe("growth-restriction microcephaly report impression", () => {
  it("uses the TEST.md Case MC6 growth-restriction context impression", () => {
    const ga = { weeks: 30, days: 0 };
    const values = {
      skull_bpd: 72,
      brain_bpd: 70,
      growth_restriction_context: 1,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("microcephaly");
    expect(report).toContain(
      "Microcephaly with entered growth-restriction context favors symmetric IUGR-associated microcephaly over primary microcephaly."
    );
  });
});

describe("mixed-tier asymmetric ventriculomegaly triggers", () => {
  it("fires severe VM, mild VM, and asymmetry for TEST.md Case S4", () => {
    const { dxs } = evaluateAll(
      {
        atrial_right: 15.5,
        atrial_left: 11,
        csp_width: 4.7,
        cc_length: 36,
        third_ventricle: 1.7,
      },
      { weeks: 30, days: 0 }
    );
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["severe-vm", "mild-vm", "asym-vent"])
    );
    expect(dxIds).not.toContain("hydrocephalus-pattern");
    expect(dxIds).not.toContain("acc-pattern");
    expect(dxIds).not.toContain("hpe-pattern");
  });
});

describe("vermian hypoplasia report impression", () => {
  it("uses the TEST.md Case V3 Limperopoulos caveat", () => {
    const ga = { weeks: 26, days: 0 };
    const values = {
      vermis_cc: 11.5,
      vermis_ap: 5.3,
      tcd: 30.5,
      pons_ap: 8.4,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("vermis-small");
    expect(dxIds).not.toContain("tcd-small");
    expect(dxIds).not.toContain("pons-small");
    expect(report).toContain("Limperopoulos 2006");
    expect(report).toContain(
      "fetal MRI before 24 weeks can substantially over-call inferior vermian hypoplasia"
    );
  });
});

describe("vermian AP hypoplasia trigger", () => {
  it("fires the TEST.md §6 small-vermis rule when only vermis AP is below the fifth percentile", () => {
    const ga = { weeks: 26, days: 0 };
    const gaWeeks = 26;
    const values = {
      vermis_cc: mu(byId("vermis_cc"), gaWeeks),
      vermis_ap:
        mu(byId("vermis_ap"), gaWeeks) - 2 * sigma(byId("vermis_ap"), gaWeeks),
      tcd: mu(byId("tcd"), gaWeeks),
      pons_ap: mu(byId("pons_ap"), gaWeeks),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(zs.vermis_cc?.z).toBeGreaterThan(-1.6448536269514722);
    expect(zs.vermis_ap?.z).toBeLessThan(-1.6448536269514722);
    expect(dxIds).toContain("vermis-small");
    expect(dxIds).not.toContain("tcd-small");
    expect(dxIds).not.toContain("pons-small");
    expect(dxIds).not.toContain("dwm-pattern");
  });
});

describe("vermian AP Dandy-Walker trigger", () => {
  it("uses AP-only vermis hypoplasia for TEST.md §7 DWM when TVA is markedly elevated", () => {
    const ga = { weeks: 28, days: 0 };
    const gaWeeks = 28;
    const values = {
      vermis_cc: mu(byId("vermis_cc"), gaWeeks),
      vermis_ap:
        mu(byId("vermis_ap"), gaWeeks) - 2 * sigma(byId("vermis_ap"), gaWeeks),
      tva: 95,
      tcd: mu(byId("tcd"), gaWeeks),
      pons_ap: mu(byId("pons_ap"), gaWeeks),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(zs.vermis_cc?.z).toBeGreaterThan(-1.6448536269514722);
    expect(zs.vermis_ap?.z).toBeLessThan(-1.6448536269514722);
    expect(dxIds).toContain("vermis-small");
    expect(dxIds).toContain("dwm-pattern");
    expect(dxIds).not.toContain("tcd-small");
    expect(dxIds).not.toContain("pons-small");
  });
});

describe("vermian hypoplasia DWM boundary", () => {
  it("does not fire DWM for TEST.md Case V2-type borderline TVA without small TCD or pons", () => {
    const ga = { weeks: 24, days: 5 };
    const gaWeeks = 24 + 5 / 7;
    const values = {
      vermis_cc: 9,
      vermis_ap: 4.5,
      tva: 52.13,
      tcd: mu(byId("tcd"), gaWeeks),
      pons_ap: mu(byId("pons_ap"), gaWeeks),
    };
    const { dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("vermis-small");
    expect(dxIds).not.toContain("tcd-small");
    expect(dxIds).not.toContain("pons-small");
    expect(dxIds).not.toContain("dwm-pattern");
  });
});

describe("BP6 TVA-60 Dandy-Walker boundary", () => {
  it("fires TEST.md Case BP6 DWM with small vermis and TVA 60 despite preserved TCD and pons", () => {
    const ga = { weeks: 28, days: 0 };
    const gaWeeks = 28;
    const values = {
      vermis_cc:
        mu(byId("vermis_cc"), gaWeeks) -
        1.9 * sigma(byId("vermis_cc"), gaWeeks),
      vermis_ap:
        mu(byId("vermis_ap"), gaWeeks) -
        1.9 * sigma(byId("vermis_ap"), gaWeeks),
      tva: 60,
      tcd: mu(byId("tcd"), gaWeeks),
      pons_ap: mu(byId("pons_ap"), gaWeeks),
    };
    const { dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("vermis-small");
    expect(dxIds).toContain("dwm-pattern");
    expect(dxIds).not.toContain("tcd-small");
    expect(dxIds).not.toContain("pons-small");
  });
});

describe("combined cerebellar hypoplasia report impression", () => {
  it("flags the TEST.md Case V5 small TCD plus small vermis pattern", () => {
    const ga = { weeks: 32, days: 0 };
    const values = {
      vermis_cc: 11,
      vermis_ap: 5,
      tcd: 36,
      pons_ap: 10,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["vermis-small", "tcd-small"])
    );
    expect(dxIds).not.toContain("pons-small");
    expect(dxIds).not.toContain("dwm-pattern");
    expect(report).toContain(
      "Combined small TCD and small vermis pattern raises concern for cerebellar agenesis or pontocerebellar hypoplasia."
    );
  });
});

describe("isolated small TCD report impression", () => {
  it("uses the TEST.md Case CH3 unilateral cerebellar hypoplasia impression", () => {
    const ga = { weeks: 32, days: 0 };
    const gaWeeks = 32;
    const values = {
      tcd: 35,
      vermis_cc: 19.5,
      vermis_ap: mu(byId("vermis_ap"), gaWeeks),
      pons_ap: 11.5,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("tcd-small");
    expect(dxIds).not.toContain("vermis-small");
    expect(dxIds).not.toContain("pons-small");
    expect(dxIds).not.toContain("dwm-pattern");
    expect(report).toContain(
      "Unilateral cerebellar hypoplasia or cerebellar disruption injury should be considered; postnatal MRI is recommended for laterality assessment."
    );
  });
});

describe("SPEC 4.7 rhombencephalosynapsis qualitative trigger", () => {
  it("requires small TCD plus absent primary fissure to fire the RES composite", () => {
    const ga = { weeks: 28, days: 0 };
    const gaWeeks = 28;
    const baseValues = {
      tcd: mu(byId("tcd"), gaWeeks) - 1.9 * sigma(byId("tcd"), gaWeeks),
    };
    const withoutQualitative = evaluateAll(baseValues, ga).dxs.map(dx => dx.id);
    const withQualitative = evaluateAll(
      { ...baseValues, qualitative_absent_primary_fissure: 1 },
      ga
    ).dxs.map(dx => dx.id);

    expect(withoutQualitative).toContain("tcd-small");
    expect(withoutQualitative).not.toContain("res-pattern");
    expect(withQualitative).toEqual(
      expect.arrayContaining(["tcd-small", "res-pattern"])
    );
  });
});

describe("large TCD 95th-percentile threshold", () => {
  it("fires TEST.md §10 macrocerebellum between +1.645 and +2 SD", () => {
    const ga = { weeks: 26, days: 0 };
    const gaWeeks = 26;
    const values = {
      tcd: mu(byId("tcd"), gaWeeks) + 1.8 * sigma(byId("tcd"), gaWeeks),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(zs.tcd?.z).toBeGreaterThan(1.6448536269514722);
    expect(zs.tcd?.z).toBeLessThan(2);
    expect(dxIds).toContain("tcd-large");
    expect(dxIds).not.toContain("macrocephaly");
    expect(dxIds).not.toContain("cc-thick");
  });
});

describe("thick CC 95th-percentile threshold", () => {
  it("fires TEST.md §13 thick corpus callosum between +1.645 and +2 SD", () => {
    const ga = { weeks: 30, days: 0 };
    const gaWeeks = 30;
    const values = {
      cc_length:
        mu(byId("cc_length"), gaWeeks) +
        1.8 * sigma(byId("cc_length"), gaWeeks),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(zs.cc_length?.z).toBeGreaterThan(1.6448536269514722);
    expect(zs.cc_length?.z).toBeLessThan(2);
    expect(dxIds).toContain("cc-thick");
    expect(dxIds).not.toContain("macrocephaly");
    expect(dxIds).not.toContain("pons-large");
  });
});

describe("large pons 95th-percentile threshold", () => {
  it("fires TEST.md §18 large pons between +1.645 and +2 SD", () => {
    const ga = { weeks: 30, days: 0 };
    const gaWeeks = 30;
    const values = {
      pons_ap:
        mu(byId("pons_ap"), gaWeeks) + 1.8 * sigma(byId("pons_ap"), gaWeeks),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(zs.pons_ap?.z).toBeGreaterThan(1.6448536269514722);
    expect(zs.pons_ap?.z).toBeLessThan(2);
    expect(dxIds).toContain("pons-large");
    expect(dxIds).not.toContain("macrocephaly");
    expect(dxIds).not.toContain("cc-thick");
  });
});

describe("macrocephaly 97th-percentile threshold", () => {
  it("fires TEST.md §20 macrocephaly between the 97th percentile and +2 SD", () => {
    const ga = { weeks: 30, days: 0 };
    const gaWeeks = 30;
    const skullBpd = byId("skull_bpd");
    const values = {
      skull_bpd: mu(skullBpd, gaWeeks) + 1.9 * sigma(skullBpd, gaWeeks),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(zs.skull_bpd?.z).toBeGreaterThan(1.8807936081512509);
    expect(zs.skull_bpd?.z).toBeLessThan(2);
    expect(dxIds).toContain("macrocephaly");
    expect(dxIds).not.toContain("tcd-large");
    expect(dxIds).not.toContain("cc-thick");
  });
});

describe("microcephaly 3rd-percentile threshold", () => {
  it("fires TEST.md §19 microcephaly between -2 SD and the 3rd percentile", () => {
    const ga = { weeks: 30, days: 0 };
    const gaWeeks = 30;
    const skullBpd = byId("skull_bpd");
    const values = {
      skull_bpd: mu(skullBpd, gaWeeks) - 1.9 * sigma(skullBpd, gaWeeks),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(zs.skull_bpd?.z).toBeLessThan(-1.8807936081512509);
    expect(zs.skull_bpd?.z).toBeGreaterThan(-2);
    expect(dxIds).toContain("microcephaly");
    expect(dxIds).not.toContain("mild-vm");
    expect(dxIds).not.toContain("tcd-small");
  });
});

describe("macrocerebellum plus macrocephaly report impression", () => {
  it("uses the TEST.md Case LC2 overgrowth-syndrome impression", () => {
    const ga = { weeks: 30, days: 0 };
    const values = {
      skull_bpd: 84.6,
      tcd: 39.5,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["tcd-large", "macrocephaly"])
    );
    expect(report).toContain(
      "Macrocerebellum with macrocephaly raises concern for fetal overgrowth syndromes such as Sotos or Beckwith-Wiedemann syndrome."
    );
  });
});

describe("macrocerebellum plus thick corpus callosum report impression", () => {
  it("uses the TEST.md Case LC5 overgrowth-syndrome impression", () => {
    const ga = { weeks: 30, days: 0 };
    const values = {
      tcd: 39.5,
      cc_length: 37.4,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(expect.arrayContaining(["tcd-large", "cc-thick"]));
    expect(report).toContain(
      "Macrocerebellum with thick corpus callosum raises concern for a fetal overgrowth syndrome."
    );
  });
});

describe("large pons plus thick corpus callosum report impression", () => {
  it("uses the TEST.md Case LP6 overgrowth-syndrome impression", () => {
    const ga = { weeks: 26, days: 0 };
    const values = {
      pons_ap: 10.1,
      cc_length: 32,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(expect.arrayContaining(["pons-large", "cc-thick"]));
    expect(report).toContain(
      "Large pons with thick corpus callosum strongly suggests a fetal overgrowth-syndrome pattern."
    );
  });
});

describe("large pons plus macrocephaly report impression", () => {
  it("uses the TEST.md Case LP2 overgrowth-syndrome impression", () => {
    const ga = { weeks: 32, days: 0 };
    const gaWeeks = 32;
    const values = {
      skull_bpd:
        mu(byId("skull_bpd"), gaWeeks) +
        1.9 * sigma(byId("skull_bpd"), gaWeeks),
      pons_ap:
        mu(byId("pons_ap"), gaWeeks) + 1.9 * sigma(byId("pons_ap"), gaWeeks),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["pons-large", "macrocephaly"])
    );
    expect(dxIds).not.toContain("hydrocephalus-pattern");
    expect(report).toContain(
      "Large pons with macrocephaly raises concern for a fetal overgrowth-syndrome pattern."
    );
  });
});

describe("large pons plus macrocerebellum report impression", () => {
  it("uses the TEST.md Case LP4 overgrowth-syndrome impression", () => {
    const ga = { weeks: 28, days: 0 };
    const gaWeeks = 28;
    const values = {
      pons_ap:
        mu(byId("pons_ap"), gaWeeks) + 1.9 * sigma(byId("pons_ap"), gaWeeks),
      tcd: mu(byId("tcd"), gaWeeks) + 1.9 * sigma(byId("tcd"), gaWeeks),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(expect.arrayContaining(["pons-large", "tcd-large"]));
    expect(dxIds).not.toContain("macrocephaly");
    expect(dxIds).not.toContain("cc-thick");
    expect(report).toContain(
      "Large pons with macrocerebellum raises concern for a fetal overgrowth-syndrome pattern."
    );
  });
});

describe("macrocephaly plus thick corpus callosum report impression", () => {
  it("uses the TEST.md Case MA3 overgrowth-syndrome impression", () => {
    const ga = { weeks: 32, days: 0 };
    const values = {
      skull_bpd: 96,
      brain_bpd: 94,
      cc_length: 47,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(expect.arrayContaining(["macrocephaly", "cc-thick"]));
    expect(report).toContain(
      "Macrocephaly with thick corpus callosum raises concern for a fetal overgrowth-syndrome combined pattern."
    );
  });
});

describe("direct extra-axial CSF report impression", () => {
  it("uses the exact Kyriakopoulou 2017 fetal-centiles workbook coefficients", () => {
    const ga = { weeks: 32, days: 0 };
    const meanAt32Weeks = 10.3721;
    const normal = zscore(byId("extra_axial_csf"), ga, meanAt32Weeks);
    const widened = zscore(byId("extra_axial_csf"), ga, 14);

    expect(normal).not.toBeNull();
    expect(widened).not.toBeNull();
    expect(normal!.z).toBeCloseTo(0, 2);
    expect(normal!.sourceDetails[0].verificationTier).toBe("transcribed");
    expect(normal!.sourceDetails[0].caveat).toBeUndefined();
    expect(widened!.z).toBeGreaterThan(1.645);
  });

  it("uses the TEST.md Case EA1 benign external hydrocephalus impression", () => {
    const ga = { weeks: 32, days: 0 };
    const values = {
      extra_axial_csf: 14,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("extra-axial-wide");
    expect(report).toContain(
      "External hydrocephalus / benign macrocrania of infancy — typically self-resolving."
    );
  });
});

describe("brain-volume-loss extra-axial report impression", () => {
  it("uses the TEST.md Case EA2 destructive-insult impression", () => {
    const ga = { weeks: 30, days: 0 };
    const values = {
      skull_bpd: 72,
      brain_bpd: 60,
      atrial_left: 12,
      atrial_right: 12,
      extra_axial_csf: 14,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["microcephaly", "mild-vm", "extra-axial-wide"])
    );
    expect(report).toContain(
      "Microcephaly with ventriculomegaly and widened extra-axial CSF suggests congenital CMV or another intrauterine destructive insult."
    );
  });
});

describe("IUGR extra-axial report impression", () => {
  it("uses the TEST.md Case EA4 growth-restriction impression", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      skull_bpd: 65,
      extra_axial_csf: 14,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["microcephaly", "extra-axial-wide"])
    );
    expect(dxIds).not.toContain("mild-vm");
    expect(report).toContain(
      "Microcephaly with widened extra-axial CSF suggests IUGR-associated extra-axial-space prominence; correlate with fetal growth parameters and placental insufficiency."
    );
  });
});

describe("extreme-z percentile formatting", () => {
  it("uses the TEST.md Case STRESS4 above-99.9 percentile report bucket", () => {
    const ga = { weeks: 30, days: 0 };
    const skullBpd = byId("skull_bpd");
    const values = {
      skull_bpd: mu(skullBpd, 30) + 5 * sigma(skullBpd, 30),
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });

    expect(zs.skull_bpd?.z).toBeCloseTo(5, 2);
    expect(dxs.map(dx => dx.id)).toContain("macrocephaly");
    expect(report).toContain(">99.9th percentile");
  });
});

describe("all-z zero stress fixture", () => {
  it("uses TEST.md Case STRESS1 mu values to produce zero consensus z-scores", () => {
    const ga = { weeks: 28, days: 0 };
    const gaWeeks = 28;
    const values = Object.fromEntries(
      PARAMETERS_ALL.map(param => [param.id, mu(param, gaWeeks)])
    );
    const { zs, dxs } = evaluateAll(values, ga);

    expect(dxs.map(dx => dx.id)).toEqual([]);
    for (const param of PARAMETERS_ALL) {
      expect(Math.abs(zs[param.id]!.z)).toBeLessThan(0.05);
    }
  });
});

describe("multi-card severe-malformation stress fixture", () => {
  it("uses TEST.md Case STRESS5 to fire HPE, PCH, and DWM without TVA", () => {
    const { dxs } = evaluateAll(
      {
        skull_bpd: 60,
        skull_ofd: 80,
        brain_bpd: 56,
        brain_ofd_left: 78,
        brain_ofd_right: 65,
        atrial_right: 18,
        atrial_left: 18,
        csp_width: 0,
        cc_length: 0,
        tcd: 25,
        vermis_cc: 9,
        vermis_ap: 4,
        pons_ap: 6.5,
        third_ventricle: 4.5,
        extra_axial_csf: 14,
      },
      { weeks: 26, days: 0 }
    );
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds.length).toBeGreaterThanOrEqual(10);
    expect(dxIds).toEqual(
      expect.arrayContaining([
        "severe-vm",
        "absent-csp",
        "cc-absent",
        "tcd-small",
        "vermis-small",
        "pons-small",
        "microcephaly",
        "third-v-wide",
        "brain-asym",
        "extra-axial-wide",
        "hpe-pattern",
        "pch-pattern",
        "dwm-pattern",
      ])
    );
  });
});

describe("Dandy-Walker spectrum trigger", () => {
  it("fires the TEST.md Case D1 TVA-based DWM composite card", () => {
    const { dxs } = evaluateAll(
      {
        vermis_cc: 7.67,
        vermis_ap: 2.83,
        tcd: 24.71,
        pons_ap: 5.4,
        tva: 109.5,
      },
      { weeks: 24, days: 5 }
    );
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining([
        "vermis-small",
        "tcd-small",
        "pons-small",
        "dwm-pattern",
      ])
    );
  });

  it("fires the TEST.md Case D5 isolated DWM pattern with preserved pons", () => {
    const ga = { weeks: 32, days: 0 };
    const gaWeeks = 32;
    const values = {
      vermis_cc: 9,
      vermis_ap: 3.5,
      tva: 80,
      tcd: 36,
      pons_ap: mu(byId("pons_ap"), gaWeeks),
    };
    const { dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["vermis-small", "tcd-small", "dwm-pattern"])
    );
    expect(dxIds).not.toContain("pons-small");
  });
});

describe("isolated small pons report impression", () => {
  it("uses the TEST.md Case PCH6 non-PCH brainstem impression", () => {
    const ga = { weeks: 32, days: 0 };
    const values = {
      pons_ap: 9,
      tcd: 41,
      vermis_cc: 19,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toContain("pons-small");
    expect(dxIds).not.toContain("tcd-small");
    expect(dxIds).not.toContain("vermis-small");
    expect(dxIds).not.toContain("pch-pattern");
    expect(report).toContain(
      "Isolated brainstem (pontine) hypoplasia — non-PCH; consider PMM2-CDG and other isolated brainstem disorders."
    );
  });
});

describe("PCH vermian-support trigger", () => {
  it("fires TEST.md §17 pch-pattern with small pons plus small vermis despite preserved TCD", () => {
    const ga = { weeks: 28, days: 0 };
    const gaWeeks = 28;
    const values = {
      pons_ap:
        mu(byId("pons_ap"), gaWeeks) - 1.9 * sigma(byId("pons_ap"), gaWeeks),
      vermis_cc:
        mu(byId("vermis_cc"), gaWeeks) -
        1.9 * sigma(byId("vermis_cc"), gaWeeks),
      tcd: mu(byId("tcd"), gaWeeks),
    };
    const { dxs } = evaluateAll(values, ga);
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["pons-small", "vermis-small", "pch-pattern"])
    );
    expect(dxIds).not.toContain("tcd-small");
  });
});

describe("combined ACC and Dandy-Walker report impression", () => {
  it("enumerates both TEST.md Case D3 combined-pattern diagnoses", () => {
    const ga = { weeks: 28, days: 0 };
    const values = {
      atrial_right: 16,
      atrial_left: 16,
      csp_width: 0,
      cc_length: 0,
      vermis_cc: 7,
      vermis_ap: 3,
      tva: 95,
      tcd: 28,
      pons_ap: 6.5,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });
    const dxIds = dxs.map(dx => dx.id);

    expect(dxIds).toEqual(
      expect.arrayContaining(["severe-vm", "acc-pattern", "dwm-pattern"])
    );
    expect(report).toContain("Complete agenesis of the corpus callosum");
    expect(report).toContain(
      "Dandy-Walker spectrum with elevated tegmento-vermian angle"
    );
  });
});

describe("mega cisterna magna qualitative report impression", () => {
  it("fires the SPEC §4.7 numeric cisterna-magna-depth threshold", () => {
    const ga = { weeks: 28, days: 0 };
    const negative = evaluateAll({ cisterna_magna_depth: 10 }, ga).dxs.map(
      dx => dx.id
    );
    const positive = evaluateAll({ cisterna_magna_depth: 10.1 }, ga).dxs.map(
      dx => dx.id
    );

    expect(negative).not.toContain("mega-cisterna-magna");
    expect(positive).toContain("mega-cisterna-magna");
  });

  it("uses the TEST.md Case BP3 qualitative Blake's pouch impression", () => {
    const ga = { weeks: 28, days: 0 };
    const gaWeeks = 28;
    const values = {
      vermis_cc: 16,
      vermis_ap: mu(byId("vermis_ap"), gaWeeks),
      tcd: 34.5,
      pons_ap: 9.5,
      tva: 30,
      qualitative_mcm_panel: 1,
    };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });

    expect(dxs).toHaveLength(0);
    expect(report).toContain(
      "Isolated mega cisterna magna with persistent Blake's pouch — likely benign normal variant."
    );
  });
});

describe("Blake's pouch advisory toggle", () => {
  it("uses the TEST.md §8 elevated-TVA normal-vermis qualitative advisory", () => {
    const ga = { weeks: 24, days: 5 };
    const gaWeeks = 24 + 5 / 7;
    const baseValues = {
      vermis_cc: mu(byId("vermis_cc"), gaWeeks),
      vermis_ap: mu(byId("vermis_ap"), gaWeeks),
      tcd: mu(byId("tcd"), gaWeeks),
      pons_ap: mu(byId("pons_ap"), gaWeeks),
      tva: 33,
    };
    const baseIds = evaluateAll(baseValues, ga).dxs.map(dx => dx.id);
    const { zs, dxs } = evaluateAll(
      { ...baseValues, qualitative_blakes_pouch_panel: 1 },
      ga
    );
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values: { ...baseValues, qualitative_blakes_pouch_panel: 1 },
      zs,
      dxs,
    });
    const toggledIds = dxs.map(dx => dx.id);

    expect(baseIds).not.toContain("blakes-pouch-dd");
    expect(baseIds).not.toContain("dwm-pattern");
    expect(toggledIds).toContain("blakes-pouch-dd");
    expect(toggledIds).not.toContain("dwm-pattern");
    expect(toggledIds).not.toContain("vermis-small");
    expect(report).toContain(
      "Blake's pouch cyst differential: elevated TVA with normal vermis size; generally favorable prognosis, but confirm vermian formation and fourth-ventricle communication."
    );
  });
});

describe("Chiari II / open NTD discriminator", () => {
  it("matches the SPEC §6.5.2 TDPF and CSA worked example", () => {
    const ga = { weeks: 24, days: 0 };
    const tdpf = zscore(byId("tdpf"), ga, 24);
    const csa = zscore(byId("csa"), ga, 55);

    expect(tdpf).not.toBeNull();
    expect(csa).not.toBeNull();
    expect(tdpf!.agreementState).toBe("single");
    expect(csa!.agreementState).toBe("single");
    expect(tdpf!.sourceDetails[0].sourceLabel).toBe("Woitek 2014");
    expect(csa!.sourceDetails[0].sourceLabel).toBe("Woitek 2014");
    expect(tdpf!.z).toBeCloseTo(-3.8, 1);
    expect(csa!.z).toBeCloseTo(-3.23, 1);
  });

  it("fires the Chiari II / open neural tube defect card for the worked example", () => {
    const { dxs } = evaluateAll(
      {
        tdpf: 24,
        csa: 55,
      },
      { weeks: 24, days: 0 }
    );

    expect(dxs[0]?.id).toBe("chiari-ii-ontd");
    expect(dxs[0]?.triggerLabel).toContain("ONTD posterior");
    expect(dxs[0]?.severity).toBe("urgent");
  });
});

describe("source-registry acceptance criterion", () => {
  it("accepts an identical source over the overlapping GA window", () => {
    const skullBpd = byId("skull_bpd");
    const existing = sourceRegistryFor(skullBpd)[0];
    const result = validateSourceRegistryExtension(skullBpd, {
      ...existing,
      source: {
        ...existing.source,
        label: "Duplicate Luis 2025",
      },
    });

    expect(result.accepted).toBe(true);
    expect(result.maxDelta).toBe(0);
    expect(result.failures).toHaveLength(0);
  });

  it("rejects a candidate whose mean curve diverges by more than 0.5 SD", () => {
    const skullBpd = byId("skull_bpd");
    const existing = sourceRegistryFor(skullBpd)[0];
    const result = validateSourceRegistryExtension(skullBpd, {
      ...existing,
      source: {
        ...existing.source,
        label: "Shifted candidate",
      },
      model: {
        ...existing.model,
        c:
          existing.model.kind === "luis-quadratic" ? existing.model.c + 10 : 10,
      },
    });

    expect(result.accepted).toBe(false);
    expect(result.maxDelta).toBeGreaterThan(0.5);
    expect(result.failures[0]).toMatchObject({
      parameterId: "skull_bpd",
      parameterName: "Skull biparietal diameter",
      candidateSource: "Shifted candidate",
      existingSource: "Luis 2025",
    });
    expect(result.failures[0].gaWeeks).toBeGreaterThanOrEqual(20);
  });
});

describe("periodic cross-validation audit", () => {
  it("derives half-week audit samples for every multi-source parameter", () => {
    const audits = computeCrossValidationAudits();
    const tcd = audits.find(audit => audit.parameterId === "tcd");

    expect(audits.map(audit => audit.parameterId)).toEqual(
      expect.arrayContaining(["tcd", "vermis_cc", "vermis_ap", "pons_ap"])
    );
    expect(tcd).toBeDefined();
    expect(tcd!.sources.map(source => source.label)).toEqual([
      "Luis 2025",
      "Dovjak 2021",
    ]);
    expect(tcd!.samples[0].gaWeeks).toBe(20);
    expect(tcd!.samples[1].gaWeeks).toBe(20.5);
    expect(tcd!.samples.at(-1)!.gaWeeks).toBeLessThanOrEqual(39.3);
    expect(tcd!.maxDelta).toBeGreaterThan(0);
    expect(["pass", "partial-fail", "fail"]).toContain(tcd!.status);
  });
});

describe("DDx source-disagreement propagation", () => {
  it("marks a z-score-triggered card when the contributing row disagrees", () => {
    const { dxs, zs } = evaluateAll(
      {
        tcd: 38,
      },
      { weeks: 28, days: 0 }
    );
    const card = dxs.find(dx => dx.id === "tcd-large");

    expect(zs.tcd?.agreementState).toBe("disagree");
    expect(card).toBeDefined();
    expect(card!.sourceDisagreements).toEqual([
      {
        parameterId: "tcd",
        parameterName: "Transcerebellar diameter",
        disagreementWidth: expect.any(Number),
      },
    ]);
  });
});

describe("third-ventricle raw-threshold policy", () => {
  it("downgrades third-ventricle width to auxiliary raw threshold without z-score metadata", () => {
    const ga = { weeks: 28, days: 0 };
    const values = { third_ventricle: 4 };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });

    expect(PARAMETERS_ALL.map(p => p.id)).not.toContain("third_ventricle");
    expect(
      AUXILIARY_MEASUREMENTS.find(field => field.id === "third_ventricle")
    ).toMatchObject({
      name: "Third ventricle width",
      significance: expect.stringContaining("Raw 3.5 mm threshold"),
    });
    expect(zs).not.toHaveProperty("third_ventricle");
    expect(dxs.map(dx => dx.id)).toContain("third-v-wide");
    expect(report).toContain(
      "Third ventricle width: 4.0 mm (raw threshold input)."
    );
    expect(report).not.toContain("Birnbaum 2018 z");
    expect(report).not.toContain("verification approximation");
  });
});

describe("research-mode report flags", () => {
  it("flags the Chiari II / ONTD discriminator as research-mode when it fires", () => {
    const ga = { weeks: 24, days: 0 };
    const values = { tdpf: 24, csa: 55 };
    const { zs, dxs } = evaluateAll(values, ga);
    const report = generateReport({
      ga,
      fieldStrength: "1.5T",
      motion: "None",
      values,
      zs,
      dxs,
    });

    expect(dxs.some(dx => dx.id === "chiari-ii-ontd")).toBe(true);
    expect(report).toContain("Research-mode Chiari II / ONTD discriminator");
  });
});
