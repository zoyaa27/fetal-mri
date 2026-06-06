import { describe, expect, it } from "vitest";

import {
  computeBinaryValidationMetrics,
  computeDecisionCurve,
  computeAgreementMetrics,
  computeGroupedAgreementMetrics,
  compareQiAuditPhases,
  computeQiAuditSummary,
  computeWilsonScoreInterval,
  computeCohenKappa,
  computeFleissKappa,
  computeIntraclassCorrelation,
  computeReaderStudyCrossoverSummary,
  computeRawNasaTaskLoadIndex,
  computeSystemUsabilityScale,
  computeWelchTwoSampleComparison,
  estimateBinaryProportionSampleSize,
  estimateDiagnosticAccuracyPrecisionSampleSize,
  estimatePairedMeanDifferenceSampleSize,
  summarizeValidationCohortFlow,
} from "./validation-metrics";

describe("publication validation metrics", () => {
  it("computes locked-threshold discrimination, Brier score, and calibration summaries", () => {
    const metrics = computeBinaryValidationMetrics(
      [
        { label: true, probability: 0.9 },
        { label: true, probability: 0.8 },
        { label: false, probability: 0.2 },
        { label: false, probability: 0.1 },
      ],
      { threshold: 0.5 }
    );

    expect(metrics.n).toBe(4);
    expect(metrics.positives).toBe(2);
    expect(metrics.negatives).toBe(2);
    expect(metrics.truePositive).toBe(2);
    expect(metrics.falsePositive).toBe(0);
    expect(metrics.trueNegative).toBe(2);
    expect(metrics.falseNegative).toBe(0);
    expect(metrics.sensitivity).toBe(1);
    expect(metrics.specificity).toBe(1);
    expect(metrics.sensitivityInterval.estimate).toBe(1);
    expect(metrics.sensitivityInterval.lower).toBeLessThan(1);
    expect(metrics.specificityInterval.estimate).toBe(1);
    expect(metrics.accuracyInterval.estimate).toBe(1);
    expect(metrics.brierScore).toBeCloseTo(0.025, 6);
    expect(metrics.rocAuc).toBe(1);
    expect(metrics.rocAucInterval.estimate).toBe(1);
    expect(metrics.rocAucInterval.lower).toBe(1);
    expect(metrics.rocAucInterval.upper).toBe(1);
    expect(metrics.prAuc).toBe(1);
    expect(metrics.observedEventRate).toBe(0.5);
    expect(metrics.meanPredictedRisk).toBe(0.5);
    expect(metrics.calibrationInTheLarge).toBeCloseTo(0, 6);
    expect(Number.isFinite(metrics.calibrationSlope)).toBe(true);
  });

  it("computes Wilson confidence intervals for locked-threshold proportions", () => {
    const interval = computeWilsonScoreInterval(18, 20);

    expect(interval.estimate).toBe(0.9);
    expect(interval.confidenceLevel).toBe(0.95);
    expect(interval.lower).toBeGreaterThan(0.68);
    expect(interval.lower).toBeLessThan(0.7);
    expect(interval.upper).toBeGreaterThan(0.97);
    expect(interval.upper).toBeLessThan(0.99);
  });

  it("estimates diagnostic-accuracy sample sizes from Wilson half-width targets", () => {
    const plan = estimateDiagnosticAccuracyPrecisionSampleSize({
      expectedSensitivity: 0.9,
      expectedSpecificity: 0.85,
      targetHalfWidth: 0.1,
    });

    expect(plan.positiveCases).toBe(62);
    expect(plan.negativeCases).toBe(73);
    expect(plan.totalCasesLowerBound).toBe(135);
    expect(plan.sensitivity.expectedSuccesses).toBe(56);
    expect(plan.sensitivity.halfWidth).toBeLessThanOrEqual(0.1);
    expect(plan.specificity.expectedSuccesses).toBe(62);
    expect(plan.specificity.halfWidth).toBeLessThanOrEqual(0.1);
  });

  it("estimates paired reader-study sample sizes for mean-difference endpoints", () => {
    const plan = estimatePairedMeanDifferenceSampleSize({
      expectedMeanDifference: 45,
      pairedDifferenceStandardDeviation: 90,
      alpha: 0.05,
      power: 0.8,
    });

    expect(plan.sampleSize).toBe(32);
    expect(plan.alpha).toBe(0.05);
    expect(plan.power).toBe(0.8);
    expect(plan.normalApproximation).toBe(true);
  });

  it("computes ROC-AUC confidence intervals for imperfect discrimination", () => {
    const metrics = computeBinaryValidationMetrics(
      [
        { label: true, probability: 0.9 },
        { label: false, probability: 0.8 },
        { label: true, probability: 0.7 },
        { label: false, probability: 0.4 },
      ],
      { threshold: 0.5 }
    );

    expect(metrics.rocAuc).toBe(0.75);
    expect(metrics.rocAucInterval.estimate).toBe(0.75);
    expect(metrics.rocAucInterval.lower).toBeGreaterThan(0.2);
    expect(metrics.rocAucInterval.lower).toBeLessThan(0.21);
    expect(metrics.rocAucInterval.upper).toBe(1);
  });

  it("summarizes validation cohort flow and per-parameter missingness", () => {
    const summary = summarizeValidationCohortFlow([
      {
        caseId: "C1",
        included: true,
        referenceStandardAvailable: true,
        predictionAvailable: true,
        pathologyLabelAvailable: true,
        measurements: { atrium: 10, tcd: 30 },
      },
      {
        caseId: "C2",
        included: true,
        referenceStandardAvailable: false,
        predictionAvailable: true,
        pathologyLabelAvailable: false,
        measurements: { atrium: null, tcd: 31 },
      },
      {
        caseId: "C3",
        included: true,
        referenceStandardAvailable: true,
        predictionAvailable: false,
        measurements: { atrium: 11 },
      },
      {
        caseId: "C4",
        included: false,
        exclusionReason: "motion-degraded",
        referenceStandardAvailable: true,
        predictionAvailable: true,
        pathologyLabelAvailable: true,
        measurements: { atrium: 12, tcd: 29 },
      },
    ]);

    expect(summary.totalCases).toBe(4);
    expect(summary.includedCases).toBe(3);
    expect(summary.excludedCases).toBe(1);
    expect(summary.exclusionReasons).toEqual({ "motion-degraded": 1 });
    expect(summary.referenceStandardAvailable).toBe(2);
    expect(summary.predictionAvailable).toBe(2);
    expect(summary.pathologyLabelAvailable).toBe(1);
    expect(summary.analysisReadyCases).toBe(1);
    expect(summary.missingReferenceStandardCount).toBe(1);
    expect(summary.missingPredictionCount).toBe(1);
    expect(summary.missingPathologyLabelCount).toBe(2);
    expect(summary.parameterMissingness).toEqual([
      {
        parameter: "atrium",
        availableCount: 2,
        missingCount: 1,
        missingRate: 1 / 3,
      },
      {
        parameter: "tcd",
        availableCount: 2,
        missingCount: 1,
        missingRate: 1 / 3,
      },
    ]);
  });

  it("computes decision-curve net benefit against treat-all and treat-none comparators", () => {
    const [point] = computeDecisionCurve(
      [
        { label: true, probability: 0.9 },
        { label: false, probability: 0.8 },
        { label: false, probability: 0.4 },
        { label: true, probability: 0.7 },
      ],
      [0.5]
    );

    expect(point.threshold).toBe(0.5);
    expect(point.truePositive).toBe(2);
    expect(point.falsePositive).toBe(1);
    expect(point.netBenefit).toBeCloseTo(0.25, 6);
    expect(point.treatAllNetBenefit).toBeCloseTo(0, 6);
    expect(point.treatNoneNetBenefit).toBe(0);
  });

  it("rejects invalid validation inputs instead of reporting unstable metrics", () => {
    expect(() =>
      computeBinaryValidationMetrics([{ label: true, probability: 0.8 }])
    ).toThrow("at least one positive and one negative");

    expect(() =>
      computeBinaryValidationMetrics([
        { label: true, probability: 1.2 },
        { label: false, probability: 0.2 },
      ])
    ).toThrow("probability");

    expect(() =>
      computeDecisionCurve(
        [
          { label: true, probability: 0.8 },
          { label: false, probability: 0.2 },
        ],
        [1]
      )
    ).toThrow("threshold");

    expect(() =>
      computeCohenKappa([
        { raterA: "normal", raterB: "normal" },
        { raterA: "normal", raterB: "normal" },
      ])
    ).toThrow("at least two categories");

    expect(() =>
      computeFleissKappa([
        ["normal", "abnormal", "normal"],
        ["normal", "abnormal"],
      ])
    ).toThrow("rectangular matrix");

    expect(() => computeIntraclassCorrelation([[10, 11], [12]])).toThrow(
      "rectangular matrix"
    );

    expect(() =>
      computeReaderStudyCrossoverSummary([
        {
          readerId: "R1",
          studyId: "C1",
          condition: "without_tool",
          durationSec: 500,
          completenessScore: 6,
          zscoreDocumentationRate: 0.4,
        },
      ])
    ).toThrow("incomplete condition pair");

    expect(() =>
      computeReaderStudyCrossoverSummary([
        {
          readerId: "R1",
          studyId: "C1",
          condition: "without_tool",
          durationSec: 500,
          completenessScore: 6,
          zscoreDocumentationRate: 0.4,
        },
        {
          readerId: "R1",
          studyId: "C1",
          condition: "without_tool",
          durationSec: 480,
          completenessScore: 7,
          zscoreDocumentationRate: 0.6,
        },
      ])
    ).toThrow("duplicate without_tool row");

    expect(() =>
      computeRawNasaTaskLoadIndex({
        mentalDemand: 80,
        physicalDemand: 10,
        temporalDemand: 70,
        performance: 20,
        effort: 60,
        frustration: 101,
      })
    ).toThrow("between 0 and 100");

    expect(() =>
      computeSystemUsabilityScale([5, 4, 5, 4, 5, 4, 5, 4, 5])
    ).toThrow("10 Likert items");

    expect(() => computeWelchTwoSampleComparison([1, 1], [2, 3])).toThrow(
      "non-zero variance"
    );

    expect(() =>
      estimateBinaryProportionSampleSize({
        expectedProportion: 1,
        targetHalfWidth: 0.1,
      })
    ).toThrow("expectedProportion");

    expect(() =>
      estimatePairedMeanDifferenceSampleSize({
        expectedMeanDifference: 0,
        pairedDifferenceStandardDeviation: 90,
      })
    ).toThrow("non-zero");

    expect(() =>
      summarizeValidationCohortFlow([
        {
          caseId: "C1",
          included: false,
          referenceStandardAvailable: true,
          predictionAvailable: true,
        },
      ])
    ).toThrow("exclusionReason");

    expect(() =>
      summarizeValidationCohortFlow([
        {
          caseId: "C1",
          included: true,
          referenceStandardAvailable: true,
          predictionAvailable: true,
          measurements: { atrium: Number.NaN },
        },
      ])
    ).toThrow("finite");
  });

  it("computes per-parameter agreement and Bland-Altman summaries", () => {
    const metrics = computeAgreementMetrics([
      { reference: 10, observed: 12 },
      { reference: 20, observed: 18 },
      { reference: 30, observed: 33 },
    ]);

    expect(metrics.n).toBe(3);
    expect(metrics.meanAbsoluteError).toBeCloseTo(7 / 3, 6);
    expect(metrics.meanAbsolutePercentageError).toBeCloseTo(13.333333, 6);
    expect(metrics.bias).toBeCloseTo(1, 6);
    expect(metrics.errorStandardDeviation).toBeCloseTo(Math.sqrt(7), 6);
    expect(metrics.lowerLimitOfAgreement).toBeCloseTo(
      1 - 1.96 * Math.sqrt(7),
      6
    );
    expect(metrics.upperLimitOfAgreement).toBeCloseTo(
      1 + 1.96 * Math.sqrt(7),
      6
    );
  });

  it("groups agreement summaries by FeTA robustness strata", () => {
    const grouped = computeGroupedAgreementMetrics(
      [
        { reference: 10, observed: 11, strata: { site: "Kispi" } },
        { reference: 20, observed: 18, strata: { site: "Kispi" } },
        { reference: 30, observed: 36, strata: { site: "UCSF" } },
      ],
      "site"
    );

    expect(grouped).toHaveLength(2);
    expect(grouped[0].stratum).toBe("Kispi");
    expect(grouped[0].metrics.n).toBe(2);
    expect(grouped[0].metrics.meanAbsoluteError).toBeCloseTo(1.5, 6);
    expect(grouped[1].stratum).toBe("UCSF");
    expect(grouped[1].metrics.meanAbsolutePercentageError).toBeCloseTo(20, 6);
  });

  it("computes SPEC 4.10 pre/post QI report-audit summaries", () => {
    const baseline = computeQiAuditSummary([
      {
        durationSec: 600,
        requiredMeasurementCount: 14,
        documentedMeasurementCount: 9,
        explicitZScoreDocumented: false,
        explicitPercentileDocumented: false,
        recommendationCongruent: false,
      },
      {
        durationSec: 480,
        requiredMeasurementCount: 14,
        documentedMeasurementCount: 14,
        explicitZScoreDocumented: true,
        explicitPercentileDocumented: false,
        recommendationCongruent: true,
      },
    ]);
    const intervention = computeQiAuditSummary([
      {
        durationSec: 360,
        requiredMeasurementCount: 14,
        documentedMeasurementCount: 14,
        explicitZScoreDocumented: true,
        explicitPercentileDocumented: true,
        recommendationCongruent: true,
      },
      {
        durationSec: 300,
        requiredMeasurementCount: 14,
        documentedMeasurementCount: 14,
        explicitZScoreDocumented: true,
        explicitPercentileDocumented: true,
        recommendationCongruent: true,
      },
    ]);
    const comparison = compareQiAuditPhases(baseline, intervention);

    expect(baseline.n).toBe(2);
    expect(baseline.meanDurationSec).toBe(540);
    expect(baseline.allRequiredMeasurementsDocumentedRate).toBe(0.5);
    expect(baseline.meanMeasurementCompletenessRate).toBeCloseTo(23 / 28, 6);
    expect(baseline.explicitZScoreDocumentationRate).toBe(0.5);
    expect(baseline.explicitPercentileDocumentationRate).toBe(0);
    expect(baseline.recommendationCongruenceRate).toBe(0.5);
    expect(intervention.allRequiredMeasurementsDocumentedRate).toBe(1);
    expect(comparison.meanDurationDeltaSec).toBe(-210);
    expect(comparison.allRequiredMeasurementsDocumentedRateDelta).toBe(0.5);
    expect(comparison.explicitZScoreDocumentationRateDelta).toBe(0.5);
    expect(comparison.explicitPercentileDocumentationRateDelta).toBe(1);
    expect(comparison.recommendationCongruenceRateDelta).toBe(0.5);
  });

  it("rejects zero-second QI and reader-study durations before timing analysis", () => {
    expect(() =>
      computeQiAuditSummary([
        {
          durationSec: 0,
          requiredMeasurementCount: 14,
          documentedMeasurementCount: 14,
          explicitZScoreDocumented: true,
          explicitPercentileDocumented: true,
        },
      ])
    ).toThrow("durationSec must be a finite positive value");

    expect(() =>
      computeReaderStudyCrossoverSummary([
        {
          readerId: "R1",
          studyId: "S1",
          condition: "without_tool",
          durationSec: 0,
          completenessScore: 4,
          zscoreDocumentationRate: 0.8,
        },
        {
          readerId: "R1",
          studyId: "S1",
          condition: "with_tool",
          durationSec: 420,
          completenessScore: 5,
          zscoreDocumentationRate: 1,
        },
      ])
    ).toThrow("durationSec must be a finite positive value");
  });

  it("computes paired reader-study crossover deltas by reader and case", () => {
    const summary = computeReaderStudyCrossoverSummary([
      {
        readerId: "R1",
        studyId: "C1",
        condition: "without_tool",
        durationSec: 600,
        completenessScore: 6,
        zscoreDocumentationRate: 0.2,
        recommendationCongruent: false,
      },
      {
        readerId: "R1",
        studyId: "C1",
        condition: "with_tool",
        durationSec: 420,
        completenessScore: 9,
        zscoreDocumentationRate: 1,
        recommendationCongruent: true,
      },
      {
        readerId: "R2",
        studyId: "C1",
        condition: "without_tool",
        durationSec: 540,
        completenessScore: 7,
        zscoreDocumentationRate: 0.4,
        recommendationCongruent: true,
      },
      {
        readerId: "R2",
        studyId: "C1",
        condition: "with_tool",
        durationSec: 390,
        completenessScore: 8,
        zscoreDocumentationRate: 0.8,
        recommendationCongruent: true,
      },
    ]);

    expect(summary.nPairs).toBe(2);
    expect(summary.meanDurationDeltaSec).toBe(-165);
    expect(summary.meanCompletenessScoreDelta).toBe(2);
    expect(summary.meanZScoreDocumentationRateDelta).toBeCloseTo(0.6, 6);
    expect(summary.recommendationCongruenceRateDelta).toBe(0.5);
    expect(summary.durationDeltaInterval).toMatchObject({
      estimate: -165,
      confidenceLevel: 0.95,
    });
    expect(summary.durationDeltaInterval.lower).toBeCloseTo(
      -165 - 12.706205 * 15,
      5
    );
    expect(summary.durationDeltaInterval.upper).toBeCloseTo(
      -165 + 12.706205 * 15,
      5
    );
    expect(summary.completenessScoreDeltaInterval.estimate).toBe(2);
    expect(summary.zscoreDocumentationRateDeltaInterval.estimate).toBeCloseTo(
      0.6,
      6
    );
    expect(summary.pairedDeltas[0]).toMatchObject({
      readerId: "R1",
      studyId: "C1",
      durationDeltaSec: -180,
      completenessScoreDelta: 3,
      zscoreDocumentationRateDelta: 0.8,
      recommendationCongruenceDelta: 1,
    });
  });

  it("computes categorical reader-label reliability with Cohen's kappa", () => {
    const metrics = computeCohenKappa([
      { raterA: "positive", raterB: "positive" },
      { raterA: "positive", raterB: "negative" },
      { raterA: "negative", raterB: "negative" },
      { raterA: "negative", raterB: "negative" },
      { raterA: "positive", raterB: "positive" },
      { raterA: "negative", raterB: "positive" },
    ]);

    expect(metrics.n).toBe(6);
    expect(metrics.categories).toEqual(["negative", "positive"]);
    expect(metrics.observedAgreement).toBeCloseTo(4 / 6, 6);
    expect(metrics.expectedAgreement).toBeCloseTo(0.5, 6);
    expect(metrics.kappa).toBeCloseTo(1 / 3, 6);
  });

  it("computes multi-reader categorical reliability with Fleiss's kappa", () => {
    const metrics = computeFleissKappa([
      ["positive", "positive", "negative"],
      ["positive", "positive", "positive"],
      ["negative", "negative", "negative"],
      ["positive", "negative", "negative"],
    ]);

    expect(metrics.nSubjects).toBe(4);
    expect(metrics.nRaters).toBe(3);
    expect(metrics.categories).toEqual(["negative", "positive"]);
    expect(metrics.meanObservedAgreement).toBeCloseTo(2 / 3, 6);
    expect(metrics.expectedAgreement).toBeCloseTo(0.5, 6);
    expect(metrics.kappa).toBeCloseTo(1 / 3, 6);
    expect(metrics.subjectAgreement).toEqual([1 / 3, 1, 1, 1 / 3]);
  });

  it("computes two-way random absolute-agreement ICC for repeated measurements", () => {
    const metrics = computeIntraclassCorrelation([
      [10, 12],
      [20, 19],
      [30, 31],
    ]);

    expect(metrics.model).toBe("ICC(2,1)");
    expect(metrics.nSubjects).toBe(3);
    expect(metrics.nRaters).toBe(2);
    expect(metrics.icc).toBeCloseTo(190 / 192, 6);
    expect(metrics.meanSquares.rows).toBeCloseTo(191.1666667, 6);
    expect(metrics.meanSquares.error).toBeCloseTo(1.1666667, 6);
  });

  it("computes reader-study usability scores for NASA TLX and SUS", () => {
    const nasaTlx = computeRawNasaTaskLoadIndex({
      mentalDemand: 80,
      physicalDemand: 10,
      temporalDemand: 70,
      performance: 20,
      effort: 60,
      frustration: 40,
    });
    const sus = computeSystemUsabilityScale([5, 1, 5, 1, 4, 2, 5, 1, 4, 2]);

    expect(nasaTlx.rawScore).toBeCloseTo(46.666667, 6);
    expect(nasaTlx.subscales.mentalDemand).toBe(80);
    expect(sus.score).toBe(90);
    expect(sus.itemContributions).toEqual([4, 4, 4, 4, 3, 3, 4, 4, 3, 3]);
  });

  it("compares pathology and neurotypical z-score distributions with Welch statistics", () => {
    const comparison = computeWelchTwoSampleComparison([2, 3, 4], [0, 1, 1]);

    expect(comparison.nA).toBe(3);
    expect(comparison.nB).toBe(3);
    expect(comparison.meanA).toBe(3);
    expect(comparison.meanB).toBeCloseTo(2 / 3, 6);
    expect(comparison.meanDifference).toBeCloseTo(7 / 3, 6);
    expect(comparison.standardError).toBeCloseTo(2 / 3, 6);
    expect(comparison.degreesOfFreedom).toBeCloseTo(3.2, 6);
    expect(comparison.tStatistic).toBeCloseTo(3.5, 6);
    expect(comparison.differenceInterval.lower).toBeGreaterThan(0);
    expect(comparison.significantByConfidenceInterval).toBe(true);
  });
});
