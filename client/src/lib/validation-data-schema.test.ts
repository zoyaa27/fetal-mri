import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  VALIDATION_DATA_FILE_ORDER,
  VALIDATION_DATA_SCHEMAS,
  validateValidationDataExport,
  validateValidationDataRows,
} from "./validation-data-schema";

describe("validation data export schema guard", () => {
  it("keeps runtime schemas aligned with the validation data dictionary", () => {
    const dictionary = readFileSync(
      resolve(process.cwd(), "validation_data_dictionary.md"),
      "utf8"
    );

    expect(VALIDATION_DATA_FILE_ORDER).toEqual([
      "case_log.csv",
      "measurement_rows.csv",
      "diagnostic_labels.csv",
      "reader_study_rows.csv",
      "report_audit_rows.csv",
    ]);

    for (const fileName of VALIDATION_DATA_FILE_ORDER) {
      const schema = VALIDATION_DATA_SCHEMAS[fileName];
      expect(dictionary).toContain(fileName);
      expect(schema.columns.some(column => column.required === "yes")).toBe(
        true
      );
      for (const column of schema.columns) {
        expect(dictionary).toContain(column.name);
      }
    }
  });

  it("accepts minimal valid rows for every export file", () => {
    const rowsByFile = {
      "case_log.csv": [
        {
          study_id: "S1",
          cohort: "institutional",
          site_id: "single_site",
          scanner_vendor: "unknown",
          field_strength_t: 1.5,
          svr_method: "none",
          image_quality_tier: "diagnostic",
          ga_weeks: 28,
          ga_days: 0,
          included: true,
          reference_standard_available: true,
          prediction_available: true,
          pathology_label_available: true,
        },
      ],
      "measurement_rows.csv": [
        {
          study_id: "S1",
          parameter_id: "tcd",
          source_role: "reference",
          value_mm: 32,
          measurement_available: true,
          image_quality_tier: "diagnostic",
        },
      ],
      "diagnostic_labels.csv": [
        {
          study_id: "S1",
          trigger_id: "mild-vm",
          reference_label: false,
          predicted_label: false,
          threshold: 0.5,
          indeterminate: false,
        },
      ],
      "reader_study_rows.csv": [
        {
          reader_id: "R1",
          study_id: "S1",
          condition: "without_tool",
          read_order: 1,
          washout_days: 14,
          duration_sec: 300,
          completeness_score: 0.8,
          zscore_documentation_rate: 0.75,
          recommendation_congruent: true,
        },
      ],
      "report_audit_rows.csv": [
        {
          report_id: "P1",
          study_id: "S1",
          phase: "baseline",
          duration_sec: 600,
          required_measurement_count: 8,
          documented_measurement_count: 6,
          explicit_zscore_documented: false,
          explicit_percentile_documented: false,
        },
      ],
    } as const;

    for (const [fileName, rows] of Object.entries(rowsByFile)) {
      expect(validateValidationDataRows(fileName, rows)).toEqual([]);
    }
  });

  it("rejects missing required fields before metrics are computed", () => {
    expect(
      validateValidationDataRows("case_log.csv", [
        {
          study_id: "",
          cohort: "institutional",
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "case_log.csv row 1 missing required field study_id",
        "case_log.csv row 1 missing required field site_id",
        "case_log.csv row 1 missing required field ga_weeks",
      ])
    );

    expect(
      validateValidationDataRows("measurement_rows.csv", [
        {
          study_id: "S1",
          source_role: "reference",
        },
      ])
    ).toContain(
      "measurement_rows.csv row 1 missing required field parameter_id"
    );
  });

  it("rejects conditional, enum, and numeric export errors before analysis", () => {
    expect(
      validateValidationDataRows("case_log.csv", [
        {
          study_id: "S1",
          cohort: "institutional",
          site_id: "single_site",
          scanner_vendor: "unknown",
          field_strength_t: "not-a-number",
          svr_method: "none",
          image_quality_tier: "diagnostic",
          ga_weeks: 28,
          ga_days: 0,
          included: false,
          reference_standard_available: true,
          prediction_available: true,
          pathology_label_available: true,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "case_log.csv row 1 requires exclusion_reason when included is false",
        "case_log.csv row 1 field field_strength_t must be finite",
      ])
    );

    expect(
      validateValidationDataRows("measurement_rows.csv", [
        {
          study_id: "S1",
          parameter_id: "tcd",
          source_role: "reference",
          measurement_available: true,
          image_quality_tier: "diagnostic",
        },
        {
          study_id: "S2",
          parameter_id: "tcd",
          source_role: "reference",
          measurement_available: false,
          image_quality_tier: "diagnostic",
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "measurement_rows.csv row 1 requires value_mm or value_deg when measurement_available is true",
        "measurement_rows.csv row 2 requires missing_reason when measurement_available is false",
      ])
    );

    expect(
      validateValidationDataRows("diagnostic_labels.csv", [
        {
          study_id: "S1",
          trigger_id: "mild-vm",
          reference_label: false,
          predicted_label: false,
          threshold: 0.5,
          indeterminate: true,
        },
      ])
    ).toContain(
      "diagnostic_labels.csv row 1 requires indeterminate_reason when indeterminate is true"
    );

    expect(
      validateValidationDataRows("reader_study_rows.csv", [
        {
          reader_id: "R1",
          study_id: "S1",
          condition: "tool",
          read_order: 1,
          washout_days: 14,
          duration_sec: 300,
          completeness_score: 0.8,
          zscore_documentation_rate: 0.75,
          recommendation_congruent: true,
        },
      ])
    ).toContain(
      "reader_study_rows.csv row 1 field condition must be one of without_tool, with_tool"
    );

    expect(
      validateValidationDataRows("report_audit_rows.csv", [
        {
          report_id: "P1",
          study_id: "S1",
          phase: "pilot",
          duration_sec: 600,
          required_measurement_count: 8,
          documented_measurement_count: 6,
          explicit_zscore_documented: false,
          explicit_percentile_documented: false,
        },
      ])
    ).toContain(
      "report_audit_rows.csv row 1 field phase must be one of baseline, post_tool"
    );
  });

  it("rejects included case-log rows that still carry an exclusion reason", () => {
    expect(
      validateValidationDataRows("case_log.csv", [
        {
          study_id: "S1",
          cohort: "institutional",
          site_id: "single_site",
          scanner_vendor: "unknown",
          field_strength_t: 1.5,
          svr_method: "none",
          image_quality_tier: "diagnostic",
          ga_weeks: 28,
          ga_days: 0,
          included: true,
          exclusion_reason: "motion-degraded",
          reference_standard_available: true,
          prediction_available: true,
          pathology_label_available: true,
        },
      ])
    ).toContain(
      "case_log.csv row 1 must not include exclusion_reason when included is true"
    );
  });

  it("rejects out-of-range validation export values before analysis", () => {
    expect(
      validateValidationDataRows("case_log.csv", [
        {
          study_id: "S1",
          cohort: "institutional",
          site_id: "single_site",
          scanner_vendor: "unknown",
          field_strength_t: 1.5,
          svr_method: "none",
          image_quality_tier: "diagnostic",
          ga_weeks: 28,
          ga_days: 8,
          included: true,
          reference_standard_available: true,
          prediction_available: true,
          pathology_label_available: true,
        },
      ])
    ).toContain("case_log.csv row 1 field ga_days must be between 0 and 6");

    expect(
      validateValidationDataRows("diagnostic_labels.csv", [
        {
          study_id: "S1",
          trigger_id: "mild-vm",
          reference_label: false,
          predicted_label: true,
          predicted_probability: 1.2,
          threshold: -0.1,
          indeterminate: false,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "diagnostic_labels.csv row 1 field predicted_probability must be between 0 and 1",
        "diagnostic_labels.csv row 1 field threshold must be between 0 and 1",
      ])
    );

    expect(
      validateValidationDataRows("diagnostic_labels.csv", [
        {
          study_id: "S1",
          trigger_id: "mild-vm",
          reference_label: false,
          predicted_label: false,
          predicted_probability: 0.8,
          threshold: 0.5,
          indeterminate: false,
        },
        {
          study_id: "S2",
          trigger_id: "severe-vm",
          reference_label: false,
          predicted_label: true,
          predicted_probability: 0.2,
          threshold: 0.5,
          indeterminate: false,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "diagnostic_labels.csv row 1 predicted_label false does not match predicted_probability 0.8 at threshold 0.5; expected true",
        "diagnostic_labels.csv row 2 predicted_label true does not match predicted_probability 0.2 at threshold 0.5; expected false",
      ])
    );

    expect(
      validateValidationDataRows("diagnostic_labels.csv", [
        {
          study_id: "S1",
          trigger_id: "mild-vm",
          reference_label: false,
          predicted_label: true,
          predicted_probability: 0,
          threshold: 0,
          indeterminate: false,
        },
        {
          study_id: "S2",
          trigger_id: "severe-vm",
          reference_label: false,
          predicted_label: false,
          predicted_probability: 1,
          threshold: 1,
          indeterminate: false,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "diagnostic_labels.csv row 1 field threshold must be greater than 0 and less than 1",
        "diagnostic_labels.csv row 2 field threshold must be greater than 0 and less than 1",
      ])
    );

    expect(
      validateValidationDataRows("reader_study_rows.csv", [
        {
          reader_id: "R1",
          study_id: "S1",
          condition: "with_tool",
          read_order: 1,
          washout_days: 14,
          duration_sec: 300,
          completeness_score: 0.8,
          zscore_documentation_rate: 1.2,
          recommendation_congruent: true,
          nasa_tlx_frustration: 101,
          sus_item_1: 0,
          sus_item_10: 6,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "reader_study_rows.csv row 1 field zscore_documentation_rate must be between 0 and 1",
        "reader_study_rows.csv row 1 field nasa_tlx_frustration must be between 0 and 100",
        "reader_study_rows.csv row 1 field sus_item_1 must be between 1 and 5",
        "reader_study_rows.csv row 1 field sus_item_10 must be between 1 and 5",
      ])
    );
  });

  it("rejects nonpositive case-log scanner field strengths", () => {
    expect(
      validateValidationDataRows("case_log.csv", [
        {
          study_id: "S1",
          cohort: "institutional",
          site_id: "single_site",
          scanner_vendor: "unknown",
          field_strength_t: 0,
          svr_method: "none",
          image_quality_tier: "diagnostic",
          ga_weeks: 28,
          ga_days: 0,
          included: true,
          reference_standard_available: true,
          prediction_available: true,
          pathology_label_available: true,
        },
      ])
    ).toContain(
      "case_log.csv row 1 field field_strength_t must be greater than 0"
    );
  });

  it("rejects nonpositive measurement values before agreement analysis", () => {
    expect(
      validateValidationDataRows("measurement_rows.csv", [
        {
          study_id: "S1",
          parameter_id: "tcd",
          source_role: "reference",
          value_mm: 0,
          measurement_available: true,
          image_quality_tier: "diagnostic",
        },
        {
          study_id: "S2",
          parameter_id: "csa",
          source_role: "reference",
          value_deg: -4,
          measurement_available: true,
          image_quality_tier: "diagnostic",
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "measurement_rows.csv row 1 field value_mm must be greater than 0",
        "measurement_rows.csv row 2 field value_deg must be greater than 0",
      ])
    );
  });

  it("rejects available measurement rows that carry a missing_reason", () => {
    expect(
      validateValidationDataRows("measurement_rows.csv", [
        {
          study_id: "S1",
          parameter_id: "tcd",
          source_role: "reference",
          value_mm: 32,
          measurement_available: true,
          missing_reason: "motion-degraded",
          image_quality_tier: "diagnostic",
        },
      ])
    ).toContain(
      "measurement_rows.csv row 1 must not include missing_reason when measurement_available is true"
    );
  });

  it("rejects case-log gestational age weeks outside the calculator-supported range", () => {
    expect(
      validateValidationDataRows("case_log.csv", [
        {
          study_id: "S1",
          cohort: "institutional",
          site_id: "single_site",
          scanner_vendor: "unknown",
          field_strength_t: 1.5,
          svr_method: "none",
          image_quality_tier: "diagnostic",
          ga_weeks: 17,
          ga_days: 6,
          included: true,
          reference_standard_available: true,
          prediction_available: true,
          pathology_label_available: true,
        },
        {
          study_id: "S2",
          cohort: "institutional",
          site_id: "single_site",
          scanner_vendor: "unknown",
          field_strength_t: 1.5,
          svr_method: "none",
          image_quality_tier: "diagnostic",
          ga_weeks: 41,
          ga_days: 0,
          included: true,
          reference_standard_available: true,
          prediction_available: true,
          pathology_label_available: true,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "case_log.csv row 1 field ga_weeks must be between 18 and 40",
        "case_log.csv row 2 field ga_weeks must be between 18 and 40",
      ])
    );
  });

  it("rejects reader-study washouts shorter than the locked two-week interval", () => {
    expect(
      validateValidationDataRows("reader_study_rows.csv", [
        {
          reader_id: "R1",
          study_id: "S1",
          condition: "with_tool",
          read_order: 2,
          washout_days: 7,
          duration_sec: 240,
          completeness_score: 0.95,
          zscore_documentation_rate: 1,
          recommendation_congruent: true,
        },
      ])
    ).toContain(
      "reader_study_rows.csv row 1 field washout_days must be greater than or equal to 14"
    );
  });

  it("rejects zero-second reader-study and report-audit durations before timing analysis", () => {
    expect(
      validateValidationDataRows("reader_study_rows.csv", [
        {
          reader_id: "R1",
          study_id: "S1",
          condition: "with_tool",
          read_order: 2,
          washout_days: 14,
          duration_sec: 0,
          completeness_score: 0.95,
          zscore_documentation_rate: 1,
          recommendation_congruent: true,
        },
      ])
    ).toContain(
      "reader_study_rows.csv row 1 field duration_sec must be greater than 0"
    );

    expect(
      validateValidationDataRows("report_audit_rows.csv", [
        {
          report_id: "P1",
          study_id: "S1",
          phase: "post_tool",
          duration_sec: 0,
          required_measurement_count: 8,
          documented_measurement_count: 8,
          explicit_zscore_documented: true,
          explicit_percentile_documented: true,
        },
      ])
    ).toContain(
      "report_audit_rows.csv row 1 field duration_sec must be greater than 0"
    );
  });

  it("rejects negative reader-study completeness scores before paired analysis", () => {
    expect(
      validateValidationDataRows("reader_study_rows.csv", [
        {
          reader_id: "R1",
          study_id: "S1",
          condition: "with_tool",
          read_order: 2,
          washout_days: 14,
          duration_sec: 240,
          completeness_score: -1,
          zscore_documentation_rate: 1,
          recommendation_congruent: true,
        },
      ])
    ).toContain(
      "reader_study_rows.csv row 1 field completeness_score must be greater than or equal to 0"
    );
  });

  it("rejects invalid boolean tokens and allows blank recommendation congruence when not applicable", () => {
    expect(
      validateValidationDataRows("case_log.csv", [
        {
          study_id: "S1",
          cohort: "institutional",
          site_id: "single_site",
          scanner_vendor: "unknown",
          field_strength_t: 1.5,
          svr_method: "none",
          image_quality_tier: "diagnostic",
          ga_weeks: 28,
          ga_days: 0,
          included: "yes",
          reference_standard_available: "unknown",
          prediction_available: "no",
          pathology_label_available: true,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "case_log.csv row 1 field included must be one of true, false",
        "case_log.csv row 1 field reference_standard_available must be one of true, false",
        "case_log.csv row 1 field prediction_available must be one of true, false",
      ])
    );

    expect(
      validateValidationDataRows("diagnostic_labels.csv", [
        {
          study_id: "S1",
          trigger_id: "mild-vm",
          reference_label: "positive",
          predicted_label: "negative",
          threshold: 0.5,
          indeterminate: "no",
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "diagnostic_labels.csv row 1 field reference_label must be one of true, false",
        "diagnostic_labels.csv row 1 field predicted_label must be one of true, false",
        "diagnostic_labels.csv row 1 field indeterminate must be one of true, false",
      ])
    );

    expect(
      validateValidationDataRows("reader_study_rows.csv", [
        {
          reader_id: "R1",
          study_id: "S1",
          condition: "without_tool",
          read_order: 1,
          washout_days: 14,
          duration_sec: 300,
          completeness_score: 0.8,
          zscore_documentation_rate: 0.75,
        },
      ])
    ).toEqual([]);
  });

  it("rejects partial reader-study usability instruments before scoring", () => {
    expect(
      validateValidationDataRows("reader_study_rows.csv", [
        {
          reader_id: "R1",
          study_id: "S1",
          condition: "with_tool",
          read_order: 1,
          washout_days: 14,
          duration_sec: 300,
          completeness_score: 0.8,
          zscore_documentation_rate: 0.75,
          nasa_tlx_mental_demand: 80,
          sus_item_1: 5,
          sus_item_10: 4,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "reader_study_rows.csv row 1 requires nasa_tlx_physical_demand when any NASA Task Load Index field is present",
        "reader_study_rows.csv row 1 requires nasa_tlx_frustration when any NASA Task Load Index field is present",
        "reader_study_rows.csv row 1 requires sus_item_2 when any System Usability Scale field is present",
        "reader_study_rows.csv row 1 requires sus_item_9 when any System Usability Scale field is present",
      ])
    );
  });

  it("rejects System Usability Scale fields on without-tool reader-study rows", () => {
    expect(
      validateValidationDataRows("reader_study_rows.csv", [
        {
          reader_id: "R1",
          study_id: "S1",
          condition: "without_tool",
          read_order: 1,
          washout_days: 14,
          duration_sec: 300,
          completeness_score: 0.8,
          zscore_documentation_rate: 0.75,
          sus_item_1: 5,
          sus_item_2: 4,
          sus_item_3: 5,
          sus_item_4: 4,
          sus_item_5: 5,
          sus_item_6: 4,
          sus_item_7: 5,
          sus_item_8: 4,
          sus_item_9: 5,
          sus_item_10: 4,
        },
      ])
    ).toContain(
      "reader_study_rows.csv row 1 must not include System Usability Scale fields unless condition is with_tool"
    );
  });

  it("rejects ambiguous measurement value columns before agreement analysis", () => {
    expect(
      validateValidationDataRows("measurement_rows.csv", [
        {
          study_id: "S1",
          parameter_id: "tcd",
          source_role: "reference",
          value_mm: 32,
          value_deg: 12,
          measurement_available: true,
          image_quality_tier: "diagnostic",
        },
        {
          study_id: "S2",
          parameter_id: "tcd",
          source_role: "reference",
          value_mm: 31,
          measurement_available: false,
          missing_reason: "motion-degraded",
          image_quality_tier: "motion_limited",
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "measurement_rows.csv row 1 requires exactly one of value_mm or value_deg when measurement_available is true",
        "measurement_rows.csv row 2 must not include value_mm or value_deg when measurement_available is false",
      ])
    );
  });

  it("rejects measurement value columns that do not match the runtime parameter unit", () => {
    expect(
      validateValidationDataRows("measurement_rows.csv", [
        {
          study_id: "S1",
          parameter_id: "tcd",
          source_role: "reference",
          value_deg: 32,
          measurement_available: true,
          image_quality_tier: "diagnostic",
        },
        {
          study_id: "S2",
          parameter_id: "csa",
          source_role: "reference",
          value_mm: 62,
          measurement_available: true,
          image_quality_tier: "diagnostic",
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "measurement_rows.csv row 1 field value_deg is not allowed for millimetre parameter tcd",
        "measurement_rows.csv row 2 field value_mm is not allowed for degree parameter csa",
      ])
    );
  });

  it("requires reader IDs only for reader-sourced measurements", () => {
    expect(
      validateValidationDataRows("measurement_rows.csv", [
        {
          study_id: "S1",
          parameter_id: "tcd",
          source_role: "reader",
          value_mm: 32,
          measurement_available: true,
          image_quality_tier: "diagnostic",
        },
        {
          study_id: "S2",
          parameter_id: "tcd",
          source_role: "reference",
          reader_id: "R1",
          value_mm: 31,
          measurement_available: true,
          image_quality_tier: "diagnostic",
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "measurement_rows.csv row 1 requires reader_id when source_role is reader",
        "measurement_rows.csv row 2 must not include reader_id unless source_role is reader",
      ])
    );
  });

  it("rejects impossible report-audit measurement counts before QI analysis", () => {
    expect(
      validateValidationDataRows("report_audit_rows.csv", [
        {
          report_id: "P1",
          study_id: "S1",
          phase: "baseline",
          duration_sec: 600,
          required_measurement_count: 0,
          documented_measurement_count: 0,
          explicit_zscore_documented: false,
          explicit_percentile_documented: false,
        },
        {
          report_id: "P2",
          study_id: "S2",
          phase: "post_tool",
          duration_sec: 480,
          required_measurement_count: 8,
          documented_measurement_count: 9,
          explicit_zscore_documented: true,
          explicit_percentile_documented: true,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "report_audit_rows.csv row 1 field required_measurement_count must be greater than 0",
        "report_audit_rows.csv row 2 field documented_measurement_count cannot exceed required_measurement_count",
      ])
    );
  });

  it("rejects fractional values in fields documented as integers", () => {
    expect(
      validateValidationDataRows("case_log.csv", [
        {
          study_id: "S1",
          cohort: "institutional",
          site_id: "single_site",
          scanner_vendor: "unknown",
          field_strength_t: 1.5,
          svr_method: "none",
          image_quality_tier: "diagnostic",
          ga_weeks: 28.5,
          ga_days: 2.5,
          included: true,
          reference_standard_available: true,
          prediction_available: true,
          pathology_label_available: true,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "case_log.csv row 1 field ga_weeks must be an integer",
        "case_log.csv row 1 field ga_days must be an integer",
      ])
    );

    expect(
      validateValidationDataRows("reader_study_rows.csv", [
        {
          reader_id: "R1",
          study_id: "S1",
          condition: "without_tool",
          read_order: 1.5,
          washout_days: 14,
          duration_sec: 300,
          completeness_score: 0.8,
          zscore_documentation_rate: 0.75,
        },
      ])
    ).toContain(
      "reader_study_rows.csv row 1 field read_order must be an integer"
    );

    expect(
      validateValidationDataRows("reader_study_rows.csv", [
        {
          reader_id: "R1",
          study_id: "S1",
          condition: "with_tool",
          read_order: 2,
          washout_days: 14,
          duration_sec: 240,
          completeness_score: 0.95,
          zscore_documentation_rate: 1,
          sus_item_1: 2.5,
          sus_item_2: 2,
          sus_item_3: 3,
          sus_item_4: 4,
          sus_item_5: 5,
          sus_item_6: 1,
          sus_item_7: 2,
          sus_item_8: 3,
          sus_item_9: 4,
          sus_item_10: 5,
        },
      ])
    ).toContain(
      "reader_study_rows.csv row 1 field sus_item_1 must be an integer"
    );

    expect(
      validateValidationDataRows("report_audit_rows.csv", [
        {
          report_id: "P1",
          study_id: "S1",
          phase: "baseline",
          duration_sec: 600,
          required_measurement_count: 8.5,
          documented_measurement_count: 6.5,
          explicit_zscore_documented: true,
          explicit_percentile_documented: false,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "report_audit_rows.csv row 1 field required_measurement_count must be an integer",
        "report_audit_rows.csv row 1 field documented_measurement_count must be an integer",
      ])
    );
  });

  it("rejects invalid values for dictionary-defined categorical fields", () => {
    expect(
      validateValidationDataRows("case_log.csv", [
        {
          study_id: "S1",
          cohort: "pilot",
          site_id: "single_site",
          scanner_vendor: "unknown",
          field_strength_t: 1.5,
          svr_method: "manual",
          image_quality_tier: "diagnostic",
          ga_weeks: 28,
          ga_days: 0,
          included: true,
          reference_standard_available: true,
          prediction_available: true,
          pathology_label_available: true,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "case_log.csv row 1 field cohort must be one of feta_2024, institutional, reader_study, report_audit",
        "case_log.csv row 1 field svr_method must be one of none, clinical_svr, research_svr, unknown",
      ])
    );

    expect(
      validateValidationDataRows("measurement_rows.csv", [
        {
          study_id: "S1",
          parameter_id: "tcd",
          source_role: "gold_standard",
          value_mm: 32,
          measurement_available: true,
          image_quality_tier: "diagnostic",
        },
      ])
    ).toContain(
      "measurement_rows.csv row 1 field source_role must be one of reference, calculator, reader, ai_prefill"
    );
  });

  it("rejects unknown measurement parameter IDs before agreement analysis", () => {
    const errors = validateValidationDataRows("measurement_rows.csv", [
      {
        study_id: "S1",
        parameter_id: "trans_cerebellar_diameter",
        source_role: "reference",
        value_mm: 32,
        measurement_available: true,
        image_quality_tier: "diagnostic",
      },
    ]);

    expect(
      errors.some(error =>
        error.startsWith(
          "measurement_rows.csv row 1 field parameter_id must be one of "
        )
      )
    ).toBe(true);
    expect(errors.join("\n")).toContain("tcd");
  });

  it("rejects unknown diagnostic trigger IDs before accuracy analysis", () => {
    const errors = validateValidationDataRows("diagnostic_labels.csv", [
      {
        study_id: "S1",
        trigger_id: "ventriculomegaly",
        reference_label: true,
        predicted_label: true,
        threshold: 0.5,
        indeterminate: false,
      },
    ]);

    expect(
      errors.some(error =>
        error.startsWith(
          "diagnostic_labels.csv row 1 field trigger_id must be one of "
        )
      )
    ).toBe(true);
    expect(errors.join("\n")).toContain("mild-vm");
  });

  it("rejects determinate diagnostic rows that carry an indeterminate_reason", () => {
    expect(
      validateValidationDataRows("diagnostic_labels.csv", [
        {
          study_id: "S1",
          trigger_id: "mild-vm",
          reference_label: false,
          predicted_label: false,
          threshold: 0.5,
          indeterminate: false,
          indeterminate_reason: "truth label not adjudicable",
        },
      ])
    ).toContain(
      "diagnostic_labels.csv row 1 must not include indeterminate_reason when indeterminate is false"
    );
  });

  it("keeps indeterminate diagnostic rows out of label and probability analysis", () => {
    expect(
      validateValidationDataRows("diagnostic_labels.csv", [
        {
          study_id: "S1",
          trigger_id: "mild-vm",
          threshold: 0.5,
          indeterminate: true,
          indeterminate_reason: "truth label not adjudicable",
        },
      ])
    ).toEqual([]);

    expect(
      validateValidationDataRows("diagnostic_labels.csv", [
        {
          study_id: "S2",
          trigger_id: "severe-vm",
          reference_label: false,
          predicted_label: false,
          predicted_probability: 0.2,
          threshold: 0.5,
          indeterminate: true,
          indeterminate_reason: "truth label not adjudicable",
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        "diagnostic_labels.csv row 1 must not include reference_label when indeterminate is true",
        "diagnostic_labels.csv row 1 must not include predicted_label when indeterminate is true",
        "diagnostic_labels.csv row 1 must not include predicted_probability when indeterminate is true",
      ])
    );
  });

  it("rejects duplicate case-log study IDs before cross-file analysis", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "institutional",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
          {
            study_id: "S1",
            cohort: "institutional",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 3,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 29,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
        ],
      })
    ).toContain(
      "case_log.csv study_id S1 appears 2 times; expected exactly one"
    );
  });

  it("rejects duplicate measurement rows at the documented export grain", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "institutional",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
        ],
        "measurement_rows.csv": [
          {
            study_id: "S1",
            parameter_id: "tcd",
            source_role: "reference",
            value_mm: 32,
            measurement_available: true,
            image_quality_tier: "diagnostic",
          },
          {
            study_id: "S1",
            parameter_id: "tcd",
            source_role: "reference",
            value_mm: 33,
            measurement_available: true,
            image_quality_tier: "diagnostic",
          },
        ],
      })
    ).toContain(
      "measurement_rows.csv study S1 parameter tcd source_role reference reader none appears 2 times; expected exactly one"
    );
  });

  it("rejects measurement rows when case-level evidence is unavailable", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "institutional",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: false,
            prediction_available: false,
            pathology_label_available: true,
          },
        ],
        "measurement_rows.csv": [
          {
            study_id: "S1",
            parameter_id: "tcd",
            source_role: "reference",
            value_mm: 32,
            measurement_available: true,
            image_quality_tier: "diagnostic",
          },
          {
            study_id: "S1",
            parameter_id: "cc_length",
            source_role: "calculator",
            value_mm: 32,
            measurement_available: true,
            image_quality_tier: "diagnostic",
          },
          {
            study_id: "S1",
            parameter_id: "csa",
            source_role: "ai_prefill",
            value_deg: 62,
            measurement_available: true,
            image_quality_tier: "diagnostic",
          },
        ],
      })
    ).toEqual(
      expect.arrayContaining([
        "measurement_rows.csv row 1 source_role reference requires case_log.csv study_id S1 reference_standard_available=true",
        "measurement_rows.csv row 2 source_role calculator requires case_log.csv study_id S1 prediction_available=true",
        "measurement_rows.csv row 3 source_role ai_prefill requires case_log.csv study_id S1 prediction_available=true",
      ])
    );
  });

  it("rejects duplicate diagnostic labels for the same case and trigger", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "institutional",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
        ],
        "diagnostic_labels.csv": [
          {
            study_id: "S1",
            trigger_id: "mild-vm",
            reference_label: true,
            predicted_label: true,
            threshold: 0.5,
            indeterminate: false,
          },
          {
            study_id: "S1",
            trigger_id: "mild-vm",
            reference_label: false,
            predicted_label: true,
            threshold: 0.5,
            indeterminate: false,
          },
        ],
      })
    ).toContain(
      "diagnostic_labels.csv study S1 trigger mild-vm appears 2 times; expected exactly one"
    );
  });

  it("rejects determinate diagnostic labels when case-level evidence is unavailable", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "institutional",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: false,
            prediction_available: false,
            pathology_label_available: false,
          },
        ],
        "diagnostic_labels.csv": [
          {
            study_id: "S1",
            trigger_id: "mild-vm",
            reference_label: false,
            predicted_label: false,
            threshold: 0.5,
            indeterminate: false,
          },
        ],
      })
    ).toEqual(
      expect.arrayContaining([
        "diagnostic_labels.csv row 1 is determinate but case_log.csv study_id S1 has reference_standard_available=false",
        "diagnostic_labels.csv row 1 is determinate but case_log.csv study_id S1 has prediction_available=false",
        "diagnostic_labels.csv row 1 is determinate but case_log.csv study_id S1 has pathology_label_available=false",
      ])
    );
  });

  it("rejects duplicate report-audit report IDs before QI analysis", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "report_audit",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
          {
            study_id: "S2",
            cohort: "report_audit",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 3,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 29,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
        ],
        "report_audit_rows.csv": [
          {
            report_id: "P1",
            study_id: "S1",
            phase: "baseline",
            duration_sec: 600,
            required_measurement_count: 8,
            documented_measurement_count: 6,
            explicit_zscore_documented: false,
            explicit_percentile_documented: false,
          },
          {
            report_id: "P1",
            study_id: "S2",
            phase: "post_tool",
            duration_sec: 480,
            required_measurement_count: 8,
            documented_measurement_count: 8,
            explicit_zscore_documented: true,
            explicit_percentile_documented: true,
          },
        ],
      })
    ).toContain(
      "report_audit_rows.csv report_id P1 appears 2 times; expected exactly one"
    );
  });

  it("validates cross-file study IDs and reader-study pair completeness", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "reader_study",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
        ],
        "measurement_rows.csv": [
          {
            study_id: "S1",
            parameter_id: "tcd",
            source_role: "reference",
            value_mm: 32,
            measurement_available: true,
            image_quality_tier: "diagnostic",
          },
        ],
        "diagnostic_labels.csv": [
          {
            study_id: "S1",
            trigger_id: "mild-vm",
            reference_label: false,
            predicted_label: false,
            threshold: 0.5,
            indeterminate: false,
          },
        ],
        "reader_study_rows.csv": [
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "without_tool",
            read_order: 1,
            washout_days: 14,
            duration_sec: 300,
            completeness_score: 0.8,
            zscore_documentation_rate: 0.75,
            recommendation_congruent: true,
          },
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "with_tool",
            read_order: 2,
            washout_days: 14,
            duration_sec: 240,
            completeness_score: 0.95,
            zscore_documentation_rate: 1,
            recommendation_congruent: true,
          },
        ],
      })
    ).toEqual([]);

    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "reader_study",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
        ],
        "measurement_rows.csv": [
          {
            study_id: "S2",
            parameter_id: "tcd",
            source_role: "reference",
            value_mm: 32,
            measurement_available: true,
            image_quality_tier: "diagnostic",
          },
        ],
        "diagnostic_labels.csv": [
          {
            study_id: "S3",
            trigger_id: "mild-vm",
            reference_label: false,
            predicted_label: false,
            threshold: 0.5,
            indeterminate: false,
          },
        ],
        "reader_study_rows.csv": [
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "without_tool",
            read_order: 1,
            washout_days: 14,
            duration_sec: 300,
            completeness_score: 0.8,
            zscore_documentation_rate: 0.75,
            recommendation_congruent: true,
          },
          {
            reader_id: "R2",
            study_id: "S4",
            condition: "with_tool",
            read_order: 1,
            washout_days: 14,
            duration_sec: 240,
            completeness_score: 0.95,
            zscore_documentation_rate: 1,
            recommendation_congruent: true,
          },
        ],
      })
    ).toEqual(
      expect.arrayContaining([
        "measurement_rows.csv row 1 references missing study_id S2 in case_log.csv",
        "diagnostic_labels.csv row 1 references missing study_id S3 in case_log.csv",
        "reader_study_rows.csv row 2 references missing study_id S4 in case_log.csv",
        "reader_study_rows.csv reader R1 study S1 must include both without_tool and with_tool rows",
        "reader_study_rows.csv reader R2 study S4 must include both without_tool and with_tool rows",
      ])
    );
  });

  it("rejects cross-file rows that reference excluded study ids", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "reader_study",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: false,
            exclusion_reason: "not in locked analysis cohort",
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
        ],
        "measurement_rows.csv": [
          {
            study_id: "S1",
            parameter_id: "tcd",
            source_role: "reference",
            value_mm: 32,
            measurement_available: true,
            image_quality_tier: "diagnostic",
          },
        ],
        "diagnostic_labels.csv": [
          {
            study_id: "S1",
            trigger_id: "mild-vm",
            reference_label: false,
            predicted_label: false,
            threshold: 0.5,
            indeterminate: false,
          },
        ],
        "reader_study_rows.csv": [
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "without_tool",
            read_order: 1,
            washout_days: 14,
            duration_sec: 300,
            completeness_score: 0.8,
            zscore_documentation_rate: 0.75,
            recommendation_congruent: true,
          },
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "with_tool",
            read_order: 2,
            washout_days: 14,
            duration_sec: 240,
            completeness_score: 0.95,
            zscore_documentation_rate: 1,
            recommendation_congruent: true,
          },
        ],
        "report_audit_rows.csv": [
          {
            report_id: "P1",
            study_id: "S1",
            phase: "baseline",
            duration_sec: 600,
            required_measurement_count: 8,
            documented_measurement_count: 6,
            explicit_zscore_documented: false,
            explicit_percentile_documented: false,
          },
        ],
      })
    ).toEqual(
      expect.arrayContaining([
        "measurement_rows.csv row 1 references excluded study_id S1 in case_log.csv",
        "diagnostic_labels.csv row 1 references excluded study_id S1 in case_log.csv",
        "reader_study_rows.csv row 1 references excluded study_id S1 in case_log.csv",
        "reader_study_rows.csv row 2 references excluded study_id S1 in case_log.csv",
        "report_audit_rows.csv row 1 references excluded study_id S1 in case_log.csv",
      ])
    );
  });

  it("rejects report-audit rows that do not link to the case log", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "report_audit",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
        ],
        "report_audit_rows.csv": [
          {
            report_id: "P1",
            study_id: "S2",
            phase: "baseline",
            duration_sec: 600,
            required_measurement_count: 8,
            documented_measurement_count: 6,
            explicit_zscore_documented: false,
            explicit_percentile_documented: false,
          },
        ],
      })
    ).toContain(
      "report_audit_rows.csv row 1 references missing study_id S2 in case_log.csv"
    );
  });

  it("rejects duplicate reader-study read_order values within a reader", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "reader_study",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
          {
            study_id: "S2",
            cohort: "reader_study",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 29,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
        ],
        "reader_study_rows.csv": [
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "without_tool",
            read_order: 1,
            washout_days: 14,
            duration_sec: 300,
            completeness_score: 0.8,
            zscore_documentation_rate: 0.75,
          },
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "with_tool",
            read_order: 2,
            washout_days: 14,
            duration_sec: 240,
            completeness_score: 0.95,
            zscore_documentation_rate: 1,
          },
          {
            reader_id: "R1",
            study_id: "S2",
            condition: "without_tool",
            read_order: 1,
            washout_days: 14,
            duration_sec: 320,
            completeness_score: 0.85,
            zscore_documentation_rate: 0.8,
          },
          {
            reader_id: "R1",
            study_id: "S2",
            condition: "with_tool",
            read_order: 3,
            washout_days: 14,
            duration_sec: 250,
            completeness_score: 0.9,
            zscore_documentation_rate: 0.95,
          },
        ],
      })
    ).toContain(
      "reader_study_rows.csv reader R1 read_order 1 appears 2 times; expected unique sequence positions"
    );
  });

  it("rejects inconsistent washout days within a reader-study pair", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "reader_study",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
        ],
        "reader_study_rows.csv": [
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "without_tool",
            read_order: 1,
            washout_days: 14,
            duration_sec: 300,
            completeness_score: 0.8,
            zscore_documentation_rate: 0.75,
          },
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "with_tool",
            read_order: 2,
            washout_days: 21,
            duration_sec: 240,
            completeness_score: 0.95,
            zscore_documentation_rate: 1,
          },
        ],
      })
    ).toContain(
      "reader_study_rows.csv reader R1 study S1 has inconsistent washout_days values 14 and 21; expected one paired interval"
    );
  });

  it("rejects duplicate reader-study condition rows before paired analysis", () => {
    expect(
      validateValidationDataExport({
        "case_log.csv": [
          {
            study_id: "S1",
            cohort: "reader_study",
            site_id: "single_site",
            scanner_vendor: "unknown",
            field_strength_t: 1.5,
            svr_method: "none",
            image_quality_tier: "diagnostic",
            ga_weeks: 28,
            ga_days: 0,
            included: true,
            reference_standard_available: true,
            prediction_available: true,
            pathology_label_available: true,
          },
        ],
        "reader_study_rows.csv": [
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "without_tool",
            read_order: 1,
            washout_days: 14,
            duration_sec: 300,
            completeness_score: 0.8,
            zscore_documentation_rate: 0.75,
          },
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "without_tool",
            read_order: 2,
            washout_days: 14,
            duration_sec: 320,
            completeness_score: 0.85,
            zscore_documentation_rate: 0.8,
          },
          {
            reader_id: "R1",
            study_id: "S1",
            condition: "with_tool",
            read_order: 3,
            washout_days: 14,
            duration_sec: 240,
            completeness_score: 0.95,
            zscore_documentation_rate: 1,
          },
        ],
      })
    ).toContain(
      "reader_study_rows.csv reader R1 study S1 has 2 without_tool rows; expected exactly one"
    );
  });

  it("keeps CSV header templates aligned with runtime schemas", () => {
    const readerStudyColumns = VALIDATION_DATA_SCHEMAS[
      "reader_study_rows.csv"
    ].columns.map(column => column.name);

    expect(readerStudyColumns).toEqual(
      expect.arrayContaining(["sus_item_1", "sus_item_10"])
    );
    expect(readerStudyColumns).not.toContain("sus_item_1 through sus_item_10");

    for (const fileName of VALIDATION_DATA_FILE_ORDER) {
      const templatePath = resolve(
        process.cwd(),
        "validation_export_templates",
        fileName
      );
      expect(existsSync(templatePath)).toBe(true);
      const header = readFileSync(templatePath, "utf8")
        .trim()
        .split("\n")[0]
        .split(",");
      expect(header).toEqual(
        VALIDATION_DATA_SCHEMAS[fileName].columns.map(column => column.name)
      );
    }
  });

  it("keeps the reader-study protocol aligned with the runtime export schema", () => {
    const protocol = readFileSync(
      resolve(process.cwd(), "reader_study_protocol.md"),
      "utf8"
    );
    const readerStudyColumns = VALIDATION_DATA_SCHEMAS[
      "reader_study_rows.csv"
    ].columns.map(column => column.name);

    expect(protocol).toContain("validation_data_dictionary.md");
    expect(protocol).toContain("reader_study_rows.csv");
    for (const columnName of readerStudyColumns) {
      expect(protocol).toContain(`| ${columnName}`);
    }

    expect(protocol).not.toContain("| case_order");
    expect(protocol).not.toContain("| nasa_tlx_raw");
    expect(protocol).not.toContain("| sus_score");
  });
});
