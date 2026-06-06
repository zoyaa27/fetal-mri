# Validation Analysis Lock

This template is the pre-analysis signoff sheet for FeTA, institutional
validation, and reader-study exports. It is completed after cohorts are
assembled and before any analyst computes manuscript endpoints.

## Freeze Fields

| Field                                | Locked value |
| ------------------------------------ | ------------ |
| threshold-lock date                  | Pending      |
| cohort freeze                        | Pending      |
| cohort-flow and missing-data summary | Pending      |
| endpoint freeze                      | Pending      |
| code-version freeze                  | Pending      |
| sample-size / precision plan         | Pending      |
| FeTA data version                    | Pending      |
| institutional cohort ID              | Pending      |
| exported results folder              | Pending      |
| analyst                              | Pending      |
| radiologist PI signoff               | Pending      |

## Locked Thresholds

| Threshold family                 | Locked source                                                     |
| -------------------------------- | ----------------------------------------------------------------- |
| z-score abnormality cutoffs      | SPEC.md Section 4.6 and TEST.md fixtures                          |
| raw third-ventricle threshold    | >3.5 mm raw threshold; no z-score output                          |
| Chiari II / ONTD research-mode   | Posterior threshold remains research-mode until local calibration |
| report-completeness endpoint     | reader_study_protocol.md                                          |
| reader-study crossover endpoints | reader_study_protocol.md and client/src/lib/validation-metrics.ts |

## Locked Endpoint Set

| Endpoint                         | Lock requirement                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| FeTA per-parameter agreement     | MAE, MAPE, Bland-Altman limits, grouped robustness strata                                          |
| Cohort flow / missingness        | Included/excluded counts, exclusion reasons, complete-case denominators, per-parameter missingness |
| FeTA pathology contrast          | Welch two-sample comparison between pathological and neurotypical z-score distributions            |
| Sample-size / precision plan     | Wilson half-width targets for sensitivity/specificity and paired reader-study effect assumptions   |
| Binary discrimination            | ROC-AUC confidence interval, PR-AUC, locked-threshold sensitivity/specificity, Wilson intervals    |
| Calibration and clinical utility | calibration-in-the-large, calibration slope, Brier score, decision-curve net benefit               |
| Reader-study paired analysis     | paired within-reader / within-case deltas and confidence intervals                                 |
| Reader-study reliability         | Cohen's kappa, Fleiss's kappa, and ICC(2,1) as applicable                                          |
| Reader-study usability           | raw NASA Task Load Index and System Usability Scale                                                |

## Change-Control Rules

1. No post hoc threshold changes are allowed after the threshold-lock date.
2. No cohort additions, exclusions, or relabeling are allowed after cohort
   freeze unless the radiologist PI signs an amendment.
3. No exclusion-reason or missing-data recoding is allowed after the cohort-flow
   and missing-data summary is signed without a PI amendment.
4. No endpoint changes are allowed after endpoint freeze unless the manuscript
   labels the analysis as exploratory.
5. No diagnostic-accuracy or reader-study sample-size assumptions may change
   after the sample-size / precision plan is signed without a PI amendment.
6. Any code-version change after code-version freeze requires re-running the
   full validation export and recording the new commit hash.
7. Chiari II / ONTD research-mode status remains in force until local
   calibration is signed in source_data_final_lock.md.

## Signoff

| Signoff field                   | Value   |
| ------------------------------- | ------- |
| Analyst                         | Pending |
| Radiologist PI                  | Pending |
| Statistician / methods reviewer | Pending |
| Date                            | Pending |
