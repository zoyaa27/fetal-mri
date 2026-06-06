# Validation Data Dictionary

Last updated: 2026-05-24.

No PHI belongs in these files. Use `study_id` values that cannot be reversed to
MRNs, accession numbers, names, dates of birth, or exam dates without a secure
local crosswalk retained by the clinical site. Dates should be omitted or shifted
before export.

This dictionary defines the analyst-facing CSV/export schemas needed to close
the FeTA 2024, institutional cohort, reader-study, and pre/post report-audit
blockers. Column names are intentionally aligned to the helper inputs in
`client/src/lib/validation-metrics.ts`.

Before metrics are computed, export rows should be checked with
`validateValidationDataRows` and full file sets should be checked with
`validateValidationDataExport` from
`client/src/lib/validation-data-schema.ts`. These guards verify that every file
contains the required fields documented below, catch blank required values,
enforce high-risk conditional fields such as exclusion and missingness reasons,
check locked enum values such as reader-study condition and report-audit phase,
reject non-boolean tokens in `true` / `false` fields, reject non-finite or
out-of-range numeric values, reject fractional values in integer fields, ensure
exported rows reference known `case_log.csv` study IDs, and require paired
`without_tool` / `with_tool` reader-study rows before downstream analysis code
runs.

Starter CSV header templates live in `validation_export_templates/` and are
checked against the runtime schema.

## File set

| File                  | Grain                                                                     | Primary helper or use                                                                       |
| --------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| case_log.csv          | one row per fetal MRI case                                                | `summarizeValidationCohortFlow`                                                             |
| measurement_rows.csv  | one unique row per case, parameter, source role, and reader if applicable | `computeAgreementMetrics`, `computeGroupedAgreementMetrics`, `computeIntraclassCorrelation` |
| diagnostic_labels.csv | one unique row per case and diagnostic trigger                            | `computeBinaryValidationMetrics`, `computeDecisionCurve`                                    |
| reader_study_rows.csv | one row per reader, case, and reading condition                           | `computeReaderStudyCrossoverSummary`, `computeCohenKappa`, `computeFleissKappa`             |
| report_audit_rows.csv | one row per baseline or post-tool report linked to a case                 | `computeQiAuditSummary`, `compareQiAuditPhases`                                             |

## case_log.csv

| Column                       | Required    | Values / notes                                                                                                                               |
| ---------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| study_id                     | yes         | Unique de-identified case key shared across all files.                                                                                       |
| cohort                       | yes         | `feta_2024`, `institutional`, `reader_study`, or `report_audit`.                                                                             |
| site_id                      | yes         | De-identified site key; use `single_site` if only one institution.                                                                           |
| scanner_vendor               | yes         | Vendor label or `unknown`.                                                                                                                   |
| field_strength_t             | yes         | Positive numeric Tesla value such as `0.55`, `1.5`, or `3`.                                                                                  |
| svr_method                   | yes         | `none`, `clinical_svr`, `research_svr`, or `unknown`.                                                                                        |
| image_quality_tier           | yes         | `diagnostic`, `motion_limited`, `nondiagnostic`, or local locked categories.                                                                 |
| ga_weeks                     | yes         | Integer gestational age weeks at MRI; supported range is 18-40.                                                                              |
| ga_days                      | yes         | Integer 0-6 gestational age days.                                                                                                            |
| included                     | yes         | `true` or `false`.                                                                                                                           |
| exclusion_reason             | conditional | Required when `included=false` and must be blank when `included=true`; examples: `motion-degraded`, `missing-sequence`, `outside-ga-window`. |
| reference_standard_available | yes         | `true` if expert measurement or final label is available.                                                                                    |
| prediction_available         | yes         | `true` if calculator output is available.                                                                                                    |
| pathology_label_available    | yes         | `true` if diagnostic truth labels are available.                                                                                             |

## measurement_rows.csv

Use this file for FeTA external validation, institutional validation, and
inter-rater reliability. Store millimetre and degree values in separate columns
so angular parameters cannot be silently interpreted as millimetres.
The unique row grain is `study_id`, `parameter_id`, `source_role`, and
`reader_id` when applicable.
Rows with `measurement_available=true` must populate exactly one positive
`value_mm` or `value_deg`, and the populated column must match the runtime
parameter unit. These rows must leave `missing_reason` blank.
Rows with `measurement_available=false` must leave both value columns blank and
provide `missing_reason`. Available `reference` rows require the linked
`case_log.csv` row to have `reference_standard_available=true`; available
`calculator` and `ai_prefill` rows require `prediction_available=true`.

| Column                | Required    | Values / notes                                                                                                                                                                                        |
| --------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| study_id              | yes         | Links to `case_log.csv`.                                                                                                                                                                              |
| parameter_id          | yes         | Must match a runtime `PARAMETERS_ALL` id such as `skull_bpd`, `brain_bpd`, `atrial_right`, `csp_width`, `cc_length`, `tcd`, `vermis_cc`, `vermis_ap`, `pons_ap`, `extra_axial_csf`, `tdpf`, or `csa`. |
| source_role           | yes         | `reference`, `calculator`, `reader`, or `ai_prefill`.                                                                                                                                                 |
| reader_id             | conditional | Required when `source_role=reader`; otherwise blank.                                                                                                                                                  |
| value_mm              | conditional | Positive numeric millimetres for runtime `mm` parameters.                                                                                                                                             |
| value_deg             | conditional | Positive numeric degrees for runtime `degrees` parameters such as `csa`.                                                                                                                              |
| measurement_available | yes         | `true` or `false`; use `false` instead of sentinel numeric values.                                                                                                                                    |
| missing_reason        | conditional | Required when `measurement_available=false`.                                                                                                                                                          |
| image_quality_tier    | yes         | Repeat from `case_log.csv` if stratifying agreement by image quality.                                                                                                                                 |
| acquisition_site      | optional    | De-identified acquisition site or scanner group for FeTA subgroup analysis.                                                                                                                           |

## diagnostic_labels.csv

Use one unique row per case and diagnostic trigger that will be reported in the
manuscript. Lock the threshold before analysis in
`validation_analysis_lock.md`. Determinate rows require the linked
`case_log.csv` row to have `reference_standard_available=true`,
`prediction_available=true`, and `pathology_label_available=true`.

| Column                | Required    | Values / notes                                                                                                                                                                                                 |
| --------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| study_id              | yes         | Links to `case_log.csv`.                                                                                                                                                                                       |
| trigger_id            | yes         | Must match a runtime differential card id such as `mild-vm`, `severe-vm`, `macrocephaly`, `microcephaly`, `acc-pattern`, `hpe-pattern`, `dwm-pattern`, `pch-pattern`, `extra-axial-wide`, or `chiari-ii-ontd`. |
| reference_label       | conditional | `true` or `false` expert truth label; required when `indeterminate=false` and blank when `indeterminate=true`.                                                                                                 |
| predicted_label       | conditional | `true` or `false` calculator label at the locked threshold; required when `indeterminate=false`, blank when `indeterminate=true`, and must equal `predicted_probability >= threshold` when probability exists. |
| predicted_probability | conditional | 0-1 probability; required when computing calibration, ROC-AUC, PR-AUC, Brier score, or decision-curve net benefit; blank when `indeterminate=true`.                                                            |
| threshold             | yes         | Locked threshold strictly greater than 0 and less than 1 used for `predicted_label`.                                                                                                                           |
| indeterminate         | yes         | `true` if the case is excluded from the trigger analysis because truth is not adjudicable.                                                                                                                     |
| indeterminate_reason  | conditional | Required when `indeterminate=true`; blank when `indeterminate=false`.                                                                                                                                          |

## reader_study_rows.csv

The reader-study protocol uses counter-balanced with-tool / without-tool reads
with a two-week washout. Each reader-case pair needs exactly one `without_tool`
and one `with_tool` row before paired deltas are computed. Within each reader,
`read_order` values must be unique so every row has one sequence position. The
paired rows for one reader-case pair must use the same `washout_days` value
because it is the interval between those two reads.

NASA Task Load Index and System Usability Scale fields are all-or-none groups:
if any NASA TLX subscale is present, all six subscales must be present; if any
SUS item is present, all ten item responses must be present. SUS items are
collected only after with-tool use and must appear only on `with_tool` rows.

| Column                    | Required    | Values / notes                                                   |
| ------------------------- | ----------- | ---------------------------------------------------------------- |
| reader_id                 | yes         | De-identified reader key.                                        |
| study_id                  | yes         | Links to `case_log.csv`.                                         |
| condition                 | yes         | `without_tool` or `with_tool`.                                   |
| read_order                | yes         | Integer order within the reader's assigned sequence.             |
| washout_days              | yes         | Days between paired reads; minimum is 14.                        |
| duration_sec              | yes         | Positive reading or reporting duration in seconds.               |
| completeness_score        | yes         | Non-negative locked rubric score, same scale in both conditions. |
| zscore_documentation_rate | yes         | Fraction 0-1 of required z-scores documented.                    |
| recommendation_congruent  | conditional | `true`, `false`, or blank if not applicable.                     |
| categorical_label         | optional    | Reader's final categorical diagnostic label for kappa.           |
| continuous_measurement    | optional    | Repeated continuous measurement for ICC(2,1).                    |
| nasa_tlx_mental_demand    | conditional | NASA Task Load Index 0-100 subscale.                             |
| nasa_tlx_physical_demand  | conditional | NASA Task Load Index 0-100 subscale.                             |
| nasa_tlx_temporal_demand  | conditional | NASA Task Load Index 0-100 subscale.                             |
| nasa_tlx_performance      | conditional | NASA Task Load Index 0-100 subscale.                             |
| nasa_tlx_effort           | conditional | NASA Task Load Index 0-100 subscale.                             |
| nasa_tlx_frustration      | conditional | NASA Task Load Index 0-100 subscale.                             |
| sus_item_1                | conditional | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_2                | conditional | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_3                | conditional | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_4                | conditional | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_5                | conditional | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_6                | conditional | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_7                | conditional | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_8                | conditional | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_9                | conditional | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_10               | conditional | System Usability Scale integer response 1-5 after with-tool use. |

## report_audit_rows.csv

Use this file for the QI pre/post report audit modeled after the TI-RADS
calculator study. `required_measurement_count` must be greater than zero, and
`documented_measurement_count` cannot exceed `required_measurement_count`.
Each row keeps a report-level key and the de-identified `study_id` from
`case_log.csv` so report-audit exports can be linked to the same cohort flow as
the other validation files.

| Column                         | Required    | Values / notes                                              |
| ------------------------------ | ----------- | ----------------------------------------------------------- |
| report_id                      | yes         | Unique de-identified report key.                            |
| study_id                       | yes         | Links to `case_log.csv`.                                    |
| phase                          | yes         | `baseline` or `post_tool`.                                  |
| duration_sec                   | yes         | Positive time to complete report.                           |
| required_measurement_count     | yes         | Number of measurements required by the locked audit rubric. |
| documented_measurement_count   | yes         | Number of required measurements documented in report.       |
| explicit_zscore_documented     | yes         | `true` or `false`.                                          |
| explicit_percentile_documented | yes         | `true` or `false`.                                          |
| recommendation_congruent       | conditional | `true`, `false`, or blank if no recommendation applies.     |

## Export checks before analysis

1. No PHI appears in any export file.
2. Every analysis file uses `study_id` consistently and references only
   `case_log.csv` rows with `included=true`.
3. `ga_weeks` and `ga_days` are populated for every included case.
4. Excluded cases have non-empty `exclusion_reason`; included cases leave
   `exclusion_reason` blank.
5. Missing measurements use `measurement_available=false` plus `missing_reason`,
   not numeric placeholders; available measurements use exactly one positive
   `value_mm` or `value_deg`, matching the runtime parameter unit, and leave
   `missing_reason` blank.
6. Available reference measurements require `reference_standard_available=true`;
   available calculator and AI-prefill measurements require
   `prediction_available=true`.
7. Every reader-study case has exactly one `without_tool` and exactly one
   `with_tool` row for each reader, and every `read_order` value is unique
   within each reader; paired rows for one reader-case pair use the same
   `washout_days` value. Duplicate condition rows, duplicate sequence rows, or
   conflicting paired intervals are fixed before paired deltas are computed.
8. Locked thresholds and endpoint definitions are copied into
   `validation_analysis_lock.md` before analysis.
9. Indeterminate diagnostic-label rows include `indeterminate_reason` and leave
   label / probability fields blank; determinate rows include
   `reference_label` and `predicted_label` and leave `indeterminate_reason`
   blank.
10. Determinate diagnostic-label rows reference only case-log rows with
    `reference_standard_available=true`, `prediction_available=true`, and
    `pathology_label_available=true`.
11. Probability, rate, NASA Task Load Index, System Usability Scale, gestational
    age day, positive duration, and count fields stay inside the documented
    numeric ranges.
12. Reader-study paired reads have at least 14 washout days.
13. Partial NASA Task Load Index or System Usability Scale rows are fixed before
    scoring; do not export only selected subscales or selected SUS items, and do
    not export SUS items on `without_tool` rows.
14. Report-audit rows have a non-zero required-measurement denominator and never
    document more measurements than the locked audit rubric requires.
15. Integer fields such as `ga_weeks`, `ga_days`, `read_order`,
    `required_measurement_count`, `documented_measurement_count`, and System
    Usability Scale item responses do not use fractional values.
