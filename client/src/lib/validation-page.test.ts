import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("SPEC §6.1 validation philosophy", () => {
  it("surfaces the interpretation-layer scope and cohort philosophy", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Validation.tsx"),
      "utf8"
    );

    expect(source).toContain("measurement layer");
    expect(source).toContain("interpretation layer");
    expect(source).toContain("Phase 1 validates the interpretation layer only");
    expect(source).toContain("AI-pre-filled measurements");
    expect(source).toContain("internal and external cohorts");
    expect(source).toContain("expert ground-truth measurements");
  });
});

describe("SPEC §6.2 FeTA cohort composition", () => {
  it("surfaces the external cohort composition and pathology mix", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Validation.tsx"),
      "utf8"
    );

    expect(source).toContain("300 super-resolution-reconstructed T2 volumes");
    expect(source).toContain("five sites");
    expect(source).toContain("Kispi");
    expect(source).toContain("Medical University of Vienna");
    expect(source).toContain("CHUV");
    expect(source).toContain("UCSF Benioff");
    expect(source).toContain("King's College London");
    expect(source).toContain("0.55 T, 1.5 T, and 3 T");
    expect(source).toContain("Siemens, GE, Philips, and Siemens Free.Max");
    expect(source).toContain("130 pathological");
    expect(source).toContain("170 neurotypical");
    expect(source).toContain("ventriculomegaly");
    expect(source).toContain("corpus callosum malformations");
    expect(source).toContain("posterior-fossa malformations");
    expect(source).toContain("open spina bifida");
  });
});

describe("SPEC §6.2 FeTA measurement coverage", () => {
  it("surfaces direct, derivable, unavailable, and access-split details", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Validation.tsx"),
      "utf8"
    );

    expect(source).toContain(
      "five expert-measured biometric ground-truth values"
    );
    expect(source).toContain("brain biparietal diameter");
    expect(source).toContain("skull biparietal diameter");
    expect(source).toContain("transverse cerebellar diameter");
    expect(source).toContain("corpus callosum length");
    expect(source).toContain("vermis cranio-caudal height");
    expect(source).toContain("derivable from the released segmentation masks");
    expect(source).toContain("brain occipito-frontal diameter");
    expect(source).toContain("vermis antero-posterior diameter");
    expect(source).toContain("pons antero-posterior diameter");
    expect(source).toContain("left and right atrial diameters");
    expect(source).toContain("not directly recoverable from FeTA");
    expect(source).toContain("120-case training set");
    expect(source).toContain("180-case test set");
  });
});

describe("SPEC §6.3 FeTA validation endpoints", () => {
  it("surfaces the four FeTA 2024 manuscript-grade validation endpoints", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Validation.tsx"),
      "utf8"
    );

    expect(source).toContain("FeTA 2024");
    expect(source).toContain("per-parameter agreement");
    expect(source).toContain(
      "multi-site, multi-vendor, multi-field-strength robustness"
    );
    expect(source).toContain("pathology-versus-neurotypical comparison");
    expect(source).toContain("ROC-AUC");
  });
});

describe("SPEC §6.4 institutional validation cohort", () => {
  it("surfaces the institutional cohort composition and study roles", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Validation.tsx"),
      "utf8"
    );

    expect(source).toContain("60-case institutional cohort");
    expect(source).toContain("20 neurotypical");
    expect(source).toContain("20 mild-or-moderate pathology");
    expect(source).toContain("20 severe pathology");
    expect(source).toContain("expert ground-truth measurements");
    expect(source).toContain("per-condition labels");
    expect(source).toContain("with-tool-versus-without-tool reader study");
    expect(source).toContain("inter-rater reliability");
  });
});

describe("SPEC §6.6 validation dataset cross-reference", () => {
  it("surfaces rejected validation datasets and their caveats", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Validation.tsx"),
      "utf8"
    );

    expect(source).toContain("dHCP fetal release");
    expect(source).toContain("lacks expert-measured biometry");
    expect(source).toContain("does not include case-level pathology labels");
    expect(source).toContain("Luis 2025 normative cohort");
    expect(source).toContain("circular validation");
    expect(source).toContain("source-registry acceptance criterion");
  });
});

describe("SPEC §6.7 validation timeline", () => {
  it("surfaces the external-access, institutional, and manuscript timelines", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Validation.tsx"),
      "utf8"
    );

    expect(source).toContain("Synapse Data Access Request");
    expect(source).toContain("Data Transfer Agreement");
    expect(source).toContain("two-to-four-week access");
    expect(source).toContain("three-to-four-week analysis");
    expect(source).toContain("four-to-six-week IRB submission");
    expect(source).toContain("six-to-twelve-week reader study");
    expect(source).toContain("six-to-nine-month manuscript path");
  });
});

describe("publication-readiness literature audit", () => {
  it("surfaces current reviewer checklists and manuscript endpoint families", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Validation.tsx"),
      "utf8"
    );

    expect(source).toContain("TRIPOD+AI");
    expect(source).toContain("CLAIM");
    expect(source).toContain("SQUIRE 2.0");
    expect(source).toContain("DECIDE-AI");
    expect(source).toContain("CONSORT-AI");
    expect(source).toContain("STARD-AI");
    expect(source).toContain("calibration-in-the-large");
    expect(source).toContain("calibration slope");
    expect(source).toContain("Brier score");
    expect(source).toContain("Wilson confidence intervals");
    expect(source).toContain("decision-curve net benefit");
    expect(source).toContain("NASA Task Load Index");
    expect(source).toContain("System Usability Scale");
    expect(source).toContain("reader-study timing");
    expect(source).toContain("pre/post report-audit metrics");
  });

  it("surfaces FeTA 2024 biometry gaps and domain-shift controls", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Validation.tsx"),
      "utf8"
    );

    expect(source).toContain("Zalevskyi 2026");
    expect(source).toContain("biometry estimation task");
    expect(source).toContain("best model reached 7.72% MAPE");
    expect(source).toContain("inter-rater MAPE of 5.38%");
    expect(source).toContain("acquisition site");
    expect(source).toContain("super-resolution strategy");
    expect(source).toContain("image quality");
  });
});
