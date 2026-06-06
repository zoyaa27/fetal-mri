# Source-Data Final Lock Checklist

This checklist is the clinician-facing signoff packet for declaring the
calculator's source data ready for clinical reliance or manuscript submission.
It does not close any source item by itself; each row needs a named reviewer,
date, and outcome.

## Required Reviews

| Item                                 | Required action                                                                                                                                                                                                                                                               | Outcome fields                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Dovjak 2021 Table 1                  | Review the completed PMC8457244 Table 1 byte-check: the TCD, vermis RC, vermis AP, and total pons AP 5th/95th percentile equations match SPEC.md Sections 7.3.7-7.3.10; confirm the audited 14+0 to 39+2 week source range (encoded 14.0-39.3 weeks) and n = 161 cohort size. | reviewer, date, countersign yes/no, correction diff if needed          |
| Woitek 2014 Table 3                  | Review the completed PMC4231033 Table 3 byte-check: Section 6.5.2 now matches the 17 normal-CNS TDPF and CSA mean / SD rows, and the existing OLS coefficients reproduce them.                                                                                                | reviewer, date, countersign yes/no, correction diff if needed          |
| extra-axial CSF coefficient decision | Review the completed Kyriakopoulou 2017 supplementary workbook row 19 transcription: exact fetal-centiles coefficients are encoded in the React and Python registries.                                                                                                        | reviewer, date, countersign yes/no, correction diff if needed          |
| third-ventricle raw-threshold policy | Confirm the Phase 1 policy remains raw-threshold-only: width is recorded, >3.5 mm can trigger DDx, and no z-score is reported.                                                                                                                                                | reviewer, date, policy accepted yes/no                                 |
| Chiari II / ONTD calibration         | Calibrate the Mahalanobis centroids and ONTD posterior threshold on a local cohort before clinical reliance; keep reports research-mode until complete.                                                                                                                       | reviewer, date, local cohort size, threshold, sensitivity, specificity |

## Mismatch Handling

1. Do not edit the signed source value in place without opening a new
   implementation increment.
2. Record the source location, reviewer, old value, corrected value, and reason
   for change in `PROGRESS.md`.
3. Re-run the source-registry tests, report tests, Python compile, typecheck, and
   production build.
4. If a source correction changes a clinical threshold, update TEST.md fixtures
   before declaring the change ready.

## Clinician Signoff

| Signoff field                        | Value                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| Source reviewer                      | Pending                                                                       |
| Radiologist PI                       | Pending                                                                       |
| Dovjak 2021 Table 1 status           | Implementation byte-check complete; pending clinician countersignature        |
| Woitek 2014 Table 3 status           | Implementation byte-check complete; pending clinician countersignature        |
| extra-axial CSF coefficient decision | Implementation exact coefficients encoded; pending clinician countersignature |
| third-ventricle raw-threshold policy | Closed by implementation; pending clinician acceptance                        |
| Chiari II / ONTD calibration         | Open                                                                          |
| Final clinical-reliance decision     | Pending                                                                       |
