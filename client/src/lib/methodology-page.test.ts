import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { evaluateAll, PARAMETERS_ALL, mu } from "./biometry";

describe("SPEC §4.10 QI deployment protocol", () => {
  it("surfaces the pre/intervention/post report-audit endpoints on the Methodology page", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Methodology.tsx"),
      "utf8"
    );

    expect(source).toContain("100 historical fetal MRI reports");
    expect(source).toContain("100 new reports");
    expect(source).toContain("average time to report");
    expect(source).toContain("measurement completeness");
    expect(source).toContain("z-score and percentile documentation");
  });
});

describe("SPEC §7.5 source verification dossier", () => {
  it("cross-lists the clinician-owned verification action items with statuses", () => {
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );

    expect(dossier).toContain("Dovjak 2021 Table 1");
    expect(dossier).toContain("Woitek 2014 Table 3");
    expect(dossier).toContain("third-ventricle policy");
    expect(dossier).toContain("Section 7.4 citation pass");
    expect(dossier).toContain("Chiari II / ONTD calibration");
    expect(dossier).toContain("Status");
    expect(dossier).toContain("Open");
    expect(dossier).toContain("Closed");
  });
});

describe("publication-readiness source-document consistency", () => {
  it("keeps the third-ventricle policy raw-threshold-only outside the app code", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const home = readFileSync(
      resolve(process.cwd(), "client/src/pages/Home.tsx"),
      "utf8"
    );

    expect(spec).toContain(
      "Third Ventricle Width (third_ventricle) -- raw-threshold auxiliary input"
    );
    expect(spec).toContain("z-score reporting is disabled");
    expect(spec).toContain("extra-axial CSF");
    expect(spec).not.toContain(
      "The third-ventricle z-score should be treated as ordinal"
    );
    expect(spec).not.toContain(
      "applies to the third-ventricle linear-mean / constant-SD model"
    );
    expect(spec).not.toContain("encoded `(0.02, 1.2, 0.6)`");
    expect(testCorpus).toContain(
      "Third ventricle is a raw-threshold auxiliary input"
    );
    expect(testCorpus).not.toContain(
      "third-ventricle z-score is computed from a hand-fitted approximation"
    );
    expect(home).not.toContain("Birnbaum&nbsp;2018");
    expect(home).toContain("third-ventricle raw-threshold checks");
    expect(spec).toContain(
      "Third ventricle: size and appearance in normal fetuses through gestation. Radiology. 1997;203(3):641-644. https://doi.org/10.1148/radiology.203.3.9169682"
    );
    expect(testCorpus).toContain("doi:10.1148/radiology.203.3.9169682");
    expect(spec).not.toContain("radiology.203.3.9169681");
    expect(spec).not.toContain("203(3):643-647");
    expect(testCorpus).not.toContain("radiology.203.3.9169681");
  });

  it("keeps the Dandy-Walker combined-pattern manifest aligned to the TVA trigger", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");

    expect(spec).toContain("| DWM pattern | Small vermis + elevated TVA |");
    expect(spec).not.toContain(
      "| DWM pattern | Small vermis + dilated 3rd V |"
    );
  });

  it("keeps the closed Section 7.4 citation-pass policy aligned across source documents", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );

    expect(dossier).toContain("| Section 7.4 citation pass");
    expect(dossier).toContain("| Closed | Implementation");
    expect(spec).toContain("report output surfaces qualitative labels");
    expect(spec).not.toContain("citation correction recommended");
    expect(spec).not.toContain("Fifth, run a citation pass over Section 7.4");
  });

  it("tracks literature-derived publication blockers in the handoff dossier", () => {
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );

    expect(dossier).toContain("TRIPOD+AI");
    expect(dossier).toContain("CLAIM");
    expect(dossier).toContain("DECIDE-AI");
    expect(dossier).toContain("FeTA 2024 biometry gap");
    expect(dossier).toContain("PMID 41564637");
    expect(dossier).toContain("10.1016/j.media.2026.103941");
    expect(dossier).toContain("TEST corpus numeric audit");
    expect(dossier).toContain("0 residual normal-label rows");
    expect(dossier).toContain("decision-curve net benefit");
    expect(dossier).toContain("IRB");
    expect(dossier).toContain("radiologist handoff");
  });

  it("keeps publication-critical TEST.md citations traceable and non-placeholder", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const biometry = readFileSync(
      resolve(process.cwd(), "client/src/lib/biometry.ts"),
      "utf8"
    );

    expect(testCorpus).not.toMatch(
      /full citation pending|citation pending|pending citation/i
    );
    expect(testCorpus).toContain("10.7759/cureus.74462");
    expect(testCorpus).toContain("PMID 39726469");
    expect(testCorpus).toContain("10.1080/14767058.2020.1849094");
    expect(testCorpus).toContain("PMID 33207970");
    expect(testCorpus).not.toContain(
      "Cureus 2024 alobar HPE single-case fetus at 22 weeks (VERBATIM)"
    );
    expect(biometry).toContain("10.1080/14767058.2020.1849094");
    expect(biometry).not.toContain(
      "Mega Cisterna Magna: Current Perspectives and Future Directions. Cureus. 2025"
    );
  });

  it("keeps TEST.md citation lines free of stale numeric reference brackets", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const citationLines = testCorpus
      .split("\n")
      .filter(line => line.startsWith("**Citation.**"));

    expect(citationLines.length).toBeGreaterThan(100);
    expect(citationLines.join("\n")).not.toMatch(/\[[0-9]+[a-z]?\]/);
  });

  it("keeps TEST.md differential expectations deterministic", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");

    expect(testCorpus).not.toMatch(/may\s+\*?or\s+may\s+not\*?\s+fire/i);
    expect(testCorpus).not.toContain("may fire on AP vermis depending");
    expect(testCorpus).not.toContain("depends on the specific calibration");
  });

  it("keeps TEST.md canonical filler rows aligned to the active registry means", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const fillerColumns = [
      ["Skull BPD", "skull_bpd"],
      ["Skull OFD", "skull_ofd"],
      ["Brain BPD", "brain_bpd"],
      ["Brain OFD-L", "brain_ofd_left"],
      ["Brain OFD-R", "brain_ofd_right"],
      ["Atrium", "atrial_right"],
      ["CSP", "csp_width"],
      ["CC", "cc_length"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Vermis AP", "vermis_ap"],
      ["Pons AP", "pons_ap"],
    ] as const;

    expect(testCorpus).toContain("rounded to the nearest 0.1 mm");
    expect(testCorpus).toContain(
      "Third-ventricle values are raw-threshold placeholders"
    );

    const header = testCorpus
      .split("\n")
      .find(line => line.startsWith("| GA | Skull BPD |"));
    expect(header).toBeDefined();
    const headerColumns = header!
      .split("|")
      .slice(1, -1)
      .map(cell => cell.trim());

    for (const [label] of fillerColumns) {
      expect(headerColumns).toContain(label);
    }

    const parametersById = new Map(
      PARAMETERS_ALL.map(parameter => [parameter.id, parameter])
    );
    for (const gaWeeks of [21, 24, 28, 32, 36]) {
      const row = testCorpus
        .split("\n")
        .find(line => line.startsWith(`| ${gaWeeks}+0 |`));
      expect(row).toBeDefined();
      const cells = row!
        .split("|")
        .slice(1, -1)
        .map(cell => cell.trim());
      const valuesByColumn = new Map(
        headerColumns.map((label, index) => [label, cells[index]])
      );

      for (const [label, parameterId] of fillerColumns) {
        const parameter = parametersById.get(parameterId);
        expect(parameter).toBeDefined();
        expect(valuesByColumn.get(label)).toBe(
          `${mu(parameter!, gaWeeks).toFixed(1)} mm`
        );
      }

      const thirdVentricle = valuesByColumn.get("3rd-V");
      expect(thirdVentricle).toMatch(/^\d+\.\d mm$/);
      expect(Number(thirdVentricle!.replace(" mm", ""))).toBeLessThan(3.5);
    }
  });

  it("keeps TEST.md hemispheric-asymmetry fixtures calibrated to runtime z-scores", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Brain OFD-L", "brain_ofd_left"],
      ["Brain OFD-R", "brain_ofd_right"],
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Pons AP", "pons_ap"],
    ]);
    const expectations = [
      ["HA1", true],
      ["HA2", true],
      ["HA3", false],
      ["HA4", false],
      ["HA5", false],
      ["HA6", true],
      ["CH6", true],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, shouldFire] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const cells = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());
        const [label, rawValue, expectedBand] = cells;

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)\s*mm/);
        if (!valueMatch) continue;
        values[parameterId] = Number(valueMatch[1]);

        if (label === "Brain OFD-L" || label === "Brain OFD-R") {
          expect(expectedBand).toMatch(/normal|<5th/);
        }
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      expect(dxs.map(dx => dx.id).includes("brain-asym")).toBe(shouldFire);

      for (const side of ["brain_ofd_left", "brain_ofd_right"] as const) {
        const expectedBand = caseText
          .split("\n")
          .find(line =>
            line.startsWith(
              `| ${side === "brain_ofd_left" ? "Brain OFD-L" : "Brain OFD-R"} |`
            )
          )
          ?.split("|")[3]
          ?.trim();
        expect(expectedBand).toBeDefined();
        if (expectedBand!.includes("<5th")) {
          expect(zs[side]!.z).toBeLessThan(-1.6448536269514722);
        } else {
          expect(Math.abs(zs[side]!.z)).toBeLessThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md normal controls executable as runtime negative controls", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Skull BPD", "skull_bpd"],
      ["Skull OFD", "skull_ofd"],
      ["Brain BPD", "brain_bpd"],
      ["Brain OFD-L", "brain_ofd_left"],
      ["Brain OFD-R", "brain_ofd_right"],
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["CSP", "csp_width"],
      ["CC", "cc_length"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Vermis AP", "vermis_ap"],
      ["Pons AP", "pons_ap"],
    ]);

    expect(testCorpus).toContain(
      "Normal controls N1-N6 are arithmetic negative controls"
    );

    for (const caseId of ["N1", "N2", "N3", "N4", "N5", "N6"]) {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const caseText = testCorpus.slice(start, nextCase);
      const values: Record<string, number> = {};
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)\s*mm/);
        expect(valueMatch).not.toBeNull();
        values[parameterId] = Number(valueMatch![1]);
      }

      expect(ga).not.toBeNull();
      expect(Object.keys(values)).toHaveLength(parameterLabels.size);
      const { zs, dxs } = evaluateAll(values, ga!);
      expect(dxs.map(dx => dx.id)).toEqual([]);
      for (const parameterId of parameterLabels.values()) {
        expect(Math.abs(zs[parameterId]!.z)).toBeLessThan(0.12);
      }
    }
  });

  it("keeps TEST.md mild-VM fixtures free of stale normal filler values", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Skull BPD", "skull_bpd"],
      ["Skull OFD", "skull_ofd"],
      ["Brain BPD", "brain_bpd"],
      ["Brain OFD-L", "brain_ofd_left"],
      ["Brain OFD-R", "brain_ofd_right"],
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["CSP", "csp_width"],
      ["CC", "cc_length"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Vermis AP", "vermis_ap"],
      ["Pons AP", "pons_ap"],
    ]);
    const expectations = [
      ["M1", ["mild-vm"], ["severe-vm", "asym-vent"]],
      ["M2", ["mod-vm"], ["severe-vm", "mild-vm"]],
      ["M3", ["mild-vm", "asym-vent"], ["severe-vm"]],
      ["M4", ["mod-vm"], ["severe-vm", "mild-vm", "asym-vent"]],
      ["M5", ["mild-vm", "asym-vent"], ["severe-vm"]],
      ["M6", ["mild-vm"], ["severe-vm", "asym-vent"]],
    ] as const;

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const caseText = testCorpus.slice(start, nextCase);
      const values: Record<string, number> = {};
      const normalParameterIds: string[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)\s*mm/);
        if (!valueMatch) continue;
        values[parameterId] = Number(valueMatch[1]);
        if (expectedBand.toLowerCase().includes("normal")) {
          normalParameterIds.push(parameterId);
        }
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }
      for (const parameterId of normalParameterIds) {
        expect(Math.abs(zs[parameterId]!.z)).toBeLessThan(0.12);
      }
    }
  });

  it("keeps TEST.md severe-VM fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Skull BPD", "skull_bpd"],
      ["Skull OFD", "skull_ofd"],
      ["Brain BPD", "brain_bpd"],
      ["Brain OFD-L", "brain_ofd_left"],
      ["Brain OFD-R", "brain_ofd_right"],
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["CSP", "csp_width"],
      ["CC", "cc_length"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Vermis AP", "vermis_ap"],
      ["Pons AP", "pons_ap"],
      ["Third ventricle", "third_ventricle"],
      ["CSA", "csa"],
      ["TDPF", "tdpf"],
    ]);
    const expectations = [
      [
        "S1",
        ["severe-vm", "third-v-wide", "macrocephaly", "hydrocephalus-pattern"],
        ["mild-vm", "acc-pattern", "hpe-pattern"],
      ],
      [
        "S2",
        ["severe-vm", "absent-csp", "cc-absent", "acc-pattern"],
        ["mild-vm", "hydrocephalus-pattern", "hpe-pattern"],
      ],
      [
        "S3",
        ["severe-vm"],
        ["mild-vm", "hydrocephalus-pattern", "acc-pattern", "hpe-pattern"],
      ],
      ["S4", ["severe-vm", "mild-vm", "asym-vent"], []],
      [
        "S5",
        ["severe-vm", "absent-csp", "cc-absent", "microcephaly", "hpe-pattern"],
        ["acc-pattern", "hydrocephalus-pattern"],
      ],
      ["S6", ["severe-vm", "tcd-small", "vermis-small", "chiari-ii-ontd"], []],
    ] as const;

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const caseText = testCorpus.slice(start, nextCase);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const absent = /absent/i.test(rawValue);
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!absent && !valueMatch) continue;
        values[parameterId] = absent ? 0 : Number(valueMatch![1]);
        if (
          [
            "skull_bpd",
            "skull_ofd",
            "brain_bpd",
            "brain_ofd_left",
            "brain_ofd_right",
            "csp_width",
            "cc_length",
            "tcd",
            "vermis_cc",
            "vermis_ap",
            "pons_ap",
            "csa",
            "tdpf",
          ].includes(parameterId)
        ) {
          bandChecks.push({ parameterId, expectedBand });
        }
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        const z = zs[parameterId]?.z;
        if (z == null) continue;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(0.12);
        } else if (band.includes("<3rd")) {
          expect(z).toBeLessThan(-1.8807936081512509);
        } else if (band.includes("<5th")) {
          expect(z).toBeLessThan(-1.6448536269514722);
        } else if (band.includes(">97th")) {
          expect(z).toBeGreaterThan(1.8807936081512509);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("documents asymmetric-ventricle subthreshold atrial rows as clinical cutoff controls", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");

    expect(testCorpus).toContain(
      "| Atrium-R | 9.5 mm | below 10 mm VM threshold |"
    );
    expect(testCorpus).toContain(
      "| Atrium-R | 9.8 mm | below 10 mm VM threshold (just below cutoff) |"
    );
    expect(testCorpus).not.toContain("| Atrium-R | 9.5 mm | normal |");
    expect(testCorpus).not.toContain(
      "| Atrium-R | 9.8 mm | normal (just below the 10 mm threshold) |"
    );
  });

  it("keeps TEST.md vermian-hypoplasia fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Vermis AP", "vermis_ap"],
      ["Pons AP", "pons_ap"],
    ]);
    const expectations = [
      ["V1", ["vermis-small"], ["dwm-pattern", "tcd-small", "pons-small"]],
      [
        "V2",
        ["vermis-small"],
        ["dwm-pattern", "pch-pattern", "tcd-small", "pons-small"],
      ],
      ["V3", ["vermis-small"], ["dwm-pattern", "tcd-small", "pons-small"]],
      ["V4", ["vermis-small", "mild-vm"], ["dwm-pattern", "pons-small"]],
      ["V5", ["vermis-small", "tcd-small"], ["dwm-pattern", "pons-small"]],
      [
        "V6",
        [],
        ["vermis-small", "tcd-small", "tcd-large", "pons-small", "dwm-pattern"],
      ],
    ] as const;

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const caseText = testCorpus.slice(start, nextCase);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!valueMatch) continue;
        values[parameterId] = Number(valueMatch[1]);
        bandChecks.push({ parameterId, expectedBand });
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        const z = zs[parameterId]?.z;
        if (z == null) continue;
        if (band.includes("normal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
        } else if (band.includes("<5th")) {
          expect(z).toBeLessThan(-1.6448536269514722);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md Dandy-Walker and Blake's pouch fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Skull BPD", "skull_bpd"],
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["CSP", "csp_width"],
      ["CC", "cc_length"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Vermis AP", "vermis_ap"],
      ["Pons AP", "pons_ap"],
      ["Third ventricle", "third_ventricle"],
      ["TVA", "tva"],
      ["Cisterna magna AP", "cisterna_magna_depth"],
    ]);
    const zScoredParameterIds = new Set([
      "skull_bpd",
      "atrial_right",
      "atrial_left",
      "csp_width",
      "cc_length",
      "tcd",
      "vermis_cc",
      "vermis_ap",
      "pons_ap",
    ]);
    const expectations = [
      [
        "D1",
        [
          "vermis-small",
          "tcd-small",
          "pons-small",
          "pch-pattern",
          "dwm-pattern",
        ],
        [],
      ],
      [
        "D2",
        [
          "vermis-small",
          "tcd-small",
          "pons-small",
          "pch-pattern",
          "dwm-pattern",
        ],
        [],
      ],
      [
        "D3",
        [
          "severe-vm",
          "absent-csp",
          "cc-absent",
          "acc-pattern",
          "vermis-small",
          "tcd-small",
          "pons-small",
          "pch-pattern",
          "dwm-pattern",
        ],
        [],
      ],
      [
        "D4",
        ["vermis-small"],
        ["dwm-pattern", "tcd-small", "pons-small", "pch-pattern"],
      ],
      [
        "D5",
        ["vermis-small", "tcd-small", "dwm-pattern"],
        ["pons-small", "pch-pattern"],
      ],
      [
        "D6",
        [
          "severe-vm",
          "hydrocephalus-pattern",
          "vermis-small",
          "tcd-small",
          "pons-small",
          "third-v-wide",
          "macrocephaly",
          "pch-pattern",
          "dwm-pattern",
        ],
        [],
      ],
      [
        "BP1",
        [],
        [
          "vermis-small",
          "tcd-small",
          "pons-small",
          "dwm-pattern",
          "pch-pattern",
          "mega-cisterna-magna",
        ],
      ],
      [
        "BP2",
        [],
        [
          "vermis-small",
          "tcd-small",
          "pons-small",
          "dwm-pattern",
          "pch-pattern",
          "mega-cisterna-magna",
        ],
      ],
      [
        "BP3",
        ["mega-cisterna-magna"],
        [
          "vermis-small",
          "tcd-small",
          "pons-small",
          "dwm-pattern",
          "pch-pattern",
        ],
      ],
      [
        "BP4",
        [],
        [
          "vermis-small",
          "tcd-small",
          "pons-small",
          "dwm-pattern",
          "pch-pattern",
          "mega-cisterna-magna",
        ],
      ],
      [
        "BP5",
        [],
        [
          "vermis-small",
          "tcd-small",
          "pons-small",
          "dwm-pattern",
          "pch-pattern",
          "mega-cisterna-magna",
        ],
      ],
      [
        "BP6",
        ["vermis-small", "dwm-pattern"],
        ["tcd-small", "pons-small", "pch-pattern", "mega-cisterna-magna"],
      ],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const absent = /absent/i.test(rawValue);
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!absent && !valueMatch) continue;
        values[parameterId] = absent ? 0 : Number(valueMatch![1]);
        if (zScoredParameterIds.has(parameterId)) {
          bandChecks.push({ parameterId, expectedBand });
        }
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        const zResult = zs[parameterId];
        if (zResult == null) continue;
        const z = zResult.z;
        const sourceZs = zResult.sourceDetails.map(detail => detail.z);
        const lowZ = parameterId === "tcd" ? Math.min(z, ...sourceZs) : z;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
          if (parameterId === "tcd") {
            expect(lowZ).toBeGreaterThanOrEqual(-1.6448536269514722);
          }
        } else if (band.includes("<5th")) {
          expect(lowZ).toBeLessThan(-1.6448536269514722);
        } else if (band.includes(">97th")) {
          expect(z).toBeGreaterThan(1.8807936081512509);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }

      if (caseText.includes("| Third ventricle |")) {
        expect(values.third_ventricle).toBeGreaterThan(3.5);
      }
    }
  });

  it("keeps TEST.md cerebellar-hypoplasia fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Brain OFD-L", "brain_ofd_left"],
      ["Brain OFD-R", "brain_ofd_right"],
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Vermis AP", "vermis_ap"],
      ["Pons AP", "pons_ap"],
    ]);
    const expectations = [
      [
        "CH1",
        ["tcd-small"],
        ["vermis-small", "pons-small", "dwm-pattern", "pch-pattern"],
      ],
      [
        "CH2",
        ["tcd-small", "vermis-small"],
        ["pons-small", "dwm-pattern", "pch-pattern"],
      ],
      [
        "CH3",
        ["tcd-small"],
        ["vermis-small", "pons-small", "dwm-pattern", "pch-pattern"],
      ],
      [
        "CH4",
        ["mild-vm", "tcd-small"],
        ["vermis-small", "pons-small", "dwm-pattern", "pch-pattern"],
      ],
      ["CH5", [], ["tcd-small", "tcd-large", "vermis-small", "pons-small"]],
      [
        "CH6",
        ["tcd-small", "brain-asym"],
        ["vermis-small", "pons-small", "dwm-pattern", "pch-pattern"],
      ],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!valueMatch) continue;
        values[parameterId] = Number(valueMatch[1]);
        bandChecks.push({ parameterId, expectedBand });
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        const zResult = zs[parameterId];
        if (zResult == null) continue;
        const z = zResult.z;
        const sourceZs = zResult.sourceDetails.map(detail => detail.z);
        const lowZ = parameterId === "tcd" ? Math.min(z, ...sourceZs) : z;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
          if (parameterId === "tcd") {
            expect(lowZ).toBeGreaterThanOrEqual(-1.6448536269514722);
          }
        } else if (band.includes("<5th")) {
          expect(lowZ).toBeLessThan(-1.6448536269514722);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md macrocerebellum fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Skull BPD", "skull_bpd"],
      ["TCD", "tcd"],
      ["CC", "cc_length"],
      ["CSP", "csp_width"],
    ]);
    const expectations = [
      ["LC1", ["tcd-large"], ["macrocephaly", "cc-thick", "enlarged-csp"]],
      ["LC2", ["tcd-large", "macrocephaly"], ["cc-thick", "enlarged-csp"]],
      ["LC3", ["tcd-large"], ["macrocephaly", "cc-thick", "enlarged-csp"]],
      ["LC4", [], ["tcd-large", "macrocephaly", "cc-thick", "enlarged-csp"]],
      ["LC5", ["tcd-large", "cc-thick"], ["macrocephaly", "enlarged-csp"]],
      ["LC6", ["tcd-large", "enlarged-csp"], ["macrocephaly", "cc-thick"]],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!valueMatch) continue;
        values[parameterId] = Number(valueMatch[1]);
        bandChecks.push({ parameterId, expectedBand });
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        const z = zs[parameterId]?.z;
        if (z == null) continue;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
        } else if (band.includes(">97th")) {
          expect(z).toBeGreaterThan(1.8807936081512509);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md ACC fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Brain OFD-L", "brain_ofd_left"],
      ["Brain OFD-R", "brain_ofd_right"],
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["CSP", "csp_width"],
      ["CC", "cc_length"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Vermis AP", "vermis_ap"],
      ["TVA", "tva"],
    ]);
    const zScoredParameterIds = new Set([
      "brain_ofd_left",
      "brain_ofd_right",
      "atrial_right",
      "atrial_left",
      "csp_width",
      "cc_length",
      "tcd",
      "vermis_cc",
      "vermis_ap",
    ]);
    const expectations = [
      [
        "A1",
        ["absent-csp", "cc-absent", "mild-vm", "acc-pattern"],
        ["cc-short", "mod-vm", "severe-vm"],
      ],
      [
        "A2",
        ["absent-csp", "cc-absent", "mod-vm", "acc-pattern"],
        ["cc-short", "mild-vm", "severe-vm"],
      ],
      [
        "A3",
        ["absent-csp", "cc-absent", "mild-vm", "acc-pattern"],
        ["cc-short", "mod-vm", "severe-vm"],
      ],
      [
        "A4",
        ["cc-short"],
        [
          "absent-csp",
          "cc-absent",
          "acc-pattern",
          "mild-vm",
          "mod-vm",
          "severe-vm",
        ],
      ],
      [
        "A5",
        ["absent-csp", "cc-absent", "severe-vm", "acc-pattern"],
        ["cc-short", "brain-asym"],
      ],
      [
        "A6",
        [
          "absent-csp",
          "cc-absent",
          "acc-pattern",
          "vermis-small",
          "tcd-small",
          "dwm-pattern",
        ],
        ["cc-short", "pons-small"],
      ],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const absent = /absent/i.test(rawValue);
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!absent && !valueMatch) continue;
        values[parameterId] = absent ? 0 : Number(valueMatch![1]);
        if (zScoredParameterIds.has(parameterId)) {
          bandChecks.push({ parameterId, expectedBand });
        }
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        if (band.includes("special-cased")) continue;
        const zResult = zs[parameterId];
        if (zResult == null) continue;
        const z = zResult.z;
        const sourceZs = zResult.sourceDetails.map(detail => detail.z);
        const lowZ = parameterId === "tcd" ? Math.min(z, ...sourceZs) : z;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
          if (parameterId === "tcd") {
            expect(lowZ).toBeGreaterThanOrEqual(-1.6448536269514722);
          }
        } else if (band.includes("<5th")) {
          expect(lowZ).toBeLessThan(-1.6448536269514722);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md short-CC fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["CSP", "csp_width"],
      ["CC", "cc_length"],
    ]);
    const expectations = [
      ["CC1", ["cc-short"], ["cc-absent", "absent-csp", "acc-pattern"]],
      [
        "CC2",
        ["cc-short", "mild-vm"],
        ["cc-absent", "absent-csp", "acc-pattern"],
      ],
      ["CC3", ["cc-short"], ["cc-absent", "absent-csp", "acc-pattern"]],
      ["CC4", [], ["cc-short", "cc-absent", "absent-csp", "acc-pattern"]],
      ["CC5", ["cc-short", "absent-csp", "acc-pattern"], ["cc-absent"]],
      ["CC6", ["cc-short", "absent-csp", "acc-pattern"], ["cc-absent"]],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const absent = /absent/i.test(rawValue);
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!absent && !valueMatch) continue;
        values[parameterId] = absent ? 0 : Number(valueMatch![1]);
        bandChecks.push({ parameterId, expectedBand });
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        if (band.includes("special-cased")) continue;
        const z = zs[parameterId]?.z;
        if (z == null) continue;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
        } else if (band.includes("<5th")) {
          expect(z).toBeLessThan(-1.6448536269514722);
          expect(z).toBeGreaterThan(-3);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md thick-CC fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Skull BPD", "skull_bpd"],
      ["CC", "cc_length"],
      ["Pons AP", "pons_ap"],
      ["TCD", "tcd"],
    ]);
    const expectations = [
      ["TC1", ["cc-thick"], ["macrocephaly", "pons-large", "tcd-large"]],
      ["TC2", ["cc-thick", "macrocephaly"], ["pons-large", "tcd-large"]],
      ["TC3", [], ["cc-thick", "macrocephaly", "pons-large", "tcd-large"]],
      ["TC4", ["cc-thick", "pons-large"], ["macrocephaly", "tcd-large"]],
      ["TC5", ["cc-thick"], ["macrocephaly", "pons-large", "tcd-large"]],
      ["TC6", ["cc-thick", "tcd-large"], ["macrocephaly", "pons-large"]],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!valueMatch) continue;
        values[parameterId] = Number(valueMatch[1]);
        bandChecks.push({ parameterId, expectedBand });
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        const z = zs[parameterId]?.z;
        if (z == null) continue;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
        } else if (band.includes(">97th")) {
          expect(z).toBeGreaterThan(1.8807936081512509);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md absent-CSP fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["CSP", "csp_width"],
      ["CC", "cc_length"],
    ]);
    const expectations = [
      [
        "CSP-A1",
        ["absent-csp"],
        ["cc-short", "cc-absent", "cc-thick", "acc-pattern", "hpe-pattern"],
      ],
      [
        "CSP-A2",
        ["absent-csp", "mild-vm"],
        ["cc-short", "cc-absent", "cc-thick", "acc-pattern", "hpe-pattern"],
      ],
      [
        "CSP-A3",
        ["absent-csp"],
        ["cc-short", "cc-absent", "cc-thick", "acc-pattern", "hpe-pattern"],
      ],
      [
        "CSP-A4",
        ["absent-csp"],
        ["cc-short", "cc-absent", "cc-thick", "acc-pattern", "hpe-pattern"],
      ],
      [
        "CSP-A6",
        ["absent-csp"],
        ["cc-short", "cc-absent", "cc-thick", "acc-pattern", "hpe-pattern"],
      ],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const absent = /absent/i.test(rawValue);
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!absent && !valueMatch) continue;
        values[parameterId] = absent ? 0 : Number(valueMatch![1]);
        bandChecks.push({ parameterId, expectedBand });
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        if (band.includes("special-cased")) continue;
        const z = zs[parameterId]?.z;
        if (z == null) continue;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md HPE fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Skull BPD", "skull_bpd"],
      ["Skull OFD", "skull_ofd"],
      ["Brain BPD", "brain_bpd"],
      ["Brain OFD-L", "brain_ofd_left"],
      ["Brain OFD-R", "brain_ofd_right"],
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["CSP", "csp_width"],
      ["CC", "cc_length"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Vermis AP", "vermis_ap"],
      ["Pons AP", "pons_ap"],
      ["TVA", "tva"],
    ]);
    const zScoredParameterIds = new Set([
      "skull_bpd",
      "skull_ofd",
      "brain_bpd",
      "brain_ofd_left",
      "brain_ofd_right",
      "atrial_right",
      "atrial_left",
      "csp_width",
      "cc_length",
      "tcd",
      "vermis_cc",
      "vermis_ap",
      "pons_ap",
    ]);
    const expectations = [
      [
        "HPE1",
        ["severe-vm", "absent-csp", "cc-absent", "microcephaly", "hpe-pattern"],
        [
          "vermis-small",
          "tcd-small",
          "pons-small",
          "dwm-pattern",
          "pch-pattern",
          "acc-pattern",
        ],
      ],
      [
        "HPE2",
        ["severe-vm", "absent-csp", "cc-short", "microcephaly", "hpe-pattern"],
        ["cc-absent", "acc-pattern", "dwm-pattern", "pch-pattern"],
      ],
      [
        "HPE3",
        ["mild-vm", "absent-csp", "microcephaly"],
        ["hpe-pattern", "cc-short", "cc-absent", "macrocephaly", "acc-pattern"],
      ],
      [
        "HPE4",
        ["severe-vm", "absent-csp", "cc-absent", "microcephaly", "hpe-pattern"],
        ["acc-pattern"],
      ],
      [
        "HPE5",
        [
          "severe-vm",
          "absent-csp",
          "cc-absent",
          "vermis-small",
          "tcd-small",
          "pons-small",
          "microcephaly",
          "hpe-pattern",
          "dwm-pattern",
          "pch-pattern",
        ],
        ["acc-pattern"],
      ],
      [
        "HPE6",
        ["absent-csp"],
        [
          "hpe-pattern",
          "cc-short",
          "cc-absent",
          "cc-thick",
          "acc-pattern",
          "mild-vm",
          "severe-vm",
        ],
      ],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const absent = /absent/i.test(rawValue);
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!absent && !valueMatch) continue;
        values[parameterId] = absent ? 0 : Number(valueMatch![1]);
        if (zScoredParameterIds.has(parameterId)) {
          bandChecks.push({ parameterId, expectedBand });
        }
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        if (band.includes("special-cased")) continue;
        const zResult = zs[parameterId];
        if (zResult == null) continue;
        const z = zResult.z;
        const sourceZs = zResult.sourceDetails.map(detail => detail.z);
        const lowZ = parameterId === "tcd" ? Math.min(z, ...sourceZs) : z;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
          if (parameterId === "tcd") {
            expect(lowZ).toBeGreaterThanOrEqual(-1.6448536269514722);
          }
        } else if (band.includes("<3rd")) {
          expect(z).toBeLessThan(-1.8807936081512509);
        } else if (band.includes("<5th")) {
          expect(lowZ).toBeLessThan(-1.6448536269514722);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md large-pons fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Skull BPD", "skull_bpd"],
      ["Pons AP", "pons_ap"],
      ["TCD", "tcd"],
      ["CC", "cc_length"],
    ]);
    const expectations = [
      ["LP1", ["pons-large"], ["macrocephaly", "tcd-large", "cc-thick"]],
      ["LP2", ["pons-large", "macrocephaly"], ["tcd-large", "cc-thick"]],
      ["LP3", [], ["pons-large", "macrocephaly", "tcd-large", "cc-thick"]],
      ["LP4", ["pons-large", "tcd-large"], ["macrocephaly", "cc-thick"]],
      ["LP5", ["pons-large"], ["macrocephaly", "tcd-large", "cc-thick"]],
      ["LP6", ["pons-large", "cc-thick"], ["macrocephaly", "tcd-large"]],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!valueMatch) continue;
        values[parameterId] = Number(valueMatch[1]);
        bandChecks.push({ parameterId, expectedBand });
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        const z = zs[parameterId]?.z;
        if (z == null) continue;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
        } else if (band.includes(">97th")) {
          expect(z).toBeGreaterThan(1.8807936081512509);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md third-ventricle/aqueductal-stenosis fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["CSP", "csp_width"],
      ["CC", "cc_length"],
      ["Third ventricle", "third_ventricle"],
      ["Skull BPD", "skull_bpd"],
    ]);
    const zScoredParameterIds = new Set([
      "atrial_right",
      "atrial_left",
      "csp_width",
      "cc_length",
      "skull_bpd",
    ]);
    const expectations = [
      [
        "TV1",
        ["severe-vm", "third-v-wide", "hydrocephalus-pattern"],
        ["macrocephaly"],
      ],
      [
        "AS-P2",
        ["mod-vm", "third-v-wide", "hydrocephalus-pattern"],
        ["severe-vm", "macrocephaly"],
      ],
      [
        "AS-P4",
        ["severe-vm"],
        ["third-v-wide", "hydrocephalus-pattern", "macrocephaly"],
      ],
      [
        "AS-P5",
        ["severe-vm", "third-v-wide", "macrocephaly", "hydrocephalus-pattern"],
        [],
      ],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!valueMatch) continue;
        values[parameterId] = Number(valueMatch[1]);
        bandChecks.push({ parameterId, expectedBand });
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        if (parameterId === "third_ventricle") {
          const value = values[parameterId];
          if (band.includes("normal") && !band.includes("abnormal")) {
            expect(value).toBeLessThanOrEqual(3.5);
          } else if (band.includes(">95th")) {
            expect(value).toBeGreaterThan(3.5);
          }
          continue;
        }
        if (!zScoredParameterIds.has(parameterId)) continue;
        const z = zs[parameterId]?.z;
        if (z == null) continue;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
        } else if (band.includes(">97th")) {
          expect(z).toBeGreaterThan(1.8807936081512509);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md negative-control fixtures calibrated to runtime bands and cards", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["CSP", "csp_width"],
      ["CC", "cc_length"],
      ["Third ventricle", "third_ventricle"],
      ["Skull BPD", "skull_bpd"],
      ["Brain BPD", "brain_bpd"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Pons AP", "pons_ap"],
    ]);
    const expectations = [
      [
        "NEG1",
        ["mild-vm", "absent-csp"],
        ["hpe-pattern", "microcephaly", "macrocephaly"],
      ],
      ["NEG2", ["cc-short"], ["acc-pattern", "absent-csp", "cc-absent"]],
      ["NEG3", ["severe-vm"], ["third-v-wide", "hydrocephalus-pattern"]],
      [
        "NEG4",
        ["tcd-small"],
        ["dwm-pattern", "pch-pattern", "vermis-small", "pons-small"],
      ],
      [
        "NEG5",
        ["macrocephaly"],
        ["cc-thick", "pons-large", "hydrocephalus-pattern", "tcd-large"],
      ],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const absent = /absent/i.test(rawValue);
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!absent && !valueMatch) continue;
        values[parameterId] = absent ? 0 : Number(valueMatch![1]);
        bandChecks.push({ parameterId, expectedBand });
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        if (band.includes("special-cased")) continue;
        if (parameterId === "third_ventricle") {
          const value = values[parameterId];
          if (band.includes("normal") && !band.includes("abnormal")) {
            expect(value).toBeLessThanOrEqual(3.5);
          } else if (band.includes(">95th")) {
            expect(value).toBeGreaterThan(3.5);
          }
          continue;
        }
        const zResult = zs[parameterId];
        if (zResult == null) continue;
        const z = zResult.z;
        const sourceZs = zResult.sourceDetails.map(detail => detail.z);
        const lowZ = parameterId === "tcd" ? Math.min(z, ...sourceZs) : z;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
          if (parameterId === "tcd") {
            expect(lowZ).toBeGreaterThanOrEqual(-1.6448536269514722);
          }
        } else if (band.includes("<5th")) {
          expect(lowZ).toBeLessThan(-1.6448536269514722);
        } else if (band.includes(">97th")) {
          expect(z).toBeGreaterThan(1.8807936081512509);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("keeps TEST.md endcap fixtures calibrated to runtime bands, cards, and source agreement", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const parameterLabels = new Map([
      ["Atrium-R", "atrial_right"],
      ["Atrium-L", "atrial_left"],
      ["CSP", "csp_width"],
      ["Third ventricle", "third_ventricle"],
      ["Skull BPD", "skull_bpd"],
      ["Brain BPD", "brain_bpd"],
      ["TCD", "tcd"],
      ["Vermis CC", "vermis_cc"],
      ["Pons AP", "pons_ap"],
      ["Extra-axial CSF", "extra_axial_csf"],
      ["CSA", "csa"],
      ["TDPF", "tdpf"],
    ]);
    const expectations = [
      [
        "CII4",
        [
          "severe-vm",
          "third-v-wide",
          "macrocephaly",
          "hydrocephalus-pattern",
          "tcd-small",
          "vermis-small",
          "chiari-ii-ontd",
        ],
        ["mild-vm"],
      ],
      ["EA1", ["extra-axial-wide"], ["microcephaly", "macrocephaly"]],
      [
        "STRESS3",
        [],
        [
          "tcd-small",
          "tcd-large",
          "vermis-small",
          "vermis-large",
          "pons-large",
          "macrocephaly",
          "microcephaly",
        ],
      ],
      ["STRESS6", [], ["tcd-small", "tcd-large"]],
    ] as const;

    const extractCase = (caseId: string): string => {
      const start = testCorpus.indexOf(`### Case ${caseId} `);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextCase = testCorpus.indexOf("\n### Case ", start + 1);
      const nextSection = testCorpus.indexOf("\n---", start + 1);
      const endCandidates = [nextCase, nextSection].filter(index => index > 0);
      return testCorpus.slice(start, Math.min(...endCandidates));
    };

    for (const [caseId, expectedDxIds, forbiddenDxIds] of expectations) {
      const caseText = extractCase(caseId);
      const values: Record<string, number> = {};
      const bandChecks: { parameterId: string; expectedBand: string }[] = [];
      let ga: { weeks: number; days: number } | null = null;

      for (const rawLine of caseText.split("\n")) {
        if (!rawLine.startsWith("|")) continue;
        const [label, rawValue, expectedBand] = rawLine
          .split("|")
          .slice(1, -1)
          .map(cell => cell.replaceAll("**", "").trim());

        if (label === "GA") {
          const match = rawValue.match(/(\d+) w (\d+) d/);
          expect(match).not.toBeNull();
          ga = { weeks: Number(match![1]), days: Number(match![2]) };
          continue;
        }

        const parameterId = parameterLabels.get(label);
        if (!parameterId) continue;
        const valueMatch = rawValue.match(/(-?\d+(?:\.\d+)?)/);
        if (!valueMatch) continue;
        values[parameterId] = Number(valueMatch[1]);
        bandChecks.push({ parameterId, expectedBand });
      }

      expect(ga).not.toBeNull();
      const { zs, dxs } = evaluateAll(values, ga!);
      const dxIds = dxs.map(dx => dx.id);
      for (const expectedDxId of expectedDxIds) {
        expect(dxIds).toContain(expectedDxId);
      }
      for (const forbiddenDxId of forbiddenDxIds) {
        expect(dxIds).not.toContain(forbiddenDxId);
      }
      if (caseId === "STRESS6") {
        expect(zs.tcd?.agreementState).toBe("disagree");
        expect(zs.tcd?.disagreementWidth).toBeGreaterThanOrEqual(1);
      }

      for (const { parameterId, expectedBand } of bandChecks) {
        const band = expectedBand.toLowerCase();
        if (parameterId === "third_ventricle") {
          const value = values[parameterId];
          if (band.includes("normal") && !band.includes("abnormal")) {
            expect(value).toBeLessThanOrEqual(3.5);
          } else if (band.includes(">95th")) {
            expect(value).toBeGreaterThan(3.5);
          }
          continue;
        }
        const zResult = zs[parameterId];
        if (zResult == null) continue;
        const z = zResult.z;
        const sourceZs = zResult.sourceDetails.map(detail => detail.z);
        const lowZ = parameterId === "tcd" ? Math.min(z, ...sourceZs) : z;
        const highZ = parameterId === "tcd" ? Math.max(z, ...sourceZs) : z;
        if (band.includes("normal") && !band.includes("abnormal")) {
          expect(Math.abs(z)).toBeLessThan(1.6448536269514722);
          if (parameterId === "tcd") {
            expect(lowZ).toBeGreaterThanOrEqual(-1.6448536269514722);
            expect(highZ).toBeLessThanOrEqual(1.6448536269514722);
          }
        } else if (band.includes("<5th")) {
          expect(lowZ).toBeLessThan(-1.6448536269514722);
        } else if (band.includes(">97th")) {
          expect(z).toBeGreaterThan(1.8807936081512509);
        } else if (band.includes(">95th")) {
          expect(z).toBeGreaterThan(1.6448536269514722);
        }
      }
    }
  });

  it("locks Aertsen 2019 citation metadata to the PMC AJNR article", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");

    expect(spec).toContain("10.3174/ajnr.A5930");
    expect(spec).not.toContain("10.3174/ajnr.A5921");
    expect(testCorpus).toContain(
      "Aertsen M, Verduyckt J, De Keyzer F, et al. Reliability of MR Imaging-Based Posterior Fossa and Brain Stem Measurements in Open Spinal Dysraphism in the Era of Fetal Surgery."
    );
    expect(testCorpus).toContain("10.3174/ajnr.A5930");
    expect(testCorpus).not.toContain("10.1002/uog.20214");
  });

  it("locks D'Addario 2001 citation metadata to the clivus-supraocciput article", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");

    expect(spec).toContain("10.1046/j.1469-0705.2001.00409.x");
    expect(testCorpus).toContain("10.1046/j.1469-0705.2001.00409.x");
    expect(testCorpus).toContain("Di Cagno L, Pintucci A");
    expect(testCorpus).not.toContain("10.1046/j.1469-0705.2001.00472.x");
  });

  it("locks Sun 2024 ACC citation metadata to the PubMed and Crossref article", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const biometry = readFileSync(
      resolve(process.cwd(), "client/src/lib/biometry.ts"),
      "utf8"
    );

    expect(spec).toContain("10.1016/j.ejogrb.2024.05.005");
    expect(spec).toContain("38756055");
    expect(spec).toContain("S0301211524002264");
    expect(spec).not.toContain("10.1016/j.ejogrb.2024.05.022");
    expect(spec).not.toContain("S030121152400239X");
    expect(spec).not.toMatch(/precise yield requires eyes on Table 2/i);
    expect(testCorpus).toContain("Sun H");
    expect(testCorpus).toContain("10.1016/j.ejogrb.2024.05.005");
    expect(testCorpus).not.toContain("Sun L");
    expect(testCorpus).not.toContain("10.1016/j.ejogrb.2024.05.022");
    expect(biometry).toContain("10.1016/j.ejogrb.2024.05.005");
  });

  it("locks Heaphy-Henault 2018 aqueductal stenosis metadata to the AJNR article", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");

    expect(spec).toContain("10.3174/ajnr.A5590");
    expect(spec).toContain("29519789");
    expect(spec).toContain("PMC7410663");
    expect(spec).not.toContain("29545253");
    expect(spec).not.toContain('citation correction: was "Garel 2018"');
    expect(spec).not.toContain(
      "Most common cause of obstructive hydrocephalus (Garel 2018)."
    );
    expect(testCorpus).toContain("PMID 29519789");
  });

  it("locks Corroenne 2023 corpus-callosum review metadata to the UOG article", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");

    expect(spec).toContain("10.1002/uog.26187");
    expect(spec).toContain("36864530");
    expect(spec).not.toContain("10.1002/uog.26280");
    expect(spec).not.toContain("36786414");
    expect(spec).not.toContain("PMC10464495");
    expect(spec).toContain(
      "Corpus callosal reference ranges: systematic review of methodology of biometric chart construction and measurements obtained"
    );
  });

  it("locks Ma 2019 atrial-diameter metadata to the Medicine fetal-MRI article", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");

    expect(spec).toContain("10.1097/MD.0000000000016118");
    expect(spec).toContain("31261528");
    expect(spec).toContain("PMC6616102");
    expect(spec).toContain(
      "Volume growth trend and correlation of atrial diameter with lateral ventricular volume in normal fetus and fetus with ventriculomegaly"
    );
    expect(spec).not.toContain("10.1002/jum.15003");
    expect(spec).not.toContain(
      "Ultrasound and Histopathologic Correlation of Ovarian Cystadenofibromas"
    );
    expect(spec).not.toContain(
      "Reference values for fetal lateral ventricular atrial diameter on MRI between 18 and 38 gestational weeks"
    );
  });

  it("locks Vatansever 2013 posterior-fossa metadata to the Cerebellum article", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const biometry = readFileSync(
      resolve(process.cwd(), "client/src/lib/biometry.ts"),
      "utf8"
    );

    expect(spec).toContain("10.1007/s12311-013-0470-2");
    expect(spec).toContain("23553467");
    expect(spec).toContain(
      "Multidimensional Analysis of Fetal Posterior Fossa in Health and Disease"
    );
    expect(spec).toContain(
      "| VATANSEVER_2013 | Vatansever D, Kyriakopoulou V, Allsop JM, Fox M, Chew A, Hajnal JV, Rutherford MA."
    );
    expect(spec).not.toContain(
      "| VATANSEVER_2013 | Vatansever D et al. Normative MR biometry of the fetal cerebellum."
    );
    expect(biometry).toContain("10.1007/s12311-013-0470-2");
    expect(biometry).toContain("PMID 23553467");
  });

  it("locks Malinger 2005 metadata to the absent-septum-pellucidum article", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const biometry = readFileSync(
      resolve(process.cwd(), "client/src/lib/biometry.ts"),
      "utf8"
    );

    expect(spec).toContain("10.1002/uog.1787");
    expect(spec).toContain("15593321");
    expect(spec).toContain(
      "Differential diagnosis in fetuses with absent septum pellucidum"
    );
    expect(spec).toContain(
      "| MALINGER_2005 | Malinger G, Lev D, Kidron D, Heredia F, Hershkovitz R, Lerman-Sagie T."
    );
    expect(spec).not.toContain(
      "| MALINGER_2005 | Malinger G, Lev D, Lerman-Sagie T. *Fetal cerebellar pitfalls in diagnosis and management.*"
    );
    expect(spec).not.toContain("(publisher landing page)");
    expect(biometry).toContain("doi:10.1002/uog.1787");
    expect(biometry).toContain("PMID 15593321");
  });

  it("locks Kertes 2021 CSP metadata to the European Journal of Radiology article", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const biometry = readFileSync(
      resolve(process.cwd(), "client/src/lib/biometry.ts"),
      "utf8"
    );

    expect(spec).toContain("10.1016/j.ejrad.2020.109470");
    expect(spec).toContain("33338761");
    expect(spec).toContain(
      "The normal fetal Cavum Septum Pellucidum in MR imaging - New biometric data"
    );
    expect(spec).toContain(
      "| KERTES_2021 | Kertes I, Hoffman D, Yahal O, Berknstadt M, Bar-Yosef O, Ezra O, Katorza E."
    );
    expect(spec).not.toContain("(ScienceDirect S0720048X20306604)");
    expect(spec).not.toContain("Hoffman C, Yagel S");
    expect(spec).not.toContain(
      "Cavum septi pellucidi width on fetal MRI: normal values and reference range from 28 to 37 weeks"
    );
    expect(biometry).toContain("doi:10.1016/j.ejrad.2020.109470");
    expect(biometry).toContain("PMID 33338761");
  });

  it("locks Harreld 2011 corpus-callosum metadata to the AJNR fetal-MRI article", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");

    expect(spec).toContain(
      "| HARRELD_2011 | Harreld JH, Bhore R, Chason DP, Twickler DM."
    );
    expect(spec).toContain("10.3174/ajnr.A2310");
    expect(spec).toContain("21183616");
    expect(spec).toContain("PMC8013091");
    expect(spec).not.toContain("21183617");
    expect(spec).not.toContain("PMC7965598");
  });

  it("locks NCBI-audited source-inventory identifiers to their stated articles", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");

    expect(spec).toContain(
      "| TILEA_2009 | Tilea B, Alberti C, Adamsbaum C, et al."
    );
    expect(spec).toContain(
      "| MRI | 10.1002/uog.6276 | 19172662 | (not in PMC) |"
    );
    expect(spec).toContain(
      "| KATORZA_2016 | Katorza E, Bertucci E, Perlman S, et al."
    );
    expect(spec).toContain(
      "| MRI | 10.3174/ajnr.A4725 | 27032974 | PMC7960333 |"
    );
    expect(spec).toContain(
      "| CONTE_2018 | Conte G, Milani S, Palumbo G, et al."
    );
    expect(spec).toContain(
      "| MRI | 10.3174/ajnr.A5574 | 29519792 | PMC7410661 |"
    );
    expect(spec).toContain(
      "| WOITEK_2014 | Woitek R, Dvorak A, Weber M, et al."
    );
    expect(spec).toContain(
      "| MRI | 10.1371/journal.pone.0112585 | 25393279 | PMC4231033 |"
    );
    expect(spec).toContain(
      "| AERTSEN_2019 | Aertsen M, Verduyckt J, De Keyzer F, et al."
    );
    expect(spec).toContain(
      "| MRI | 10.3174/ajnr.A5930 | 30591508 | PMC7048594 |"
    );
    expect(spec).toContain(
      "| DADDARIO_2001 | D'Addario V, Pinto V, Di Cagno L, Pintucci A."
    );
    expect(spec).toContain(
      "| US (CSA originally) | 10.1046/j.1469-0705.2001.00409.x | 11529995 | (not in PMC) |"
    );
    expect(spec).toContain("| SMFM_2020_CSP | SMFM; Ward A, Monteagudo A.");
    expect(spec).toContain(
      "| (DDx layer) | 10.1016/j.ajog.2020.08.180 | 33168214 | (not in PMC) |"
    );
    expect(spec).toContain(
      "| SANTO_2012 | Santo S, D'Antonio F, Homfray T, et al."
    );
    expect(spec).toContain("| 10.1002/uog.12315 | 23024003 | (not in PMC) |");
    expect(spec).toContain(
      "| GAREL_2003 | Garel C, Luton D, Oury JF, Gressens P."
    );
    expect(spec).toContain(
      "| (DDx layer review) | 10.1007/s00381-003-0795-0 | 12879346 | (not in PMC) |"
    );
    expect(spec).not.toContain("19173238");
    expect(spec).not.toContain("26988817");
    expect(spec).not.toContain("PMC7960174");
    expect(spec).not.toContain("29545254");
    expect(spec).not.toContain("PMC7410554");
    expect(spec).not.toContain("25393026");
    expect(spec).not.toContain("30606726");
    expect(spec).not.toContain("11529997");
    expect(spec).not.toContain("10.1016/j.ajog.2020.02.033");
    expect(spec).not.toContain("32114082");
    expect(spec).not.toContain("23024028");
    expect(spec).not.toContain("12879338");
  });

  it("locks the TEST corpus Aertsen 2019 PMID to the AJNR posterior-fossa article", () => {
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");

    expect(testCorpus).toContain(
      "Aertsen M, Verduyckt J, De Keyzer F, et al. Reliability of MR Imaging-Based Posterior Fossa and Brain Stem Measurements in Open Spinal Dysraphism in the Era of Fetal Surgery."
    );
    expect(testCorpus).toContain("doi:10.3174/ajnr.A5930");
    expect(testCorpus).toContain("PMID 30591508; PMCID PMC7048594");
    expect(testCorpus).not.toContain("30606726");
    expect(testCorpus).not.toContain("10.3174/ajnr.A5926");
  });

  it("locks Bahlmann 2015 spina-bifida metadata to the Prenatal Diagnosis article", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");

    expect(spec).toContain("10.1002/pd.4524");
    expect(spec).toContain("25346419");
    expect(spec).toContain(
      "Cranial and cerebral signs in the diagnosis of spina bifida between 18 and 22 weeks of gestation"
    );
    expect(spec).not.toContain("25333768");
    expect(spec).not.toContain("10.1021/nl502994y");
  });

  it("uses explicit PMCID absence labels in the source inventory", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");

    expect(spec).not.toContain("(NA)");
    expect(spec).toContain(
      "| CORROENNE_2023 | Corroenne R, Grevent D, Kasprian G, Stirnemann J, Ville Y, Mahallati H, Salomon LJ."
    );
    expect(spec).toContain(
      "| SMFM_2018 | Society for Maternal-Fetal Medicine."
    );
    expect(spec).toContain("| SMFM_2020_CSP | SMFM; Ward A, Monteagudo A.");
    expect(spec).toContain("| SUN_2024 | Sun H, Li K, Wang L");
    expect(spec).toContain("| GAREL_2003 | Garel C, Luton D, Oury JF");
  });

  it("keeps the SPEC reference labels unique and numeric", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const labels = [...spec.matchAll(/^\[([0-9]+[a-z]?)\]/gm)].map(
      ([, label]) => label
    );
    const duplicateLabels = labels.filter(
      (label, index) => labels.indexOf(label) !== index
    );

    expect(labels.filter(label => /[a-z]/.test(label))).toEqual([]);
    expect(duplicateLabels).toEqual([]);
    expect(spec).toContain("[43] Zalevskyi V, Sanchez T, Kaandorp M, et al.");
    expect(spec).toContain("[46] Woitek R, Dvorak A, Weber M, et al.");
    expect(spec).toContain("[49] Bahlmann F, Reinhard I, Schramm T");
    expect(spec).not.toContain("Woitek R, Prayer D, Weber M");
  });

  it("keeps Dovjak 2021 gestational-age ranges aligned to the audited source", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const testCorpus = readFileSync(resolve(process.cwd(), "TEST.md"), "utf8");
    const methodology = readFileSync(
      resolve(process.cwd(), "client/src/pages/Methodology.tsx"),
      "utf8"
    );
    const biometry = readFileSync(
      resolve(process.cwd(), "client/src/lib/biometry.ts"),
      "utf8"
    );

    expect(spec).toContain(
      "Dovjak 2021 source range audit performed on 2026-05-23: PMC8457244 and PubMed PMID 32730667 state a cohort range of 14+0 to 39+2 weeks"
    );
    expect(testCorpus).toContain(
      "Dovjak 2021 source range audit: 14+0 to 39+2 weeks (encoded as 14.0-39.3 weeks)"
    );
    expect(methodology).toContain("validated 14.0-39.3 weeks");
    expect(biometry).toContain(
      "Dovjak GO, Schmidbauer V, Brugger PC, et al. Normal human brainstem development in vivo: a quantitative fetal MRI study. Ultrasound Obstet Gynecol. 2021;58(2):254-263. doi:10.1002/uog.22162. PMID 32730667."
    );
    expect(spec).toContain(
      "[11] Dovjak GO, Schmidbauer V, Brugger PC, et al. Normal human brainstem development in vivo: a quantitative fetal MRI study. *Ultrasound Obstet Gynecol*. 2021;58(2):254-263."
    );
    expect(spec).not.toContain("2021;58(2):254-262");
    expect(spec).toContain("n = 161 normal fetuses; 1.5 T T2 fetal MRI");
    expect(spec).not.toContain("n = 180 normal fetuses");
    for (const staleRange of [
      "Dovjak 2021 valid 18",
      "Dovjak 2021 validity window",
      "Dovjak 2021 is validated to 36",
      "published 21–36 w window",
      "validated 14–40 w",
    ]) {
      expect(spec).not.toContain(staleRange);
      expect(testCorpus).not.toContain(staleRange);
    }
  });

  it("locks the Woitek 2014 Table 3 control rows to the PMC source audit", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );
    const finalLock = readFileSync(
      resolve(process.cwd(), "source_data_final_lock.md"),
      "utf8"
    );

    expect(spec).toContain("| 21 | 26.9 | 2.6 | 74.2 | 5.1 |");
    expect(spec).toContain("| 37 | 54.4 | 1.9 | 90.3 | 3.6 |");
    expect(spec).not.toContain("| 21 | 3 | 20.5 | 1.9 | 73.7 | 5.5 |");
    expect(spec).toContain("PMC4231033 Table 3 byte-check");
    expect(dossier).toContain("PMC Table 3 byte-checked");
    expect(finalLock).toContain("Implementation byte-check complete");
  });

  it("locks the Dovjak 2021 Table 1 equations to the PMC source audit", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );
    const finalLock = readFileSync(
      resolve(process.cwd(), "source_data_final_lock.md"),
      "utf8"
    );

    expect(spec).toContain("PMC8457244 Table 1 byte-checked");
    expect(spec).toContain("TCD: p5 = 1.52·GA - 12.48");
    expect(spec).toContain("total pons AP: p5 = 0.33·GA - 0.59");
    expect(spec).not.toContain("numeric pairs require eyes-on-paper");
    expect(dossier).toContain("PMC Table 1 byte-checked");
    expect(finalLock).toContain("Dovjak 2021 Table 1 status");
    expect(finalLock).toMatch(
      /Dovjak 2021 Table 1 status\s+\|\s+Implementation byte-check complete/
    );
  });

  it("locks extra-axial CSF to exact Kyriakopoulou workbook coefficients", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );
    const finalLock = readFileSync(
      resolve(process.cwd(), "source_data_final_lock.md"),
      "utf8"
    );

    expect(spec).toContain("Kyriakopoulou 2017 supplementary workbook row 19");
    expect(spec).toContain("a = -0.0604400737108953");
    expect(spec).toContain("a5 = 0.0736569049728816");
    expect(spec).not.toContain(
      "extra-axial CSF quadratic curve currently used"
    );
    expect(dossier).toContain("extra-axial CSF coefficient decision");
    expect(dossier).toContain("Closed");
    expect(finalLock).toMatch(
      /extra-axial CSF coefficient decision\s+\|\s+Implementation exact coefficients encoded/
    );
  });

  it("keeps the SPEC 4.2.2 source-registry table aligned with extra-axial CSF", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");

    expect(spec).toContain(
      "| Extra-cerebral CSF width | Kyriakopoulou 2017 [3] | Quadratic mean / linear SD | 21-38 weeks | n = 108 fetuses; fetal MRI |"
    );
    expect(spec).toContain(
      "The Kyriakopoulou 2017 extra-cerebral CSF coefficients are transcribed from supplementary workbook row 19"
    );
  });

  it("aligns SPEC Part 2 normative-source dossier with the active registry", () => {
    const spec = readFileSync(resolve(process.cwd(), "SPEC.md"), "utf8");

    expect(spec).toContain(
      "| Global brain / skull growth | Luis et al. (2025) [2] | Active computational source for skull BPD/OFD and brain BPD/OFD; Tilea and Kyriakopoulou remain teaching or cross-validation references. |"
    );
    expect(spec).toContain(
      "| Extra-cerebral CSF width | Kyriakopoulou et al. (2017) [3] | Supplementary workbook row 19 exact quadratic mean / linear SD coefficients. |"
    );
    expect(spec).toContain(
      "| Third ventricle width | Hertzberg 1997 threshold [36] | Raw >3.5 mm threshold only; no Phase 1 z-score model. |"
    );
    expect(spec).not.toContain("| Skull BPD & OFD | Tilea et al. (2009) [7]");
    expect(spec).not.toContain(
      "| TCD & Vermis | Vatansever et al. (2013) [10]"
    );
  });
});

describe("publication handoff checklist", () => {
  it("maps reporting standards to manuscript sections, owners, and required evidence", () => {
    const checklist = readFileSync(
      resolve(process.cwd(), "publication_handoff_checklist.md"),
      "utf8"
    );

    expect(checklist).toContain("TRIPOD+AI");
    expect(checklist).toContain("CLAIM");
    expect(checklist).toContain("SQUIRE 2.0");
    expect(checklist).toContain("STARD-AI");
    expect(checklist).toContain("DECIDE-AI");
    expect(checklist).toContain("SPIRIT-AI");
    expect(checklist).toContain("CONSORT-AI");
    expect(checklist).toContain("clinical trial protocol");
    expect(checklist).toContain("PMID 32908284");
    expect(checklist).toContain("PMID 32908283");
    expect(checklist).toContain("Manuscript section");
    expect(checklist).toContain("Required evidence");
    expect(checklist).toContain("Owner");
    expect(checklist).toContain("calibration-in-the-large");
    expect(checklist).toContain("Wilson confidence intervals");
    expect(checklist).toContain("ROC-AUC confidence interval");
    expect(checklist).toContain("decision-curve net benefit");
    expect(checklist).toContain("client/src/lib/validation-metrics.ts");
    expect(checklist).toContain("Cohen's kappa");
    expect(checklist).toContain("Fleiss's kappa");
    expect(checklist).toContain("ICC(2,1)");
    expect(checklist).toContain("paired within-reader / within-case deltas");
    expect(checklist).toContain("paired delta confidence intervals");
    expect(checklist).toContain("raw NASA Task Load Index scoring");
    expect(checklist).toContain("System Usability Scale scoring");
    expect(checklist).toContain("Welch two-sample comparison");
    expect(checklist).toContain("FeTA 2024");
    expect(checklist).toContain("reader-study timing");
    expect(checklist).toContain("source-data final lock");
    expect(checklist).toContain("validation_analysis_lock.md");
    expect(checklist).toContain("pre/post report-audit metrics");
    expect(checklist).toContain("Go / no-go");
  });

  it("provides a pre-analysis lock template for cohort, endpoint, threshold, and code freeze", () => {
    const lock = readFileSync(
      resolve(process.cwd(), "validation_analysis_lock.md"),
      "utf8"
    );
    const checklist = readFileSync(
      resolve(process.cwd(), "publication_handoff_checklist.md"),
      "utf8"
    );
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );

    expect(lock).toContain("threshold-lock date");
    expect(lock).toContain("cohort freeze");
    expect(lock).toContain("endpoint freeze");
    expect(lock).toContain("code-version freeze");
    expect(lock).toContain("No post hoc threshold changes");
    expect(lock).toContain("Chiari II / ONTD research-mode");
    expect(checklist).toContain("validation_analysis_lock.md");
    expect(dossier).toContain("validation_analysis_lock.md");
  });

  it("keeps the source-verification dossier date aligned with the analysis-lock handoff", () => {
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );

    expect(dossier).toContain("validation_analysis_lock.md");
    expect(dossier).toContain("Last updated: 2026-05-24.");
  });

  it("keeps sample-size and precision planning visible in the handoff artifacts", () => {
    const checklist = readFileSync(
      resolve(process.cwd(), "publication_handoff_checklist.md"),
      "utf8"
    );
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );
    const lock = readFileSync(
      resolve(process.cwd(), "validation_analysis_lock.md"),
      "utf8"
    );

    expect(checklist).toContain("sample-size / precision plan");
    expect(checklist).toContain(
      "estimateDiagnosticAccuracyPrecisionSampleSize"
    );
    expect(checklist).toContain("estimatePairedMeanDifferenceSampleSize");
    expect(dossier).toContain("TRIPOD+AI statement");
    expect(dossier).toContain("PMID 38626948");
    expect(dossier).toContain("PMID 38636956");
    expect(dossier).toContain("10.1136/bmj.q902");
    expect(dossier).toContain("STARD-AI diagnostic accuracy guideline");
    expect(dossier).toContain("PMID 40954311");
    expect(dossier).toContain("CLAIM 2024 Update");
    expect(dossier).toContain("PMID 38809149");
    expect(lock).toContain("sample-size / precision plan");
  });

  it("keeps cohort-flow and missing-data accounting visible in the handoff artifacts", () => {
    const checklist = readFileSync(
      resolve(process.cwd(), "publication_handoff_checklist.md"),
      "utf8"
    );
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );
    const lock = readFileSync(
      resolve(process.cwd(), "validation_analysis_lock.md"),
      "utf8"
    );

    expect(checklist).toContain("cohort flow and missing-data summary");
    expect(checklist).toContain("summarizeValidationCohortFlow");
    expect(dossier).toContain("Cohort flow and missing-data accounting");
    expect(dossier).toContain("complete-case denominators");
    expect(lock).toContain("cohort-flow and missing-data summary");
  });

  it("keeps the source-verification dossier aligned to ROC-AUC interval reporting", () => {
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );

    expect(dossier).toContain("ROC-AUC confidence interval");
    expect(dossier).toContain("Calibration and clinical utility");
    expect(dossier).toContain("Open");
  });

  it("records PubMed-verified SPIRIT-AI and CONSORT-AI handoff evidence", () => {
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );

    expect(dossier).toContain("SPIRIT-AI");
    expect(dossier).toContain("CONSORT-AI");
    expect(dossier).toContain("PMID 32908284");
    expect(dossier).toContain("10.1038/s41591-020-1037-7");
    expect(dossier).toContain("PMID 32908283");
    expect(dossier).toContain("10.1038/s41591-020-1034-x");
  });

  it("records PubMed-verified DECIDE-AI handoff evidence", () => {
    const checklist = readFileSync(
      resolve(process.cwd(), "publication_handoff_checklist.md"),
      "utf8"
    );
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );

    expect(checklist).toContain("DECIDE-AI");
    expect(checklist).toContain("PMID 35585198");
    expect(checklist).toContain("10.1038/s41591-022-01772-9");
    expect(checklist).toContain("PMID 35962208");
    expect(checklist).toContain("10.1038/s41591-022-01951-8");
    expect(dossier).toContain("DECIDE-AI");
    expect(dossier).toContain("PMID 35585198");
    expect(dossier).toContain("10.1038/s41591-022-01772-9");
    expect(dossier).toContain("PMID 35962208");
    expect(dossier).toContain("10.1038/s41591-022-01951-8");
  });

  it("keeps an active-goal completion audit linked to concrete software evidence and post-handoff work", () => {
    const audit = readFileSync(
      resolve(process.cwd(), "completion_audit.md"),
      "utf8"
    );
    const checklist = readFileSync(
      resolve(process.cwd(), "publication_handoff_checklist.md"),
      "utf8"
    );

    expect(audit).toContain("Active Goal Completion Audit");
    expect(audit).toContain("Prompt-to-artifact checklist");
    expect(audit).toContain("SPEC.md");
    expect(audit).toContain("TEST.md");
    expect(audit).toContain("PLAN.md");
    expect(audit).toContain("PROGRESS.md");
    expect(audit).toContain("publication_handoff_checklist.md");
    expect(audit).toContain("source_verification_dossier.md");
    expect(audit).toContain("validation_analysis_lock.md");
    expect(audit).toContain("reader_study_protocol.md");
    expect(audit).toContain("source_data_final_lock.md");
    expect(audit).toContain("npx pnpm@10.4.1 test -- --runInBand");
    expect(audit).toContain("npx pnpm@10.4.1 check");
    expect(audit).toContain("npx pnpm@10.4.1 build");
    expect(audit).toContain("python3 -m py_compile");
    expect(audit).toContain("git diff --check");
    expect(audit).toContain("0 residual normal-label rows");
    expect(audit).toContain(
      "Goal status: Software-ready complete; external evaluation pending"
    );
    expect(audit).toContain("Post-Software Evaluation Work");
    expect(audit).toContain("FeTA 2024 biometry gap");
    expect(audit).toContain("IRB / QI determination");
    expect(audit).toContain("Source-data final lock");
    expect(audit).toContain("Chiari II / ONTD calibration");
    expect(checklist).toContain("completion_audit.md");
  });

  it("keeps validation data-collection schemas linked from the handoff packet", () => {
    const dictionary = readFileSync(
      resolve(process.cwd(), "validation_data_dictionary.md"),
      "utf8"
    );
    const checklist = readFileSync(
      resolve(process.cwd(), "publication_handoff_checklist.md"),
      "utf8"
    );
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );
    const audit = readFileSync(
      resolve(process.cwd(), "completion_audit.md"),
      "utf8"
    );

    expect(dictionary).toContain("Validation Data Dictionary");
    expect(dictionary).toContain("No PHI");
    expect(dictionary).toContain("case_log.csv");
    expect(dictionary).toContain("measurement_rows.csv");
    expect(dictionary).toContain("diagnostic_labels.csv");
    expect(dictionary).toContain("reader_study_rows.csv");
    expect(dictionary).toContain("report_audit_rows.csv");
    expect(dictionary).toContain("study_id");
    expect(dictionary).toContain("ga_weeks");
    expect(dictionary).toContain("ga_days");
    expect(dictionary).toContain("field_strength_t");
    expect(dictionary).toContain("image_quality_tier");
    expect(dictionary).toContain("parameter_id");
    expect(dictionary).toContain("value_mm");
    expect(dictionary).toContain("value_deg");
    expect(dictionary).toContain("reader_id");
    expect(dictionary).toContain("without_tool");
    expect(dictionary).toContain("with_tool");
    expect(dictionary).toContain("NASA Task Load Index");
    expect(dictionary).toContain("System Usability Scale");
    expect(dictionary).toContain("summarizeValidationCohortFlow");
    expect(dictionary).toContain("computeAgreementMetrics");
    expect(dictionary).toContain("computeBinaryValidationMetrics");
    expect(dictionary).toContain("computeReaderStudyCrossoverSummary");
    expect(dictionary).toContain("computeQiAuditSummary");
    expect(dictionary).toContain("client/src/lib/validation-data-schema.ts");
    expect(dictionary).toContain("validateValidationDataRows");
    expect(dictionary).toContain("validateValidationDataExport");
    expect(dictionary).toContain("validation_export_templates");
    expect(checklist).toContain("validation_data_dictionary.md");
    expect(dossier).toContain("validation_data_dictionary.md");
    expect(audit).toContain("validation_data_dictionary.md");
  });
});

describe("reader-study protocol handoff", () => {
  it("captures the IRB, de-identification, timing, usability, and report-quality fields radiologists need", () => {
    const protocol = readFileSync(
      resolve(process.cwd(), "reader_study_protocol.md"),
      "utf8"
    );
    const checklist = readFileSync(
      resolve(process.cwd(), "publication_handoff_checklist.md"),
      "utf8"
    );
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );

    expect(protocol).toContain("IRB / QI determination");
    expect(protocol).toContain("waiver of consent");
    expect(protocol).toContain("de-identification workflow");
    expect(protocol).toContain("secure re-identification crosswalk");
    expect(protocol).toContain("two-week washout");
    expect(protocol).toContain("counter-balanced");
    expect(protocol).toContain("reader-study timing");
    expect(protocol).toContain("NASA Task Load Index");
    expect(protocol).toContain("System Usability Scale");
    expect(protocol).toContain("report-completeness endpoint");
    expect(checklist).toContain("reader_study_protocol.md");
    expect(dossier).toContain("reader_study_protocol.md");
    expect(dossier).toContain("Prepared");
  });
});

describe("source-data final-lock handoff", () => {
  it("gives clinician collaborators a signoff packet for source verification before clinical reliance", () => {
    const lock = readFileSync(
      resolve(process.cwd(), "source_data_final_lock.md"),
      "utf8"
    );
    const checklist = readFileSync(
      resolve(process.cwd(), "publication_handoff_checklist.md"),
      "utf8"
    );
    const dossier = readFileSync(
      resolve(process.cwd(), "source_verification_dossier.md"),
      "utf8"
    );

    expect(lock).toContain("Dovjak 2021 Table 1");
    expect(lock).toContain("Woitek 2014 Table 3");
    expect(lock).toContain("extra-axial CSF coefficient decision");
    expect(lock).toContain("third-ventricle raw-threshold policy");
    expect(lock).toContain("Chiari II / ONTD calibration");
    expect(lock).toContain("Mismatch Handling");
    expect(lock).toContain("Clinician Signoff");
    expect(checklist).toContain("source_data_final_lock.md");
    expect(dossier).toContain("source_data_final_lock.md");
  });
});

describe("SPEC §4.8 clinical integration workflow", () => {
  it("surfaces the Epic Radiant launch path, SMART deferral, and PowerScribe paste workflow", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Methodology.tsx"),
      "utf8"
    );

    expect(source).toContain("Epic Radiant");
    expect(source).toContain("Learning Home");
    expect(source).toContain("default system browser");
    expect(source).toContain("SMART-on-FHIR");
    expect(source).toContain("PowerScribe");
    expect(source).toContain("Ctrl+V");
    expect(source).toContain("plain text");
  });
});

describe("SPEC §4.11 GenAI/RAG methodology exposure", () => {
  it("surfaces the optional module guardrails, PubMed fallback, and backend recommendations", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Methodology.tsx"),
      "utf8"
    );

    expect(source).toContain("Optional GenAI / RAG report module");
    expect(source).toContain("Do not introduce external medical claims");
    expect(source).toContain("Bio.Entrez");
    expect(source).toContain("top 3 abstracts");
    expect(source).toContain("temporary abstracts only");
    expect(source).toContain("PMID hyperlink");
    expect(source).toContain("safe deterministic template");
    expect(source).toContain("llama.cpp");
    expect(source).toContain("Google AI Studio");
    expect(source).toContain("networkCallsEnabled");
  });
});
