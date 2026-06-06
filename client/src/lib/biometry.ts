/*
 * Fetal brain MRI biometry — normative models + ranked DDx engine.
 *
 * Two-layer design:
 *
 *   1. Each parameter records a discriminated `model`:
 *        - "luis-quadratic"       : μ(GA) = a·GA² + b·GA + c, σ(GA) = a5·GA + b5
 *        - "dovjak-percentile"    : 5th & 95th percentile linear equations,
 *                                   from which μ(GA) and σ(GA) are derived
 *                                   (μ = (p5+p95)/2, σ = (p95−p5)/(2·1.645)).
 *        - "linear-mean-sd"       : μ(GA) = mμ·GA + bμ, σ(GA) constant
 *                                   (available for future verified sources).
 *
 *      Each parameter owns a source registry. Rows with more than one
 *      applicable peer-reviewed source are evaluated under every source and
 *      reconciled by the SPEC §4.2.3 consensus rule.
 *
 *   2. Each differential-diagnosis card is a structured record with a
 *      `match(input) → {fired, score?, evidence?}` function. The engine
 *      runs every card, collects the firing ones, multiplies their `prior`
 *      by every applicable `boost` (rules of the form "if card X also
 *      fires, multiply Y's score by k"), and returns them sorted by score.
 */

export type GA = { weeks: number; days: number };

export const gaToDecimalWeeks = (ga: GA) => ga.weeks + ga.days / 7;

export function parseGestationalAge(input: string): GA | null {
  const normalized = input.trim().toLowerCase();
  if (normalized === "") return null;

  const weeksDaysMatch = normalized.match(
    /^(\d{1,2})\s*(?:w|weeks?)?\s*(?:\+|\s)\s*(\d)\s*(?:d|days?)?$/
  );
  if (weeksDaysMatch) {
    const weeks = Number(weeksDaysMatch[1]);
    const days = Number(weeksDaysMatch[2]);
    if (!Number.isInteger(weeks) || !Number.isInteger(days) || days > 6) {
      return null;
    }
    return { weeks, days };
  }

  const compactWeeksDaysMatch = normalized.match(/^(\d{1,2})w\s*(\d)d?$/);
  if (compactWeeksDaysMatch) {
    const weeks = Number(compactWeeksDaysMatch[1]);
    const days = Number(compactWeeksDaysMatch[2]);
    if (days > 6) return null;
    return { weeks, days };
  }

  const decimalMatch = normalized.match(/^(\d{1,2}(?:\.\d+)?)\s*w?$/);
  if (!decimalMatch) return null;

  const decimalWeeks = Number(decimalMatch[1]);
  if (!Number.isFinite(decimalWeeks)) return null;
  const weeks = Math.floor(decimalWeeks);
  const days = Math.round((decimalWeeks - weeks) * 7);
  if (days > 6) return { weeks: weeks + 1, days: 0 };
  return { weeks, days };
}

export type ParameterGroup =
  | "Global brain / skull"
  | "Ventricular system"
  | "Midline structures"
  | "Posterior fossa"
  | "Brainstem";

export type Source = {
  label: string;
  full: string;
  url: string;
};

/* ---------- Source records ---------- */

const S_LUIS: Source = {
  label: "Luis 2025",
  full: "Luis A, Uus A, Matthew J, et al. Towards automated fetal brain biometry reporting for 3-D T2-weighted 0.55–3T MRI at 20–40 weeks GA. Pediatr Radiol. 2025;55:366–383.",
  url: "https://link.springer.com/article/10.1007/s00247-025-06403-2",
};
const S_TILEA: Source = {
  label: "Tilea 2009",
  full: "Tilea B, Alberti C, Adamsbaum C, et al. Cerebral biometry in fetal magnetic resonance imaging: new reference data. Ultrasound Obstet Gynecol. 2009;33(2):173–181.",
  url: "https://obgyn.onlinelibrary.wiley.com/doi/10.1002/uog.6276",
};
const S_KYRIA: Source = {
  label: "Kyriakopoulou 2017",
  full: "Kyriakopoulou V, Vatansever D, Davidson A, et al. Normative biometry of the fetal brain using magnetic resonance imaging. Brain Struct Funct. 2017;222(5):2295–2307.",
  url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5504265/",
};
const S_VATANSEVER: Source = {
  label: "Vatansever 2013",
  full: "Vatansever D, Kyriakopoulou V, Allsop JM, Fox M, Chew A, Hajnal JV, Rutherford MA. Multidimensional Analysis of Fetal Posterior Fossa in Health and Disease. Cerebellum. 2013;12(5):632–644. doi:10.1007/s12311-013-0470-2. PMID 23553467.",
  url: "https://link.springer.com/article/10.1007/s12311-013-0470-2",
};
const S_DOVJAK: Source = {
  label: "Dovjak 2021",
  full: "Dovjak GO, Schmidbauer V, Brugger PC, et al. Normal human brainstem development in vivo: a quantitative fetal MRI study. Ultrasound Obstet Gynecol. 2021;58(2):254-263. doi:10.1002/uog.22162. PMID 32730667.",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8457244/",
};
const S_KERTES: Source = {
  label: "Kertes 2021",
  full: "Kertes I, Hoffman D, Yahal O, Berknstadt M, Bar-Yosef O, Ezra O, Katorza E. The normal fetal Cavum Septum Pellucidum in MR imaging - New biometric data. Eur J Radiol. 2021;135:109470. doi:10.1016/j.ejrad.2020.109470. PMID 33338761.",
  url: "https://doi.org/10.1016/j.ejrad.2020.109470",
};
const S_CONTE: Source = {
  label: "Conte 2018",
  full: "Conte G, Milani S, Palumbo G, et al. Prenatal brain MR imaging: reference linear biometric centiles between 20 and 24 gestational weeks. AJNR Am J Neuroradiol. 2018;39(5):963–967.",
  url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7410661/",
};
const S_BIRNBAUM: Source = {
  label: "Birnbaum 2018",
  full: "Birnbaum R, Parodi S, Donarini G, et al. The third ventricle of the human fetal brain: normative data and pathologic correlation. Prenat Diagn. 2018;38(9):664–672.",
  url: "https://doi.org/10.1002/pd.5292",
};
const S_WOITEK: Source = {
  label: "Woitek 2014",
  full: "Woitek R, Prayer D, Weber M, et al. MR-based morphometry of the posterior fossa in fetuses with neural tube defects of the spine. PLOS One. 2014;9(11):e112585.",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4231033/",
};
const S_AERTSEN: Source = {
  label: "Aertsen 2019",
  full: "Aertsen M, Verduyckt J, De Keyzer F, et al. Reliability of MR Imaging-Based Posterior Fossa and Brain Stem Measurements in Open Spinal Dysraphism in the Era of Fetal Surgery. AJNR Am J Neuroradiol. 2019;40(1):191-198.",
  url: "https://www.ajnr.org/content/40/1/191",
};
const S_DADDARIO: Source = {
  label: "D'Addario 2001",
  full: "D'Addario V, Pinto V, Di Cagno L, Pintucci A. The clivus-supraocciput angle: a useful measurement to evaluate the shape and size of the fetal posterior fossa and to diagnose Chiari II malformation. Ultrasound Obstet Gynecol. 2001;18(2):146-149.",
  url: "https://obgyn.onlinelibrary.wiley.com/doi/abs/10.1046/j.1469-0705.2001.00409.x",
};

/* ---------- Parameter models ---------- */

type LuisQuadratic = {
  kind: "luis-quadratic";
  a: number;
  b: number;
  c: number;
  a5: number;
  b5: number;
};

type DovjakPercentile = {
  kind: "dovjak-percentile";
  p5: { k: number; d: number };
  p95: { k: number; d: number };
};

type LinearMeanSd = {
  kind: "linear-mean-sd";
  mMu: number;
  bMu: number; // μ(GA) = mMu·GA + bMu
  sigma: number; // constant σ
};

export type Model = LuisQuadratic | DovjakPercentile | LinearMeanSd;

export type PerPercentileCentileRow = {
  gaWeeks: number;
  centile5: number;
  centile95: number;
};

export type PerPercentileLinearFit = {
  model: DovjakPercentile;
  residualRmse: {
    p5: number;
    p95: number;
  };
};

export type MeanSdTableRow = {
  gaWeeks: number;
  mean: number;
  sd: number;
};

export type LinearMeanSdFit = {
  model: LinearMeanSd;
  residualRmse: {
    mean: number;
    sd: number;
  };
};

const fitLinear = (
  points: { x: number; y: number }[]
): { k: number; d: number; rmse: number } => {
  const n = points.length;
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / n;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / n;
  const denominator = points.reduce(
    (sum, point) => sum + (point.x - meanX) ** 2,
    0
  );
  if (denominator === 0) {
    throw new Error("Centile rows must span at least two gestational ages");
  }
  const k =
    points.reduce(
      (sum, point) => sum + (point.x - meanX) * (point.y - meanY),
      0
    ) / denominator;
  const d = meanY - k * meanX;
  const rmse = Math.sqrt(
    points.reduce((sum, point) => sum + (point.y - (k * point.x + d)) ** 2, 0) /
      n
  );
  return { k, d, rmse };
};

export function fitPerPercentileLinearSource(
  rows: PerPercentileCentileRow[]
): PerPercentileLinearFit {
  if (rows.length < 2) {
    throw new Error("At least two centile rows are required");
  }
  for (const row of rows) {
    if (
      !Number.isFinite(row.gaWeeks) ||
      !Number.isFinite(row.centile5) ||
      !Number.isFinite(row.centile95)
    ) {
      throw new Error("Centile rows must contain finite numeric values");
    }
    if (row.centile95 <= row.centile5) {
      throw new Error("Centile 95 must exceed centile 5");
    }
  }

  const p5 = fitLinear(rows.map(row => ({ x: row.gaWeeks, y: row.centile5 })));
  const p95 = fitLinear(
    rows.map(row => ({ x: row.gaWeeks, y: row.centile95 }))
  );
  return {
    model: {
      kind: "dovjak-percentile",
      p5: { k: p5.k, d: p5.d },
      p95: { k: p95.k, d: p95.d },
    },
    residualRmse: {
      p5: p5.rmse,
      p95: p95.rmse,
    },
  };
}

export function fitLinearMeanSdSource(rows: MeanSdTableRow[]): LinearMeanSdFit {
  if (rows.length < 2) {
    throw new Error("At least two mean/SD rows are required");
  }
  for (const row of rows) {
    if (
      !Number.isFinite(row.gaWeeks) ||
      !Number.isFinite(row.mean) ||
      !Number.isFinite(row.sd)
    ) {
      throw new Error("Mean/SD rows must contain finite numeric values");
    }
    if (row.sd <= 0) {
      throw new Error("SD values must be positive");
    }
  }

  const meanFit = fitLinear(rows.map(row => ({ x: row.gaWeeks, y: row.mean })));
  const sigma = rows.reduce((sum, row) => sum + row.sd, 0) / rows.length;
  const sdRmse = Math.sqrt(
    rows.reduce((sum, row) => sum + (row.sd - sigma) ** 2, 0) / rows.length
  );

  return {
    model: {
      kind: "linear-mean-sd",
      mMu: meanFit.k,
      bMu: meanFit.d,
      sigma,
    },
    residualRmse: {
      mean: meanFit.rmse,
      sd: sdRmse,
    },
  };
}

export type SourceRegistryEntry = {
  source: Source;
  model: Model;
  /** Validated GA range (weeks) for this source and parameter. */
  gaRange: [number, number];
  verificationTier?:
    | "byte-identical"
    | "transcribed"
    | "derived"
    | "approximation";
  verificationDate?: string;
  /** Rendered when the normative source is not fetal MRI. */
  crossModality?: boolean;
  caveat?: string;
};

export type Parameter = {
  id: string;
  name: string;
  short: string;
  unit: "mm" | "degrees";
  group: ParameterGroup;
  definition: string;
  measurement: string;
  significance: string;
  /** Source paper that produced the encoded model. */
  primary: Source;
  /** Other parameter-specific reference for cross-validation in the UI. */
  secondary?: Source;
  model: Model;
  /** Validated GA range (weeks). */
  gaRange: [number, number];
};

export type AuxiliaryMeasurement = {
  id: string;
  name: string;
  short: string;
  unit: "mm" | "degrees";
  group: ParameterGroup;
  definition: string;
  measurement: string;
  significance: string;
};

export type QualitativeFinding = {
  id: string;
  name: string;
  short: string;
  group: ParameterGroup;
  finding: string;
  significance: string;
};

const EXTRA_AXIAL_CSF_MODEL: LuisQuadratic = {
  kind: "luis-quadratic",
  a: -0.0604400737108953,
  b: 3.650533392397,
  c: -44.5543682103265,
  a5: 0.0736569049728816,
  b5: -0.34287991257886,
};

/* ---------- Parameter table ----------
 *
 * Coefficients are taken verbatim from:
 *   - Luis 2025 (auto-proc-SVRTK, scripts/auto-reporting-brain-biometry.py).
 *   - Dovjak 2021 Table 1 (per-percentile linear equations, validated 14.0–39.3 w).
 *   - Kyriakopoulou 2017 supplementary workbook row 19 for the direct
 *     extra-cerebral CSF width curve.
 */

export const PARAMETERS: Parameter[] = [
  {
    id: "skull_bpd",
    name: "Skull biparietal diameter",
    short: "Skull BPD",
    unit: "mm",
    group: "Global brain / skull",
    definition:
      "Maximum transverse outer-to-outer skull diameter at the level of the thalami and cavum septi pellucidi.",
    measurement:
      "Axial plane through thalami and CSP; outer table of near parietal bone to outer table of far parietal bone, perpendicular to the falx.",
    significance:
      "Anchor measurement for gestational-age estimation and overall head growth; abnormal values flag micro- or macrocephaly.",
    primary: S_LUIS,
    secondary: S_TILEA,
    model: {
      kind: "luis-quadratic",
      a: -0.0527,
      b: 5.7605,
      c: -46.436,
      a5: 0.0895,
      b5: 0.1414,
    },
    gaRange: [20, 40],
  },
  {
    id: "skull_ofd",
    name: "Skull occipito-frontal diameter",
    short: "Skull OFD",
    unit: "mm",
    group: "Global brain / skull",
    definition:
      "Longest antero-posterior outer-to-outer skull diameter on the same axial plane used for skull BPD.",
    measurement:
      "Axial plane; outer table of frontal bone to outer table of occipital bone at the longest dimension.",
    significance:
      "Combined with skull BPD to derive head circumference and cephalic index; flags dolichocephaly / brachycephaly.",
    primary: S_LUIS,
    secondary: S_TILEA,
    model: {
      kind: "luis-quadratic",
      a: -0.0984,
      b: 8.8526,
      c: -81.605,
      a5: 0.1511,
      b5: -1.3192,
    },
    gaRange: [20, 40],
  },
  {
    id: "brain_bpd",
    name: "Brain biparietal diameter (maximal brain width)",
    short: "Brain BPD",
    unit: "mm",
    group: "Global brain / skull",
    definition:
      "Maximum transverse intra-cranial parenchymal width at the level of the thalami and CSP.",
    measurement:
      "Axial plane; inner edge of near calvaria to outer edge of far parenchyma at the widest brain dimension.",
    significance:
      "More direct index of brain growth than skull BPD; small in microcephaly, large in supratentorial hydrocephalus.",
    primary: S_LUIS,
    secondary: S_KYRIA,
    model: {
      kind: "luis-quadratic",
      a: 0.016,
      b: 1.763,
      c: -0.9597,
      a5: 0.1308,
      b5: -1.32,
    },
    gaRange: [20, 40],
  },
  {
    id: "brain_ofd_left",
    name: "Brain occipito-frontal diameter — left",
    short: "Brain OFD L",
    unit: "mm",
    group: "Global brain / skull",
    definition:
      "Antero-posterior length of the left cerebral hemisphere parenchyma in the axial plane used for biometry.",
    measurement:
      "Axial plane; from the most anterior point of the frontal cortex to the most posterior point of the occipital cortex on the left side.",
    significance:
      "Complements brain BPD for global brain growth; left/right discrepancy flags hemispheric asymmetry.",
    primary: S_LUIS,
    secondary: S_KYRIA,
    model: {
      kind: "luis-quadratic",
      a: -0.0781,
      b: 7.7234,
      c: -75.3,
      a5: 0.1277,
      b5: -0.9298,
    },
    gaRange: [20, 40],
  },
  {
    id: "brain_ofd_right",
    name: "Brain occipito-frontal diameter — right",
    short: "Brain OFD R",
    unit: "mm",
    group: "Global brain / skull",
    definition:
      "Antero-posterior length of the right cerebral hemisphere parenchyma in the axial plane used for biometry.",
    measurement:
      "Axial plane; from the most anterior point of the frontal cortex to the most posterior point of the occipital cortex on the right side.",
    significance:
      "Used jointly with brain OFD-left to flag hemispheric asymmetry and quantify global growth.",
    primary: S_LUIS,
    secondary: S_KYRIA,
    model: {
      kind: "luis-quadratic",
      a: -0.0781,
      b: 7.7234,
      c: -75.3,
      a5: 0.1277,
      b5: -0.9298,
    },
    gaRange: [20, 40],
  },
  {
    id: "extra_axial_csf",
    name: "Extra-axial CSF space",
    short: "Extra-axial CSF",
    unit: "mm",
    group: "Global brain / skull",
    definition:
      "Linear width of extra-cerebral CSF surrounding the supratentorial brain.",
    measurement:
      "Kyriakopoulou 2017 defines the 2D measurement as skull BPD minus brain BPD on the reconstructed axial biometry plane; enter a direct calculated or measured value in millimetres.",
    significance:
      "Widening above the 95th percentile suggests benign external hydrocephalus, cerebral volume loss, IUGR-associated prominence, or congenital infection.",
    primary: S_KYRIA,
    secondary: S_TILEA,
    model: EXTRA_AXIAL_CSF_MODEL,
    gaRange: [21, 38],
  },
  {
    id: "atrial_left",
    name: "Lateral-ventricle atrial diameter — left",
    short: "Atrial L",
    unit: "mm",
    group: "Ventricular system",
    definition:
      "Width of the atrium of the left lateral ventricle at the level of the glomus of the choroid plexus.",
    measurement:
      "Axial plane; inner-to-inner ependymal margins, perpendicular to the long axis of the ventricle.",
    significance:
      "≥10 mm defines ventriculomegaly: 10–12 mm mild, 12–15 mm moderate, ≥15 mm severe.",
    primary: S_LUIS,
    secondary: S_KYRIA,
    model: {
      kind: "luis-quadratic",
      a: 0.0078,
      b: -0.5216,
      c: 15.374,
      a5: 0.0264,
      b5: 0.5152,
    },
    gaRange: [20, 40],
  },
  {
    id: "atrial_right",
    name: "Lateral-ventricle atrial diameter — right",
    short: "Atrial R",
    unit: "mm",
    group: "Ventricular system",
    definition:
      "Width of the atrium of the right lateral ventricle at the level of the glomus of the choroid plexus.",
    measurement:
      "Axial plane; inner-to-inner ependymal margins, perpendicular to the long axis of the ventricle.",
    significance:
      "Asymmetry > 2 mm between sides, or either side ≥10 mm, warrants further evaluation.",
    primary: S_LUIS,
    secondary: S_KYRIA,
    model: {
      kind: "luis-quadratic",
      a: 0.0078,
      b: -0.5216,
      c: 15.374,
      a5: 0.0264,
      b5: 0.5152,
    },
    gaRange: [20, 40],
  },
  {
    id: "tcd",
    name: "Transcerebellar diameter",
    short: "TCD",
    unit: "mm",
    group: "Posterior fossa",
    definition: "Widest transverse diameter across the cerebellar hemispheres.",
    measurement:
      "Axial plane angled along the cerebellum; outermost edge of one hemisphere to outermost edge of the other.",
    significance:
      "Linear with GA; <5th percentile suggests cerebellar hypoplasia (genetic, infectious, or syndromic).",
    primary: S_DOVJAK,
    secondary: S_VATANSEVER,
    // Dovjak 2021 Table 1 — TCD: p5 = 1.52·GA − 12.48; p95 = 1.85·GA − 15.23.
    model: {
      kind: "dovjak-percentile",
      p5: { k: 1.52, d: -12.48 },
      p95: { k: 1.85, d: -15.23 },
    },
    gaRange: [14, 39.3],
  },
  {
    id: "vermis_cc",
    name: "Vermian height (cranio-caudal)",
    short: "Vermis CC",
    unit: "mm",
    group: "Posterior fossa",
    definition:
      "Cranio-caudal height of the cerebellar vermis from culmen to uvula in the mid-sagittal plane.",
    measurement:
      "Mid-sagittal T2 with brainstem, vermis, and cisterna magna in the same view; culmen apex to inferior tip of uvula.",
    significance:
      "Vermian hypoplasia raises concern for Dandy-Walker spectrum, Joubert syndrome, or Blake's pouch remnant.",
    primary: S_DOVJAK,
    secondary: S_VATANSEVER,
    // Dovjak 2021 Table 1 — Vermis RC: p5 = 0.72·GA − 6.83; p95 = 0.95·GA − 8.93.
    model: {
      kind: "dovjak-percentile",
      p5: { k: 0.72, d: -6.83 },
      p95: { k: 0.95, d: -8.93 },
    },
    gaRange: [14, 39.3],
  },
  {
    id: "vermis_ap",
    name: "Vermian antero-posterior diameter",
    short: "Vermis AP",
    unit: "mm",
    group: "Posterior fossa",
    definition:
      "Antero-posterior diameter of the vermis at its widest point in the mid-sagittal plane.",
    measurement:
      "Mid-sagittal T2; from the fastigium (peak of the 4th ventricle) to the most posterior vermian surface.",
    significance:
      "Used jointly with vermian CC; deviations suggest posterior-fossa malformations.",
    primary: S_DOVJAK,
    secondary: S_VATANSEVER,
    // Dovjak 2021 Table 1 — Vermis AP: p5 = 0.53·GA − 5.26; p95 = 0.70·GA − 6.99.
    model: {
      kind: "dovjak-percentile",
      p5: { k: 0.53, d: -5.26 },
      p95: { k: 0.7, d: -6.99 },
    },
    gaRange: [14, 39.3],
  },
  {
    id: "pons_ap",
    name: "Pons antero-posterior diameter",
    short: "Pons AP",
    unit: "mm",
    group: "Brainstem",
    definition:
      "Antero-posterior thickness of the pons at its mid-level on the mid-sagittal plane.",
    measurement:
      "Mid-sagittal T2; perpendicular to the long axis of the brainstem at the widest pontine bulge.",
    significance:
      "Below 5th percentile flags pontocerebellar hypoplasia, brainstem maldevelopment, soft marker for Trisomy 21.",
    primary: S_DOVJAK,
    secondary: S_LUIS,
    // Dovjak 2021 Table 1 — Total pons AP: p5 = 0.33·GA − 0.59; p95 = 0.44·GA − 0.78.
    model: {
      kind: "dovjak-percentile",
      p5: { k: 0.33, d: -0.59 },
      p95: { k: 0.44, d: -0.78 },
    },
    gaRange: [14, 39.3],
  },
  {
    id: "tdpf",
    name: "Maximum transverse diameter of the posterior fossa",
    short: "TDPF",
    unit: "mm",
    group: "Posterior fossa",
    definition:
      "Widest distance across the posterior cranial fossa between the inner tables of the occipital bones.",
    measurement:
      "Axial T2 slice containing the cerebellar hemispheres, brainstem, and occipital inner table; measure the maximum transverse posterior-fossa extent inner-table to inner-table.",
    significance:
      "Reduced TDPF is a high-yield cranial marker of Chiari II malformation and should prompt dedicated fetal-spine evaluation.",
    primary: S_WOITEK,
    secondary: S_AERTSEN,
    model: {
      kind: "luis-quadratic",
      a: -0.01307,
      b: 2.55571,
      c: -21.71,
      a5: 0.06716,
      b5: 0.547,
    },
    gaRange: [21, 37],
  },
  {
    id: "csa",
    name: "Clivus-supraocciput angle",
    short: "CSA",
    unit: "degrees",
    group: "Posterior fossa",
    definition:
      "Angle between the dorsal clivus and the inner table of the supraocciput on a strict mid-sagittal fetal brain image.",
    measurement:
      "Draw one line along the dorsal cortical surface of the clivus and a second along the inner table of the supraocciput; measure the cranial angle between them.",
    significance:
      "A reduced CSA is a shape-based marker that helps distinguish Chiari II / open neural tube defect from other small-posterior-fossa patterns.",
    primary: S_WOITEK,
    secondary: S_DADDARIO,
    model: {
      kind: "luis-quadratic",
      a: -0.04767,
      b: 4.20404,
      c: 1.73,
      a5: 0.01814,
      b5: 5.821,
    },
    gaRange: [21, 37],
  },
  {
    id: "cc_length",
    name: "Corpus callosum length",
    short: "CC length",
    unit: "mm",
    group: "Midline structures",
    definition:
      "Length of the main commissural pathway connecting the two cerebral hemispheres.",
    measurement:
      "Mid-sagittal T2; from the anterior tip of the genu to the posterior tip of the splenium along the curve of the callosum.",
    significance:
      "Short or non-visualised callosum suggests partial or complete agenesis of the corpus callosum.",
    primary: S_LUIS,
    secondary: S_CONTE,
    model: {
      kind: "luis-quadratic",
      a: -0.0687,
      b: 5.1529,
      c: -57.904,
      a5: 0.0274,
      b5: 0.4763,
    },
    gaRange: [20, 40],
  },
  {
    id: "csp_width",
    name: "Cavum septum pellucidum width",
    short: "CSP width",
    unit: "mm",
    group: "Midline structures",
    definition:
      "Width of the fluid-filled midline cavum between the leaflets of the septum pellucidum.",
    measurement:
      "Axial or coronal plane; inner border of one leaflet to the opposite leaflet at the widest point.",
    significance:
      "<1 mm or absent: holoprosencephaly, ACC, septo-optic dysplasia. >10 mm: enlarged / cystic CSP.",
    primary: S_LUIS,
    secondary: S_KERTES,
    model: {
      kind: "luis-quadratic",
      a: -0.0156,
      b: 0.9472,
      c: -6.6953,
      a5: 0.053,
      b5: -0.4388,
    },
    gaRange: [20, 40],
  },
];

export const PARAMETERS_ALL: Parameter[] = [...PARAMETERS];

export const AUXILIARY_MEASUREMENTS: AuxiliaryMeasurement[] = [
  {
    id: "third_ventricle",
    name: "Third ventricle width",
    short: "3rd V",
    unit: "mm",
    group: "Ventricular system",
    definition: "Width of the third ventricle, a midline CSF-filled space.",
    measurement:
      "Axial plane at the level of the thalami; inner-to-inner thalamic borders at the widest point.",
    significance:
      "Raw 3.5 mm threshold input; z-score reporting is disabled until a verified fetal-MRI or accepted cross-modality source is encoded.",
  },
  {
    id: "frontal_horn_left",
    name: "Frontal horn width — left",
    short: "Frontal horn L",
    unit: "mm",
    group: "Ventricular system",
    definition:
      "Anterior lateral-ventricle frontal horn width on the left side.",
    measurement:
      "Axial image through the frontal horns; measure the maximal inner-to-inner width of the left frontal horn.",
    significance:
      "Compared with the atrial diameter to detect disproportionate posterior ventricular enlargement consistent with colpocephaly.",
  },
  {
    id: "frontal_horn_right",
    name: "Frontal horn width — right",
    short: "Frontal horn R",
    unit: "mm",
    group: "Ventricular system",
    definition:
      "Anterior lateral-ventricle frontal horn width on the right side.",
    measurement:
      "Axial image through the frontal horns; measure the maximal inner-to-inner width of the right frontal horn.",
    significance:
      "Compared with the atrial diameter to detect disproportionate posterior ventricular enlargement consistent with colpocephaly.",
  },
  {
    id: "cisterna_magna_depth",
    name: "Cisterna magna depth",
    short: "CM depth",
    unit: "mm",
    group: "Posterior fossa",
    definition:
      "Antero-posterior depth of the cisterna magna in the posterior fossa.",
    measurement:
      "Mid-sagittal or axial posterior-fossa image; measure the fluid space posterior to the vermis at its maximal depth.",
    significance:
      ">10 mm raises the differential of mega cisterna magna, persistent Blake's pouch cyst, and posterior-fossa arachnoid cyst.",
  },
  {
    id: "tva",
    name: "Tegmento-vermian angle",
    short: "TVA",
    unit: "degrees",
    group: "Posterior fossa",
    definition:
      "Angle between the dorsal brainstem tegmentum and the ventral vermian surface on a mid-sagittal image.",
    measurement:
      "Mid-sagittal T2 image; measure the angle formed by the dorsal brainstem line and the ventral surface of the vermis.",
    significance:
      "Elevation supports persistent vermian rotation and Dandy-Walker spectrum interpretation when combined with vermian and posterior-fossa findings.",
  },
];

export const QUALITATIVE_FINDINGS: QualitativeFinding[] = [
  {
    id: "growth_restriction_context",
    name: "Growth-restriction context",
    short: "IUGR context",
    group: "Global brain / skull",
    finding:
      "Known fetal growth restriction or placental-insufficiency context entered by the radiologist.",
    significance:
      "Used in report wording to distinguish symmetric IUGR-associated microcephaly from primary microcephaly.",
  },
  {
    id: "qualitative_cmv_panel",
    name: "CMV infection findings",
    short: "CMV findings",
    group: "Global brain / skull",
    finding:
      "Periventricular cysts, calcifications, germinolytic cysts, or other qualitative CMV-supporting findings.",
    significance:
      "Adds the congenital CMV advisory and supports the CMV-specific microcephaly/ventriculomegaly impression.",
  },
  {
    id: "qualitative_heterotopia_panel",
    name: "Heterotopia / cortical malformation",
    short: "Heterotopia",
    group: "Midline structures",
    finding:
      "Entered gray matter heterotopia or broader malformation of cortical development.",
    significance:
      "Adds associated-anomaly context for ACC, ventriculomegaly, and genetic counselling.",
  },
  {
    id: "qualitative_interhemispheric_cyst_panel",
    name: "Interhemispheric cyst",
    short: "IHC",
    group: "Midline structures",
    finding: "Entered interhemispheric cyst or related midline cystic lesion.",
    significance:
      "Adds an ACC-associated interhemispheric-cyst advisory without changing corpus-callosum thresholds.",
  },
  {
    id: "qualitative_sod_panel",
    name: "Small optic apparatus / SOD",
    short: "SOD",
    group: "Midline structures",
    finding: "Entered small optic nerves or optic chiasm.",
    significance:
      "Adds septo-optic dysplasia context while preserving the primary absent-CSP impression.",
  },
  {
    id: "qualitative_cavum_vergae_panel",
    name: "Cavum vergae",
    short: "Cavum vergae",
    group: "Midline structures",
    finding: "Entered posterior extension of the cavum septum pellucidum.",
    significance:
      "Labels cavum vergae as a qualitative add-on in the enlarged-CSP context.",
  },
  {
    id: "qualitative_hpe_panel",
    name: "Monoventricle / fused thalami",
    short: "HPE features",
    group: "Midline structures",
    finding:
      "Entered monoventricle, fused thalami, or equivalent qualitative HPE-spectrum finding.",
    significance:
      "Allows mild-range ventriculomegaly with absent CSP and microcephaly to fire the HPE pattern.",
  },
  {
    id: "qualitative_absent_primary_fissure",
    name: "Absent primary fissure",
    short: "Primary fissure",
    group: "Posterior fossa",
    finding: "Entered absent cerebellar primary fissure.",
    significance:
      "Combines with small TCD to support the rhombencephalosynapsis pattern.",
  },
  {
    id: "qualitative_mcm_panel",
    name: "Mega cisterna magna / persistent Blake's pouch context",
    short: "MCM context",
    group: "Posterior fossa",
    finding:
      "Entered qualitative isolated mega cisterna magna or persistent Blake's pouch context.",
    significance:
      "Adds benign-variant report wording when the radiologist enters this qualitative posterior-fossa context.",
  },
  {
    id: "qualitative_blakes_pouch_panel",
    name: "Blake's pouch advisory",
    short: "Blake's pouch",
    group: "Posterior fossa",
    finding: "Entered elevated TVA with normal vermian size/morphology.",
    significance:
      "Adds a Blake pouch advisory while guarding against Dandy-Walker calls when the vermis is normal.",
  },
];

/**
 * Luis 2025 quadratic-mean / linear-SD coefficients for the four
 * posterior-fossa / brainstem registry entries that reconcile against Dovjak
 * 2021. Verbatim from the SVRTK auto-reporting pipeline.
 */
const LUIS_OVERRIDES: Record<string, LuisQuadratic> = {
  tcd: {
    kind: "luis-quadratic",
    a: 0.0051,
    b: 1.5165,
    c: -14.584,
    a5: 0.0343,
    b5: 0.415,
  },
  vermis_cc: {
    kind: "luis-quadratic",
    a: -0.0138,
    b: 1.6136,
    c: -20.065,
    a5: 0.0354,
    b5: -0.1869,
  },
  vermis_ap: {
    kind: "luis-quadratic",
    a: -0.0089,
    b: 1.1119,
    c: -14.637,
    a5: 0.0447,
    b5: -0.5126,
  },
  pons_ap: {
    kind: "luis-quadratic",
    a: 0.002,
    b: 0.3144,
    c: -1.2147,
    a5: 0.0124,
    b5: 0.261,
  },
};

const VERIFICATION_DATE = "2026-05-23";

const defaultVerificationTier = (
  param: Parameter
): Pick<SourceRegistryEntry, "verificationTier" | "verificationDate"> => {
  if (param.primary.label === "Luis 2025") {
    return {
      verificationTier: "byte-identical",
      verificationDate: VERIFICATION_DATE,
    };
  }
  if (param.primary.label === "Woitek 2014") {
    return { verificationTier: "derived", verificationDate: VERIFICATION_DATE };
  }
  return {
    verificationTier: "transcribed",
    verificationDate: VERIFICATION_DATE,
  };
};

const singleRegistryEntry = (param: Parameter): SourceRegistryEntry => ({
  source: param.primary,
  model: param.model,
  gaRange: param.gaRange,
  ...defaultVerificationTier(param),
});

const registryOverrides: Record<string, SourceRegistryEntry[]> = {
  extra_axial_csf: [
    {
      source: S_KYRIA,
      model: EXTRA_AXIAL_CSF_MODEL,
      gaRange: [21, 38],
      verificationTier: "transcribed",
      verificationDate: VERIFICATION_DATE,
    },
  ],
  tcd: [
    {
      source: S_LUIS,
      model: LUIS_OVERRIDES.tcd,
      gaRange: [20, 40],
      verificationTier: "byte-identical",
      verificationDate: VERIFICATION_DATE,
    },
    {
      source: S_DOVJAK,
      model: {
        kind: "dovjak-percentile",
        p5: { k: 1.52, d: -12.48 },
        p95: { k: 1.85, d: -15.23 },
      },
      gaRange: [14, 39.3],
      verificationTier: "transcribed",
      verificationDate: VERIFICATION_DATE,
    },
  ],
  vermis_cc: [
    {
      source: S_LUIS,
      model: LUIS_OVERRIDES.vermis_cc,
      gaRange: [20, 40],
      verificationTier: "byte-identical",
      verificationDate: VERIFICATION_DATE,
    },
    {
      source: S_DOVJAK,
      model: {
        kind: "dovjak-percentile",
        p5: { k: 0.72, d: -6.83 },
        p95: { k: 0.95, d: -8.93 },
      },
      gaRange: [14, 39.3],
      verificationTier: "transcribed",
      verificationDate: VERIFICATION_DATE,
    },
  ],
  vermis_ap: [
    {
      source: S_LUIS,
      model: LUIS_OVERRIDES.vermis_ap,
      gaRange: [20, 40],
      verificationTier: "byte-identical",
      verificationDate: VERIFICATION_DATE,
    },
    {
      source: S_DOVJAK,
      model: {
        kind: "dovjak-percentile",
        p5: { k: 0.53, d: -5.26 },
        p95: { k: 0.7, d: -6.99 },
      },
      gaRange: [14, 39.3],
      verificationTier: "transcribed",
      verificationDate: VERIFICATION_DATE,
    },
  ],
  pons_ap: [
    {
      source: S_LUIS,
      model: LUIS_OVERRIDES.pons_ap,
      gaRange: [20, 40],
      verificationTier: "byte-identical",
      verificationDate: VERIFICATION_DATE,
    },
    {
      source: S_DOVJAK,
      model: {
        kind: "dovjak-percentile",
        p5: { k: 0.33, d: -0.59 },
        p95: { k: 0.44, d: -0.78 },
      },
      gaRange: [14, 39.3],
      verificationTier: "transcribed",
      verificationDate: VERIFICATION_DATE,
    },
  ],
};

export function sourceRegistryFor(param: Parameter): SourceRegistryEntry[] {
  return registryOverrides[param.id] ?? [singleRegistryEntry(param)];
}

export type SourceRegistryValidationFailure = {
  parameterId: string;
  parameterName: string;
  candidateSource: string;
  existingSource: string;
  gaWeeks: number;
  delta: number;
};

export type SourceRegistryValidationResult = {
  accepted: boolean;
  maxDelta: number;
  failures: SourceRegistryValidationFailure[];
};

export function validateSourceRegistryExtension(
  param: Parameter,
  candidate: SourceRegistryEntry,
  maxAllowedDelta = 0.5
): SourceRegistryValidationResult {
  let maxDelta = 0;
  const failures: SourceRegistryValidationFailure[] = [];

  for (const existing of sourceRegistryFor(param)) {
    const overlapStart = Math.max(candidate.gaRange[0], existing.gaRange[0]);
    const overlapEnd = Math.min(candidate.gaRange[1], existing.gaRange[1]);
    if (overlapStart > overlapEnd) continue;

    const firstSample = Math.ceil(overlapStart * 2) / 2;
    const lastSample = Math.floor(overlapEnd * 2) / 2;
    let worst: SourceRegistryValidationFailure | null = null;

    for (
      let gaWeeks = firstSample;
      gaWeeks <= lastSample + Number.EPSILON;
      gaWeeks += 0.5
    ) {
      const newSigma = sigmaOfModel(candidate.model, gaWeeks);
      const existingSigma = sigmaOfModel(existing.model, gaWeeks);
      const denominator = Math.max(newSigma, existingSigma);
      const delta =
        denominator > 0
          ? Math.abs(
              muOfModel(candidate.model, gaWeeks) -
                muOfModel(existing.model, gaWeeks)
            ) / denominator
          : Number.POSITIVE_INFINITY;

      if (delta > maxDelta) maxDelta = delta;
      if (!worst || delta > worst.delta) {
        worst = {
          parameterId: param.id,
          parameterName: param.name,
          candidateSource: candidate.source.label,
          existingSource: existing.source.label,
          gaWeeks,
          delta,
        };
      }
    }

    if (worst && worst.delta > maxAllowedDelta) {
      failures.push(worst);
    }
  }

  return {
    accepted: failures.length === 0,
    maxDelta,
    failures,
  };
}

/* ---------- Math: normal CDF and z-score ---------- */

// Abramowitz & Stegun 7.1.26 approximation of erf
function erf(x: number): number {
  const sign = Math.sign(x);
  x = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export const normalCdf = (z: number): number =>
  0.5 * (1 + erf(z / Math.sqrt(2)));

export type SourceEvaluation = {
  sourceLabel: string;
  sourceFull: string;
  sourceUrl: string;
  modelKind: Model["kind"];
  gaRange: [number, number];
  inRange: boolean;
  extrapolated: boolean;
  crossModality: boolean;
  caveat?: string;
  verificationTier?: SourceRegistryEntry["verificationTier"];
  verificationDate?: string;
  z: number;
  percentile: number;
  mu: number;
  sigma: number;
};

export type AgreementState = "single" | "agree" | "disagree";

export type ZResult = {
  z: number;
  percentile: number; // 0–100
  mu: number;
  sigma: number;
  band: "normal" | "note" | "watch" | "rare";
  /** True when no source is in range and consensus falls back to extrapolated sources. */
  extrapolated: boolean;
  /** Legacy display label; sourceDetails is the source of truth. */
  sourceLabel: string;
  sourceDetails: SourceEvaluation[];
  agreementState: AgreementState;
  disagreementWidth: number | null;
};

export const interpretBand = (z: number): ZResult["band"] => {
  const a = Math.abs(z);
  if (a <= 1) return "normal";
  if (a <= 2) return "note";
  if (a <= 3) return "watch";
  return "rare";
};

/** Mean curve μ(GA) for an explicit model. */
export const muOfModel = (m: Model, gaWeeks: number): number => {
  if (m.kind === "luis-quadratic")
    return m.a * gaWeeks * gaWeeks + m.b * gaWeeks + m.c;
  if (m.kind === "linear-mean-sd") return m.mMu * gaWeeks + m.bMu;
  // dovjak-percentile: derive μ from p5 and p95 (symmetric normal assumption)
  const lo = m.p5.k * gaWeeks + m.p5.d;
  const hi = m.p95.k * gaWeeks + m.p95.d;
  return (lo + hi) / 2;
};

/** Standard-deviation curve σ(GA) for an explicit model. */
export const sigmaOfModel = (m: Model, gaWeeks: number): number => {
  if (m.kind === "luis-quadratic") return m.a5 * gaWeeks + m.b5;
  if (m.kind === "linear-mean-sd") return m.sigma;
  // dovjak-percentile: σ = (p95 − p5) / (2·1.645)
  const lo = m.p5.k * gaWeeks + m.p5.d;
  const hi = m.p95.k * gaWeeks + m.p95.d;
  return (hi - lo) / (2 * 1.6448536269514722);
};

export type CrossValidationAuditStatus = "pass" | "partial-fail" | "fail";

export type CrossValidationAuditSample = {
  gaWeeks: number;
  maxDelta: number;
  means: Record<string, number>;
  sigmas: Record<string, number>;
};

export type CrossValidationAudit = {
  parameterId: string;
  parameterName: string;
  sources: {
    label: string;
    verificationTier?: SourceRegistryEntry["verificationTier"];
    verificationDate?: string;
  }[];
  overlap: [number, number];
  samples: CrossValidationAuditSample[];
  maxDelta: number;
  maxContiguousExcursions: number;
  status: CrossValidationAuditStatus;
};

export function computeCrossValidationAudits(
  params: Parameter[] = PARAMETERS_ALL
): CrossValidationAudit[] {
  return params.flatMap(param => {
    const entries = sourceRegistryFor(param);
    if (entries.length < 2) return [];

    const overlapStart = Math.max(...entries.map(entry => entry.gaRange[0]));
    const overlapEnd = Math.min(...entries.map(entry => entry.gaRange[1]));
    if (overlapStart > overlapEnd) return [];

    const firstSample = Math.ceil(overlapStart * 2) / 2;
    const lastSample = Math.floor(overlapEnd * 2) / 2;
    const samples: CrossValidationAuditSample[] = [];

    for (
      let gaWeeks = firstSample;
      gaWeeks <= lastSample + Number.EPSILON;
      gaWeeks += 0.5
    ) {
      const means: Record<string, number> = {};
      const sigmas: Record<string, number> = {};
      for (const entry of entries) {
        means[entry.source.label] = muOfModel(entry.model, gaWeeks);
        sigmas[entry.source.label] = sigmaOfModel(entry.model, gaWeeks);
      }

      let maxDelta = 0;
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const left = entries[i];
          const right = entries[j];
          const denominator = Math.max(
            sigmas[left.source.label],
            sigmas[right.source.label]
          );
          const delta =
            denominator > 0
              ? Math.abs(means[left.source.label] - means[right.source.label]) /
                denominator
              : Number.POSITIVE_INFINITY;
          if (delta > maxDelta) maxDelta = delta;
        }
      }

      samples.push({
        gaWeeks,
        maxDelta,
        means,
        sigmas,
      });
    }

    let currentRun = 0;
    let maxContiguousExcursions = 0;
    for (const sample of samples) {
      if (sample.maxDelta > 0.5) {
        currentRun += 1;
        maxContiguousExcursions = Math.max(maxContiguousExcursions, currentRun);
      } else {
        currentRun = 0;
      }
    }

    const maxDelta = samples.reduce(
      (max, sample) => Math.max(max, sample.maxDelta),
      0
    );
    const status: CrossValidationAuditStatus =
      maxDelta <= 0.5
        ? "pass"
        : maxContiguousExcursions > 3
          ? "fail"
          : "partial-fail";

    return [
      {
        parameterId: param.id,
        parameterName: param.name,
        sources: entries.map(entry => ({
          label: entry.source.label,
          verificationTier: entry.verificationTier,
          verificationDate: entry.verificationDate,
        })),
        overlap: [firstSample, lastSample] as [number, number],
        samples,
        maxDelta,
        maxContiguousExcursions,
        status,
      },
    ];
  });
}

/** Consensus mean curve μ(GA) for a parameter under its source registry. */
export const mu = (p: Parameter, gaWeeks: number): number => {
  const entries = sourceRegistryFor(p);
  const inRange = entries.filter(
    entry => gaWeeks >= entry.gaRange[0] && gaWeeks <= entry.gaRange[1]
  );
  const contributing = inRange.length > 0 ? inRange : entries;
  const weighted = contributing
    .map(entry => {
      const s = sigmaOfModel(entry.model, gaWeeks);
      return { mean: muOfModel(entry.model, gaWeeks), invSigma: 1 / s };
    })
    .filter(row => Number.isFinite(row.invSigma) && row.invSigma > 0);
  if (weighted.length === 0) return NaN;
  return (
    weighted.reduce((sum, row) => sum + row.mean * row.invSigma, 0) /
    weighted.reduce((sum, row) => sum + row.invSigma, 0)
  );
};

/** Consensus standard-deviation curve σ(GA) for a parameter source registry. */
export const sigma = (p: Parameter, gaWeeks: number): number => {
  const entries = sourceRegistryFor(p);
  const inRange = entries.filter(
    entry => gaWeeks >= entry.gaRange[0] && gaWeeks <= entry.gaRange[1]
  );
  const contributing = inRange.length > 0 ? inRange : entries;
  const invSigmas = contributing
    .map(entry => 1 / sigmaOfModel(entry.model, gaWeeks))
    .filter(invSigma => Number.isFinite(invSigma) && invSigma > 0);
  if (invSigmas.length === 0) return NaN;
  return (
    invSigmas.length / invSigmas.reduce((sum, invSigma) => sum + invSigma, 0)
  );
};

export function zscore(param: Parameter, ga: GA, x: number): ZResult | null {
  if (!Number.isFinite(x)) return null;
  const w = gaToDecimalWeeks(ga);
  const registry = sourceRegistryFor(param);
  const sourceDetails = registry
    .map((entry): SourceEvaluation | null => {
      const m = muOfModel(entry.model, w);
      const s = sigmaOfModel(entry.model, w);
      if (!Number.isFinite(s) || s <= 0) return null;
      const z = (x - m) / s;
      const inRange = w >= entry.gaRange[0] && w <= entry.gaRange[1];
      return {
        sourceLabel: entry.source.label,
        sourceFull: entry.source.full,
        sourceUrl: entry.source.url,
        modelKind: entry.model.kind,
        gaRange: entry.gaRange,
        inRange,
        extrapolated: !inRange,
        crossModality: Boolean(entry.crossModality),
        caveat: entry.caveat,
        verificationTier: entry.verificationTier,
        verificationDate: entry.verificationDate,
        z,
        mu: m,
        sigma: s,
        percentile: normalCdf(z) * 100,
      };
    })
    .filter((detail): detail is SourceEvaluation => detail != null);

  if (sourceDetails.length === 0) return null;

  const inRangeDetails = sourceDetails.filter(detail => detail.inRange);
  const contributing =
    inRangeDetails.length > 0 ? inRangeDetails : sourceDetails;
  const z =
    contributing.reduce((sum, detail) => sum + detail.z, 0) /
    contributing.length;
  const p = normalCdf(z) * 100;
  const m =
    contributing.reduce((sum, detail) => sum + detail.mu, 0) /
    contributing.length;
  const s =
    contributing.reduce((sum, detail) => sum + detail.sigma, 0) /
    contributing.length;
  const disagreementWidth =
    inRangeDetails.length >= 2
      ? Math.max(...inRangeDetails.map(detail => detail.z)) -
        Math.min(...inRangeDetails.map(detail => detail.z))
      : null;
  const agreementState: AgreementState =
    registry.length === 1 || inRangeDetails.length < 2
      ? "single"
      : disagreementWidth != null && disagreementWidth >= 1
        ? "disagree"
        : "agree";
  return {
    z,
    mu: m,
    sigma: s,
    percentile: p,
    band: interpretBand(z),
    extrapolated: inRangeDetails.length === 0,
    sourceLabel:
      sourceDetails.length === 1
        ? sourceDetails[0].sourceLabel
        : `Consensus (${sourceDetails.length} sources)`,
    sourceDetails,
    agreementState,
    disagreementWidth,
  };
}

export const formatZ = (z: number) =>
  `${z >= 0 ? "+" : "-"}${Math.abs(z).toFixed(2)}`;

export const formatPct = (p: number) => {
  if (p < 0.1) return "<0.1st";
  if (p < 1) return "<1st";
  if (p > 99.9) return ">99.9th";
  if (p > 99) return ">99th";
  const r = Math.round(p);
  const suffix =
    r % 100 >= 11 && r % 100 <= 13
      ? "th"
      : r % 10 === 1
        ? "st"
        : r % 10 === 2
          ? "nd"
          : r % 10 === 3
            ? "rd"
            : "th";
  return `${r}${suffix}`;
};

export type ChiariPosterior = {
  controls: number;
  ontd: number;
  cntd: number;
};

const mahalanobis2 = (
  point: [number, number],
  mean: [number, number],
  covariance: [[number, number], [number, number]]
): number => {
  const dx = point[0] - mean[0];
  const dy = point[1] - mean[1];
  const [[a, b], [c, d]] = covariance;
  const det = a * d - b * c;
  if (det <= 0) return Number.POSITIVE_INFINITY;
  const inv00 = d / det;
  const inv01 = -b / det;
  const inv10 = -c / det;
  const inv11 = a / det;
  return dx * (inv00 * dx + inv01 * dy) + dy * (inv10 * dx + inv11 * dy);
};

export const chiariOntdPosterior = (
  zTdpf: number,
  zCsa: number
): ChiariPosterior => {
  const point: [number, number] = [zTdpf, zCsa];
  const distances = {
    controls: mahalanobis2(
      point,
      [0, 0],
      [
        [1, 0],
        [0, 1],
      ]
    ),
    ontd: mahalanobis2(
      point,
      [-3.6, -2.6],
      [
        [0.9 * 0.9, 0.54],
        [0.54, 1.1 * 1.1],
      ]
    ),
    cntd: mahalanobis2(
      point,
      [-1.4, -0.6],
      [
        [1, 0],
        [0, 1],
      ]
    ),
  };
  const controls = Math.exp(-distances.controls / 2);
  const ontd = Math.exp(-distances.ontd / 2);
  const cntd = Math.exp(-distances.cntd / 2);
  const total = controls + ontd + cntd;
  return {
    controls: controls / total,
    ontd: ontd / total,
    cntd: cntd / total,
  };
};

/* ---------- Differential-diagnosis catalogue & engine ---------- */

export type DxRow = { dx: string; likelihood: string; rationale: string };

export type Differential = {
  id: string;
  title: string;
  oneLine: string; // one-sentence summary used in the rail
  severity: "info" | "watch" | "concern" | "urgent";
  triggerLabel: string; // human-readable trigger description, e.g. "Atrial L 16 mm"
  impressionLine?: string;
  impressionPriority?: number;
  summary: string;
  rows: DxRow[];
  nextSteps: string;
  limitations: string;
  primary: Source;
  secondary?: Source;
  sourceDisagreements?: {
    parameterId: string;
    parameterName: string;
    disagreementWidth: number;
  }[];
  /** Engine-managed at runtime: */
  rank: number;
};

type EngineInput = {
  values: Record<string, number | null>;
  zs: Record<string, ZResult | null>;
};

type CardSpec = Omit<Differential, "rank" | "triggerLabel"> & {
  relatedParamIds?: string[];
  /** Returns null if not fired, otherwise {prior, triggerLabel}. */
  match: (
    input: EngineInput
  ) => { prior: number; triggerLabel: string; impressionLine?: string } | null;
};

/* ---------- Helper lookups ---------- */

const fmt1 = (x: number | null | undefined) =>
  x == null ? "—" : Number(x).toFixed(1);

const z = (zs: Record<string, ZResult | null>, id: string) => zs[id]?.z ?? null;

type VermisAxisCandidate = { label: string; value: number; zr: ZResult };

const lowestEnteredVermisAxis = (
  values: EngineInput["values"],
  zs: EngineInput["zs"]
): VermisAxisCandidate | undefined => {
  const candidates = [
    {
      label: "Vermis CC",
      value: values.vermis_cc,
      zr: zs.vermis_cc,
    },
    {
      label: "Vermis AP",
      value: values.vermis_ap,
      zr: zs.vermis_ap,
    },
  ].filter(
    (candidate): candidate is VermisAxisCandidate =>
      candidate.zr != null && candidate.value != null
  );
  return candidates.reduce<VermisAxisCandidate | undefined>(
    (currentSmallest, candidate) =>
      currentSmallest == null || candidate.zr.z < currentSmallest.zr.z
        ? candidate
        : currentSmallest,
    undefined
  );
};

const lowestTcdZ = (zs: EngineInput["zs"]): number => {
  const tcd = zs.tcd;
  return tcd == null
    ? Infinity
    : Math.min(tcd.z, ...tcd.sourceDetails.map(detail => detail.z));
};

type ColpocephalyCandidate = {
  side: "L" | "R";
  atrium: number;
  frontalHorn: number;
};

const colpocephalyCandidate = (
  values: EngineInput["values"]
): ColpocephalyCandidate | undefined => {
  const pairs: ColpocephalyCandidate[] = [
    {
      side: "L",
      atrium: values.atrial_left ?? NaN,
      frontalHorn: values.frontal_horn_left ?? NaN,
    },
    {
      side: "R",
      atrium: values.atrial_right ?? NaN,
      frontalHorn: values.frontal_horn_right ?? NaN,
    },
  ];
  const candidates = pairs.filter(
    candidate =>
      Number.isFinite(candidate.atrium) &&
      candidate.atrium > 10 &&
      Number.isFinite(candidate.frontalHorn) &&
      candidate.frontalHorn < 10
  );
  return candidates.sort(
    (a, b) => b.atrium - b.frontalHorn - (a.atrium - a.frontalHorn)
  )[0];
};

/* ---------- Card specs ---------- */

const CARDS: CardSpec[] = [
  /* ===== Ventriculomegaly tiers ===== */
  {
    id: "severe-vm",
    title: "Severe ventriculomegaly (atrial ≥ 15 mm)",
    oneLine: "Atrial diameter ≥ 15 mm — significant brain pathology likely.",
    severity: "urgent",
    impressionLine:
      "Apparently isolated severe ventriculomegaly. Postnatal MRI is recommended to confirm the absence of associated anomalies. Per Carta 2018: ~80% survival, ~40% normal neurodevelopment among survivors.",
    impressionPriority: 20,
    summary:
      "Severe VM is a marker of significant underlying brain pathology with a high risk of neurodevelopmental impairment, though survival is relatively high in isolated cases.",
    rows: [
      {
        dx: "Aqueductal stenosis",
        likelihood: "Common",
        rationale:
          "Canonical fetal-MRI obstructive hydrocephalus source (Heaphy-Henault 2018).",
      },
      {
        dx: "Associated CNS / non-CNS anomaly",
        likelihood: "High",
        rationale:
          "Severe VM frequently coexists with other anomalies that worsen prognosis.",
      },
      {
        dx: "Chromosomal abnormality (T21, T18, T13)",
        likelihood: "Significant",
        rationale: "Risk increases with severity.",
      },
      {
        dx: "Congenital infection (CMV, toxoplasmosis)",
        likelihood: "Rare",
        rationale: "Recognised less common causes.",
      },
      {
        dx: "Isolated / idiopathic",
        likelihood: "Minority",
        rationale: "Diagnosis of exclusion after extensive workup.",
      },
    ],
    nextSteps:
      "Detailed neurosonography and fetal MRI; invasive genetic testing with chromosomal microarray; CMV / toxoplasmosis screening; multidisciplinary fetal-neurology consultation.",
    limitations:
      "Estimates from cohort studies; actual risk depends on associated anomalies, karyotype, and infection status.",
    primary: {
      label: "Giorgione 2022",
      full: "Giorgione V, et al. Fetal cerebral ventriculomegaly. Prenat Diagn. 2022;42(13):1674–1681.",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10099769/",
    },
    match: ({ values }) => {
      const L = values.atrial_left,
        R = values.atrial_right;
      const max = Math.max(L ?? -Infinity, R ?? -Infinity);
      if (!Number.isFinite(max) || max < 15) return null;
      const which = (L ?? -Infinity) >= (R ?? -Infinity) ? "L" : "R";
      return { prior: 0.95, triggerLabel: `Atrial ${which} = ${fmt1(max)} mm` };
    },
  },
  {
    id: "mod-vm",
    title: "Moderate ventriculomegaly (atrial >12 to <15 mm)",
    oneLine: "Atrial diameter >12 and <15 mm — intermediate VM.",
    severity: "concern",
    impressionLine:
      "Moderate ventriculomegaly (12–14.9 mm); recommend follow-up imaging to detect progression toward severe ventriculomegaly and evaluate associated anomalies.",
    impressionPriority: 12,
    summary:
      "Moderate VM carries an intermediate risk of associated anomalies and adverse neurodevelopment.",
    rows: [
      {
        dx: "Associated CNS anomalies",
        likelihood: "Common",
        rationale: "Frequent ACC, aqueductal stenosis, cortical malformations.",
      },
      {
        dx: "Chromosomal abnormality",
        likelihood: "Minority",
        rationale: "Risk intermediate between mild and severe.",
      },
      {
        dx: "Isolated / idiopathic",
        likelihood: "Common",
        rationale: "Better prognosis when isolated and stable.",
      },
      {
        dx: "Congenital infection (CMV)",
        likelihood: "Rare",
        rationale: "Always exclude.",
      },
    ],
    nextSteps:
      "Detailed neurosonography, fetal MRI, karyotype with microarray, TORCH/CMV screening.",
    limitations: "Cohort estimates; outcome depends on associated findings.",
    primary: {
      label: "SMFM 2018",
      full: "SMFM. Mild fetal ventriculomegaly. Am J Obstet Gynecol. 2018;219(1):B2–B9.",
      url: "https://www.ajog.org/article/S0002-9378(18)30336-3/fulltext",
    },
    match: ({ values }) => {
      const L = values.atrial_left,
        R = values.atrial_right;
      const candidates = [
        { side: "L", value: L },
        { side: "R", value: R },
      ].filter(
        (candidate): candidate is { side: string; value: number } =>
          candidate.value != null &&
          candidate.value > 12 &&
          candidate.value < 15
      );
      const highest = candidates.sort((a, b) => b.value - a.value)[0];
      if (!highest) return null;
      const impressionLine =
        highest.value >= 14.5
          ? "Moderate ventriculomegaly approaching the severe threshold (15 mm); recommend short-interval follow-up imaging to detect progression."
          : undefined;
      return {
        prior: 0.7,
        triggerLabel: `Atrial ${highest.side} = ${fmt1(highest.value)} mm`,
        impressionLine,
      };
    },
  },
  {
    id: "mild-vm",
    title: "Mild ventriculomegaly (atrial 10–12 mm)",
    oneLine: "Atrial diameter 10–12 mm — soft marker.",
    severity: "watch",
    impressionLine:
      "Isolated mild ventriculomegaly; consider postnatal MRI follow-up. Pooled neurodevelopmental delay rate ~7.9% (Pagani 2014).",
    impressionPriority: 10,
    summary:
      "Mild VM may be isolated (favourable prognosis) or a sign of underlying pathology.",
    rows: [
      {
        dx: "Isolated / idiopathic",
        likelihood: "Most cases",
        rationale:
          "Neurodevelopmental delay ~7.9% in isolated mild VM (Pagani 2014).",
      },
      {
        dx: "Associated CNS anomalies",
        likelihood: "Minority",
        rationale: "Common underlying structural anomalies.",
      },
      {
        dx: "Chromosomal (Trisomy 21 in particular)",
        likelihood: "Minority",
        rationale: "Aneuploidy warrants discussion.",
      },
      {
        dx: "Aqueductal stenosis",
        likelihood: "Minority",
        rationale: "Common obstructive cause.",
      },
      {
        dx: "Agenesis of the corpus callosum",
        likelihood: "Minority",
        rationale: "Frequently associated with VM.",
      },
      {
        dx: "Congenital infection (CMV)",
        likelihood: "Rare",
        rationale: "Important to exclude.",
      },
    ],
    nextSteps:
      "Dedicated views of corpus callosum, fetal MRI follow-up at ~32 weeks, TORCH / CMV screening.",
    limitations:
      "Likelihoods from cohort studies; risk depends on additional findings, karyotype, and CMV status.",
    primary: {
      label: "Pagani 2014",
      full: "Pagani G, et al. Ultrasound Obstet Gynecol. 2014;44(3):254–260.",
      url: "https://pubmed.ncbi.nlm.nih.gov/24623452/",
    },
    secondary: {
      label: "SMFM 2018",
      full: "SMFM mild VM guideline.",
      url: "https://www.ajog.org/article/S0002-9378(18)30336-3/fulltext",
    },
    match: ({ values }) => {
      const L = values.atrial_left,
        R = values.atrial_right;
      const candidates = [
        { side: "L", value: L },
        { side: "R", value: R },
      ].filter(
        (candidate): candidate is { side: string; value: number } =>
          candidate.value != null &&
          candidate.value >= 10 &&
          candidate.value <= 12
      );
      const highest = candidates.sort((a, b) => b.value - a.value)[0];
      if (!highest) return null;
      return {
        prior: 0.55,
        triggerLabel: `Atrial ${highest.side} = ${fmt1(highest.value)} mm`,
      };
    },
  },
  {
    id: "asym-vent",
    title: "Asymmetric lateral ventricles (|L − R| > 2 mm)",
    oneLine:
      "Lateral ventricle asymmetry > 2 mm, including unilateral VM patterns.",
    severity: "watch",
    impressionPriority: 50,
    summary:
      "Asymmetric lateral ventricles are common. When isolated and without VM this is often a benign variant; warrants evaluation for associated anomalies.",
    rows: [
      {
        dx: "Benign idiopathic asymmetry",
        likelihood: "Most common when isolated",
        rationale: "Generally favourable in isolation.",
      },
      {
        dx: "Associated CNS anomalies",
        likelihood: "Variable",
        rationale: "ACC, aqueductal stenosis, cortical malformations.",
      },
      {
        dx: "Chromosomal / genetic disorders",
        likelihood: "Variable",
        rationale: "Consider karyotype with other findings.",
      },
    ],
    nextSteps:
      "Detailed neurosonography and fetal MRI, serial monitoring, TORCH screening as indicated.",
    limitations: "Estimates generalised from VM literature.",
    primary: {
      label: "Giorgione 2022",
      full: "Giorgione V, et al. Fetal cerebral ventriculomegaly.",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10099769/",
    },
    match: ({ values }) => {
      const L = values.atrial_left,
        R = values.atrial_right;
      if (L == null || R == null) return null;
      if (Math.abs(L - R) <= 2) return null;
      const max = Math.max(L, R);
      const min = Math.min(L, R);
      const side = R > L ? "Right" : "Left";
      const impressionLine =
        max >= 10 && max <= 12 && min < 10
          ? `${side}-sided mild ventriculomegaly with marked side-to-side asymmetry; recommend dedicated workup for unilateral causes (intra-ventricular obstruction, encephaloclastic insult, germinal matrix haemorrhage).`
          : undefined;
      // If either side is already in VM range, severe/mild VM cards take priority.
      if (max >= 10)
        return {
          prior: 0.25,
          triggerLabel: `|L−R| = ${Math.abs(L - R).toFixed(1)} mm`,
          impressionLine,
        };
      return {
        prior: 0.55,
        triggerLabel: `|L−R| = ${Math.abs(L - R).toFixed(1)} mm`,
        impressionLine,
      };
    },
  },
  {
    id: "colpocephaly-pattern",
    title: "Colpocephaly pattern",
    oneLine:
      "Posterior-predominant lateral ventricle enlargement with normal frontal horn.",
    severity: "concern",
    relatedParamIds: ["atrial_left", "atrial_right"],
    impressionLine:
      "Colpocephaly pattern: disproportionate occipital-horn enlargement with normal frontal horn; evaluate for corpus-callosum agenesis and malformation of cortical development.",
    impressionPriority: 35,
    summary:
      "Atrial diameter above 10 mm with a normal same-side frontal horn indicates posterior-predominant ventricular enlargement.",
    rows: [
      {
        dx: "Agenesis / dysgenesis of the corpus callosum",
        likelihood: "Common association",
        rationale:
          "Colpocephaly is a classic ventricular morphology in complete or partial ACC.",
      },
      {
        dx: "Malformation of cortical development",
        likelihood: "Important differential",
        rationale:
          "Posterior-predominant ventricular enlargement can accompany abnormal cortical development.",
      },
      {
        dx: "Isolated ventriculomegaly morphology",
        likelihood: "Diagnosis of exclusion",
        rationale:
          "Consider only after the corpus callosum and cortical mantle are well assessed.",
      },
    ],
    nextSteps:
      "Review mid-sagittal corpus callosum, CSP, cingulate sulcus orientation, and cortical morphology.",
    limitations:
      "Requires entered frontal-horn width and does not replace qualitative ventricular-shape assessment.",
    primary: {
      label: "Tang 2009",
      full: "Tang PH, Bartha AI, Norton ME, Barkovich AJ, Sherr EH, Glenn OA. Agenesis of the corpus callosum: an MR imaging analysis of associated abnormalities in the fetus. AJNR Am J Neuroradiol. 2009;30(2):257-263.",
      url: "https://www.ajnr.org/content/30/2/257",
    },
    match: ({ values }) => {
      const candidate = colpocephalyCandidate(values);
      if (!candidate) return null;
      return {
        prior: 0.55,
        triggerLabel: `Atrial ${candidate.side} ${fmt1(candidate.atrium)} mm + frontal horn ${fmt1(candidate.frontalHorn)} mm`,
      };
    },
  },

  /* ===== CSP ===== */
  {
    id: "absent-csp",
    title: "Absent / very narrow cavum septum pellucidum (< 1 mm)",
    oneLine:
      "CSP < 1 mm — strong association with midline / forebrain anomalies.",
    severity: "urgent",
    impressionLine:
      "Absent cavum septum pellucidum; evaluate for septo-optic dysplasia, corpus callosum abnormality, and mild holoprosencephaly-spectrum findings.",
    impressionPriority: 30,
    summary:
      "Absence of the CSP is rarely isolated; commonly seen with holoprosencephaly, ACC, septo-optic dysplasia, or severe ventriculomegaly.",
    rows: [
      {
        dx: "Holoprosencephaly",
        likelihood: "Common",
        rationale: "Especially with midline facial anomalies (Malinger 2005).",
      },
      {
        dx: "Agenesis of the corpus callosum",
        likelihood: "Common",
        rationale: "Absent CSP in ~2/3 of ACC cases (SMFM 2020).",
      },
      {
        dx: "Severe hydrocephalus / VM",
        likelihood: "Minority",
        rationale: "Pressure-induced fenestration of septal leaves.",
      },
      {
        dx: "Septo-optic dysplasia",
        likelihood: "Minority",
        rationale: "Optic hypoplasia hard to confirm prenatally.",
      },
      {
        dx: "Isolated / idiopathic",
        likelihood: "Rare",
        rationale: "Diagnosis of exclusion.",
      },
    ],
    nextSteps:
      "Multiplanar neurosonography, fetal MRI, genetic counselling, evaluate for cortical malformations.",
    limitations: "Estimates from cohort studies.",
    primary: {
      label: "Malinger 2005",
      full: "Malinger G, Lev D, Kidron D, Heredia F, Hershkovitz R, Lerman-Sagie T. Differential diagnosis in fetuses with absent septum pellucidum. Ultrasound Obstet Gynecol. 2005;25(1):42–49. doi:10.1002/uog.1787. PMID 15593321.",
      url: "https://obgyn.onlinelibrary.wiley.com/doi/full/10.1002/uog.1787",
    },
    secondary: {
      label: "SMFM 2020",
      full: "SMFM; Ward A, Monteagudo A. Absent cavum septi pellucidi.",
      url: "https://www.ajog.org/article/S0002-9378(20)31109-1/fulltext",
    },
    match: ({ values }) =>
      values.csp_width != null && values.csp_width < 1
        ? { prior: 0.85, triggerLabel: `CSP = ${fmt1(values.csp_width)} mm` }
        : null,
  },
  {
    id: "sod-dd",
    title: "Septo-optic dysplasia qualitative add-on",
    oneLine:
      "Entered small optic apparatus finding - SOD advisory in the absent-CSP context.",
    severity: "info",
    impressionLine:
      "Septo-optic dysplasia qualitative add-on; entered small optic apparatus should be included in absent-CSP counselling.",
    impressionPriority: 6,
    summary:
      "Small optic nerves or chiasm cannot be inferred from linear fetal brain biometry, but the manual entry changes counselling for absent CSP.",
    rows: [
      {
        dx: "Septo-optic dysplasia",
        likelihood: "Entered qualitative finding",
        rationale:
          "Malinger 2005 includes septo-optic dysplasia in the absent-CSP differential, while prenatal optic hypoplasia is difficult to confirm.",
      },
      {
        dx: "Isolated absent CSP",
        likelihood: "Differential consideration",
        rationale:
          "Absent CSP remains a diagnosis of exclusion if optic apparatus and endocrine findings are not confirmed.",
      },
      {
        dx: "Mild holoprosencephaly spectrum",
        likelihood: "Overlap differential",
        rationale:
          "Review frontal horn configuration, midline facial anatomy, and hypothalamic-septal structures.",
      },
    ],
    nextSteps:
      "Document optic nerves and chiasm when visualized, review pituitary-hypothalamic anatomy, and recommend postnatal ophthalmologic/endocrine correlation.",
    limitations:
      "Qualitative add-on only; the calculator does not infer optic-nerve or optic-chiasm size from biometry.",
    primary: {
      label: "Malinger 2005",
      full: "Malinger G, Lev D, Kidron D, Heredia F, Hershkovitz R, Lerman-Sagie T. Differential diagnosis in fetuses with absent septum pellucidum. Ultrasound Obstet Gynecol. 2005;25(1):42-49. doi:10.1002/uog.1787. PMID 15593321.",
      url: "https://obgyn.onlinelibrary.wiley.com/doi/full/10.1002/uog.1787",
    },
    match: ({ values }) =>
      (values.qualitative_sod_panel ?? 0) > 0
        ? { prior: 0.2, triggerLabel: "entered small optic apparatus" }
        : null,
  },
  {
    id: "enlarged-csp",
    title: "Enlarged / cystic CSP (> 10 mm)",
    oneLine: "CSP > 10 mm — typically benign; rarely obstructive.",
    severity: "watch",
    impressionLine:
      "Isolated enlarged CSP / cavum vergae is usually benign; correlate for cavum velum interpositum cyst or associated anomalies.",
    impressionPriority: 8,
    summary:
      "Often isolated and benign; can coexist with cavum vergae or velum interpositi cyst; rarely causes obstructive hydrocephalus.",
    rows: [
      {
        dx: "Normal variant / isolated",
        likelihood: "Most cases",
        rationale: "Generally good prognosis.",
      },
      {
        dx: "Cavum vergae",
        likelihood: "Minority",
        rationale: "Common posterior extension.",
      },
      {
        dx: "Cavum velum interpositum cyst",
        likelihood: "Rare",
        rationale: "Triangular postero-superior; key DDx.",
      },
      {
        dx: "Associated anomalies (ACC, cardiac)",
        likelihood: "Rare",
        rationale: "Prognosis depends on co-findings.",
      },
      {
        dx: "Symptomatic / obstructive hydrocephalus",
        likelihood: "Very rare",
        rationale: "Rare; may need neurosurgical intervention.",
      },
    ],
    nextSteps:
      "Detailed fetal neurosonogram, fetal MRI, genetic counselling if other anomalies.",
    limitations: "Estimates from literature.",
    primary: {
      label: "Ding 2019",
      full: "Ding H, et al. Eur J Obstet Gynecol Reprod Biol. 2019;237:85–88.",
      url: "https://www.sciencedirect.com/science/article/abs/pii/S0301211519301782",
    },
    match: ({ values }) =>
      values.csp_width != null && values.csp_width > 10
        ? { prior: 0.45, triggerLabel: `CSP = ${fmt1(values.csp_width)} mm` }
        : null,
  },
  {
    id: "cavum-vergae-dd",
    title: "Cavum vergae qualitative add-on",
    oneLine:
      "Entered posterior CSP extension - cavum vergae label for the enlarged-CSP context.",
    severity: "info",
    impressionLine:
      "Cavum vergae qualitative add-on; label the posterior CSP extension while correlating for associated anomalies.",
    impressionPriority: 6,
    summary:
      "Cavum vergae is a qualitative posterior extension of the CSP that can accompany an enlarged CSP and should be explicitly labelled when entered.",
    rows: [
      {
        dx: "Cavum vergae",
        likelihood: "Entered qualitative finding",
        rationale:
          "Bronshtein 1992 describes dilated cava septi pellucidi et vergae as a prenatal midline cystic finding.",
      },
      {
        dx: "Isolated enlarged CSP variant",
        likelihood: "Common context",
        rationale:
          "When no other anomalies are present, enlarged CSP / cavum vergae is often a benign variant.",
      },
      {
        dx: "Other midline cystic structure",
        likelihood: "Differential consideration",
        rationale:
          "Differentiate from cavum velum interpositum cyst and other posterosuperior midline cysts.",
      },
    ],
    nextSteps:
      "Document posterior extension, confirm corpus-callosum anatomy, and correlate for associated CNS or non-CNS anomalies.",
    limitations:
      "Qualitative add-on only; the calculator does not infer cavum vergae from CSP width alone.",
    primary: {
      label: "Bronshtein 1992",
      full: "Bronshtein M, Weiner Z. Prenatal diagnosis of dilated cava septi pellucidi et vergae: associated anomalies, differential diagnosis, and pregnancy outcome. Obstet Gynecol. 1992;80(5):838-842.",
      url: "https://pubmed.ncbi.nlm.nih.gov/1407899/",
    },
    match: ({ values }) =>
      (values.qualitative_cavum_vergae_panel ?? 0) > 0
        ? { prior: 0.2, triggerLabel: "entered cavum vergae" }
        : null,
  },

  /* ===== Corpus callosum ===== */
  {
    id: "cc-absent",
    title: "Likely complete agenesis of the corpus callosum (severely short)",
    oneLine: "CC length z < −3 OR < 5 mm — likely complete ACC.",
    severity: "urgent",
    relatedParamIds: ["cc_length"],
    summary:
      "A near-absent or vestigial corpus callosum strongly suggests complete agenesis (cACC), often with associated CNS or syndromic anomalies.",
    rows: [
      {
        dx: "Isolated complete ACC",
        likelihood: "~65–75%",
        rationale:
          "Normal neurodevelopment in 65–75% of isolated ACC (Santo 2012).",
      },
      {
        dx: "Monogenic syndromic disorder",
        likelihood: "Minority",
        rationale: "Identified in 30% of a recent cohort (Sun 2024).",
      },
      {
        dx: "Chromosomal abnormality / pathogenic CNV",
        likelihood: "Minority",
        rationale: "Includes trisomies and pathogenic CNVs.",
      },
      {
        dx: "Associated CNS malformations",
        likelihood: "Variable",
        rationale: "Frequent hydrocephalus, cerebellar dysplasia.",
      },
    ],
    nextSteps:
      "Detailed fetal neurosonography, fetal MRI for associated CNS findings, chromosomal microarray, consider whole-exome sequencing, genetic counselling.",
    limitations: "Prognosis depends heavily on associated anomalies.",
    primary: {
      label: "Santo 2012",
      full: "Santo S, et al. Ultrasound Obstet Gynecol. 2012;40(5):513–521.",
      url: "https://obgyn.onlinelibrary.wiley.com/doi/full/10.1002/uog.12315",
    },
    secondary: {
      label: "Sun 2024",
      full: "Sun H, Li K, Wang L, Zhao L, Yan C, Kong X, Liu N. Eur J Obstet Gynecol Reprod Biol. 2024;298:146–152. doi:10.1016/j.ejogrb.2024.05.005.",
      url: "https://www.sciencedirect.com/science/article/abs/pii/S0301211524002264",
    },
    match: ({ values, zs }) => {
      const v = values.cc_length;
      if (v == null) return null;
      const zr = zs.cc_length;
      if (v < 5 || (zr != null && zr.z < -3))
        return {
          prior: 0.9,
          triggerLabel: `CC = ${fmt1(v)} mm (z ${zr ? formatZ(zr.z) : "—"})`,
        };
      return null;
    },
  },
  {
    id: "cc-short",
    title: "Short / dysgenetic corpus callosum (z < −1.645)",
    oneLine: "CC below the 5th percentile — partial agenesis / hypogenesis.",
    severity: "concern",
    relatedParamIds: ["cc_length"],
    impressionLine:
      "Partial / hypogenetic corpus callosum; postnatal MRI is recommended for confirmation.",
    impressionPriority: 25,
    summary:
      "Short corpus callosum indicates partial agenesis or hypogenesis, often with a wide spectrum of associated anomalies.",
    rows: [
      {
        dx: "Isolated partial ACC",
        likelihood: "Most common",
        rationale: "Better prognosis than complete.",
      },
      {
        dx: "Monogenic syndromic disorder",
        likelihood: "Minority",
        rationale: "Recurrent in WES cohorts (Sun 2024).",
      },
      {
        dx: "Chromosomal abnormality / CNV",
        likelihood: "Minority",
        rationale: "Microarray indicated.",
      },
      {
        dx: "Associated CNS malformations",
        likelihood: "Variable",
        rationale: "Hydrocephalus, cerebellar dysplasia.",
      },
    ],
    nextSteps: "Microarray, fetal MRI, genetic counselling.",
    limitations: "Prognosis depends on co-findings.",
    primary: {
      label: "Sun 2024",
      full: "Sun H, Li K, Wang L, Zhao L, Yan C, Kong X, Liu N. Eur J Obstet Gynecol Reprod Biol. 2024;298:146–152. doi:10.1016/j.ejogrb.2024.05.005.",
      url: "https://www.sciencedirect.com/science/article/abs/pii/S0301211524002264",
    },
    match: ({ zs, values }) => {
      const zr = zs.cc_length;
      const v = values.cc_length;
      if (zr == null || v == null) return null;
      if (zr.z >= -1.6448536269514722) return null;
      // The cACC card supersedes this one.
      if (v < 5 || zr.z < -3) return null;
      return {
        prior: 0.7,
        triggerLabel: `CC = ${fmt1(v)} mm (z ${formatZ(zr.z)})`,
      };
    },
  },
  {
    id: "cc-thick",
    title: "Thick corpus callosum (>95th percentile)",
    oneLine: "CC above the 95th percentile — uncommon.",
    severity: "watch",
    relatedParamIds: ["cc_length"],
    summary:
      "An unusually thick or long CC is uncommon and may be a normal variant or, rarely, associated with malformations of cortical development.",
    rows: [
      {
        dx: "Normal variant",
        likelihood: "Most common",
        rationale: "Small upward tail.",
      },
      {
        dx: "Megalencephaly / cortical malformation",
        likelihood: "Rare",
        rationale: "When co-occurring with macrocephaly.",
      },
    ],
    nextSteps:
      "Correlate with cortical morphology and head size; clinical follow-up.",
    limitations: "Limited literature on isolated thick CC in fetuses.",
    primary: S_TILEA,
    match: ({ zs, values }) => {
      const zr = zs.cc_length;
      const v = values.cc_length;
      if (zr == null || v == null) return null;
      return zr.z > 1.6448536269514722
        ? {
            prior: 0.3,
            triggerLabel: `CC = ${fmt1(v)} mm (z ${formatZ(zr.z)})`,
          }
        : null;
    },
  },

  /* ===== Brainstem / posterior fossa ===== */
  {
    id: "pons-small",
    title: "Pons AP < 5th percentile — pontocerebellar hypoplasia spectrum",
    oneLine: "Pons AP below 5th percentile — brainstem maldevelopment.",
    severity: "concern",
    relatedParamIds: ["pons_ap"],
    summary:
      "A small pons AP diameter is a key indicator of pontocerebellar hypoplasia (PCH) or other brainstem maldevelopment.",
    rows: [
      {
        dx: "PCH Type 2 (esp. PCH2A)",
        likelihood: "Most common",
        rationale: "Most common subtype (van Dijk 2018).",
      },
      {
        dx: "PCH Type 1",
        likelihood: "Minority",
        rationale: "Second most common; motor neuronopathy.",
      },
      {
        dx: "Other PCH (3–11)",
        likelihood: "Minority",
        rationale: "Numerous but rare genetic subtypes.",
      },
      {
        dx: "CASK-related disorders",
        likelihood: "Rare",
        rationale: "Can present with PCH.",
      },
      {
        dx: "Tubulinopathies",
        likelihood: "Rare",
        rationale: "Wide spectrum of brain malformations.",
      },
      {
        dx: "Trisomy 21 (soft marker)",
        likelihood: "Modest",
        rationale: "Smaller pons reported in T21.",
      },
    ],
    nextSteps:
      "Targeted gene panel (TSEN54, CASK, tubulinopathies), fetal MRI for associated anomalies, genetic counselling.",
    limitations:
      "Rare-disease estimates; genetic testing required for definitive diagnosis.",
    primary: {
      label: "van Dijk 2018",
      full: "van Dijk T, et al. Orphanet J Rare Dis. 2018;13:92.",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6003036/",
    },
    secondary: S_DOVJAK,
    match: ({ zs, values }) => {
      const zr = zs.pons_ap;
      if (zr == null || zr.z >= -1.6448536269514722) return null;
      return {
        prior: 0.7,
        triggerLabel: `Pons = ${fmt1(values.pons_ap)} mm (z ${formatZ(zr.z)})`,
      };
    },
  },
  {
    id: "pons-large",
    title: "Pons AP >95th percentile — pontine bulging",
    oneLine: "Pons AP above 95th percentile — uncommon.",
    severity: "watch",
    relatedParamIds: ["pons_ap"],
    summary:
      "An unusually thick pons is rare and may reflect a brainstem mass, hamartoma, or measurement artefact.",
    rows: [
      {
        dx: "Measurement artefact",
        likelihood: "Most common",
        rationale: "Re-measure in true mid-sagittal plane.",
      },
      {
        dx: "Brainstem mass / hamartoma",
        likelihood: "Rare",
        rationale: "Correlate with parenchymal signal.",
      },
    ],
    nextSteps: "Repeat measurement; correlate with parenchymal MRI.",
    limitations: "Sparse literature.",
    primary: S_DOVJAK,
    match: ({ zs, values }) => {
      const zr = zs.pons_ap;
      if (zr == null || zr.z <= 1.6448536269514722) return null;
      return {
        prior: 0.2,
        triggerLabel: `Pons = ${fmt1(values.pons_ap)} mm (z ${formatZ(zr.z)})`,
      };
    },
  },
  {
    id: "tcd-small",
    title: "TCD < 5th percentile — cerebellar hypoplasia spectrum",
    oneLine: "Transcerebellar diameter below 5th percentile.",
    severity: "concern",
    relatedParamIds: ["tcd"],
    impressionLine:
      "Unilateral cerebellar hypoplasia or cerebellar disruption injury should be considered; postnatal MRI is recommended for laterality assessment.",
    impressionPriority: 12,
    summary:
      "A small TCD suggests cerebellar hypoplasia; consider chromosomal, genetic, and infectious aetiologies.",
    rows: [
      {
        dx: "Chromosomal (Trisomy 13, 18)",
        likelihood: "Significant",
        rationale: "Aneuploidy is a major association.",
      },
      {
        dx: "Congenital CMV infection",
        likelihood: "Variable",
        rationale: "Classic teratogenic cause.",
      },
      {
        dx: "Genetic syndromes / PCH spectrum",
        likelihood: "Variable",
        rationale: "Often co-occurs with small pons.",
      },
      {
        dx: "Isolated cerebellar hypoplasia",
        likelihood: "Rare",
        rationale: "Diagnosis of exclusion.",
      },
    ],
    nextSteps:
      "Fetal MRI, microarray, CMV / TORCH screening, genetic counselling.",
    limitations: "Differential is broad; genetic testing often required.",
    primary: S_VATANSEVER,
    secondary: S_DOVJAK,
    match: ({ zs, values }) => {
      const zr = zs.tcd;
      const lowestSourceZ = lowestTcdZ(zs);
      if (zr == null || lowestSourceZ >= -1.6448536269514722) return null;
      return {
        prior: 0.65,
        triggerLabel: `TCD = ${fmt1(values.tcd)} mm (lowest source z ${formatZ(
          lowestSourceZ
        )})`,
      };
    },
  },
  {
    id: "res-pattern",
    title: "Rhombencephalosynapsis pattern",
    oneLine: "Small TCD + absent primary fissure — RES pattern.",
    severity: "urgent",
    relatedParamIds: ["tcd"],
    summary:
      "Rhombencephalosynapsis is suggested by cerebellar hypoplasia with absent primary fissure, reflecting vermian fusion across the midline.",
    rows: [
      {
        dx: "Rhombencephalosynapsis",
        likelihood: "Pattern-defining",
        rationale:
          "Classic qualitative signature is absent vermian primary fissure with cerebellar hypoplasia.",
      },
      {
        dx: "Associated supratentorial malformation",
        likelihood: "Variable",
        rationale: "Review cerebral midline and cortical anatomy.",
      },
    ],
    nextSteps:
      "Targeted posterior-fossa review, assess vermian fusion and primary fissure, genetic counselling if associated anomalies.",
    limitations:
      "Requires qualitative imaging confirmation of primary-fissure absence.",
    primary: {
      label: "Brady 2022",
      full: "Brady et al. fetal neuroradiology review, 2022.",
      url: "https://pubmed.ncbi.nlm.nih.gov/",
    },
    match: ({ zs, values }) => {
      const qualitativeAbsentFissure =
        (values.qualitative_absent_primary_fissure ?? 0) > 0;
      const lowestSourceZ = lowestTcdZ(zs);
      if (!qualitativeAbsentFissure || lowestSourceZ >= -1.6448536269514722)
        return null;
      return {
        prior: 0.75,
        triggerLabel: `absent primary fissure + TCD lowest source z ${formatZ(
          lowestSourceZ
        )}`,
      };
    },
  },
  {
    id: "tcd-large",
    title: "TCD > 95th percentile — macrocerebellum",
    oneLine: "TCD above 95th percentile — rare.",
    severity: "watch",
    relatedParamIds: ["tcd"],
    summary:
      "A large TCD (macrocerebellum) is uncommon; may be seen with megalencephaly syndromes (e.g. PTEN-related) or measurement variation.",
    rows: [
      {
        dx: "Normal variant / measurement",
        likelihood: "Most common",
        rationale: "Re-measure on true axial plane.",
      },
      {
        dx: "Megalencephaly / PTEN spectrum",
        likelihood: "Rare",
        rationale: "Correlate with brain BPD and head size.",
      },
    ],
    nextSteps: "Re-measure; correlate with overall head and brain size.",
    limitations: "Sparse literature.",
    primary: S_VATANSEVER,
    match: ({ zs, values }) => {
      const zr = zs.tcd;
      if (zr == null || zr.z <= 1.6448536269514722) return null;
      return {
        prior: 0.2,
        triggerLabel: `TCD = ${fmt1(values.tcd)} mm (z ${formatZ(zr.z)})`,
      };
    },
  },
  {
    id: "vermis-small",
    title: "Small vermis — Dandy-Walker / vermian hypoplasia spectrum",
    oneLine: "Vermis below 5th percentile — posterior fossa anomaly likely.",
    severity: "concern",
    relatedParamIds: ["vermis_cc", "vermis_ap"],
    impressionLine:
      "Findings suggest inferior vermian hypoplasia; Limperopoulos 2006 cautions that fetal MRI before 24 weeks can substantially over-call inferior vermian hypoplasia, so correlate with gestational age and follow-up imaging.",
    impressionPriority: 15,
    summary:
      "Small vermis raises concern for Dandy-Walker malformation, vermian hypoplasia, Joubert syndrome, or Blake's pouch remnant.",
    rows: [
      {
        dx: "Dandy-Walker malformation / variant",
        likelihood: "Common",
        rationale: "Classic posterior-fossa anomaly.",
      },
      {
        dx: "Isolated vermian hypoplasia",
        likelihood: "Minority",
        rationale: "Better prognosis if isolated.",
      },
      {
        dx: "Joubert syndrome (molar tooth sign)",
        likelihood: "Minority",
        rationale: "Confirm with mid-brain morphology.",
      },
      {
        dx: "Chromosomal / syndromic disorder",
        likelihood: "Minority",
        rationale: "Microarray indicated.",
      },
    ],
    nextSteps:
      "Detailed fetal MRI of posterior fossa, look for molar-tooth sign, microarray, genetic counselling.",
    limitations:
      "Rotation of the vermis can mimic hypoplasia; correlate with imaging plane.",
    primary: S_VATANSEVER,
    secondary: S_DOVJAK,
    match: ({ zs, values }) => {
      const smallest = lowestEnteredVermisAxis(values, zs);
      if (smallest == null || smallest.zr.z >= -1.6448536269514722) return null;
      return {
        prior: 0.65,
        triggerLabel: `${smallest.label} = ${fmt1(smallest.value)} mm (z ${formatZ(smallest.zr.z)})`,
      };
    },
  },
  {
    id: "vermis-large",
    title: "Large vermis (z > +2)",
    oneLine: "Vermis above 97.5th percentile — uncommon.",
    severity: "watch",
    relatedParamIds: ["vermis_cc"],
    summary:
      "A large vermis is rare; consider posterior-fossa cyst projecting onto the vermis, neoplasm, or measurement artefact.",
    rows: [
      {
        dx: "Measurement / plane artefact",
        likelihood: "Most common",
        rationale: "Re-measure on true mid-sagittal.",
      },
      {
        dx: "Posterior fossa cyst / neoplasm",
        likelihood: "Rare",
        rationale: "Correlate with parenchymal imaging.",
      },
    ],
    nextSteps: "Repeat measurement; review parenchymal MRI.",
    limitations: "Sparse literature.",
    primary: S_VATANSEVER,
    match: ({ zs, values }) => {
      const zr = zs.vermis_cc;
      if (zr == null || zr.z <= 2) return null;
      return {
        prior: 0.2,
        triggerLabel: `Vermis CC = ${fmt1(values.vermis_cc)} mm (z ${formatZ(zr.z)})`,
      };
    },
  },
  {
    id: "chiari-ii-ontd",
    title: "Chiari II / open neural tube defect pattern",
    oneLine:
      "Small posterior fossa with reduced clivus-supraocciput angle — open spinal dysraphism pattern.",
    severity: "urgent",
    relatedParamIds: ["tdpf", "csa"],
    summary:
      "A small posterior fossa with a closed clivus-supraocciput angle is the cranial signature of Chiari II malformation and should prompt dedicated fetal-spine evaluation for open neural tube defect.",
    rows: [
      {
        dx: "Chiari II malformation due to open neural tube defect",
        likelihood: "~85-90% when both z-scores below -2",
        rationale:
          "TDPF below -2 SD with CSA below -2 SD has ~91% sensitivity and ~93% specificity for open NTD versus controls in Woitek 2014.",
      },
      {
        dx: "Closed neural tube defect",
        likelihood: "~5-10%",
        rationale:
          "Closed NTDs cause milder posterior-fossa changes and are usually less likely when both z-scores are below -2.",
      },
      {
        dx: "Severe vermian hypoplasia / Dandy-Walker spectrum",
        likelihood: "~3-5%",
        rationale:
          "Small posterior fossa can occur in DWM, but CSA is typically preserved or increased rather than reduced.",
      },
      {
        dx: "Benign small posterior fossa",
        likelihood: "<1%",
        rationale:
          "Rarely do both TDPF and CSA fall below -2 SD in healthy controls.",
      },
    ],
    nextSteps:
      "Dedicated sagittal and axial fetal-spine MRI, referral to a fetal-surgery-capable centre, genetic counselling, and amniocentesis with chromosomal microarray as clinically appropriate.",
    limitations:
      "Research-mode discriminator trained on Woitek 2014 and externally supported by Aertsen 2019; posterior probabilities should be interpreted with direct spine imaging and motion quality.",
    primary: S_WOITEK,
    secondary: S_AERTSEN,
    match: ({ zs }) => {
      const zTdpf = zs.tdpf?.z;
      const zCsa = zs.csa?.z;
      if (zTdpf == null || zCsa == null) return null;
      if (!(zTdpf < -2 && zCsa < -2)) return null;
      const posterior = chiariOntdPosterior(zTdpf, zCsa);
      if (posterior.ontd <= 0.5) return null;
      return {
        prior: Math.max(0.86, posterior.ontd),
        triggerLabel: `TDPF z ${formatZ(zTdpf)} + CSA z ${formatZ(
          zCsa
        )}; ONTD posterior ${(posterior.ontd * 100).toFixed(0)}%`,
      };
    },
  },

  /* ===== Third ventricle ===== */
  {
    id: "third-v-wide",
    title: "Third ventricle > 3.5 mm",
    oneLine:
      "Third-ventricle dilatation — often associated with other CNS anomalies.",
    severity: "concern",
    summary:
      "Dilatation of the third ventricle is often associated with other CNS anomalies; isolated cases warrant evaluation for obstructive causes.",
    rows: [
      {
        dx: "Aqueductal stenosis",
        likelihood: "Common",
        rationale: "Common cause of obstructive hydrocephalus.",
      },
      {
        dx: "Agenesis / dysgenesis of corpus callosum",
        likelihood: "Minority",
        rationale: "Alters CSF dynamics.",
      },
      {
        dx: "Holoprosencephaly (mild / lobar)",
        likelihood: "Minority",
        rationale: "Incomplete forebrain cleavage.",
      },
      {
        dx: "Interhemispheric / velum interpositi cyst",
        likelihood: "Rare",
        rationale: "Mass-effect obstruction.",
      },
    ],
    nextSteps:
      "Detailed neurosonography and fetal MRI; evaluation of corpus callosum and aqueduct; karyotype; TORCH screening.",
    limitations: "Estimates from general VM literature.",
    primary: {
      label: "Hertzberg 1997",
      full: "Hertzberg BS, et al. Radiology. 1997;203(3):641–644.",
      url: "https://pubs.rsna.org/doi/10.1148/radiology.203.3.9169682",
    },
    secondary: S_BIRNBAUM,
    match: ({ values }) =>
      values.third_ventricle != null && values.third_ventricle > 3.5
        ? {
            prior: 0.7,
            triggerLabel: `3rd V = ${fmt1(values.third_ventricle)} mm`,
          }
        : null,
  },

  /* ===== Global brain / skull ===== */
  {
    id: "microcephaly",
    title: "Microcephaly (brain BPD or skull BPD <3rd percentile)",
    oneLine: "Brain or skull BPD below 3rd percentile — small head.",
    severity: "concern",
    relatedParamIds: ["brain_bpd", "skull_bpd"],
    summary:
      "Microcephaly suggests impaired brain growth; aetiologies span genetic syndromes, congenital infection, and intrauterine insults.",
    rows: [
      {
        dx: "Genetic / syndromic microcephaly",
        likelihood: "Common",
        rationale: "MCPH genes, primary microcephaly.",
      },
      {
        dx: "Congenital infection (CMV, Zika, toxoplasmosis)",
        likelihood: "Minority",
        rationale: "Always exclude; periventricular calcifications a clue.",
      },
      {
        dx: "Brain malformations (lissencephaly, polymicrogyria)",
        likelihood: "Minority",
        rationale: "Correlate with cortical morphology.",
      },
      {
        dx: "Chromosomal abnormality",
        likelihood: "Minority",
        rationale: "Microarray indicated.",
      },
      {
        dx: "Constitutional / familial",
        likelihood: "Minority",
        rationale: "Compare with parental head sizes.",
      },
    ],
    nextSteps:
      "Detailed fetal MRI for cortical malformation, TORCH/CMV screening, microarray, parental head circumferences.",
    limitations:
      "Definition varies (some use −3 SD); confirm on follow-up scan.",
    primary: S_TILEA,
    secondary: S_KYRIA,
    match: ({ zs, values }) => {
      const a = zs.brain_bpd?.z,
        b = zs.skull_bpd?.z;
      const min = Math.min(a ?? Infinity, b ?? Infinity);
      if (!Number.isFinite(min) || min >= -1.8807936081512509) return null;
      const which =
        (a ?? Infinity) <= (b ?? Infinity)
          ? `brain BPD ${fmt1(values.brain_bpd)} mm (z ${formatZ(a!)})`
          : `skull BPD ${fmt1(values.skull_bpd)} mm (z ${formatZ(b!)})`;
      return { prior: 0.6, triggerLabel: which };
    },
  },
  {
    id: "cmv-dd",
    title: "Congenital CMV qualitative add-on",
    oneLine:
      "Entered periventricular cysts, calcifications, or germinolytic cysts - congenital CMV advisory.",
    severity: "concern",
    impressionLine:
      "Congenital CMV qualitative add-on; entered periventricular cysts, calcifications, or germinolytic cysts should guide infection workup.",
    impressionPriority: 6,
    summary:
      "The entered qualitative infection findings support congenital CMV consideration, especially when microcephaly and ventriculomegaly are also present.",
    rows: [
      {
        dx: "Congenital CMV infection",
        likelihood: "Entered qualitative finding",
        rationale:
          "Cannie 2016 describes the contribution and timing of fetal MRI in congenital CMV, including brain findings that accompany infection.",
      },
      {
        dx: "Other congenital infection",
        likelihood: "Differential consideration",
        rationale:
          "TORCH infections can overlap in fetal brain injury patterns and require laboratory correlation.",
      },
      {
        dx: "Noninfectious destructive insult",
        likelihood: "Differential consideration",
        rationale:
          "If infectious testing is negative, consider vascular or other intrauterine destructive processes.",
      },
    ],
    nextSteps:
      "Correlate with maternal and amniotic-fluid CMV testing, review for calcifications/cysts and cortical injury, and consider infectious-disease counselling.",
    limitations:
      "Qualitative add-on only; the calculator does not infer calcifications, cysts, or infection status from biometry.",
    primary: {
      label: "Cannie 2016",
      full: "Cannie MM, Devlieger R, Leyder M, et al. Congenital cytomegalovirus infection: contribution and best timing of prenatal MR imaging. Eur Radiol. 2016;26(10):3760-3769.",
      url: "https://doi.org/10.1007/s00330-015-4187-0",
    },
    match: ({ values }) =>
      (values.qualitative_cmv_panel ?? 0) > 0
        ? { prior: 0.25, triggerLabel: "entered qualitative CMV findings" }
        : null,
  },
  {
    id: "macrocephaly",
    title: "Macrocephaly (brain BPD or skull BPD >97th percentile)",
    oneLine: "Brain or skull BPD above 97th percentile — large head.",
    severity: "concern",
    relatedParamIds: ["brain_bpd", "skull_bpd"],
    summary:
      "Macrocephaly may reflect benign familial macrocephaly, megalencephaly syndromes, or hydrocephalus (which would also increase ventricular size).",
    rows: [
      {
        dx: "Hydrocephalus",
        likelihood: "Common",
        rationale: "Especially when atrial diameter is also enlarged.",
      },
      {
        dx: "Benign familial macrocephaly",
        likelihood: "Minority",
        rationale: "Compare with parental head circumferences.",
      },
      {
        dx: "Megalencephaly syndromes (PTEN, MPPH, MCAP)",
        likelihood: "Minority",
        rationale: "Correlate with cortical malformation.",
      },
      {
        dx: "Tumor / cyst",
        likelihood: "Rare",
        rationale: "Rare; correlate with parenchymal MRI.",
      },
    ],
    nextSteps:
      "Re-evaluate ventricles, dedicated MRI of posterior fossa and cortex, parental head circumferences.",
    limitations: "Definition varies; confirm with follow-up.",
    primary: S_TILEA,
    secondary: S_KYRIA,
    match: ({ zs, values }) => {
      const a = zs.brain_bpd?.z,
        b = zs.skull_bpd?.z;
      const max = Math.max(a ?? -Infinity, b ?? -Infinity);
      if (!Number.isFinite(max) || max <= 1.8807936081512509) return null;
      const which =
        (a ?? -Infinity) >= (b ?? -Infinity)
          ? `brain BPD ${fmt1(values.brain_bpd)} mm (z ${formatZ(a!)})`
          : `skull BPD ${fmt1(values.skull_bpd)} mm (z ${formatZ(b!)})`;
      return { prior: 0.45, triggerLabel: which };
    },
  },
  {
    id: "extra-axial-wide",
    title: "Widened extra-axial CSF space (>95th percentile)",
    oneLine: "Extra-axial CSF exceeds the GA-adjusted 95th percentile.",
    severity: "watch",
    relatedParamIds: ["extra_axial_csf", "skull_bpd", "brain_bpd"],
    impressionLine:
      "External hydrocephalus / benign macrocrania of infancy — typically self-resolving.",
    impressionPriority: 9,
    summary:
      "Widened extra-cerebral CSF suggests benign enlargement of subarachnoid spaces, external hydrocephalus, or true cerebral atrophy depending on the accompanying brain-growth pattern.",
    rows: [
      {
        dx: "Benign enlargement of subarachnoid spaces",
        likelihood: "Most common",
        rationale: "Self-limited if isolated.",
      },
      {
        dx: "Cerebral atrophy / volume loss",
        likelihood: "Variable",
        rationale: "Correlate with brain parenchymal signal.",
      },
      {
        dx: "Subdural / arachnoid collection",
        likelihood: "Rare",
        rationale: "Correlate with FLAIR / SWI imaging.",
      },
    ],
    nextSteps:
      "Detailed parenchymal review; serial scans to assess progression.",
    limitations:
      "Direct extra-axial CSF measurement is preferred. The skull/brain BPD z-score gap remains a fallback proxy when direct measurement is not entered.",
    primary: S_KYRIA,
    secondary: S_TILEA,
    match: ({ zs, values }) => {
      if (values.extra_axial_csf != null) {
        const direct = zs.extra_axial_csf?.z;
        if (direct == null || direct <= 1.6448536269514722) return null;
        return {
          prior: 0.35,
          triggerLabel: `extra-axial CSF ${fmt1(
            values.extra_axial_csf
          )} mm (z ${formatZ(direct)})`,
        };
      }

      const sk = zs.skull_bpd?.z,
        br = zs.brain_bpd?.z;
      if (sk == null || br == null) return null;
      const diff = sk - br;
      if (diff <= 2) return null;
      return { prior: 0.35, triggerLabel: `Δz = ${diff.toFixed(2)}` };
    },
  },
  {
    id: "brain-asym",
    title: "Cerebral hemispheric asymmetry (brain OFD L vs R Δz > 2)",
    oneLine:
      "Hemispheric OFD z-score difference > 2 — possible unilateral malformation.",
    severity: "concern",
    summary:
      "Significant L-R asymmetry of cerebral OFD raises concern for hemimegalencephaly, unilateral cortical malformation, or porencephaly.",
    rows: [
      {
        dx: "Hemimegalencephaly",
        likelihood: "Minority",
        rationale: "Marked unilateral enlargement.",
      },
      {
        dx: "Unilateral cortical malformation (e.g. polymicrogyria)",
        likelihood: "Minority",
        rationale: "Correlate with cortex morphology.",
      },
      {
        dx: "Porencephaly / ischaemic insult",
        likelihood: "Minority",
        rationale: "Look for cystic parenchymal defect.",
      },
      {
        dx: "Vascular malformation",
        likelihood: "Rare",
        rationale: "Vein of Galen and other AVMs.",
      },
    ],
    nextSteps:
      "Targeted parenchymal MRI; SWI for hemorrhage; serial follow-up.",
    limitations:
      "Plane obliquity can falsely create asymmetry; re-measure with care.",
    primary: S_TILEA,
    match: ({ values, zs }) => {
      const l = values.brain_ofd_left,
        r = values.brain_ofd_right;
      if (l == null || r == null) return null;
      const zl = zs.brain_ofd_left?.z,
        zr = zs.brain_ofd_right?.z;
      if (zl == null || zr == null) return null;
      const deltaZ = Math.abs(zl - zr);
      if (deltaZ <= 2) return null;
      return {
        prior: 0.55,
        triggerLabel: `Brain OFD Δz = ${deltaZ.toFixed(2)}`,
      };
    },
  },

  /* ===== Composite patterns ===== */
  {
    id: "hydrocephalus-pattern",
    title: "Triventricular hydrocephalus pattern",
    oneLine: "Ventriculomegaly + dilated 3rd V — aqueductal stenosis pattern.",
    severity: "urgent",
    impressionLine:
      "Severe triventricular hydrocephalus with preserved CSP and macrocephaly — pattern most consistent with congenital aqueductal stenosis.",
    impressionPriority: 80,
    summary:
      "Concurrent severe lateral-ventricular and third-ventricular dilatation with normal 4th ventricle is the classic obstructive (triventricular) pattern of aqueductal stenosis.",
    rows: [
      {
        dx: "Aqueductal stenosis",
        likelihood: "Most common",
        rationale: "Classic pattern.",
      },
      {
        dx: "X-linked hydrocephalus (L1CAM)",
        likelihood: "Rare",
        rationale: "Especially in male fetuses with adducted thumbs.",
      },
      {
        dx: "Posterior fossa mass / Chiari II",
        likelihood: "Minority",
        rationale: "Re-examine posterior fossa.",
      },
    ],
    nextSteps:
      "Look for L1CAM features; targeted MRI of aqueduct and posterior fossa; karyotype.",
    limitations: "Patterns are heuristics; correlate with parenchymal imaging.",
    primary: {
      label: "Giorgione 2022",
      full: "Giorgione V, et al. Fetal cerebral ventriculomegaly.",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10099769/",
    },
    match: ({ values }) => {
      const max = Math.max(
        values.atrial_left ?? -Infinity,
        values.atrial_right ?? -Infinity
      );
      const v3 = values.third_ventricle;
      const csp = values.csp_width;
      if (csp != null && csp < 1) return null;
      if (!(Number.isFinite(max) && max >= 10 && v3 != null && v3 > 3.5))
        return null;
      const earlyImpression =
        max < 15
          ? "Early triventricular hydrocephalus pattern with preserved CSP; findings may represent evolving aqueductal stenosis."
          : undefined;
      return {
        prior: max >= 15 ? 0.85 : 0.7,
        triggerLabel: `Atrial ${fmt1(max)} + 3rd V ${fmt1(v3)}`,
        impressionLine: earlyImpression,
      };
    },
  },
  {
    id: "hpe-pattern",
    title: "Holoprosencephaly pattern",
    oneLine: "Absent CSP + severe VM or qualitative HPE findings.",
    severity: "urgent",
    impressionLine:
      "Alobar holoprosencephaly. Counselling per Malinger 2013: poor prognosis; chromosomal microarray and exome sequencing indicated.",
    impressionPriority: 100,
    summary:
      "The combination of absent CSP, microcephaly, and either severe ventriculomegaly or entered monoventricle/fused-thalami findings is highly suggestive of holoprosencephaly.",
    rows: [
      {
        dx: "Alobar / semilobar HPE",
        likelihood: "Most common",
        rationale: "Classic ultrasound/MRI pattern.",
      },
      {
        dx: "Lobar HPE",
        likelihood: "Minority",
        rationale: "Subtler presentation.",
      },
      {
        dx: "Septo-optic dysplasia",
        likelihood: "Rare",
        rationale: "Optic findings hard to confirm prenatally.",
      },
    ],
    nextSteps:
      "Coronal MRI to assess thalamic fusion; karyotype; SHH-pathway gene panel.",
    limitations:
      "Pattern recognition; final diagnosis depends on detailed parenchymal imaging.",
    primary: {
      label: "Malinger 2005",
      full: "Malinger G, Lev D, Kidron D, Heredia F, Hershkovitz R, Lerman-Sagie T. Differential diagnosis in fetuses with absent septum pellucidum. Ultrasound Obstet Gynecol. 2005;25(1):42–49. doi:10.1002/uog.1787. PMID 15593321.",
      url: "https://obgyn.onlinelibrary.wiley.com/doi/full/10.1002/uog.1787",
    },
    match: ({ values, zs }) => {
      const csp = values.csp_width;
      const qualitativeHpe = (values.qualitative_hpe_panel ?? 0) > 0;
      const max = Math.max(
        values.atrial_left ?? -Infinity,
        values.atrial_right ?? -Infinity
      );
      const microZ = Math.min(
        zs.brain_bpd?.z ?? Infinity,
        zs.skull_bpd?.z ?? Infinity
      );
      if (
        !(
          csp != null &&
          csp < 1 &&
          ((Number.isFinite(max) && max >= 15) || qualitativeHpe) &&
          Number.isFinite(microZ) &&
          microZ < -1.8807936081512509
        )
      )
        return null;
      const ventricularLabel = qualitativeHpe
        ? `qualitative HPE findings${
            Number.isFinite(max) ? ` + atrial ${fmt1(max)}` : ""
          }`
        : `atrial ${fmt1(max)}`;
      return {
        prior: 0.85,
        triggerLabel: `CSP ${fmt1(csp)} + ${ventricularLabel} + microcephaly z ${formatZ(microZ)}`,
      };
    },
  },
  {
    id: "acc-pattern",
    title: "Agenesis of the corpus callosum pattern",
    oneLine: "Absent CSP + short / absent CC — ACC strongly considered.",
    severity: "urgent",
    relatedParamIds: ["cc_length"],
    impressionLine:
      "Complete agenesis of the corpus callosum with associated colpocephaly. Counselling per Santo 2012: 65–75% normal neurodevelopment when isolated; 30% monogenic aetiology.",
    impressionPriority: 90,
    summary:
      "Absent CSP combined with a short or absent corpus callosum is the classic ACC pattern; colpocephaly may also be evident.",
    rows: [
      {
        dx: "Complete ACC",
        likelihood: "Most common",
        rationale: "Classic combination.",
      },
      {
        dx: "Partial ACC",
        likelihood: "Minority",
        rationale: "Often posterior agenesis.",
      },
      {
        dx: "Associated syndrome (Aicardi, Mowat-Wilson, etc.)",
        likelihood: "Minority",
        rationale: "Look for extra-CNS features.",
      },
    ],
    nextSteps:
      "Mid-sagittal MRI for callosal contour; coronal for cingulate sulcus inversion; microarray; whole-exome where feasible.",
    limitations: "Pattern recognition; depends on imaging plane and quality.",
    primary: {
      label: "SMFM 2020",
      full: "SMFM. Absent cavum septi pellucidi.",
      url: "https://www.ajog.org/article/S0002-9378(20)31109-1/fulltext",
    },
    match: ({ values, zs }) => {
      const csp = values.csp_width;
      const v = values.cc_length;
      if (csp == null || csp >= 1) return null;
      const zr = zs.cc_length;
      if (v == null || zr == null) return null;
      const maxAtrium = Math.max(
        values.atrial_left ?? -Infinity,
        values.atrial_right ?? -Infinity
      );
      const microZ = Math.min(
        zs.brain_bpd?.z ?? Infinity,
        zs.skull_bpd?.z ?? Infinity
      );
      if (
        Number.isFinite(maxAtrium) &&
        maxAtrium >= 15 &&
        Number.isFinite(microZ) &&
        microZ < -1.8807936081512509
      )
        return null;
      if (!(zr.z < -1.6448536269514722 || v < 5)) return null;
      return {
        prior: 0.85,
        triggerLabel: `CSP ${fmt1(csp)} + CC ${fmt1(v)} (z ${formatZ(zr.z)})`,
      };
    },
  },
  {
    id: "heterotopia-dd",
    title: "Associated heterotopia / cortical malformation qualitative add-on",
    oneLine:
      "Entered heterotopia or cortical-malformation finding — associated anomaly context.",
    severity: "info",
    impressionLine:
      "Associated heterotopia / cortical malformation qualitative add-on; include in counselling as an associated CNS anomaly.",
    impressionPriority: 6,
    summary:
      "Heterotopia cannot be inferred from linear biometry, but the entered qualitative finding changes associated-anomaly counselling in ACC and ventriculomegaly cases.",
    rows: [
      {
        dx: "Gray matter heterotopia",
        likelihood: "Entered qualitative finding",
        rationale:
          "Tang 2009 reports heterotopia among associated fetal ACC abnormalities.",
      },
      {
        dx: "Broader malformation of cortical development",
        likelihood: "Associated differential",
        rationale:
          "Review the cortical mantle and sulcation pattern when heterotopia is suspected.",
      },
    ],
    nextSteps:
      "Document the qualitative cortical finding, review fetal MRI planes for additional cortical malformations, and include the association in genetics counselling.",
    limitations:
      "Qualitative add-on only; the calculator does not infer heterotopia from biometric measurements.",
    primary: {
      label: "Tang 2009",
      full: "Tang PH, Bartha AI, Norton ME, Barkovich AJ, Sherr EH, Glenn OA. Agenesis of the corpus callosum: an MR imaging analysis of associated abnormalities in the fetus. AJNR Am J Neuroradiol. 2009;30(2):257-263.",
      url: "https://www.ajnr.org/content/30/2/257",
    },
    match: ({ values }) =>
      (values.qualitative_heterotopia_panel ?? 0) > 0
        ? { prior: 0.2, triggerLabel: "entered heterotopia finding" }
        : null,
  },
  {
    id: "interhemispheric-cyst-dd",
    title: "Interhemispheric cyst qualitative add-on",
    oneLine:
      "Entered interhemispheric cyst finding — associated ACC anomaly context.",
    severity: "info",
    impressionLine:
      "Interhemispheric cyst qualitative add-on; include in associated-anomaly counselling for agenesis of the corpus callosum.",
    impressionPriority: 6,
    summary:
      "Interhemispheric cysts are qualitative imaging findings that can accompany complete agenesis of the corpus callosum and severe ventriculomegaly.",
    rows: [
      {
        dx: "ACC-associated interhemispheric cyst",
        likelihood: "Entered qualitative finding",
        rationale:
          "Tang 2009 includes interhemispheric cysts among fetal ACC-associated abnormalities.",
      },
      {
        dx: "Other midline cystic lesion",
        likelihood: "Differential consideration",
        rationale:
          "Correlate with communication pattern, corpus callosum anatomy, and ventricular morphology.",
      },
    ],
    nextSteps:
      "Document cyst location and communication, review corpus callosum and cortical mantle, and include the finding in genetics counselling.",
    limitations:
      "Qualitative add-on only; the calculator does not infer cyst type from biometric measurements.",
    primary: {
      label: "Tang 2009",
      full: "Tang PH, Bartha AI, Norton ME, Barkovich AJ, Sherr EH, Glenn OA. Agenesis of the corpus callosum: an MR imaging analysis of associated abnormalities in the fetus. AJNR Am J Neuroradiol. 2009;30(2):257-263.",
      url: "https://www.ajnr.org/content/30/2/257",
    },
    match: ({ values }) =>
      (values.qualitative_interhemispheric_cyst_panel ?? 0) > 0
        ? { prior: 0.2, triggerLabel: "entered interhemispheric cyst" }
        : null,
  },
  {
    id: "dwm-pattern",
    title: "Dandy-Walker malformation pattern",
    oneLine: "Small vermis + elevated TVA — DWM pattern.",
    severity: "urgent",
    relatedParamIds: ["vermis_cc", "vermis_ap"],
    impressionLine:
      "Dandy-Walker spectrum with elevated tegmento-vermian angle; recommend posterior-fossa-focused MRI review and genetic counselling.",
    impressionPriority: 85,
    summary:
      "Small vermis with elevated tegmento-vermian angle is suggestive of the Dandy-Walker spectrum.",
    rows: [
      {
        dx: "Dandy-Walker malformation",
        likelihood: "Most common",
        rationale: "Classic posterior-fossa anomaly.",
      },
      {
        dx: "Vermian hypoplasia (non-DWM)",
        likelihood: "Minority",
        rationale: "Without 4th-ventricle cyst.",
      },
      {
        dx: "Blake's pouch remnant",
        likelihood: "Minority",
        rationale: "Differentiated by 4th-ventricle communication.",
      },
    ],
    nextSteps:
      "Detailed fetal MRI of posterior fossa; assess tegmento-vermian angle; chromosomal microarray.",
    limitations: "Vermian rotation can mimic hypoplasia.",
    primary: S_VATANSEVER,
    match: ({ zs, values }) => {
      const vermis = lowestEnteredVermisAxis(values, zs);
      const tva = values.tva;
      if (vermis == null || vermis.zr.z >= -1.6448536269514722) return null;
      const tcdSmall = lowestTcdZ(zs) < -1.6448536269514722;
      const ponsSmall = (zs.pons_ap?.z ?? Infinity) < -1.6448536269514722;
      const thirdVentricularSupport =
        tva == null &&
        (values.third_ventricle ?? -Infinity) > 3.5 &&
        tcdSmall &&
        ponsSmall;
      const hasPosteriorFossaSupport =
        (tva != null && tva >= 60) ||
        (tva != null && tva >= 35 && tcdSmall && ponsSmall) ||
        thirdVentricularSupport;
      if (!hasPosteriorFossaSupport) return null;
      return {
        prior: 0.75,
        triggerLabel: thirdVentricularSupport
          ? `${vermis.label} (z ${formatZ(vermis.zr.z)}) + third ventricle ${fmt1(values.third_ventricle)} mm + small TCD/pons`
          : `${vermis.label} (z ${formatZ(vermis.zr.z)}) + TVA ${fmt1(tva)} degrees`,
      };
    },
  },
  {
    id: "blakes-pouch-dd",
    title: "Blake's pouch cyst differential",
    oneLine: "Elevated TVA with normal vermis size — Blake's pouch advisory.",
    severity: "info",
    impressionLine:
      "Blake's pouch cyst differential: elevated TVA with normal vermis size; generally favorable prognosis, but confirm vermian formation and fourth-ventricle communication.",
    impressionPriority: 7,
    summary:
      "The qualitative elevated-TVA and normal-vermis entry supports a Blake's pouch cyst / persistent Blake's pouch advisory rather than a Dandy-Walker call.",
    rows: [
      {
        dx: "Persistent Blake's pouch cyst",
        likelihood: "Favored when vermis is normal",
        rationale:
          "Mild TVA elevation with normal vermian size is the classic benign-remnant pattern.",
      },
      {
        dx: "Mega cisterna magna",
        likelihood: "Overlap differential",
        rationale:
          "Correlate with cisterna magna depth and absence of posterior-fossa mass effect.",
      },
      {
        dx: "Dandy-Walker spectrum",
        likelihood: "Less likely if vermis normal",
        rationale:
          "Dandy-Walker requires abnormal vermian development or rotation beyond an isolated advisory toggle.",
      },
    ],
    nextSteps:
      "Confirm normal vermian size and morphology, review fourth-ventricle communication, and correlate with cisterna magna depth.",
    limitations:
      "Advisory qualitative card; TVA alone remains insufficient for a Dandy-Walker diagnosis without supporting posterior-fossa findings.",
    primary: {
      label: "Pinto 2016",
      full: "Pinto J, Paladini D, Marrocco G, et al. Persistent Blake's pouch cyst: prenatal diagnosis, fetal MRI, and outcome. Childs Nerv Syst. 2016;32(2):311-318.",
      url: "https://doi.org/10.1007/s00381-015-2901-5",
    },
    match: ({ values, zs }) => {
      if ((values.qualitative_blakes_pouch_panel ?? 0) <= 0) return null;
      const tva = values.tva;
      if (tva != null && tva <= 23) return null;
      const vermis = lowestEnteredVermisAxis(values, zs);
      if (vermis && vermis.zr.z < -1.6448536269514722) return null;
      return {
        prior: 0.35,
        triggerLabel:
          tva == null
            ? "qualitative elevated TVA + normal vermis"
            : `TVA ${fmt1(tva)} degrees + normal vermis`,
      };
    },
  },
  {
    id: "mega-cisterna-magna",
    title: "Mega cisterna magna / Blake's pouch cyst differential",
    oneLine: "Cisterna magna depth >10 mm — posterior-fossa cystic variant.",
    severity: "watch",
    impressionLine:
      "Isolated mega cisterna magna with persistent Blake's pouch — likely benign normal variant.",
    impressionPriority: 8,
    summary:
      "A cisterna magna depth above 10 mm raises the differential of isolated mega cisterna magna, persistent Blake's pouch cyst, and arachnoid cyst.",
    rows: [
      {
        dx: "Isolated mega cisterna magna",
        likelihood: "Most common if vermis normal",
        rationale: "Often benign when vermis, TVA, and brainstem are normal.",
      },
      {
        dx: "Persistent Blake's pouch cyst",
        likelihood: "Common differential",
        rationale:
          "Correlate with vermian rotation and fourth-ventricle outlet.",
      },
      {
        dx: "Posterior-fossa arachnoid cyst",
        likelihood: "Less common",
        rationale: "Look for mass effect and communication pattern.",
      },
    ],
    nextSteps:
      "Review vermian size and rotation, fourth-ventricle communication, and posterior-fossa mass effect.",
    limitations:
      "Raw depth threshold requires imaging-plane correlation and does not replace posterior-fossa morphology review.",
    primary: {
      label: "Gafner 2022",
      full: "Gafner M, Yagel I, Fried S, Ezra O, Bar-Yosef O, Katorza E. Fetal brain biometry in isolated mega cisterna magna: MRI and US study. J Matern Fetal Neonatal Med. 2022;35(21):4199-4207. doi:10.1080/14767058.2020.1849094.",
      url: "https://doi.org/10.1080/14767058.2020.1849094",
    },
    match: ({ values }) => {
      const depth = values.cisterna_magna_depth;
      if (depth == null || depth <= 10) return null;
      return {
        prior: 0.4,
        triggerLabel: `cisterna magna depth ${fmt1(depth)} mm`,
      };
    },
  },
  {
    id: "pch-pattern",
    title: "Pontocerebellar hypoplasia pattern",
    oneLine: "Small pons + small cerebellum or vermis — PCH spectrum likely.",
    severity: "urgent",
    relatedParamIds: ["pons_ap", "tcd", "vermis_cc", "vermis_ap"],
    summary:
      "Concurrent small pons with small cerebellum or vermis strongly suggests pontocerebellar hypoplasia (PCH).",
    rows: [
      {
        dx: "PCH Type 2 (TSEN54-related)",
        likelihood: "Most common",
        rationale: "Most common subtype.",
      },
      {
        dx: "PCH Type 1",
        likelihood: "Minority",
        rationale: "Associated motor neuronopathy.",
      },
      {
        dx: "Other PCH (3–11) / CASK / tubulinopathy",
        likelihood: "Minority",
        rationale: "Genetic panel needed.",
      },
      {
        dx: "Acquired (CMV)",
        likelihood: "Rare",
        rationale: "Distinct calcifications and microcephaly.",
      },
    ],
    nextSteps:
      "Targeted gene panel (TSEN54, RARS2, EXOSC3, CASK, tubulinopathies), CMV screening, genetic counselling.",
    limitations: "Phenotype overlaps; molecular diagnosis essential.",
    primary: {
      label: "van Dijk 2018",
      full: "van Dijk T, et al. Orphanet J Rare Dis. 2018;13:92.",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6003036/",
    },
    match: ({ zs, values }) => {
      const zp = zs.pons_ap?.z;
      const zt = zs.tcd?.z;
      const vermis = lowestEnteredVermisAxis(values, zs);
      const tcdSmall = zt != null && zt < -1.6448536269514722;
      const vermisSmall = vermis != null && vermis.zr.z < -1.6448536269514722;
      if (zp == null) return null;
      if (!(zp < -1.6448536269514722 && (tcdSmall || vermisSmall))) return null;
      const supportLabels = [
        tcdSmall && zt != null ? `TCD z ${formatZ(zt)}` : null,
        vermisSmall && vermis != null
          ? `${vermis.label} z ${formatZ(vermis.zr.z)}`
          : null,
      ].filter((label): label is string => label != null);
      return {
        prior: 0.85,
        triggerLabel: `Pons z ${formatZ(zp)} + ${supportLabels.join(" + ")}`,
      };
    },
  },
];

export const DIFFERENTIAL_CARD_IDS = CARDS.map(card => card.id);

/* ---------- Boost rules (multiplier on score when both fire) ---------- */

const BOOSTS: {
  when: string;
  affects: string;
  mult: number;
  reason: string;
}[] = [
  // ACC pattern raises CC findings, lowers any mild VM (it is explained).
  {
    when: "acc-pattern",
    affects: "cc-absent",
    mult: 1.15,
    reason: "Composite pattern reinforces complete ACC.",
  },
  {
    when: "acc-pattern",
    affects: "cc-short",
    mult: 1.1,
    reason: "Composite pattern reinforces dysgenetic CC.",
  },
  {
    when: "acc-pattern",
    affects: "mild-vm",
    mult: 0.6,
    reason: "Mild VM is often explained by ACC.",
  },
  // HPE pattern raises absent-CSP card.
  {
    when: "hpe-pattern",
    affects: "absent-csp",
    mult: 1.1,
    reason: "HPE reinforces absent CSP.",
  },
  // Hydrocephalus pattern raises severe-VM and third-V cards.
  {
    when: "hydrocephalus-pattern",
    affects: "severe-vm",
    mult: 1.05,
    reason: "Triventricular pattern reinforces severe VM.",
  },
  {
    when: "hydrocephalus-pattern",
    affects: "third-v-wide",
    mult: 1.1,
    reason: "Triventricular pattern reinforces 3rd-V dilatation.",
  },
  // Macrocephaly pattern: if VM also fires, hydrocephalus is more likely cause of macrocephaly.
  {
    when: "severe-vm",
    affects: "macrocephaly",
    mult: 1.1,
    reason: "Macrocephaly may be hydrocephalus-driven.",
  },
  // PCH pattern raises small-pons and its posterior-fossa support cards.
  {
    when: "pch-pattern",
    affects: "pons-small",
    mult: 1.1,
    reason: "Combined finding reinforces PCH spectrum.",
  },
  {
    when: "pch-pattern",
    affects: "tcd-small",
    mult: 1.1,
    reason: "Combined finding reinforces PCH spectrum.",
  },
  {
    when: "pch-pattern",
    affects: "vermis-small",
    mult: 1.1,
    reason: "Combined finding reinforces PCH spectrum.",
  },
  {
    when: "res-pattern",
    affects: "tcd-small",
    mult: 1.1,
    reason: "Absent primary fissure reinforces RES pattern.",
  },
  // DWM pattern raises vermis-small.
  {
    when: "dwm-pattern",
    affects: "vermis-small",
    mult: 1.1,
    reason: "Combined finding reinforces DWM spectrum.",
  },
];

/* ---------- Engine ---------- */

export function evaluateAll(
  values: Record<string, number | null>,
  ga: GA
): {
  zs: Record<string, ZResult | null>;
  dxs: Differential[];
} {
  const zs: Record<string, ZResult | null> = {};
  for (const p of PARAMETERS_ALL) {
    const v = values[p.id];
    zs[p.id] = v == null ? null : zscore(p, ga, v);
  }
  const input: EngineInput = { values, zs };

  // Pass 1: collect firing cards with their priors.
  const fired = new Map<string, Differential>();
  for (const c of CARDS) {
    const r = c.match(input);
    if (!r) continue;
    const sourceDisagreements = (c.relatedParamIds ?? []).flatMap(id => {
      const zr = zs[id];
      if (zr?.agreementState !== "disagree" || zr.disagreementWidth == null) {
        return [];
      }
      const parameter = PARAMETERS_ALL.find(p => p.id === id);
      if (!parameter) return [];
      return [
        {
          parameterId: id,
          parameterName: parameter.name,
          disagreementWidth: zr.disagreementWidth,
        },
      ];
    });
    fired.set(c.id, {
      id: c.id,
      title: c.title,
      oneLine: c.oneLine,
      severity: c.severity,
      impressionLine: r.impressionLine ?? c.impressionLine,
      impressionPriority: c.impressionPriority,
      summary: c.summary,
      rows: c.rows,
      nextSteps: c.nextSteps,
      limitations: c.limitations,
      primary: c.primary,
      secondary: c.secondary,
      sourceDisagreements:
        sourceDisagreements.length > 0 ? sourceDisagreements : undefined,
      triggerLabel: r.triggerLabel,
      rank: r.prior,
    });
  }

  // Pass 2: apply boost multipliers.
  for (const b of BOOSTS) {
    if (!fired.has(b.when)) continue;
    const target = fired.get(b.affects);
    if (!target) continue;
    target.rank *= b.mult;
  }

  // Sort by descending rank, breaking ties by severity weight.
  const SEVERITY_RANK: Record<Differential["severity"], number> = {
    urgent: 4,
    concern: 3,
    watch: 2,
    info: 1,
  };
  const out = Array.from(fired.values()).sort((a, b) => {
    if (b.rank !== a.rank) return b.rank - a.rank;
    return SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
  });

  return { zs, dxs: out };
}

export const GROUP_ORDER: ParameterGroup[] = [
  "Global brain / skull",
  "Ventricular system",
  "Midline structures",
  "Posterior fossa",
  "Brainstem",
];
