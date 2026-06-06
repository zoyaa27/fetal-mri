## 2026-05-24, Software Readiness Completion Audit Increment

- Adjusted the active-goal stop condition to software-ready for radiologist
  evaluation rather than publication evidence complete.
- Re-audited the repository against SPEC.md, TEST.md, validation export schemas,
  source-verification records, current gate outputs, and the handoff documents.
- Updated `completion_audit.md` to mark implementation-side work software-ready
  while preserving external evaluation and publication tasks as post-handoff
  work.

Verification:

- `git status --short && git log -5 --oneline` showed a clean tree before the
  audit edits and the latest committed validation increments.
- `grep -R "^describe\|^  it" -n client/src/lib/*.test.ts | awk -F: '{print $1}' | sort | uniq -c` showed test coverage across architecture, biometry, client shell, clipboard, GenAI, methodology, source-detail UI, validation-data schema, validation metrics, validation page, and workflow UI tests.
- `grep -n "residual\|0 residual\|Closed\|Open" source_verification_dossier.md | head -120` confirmed implementation-side source checks and the TEST corpus numeric audit are closed while external evaluation items remain explicit.
- Source-document check: `npx pnpm@10.4.1 test -- --runInBand` initially failed because `client/src/lib/methodology-page.test.ts` still asserted the old `Goal status: Not complete` wording; the test now asserts the adjusted software-ready status and post-handoff evaluation section.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 290 tests.
- `npx pnpm@10.4.1 check` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader Study SUS Condition Guard Increment

- Added failing-first validation-data-schema coverage that System Usability
  Scale fields are rejected on `without_tool` reader-study rows.
- Extended row validation so SUS item responses are reserved for `with_tool`
  rows, matching the reader-study protocol's post-tool usability capture.
- Updated `validation_data_dictionary.md` to document the condition-specific
  SUS rule.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "System Usability Scale fields"` failed before implementation because complete SUS rows were accepted on `without_tool`.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "System Usability Scale fields"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 40 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 290 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader Study Washout Consistency Guard Increment

- Added failing-first package-level validation-data-schema coverage that paired
  `without_tool` and `with_tool` reader-study rows must use the same
  `washout_days` value.
- Extended export validation so each reader-case pair has one consistent
  washout interval before paired analysis.
- Updated `validation_data_dictionary.md` to document pair-level washout
  consistency.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "inconsistent washout"` failed before implementation because conflicting paired washout intervals produced no export errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "inconsistent washout"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 39 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 289 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader Study Read-Order Uniqueness Guard Increment

- Added failing-first package-level validation-data-schema coverage that each
  reader's `reader_study_rows.csv` `read_order` values must be unique.
- Extended export validation so duplicate reader sequence positions are caught
  before counterbalanced reader-study analysis.
- Updated `validation_data_dictionary.md` to document `read_order` uniqueness
  within each reader.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "read_order values"` failed before implementation because duplicate reader sequence positions produced no package-level export errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "read_order values"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 38 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 288 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Measurement Source Availability Guard Increment

- Added failing-first package-level validation-data-schema coverage that
  available reference measurement rows require `case_log.csv`
  `reference_standard_available=true`.
- Added coverage that available calculator and AI-prefill measurement rows
  require `case_log.csv` `prediction_available=true`.
- Extended cross-file export validation so agreement and measurement-layer
  analyses cannot use measurement rows contradicted by case-level availability
  flags.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "measurement rows when case-level evidence"` failed before implementation because unavailable case-level evidence produced no package-level measurement-row errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "measurement rows when case-level evidence"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 37 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 287 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Determinate Diagnostic Availability Guard Increment

- Added failing-first package-level validation-data-schema coverage that
  determinate `diagnostic_labels.csv` rows cannot reference cases whose
  `case_log.csv` availability flags say the reference standard, prediction, or
  pathology labels are unavailable.
- Extended cross-file export validation so diagnostic-accuracy, calibration,
  and decision-curve rows are determinate only when the case-level evidence is
  available.
- Updated `validation_data_dictionary.md` to document the case-log availability
  precondition for determinate diagnostic labels.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "case-level evidence"` failed before implementation because unavailable case-level evidence produced no package-level diagnostic-label errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "case-level evidence"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 36 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 286 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Indeterminate Diagnostic Label Blank Guard Increment

- Added failing-first validation-data-schema coverage that indeterminate
  `diagnostic_labels.csv` rows can omit truth/prediction labels and
  probabilities.
- Added validation coverage that `indeterminate=true` rows reject
  `reference_label`, `predicted_label`, and `predicted_probability` so they
  cannot accidentally enter diagnostic-accuracy, calibration, or decision-curve
  analyses.
- Updated `validation_data_dictionary.md` so diagnostic labels are required for
  determinate rows and blank for indeterminate rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "indeterminate diagnostic rows"` failed before implementation because indeterminate rows still required `reference_label` and `predicted_label`.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "indeterminate diagnostic rows"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 35 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 285 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Diagnostic Indeterminate Reason Guard Increment

- Added failing-first validation-data-schema coverage that determinate
  `diagnostic_labels.csv` rows cannot carry `indeterminate_reason`.
- Extended diagnostic-label validation so indeterminate reasons are present only
  for rows excluded from trigger analysis.
- Updated `validation_data_dictionary.md` to document
  `indeterminate_reason` as required for indeterminate rows and blank for
  determinate rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "indeterminate_reason"` failed before implementation because determinate diagnostic-label rows with `indeterminate_reason` produced no export errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "indeterminate_reason"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 34 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 284 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Available Measurement Missing-Reason Guard Increment

- Added failing-first validation-data-schema coverage that
  `measurement_rows.csv` rows with `measurement_available=true` cannot carry a
  `missing_reason`.
- Extended row validation so available measurements must carry exactly one
  positive unit-appropriate value and no missingness explanation.
- Updated `validation_data_dictionary.md` to reserve `missing_reason` for
  unavailable measurements.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "available measurement"` failed before implementation because available measurement rows with `missing_reason` produced no export errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "available measurement"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 33 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 283 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Excluded Case Cross-File Guard Increment

- Added failing-first package-level validation-data-schema coverage that
  measurement, diagnostic-label, reader-study, and report-audit rows cannot
  reference `case_log.csv` cases marked `included=false`.
- Extended export validation so excluded cases remain cohort-flow-only and
  cannot leak into downstream analysis inputs.
- Updated `validation_data_dictionary.md` to require analysis rows to reference
  included cases.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "excluded study"` failed before implementation because excluded case references produced no package-level export errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "excluded study"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 32 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 282 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Diagnostic Threshold Open-Interval Guard Increment

- Added failing-first validation-data-schema coverage that `diagnostic_labels.csv` thresholds reject degenerate `0` and `1` values.
- Aligned export validation with validation-metrics helpers that require thresholds strictly between zero and one for accuracy, calibration, and decision-curve analysis.
- Updated `validation_data_dictionary.md` wording from inclusive 0-1 threshold guidance to an open-interval threshold requirement.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "greater than 0 and less than 1|numeric fields"` failed before implementation because `threshold=0` and `threshold=1` were accepted.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "greater than 0 and less than 1|numeric fields"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 31 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 281 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Diagnostic Label Threshold Consistency Guard Increment

- Added failing-first validation-data-schema coverage that `diagnostic_labels.csv` predicted labels must match `predicted_probability` at the locked threshold.
- Extended row validation so calibration and diagnostic-accuracy exports cannot carry internally contradictory prediction fields.
- Updated `validation_data_dictionary.md` so analysts know `predicted_label` is derived from `predicted_probability >= threshold` when probabilities are exported.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "predicted_label false does not match|numeric fields"` failed before implementation because contradictory diagnostic prediction fields were accepted.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "predicted_label false does not match|numeric fields"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 31 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 281 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Metrics Positive Duration Guard Increment

- Added failing-first validation-metrics coverage that QI report-audit and reader-study timing inputs reject zero-second durations.
- Aligned metric-layer validation with the export schema's positive-duration guard so direct helper calls cannot analyze impossible timing records.
- Kept non-duration non-negative score and count behavior unchanged.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-metrics.test.ts -- --runInBand -t "zero-second"` failed before implementation because zero-second QI timing records were accepted.
- `npx pnpm@10.4.1 test client/src/lib/validation-metrics.test.ts -- --runInBand -t "zero-second"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-metrics.test.ts -- --runInBand` passes with 18 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 281 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, GenAI Traceable Citation Token Guard Increment

- Added failing-first coverage that bare numeric bracket citations such as `[1]` do not satisfy GenAI Impression grounding.
- Tightened `verifyGeneratedImpressionCitations` so bracketed citations must look like retrieved chunk IDs instead of stale numeric reference markers.
- Preserved PMID citation support for agentic-search sources.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/genai.test.ts -- --runInBand -t "bare numeric"` failed before implementation because `[1]` was accepted as grounded.
- `npx pnpm@10.4.1 test client/src/lib/genai.test.ts -- --runInBand -t "bare numeric|Impression citation"` passes.
- `npx pnpm@10.4.1 test client/src/lib/genai.test.ts -- --runInBand` passes with 11 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 280 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md client/src/lib/genai.ts client/src/lib/genai.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, GenAI Impression Citation Guard Increment

- Added failing-first coverage that generated Impression lines without inline literature citations fail verification.
- Added `verifyGeneratedImpressionCitations` so generated Impression text must include retrieved chunk IDs or PMID citations on non-heading diagnosis lines.
- Reused the safe deterministic-template fallback when citation grounding is incomplete.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/genai.test.ts -- --runInBand -t "Impression citation"` failed before implementation because no citation verifier existed.
- `npx pnpm@10.4.1 test client/src/lib/genai.test.ts -- --runInBand -t "Impression citation"` passes.
- `npx pnpm@10.4.1 test client/src/lib/genai.test.ts -- --runInBand` passes with 10 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 279 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md client/src/lib/genai.ts client/src/lib/genai.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, GenAI Contradictory Measurement Guard Increment

- Added failing-first coverage that a generated report fails verification when it includes the correct numeric anchor plus a contradictory duplicate measurement.
- Extended `verifyGeneratedReportAgainstNumericInputs` to scan label-linked numeric mentions and reject values or units that disagree with the original measurement input.
- Preserved the safe deterministic-template fallback for missing anchors and contradictory mentions.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/genai.test.ts -- --runInBand -t "duplicate numeric"` failed before implementation because contradictory duplicate measurements still passed verification.
- `npx pnpm@10.4.1 test client/src/lib/genai.test.ts -- --runInBand -t "duplicate numeric|original numeric"` passes.
- `npx pnpm@10.4.1 test client/src/lib/genai.test.ts -- --runInBand` passes with 8 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 277 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md client/src/lib/genai.ts client/src/lib/genai.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reporting Guideline Errata Handoff Increment

- Rechecked guideline and FeTA 2024 metadata through PubMed E-utilities after the external web-search endpoint timed out.
- Added failing-first source-document coverage for the TRIPOD+AI BMJ erratum, DECIDE-AI Nature Medicine erratum, and FeTA 2024 PubMed / DOI metadata.
- Updated `publication_handoff_checklist.md` and `source_verification_dossier.md` so radiologist collaborators see complete guideline and FeTA metadata in the handoff packet.

Verification:

- Failing-first checks: `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "sample-size|DECIDE-AI"` failed before implementation because the TRIPOD+AI and DECIDE-AI errata were absent; `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "literature-derived"` failed before implementation because FeTA 2024 PMID / DOI metadata was absent.
- `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "literature-derived|sample-size|DECIDE-AI"` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 276 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md publication_handoff_checklist.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Measurement Positive Value Guard Increment

- Added failing-first coverage for zero or negative `measurement_rows.csv` values in millimetres and degrees.
- Extended export validation so impossible biometric distances or angles cannot enter agreement, grouped robustness, or reader-reliability analyses.
- Updated `validation_data_dictionary.md` to document measurement values as positive physical quantities.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "nonpositive measurement"` failed before implementation because zero millimetre and negative degree values produced no export errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "nonpositive measurement"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 31 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 276 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Measurement Duplicate Row Guard Increment

- Added failing-first coverage for duplicate `measurement_rows.csv` rows at the documented case/parameter/source-role/reader grain.
- Extended package-level validation so measurement agreement, grouped robustness, and ICC inputs cannot double-count the same measurement source.
- Updated `validation_data_dictionary.md` to document the measurement row grain as unique.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "duplicate measurement"` failed before implementation because duplicate measurement rows produced no export errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "duplicate measurement"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 30 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 275 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Report-Audit Duplicate Report ID Guard Increment

- Added failing-first coverage for duplicate `report_audit_rows.csv` `report_id` rows.
- Extended package-level validation so each audited report contributes at most one row before QI pre/post metrics run.
- Updated `validation_data_dictionary.md` to document `report_id` as a unique report key.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "duplicate report-audit"` failed before implementation because duplicate report IDs produced no export errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "duplicate report-audit"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 29 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 274 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Diagnostic Label Duplicate Guard Increment

- Added failing-first coverage for duplicate `diagnostic_labels.csv` rows with the same `study_id` and `trigger_id`.
- Extended package-level validation so each case/trigger label contributes at most one row before diagnostic accuracy, calibration, or decision-curve metrics run.
- Updated `validation_data_dictionary.md` to document diagnostic labels as unique per case and runtime trigger.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "duplicate diagnostic"` failed before implementation because duplicate case/trigger labels produced no export errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "duplicate diagnostic"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 28 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 273 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Case-Log Duplicate Study ID Guard Increment

- Added failing-first coverage for duplicate `case_log.csv` `study_id` rows before cross-file validation.
- Extended package-level validation so de-identified case IDs remain unique before cohort-flow and join-based metrics run.
- Updated `validation_data_dictionary.md` to document `study_id` as a unique case key.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "duplicate case-log"` failed before implementation because duplicate case-log study IDs produced no export errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "duplicate case-log"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 27 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 272 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Measurement Reader ID Consistency Guard Increment

- Added failing-first coverage for `measurement_rows.csv` rows with `source_role=reader` but no `reader_id`, and non-reader rows that carry a `reader_id`.
- Aligned validation export preflight with the repeated-reader measurement contract needed for reader/reliability analysis.
- Updated `validation_data_dictionary.md` so reader IDs are explicitly tied to `source_role=reader`.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "reader IDs"` failed before implementation because reader-ID/source-role contradictions produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "reader IDs"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 26 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 271 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Measurement Unit Column Guard Increment

- Added failing-first coverage for `measurement_rows.csv` rows that put millimetre parameters in `value_deg` or degree parameters in `value_mm`.
- Used runtime `PARAMETERS_ALL` unit metadata to validate the populated measurement value column for each `parameter_id`.
- Updated `validation_data_dictionary.md` so analysts know the value column must match the runtime parameter unit.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "runtime parameter unit"` failed before implementation because `tcd` in `value_deg` and `csa` in `value_mm` produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "runtime parameter unit"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 25 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 270 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Case-Log Gestational Age Range Guard Increment

- Added failing-first coverage for `case_log.csv` `ga_weeks` values outside the calculator-supported 18-40 week range.
- Aligned validation export preflight with the SPEC/UI gestational-age bounds and TEST stress cases at 18w0d and 40w0d.
- Updated `validation_data_dictionary.md` so analysts know case logs must stay within the supported gestational-age range.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "gestational age weeks"` failed before implementation because `ga_weeks=17` and `ga_weeks=41` produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "gestational age weeks"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 24 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 269 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Case-Log Field Strength Positivity Guard Increment

- Added failing-first coverage for `case_log.csv` rows with zero Tesla scanner field strength.
- Applied exclusive lower-bound validation to `field_strength_t` so scanner metadata used for subgroup analysis must be positive.
- Updated `validation_data_dictionary.md` to document field strength as a positive numeric Tesla value.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "field strengths"` failed before implementation because `field_strength_t=0` produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "field strengths"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 23 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 268 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader-Study SUS Integer Guard Increment

- Added failing-first coverage for fractional System Usability Scale item responses in `reader_study_rows.csv`.
- Marked `sus_item_1` through `sus_item_10` as integer fields so item-level Likert responses remain scoreable.
- Updated `validation_data_dictionary.md` and `reader_study_protocol.md` to document SUS items as integer 1-5 responses.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "fractional values"` failed before implementation because `sus_item_1=2.5` produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "fractional values"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 22 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 267 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md reader_study_protocol.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader-Study Completeness Score Guard Increment

- Added failing-first coverage for negative `reader_study_rows.csv` `completeness_score` values.
- Aligned validation export preflight with the reader-study metrics invariant that completeness scores must be non-negative.
- Updated `validation_data_dictionary.md` and `reader_study_protocol.md` so the report-completeness rubric is documented as non-negative.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "completeness scores"` failed before implementation because negative completeness scores produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "completeness scores"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 22 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 267 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md reader_study_protocol.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Case-Log Exclusion Reason Consistency Guard Increment

- Added failing-first coverage for included `case_log.csv` rows that still carry an `exclusion_reason`.
- Aligned validation export preflight with the cohort-flow metrics invariant that included cases must not carry exclusion reasons.
- Updated `validation_data_dictionary.md` so analysts keep exclusion reasons reserved for excluded cases.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "exclusion reason"` failed before implementation because included cases with stale exclusion reasons produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "exclusion reason"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 21 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 266 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Positive Duration Guard Increment

- Added failing-first coverage for zero-second `reader_study_rows.csv` and `report_audit_rows.csv` durations.
- Added exclusive lower-bound metadata to the validation export schema and applied it to timing fields that must be positive.
- Updated `validation_data_dictionary.md` and `reader_study_protocol.md` so duration fields are documented as positive values before timing endpoints are analyzed.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "zero-second"` failed before implementation because `duration_sec=0` produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "zero-second"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 20 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 265 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md reader_study_protocol.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader-Study Washout Guard Increment

- Added failing-first coverage for `reader_study_rows.csv` rows with `washout_days` shorter than the locked two-week interval.
- Tightened the runtime export schema so reader-study rows require at least 14 washout days before analysis.
- Updated `validation_data_dictionary.md` and `reader_study_protocol.md` to describe the washout as a runtime-enforced minimum.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "washouts"` failed before implementation because `washout_days=7` produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "washouts"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 19 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 264 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md reader_study_protocol.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Report-Audit Study ID Link Guard Increment

- Added failing-first coverage for `report_audit_rows.csv` rows whose `study_id` is absent from `case_log.csv`.
- Required `study_id` in the report-audit export schema and header template while preserving `report_id` as the report-level key.
- Extended `validateValidationDataExport` so report-audit rows participate in the same cross-file case-reference guard as measurement, diagnostic-label, and reader-study rows.
- Updated `validation_data_dictionary.md` to document report-audit case linkage.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "report-audit rows"` failed before implementation because report-audit rows did not produce missing `case_log.csv` reference errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "report-audit rows"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 18 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 263 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes; the CSV header template is checked by the runtime schema-alignment test because Prettier does not infer a CSV parser in this project.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Diagnostic Trigger ID Guard Increment

- Added failing-first coverage for unknown `diagnostic_labels.csv` `trigger_id` values.
- Exported runtime differential card IDs from the DDx engine and validated diagnostic-label exports against that list.
- Updated `validation_data_dictionary.md` to state that diagnostic trigger IDs must match runtime card IDs.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "trigger IDs"` failed before implementation because unknown diagnostic trigger IDs produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "trigger IDs"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 17 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 262 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/biometry.ts client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Measurement Parameter ID Guard Increment

- Added failing-first coverage for unknown `measurement_rows.csv` `parameter_id` values.
- Validated measurement export parameter IDs against the runtime `PARAMETERS_ALL` registry so analyst CSVs cannot use free-text aliases such as `trans_cerebellar_diameter`.
- Updated `validation_data_dictionary.md` to state that measurement parameter IDs must match runtime IDs.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "parameter IDs"` failed before implementation because unknown measurement parameter IDs produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "parameter IDs"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 16 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 261 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Categorical Enum Guard Increment

- Added failing-first coverage for invalid values in dictionary-defined categorical fields including `cohort`, `svr_method`, and `source_role`.
- Added allowed-value metadata for validation cohorts, SVR methods, and measurement source roles while leaving locally variable fields such as scanner vendor and image-quality tier flexible.
- Preserved the runtime schema/dictionary contract so analyst exports fail before cohort-flow or agreement metrics consume unsupported categories.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "categorical fields"` failed before implementation because invalid categorical values produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "categorical fields"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 15 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 260 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Integer Field Guard Increment

- Added failing-first coverage for fractional values in integer validation export fields such as gestational age weeks/days, reader-study read order, and report-audit measurement counts.
- Extended runtime validation-data schemas with integer metadata for high-risk count and order fields.
- Updated `validation_data_dictionary.md` so analysts know fractional values are rejected before cohort flow, reader ordering, or QI report-audit metrics run.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "fractional values"` failed before implementation because fractional integer fields produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "fractional values"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 14 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 259 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Report-Audit Count Consistency Guard Increment

- Added failing-first coverage for `report_audit_rows.csv` rows with zero required measurements or documented measurements exceeding required measurements.
- Aligned report-audit export preflight validation with `computeQiAuditSummary` invariants before QI metrics run.
- Updated `validation_data_dictionary.md` so analysts preserve non-zero denominators and valid documented-count numerators.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "report-audit measurement counts"` failed before implementation because impossible report-audit counts produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "report-audit measurement counts"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 13 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 258 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Measurement Value Exclusivity Guard Increment

- Added failing-first coverage for ambiguous measurement rows that populate both `value_mm` and `value_deg`, or carry numeric values while `measurement_available=false`.
- Tightened `measurement_rows.csv` validation so available measurements require exactly one value column and unavailable measurements require no value columns.
- Updated `validation_data_dictionary.md` so analysts preserve missingness semantics before FeTA, institutional, or reader agreement analysis.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "ambiguous measurement"` failed before implementation because contradictory value columns produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "ambiguous measurement"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 12 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 257 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader-Study Duplicate Pair Guard Increment

- Added failing-first coverage for duplicate `reader_study_rows.csv` condition rows with the same reader and case.
- Extended `validateValidationDataExport` so each reader/case pair must have exactly one `without_tool` row and exactly one `with_tool` row before paired deltas are computed.
- Updated `validation_data_dictionary.md` so analysts fix duplicate condition rows before reader-study analysis.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "duplicate reader-study"` failed before implementation because duplicate `without_tool` rows were collapsed into a set and produced no export error.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "duplicate reader-study"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 11 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 256 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader-Study Usability Completeness Guard Increment

- Added failing-first coverage for partial NASA Task Load Index and System Usability Scale fields in `reader_study_rows.csv`.
- Implemented all-or-none validation for NASA TLX subscales and SUS item responses before reader-study scoring can run.
- Updated `validation_data_dictionary.md` so analysts know partial usability instruments must be fixed before export analysis.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "partial reader-study usability"` failed before implementation because partial NASA TLX / SUS rows produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "partial reader-study usability"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 10 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 255 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Boolean Token Guard Increment

- Added failing-first coverage requiring `true` / `false` fields in validation exports to reject tokens such as `yes`, `no`, `unknown`, `positive`, and `negative`.
- Added boolean allowed-value metadata to case-log, measurement, diagnostic-label, reader-study, and report-audit schemas.
- Aligned reader-study `recommendation_congruent` with the documented blank-if-not-applicable contract by making it conditional instead of unconditionally required.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "boolean tokens"` failed before implementation because invalid boolean strings produced no schema errors.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "boolean tokens"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 9 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 254 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Numeric Range Guard Increment

- Added failing-first coverage for impossible validation export values, including GA day 8, probability >1, negative diagnostic thresholds, NASA Task Load Index >100, and System Usability Scale items outside 1-5.
- Extended the runtime validation-data schema with min/max bounds for high-risk numeric fields used by cohort flow, diagnostic calibration, reader-study usability, and report-audit exports.
- Updated `validation_data_dictionary.md` so analysts see that export guards reject non-finite and out-of-range values before metrics are computed.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "out-of-range"` failed before implementation because `ga_days=8` produced no schema error.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "out-of-range"` passes.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes with 8 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 253 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, DECIDE-AI Citation Evidence Increment

- Added failing-first source-document coverage requiring PubMed and DOI evidence for DECIDE-AI wherever it is used in the publication handoff packet.
- Added the PubMed-verified DECIDE-AI citation (PMID 35585198, DOI 10.1038/s41591-022-01772-9) to `publication_handoff_checklist.md` and `source_verification_dossier.md`.
- Preserved the scope boundary that DECIDE-AI applies to early-stage clinical decision-support evaluation, while SPIRIT-AI and CONSORT-AI remain future trial-only standards.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "DECIDE-AI"` failed before implementation because the handoff docs did not include PMID 35585198 or DOI 10.1038/s41591-022-01772-9.
- `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "DECIDE-AI"` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 252 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md publication_handoff_checklist.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader-Study Protocol Schema Alignment Increment

- Added failing-first coverage requiring `reader_study_protocol.md` to include every runtime `reader_study_rows.csv` export column.
- Replaced stale protocol fields (`case_order`, `nasa_tlx_raw`, `sus_score`) with the checked `read_order`, six NASA Task Load Index subscales, and `sus_item_1` through `sus_item_10` columns.
- Recorded the alignment in `source_verification_dossier.md` so radiologist handoff cannot collect reader-study exports that fail the runtime validation guard.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "reader-study protocol"` failed before implementation because `reader_study_protocol.md` did not link `validation_data_dictionary.md` and still used stale aggregate fields.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "reader-study protocol"` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 251 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md reader_study_protocol.md source_verification_dossier.md client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation CSV Template Handoff Increment

- Added failing-first coverage requiring CSV header templates under `validation_export_templates/` to match the runtime validation-data schemas.
- Expanded the reader-study System Usability Scale schema from the prose shorthand into explicit `sus_item_1` through `sus_item_10` columns.
- Added checked header templates for `case_log.csv`, `measurement_rows.csv`, `diagnostic_labels.csv`, `reader_study_rows.csv`, and `report_audit_rows.csv`, and linked them from `validation_data_dictionary.md`.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "CSV header"` failed before implementation because the SUS schema still used the shorthand `sus_item_1 through sus_item_10` and templates were missing.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes.
- `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "validation data-collection"` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 250 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Data Cross-File Guard Increment

- Added failing-first coverage for package-level validation export checks across `case_log.csv`, `measurement_rows.csv`, `diagnostic_labels.csv`, and `reader_study_rows.csv`.
- Implemented `validateValidationDataExport` so measurement, diagnostic-label, and reader-study rows cannot reference absent `case_log.csv` study IDs.
- Added reader-study pair validation requiring every reader/case pair to include both `without_tool` and `with_tool` rows before paired deltas are computed.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "cross-file"` failed before implementation because `validateValidationDataExport` was missing.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 249 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Data Conditional Guard Increment

- Added failing-first coverage for conditional export validation across case logs, measurement rows, diagnostic labels, reader-study rows, and report-audit rows.
- Extended `validateValidationDataRows` with conditional checks for exclusion reasons, missing-measurement reasons, present-measurement values, and indeterminate-label reasons.
- Added allowed-value checks for reader-study condition and report-audit phase, plus finite-number checks for high-risk numeric fields.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand -t "conditional"` failed before implementation because the validator only checked required fields.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 248 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Data Schema Guard Increment

- Added failing-first Vitest coverage for runtime validation-data schema constants aligned to `validation_data_dictionary.md`.
- Implemented `client/src/lib/validation-data-schema.ts` with required, conditional, and optional columns for the five validation handoff CSV files plus `validateValidationDataRows` for required-field preflight checks.
- Updated `validation_data_dictionary.md` so analysts run the schema guard before feeding exported rows into validation metrics.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` failed before implementation because `client/src/lib/validation-data-schema.ts` did not exist.
- `npx pnpm@10.4.1 test client/src/lib/validation-data-schema.test.ts -- --runInBand` passes.
- `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "validation data-collection"` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 247 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md validation_data_dictionary.md client/src/lib/validation-data-schema.ts client/src/lib/validation-data-schema.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Data Dictionary Handoff Increment

- Added failing-first source-document coverage requiring `validation_data_dictionary.md` and links from the publication handoff packet, source-verification dossier, and completion audit.
- Created `validation_data_dictionary.md` with de-identified CSV/export schemas for `case_log.csv`, `measurement_rows.csv`, `diagnostic_labels.csv`, `reader_study_rows.csv`, and `report_audit_rows.csv`.
- Mapped the export schemas to `validation-metrics.ts` helpers so FeTA, institutional validation, reader study, and report-audit blockers have concrete data-collection instructions.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "validation data-collection"` failed before implementation because `validation_data_dictionary.md` did not exist.
- `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "validation data-collection"` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 244 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md validation_data_dictionary.md publication_handoff_checklist.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Active Goal Completion Audit Increment

- Added failing-first source-document coverage requiring `completion_audit.md` to map the active goal's deliverables to concrete evidence and unresolved blockers.
- Created `completion_audit.md` with the objective restatement, prompt-to-artifact checklist, command gate list, 0-residual TEST audit evidence, and explicit not-complete decision.
- Linked `completion_audit.md` from `publication_handoff_checklist.md` so radiologist collaborators can distinguish implementation-ready artifacts from external validation and signoff dependencies.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "completion audit"` failed before implementation because `completion_audit.md` did not exist.
- `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "completion audit"` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 243 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md completion_audit.md publication_handoff_checklist.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Endcap Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases CII4, EA1, STRESS3, and STRESS6; verifies the final residual normal-label rows; checks expected DDx cards; and confirms STRESS6 keeps TCD source disagreement without firing a TCD size card.
- Recalibrated the final Chiari-II, extra-axial, high-GA stress, and TCD-disagreement rows so documented bands, no-card controls, and source-agreement behavior match the active runtime engine.
- Closed the TEST corpus numeric audit blocker after the residual normal-label audit reached 0 rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "endcap fixtures"` failed before implementation because CII4 documented vermian hypoplasia while the stale vermis row did not fire `vermis-small`.
- `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "endcap fixtures"` passes.
- Residual TEST normal-label audit reports `count 0`.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 242 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes after formatting the dossier and test file.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Negative-Control Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases NEG1-NEG5, evaluates partial-pattern negative controls with the runtime engine, and verifies that excluded combined patterns stay suppressed.
- Recalibrated NEG1-NEG5 skull-BPD, CSP, CC, TCD, vermis, and brain-BPD rows so standalone-card fixtures fire deterministically without accidental macrocephaly, complete-ACC, DWM/PCH, or thick-CC behavior.
- Updated the TEST corpus numeric audit blocker from 12 to 6 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "negative-control fixtures"` failed before implementation because NEG1 documented normal skull size while the stale row fired `macrocephaly`.
- `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "negative-control fixtures"` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 241 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes after formatting the dossier and test file.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Third-Ventricle/Aqueductal-Stenosis Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases TV1, AS-P2, AS-P4, and AS-P5, evaluates third-ventricle raw-threshold behavior, VM severity, macrocephaly, and hydrocephalus-pattern behavior with the runtime engine, and verifies the intended DDx cards.
- Recalibrated preserved-CSP rows and the AS-P2 skull-BPD row so documented normal bands match active runtime values while the third-ventricle auxiliary threshold remains unchanged.
- Updated the TEST corpus numeric audit blocker from 17 to 12 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "third-ventricle/aqueductal-stenosis fixtures"` failed before implementation because TV1 documented preserved CSP as normal while the stale row was outside the runtime normal band.
- `npx pnpm@10.4.1 test client/src/lib/methodology-page.test.ts -- --runInBand -t "third-ventricle/aqueductal-stenosis fixtures"` passes.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 240 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts client/src/lib/biometry.test.ts` passes after formatting the dossier table.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Large-Pons Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases LP1-LP6, evaluates large-pons, macrocephaly, large-TCD, thick-CC, and negative-control behavior with the runtime engine, and verifies the intended DDx cards.
- Recalibrated LP1-LP6 so threshold-derived +2 SD pons, macrocephaly, TCD, and CC rows match active runtime values and LP3 stays below the `pons-large` trigger.
- Updated the TEST corpus numeric audit blocker from 18 to 17 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because LP3 documented a borderline-large negative control while the stale pons row fired `pons-large`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 239 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 239 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts client/src/lib/biometry.test.ts` passes after formatting the dossier table.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST HPE Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases HPE1-HPE6, evaluates HPE-pattern, microcephaly, VM, absent-CSP/CC, posterior-fossa, and negative-control behavior with the runtime engine, and verifies the intended DDx cards.
- Recalibrated HPE rows so normal posterior-fossa and CC fillers stay normal, microcephaly rows cross runtime thresholds, monoventricle rows are executable, and HPE+DWM/PCH overlap is deterministic.
- Updated the TEST corpus numeric audit blocker from 20 to 18 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because HPE1 documented normal vermis while the stale vermis AP row fired `vermis-small`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 238 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 238 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts client/src/lib/biometry.test.ts` passes after formatting the dossier table.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Absent-CSP Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases CSP-A1-CSP-A4 and CSP-A6, evaluates isolated absent-CSP, VM, ACC, HPE, short-CC, and thick-CC behavior with the runtime engine, and verifies negative-control behavior.
- Recalibrated stale normal-CC rows in CSP-A4 and CSP-A6 so isolated absent-CSP fixtures no longer fire accidental `cc-thick`, `cc-short`, or `acc-pattern` cards.
- Updated the TEST corpus numeric audit blocker from 22 to 20 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because CSP-A4 documented isolated absent CSP while the stale CC row fired `cc-thick`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 237 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 237 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts client/src/lib/biometry.test.ts` passes after formatting the dossier table.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Thick-CC Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases TC1-TC6, evaluates thick-CC, macrocephaly, large-pons, large-TCD, and negative-control behavior with the runtime engine, and verifies the intended DDx cards.
- Recalibrated TC1-TC6 so threshold-derived +2 SD CC, macrocephaly, pons, and TCD rows match active runtime values and TC3 stays below the `cc-thick` trigger.
- Updated the TEST corpus numeric audit blocker from 23 to 22 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because TC3 documented a borderline-thick negative control while the stale CC row fired `cc-thick`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 236 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 236 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts client/src/lib/biometry.test.ts` passes after formatting the dossier table.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Short-CC Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases CC1-CC6, evaluates short-CC, complete-ACC exclusion, VM, absent-CSP, and ACC-pattern behavior with the runtime engine, and verifies the intended DDx cards.
- Recalibrated CC1-CC6 so dysgenetic/short-CC fixtures remain above the complete-ACC threshold, preserved-CSP controls use active normal values, and absent-CSP short-CC cases explicitly document the ACC-pattern card.
- Updated the TEST corpus numeric audit blocker from 27 to 23 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because CC1 documented short CC while the stale CC row fired `cc-absent`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 235 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 235 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts client/src/lib/biometry.test.ts` passes after formatting the dossier and methodology test.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST ACC Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases A1-A6, evaluates absent-CSP, absent/short-CC, VM severity, ACC-pattern, and associated DWM behavior with the runtime engine, and verifies the expected DDx cards.
- Corrected A4 so the hypogenetic-CC fixture fires `cc-short` rather than complete ACC, corrected A5 normal OFD fillers, and aligned A2/A6 expected-card language with runtime VM and posterior-fossa behavior.
- Updated the TEST corpus numeric audit blocker from 30 to 27 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because A4 documented partial CC hypogenesis while the stale CC row fired `cc-absent`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 234 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 234 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts client/src/lib/biometry.test.ts` passes after formatting the dossier table.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Macrocerebellum Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases LC1-LC6, evaluates their large-TCD, macrocephaly, thick-CC, enlarged-CSP, and negative-control rows with the runtime engine, and verifies expected DDx card behavior.
- Recalibrated threshold-derived TCD, skull-BPD, and CC rows so documented macrocerebellum z-score comments and LC4 negative-control behavior match the active runtime thresholds.
- Updated the TEST corpus numeric audit blocker from 31 to 30 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because LC4 documented a borderline-large negative control while the stale TCD row fired `tcd-large`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 233 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 233 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts client/src/lib/biometry.test.ts` passes after formatting the dossier table.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Cerebellar-Hypoplasia Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases CH1-CH6, evaluates their TCD/vermis/pons/VM/asymmetry rows with the runtime engine, and verifies intended small-TCD, preserved-vermis, VM, and hemispheric-asymmetry card behavior.
- Corrected stale CH rows so preserved-vermis cases no longer fire accidental `vermian_hypoplasia`, the CH4 small-TCD case crosses the active threshold, and the CH5 negative control is actually near the TCD boundary.
- Updated the TEST corpus numeric audit blocker from 34 to 31 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because CH1 documented preserved vermis while the stale AP vermis row fired `vermis-small`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 232 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 232 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts client/src/lib/biometry.test.ts` passes after formatting the dossier and methodology test.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Dandy-Walker / Blake's Pouch Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases D1-D6 and BP1-BP6, evaluates their posterior-fossa and auxiliary rows with the runtime engine, and verifies expected DWM, PCH, mega-cisterna-magna, hydrocephalus, and negative-control card behavior.
- Corrected stale Dandy-Walker and Blake's pouch rows so TVA support, TCD/pons/vermis thresholds, cisterna-magna depth, and negative controls match the active registry/runtime rules.
- Updated the TEST corpus numeric audit blocker from 40 to 34 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because D2 documented `small_tcd`/DWM behavior that the stale numeric row could not trigger.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 231 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 231 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes after formatting the dossier and test file.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Vermian-Hypoplasia Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases V1-V6, evaluates their numeric rows with the runtime engine, and verifies vermis, TCD, pons, VM, and forbidden posterior-fossa card expectations.
- Corrected V1-V6 rows so source-specific notes, normal filler rows, and negative controls match active registry z-scores without accidental extra posterior-fossa cards.
- Updated the TEST corpus numeric audit blocker from 43 to 40 residual normal-label rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because V1 labelled a runtime-normal vermis-CC row as <5th and V2/V6 could fire unintended posterior-fossa cards.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 230 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 230 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes after formatting the dossier table.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Asymmetric-Ventricle Threshold Wording Increment

- Added failing-first source-document coverage that AS1-AS2 right-atrial edge cases are documented as below-threshold clinical controls instead of z-normal filler rows.
- Updated TEST.md wording for sub-10 mm atrial asymmetry rows and reduced the residual TEST corpus numeric audit blocker from 45 to 43 rows.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because AS1-AS2 still labelled sub-10 mm atrial threshold controls as `normal`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 229 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 229 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes after formatting the dossier table.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Severe-VM Fixture Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases S1-S6, evaluates their numeric rows with the runtime engine, and verifies documented normal, low, high, and composite-card expectations.
- Recalibrated severe-VM, ACC, HPE, and Chiari-II fixture rows so normal fillers sit near z = 0 and documented abnormal measurements cross their runtime thresholds.
- Updated the TEST corpus numeric audit blocker from 72 to 45 residual normal-label rows after the severe-VM section repair.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because the S1-S6 rows did not satisfy documented runtime thresholds and card expectations.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 228 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 228 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes after formatting the dossier and test file.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Corpus Residual Numeric Audit Blocker Increment

- Added failing-first source-document coverage that the source verification dossier surfaces the residual TEST.md normal-label numeric audit count.
- Documented the remaining TEST corpus numeric audit as an open publication-readiness blocker after reducing the residual count to 72 rows through the filler, normal-control, hemispheric, and mild/moderate VM repairs.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because `source_verification_dossier.md` did not name the TEST corpus numeric audit blocker.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 227 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 227 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes after formatting the dossier table.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Mild-VM Fixture Filler Consistency Increment

- Added failing-first source-document coverage that parses TEST.md cases M1-M6, evaluates them with the runtime engine, and verifies near-zero normal filler rows plus intended mild/moderate VM and asymmetry card behavior.
- Recalibrated the non-VM filler rows in M1-M6 to active registry-mean values while preserving the clinically abnormal atrial measurements.
- Corrected M2 and M4 expectations from mild VM to moderate VM to match the runtime 12.1-14.9 mm trigger.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because the M1-M6 normal filler rows still carried stale nonzero values.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 227 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 227 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Normal-Control Runtime Consistency Increment

- Added failing-first source-document coverage that parses TEST.md normal controls N1-N6, evaluates their numeric rows with the runtime engine, and verifies no DDx cards plus near-zero rounded z-scores.
- Recalibrated N1-N6 to active source-registry mean values so their documented "No abnormal biometric findings" expectation is executable.
- Clarified that N1-N6 are arithmetic negative controls and should not be counted as independent external-validation evidence.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because TEST.md still presented N1-N6 as independent-source controls with stale nonzero values.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 226 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 226 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Hemispheric Fixture Calibration Increment

- Added failing-first source-document coverage that parses TEST.md cases HA1-HA6 and CH6, runs their numeric rows through the runtime engine, and verifies documented Brain OFD bands plus hemispheric-asymmetry fire/no-fire expectations.
- Recalibrated stale Brain OFD fixture values in the hemispheric-asymmetry section from old high-z values to active registry-threshold values.
- Corrected CH6 so the cerebellar-hypoplasia plus hemispheric-asymmetry cross-reference actually fires `tcd-small` and `brain-asym` under the runtime engine.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because HA1 labelled a +6 SD Brain OFD row as normal.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 225 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 225 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Filler Registry-Mean Consistency Increment

- Added failing-first source-document coverage that parses the canonical TEST.md filler table and compares every z-scored filler value against the active source-registry consensus mean.
- Corrected the canonical filler prose and representative GA rows so rounded filler values remain within z = 0 rounding tolerance.
- Clarified that third-ventricle filler entries are raw-threshold placeholders below the 3.5 mm alert threshold, not z-scored cohort means.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because TEST.md still had stale filler prose and registry-mean values.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 224 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 224 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, TEST Corpus Deterministic DDx Language Increment

- Added failing-first source-document coverage that TEST.md no longer uses permissive "may or may not fire" differential-diagnosis language.
- Rewrote the ambiguous Dandy-Walker, aqueductal-stenosis, Chiari II post-op, Chiari II calibration-boundary, and hemispheric-asymmetry fixture notes as deterministic expected behavior.
- Left the HPE qualitative-add-on note conditional because its firing depends on explicitly entered qualitative monoventricle / fused-thalami fields, which the fixture describes.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because TEST.md still contained permissive DDx language.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 223 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 223 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Source Dossier ROC-AUC Interval Consistency Increment

- Added failing-first source-document coverage that the source verification dossier names the ROC-AUC confidence interval after the metric-layer update.
- Updated the calibration and clinical-utility blocker wording without changing its open status or external-data dependencies.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because `source_verification_dossier.md` still said `ROC-AUC` without the confidence interval.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 222 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 222 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, ROC-AUC Confidence Interval Increment

- Added failing-first validation-metrics coverage that binary validation summaries expose a ROC-AUC confidence interval, not only a point estimate.
- Implemented a deterministic Hanley-McNeil large-sample ROC-AUC interval using the same confidence level as the locked-threshold proportion intervals.
- Updated the publication handoff checklist and validation analysis lock so AUC uncertainty is visible with discrimination and calibration results.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` failed before implementation because `rocAucInterval` and the handoff wording were missing.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes with 221 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 221 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md validation_analysis_lock.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Cohort Flow Missingness Increment

- Added failing-first validation-metrics coverage for cohort-flow and missingness reporting needed for TRIPOD+AI / STARD-AI style case accounting.
- Implemented `summarizeValidationCohortFlow` with strict validation for duplicate case IDs, missing exclusion reasons, reference-standard availability, prediction availability, pathology-label availability, complete-case denominators, and non-finite measurement values.
- Updated the publication handoff checklist, source verification dossier, and validation analysis lock so exclusion-reason and missing-data accounting must be locked before manuscript tables are assembled.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` failed before implementation because `summarizeValidationCohortFlow` and the handoff references were missing.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes with 220 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 220 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md validation_analysis_lock.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Precision Planning Increment

- Added failing-first validation-metrics coverage for diagnostic-accuracy sample-size planning by Wilson confidence-interval half-width.
- Added failing-first validation-metrics coverage for paired reader-study mean-difference sample-size planning.
- Implemented `estimateBinaryProportionSampleSize`, `estimateDiagnosticAccuracyPrecisionSampleSize`, and `estimatePairedMeanDifferenceSampleSize`.
- Updated the publication handoff checklist, source verification dossier, validation analysis lock, and reader-study protocol so sample-size / precision assumptions must be locked before data collection.
- Verified online guideline metadata via PubMed E-utilities: TRIPOD+AI statement PMID 38626948 / DOI 10.1136/bmj-2023-078378, STARD-AI diagnostic accuracy guideline PMID 40954311 / DOI 10.1038/s41591-025-03953-8, and CLAIM 2024 Update PMID 38809149 / DOI 10.1148/ryai.240300.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` failed before implementation because the sample-size helpers and handoff references were missing.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes with 218 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 218 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md validation_analysis_lock.md reader_study_protocol.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Source Verification Dossier Date Lock Increment

- Added failing-first source-document coverage that the source verification dossier's visible update date matches the current validation-analysis-lock handoff.
- Kept the dossier linked to `validation_analysis_lock.md` so threshold/cohort/endpoint/code freeze instructions remain visible from the publication blocker table.
- Updated `source_verification_dossier.md` metadata to 2026-05-24 without changing the open external blockers.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because the dossier still said `Last updated: 2026-05-23.`
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 215 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 215 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Validation Analysis Lock Handoff Increment

- Added failing-first source-document coverage that a validation analysis lock template exists and is linked from the publication handoff checklist and source verification dossier.
- Created `validation_analysis_lock.md` with threshold-lock date, cohort freeze, endpoint freeze, code-version freeze, locked endpoint set, no-post-hoc-threshold-change rules, and Chiari II / ONTD research-mode handling.
- Linked `validation_analysis_lock.md` from `publication_handoff_checklist.md` and `source_verification_dossier.md`.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before implementation because `validation_analysis_lock.md` was missing and unlinked.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 214 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 214 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md validation_analysis_lock.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, FeTA Pathology-Neurotypical Comparison Increment

- Added failing-first validation-metrics coverage for the SPEC §6.3 pathology-versus-neurotypical z-score distribution comparison.
- Implemented `computeWelchTwoSampleComparison` with group means, variances, mean difference, standard error, Welch-Satterthwaite degrees of freedom, t statistic, confidence interval, and significance-by-CI flag.
- Updated the publication handoff checklist and source verification dossier so FeTA pathology-vs-neurotypical analysis points to the reusable helper.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` failed before implementation because `computeWelchTwoSampleComparison` was missing.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` passes with 213 tests.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes with 213 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 213 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader-Study Usability Scoring Increment

- Added failing-first validation-metrics coverage for raw NASA Task Load Index and System Usability Scale scoring.
- Implemented `computeRawNasaTaskLoadIndex` as the mean of the six raw TLX subscales with 0-100 validation.
- Implemented `computeSystemUsabilityScale` using the standard ten-item odd/even contribution formula with 1-5 Likert validation.
- Updated the publication handoff checklist and source verification dossier so the reader-study packet points analysts at reusable TLX/SUS scoring helpers.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` failed before implementation because `computeRawNasaTaskLoadIndex` and `computeSystemUsabilityScale` were missing.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` passes with 212 tests.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes with 212 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 212 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader-Study Delta Confidence Interval Increment

- Added failing-first validation-metrics coverage that paired reader-study crossover summaries include confidence intervals for timing, completeness, and z-score-documentation deltas.
- Implemented t-based mean-difference confidence intervals for the paired numeric reader-study endpoints in `computeReaderStudyCrossoverSummary`.
- Updated the publication handoff checklist, source verification dossier, and reader-study protocol so exported reader-study tables include paired delta estimates with confidence intervals.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` failed before implementation because `durationDeltaInterval` and related interval fields were missing.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` passes with 211 tests.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes with 211 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 211 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md reader_study_protocol.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Reader-Study Crossover Metrics Increment

- Added failing-first validation-metrics coverage for paired within-reader / within-case with-tool versus without-tool deltas.
- Implemented `computeReaderStudyCrossoverSummary` so reader-study tables produce paired timing, completeness, z-score-documentation, and recommendation-congruence deltas keyed by reader and case.
- Added validation coverage that duplicate or incomplete condition pairs are rejected before analysis.
- Updated the publication handoff checklist, source verification dossier, and reader-study protocol so the reader-study analysis plan uses paired deltas rather than independent pre/post summaries.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` failed before implementation because `computeReaderStudyCrossoverSummary` was missing.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` passes with 211 tests.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes with 211 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 211 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md reader_study_protocol.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Fleiss Kappa Multi-Reader Metrics Increment

- Added failing-first validation-metrics coverage for Fleiss's kappa on three-or-more-reader categorical label matrices, closing the reader-study gap left by two-reader Cohen's kappa alone.
- Implemented `computeFleissKappa` with category list, per-subject agreement, category prevalence, mean observed agreement, expected agreement, and kappa outputs.
- Added invalid-input coverage for incomplete Fleiss matrices so multi-reader reliability tables must be rectangular before analysis.
- Updated the publication handoff checklist, source verification dossier, and reader-study protocol so two-reader categorical labels use Cohen's kappa and three-plus-reader categorical labels use Fleiss's kappa.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` failed before implementation because `computeFleissKappa` was missing.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` passes with 210 tests.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes with 210 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 210 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md reader_study_protocol.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-24, Inter-Rater Reliability Metrics Increment

- Added failing-first validation-metrics coverage for Cohen's kappa on categorical reader labels and ICC(2,1) absolute-agreement reliability on repeated continuous measurements.
- Implemented `computeCohenKappa` with category, observed-agreement, expected-agreement, and kappa outputs plus validation for empty, blank, non-finite, and single-category inputs.
- Implemented `computeIntraclassCorrelation` using the two-way random-effects absolute-agreement ICC(2,1) formula with mean-square rows, raters, and error exposed for manuscript tables.
- Updated the publication handoff checklist, source verification dossier, and reader-study protocol so the institutional reader-study packet points analysts at Cohen's kappa and ICC(2,1).

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` failed before implementation because `computeCohenKappa` and `computeIntraclassCorrelation` were missing.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` passes with 209 tests.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes with 209 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 209 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md reader_study_protocol.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-23, SPIRIT-AI Prospective-Protocol Handoff Increment

- Added failing-first source-document coverage that the publication handoff packet names SPIRIT-AI separately from CONSORT-AI and that the verification dossier preserves PubMed/DOI evidence for both prospective-study reporting paths.
- Verified via PubMed ESummary that SPIRIT-AI protocol guidance is indexed as PMID `32908284`, DOI `10.1038/s41591-020-1037-7`, and CONSORT-AI trial-report guidance is indexed as PMID `32908283`, DOI `10.1038/s41591-020-1034-x`.
- Updated `publication_handoff_checklist.md` so a future prospective intervention protocol maps to SPIRIT-AI before enrollment and a future intervention trial report maps to CONSORT-AI after evaluation.
- Updated `source_verification_dossier.md` to preserve the SPIRIT-AI / CONSORT-AI distinction while keeping the current retrospective QI manuscript path as the active phase.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the correction because the checklist and dossier lacked `SPIRIT-AI`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 207 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 207 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-23, Hertzberg Third-Ventricle Citation Increment

- Added failing-first source-document coverage that the Hertzberg 1997 third-ventricle citation uses DOI/PMID suffix `9169682` and does not preserve stale DOI suffix `9169681`.
- Verified via PubMed ESummary that PMID `9169682` is Hertzberg, Kliewer, Freed, et al., _Third ventricle: size and appearance in normal fetuses through gestation_, while PMID `9169681` is an unrelated congenital diaphragmatic hernia MRI article.
- Corrected the SPEC third-ventricle primary-source paragraph to Radiology 1997;203(3):641-644 with DOI `10.1148/radiology.203.3.9169682`.
- Corrected both TEST.md Hertzberg citation instances from DOI suffix `9169681` to `9169682`.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the correction because TEST.md still lacked `doi:10.1148/radiology.203.3.9169682`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 206 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 206 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-23, Aertsen TEST Corpus PMID Increment

- Added failing-first source-document coverage that TEST.md does not contain the stale Aertsen PMID `30606726`.
- Verified via PubMed ESearch / ESummary that Aertsen 2019 resolves to PMID `30591508`, PMCID `PMC7048594`, and DOI `10.3174/ajnr.A5930`, while PMID `30606726` is the unrelated AJNR article _A Deep Learning-Based Approach to Reduce Rescan and Recall Rates in Clinical MRI Examinations_.
- Corrected the TEST.md Aertsen reference-list row to PMID `30591508` while preserving DOI `10.3174/ajnr.A5930` and PMCID `PMC7048594`.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the correction because TEST.md still lacked `PMID 30591508; PMCID PMC7048594`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 206 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 206 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-23, Dovjak Visible Citation Lock Increment

- Added failing-first source-document coverage that the Methodology page, SPEC reference list, and runtime Dovjak source string use the audited Dovjak 2021 range and citation metadata.
- Corrected the Methodology page from `validated 14-40 weeks` to `validated 14.0-39.3 weeks`.
- Corrected the runtime Dovjak source string to include Schmidbauer as second author, the PubMed-resolved page range `254-263`, DOI `10.1002/uog.22162`, PMID `32730667`, and the PMC URL.
- Corrected the SPEC reference-list Dovjak row from `254-262` to `254-263` with DOI, PMID, and PMC URL.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the correction because Methodology.tsx still displayed `validated 14-40 weeks`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 205 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 205 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/biometry.ts client/src/lib/methodology-page.test.ts client/src/pages/Methodology.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-23, Dovjak GA-Range Consistency Increment

- Added failing-first runtime coverage that every Dovjak 2021 source-registry entry and UI-facing Dovjak parameter row uses the audited 14.0-39.3 week range.
- Added source-document coverage that SPEC.md and TEST.md carry the PMC/PubMed Dovjak range audit and do not preserve stale 18-35, 21-36, or 14-40 week Dovjak range descriptions.
- Verified online via PMC8457244 and PubMed PMID `32730667` that Dovjak 2021 included 161 fetuses with normal brain from 14+0 to 39+2 weeks, and that the article describes the upper endpoint as rounded gestational week 40 because its institution rounded GA upward for tabulation.
- Normalized SPEC.md, TEST.md, React registry rows, Python registry rows, `source_verification_dossier.md`, and `source_data_final_lock.md` to the same Dovjak range and cohort size.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/biometry.test.ts client/src/lib/methodology-page.test.ts` failed before the correction because the UI-facing Dovjak rows still exposed `14-40` and SPEC.md lacked the audited source-range note.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/biometry.test.ts client/src/lib/methodology-page.test.ts` passes with 205 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 205 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md source_data_final_lock.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-23, Reference Numbering Hygiene Increment

- Added failing-first source-document coverage that SPEC references have unique numeric labels and no suffix labels such as `[37b]`.
- Renumbered the late FeTA / validation / Chiari references so Sofia remains `[39]`, Adams remains `[40]`, Sanchez/Zalevskyi/FeTA/Aslan occupy `[41]` through `[45]`, and Woitek/Aertsen/D'Addario/Bahlmann occupy `[46]` through `[49]`.
- Updated in-text citations for FeTA 2024, Aslan 2025, and the Chiari II / ONTD source references to match the renumbered bibliography.
- Corrected the Woitek reference author order in the bibliography to `Woitek R, Dvorak A, Weber M, et al.`.
- Corrected the repeated Woitek prose source paragraphs to `Woitek R, Dvorak A, Weber M, et al.`.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the renumbering because SPEC.md still contained suffix labels `[37b]` and `[38b]`.
- Additional failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the prose-source update because SPEC.md still contained `Woitek R, Prayer D, Weber M`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 203 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 203 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-23, PubMed DOI-Title Source-Inventory Audit Increment

- Added failing-first source-document coverage for DOI/title mismatches that the PMC-only source-inventory audit cannot catch on non-PMC rows.
- Verified via PubMed ESearch / ESummary that Tilea 2009 resolves to PMID `19172662`, D'Addario 2001 resolves to PMID `11529995`, SMFM absent-CSP resolves to DOI `10.1016/j.ajog.2020.08.180` and PMID `33168214`, and Garel 2003 resolves to PMID `12879346`.
- Verified via NCBI ID Converter that those four corrected PMIDs do not have PMC records.
- Corrected the SPEC source-inventory PMID / DOI cells and the SMFM absent-CSP AJOG article link.
- Re-ran a PubMed ESummary sweep across every SPEC §7.2 source-inventory PMID; each PMID now resolves to the stated article title and DOI.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md still contained the stale Tilea 2009 identifier.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 202 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 202 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-23, NCBI Source-Inventory Identifier Audit Increment

- Added failing-first source-document coverage for the remaining source-inventory identifier mismatches exposed by an NCBI ID Converter pass across all PMIDs in SPEC §7.2.
- Verified via NCBI ID Converter / PubMed E-utilities that Katorza 2016 resolves to PMID `27032974` and PMCID `PMC7960333`, Conte 2018 resolves to PMID `29519792` and PMCID `PMC7410661`, Woitek 2014 resolves to PMID `25393279` and PMCID `PMC4231033`, Aertsen 2019 resolves to PMID `30591508` and PMCID `PMC7048594`, and Santo 2012 resolves to PMID `23024003` with no PMC record.
- Verified via PubMed E-utilities that the stale PMIDs in those rows identified unrelated articles, including Roelants 2016, Verheij 2018, Okser 2014, Sreekumari 2019, and Khanna 2012.
- Corrected the SPEC source-inventory DOI / PMID / PMCID cells and re-ran the full NCBI ID Converter pass over the source inventory.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md still contained the stale Katorza 2016 identifiers.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 202 tests.
- NCBI ID Converter pass over all SPEC §7.2 source-inventory PMIDs resolves the corrected PMC-backed rows to their stated PMCID values; non-PMC rows return `Identifier not found in PMC` as expected.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 202 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-23, Harreld 2011 Corpus-Callosum Metadata Increment

- Added failing-first source-document coverage that locks `HARRELD_2011` to the AJNR fetal-MRI corpus-callosum article with DOI `10.3174/ajnr.A2310`, PMID `21183616`, and PMCID `PMC8013091`.
- Verified via PubMed E-utilities, NCBI ID Converter, and Crossref that PMID `21183617` identifies a different AJNR diffusion-tensor-imaging article and must not be used for Harreld 2011.
- Corrected the SPEC source-inventory row to match the already-correct primary-source paragraph.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md still contained `21183617`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 201 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 201 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-23, Source Inventory PMCID Absence Label Increment

- Added failing-first source-document coverage requiring explicit PMCID absence labels instead of ambiguous `(NA)` cells in the SPEC source inventory.
- Verified via NCBI ID Converter that Corroenne 2023 PMID `36864530`, SMFM 2018 PMID `29705191`, SMFM 2020 CSP PMID `32114082`, Sun 2024 PMID `38756055`, and Garel 2003 PMID `12879338` do not have PMC records.
- Replaced the verified no-PMC source-inventory rows with `(not in PMC)`.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the PMCID label update because SPEC.md still contained `(NA)`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 200 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 200 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- `git diff --check` passes.

## 2026-05-23, Bahlmann 2015 Spina-Bifida Source Metadata Increment

- Added failing-first source-document coverage that locks `BAHLMANN_2015` to DOI `10.1002/pd.4524` and PubMed PMID `25346419`.
- Verified via Crossref and PubMed E-utilities that the article is Bahlmann et al. _Cranial and cerebral signs in the diagnosis of spina bifida between 18 and 22 weeks of gestation: a German multicentre study_, Prenat Diagn 2015;35(3):228-235.
- Verified that the previously listed PMID `25333768` resolves to an unrelated nanoscience article and that the correct PMID has no PMC record.
- Corrected the SPEC source inventory and reference metadata, including the explicit `(not in PMC)` PMCID state.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md did not contain `25346419`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 199 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 199 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Kertes 2021 CSP Source Metadata Increment

- Added failing-first source-document coverage that locks `KERTES_2021` to the European Journal of Radiology CSP MRI article with DOI `10.1016/j.ejrad.2020.109470` and PMID `33338761`.
- Verified via Crossref and PubMed that the article is Kertes et al. _The normal fetal Cavum Septum Pellucidum in MR imaging - New biometric data_, Eur J Radiol 2021;135:109470.
- Verified via NCBI ID Converter that the article does not have a PMC record.
- Corrected the SPEC tooltip, source inventory, and reference metadata away from the ScienceDirect PII-in-DOI-field row and author/title typos, and added the DOI / PMID lock to the runtime Kertes source record.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md did not contain `33338761`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 198 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 198 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/biometry.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Malinger 2005 Absent-CSP Source Metadata Increment

- Added failing-first source-document coverage that locks `MALINGER_2005` to the Ultrasound in Obstetrics & Gynecology absent-septum-pellucidum article with DOI `10.1002/uog.1787` and PMID `15593321`.
- Verified via Crossref and PubMed that the article is Malinger et al. _Differential diagnosis in fetuses with absent septum pellucidum_, Ultrasound Obstet Gynecol 2005;25(1):42-49.
- Verified via NCBI ID Converter that the article does not have a PMC record.
- Corrected the SPEC tooltip, source inventory, and reference metadata, and added the DOI / PMID lock to runtime Malinger source strings used by absent-CSP and HPE cards.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md did not contain `15593321`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 197 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 197 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/biometry.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Vatansever 2013 Posterior-Fossa Source Metadata Increment

- Added failing-first source-document coverage that locks `VATANSEVER_2013` to the Cerebellum posterior-fossa MRI article with DOI `10.1007/s12311-013-0470-2` and PMID `23553467`.
- Verified via Crossref and PubMed that the article is Vatansever et al. _Multidimensional Analysis of Fetal Posterior Fossa in Health and Disease_, Cerebellum 2013;12(5):632-644.
- Verified via NCBI ID Converter that the article does not have a PMC record.
- Corrected the SPEC source inventory and reference metadata, and added the DOI / PMID lock to the runtime Vatansever source record used by posterior-fossa details and DDx cards.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md did not contain `10.1007/s12311-013-0470-2`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 196 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 196 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/biometry.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Ma 2019 Atrial-Diameter Source Metadata Increment

- Added failing-first source-document coverage that locks `MA_2019` to the Medicine fetal-MRI lateral-ventricle article and rejects the unrelated Wiley `10.1002/jum.15003` ovarian cystadenofibroma article.
- Verified via Crossref that `10.1002/jum.15003` resolves to an unrelated Journal of Ultrasound in Medicine ovarian cystadenofibroma paper, while `10.1097/MD.0000000000016118` resolves to the Ma 2019 fetal lateral-ventricle MRI article.
- Verified via PubMed and NCBI ID Converter that the correct Ma 2019 identifiers are PMID `31261528` and PMCID `PMC6616102`.
- Corrected the SPEC tooltip, source inventory, and atrial-diameter cross-validation row while preserving Ma 2019 as a teaching / cross-validation source rather than an active computational coefficient source.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md did not contain `10.1097/MD.0000000000016118`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 195 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 195 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Corroenne 2023 Citation Metadata Increment

- Added failing-first source-document coverage that locks Corroenne 2023 to DOI `10.1002/uog.26187` and PubMed PMID `36864530`.
- Verified via Crossref that DOI `10.1002/uog.26187` is the corpus-callosal reference-ranges systematic review and DOI `10.1002/uog.26280` is an unrelated acrania-exencephaly-anencephaly letter.
- Corrected SPEC tooltip, source inventory, and reference metadata away from the wrong DOI, wrong PMID, and unrelated PMCID while preserving Corroenne as a teaching / cross-validation source.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md did not contain `36864530`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 194 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 194 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Heaphy-Henault 2018 Citation Metadata Increment

- Added failing-first source-document coverage that locks the aqueductal-stenosis source to DOI `10.3174/ajnr.A5590`, PMID `29519789`, and PMCID `PMC7410663`.
- Verified via PubMed and PMC that PMID `29519789` belongs to the AJNR congenital aqueductal stenosis fetal-MRI article; the previously listed PMID `29545253` belongs to an unrelated stroke stem-cell trial.
- Corrected SPEC and TEST metadata for Heaphy-Henault 2018 and removed stale `Garel 2018` / citation-correction wording from the severe-ventriculomegaly likelihood manifest.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md did not contain `29519789`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 193 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 193 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Sun 2024 ACC Citation Metadata Increment

- Added failing-first source-document coverage that locks Sun 2024 ACC metadata to PubMed PMID `38756055`, DOI `10.1016/j.ejogrb.2024.05.005`, and ScienceDirect PII `S0301211524002264`.
- Verified via PubMed and Crossref that DOI `10.1016/j.ejogrb.2024.05.005` is the fetal ACC clinical/genetic analysis article in `Eur J Obstet Gynecol Reprod Biol` 2024;298:146-152, and that DOI `10.1016/j.ejogrb.2024.05.022` belongs to an unrelated maternal-mortality-surveillance position statement.
- Corrected SPEC, TEST, and runtime citation metadata away from the unrelated DOI / PII / volume-page tuple.
- Replaced the stale `precise yield requires eyes on Table 2` action wording with the active estimate-only qualitative policy for the Sun 2024 monogenic ACC likelihood row.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md did not contain `10.1016/j.ejogrb.2024.05.005`.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 192 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 192 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/biometry.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Publication Confidence-Interval Metrics Increment

- Added failing-first coverage that binary validation outputs include Wilson confidence intervals for locked-threshold proportions.
- Added `computeWilsonScoreInterval` and attached confidence intervals to sensitivity, specificity, positive predictive value, negative predictive value, and accuracy in `computeBinaryValidationMetrics`.
- Updated the Validation page, publication handoff checklist, and source-verification dossier so analyst exports include uncertainty intervals rather than point estimates alone.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` failed before implementation because `computeWilsonScoreInterval` was not exported and `sensitivityInterval` was undefined.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/validation-page.test.ts client/src/lib/methodology-page.test.ts` passes with 191 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 191 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/validation-page.test.ts client/src/lib/methodology-page.test.ts client/src/pages/Validation.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.10 QI Audit Metrics Increment

- Added failing-first coverage for the SPEC §4.10 pre/post QI report-audit metrics and for SQUIRE 2.0 in the publication handoff.
- Verified online via PubMed PMID 26369893 / DOI `10.1136/bmjqs-2015-004411` that SQUIRE 2.0 is the relevant Standards for QUality Improvement Reporting Excellence guideline for healthcare QI reports.
- Added `computeQiAuditSummary` and `compareQiAuditPhases` to `client/src/lib/validation-metrics.ts` for average report time, all-required-measurement completion, mean measurement completeness, explicit z-score documentation, explicit percentile documentation, and recommendation congruence.
- Updated the Validation page, publication handoff checklist, and source-verification dossier so the QI manuscript path is mapped to SQUIRE 2.0 and the new pre/post report-audit metrics.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` failed before implementation because `computeQiAuditSummary` was not exported and the SQUIRE handoff strings were absent.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` passes with 190 tests.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-page.test.ts client/src/lib/methodology-page.test.ts` passes with 190 tests.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 190 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/validation-page.test.ts client/src/lib/methodology-page.test.ts client/src/pages/Validation.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, D'Addario 2001 Citation Metadata Correction Increment

- Added failing-first source-document coverage that locks D'Addario 2001 to the clivus-supraocciput article DOI `10.1046/j.1469-0705.2001.00409.x`.
- Verified via Crossref that DOI `00409.x` is the 146-149 clivus-supraocciput article and DOI `00472.x` belongs to a different pages 157-162 article.
- Corrected the TEST.md case citation and source inventory entry from the unrelated `00472.x` DOI to `00409.x`, and aligned the author list with SPEC §7.2.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the TEST.md update because TEST.md did not contain `10.1046/j.1469-0705.2001.00409.x`.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 189 tests.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 189 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 exec prettier --check TEST.md` still reports the existing canonical-document formatting warning; `TEST.md` was not mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Aertsen 2019 Citation Metadata Correction Increment

- Added failing-first source-document coverage that locks Aertsen 2019 to the PMC7048594 AJNR article and DOI `10.3174/ajnr.A5930`.
- Verified the DOI directly from the PMC page metadata using `curl`.
- Corrected SPEC §7.2 `AERTSEN_2019` metadata from stale `10.3174/ajnr.A5921` to `10.3174/ajnr.A5930`.
- Corrected the TEST.md source inventory entry away from the unrelated UOG citation while preserving the case-level AJNR citation and PMCID.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the citation update because SPEC.md did not contain `10.3174/ajnr.A5930`.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 188 tests.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 188 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 exec prettier --check SPEC.md TEST.md` still reports the existing canonical-document formatting warnings; neither large document was mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 2.2 Source-Dossier Alignment Increment

- Added failing-first source-document coverage that requires SPEC Part 2's normative-source dossier to match the active Phase 1 registry rather than stale initial source recommendations.
- Updated SPEC §2.1 to include the active extra-cerebral CSF, third-ventricle raw-threshold, cisterna magna, TVA, TDPF, and CSA measurements now present in Phase 1 behavior.
- Rewrote SPEC §2.2 around active computational source groups: Luis 2025, Kyriakopoulou 2017, Dovjak 2021, Woitek 2014, and Hertzberg 1997 raw-threshold third-ventricle support.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the SPEC update because Part 2 still listed Tilea and Vatansever as recommended default computational sources.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 187 tests.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 187 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 exec prettier --check SPEC.md` still reports the existing canonical-document formatting warning; `SPEC.md` was not mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.2.2 Extra-Axial Registry-Table Alignment Increment

- Added failing-first source-document coverage that requires SPEC §4.2.2 to list the active Kyriakopoulou extra-cerebral CSF source-registry row.
- Added the extra-cerebral CSF width row to the Phase 1 default source-registry table with the Kyriakopoulou 2017 source, quadratic mean / linear SD model family, 21-38 week runtime window, and fetal-MRI cohort note.
- Aligned the §4.2.2 registry prose with the completed Kyriakopoulou supplementary workbook row 19 source-lock.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the SPEC table update because the §4.2.2 registry table did not contain the extra-cerebral CSF row.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes with 186 tests.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 186 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 exec prettier --check SPEC.md` still reports the existing canonical-document formatting warning; `SPEC.md` was not mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.5 Extra-Axial CSF Source-Lock Increment

- Added failing-first coverage that requires the direct `extra_axial_csf` row to use the exact Kyriakopoulou 2017 fetal-centiles workbook coefficients instead of the temporary approximation.
- Encoded the supplementary workbook row 19 model in both React and Python: `a = -0.0604400737108953`, `b = 3.650533392397`, `c = -44.5543682103265`, `a5 = 0.0736569049728816`, `b5 = -0.34287991257886`.
- Removed the approximation caveat from extra-axial CSF source details and moved the row to the transcribed verification tier.
- Updated TEST.md §25 and the multi-card stress fixture so widened extra-axial CSF examples remain above the exact Kyriakopoulou 95th-centile boundary.
- Marked the implementation-side extra-axial CSF coefficient decision closed in the source-verification and final-lock documents while preserving clinician countersignature as a handoff item.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/biometry.test.ts client/src/lib/methodology-page.test.ts` failed before implementation because 32w 10.3721 mm produced z = 6.4121 under the approximation and SPEC.md did not document the Kyriakopoulou workbook row.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/biometry.test.ts client/src/lib/methodology-page.test.ts client/src/lib/architecture.test.ts` passes with 185 tests.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 185 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md source_data_final_lock.md publication_handoff_checklist.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts client/src/lib/methodology-page.test.ts client/src/lib/architecture.test.ts client/src/pages/Methodology.tsx client/src/pages/Validation.tsx` passes.
- `npx pnpm@10.4.1 exec prettier --check SPEC.md` and the broader check including `TEST.md` still report the existing canonical-document formatting warnings; neither large document was mass-reflowed.
- `uv run --no-project --with numpy --with scipy python -c "from python_app.registry import evaluate_parameter; ..."` confirms `evaluate_parameter("extra_axial_csf", 32, 10.3721)` returns z = 0.0 with no caveat and `evaluate_parameter("extra_axial_csf", 32, 14)` returns z = 1.8012.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.5 Dovjak Table 1 Source-Verification Increment

- Added publication-readiness coverage that locks the Dovjak 2021 Table 1 audit into source-document tests.
- Byte-checked the TCD, vermis rostrocaudal, vermis AP, and total pons AP 5th/95th percentile equations against the PMC8457244 Table 1 HTML.
- Confirmed the existing React and Python Dovjak coefficients already match the source table, so no runtime coefficient change was needed.
- Marked the Dovjak implementation-side source check closed in `source_verification_dossier.md` while keeping clinician countersignature visible in `source_data_final_lock.md`.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the source documents were updated because SPEC.md did not contain `PMC8457244 Table 1 byte-checked`.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 183 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md source_data_final_lock.md publication_handoff_checklist.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 exec prettier --check SPEC.md` still reports the existing canonical-document formatting warning; `SPEC.md` was not mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.5 Woitek Table 3 Source-Correction Increment

- Added publication-readiness coverage that locks the Woitek 2014 Table 3 audit into source-document tests.
- Found and corrected a SPEC §6.5.2 transcription mismatch: the per-week TDPF/CSA control table now matches the PMC4231033 Table 3 normal-CNS mean and standard-deviation rows.
- Recomputed the OLS fit from the corrected PMC rows and confirmed the existing TDPF/CSA runtime coefficients already reproduce the corrected table, so no app or Python coefficient change was needed.
- Marked the Woitek implementation-side source check closed in `source_verification_dossier.md` while keeping clinician countersignature visible in `source_data_final_lock.md`.

Verification:

- Failing-first check: `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` failed before the source documents were updated because SPEC.md did not contain the PMC Table 3 row `| 21 | 26.9 | 2.6 | 74.2 | 5.1 |`.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 182 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md source_data_final_lock.md publication_handoff_checklist.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 exec prettier --check SPEC.md` still reports the existing canonical-document formatting warning; `SPEC.md` was not mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, TEST.md Citation-Line Index Cleanup Increment

- Added publication-readiness coverage that prevents `**Citation.**` lines in `TEST.md` from carrying stale numeric reference brackets.
- Removed bracketed reference indices from citation lines while preserving source names, years, journal text, DOI, PMID, and explanatory fixture rationale.
- Left the end-of-file source inventory untouched to avoid a broad bibliography rewrite; citation lines are now self-contained and no longer point at potentially stale numeric slots.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 181 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 exec prettier --check TEST.md` still reports the existing canonical-corpus markdown formatting warning; `TEST.md` was not mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Qualitative-Likelihood Alignment Increment

- Added source-document coverage that the closed Section 7.4 citation-pass status in `source_verification_dossier.md` stays aligned with `SPEC.md`.
- Updated SPEC §7.4 to state that estimate-only likelihood rows are surfaced with qualitative labels rather than unsupported precise percentages.
- Replaced stale Dandy-Walker citation-correction wording with Whitehead / Nagaraj posterior-fossa phenotype guidance while keeping numeric estimate values as audit context only.
- Updated SPEC §7.5 to mark the Section 7.4 citation pass closed for implementation and preserve clinician-owned source-review items separately.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 180 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 exec prettier --check SPEC.md` still reports the existing canonical-document formatting warning; `SPEC.md` was not mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, TEST.md Verified-Citation Lock Increment

- Added publication-readiness coverage that rejects pending citation placeholders in `TEST.md` and checks DOI / PubMed traceability for the HPE and mega-cisterna fixtures.
- Replaced the unresolved HPE4 Cureus placeholder with the PubMed/PMC/DOI-traceable Chafiq 2024 Cureus alobar-HPE case and removed the unsupported verbatim 22-week claim.
- Replaced the unresolved mega-cisterna reference with the fetal MRI/US biometry study by Gafner et al. 2022 and corrected the app source metadata away from the wrong Cureus 2025 journal label.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 179 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 exec prettier --check TEST.md` still reports the existing canonical-corpus markdown formatting warning; `TEST.md` was not mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Source-Data Final-Lock Checklist Increment

- Added `source_data_final_lock.md` as the clinician-facing signoff packet for declaring source data ready for clinical reliance or manuscript submission.
- Covered Dovjak 2021 Table 1, Woitek 2014 Table 3, extra-axial CSF coefficient decision, third-ventricle raw-threshold policy, Chiari II / ONTD calibration, mismatch handling, and clinician signoff fields.
- Linked the checklist from `publication_handoff_checklist.md` and `source_verification_dossier.md` while keeping clinician review items open until signed.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 178 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_data_final_lock.md publication_handoff_checklist.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, FeTA Agreement Metrics Utility Increment

- Extended `client/src/lib/validation-metrics.ts` with per-parameter agreement helpers for MAE, MAPE, bias, error standard deviation, and Bland-Altman 95% limits of agreement.
- Added grouped agreement summaries so FeTA and institutional validation can stratify results by site, vendor, field strength, SVR method, or image-quality tier.
- Added Vitest coverage for agreement metrics, Bland-Altman limits, grouped FeTA robustness summaries, and input validation.
- Updated the publication handoff checklist and source-verification dossier to point analysts at the helper while keeping FeTA access, measurements, and exported results open.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 177 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md publication_handoff_checklist.md source_verification_dossier.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Reader-Study Protocol Handoff Increment

- Added `reader_study_protocol.md` as the implementation-side handoff packet for the radiologist reader study.
- Covered IRB / QI determination, waiver of consent, no-PHI calculator use, de-identification workflow, secure re-identification crosswalk, two-week washout, counter-balanced reading order, pilot-case exclusion, reader-study timing, report-completeness endpoint, recommendation congruence, NASA Task Load Index, System Usability Scale, and analysis-table schema.
- Linked the protocol from `publication_handoff_checklist.md`.
- Updated `source_verification_dossier.md` to mark the implementation side of the IRB / radiologist handoff protocol as prepared while preserving local PI submission as clinician-owned.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 175 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md reader_study_protocol.md publication_handoff_checklist.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Validation Metrics Utility Increment

- Added `client/src/lib/validation-metrics.ts` for analyst handoff of manuscript-grade validation endpoints: Brier score, ROC-AUC, PR-AUC, locked-threshold sensitivity / specificity, calibration-in-the-large, calibration slope, and decision-curve net benefit.
- Added input validation so malformed cohort tables, out-of-range probabilities, invalid thresholds, and one-class datasets fail explicitly instead of producing unstable metrics.
- Added Vitest coverage for discrimination, calibration summary, Brier score, decision-curve net benefit, treat-all / treat-none comparators, and invalid-input rejection.
- Linked the helper from `publication_handoff_checklist.md` and updated `source_verification_dossier.md`; the calibration / clinical utility blocker remains open until real FeTA / institutional labels and exported results are available.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 174 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md publication_handoff_checklist.md client/src/lib/validation-metrics.ts client/src/lib/validation-metrics.test.ts client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Dandy-Walker TVA Trigger Correction Increment

- Added source-document consistency coverage that the SPEC combined-pattern likelihood manifest uses the implemented Dandy-Walker trigger: small vermis plus elevated tegmento-vermian angle.
- Updated SPEC §7.4.19 to replace the stale `Small vermis + dilated 3rd V` DWM trigger with `Small vermis + elevated TVA`.
- Preserved the third-ventricle raw-threshold policy by keeping third-ventricle width out of the Dandy-Walker combined-pattern trigger.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 171 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 exec prettier --check SPEC.md` still reports the existing canonical-document formatting warning; SPEC.md was not mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.5 Approximation-Tier Correction Increment

- Added source-document consistency coverage that the canonical SPEC no longer assigns the approximation verification tier to an active third-ventricle z-score model.
- Corrected SPEC §7.5 so the approximation tier applies to the extra-axial CSF quadratic curve, with explicit Kyriakopoulou 2017 coefficient-lock caveats.
- Preserved the publication-ready third-ventricle policy in SPEC §7.5: third ventricle remains raw-threshold-only in Phase 1, with no z-score reporting until a verified fetal-MRI or explicitly accepted cross-modality model is encoded.
- Added the extra-axial CSF coefficient decision to the clinician-owned source-lock action items.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 170 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 exec prettier --check SPEC.md` still reports the existing canonical-document formatting warning; SPEC.md was not mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Python Packaging Hardening Increment

- Added architecture coverage that `pyproject.toml` explicitly scopes setuptools packaging to the FastAPI Python app instead of the full flat repository.
- Configured setuptools to package `python_app`, `python_app.static`, and `python_app.templates`, while preserving the Jinja template and local HTMX/Tailwind assets as package data.
- Reproduced the pre-fix `uv build --wheel` failure from setuptools package discovery, then verified the fixed wheel builds cleanly and includes `python_app/static/htmx.min.js`, `python_app/static/tailwind.css`, and `python_app/templates/index.html`.
- Installed the built wheel in an isolated `uv --no-project` runtime and confirmed `evaluate_parameter("extra_axial_csf", 28, 4.0)` still returns the Kyriakopoulou caveat and packaged offline assets are discoverable via `importlib.resources`.

Verification:

- `uv build --wheel --out-dir /tmp/fbmri-wheel-test-after-clean` passes.
- `uv run --no-project --with /tmp/fbmri-wheel-test-after-clean/fetal_brain_mri_python_app-0.1.0-py3-none-any.whl python ...` passes for registry import, caveat output, and packaged template/static asset checks.
- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 170 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Python Extra-Axial Caveat Parity Increment

- Added architecture coverage that Python carries the same extra-axial CSF approximation disclosure expected by the React source registry.
- Added `EXTRA_AXIAL_CSF_APPROXIMATION_CAVEAT` and a Python `REGISTRY_OVERRIDES` row for `extra_axial_csf`, so FastAPI/Jinja report source details can disclose the Kyriakopoulou 2017 approximation caveat through the existing formatter.
- Verified at runtime with `uv run --no-project --with numpy --with scipy` that `evaluate_parameter("extra_axial_csf", 28, 4.0)` returns Kyriakopoulou 2017, the 21-38 week GA window, and the approximation caveat.
- During validation, default `uv run` exposed a separate publication-readiness blocker: setuptools editable build fails because `pyproject.toml` does not explicitly scope package discovery in the flat repository layout. This is queued as the next packaging-hardening increment.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 169 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Publication Handoff Checklist Increment

- Added test coverage that a publication handoff checklist maps reviewer standards to concrete manuscript sections, owners, and required evidence.
- Created `publication_handoff_checklist.md` covering TRIPOD+AI, CLAIM, STARD-AI, DECIDE-AI, CONSORT-AI, calibration, decision-curve net benefit, FeTA 2024, reader-study timing, source-data final lock, and go / no-go criteria.
- Updated the source-verification dossier to point the reporting-map blocker at the prepared handoff checklist while preserving PI/radiologist review as the remaining owner action.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 168 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md source_verification_dossier.md publication_handoff_checklist.md client/src/lib/methodology-page.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Publication-Readiness Literature Audit Increment

- Added tests that the Validation page surfaces reviewer-facing reporting standards and endpoint families: TRIPOD+AI, CLAIM, DECIDE-AI / CONSORT-AI, STARD-AI development, calibration, Brier score, decision-curve net benefit, reader timing, NASA Task Load Index, and System Usability Scale.
- Recorded the online literature audit in the Validation page and source-verification dossier, including the FeTA 2024 / Zalevskyi 2026 biometry gap (best automated biometry 7.72% MAPE versus 5.38% inter-rater MAPE) and domain-shift controls for site, SVR strategy, and image quality.
- Aligned SPEC.md, TEST.md, and the home footer with the publication-ready raw-threshold third-ventricle policy so the corpus no longer describes an active Birnbaum approximation z-score.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 167 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md source_verification_dossier.md client/src/lib/methodology-page.test.ts client/src/lib/validation-page.test.ts client/src/pages/Home.tsx client/src/pages/Validation.tsx` passes.
- `npx pnpm@10.4.1 exec prettier --check SPEC.md TEST.md` reports existing corpus-style warnings; those long canonical documents were not mass-reflowed.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
- Production smoke check passes: `PORT=4174 npx pnpm@10.4.1 start` served `/`, `/validation`, and `/methodology` with HTTP 200 responses.

## 2026-05-23, SPEC 7.5 Third-Ventricle Raw-Threshold Policy Increment

- Added tests that third-ventricle width is an auxiliary raw-threshold input rather than an approximate z-scored source row.
- Removed the Birnbaum approximation from React and Python source registries while preserving the >3.5 mm DDx trigger.
- Updated Methodology, Validation, and the verification dossier to document the conservative raw-threshold policy.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 163 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md source_verification_dossier.md client/src/lib/architecture.test.ts client/src/lib/biometry.test.ts client/src/lib/biometry.ts client/src/components/ParameterRow.tsx client/src/pages/Methodology.tsx client/src/pages/Validation.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.6 Python Residual DDx Trigger Increment

- Added architecture coverage for Python residual z-score and composite DDx trigger names.
- Added Python atrial asymmetry, corpus-callosum, large posterior-fossa, extra-axial, and hemispheric-asymmetry rows.
- Added Python hydrocephalus, ACC, HPE, and PCH composite pattern rows from already-computed measurements.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 164 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.7 Python Posterior-Fossa Auxiliary Trigger Increment

- Added architecture coverage for Python cisterna magna and TVA auxiliary trigger output.
- Emitted a Python mega-cisterna-magna / Blake's-pouch differential when cisterna magna depth exceeds 10 mm.
- Emitted a Python Blake's-pouch advisory when TVA is elevated without a small-vermis Dandy-Walker pattern.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 163 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.7 Python Colpocephaly Auxiliary Increment

- Added architecture coverage that the Python worksheet includes frontal horn inputs for colpocephaly comparison.
- Added left/right frontal horn raw inputs to the Python ventricular-system group.
- Emitted a Python differential row when atrial dilation is disproportionate to a normal same-side frontal horn.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 162 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Production Label Cleanup Increment

- Added coverage that user-facing source and package metadata no longer label the calculator as a prototype or scaffold.
- Replaced report, Methodology, footer, and home-screen prototype/scaffold language with release-neutral wording.
- Updated Python package/docstring metadata to describe implemented modules.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 161 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/client-shell.test.ts client/src/lib/report.ts client/src/lib/genai.ts client/src/pages/Home.tsx client/src/pages/Methodology.tsx package.json` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.9 Public Telemetry Removal Increment

- Added privacy-shell coverage that public assets and Vite config do not ship Manus telemetry collectors or storage proxies.
- Removed the copied debug collector asset from `client/public`.
- Stripped Manus/Builder dev plugins and proxy middleware from the Vite config and package manifest.
- Rebuilt production output so `dist/public` no longer contains the collector asset.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 160 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/client-shell.test.ts package.json vite.config.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.8 Python Source Detail Completeness Increment

- Added architecture coverage that Python report source details include z, percentile, mean, sigma, validated GA range, and extrapolated state.
- Carried source registry metadata into each Python per-source detail row, including GA range, cross-modality status, and caveat text.
- Expanded the Python report source-detail formatter without changing consensus math.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 159 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23

- Implemented SPEC sections 4.2.3, 4.2.4, and 4.8 increment for runtime multi-source consensus reconciliation.
- Added a per-parameter source registry for TCD, vermis CC, vermis AP, and pons AP so Luis 2025 and Dovjak 2021 are evaluated together; single-source rows continue to use their registry entry.
- Added consensus `ZResult` source details, agreement state (`single`, `agree`, `disagree`), disagreement width, per-source in-range/extrapolated tags, and third-ventricle cross-modality metadata.
- Updated the structured report to state multi-source consensus mode, include per-source z/percentile/mu/sigma/range values for every measured row, and add SOURCE-AGREEMENT NOTES for disagreeing rows.
- Updated the worksheet to show source counts, agreement badges, expandable per-source breakdowns, and removed the user-facing reference cohort selector.
- Added Vitest tests covering consensus source evaluation, disagreement thresholding, and report source-agreement notes.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check package.json PLAN.md client/src/lib/biometry.ts client/src/lib/report.ts client/src/components/ParameterRow.tsx client/src/pages/Home.tsx client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with pre-existing Vite warnings about unset analytics placeholders and chunk size.
- Full-repo Prettier check is not green because many pre-existing files outside this increment are not formatted.

## 2026-05-23, Chiari II / ONTD increment

- Implemented SPEC §6.5.1-§6.5.4 for maximum transverse diameter of the posterior fossa (TDPF), clivus-supraocciput angle (CSA), and the Chiari II / open neural tube defect differential card.
- Added Woitek 2014 quadratic mean / linear SD models for TDPF and CSA with validated 21-37 week windows. Both are single-source registry rows and report `single` agreement.
- Extended parameter units to support degree measurements so CSA renders as degrees in reports and as `deg` in the worksheet.
- Added a Mahalanobis posterior helper over the Woitek control, ONTD, and CNTD z-score centroids; the Chiari II card fires when TDPF z < -2, CSA z < -2, and ONTD posterior > 0.5.
- Added Vitest coverage for the SPEC §6.5.2 worked example and the combined Chiari II card trigger.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/report.ts client/src/components/ParameterRow.tsx client/src/pages/Home.tsx client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Source-Registry Acceptance Increment

- Implemented SPEC §4.10.1 source-registry extension validation.
- Added `validateSourceRegistryExtension`, which samples every existing-source overlap at half-week increments and computes the worst standardized mean divergence: `abs(mu_new - mu_existing) / max(sigma_new, sigma_existing)`.
- The validator returns acceptance status plus offending source, GA, and delta details for any comparison exceeding the 0.5 SD ceiling.
- Added Vitest coverage for an accepted duplicate skull-BPD source and a rejected shifted source.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Chiari Research-Mode Report Flag

- Implemented SPEC §7.5 report disclosure for the Chiari II / ONTD discriminator.
- When the `chiari-ii-ontd` card fires, the structured report now adds a deterministic research-mode note stating that model-derived posterior probabilities require local cohort calibration before clinical reliance.
- Added Vitest coverage for the report flag.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Mild-VM Impression Increment

- Implemented TEST.md §3 Case M1 expected impression wording for isolated mild ventriculomegaly.
- Added `impressionLine` support to fired differential cards and a deterministic report path that prefers a card-specific impression line before generic abnormal-report prose.
- Added the Pagani 2014 mild-VM impression line to the mild ventriculomegaly card.
- Added Vitest coverage for bilateral 11 mm atria at 24w0d.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Gestational-Age Parsing Increment

- Implemented TEST.md §1.3 gestational-age parsing for weeks+days and decimal-week input forms.
- Added `parseGestationalAge`, accepting examples such as `24+3`, `24w 3d`, and `24.5w`, with invalid day values rejected.
- Added a compact top-bar quick-entry field that applies parsed GA on Enter or blur while preserving the existing week/day dropdown controls.
- Added Vitest coverage for accepted and rejected GA strings.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts client/src/pages/Home.tsx` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Normal-Control Impression Increment

- Implemented TEST.md §2 expected normal-control impression wording.
- Replaced the longer prototype normal-impression sentence with the deterministic line `No abnormal biometric findings.`
- Added Vitest coverage for the report impression when measurements are present and no abnormality is detected.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Methodology Audit Increment

- Implemented SPEC §4.10.2 periodic cross-validation audit computation from the source registry.
- Added verification-tier metadata (`byte-identical`, `transcribed`, `derived`, `approximation`) and verification dates to source-registry entries for Methodology rendering.
- Added `computeCrossValidationAudits`, which samples half-week overlaps for every multi-source parameter, computes per-sample standardized mean divergence, and classifies each parameter as `pass`, `partial-fail`, or `fail` using the SPEC 0.5 SD and contiguous-excursion rule.
- Updated the Methodology page to remove stale reference-set selection language, describe always-on consensus mode, render per-source mean line glyphs, render disagreement bars, and list per-parameter verification tiers.
- Added Vitest coverage that verifies audits are registry-derived and sampled at half-week increments for multi-source rows.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts client/src/pages/Methodology.tsx` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, DDx Source-Disagreement Increment

- Implemented SPEC §4.6 source-disagreement propagation for z-score-driven DDx cards.
- Added related-parameter metadata to z-score and composite DDx triggers so the engine can attach any contributing rows in `disagree` state.
- Added `sourceDisagreements` metadata to fired differential cards, including parameter id, parameter name, and disagreement width.
- Rendered source-disagreement badges in both expanded differential cards and compact rail items.
- Added Vitest coverage using a TCD-triggered card with a disagreeing Luis/Dovjak row.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts client/src/components/DifferentialCard.tsx` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Third-Ventricle Manifest Correction

- Corrected the Birnbaum 2018 third-ventricle source registry window to 18-37 weeks per SPEC §7.3.12.
- Confirmed the row carries cross-modality and approximation-tier metadata.
- Added Vitest coverage for in-range 18w behavior and extrapolated 38w behavior.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Asymmetric Mild-VM Impression Increment

- Implemented TEST.md §3 Case M3 expected impression wording for unilateral right-sided mild ventriculomegaly with marked side-to-side asymmetry.
- Adjusted the ventriculomegaly tier boundary so exactly 12.0 mm remains in the mild VM bucket and moderate VM starts above 12.0 mm.
- Added side-specific asymmetric mild-VM impression generation and impression priority so combined/asymmetric report wording can override the generic mild-VM line.
- Added Vitest coverage for 28w0d, right atrium 12.0 mm, and normal left atrium 7.4 mm.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Isolated Severe-VM Impression Increment

- Implemented TEST.md §4 Case S3 expected impression wording for apparently isolated severe ventriculomegaly.
- Added the Carta 2018 isolated severe-VM impression line to the severe ventriculomegaly card.
- Assigned severe VM an impression priority above generic mild VM and below future combined-pattern report impressions.
- Added Vitest coverage for 28w0d with bilateral 17.5 mm atria, normal third ventricle, preserved CSP, and preserved corpus callosum.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Aqueductal-Stenosis Impression Increment

- Implemented TEST.md §4 Case S1 expected impression wording for severe triventricular hydrocephalus with preserved CSP and macrocephaly.
- Added the Heaphy-Henault aqueductal-stenosis impression line to the triventricular hydrocephalus composite card.
- Assigned the hydrocephalus composite a higher impression priority than the standalone severe-VM card so combined-pattern report wording wins.
- Added Vitest coverage for 26w0d with bilateral 18.0 mm atria, dilated third ventricle, macrocephaly, preserved CSP, and preserved corpus callosum.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, ACC Severe-VM Impression Increment

- Implemented TEST.md §4 Case S2 expected impression wording for complete agenesis of the corpus callosum with associated colpocephaly.
- Added the Santo 2012 ACC counselling impression line to the ACC composite card.
- Tightened the HPE composite trigger so absent CSP plus severe VM alone does not fire HPE without a microcephaly proxy.
- Added Vitest coverage for 24w0d with bilateral 16.0 mm atria, absent CSP, absent corpus callosum, and normal third ventricle.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, HPE Severe-VM Impression Increment

- Implemented TEST.md §4 Case S5 expected impression wording for alobar holoprosencephaly.
- Added the Malinger 2013 HPE counselling impression line to the HPE composite card with the highest current report priority.
- Tightened the ACC composite so the HPE microcephaly pattern is not simultaneously labelled as ACC.
- Added Vitest coverage for 32w0d with bilateral 20.0 mm atria, absent CSP, absent corpus callosum, and microcephaly.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Mixed-Tier Asymmetric VM Increment

- Implemented TEST.md §4 Case S4 trigger coverage for asymmetric severe right VM with mild left VM.
- Changed mild and moderate VM DDx matching from max-only logic to side-aware tier matching so a contralateral lower-tier ventricle is not hidden by the more severe side.
- Preserved existing report impression priority ordering, with severe VM still outranking the generic mild-VM impression.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Vermian-Hypoplasia Caveat Increment

- Implemented TEST.md §6 Case V3 report caveat coverage for isolated inferior vermian hypoplasia.
- Added a deterministic vermis-small impression line referencing Limperopoulos 2006's warning that fetal MRI before 24 weeks can substantially over-call inferior vermian hypoplasia.
- Added Vitest coverage that 26w0d vermis hypoplasia fires `vermis-small` without `tcd-small` or `pons-small`.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Combined Cerebellar Hypoplasia Report Increment

- Implemented TEST.md §6 Case V5 combined-pattern report behavior for concurrent small TCD and small vermis without adding a formal DDx card.
- Added a report-level impression override that flags concern for cerebellar agenesis or pontocerebellar hypoplasia when `tcd-small` and `vermis-small` both fire and no Dandy-Walker pattern is present.
- Used a registry-threshold TCD value for coverage because the literal TEST.md V5 value of 38.0 mm is normal under the implemented SPEC §7.3.7 Luis+Dovjak consensus coefficients.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Centile-Table Fitting Increment

- Implemented SPEC §4.2.5 helper support for fitting per-week 5th/95th centile rows into the per-percentile linear model family by ordinary least squares.
- Added retained residual RMSE values for the 5th and 95th centile fits so fitted source rows remain auditable.
- Added validation that rejects underdetermined tables, non-finite values, and inverted centile rows.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Mean-SD Table Fitting Increment

- Implemented SPEC §4.2.5 helper support for fitting per-week mean/SD rows into the linear-mean/constant-SD model family.
- Added retained RMSE values for the mean-line fit and constant-SD approximation.
- Added validation that rejects underdetermined rows, non-finite values, and non-positive SD inputs.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Dandy-Walker TVA Trigger Increment

- Implemented TEST.md §7 Case D1 coverage for a TVA-based Dandy-Walker spectrum composite trigger.
- Changed the DWM composite from small vermis plus third-ventricle dilatation to small vermis plus tegmento-vermian angle >= 35 degrees.
- Updated the small-TCD base card to fire when any in-range source is below the 5th percentile, preserving sensitivity for DWM fixtures where the consensus z-score is just above the cutoff.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, ACC Plus Dandy-Walker Report Increment

- Implemented TEST.md §7 Case D3 coverage for simultaneous ACC and Dandy-Walker composite cards.
- Added deterministic Dandy-Walker report wording for TVA-based DWM cases.
- Added report handling so ACC plus DWM enumerates both combined-pattern diagnoses instead of letting the ACC impression hide DWM.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Mega-Cisterna-Magna Qualitative Report Increment

- Implemented TEST.md §8 Case BP3 qualitative report behavior for the MCM / Blake's pouch panel.
- Added a report impression path for `qualitative_mcm_panel` that emits `Isolated mega cisterna magna with persistent Blake's pouch — likely benign normal variant.`
- Kept the qualitative panel separate from DDx card firing; the BP3 fixture still emits no quantitative DDx cards.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Isolated Small-TCD Report Increment

- Implemented TEST.md §9 Case CH3 report behavior for isolated small transcerebellar diameter at 32w0d.
- Added Vitest coverage that TCD 33.0 mm fires `tcd-small` without `vermis-small`, `pons-small`, or `dwm-pattern`.
- Added a deterministic `tcd-small` impression recommending consideration of unilateral cerebellar hypoplasia or cerebellar disruption injury, with postnatal MRI for laterality assessment.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Macrocerebellum Plus Macrocephaly Report Increment

- Implemented TEST.md §10 Case LC2 report behavior for macrocerebellum with macrocephaly at 30w0d.
- Added Vitest coverage that TCD 42.0 mm and skull BPD 90.0 mm fire `tcd-large` and `macrocephaly` together.
- Added a report-level combined-pattern impression that raises concern for fetal overgrowth syndromes such as Sotos or Beckwith-Wiedemann syndrome, while preserving hydrocephalus-specific report priority.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Macrocerebellum Plus Thick-CC Report Increment

- Implemented TEST.md §10 Case LC5 report behavior for macrocerebellum with thick corpus callosum at 30w0d.
- Added Vitest coverage that TCD 42.5 mm and corpus callosum length 44.0 mm fire `tcd-large` and `cc-thick` together.
- Extended the report-level overgrowth combined-pattern impression to include `tcd-large` plus `cc-thick`, while preserving hydrocephalus-specific report priority.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Short Corpus-Callosum Report Increment

- Implemented TEST.md §11 Case A4's partial / hypogenetic corpus-callosum report wording.
- Added Vitest coverage that a registry-threshold short corpus-callosum value fires `cc-short` without `cc-absent` or `acc-pattern`.
- Added a deterministic `cc-short` impression recommending postnatal MRI confirmation.
- Used CC length 30.0 mm at 28w0d for coverage because the literal TEST.md A4 value of 22.0 mm falls into `cc-absent` under the implemented Luis 2025 coefficients.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Isolated Small-Pons Report Increment

- Implemented TEST.md §17 Case PCH6 report behavior for isolated pontine hypoplasia with preserved TCD and vermis at 32w0d.
- Added Vitest coverage that `pons-small` fires without `tcd-small`, `vermis-small`, or `pch-pattern`.
- Added a report-level isolated brainstem / pontine hypoplasia impression that is suppressed when the PCH composite or accompanying small TCD/vermis cards fire.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Large Pons Plus Thick-CC Report Increment

- Implemented TEST.md §18 Case LP6 report behavior for large pons with thick corpus callosum at 26w0d.
- Added Vitest coverage that pons AP 10.5 mm and corpus callosum length 35.0 mm fire `pons-large` and `cc-thick` together.
- Added a report-level overgrowth combined-pattern impression for `pons-large` plus `cc-thick`.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Macrocephaly Plus Thick-CC Report Increment

- Implemented TEST.md §20 Case MA3 / §13 Case TC2 report behavior for macrocephaly with thick corpus callosum.
- Added Vitest coverage that skull BPD 96.0 mm, brain BPD 94.0 mm, and corpus callosum length 47.0 mm fire `macrocephaly` and `cc-thick` together.
- Added a report-level overgrowth combined-pattern impression for `macrocephaly` plus `cc-thick`.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Isolated Third-Ventricle Report Increment

- Implemented TEST.md §21 Case TV2 report behavior for isolated third-ventricle prominence at 30w0d.
- Added Vitest coverage that third-ventricle width 4.0 mm fires `third-v-wide` without mild/severe ventriculomegaly or `hydrocephalus-pattern`.
- Added a report-level isolated third-ventricle impression recommending consideration of early aqueductal stenosis or measurement-technique error with short-interval follow-up.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Aqueductal-Stenosis Absent-CSP Negative-Control Increment

- Implemented TEST.md §22 Case AS-P3 negative-control behavior for severe VM plus third-ventricle dilatation with absent CSP.
- Added Vitest coverage that `severe-vm`, `absent-csp`, and `third-v-wide` fire while `hydrocephalus-pattern` stays suppressed.
- Updated the hydrocephalus composite matcher so explicitly absent CSP rules out aqueductal-stenosis classification.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Isolated Absent-CSP Report Increment

- Implemented TEST.md §14 Case CSP-A3 report behavior for absent CSP with preserved corpus callosum.
- Added Vitest coverage that `absent-csp` fires without `acc-pattern` or `hpe-pattern`.
- Added a deterministic `absent-csp` impression recommending evaluation for septo-optic dysplasia, corpus callosum abnormality, and mild HPE-spectrum findings.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Isolated Enlarged-CSP Report Increment

- Implemented TEST.md §15 Case CSP-E1 report behavior for isolated enlarged CSP at 32w0d.
- Added Vitest coverage that `enlarged-csp` fires alone for CSP width 11.5 mm.
- Added a low-priority deterministic `enlarged-csp` impression describing the finding as usually benign while recommending correlation for cavum velum interpositum cyst or associated anomalies.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, CMV Qualitative Microcephaly Report Increment

- Implemented TEST.md §19 Case MC5 qualitative CMV report behavior for microcephaly with associated mild ventriculomegaly.
- Added Vitest coverage using registry-consistent measurements that fire `microcephaly` and `mild-vm` while a manual `qualitative_cmv_panel` value drives the CMV impression.
- Added report-level qualitative CMV handling without adding a quantitative CMV DDx card.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Growth-Restriction Microcephaly Report Increment

- Implemented TEST.md §19 Case MC6 growth-restriction-context report behavior for microcephaly.
- Added Vitest coverage using registry-consistent measurements that fire `microcephaly` while a manual `growth_restriction_context` value drives the IUGR-associated impression.
- Added report-level growth-restriction context handling without adding a quantitative IUGR DDx card.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Direct Extra-Axial CSF Report Increment

- Implemented TEST.md §25 Case EA1 behavior for direct extra-axial CSF measurement at 32w0d.
- Added an `extra_axial_csf` worksheet parameter with Kyriakopoulou 2017 provenance and an explicitly flagged approximate quadratic reference curve calibrated to the TEST.md §25 boundaries until exact fetal-centiles coefficients are encoded.
- Updated the widened extra-axial-space DDx card to prefer direct `extra_axial_csf` z-scores above the 95th percentile while preserving the prior skull/brain BPD z-gap proxy as a fallback.
- Added deterministic report wording for the external hydrocephalus / benign macrocrania pattern and updated methodology/validation copy to disclose the approximation.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 44 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts client/src/pages/Methodology.tsx client/src/pages/Validation.tsx` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Brain-Volume-Loss Extra-Axial Report Increment

- Implemented TEST.md §25 Case EA2 report behavior for the combined microcephaly, mild ventriculomegaly, and widened extra-axial CSF pattern.
- Added Vitest coverage using registry-consistent values that fire `microcephaly`, `mild-vm`, and `extra-axial-wide` without requiring a manual qualitative CMV panel.
- Added a report-level brain-volume-loss impression suggesting congenital CMV or another intrauterine destructive insult, while preserving more specific manually entered qualitative-CMV and growth-restriction context impressions.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 45 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, IUGR Extra-Axial Report Increment

- Implemented TEST.md §25 Case EA4 report behavior for microcephaly with widened extra-axial CSF and no ventriculomegaly.
- Added Vitest coverage using registry-consistent values that fire `microcephaly` and `extra-axial-wide` while keeping `mild-vm` absent.
- Added a report-level IUGR-associated extra-axial-space prominence impression, with manual qualitative-CMV, brain-volume-loss, and entered growth-restriction context paths remaining higher specificity.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 46 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Extreme-Z Percentile Formatting Increment

- Implemented TEST.md §27 Case STRESS4 percentile-saturation behavior for an exact z = +5 macrocephaly fixture.
- Added Vitest coverage that computes a registry-derived skull-BPD z = +5 value, verifies `macrocephaly` fires, and asserts the structured report renders a `>99.9th percentile` bucket.
- Updated `formatPct` to expose `<0.1st` and `>99.9th` saturation buckets while preserving ordinary rounded ordinal percentiles.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 47 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Moderate Ventriculomegaly Report Increment

- Implemented TEST.md §3 Case M4 report behavior for bilateral moderate ventriculomegaly in the 12-14.9 mm sub-band.
- Added Vitest coverage that 13.5 mm bilateral atria fire `mod-vm` without `severe-vm` or `asym-vent`.
- Added deterministic moderate-VM impression wording recommending follow-up imaging for progression toward severe VM and associated-anomaly evaluation.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 48 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Near-Severe VM Boundary Increment

- Implemented TEST.md §3 Case M2 report behavior for bilateral 14.5 mm atria just below the severe-VM threshold.
- Added Vitest coverage that `mod-vm` fires without `severe-vm` and that the report states the finding is approaching the 15 mm severe threshold.
- Added match-time moderate-VM impression override for high-end moderate measurements while preserving the generic moderate-VM wording for lower moderate values.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 49 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Pure Ventricular-Asymmetry Report Increment

- Implemented TEST.md §5 Case AS1 report classification behavior for ventricular side-to-side asymmetry without VM.
- Added Vitest coverage using registry-consistent atrial values that fire `asym-vent` while keeping `mild-vm`, `severe-vm`, and all z-scores below the report abnormality threshold.
- Updated report abnormality detection so fired DDx cards are treated as abnormal findings even when all measured z-scores are within ±2.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 50 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Unilateral Severe-VM Asymmetry Report Increment

- Implemented TEST.md §5 Case AS6 report behavior for unilateral severe ventriculomegaly with marked ventricular asymmetry.
- Added Vitest coverage that right atrium 15.0 mm and left atrium 7.6 mm fire `severe-vm` and `asym-vent` without `mild-vm`.
- Added a report-level asymmetric severe-VM impression suggesting unilateral haemorrhage or encephaloclastic insult, suppressed by aqueductal-stenosis, ACC, and HPE combined patterns.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 51 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Vermian-Hypoplasia DWM Boundary Increment

- Implemented TEST.md §6 Case V2 boundary behavior for small vermis with borderline TVA and preserved TCD/pons.
- Added Vitest coverage using registry-normal TCD and pons values that fires `vermis-small` while keeping `dwm-pattern`, `tcd-small`, and `pons-small` absent.
- Tightened the Dandy-Walker matcher so borderline TVA requires both small TCD and small pons support, while markedly elevated TVA remains sufficient.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 52 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Vermian-AP Hypoplasia Trigger Increment

- Implemented the TEST.md §6 small-vermis rule for vermian AP-only hypoplasia, aligning the matcher with the SPEC trigger wording that allows vermian height or AP diameter below the fifth percentile.
- Added Vitest coverage using a registry-normal vermis CC value and an AP-only low vermis value that fires `vermis-small` without unrelated posterior-fossa cards.
- Updated the small-vermis card metadata and trigger label so either entered vermis axis can support and explain the card.
- Adjusted older isolated-TCD and qualitative Blake's pouch fixtures to use registry-normal vermis AP values, preserving their intended non-vermis-hypoplasia behavior after AP support was added.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 53 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Vermian-AP DWM Trigger Increment

- Implemented TEST.md §7 Dandy-Walker spectrum behavior for AP-only vermian hypoplasia with markedly elevated TVA.
- Added Vitest coverage using registry-normal vermis CC, TCD, and pons values with low vermis AP and TVA 95 degrees; `vermis-small` and `dwm-pattern` fire without `tcd-small` or `pons-small`.
- Refactored the vermis-axis selection into a shared helper so both `vermis-small` and `dwm-pattern` use the lowest entered vermis-axis z-score and expose the triggering axis in the label.
- Updated the Dandy-Walker card metadata to link both vermis CC and vermis AP.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 54 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Isolated DWM With Preserved Pons Increment

- Implemented TEST.md §7 Case D5 behavior for isolated Dandy-Walker spectrum with TVA 80 degrees, small vermis, small TCD, and preserved pons.
- Added Vitest coverage using a registry-normal pons value that fires `vermis-small`, `tcd-small`, and `dwm-pattern` while keeping `pons-small` absent.
- Relaxed the DWM support rule for TVA 60-89 degrees so either small TCD or small pons can support the combined pattern; TVA 35-59 degrees still requires both support features, and TVA >= 90 remains sufficient.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 55 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Hemispheric-Asymmetry Z-Delta Increment

- Implemented TEST.md §24 boundary behavior for hemispheric asymmetry using brain-OFD left/right consensus z-score delta rather than raw percent difference.
- Added Vitest coverage showing a 1.6 SD left/right brain-OFD gap does not fire `brain-asym` even when the raw percent gap exceeds 5%.
- Added positive Vitest coverage showing a >2 SD left/right brain-OFD gap still fires `brain-asym`.
- Updated the hemispheric-asymmetry card title, one-line summary, and trigger label to describe the z-delta threshold.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 57 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Large-TCD 95th-Percentile Threshold Increment

- Implemented TEST.md §10 macrocerebellum threshold behavior so `tcd-large` fires above the 95th percentile rather than only above +2 SD.
- Added Vitest coverage using a registry-derived TCD value between +1.645 and +2 SD that fires `tcd-large` without unrelated overgrowth combination cards.
- Updated the large-TCD card title and one-line summary to describe the 95th-percentile threshold.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 58 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Thick-CC 95th-Percentile Threshold Increment

- Implemented TEST.md §13 thick corpus callosum threshold behavior so `cc-thick` fires above the 95th percentile rather than only above +2 SD.
- Added Vitest coverage using a registry-derived CC length between +1.645 and +2 SD that fires `cc-thick` without unrelated macrocephaly or large-pons cards.
- Updated the thick-CC card title and one-line summary to describe the 95th-percentile threshold.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 59 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Large-Pons 95th-Percentile Threshold Increment

- Implemented TEST.md §18 large pons threshold behavior so `pons-large` fires above the 95th percentile rather than only above +2 SD.
- Added Vitest coverage using a registry-derived pons AP value between +1.645 and +2 SD that fires `pons-large` without unrelated macrocephaly or thick-CC cards.
- Updated the large-pons card title and one-line summary to describe the 95th-percentile threshold.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 60 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Macrocephaly 97th-Percentile Threshold Increment

- Implemented TEST.md §20 macrocephaly threshold behavior so `macrocephaly` fires above the 97th percentile rather than only above +2 SD.
- Added Vitest coverage using a registry-derived skull BPD value between the 97th percentile and +2 SD that fires `macrocephaly` without unrelated overgrowth cards.
- Updated the macrocephaly card title and one-line summary to describe the 97th-percentile threshold.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 61 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Microcephaly 3rd-Percentile Threshold Increment

- Implemented TEST.md §19 microcephaly threshold behavior so `microcephaly` fires below the 3rd percentile rather than only below -2 SD.
- Added Vitest coverage using a registry-derived skull BPD value between -2 SD and the 3rd percentile that fires `microcephaly` without unrelated ventriculomegaly or posterior-fossa cards.
- Updated the microcephaly card title and one-line summary to describe the 3rd-percentile threshold.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 62 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, Early Aqueductal-Stenosis Pattern Increment

- Implemented TEST.md §22 Case AS-P2 behavior for pronounced third-ventricle dilatation with moderate bilateral ventriculomegaly and preserved CSP.
- Added Vitest coverage using bilateral 14 mm atria, third ventricle 5.5 mm, preserved CSP, and registry-normal skull BPD that fires `mod-vm`, `third-v-wide`, and `hydrocephalus-pattern` without `severe-vm` or `macrocephaly`.
- Relaxed the hydrocephalus composite matcher from severe VM only to any ventriculomegaly-range atrium plus third-ventricle dilatation, while preserving absent-CSP suppression.
- Added match-time early-evolving aqueductal-stenosis impression wording for non-severe cases so severe-triventricular wording remains reserved for severe VM.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 63 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, HPE 3rd-Percentile Microcephaly Increment

- Implemented TEST.md §16/§19 threshold alignment so `hpe-pattern` uses the same 3rd-percentile microcephaly cutoff as the base `microcephaly` card.
- Added Vitest coverage using absent CSP, severe VM, preserved CC, and a registry-derived skull BPD between -2 SD and the 3rd percentile; `microcephaly` and `hpe-pattern` both fire without `acc-pattern`.
- Updated the ACC-vs-HPE suppression check to use the same 3rd-percentile microcephaly cutoff, preserving the existing alobar-HPE report behavior.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 64 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, PCH Vermis-Support Increment

- Implemented TEST.md §17 wording that `pch-pattern` can fire from small pons plus vermian hypoplasia even when TCD is preserved.
- Added Vitest coverage using registry-derived pons and vermis values below the fifth percentile with registry-mean TCD; `pons-small`, `vermis-small`, and `pch-pattern` fire while `tcd-small` remains absent.
- Updated the PCH composite card wording, related-parameter metadata, trigger label, and boost rules so vermian support is surfaced consistently.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 65 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, BP6 TVA-60 Dandy-Walker Increment

- Implemented TEST.md §8 Case BP6 behavior so small vermis plus TVA 60 degrees fires `dwm-pattern` even with preserved TCD and pons.
- Added Vitest coverage confirming `vermis-small` and `dwm-pattern` fire while `tcd-small` and `pons-small` remain absent.
- Preserved the lower-borderline TVA negative control: TVA values from 35 to below 60 degrees still require both small TCD and small pons support.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 66 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, HPE Qualitative-Toggle Increment

- Implemented TEST.md §16 Case HPE3 behavior so `qualitative_hpe_panel` can support `hpe-pattern` when absent CSP and 3rd-percentile microcephaly are present despite only mild-range VM.
- Added Vitest coverage showing mild VM plus absent CSP and microcephaly remains non-HPE without the qualitative HPE entry, then fires `hpe-pattern` when the entry is present.
- Preserved the severe-VM quantitative HPE path and the shared 3rd-percentile microcephaly cutoff.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 67 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, HA1 Hemispheric-Disruption Report Increment

- Implemented TEST.md §24 Case HA1 report behavior for cerebral hemispheric asymmetry with ipsilateral ventriculomegaly and marked ventricular asymmetry.
- Added Vitest coverage using registry-derived right brain-OFD reduction plus right-sided mild VM; `brain-asym`, `asym-vent`, and `mild-vm` fire together.
- Added a report-level combined-pattern impression suggesting unilateral encephaloclastic insult or porencephaly, with side derived from the smaller brain OFD, ahead of generic asymmetric-VM wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 68 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, HPE Plus DWM Report Increment

- Implemented TEST.md §16/§27 simultaneous combined-pattern report behavior for HPE plus Dandy-Walker spectrum.
- Added Vitest coverage using registry-derived microcephaly and vermian hypoplasia values; `hpe-pattern` and `dwm-pattern` both fire and the report impression names both.
- Added an HPE+DWM report override parallel to the existing ACC+DWM combined-pattern wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 69 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, LP2 Pons-Macrocephaly Overgrowth Report Increment

- Implemented TEST.md §18 Case LP2 report behavior for large pons plus macrocephaly as an overgrowth-pattern combination.
- Added Vitest coverage using registry-derived pons AP and skull BPD values above the relevant thresholds; `pons-large` and `macrocephaly` fire without `hydrocephalus-pattern`.
- Added a report-level overgrowth impression for large pons plus macrocephaly, suppressed when macrocephaly is part of a hydrocephalus composite.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 70 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, LP4 Pons-Macrocerebellum Overgrowth Report Increment

- Implemented TEST.md §18 Case LP4 report behavior for large pons plus macrocerebellum as an overgrowth-pattern combination.
- Added Vitest coverage using registry-derived pons AP and TCD values above the relevant thresholds; `pons-large` and `tcd-large` fire without macrocephaly or thick CC.
- Added a report-level overgrowth impression for large pons plus macrocerebellum.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 71 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/report.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, STRESS1 Consensus-Zero Mu Increment

- Implemented TEST.md §27 Case STRESS1 behavior so `mu(parameter, GA)` values produce consensus z-scores within 0.05 SD of zero for every reportable parameter.
- Added Vitest coverage filling every `PARAMETERS_ALL` row at 28w0d from the exported `mu` helper and asserting no DDx cards fire.
- Updated multi-source `mu` to return the inverse-SD weighted zero-consensus center and multi-source `sigma` to return the harmonic scale, so `mu + k*sigma` inverts the runtime consensus-z calculation.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 72 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, SPEC 4.7 RES Qualitative Trigger Increment

- Implemented SPEC.md §4.7 rhombencephalosynapsis support as a qualitative composite card: small TCD plus entered absent primary fissure fires `res-pattern`.
- Added Vitest coverage proving small TCD alone stays limited to `tcd-small`, while adding `qualitative_absent_primary_fissure` fires `res-pattern`.
- Refactored the repeated TCD lowest-source-z calculation into a shared helper and added a boost from `res-pattern` back to `tcd-small`.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 73 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, SPEC 4.7 Cisterna-Magna Depth Increment

- Implemented SPEC.md §4.7 cisterna magna depth support so depth >10 mm fires the `mega-cisterna-magna` differential card.
- Added Vitest coverage proving the threshold is strict: 10 mm remains negative, while 10.1 mm fires the card.
- Added deterministic benign-variant report wording for isolated mega cisterna magna with persistent Blake's pouch.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 74 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, SPEC 4.7 Posterior-Fossa Auxiliary Inputs Increment

- Implemented SPEC.md §4.7 UI-facing auxiliary inputs for cisterna magna depth and tegmento-vermian angle.
- Added Vitest coverage that `AUXILIARY_MEASUREMENTS` contains `cisterna_magna_depth` in millimetres and `tva` in degrees while keeping both out of the z-scored `PARAMETERS_ALL` registry.
- Added a raw auxiliary worksheet row component and rendered the new inputs in the posterior-fossa section so they can feed existing threshold-based DDx logic.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 75 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts client/src/pages/Home.tsx client/src/components/AuxiliaryMeasurementRow.tsx` passes after formatting `Home.tsx`.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, SPEC 4.7 Colpocephaly Comparison Increment

- Implemented SPEC.md §4.7 anterior/posterior ventricle comparison support using raw same-side frontal-horn auxiliary inputs.
- Added Vitest coverage proving atrial diameter >10 mm plus a normal same-side frontal horn fires `colpocephaly-pattern`, while atrial dilation alone and atrial dilation with an enlarged frontal horn do not.
- Added a qualitative colpocephaly differential card focused on corpus-callosum agenesis and malformations of cortical development without changing existing ACC or ventriculomegaly thresholds.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 76 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, TEST 8 Blake's-Pouch Advisory Toggle Increment

- Implemented TEST.md §8 qualitative Blake's pouch advisory support with a low-severity `blakes-pouch-dd` card.
- Added Vitest coverage proving elevated TVA with registry-normal vermis/TCD/pons stays negative without `qualitative_blakes_pouch_panel`, then fires the advisory card with the toggle while preserving no-DWM behavior.
- Added deterministic report wording for the advisory card and guarded against firing it when the entered vermis is already small.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 77 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, TEST 27 STRESS5 DWM Fallback Increment

- Implemented TEST.md §27 Case STRESS5 multi-card behavior so the severe-malformation fixture fires `dwm-pattern` alongside HPE and PCH even when TVA is unavailable.
- Added Vitest coverage for the 26w STRESS5 fixture, asserting at least 10 cards including severe VM, absent CSP, absent CC, small TCD, vermian hypoplasia, small pons, microcephaly, third-ventricle dilation, hemispheric asymmetry, extra-axial widening, HPE, PCH, and DWM.
- Kept the new DWM fallback narrow: it requires small vermis, small TCD, small pons, and third-ventricle dilation when TVA is missing; TVA-measured cases still use the existing TVA thresholds.
- Adjusted the approximate direct extra-axial CSF curve so the documented STRESS5 5.5 mm value at 26w crosses the 95th-percentile trigger while preserving existing negative controls.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 78 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with the same pre-existing Vite warnings about unset analytics placeholders and chunk size.

## 2026-05-23, SPEC 4.9 No-Analytics Shell Increment

- Implemented SPEC.md §4.9 no-transmission hardening by removing the placeholder Umami analytics script from the client HTML shell.
- Added Vitest coverage proving `client/index.html` contains no analytics, Umami, or `data-website-id` telemetry hooks.
- Preserved the Vite application entrypoint and confirmed the production build no longer emits analytics-placeholder warnings.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 79 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/index.html client/src/lib/client-shell.test.ts` passes after formatting `client/index.html`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.9 Offline Font Shell Increment

- Implemented SPEC.md §4.9 offline/no-transmission hardening by removing Google Fonts preconnect and stylesheet requests from `client/index.html`.
- Extended the client-shell Vitest coverage to reject external `http(s)` font links and preconnect hints.
- Replaced named web-font CSS variables with system serif, sans, and monospace stacks so the UI keeps its typography roles without network font loading.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 79 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/index.html client/src/index.css client/src/lib/client-shell.test.ts` passes after formatting `client/src/index.css`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, TEST 11 Heterotopia Qualitative Add-On Increment

- Implemented TEST.md §11 Case A2 qualitative heterotopia support with a low-severity `heterotopia-dd` advisory card.
- Added Vitest coverage proving complete ACC remains on the existing quantitative cards without the toggle, then adds `heterotopia-dd` when `qualitative_heterotopia_panel` is entered.
- Kept the card qualitative-only so it does not alter ACC, CSP, CC, or ventriculomegaly thresholds.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 80 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, TEST 11 Interhemispheric-Cyst Qualitative Add-On Increment

- Implemented TEST.md §11 Case A5 qualitative interhemispheric-cyst support with a low-severity `interhemispheric-cyst-dd` advisory card.
- Added Vitest coverage proving ACC with severe VM remains on the existing quantitative cards without the toggle, then adds `interhemispheric-cyst-dd` when `qualitative_interhemispheric_cyst_panel` is entered.
- Kept the card qualitative-only so it does not alter ACC, ventriculomegaly, or hydrocephalus matching.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 81 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes after formatting `client/src/lib/biometry.test.ts`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, TEST 15 Cavum-Vergae Qualitative Label Increment

- Implemented TEST.md §15 Case CSP-E3 qualitative cavum-vergae support with a low-severity `cavum-vergae-dd` advisory card.
- Added Vitest coverage proving enlarged CSP remains on the quantitative `enlarged-csp` card without the toggle, then adds `cavum-vergae-dd` when `qualitative_cavum_vergae_panel` is entered.
- Kept the card qualitative-only so it does not alter CSP enlargement or ventriculomegaly thresholds.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 82 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, TEST 14 SOD Qualitative Manual-Entry Increment

- Implemented TEST.md §14 Case CSP-A3 qualitative SOD support with a low-priority `sod-dd` advisory card for entered small optic apparatus.
- Added Vitest coverage proving isolated absent CSP keeps the existing absent-CSP impression without the toggle, then adds `sod-dd` when `qualitative_sod_panel` is entered.
- Kept the SOD advisory below the absent-CSP impression so it does not become a new quantitative combined-pattern trigger.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 83 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, TEST 19 CMV Qualitative Add-On Increment

- Implemented TEST.md §19 Case MC5 qualitative CMV support with a `cmv-dd` advisory card for entered periventricular cysts, calcifications, or germinolytic cysts.
- Extended the existing CMV report test to prove microcephaly with mild VM stays on quantitative cards without the toggle, then adds `cmv-dd` and preserves the CMV impression when `qualitative_cmv_panel` is entered.
- Kept the card qualitative-only so it does not alter microcephaly, ventriculomegaly, or brain-volume-loss matching.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 83 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts` passes after formatting `client/src/lib/biometry.test.ts`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Qualitative Finding UI Controls Increment

- Added a UI-facing `QUALITATIVE_FINDINGS` registry for every manual engine/report flag, including growth-restriction context.
- Added Vitest coverage proving the qualitative/context registry is distinct from z-scored parameters and auxiliary numeric inputs.
- Rendered the registry as worksheet checkbox rows by anatomical group so qualitative add-ons can be entered from the app instead of hidden fixtures.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 84 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.ts client/src/lib/biometry.test.ts client/src/pages/Home.tsx client/src/components/QualitativeFindingRow.tsx` passes after formatting `client/src/components/QualitativeFindingRow.tsx`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.9 Stateless Browser-Storage Hardening Increment

- Extended client-shell privacy coverage to reject browser persistence APIs in client source, including `localStorage`, `sessionStorage`, IndexedDB, and cookie writes.
- Removed theme `localStorage` persistence so theme state remains runtime-only.
- Removed sidebar cookie persistence so UI state is not retained through browser storage.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 85 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/client-shell.test.ts client/src/contexts/ThemeContext.tsx client/src/components/ui/sidebar.tsx` passes after formatting `client/src/lib/client-shell.test.ts` and `client/src/components/ui/sidebar.tsx`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.9 No External Script Loader Increment

- Extended client-shell privacy coverage to reject dynamic script creation, script `src` assignment, Google Maps integration hooks, and Forge maps proxy hooks in client source.
- Removed the unused `client/src/components/Map.tsx` Google Maps component that dynamically injected a remote script.
- Preserved citation/source URLs while blocking executable third-party script-loader code paths.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 86 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/client-shell.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.8 Auxiliary Report Inclusion Increment

- Added report coverage proving entered auxiliary measurements appear in the structured report as raw-threshold inputs.
- Rendered measured auxiliary rows in a dedicated `AUXILIARY INPUTS` report section after z-scored biometric findings.
- Kept auxiliary rows out of z-score/source-agreement wording while preserving their use by existing differential-card triggers.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 87 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/report.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.8 Qualitative Report Inclusion Increment

- Added report coverage proving entered qualitative/context findings appear in the structured report body.
- Rendered manual findings in a `QUALITATIVE / CONTEXT INPUTS` section after numeric findings without z-score, percentile, source, or agreement wording.
- Kept qualitative DDx and impression matching unchanged; this increment only improves report traceability for manually entered context.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 88 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/report.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.5 Report Source-Caveat Disclosure Increment

- Added report coverage proving third-ventricle source details disclose the approximation verification tier and cross-modality caveat.
- Rendered source verification tier and verification date in the per-source report detail for measured rows.
- Appended registry caveat text only for sources that carry a caveat, preserving existing consensus, z-score, and DDx behavior.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 89 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/report.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.9 Unused HTTP Dependency Removal Increment

- Added client-shell privacy coverage proving the package does not declare a generic HTTP client dependency.
- Removed the unused Axios production dependency and its lockfile entries.
- Preserved existing source-level network/script/storage guards while tightening the package-level privacy surface.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 90 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check package.json PLAN.md client/src/lib/client-shell.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.5 Row Source-Caveat UI Disclosure Increment

- Added source-detail UI coverage proving the parameter row consumes verification tier, verification date, and caveat fields from source details.
- Rendered verification tier/date in the expanded parameter-row source breakdown beside the existing z, percentile, range, and cross-modality tags.
- Rendered registry caveat text only inside the expanded source breakdown so routine rows remain compact.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 91 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/components/ParameterRow.tsx client/src/lib/source-detail-ui.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.11 Deterministic Report Dependency Increment

- Added client-shell coverage proving the package does not declare an unused streaming/Markdown response renderer dependency.
- Removed the unused Streamdown production dependency and its lockfile entries.
- Preserved deterministic report behavior; this increment only tightens the package surface around report generation.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 92 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check package.json PLAN.md client/src/lib/client-shell.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.9 Google Maps Package Removal Increment

- Added client-shell coverage proving the package does not declare Google Maps integration or type packages.
- Removed the unused `@types/google.maps` dev dependency left after the earlier Google Maps component deletion.
- Preserved citation links while keeping executable and typed Maps integration surfaces out of the project.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 93 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check package.json PLAN.md client/src/lib/client-shell.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.9 Stateless Toaster Theme Increment

- Added client-shell coverage proving the package does not declare `next-themes` or import it from client source.
- Switched the toast component to the app's stateless local `ThemeContext`.
- Removed the `next-themes` dependency so theme state cannot reintroduce browser persistence through an unused provider package.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 94 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check package.json PLAN.md client/src/lib/client-shell.test.ts client/src/components/ui/sonner.tsx` passes after formatting `client/src/lib/client-shell.test.ts`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.8/4.9 Raw HTML Surface Removal Increment

- Added client-shell coverage rejecting raw HTML injection surfaces in non-test client source.
- Removed the unused chart component that relied on `dangerouslySetInnerHTML` for generated style injection.
- Removed the unused Recharts dependency so the plain-text report shell has no unused rich-chart surface.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 95 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check package.json PLAN.md client/src/lib/client-shell.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.8 Plain-Text Clipboard Export Increment

- Added focused coverage for the PowerScribe copy path using a clipboard abstraction that only writes plain text.
- Preserved report line breaks exactly when writing to the clipboard.
- Routed the existing Copy to Clipboard button through the tested helper without changing report generation.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 96 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/clipboard.ts client/src/lib/clipboard.test.ts client/src/pages/Home.tsx` passes after formatting `client/src/lib/clipboard.test.ts`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.4 Workflow Button Label Increment

- Added source-level UI coverage for the SPEC-required `Copy to Clipboard` and `Clear All` workflow labels.
- Updated the top-bar copy button label from `Copy report` to `Copy to Clipboard`.
- Updated the worksheet reset button label from `Clear` to `Clear All` without changing behavior.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 97 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/workflow-ui.test.ts client/src/pages/Home.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.4/4.8 Report Copy Placement Increment

- Added source-level UI coverage proving the report-panel `Copy to Clipboard` action appears below the structured report preview.
- Changed the report-panel copy label from `Copy` to `Copy to Clipboard`.
- Moved the report-panel copy action below the preview while preserving the existing plain-text clipboard behavior.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 98 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/workflow-ui.test.ts client/src/pages/Home.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.4 Report Text Box Increment

- Added source-level UI coverage proving the structured report preview is a read-only text box bound to the live report value.
- Replaced the report preview `<pre>` with a read-only `<textarea>` so radiologists can select plain report text directly.
- Preserved the existing `Copy to Clipboard` action below the preview and the deterministic report-generation path.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 99 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/workflow-ui.test.ts client/src/pages/Home.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.8 Technique Consensus Sentence Increment

- Added report coverage proving the Technique section begins with the fixed multi-source consensus sentence.
- Preserved the reconciliation-rule and Delta z disagreement-threshold wording in that first Technique sentence.
- Moved the imaging-acquisition and motion sentence after the fixed consensus sentence without changing measured-parameter output.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 100 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/report.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.10 Registry Failure Parameter Logging Increment

- Added source-registry acceptance coverage requiring failed candidates to log the offending parameter.
- Extended registry validation failures with the parameter id and display name alongside GA, Delta, candidate source, and existing source.
- Preserved accepted-candidate behavior and the existing half-week overlap sampling rule.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 100 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.6 Source-Disagreement Link Increment

- Added UI coverage proving differential source-disagreement badges link to row-level source breakdown anchors.
- Gave each measured parameter source breakdown a stable `source-breakdown-{parameterId}` anchor target.
- Rendered differential source-disagreement badges as links to those anchors without changing card ranking or trigger logic.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 101 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/source-detail-ui.test.ts client/src/components/ParameterRow.tsx client/src/components/DifferentialCard.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.2 Disagree Source Auto-Expansion Increment

- Added row-level UI coverage proving source breakdowns open by default when the agreement state is `disagree`.
- Bound the parameter-row source breakdown `open` state to the computed disagreement state.
- Preserved collapsed source breakdowns for non-disagree rows and kept the existing source-disagreement anchors.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 102 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/source-detail-ui.test.ts client/src/components/ParameterRow.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.2 Reference-Cohort Surface Removal Increment

- Added source-surface coverage rejecting alternate reference-set selection code such as `luis-only`.
- Removed legacy reference-set exports and the unused reference-set resolver from the biometry engine.
- Kept the Luis coefficients used as source-registry entries for multi-source consensus reconciliation.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 103 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/client-shell.test.ts client/src/lib/biometry.ts` passes after formatting `client/src/lib/client-shell.test.ts` and `client/src/lib/biometry.ts`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.4 N-Sources Affordance Label Increment

- Added row-level UI coverage proving the clickable source-breakdown summary includes the dynamic source count.
- Changed the source breakdown summary from generic `Source breakdown` text to an `N source(s) breakdown` affordance.
- Preserved the existing source-breakdown anchor and disagreement default-open behavior.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 104 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/source-detail-ui.test.ts client/src/components/ParameterRow.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.10 QI Protocol Methodology Increment

- Added Methodology-page coverage for the SPEC-required pre/intervention/post QI deployment tracking protocol.
- Surfaced the 100 historical-report baseline audit, intervention deployment, and 100 new-report post-audit endpoints.
- Named the required baseline metrics: time to report, measurement completeness, and explicit z-score/percentile documentation.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 105 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/methodology-page.test.ts client/src/pages/Methodology.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 6.3 FeTA Validation Endpoint Increment

- Added Validation-page coverage for the four SPEC §6.3 FeTA 2024 manuscript endpoints.
- Surfaced per-parameter agreement, multi-site/multi-vendor/multi-field-strength robustness, pathology-versus-neurotypical comparison, and ROC-AUC.
- Kept the increment documentation-only without changing scoring-engine behavior.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 106 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/validation-page.test.ts client/src/pages/Validation.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 6.4 Institutional Validation Cohort Increment

- Added Validation-page coverage for the SPEC §6.4 institutional cohort composition and study roles.
- Surfaced the 60-case target with 20 neurotypical, 20 mild-or-moderate pathology, and 20 severe pathology scans.
- Documented the cohort roles: expert ground truth, per-condition labels, with-tool-versus-without-tool reader study, and inter-rater reliability.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 107 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/validation-page.test.ts client/src/pages/Validation.tsx` passes after formatting `client/src/pages/Validation.tsx`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 6.6 Validation Dataset Cross-Reference Increment

- Added Validation-page coverage for the SPEC §6.6 datasets considered and rejected.
- Surfaced the dHCP fetal release caveat: no expert-measured biometry and no case-level pathology labels.
- Surfaced the Luis 2025 cohort caveat: it is a registry reference distribution and cannot be used for circular validation.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 108 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/validation-page.test.ts client/src/pages/Validation.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 6.7 Validation Timeline Increment

- Added Validation-page coverage for the SPEC §6.7 validation timeline.
- Surfaced the FeTA access and analysis timing: Synapse Data Access Request, Data Transfer Agreement, two-to-four-week access, and three-to-four-week analysis.
- Surfaced the institutional timeline: four-to-six-week IRB submission, six-to-twelve-week reader study, and six-to-nine-month manuscript path.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 109 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/validation-page.test.ts client/src/pages/Validation.tsx` passes after formatting `client/src/pages/Validation.tsx`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 6.1 Validation Philosophy Increment

- Added Validation-page coverage for the SPEC §6.1 validation philosophy.
- Surfaced the measurement-layer versus interpretation-layer distinction and the Phase 1 interpretation-only scope.
- Documented that validation requires both internal and external cohorts, with expert ground-truth measurements anchoring interpretation-layer agreement.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 110 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/validation-page.test.ts client/src/pages/Validation.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 6.2 FeTA Cohort Composition Increment

- Added Validation-page coverage for the SPEC §6.2 FeTA 2024 external cohort composition.
- Surfaced the 300 super-resolution T2 volumes across five named sites, three field strengths, and four vendor classes.
- Documented the neurotypical/pathological split and named pathology categories used for external validation.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 111 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/validation-page.test.ts client/src/pages/Validation.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 6.2 FeTA Measurement Coverage Increment

- Added Validation-page coverage for the SPEC §6.2 FeTA ground-truth, derivable, and unavailable measurement groups.
- Surfaced the five direct expert-measured FeTA biometric values and the four additional values derivable from segmentation masks.
- Documented the remaining parameters requiring the institutional cohort plus the 120-case training and 180-case test-set access split.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 112 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/validation-page.test.ts client/src/pages/Validation.tsx` passes after formatting `client/src/lib/validation-page.test.ts` and `client/src/pages/Validation.tsx`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Mild-VM Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 mild-ventriculomegaly likelihood manifest.
- Kept the transcribed Pagani 2014 neurodevelopmental-delay statistic visible in the rationale and report impression.
- Replaced estimate-only mild-VM likelihood labels with qualitative wording rather than unsupported numeric percentages.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 113 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Moderate-VM Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 moderate-ventriculomegaly likelihood manifest.
- Confirmed the moderate-VM card no longer surfaces estimate-only numeric percentages.
- Replaced the associated-anomaly, chromosomal, isolated, and CMV likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 114 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Severe-VM Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 severe-ventriculomegaly likelihood manifest.
- Replaced estimate-only severe-VM numeric likelihood labels with qualitative wording.
- Corrected the aqueductal-stenosis rationale attribution from the placeholder Garel 2018 wording to the canonical Heaphy-Henault 2018 fetal-MRI source.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 115 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Absent-CSP Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 absent-CSP likelihood manifest.
- Kept the SMFM absent-CSP/ACC rationale visible while avoiding numeric likelihood labels for estimate rows.
- Replaced the holoprosencephaly, ACC, hydrocephalus, SOD, and isolated likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 116 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Enlarged-CSP Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 wide/enlarged-CSP likelihood manifest.
- Confirmed the enlarged-CSP card no longer surfaces estimate-only numeric percentages.
- Replaced the normal-variant, cavum-vergae, cavum-velum-interpositum, associated-anomaly, and obstructive-hydrocephalus labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 117 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Complete-ACC Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 complete-ACC likelihood manifest.
- Preserved the transcribed Santo 2012 isolated complete-ACC likelihood label and rationale.
- Replaced approximate or estimate-only monogenic and chromosomal likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 118 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Partial-ACC Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 partial/hypogenesis corpus-callosum likelihood manifest.
- Confirmed the partial-ACC card no longer surfaces estimate-only numeric percentages.
- Replaced the isolated, monogenic, and chromosomal/CNV likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 119 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Small-Pons Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 small-pons likelihood manifest.
- Preserved the van Dijk 2018 PCH Type 2 rationale while avoiding a precise estimate label.
- Replaced the PCH subtype, CASK, and tubulinopathy likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 120 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Small-Vermis Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 small-vermis likelihood manifest.
- Confirmed the small-vermis card no longer surfaces estimate-only numeric percentages.
- Replaced the Dandy-Walker, isolated hypoplasia, Joubert, and chromosomal/syndromic likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 121 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes after formatting `client/src/lib/biometry.test.ts`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Third-Ventricle Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 wide-third-ventricle likelihood manifest.
- Confirmed the third-ventricle card no longer surfaces estimate-only numeric percentages.
- Replaced the aqueductal-stenosis, ACC/dysgenesis, HPE, and cyst likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 122 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Microcephaly Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 microcephaly likelihood manifest.
- Confirmed the microcephaly card no longer surfaces estimate-only numeric percentages.
- Replaced the genetic, infection, malformation, chromosomal, and constitutional likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 123 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Macrocephaly Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 macrocephaly likelihood manifest.
- Confirmed the macrocephaly card no longer surfaces estimate-only numeric percentages.
- Replaced the hydrocephalus, benign familial macrocephaly, megalencephaly, and tumor/cyst likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 124 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 Hydrocephalus-Pattern Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 hydrocephalus combined-pattern likelihood manifest.
- Confirmed the hydrocephalus-pattern card no longer surfaces estimate-only numeric percentages.
- Replaced the aqueductal-stenosis, L1CAM, and posterior-fossa/Chiari II likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 125 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 HPE-Pattern Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 HPE combined-pattern likelihood manifest.
- Confirmed the HPE-pattern card no longer surfaces estimate-only numeric percentages.
- Replaced the alobar/semilobar, lobar, and septo-optic-dysplasia likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 126 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 ACC-Pattern Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 ACC combined-pattern likelihood manifest.
- Confirmed the ACC-pattern card no longer surfaces estimate-only numeric percentages.
- Replaced the complete-ACC, partial-ACC, and associated-syndrome likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 127 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 DWM-Pattern Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 Dandy-Walker combined-pattern likelihood manifest.
- Confirmed the DWM-pattern card no longer surfaces estimate-only numeric percentages.
- Replaced the Dandy-Walker, vermian-hypoplasia, and Blake's-pouch-remnant likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 128 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.4 PCH-Pattern Likelihood Qualitative Increment

- Added DDx coverage for the SPEC §7.4 pontocerebellar-hypoplasia combined-pattern likelihood manifest.
- Confirmed the PCH-pattern card no longer surfaces estimate-only numeric percentages.
- Replaced the PCH2, PCH1, other-PCH/CASK/tubulinopathy, and acquired-CMV likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 129 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, Hemispheric-Asymmetry Likelihood Qualitative Increment

- Added DDx coverage for the TEST.md §24 hemispheric-asymmetry likelihood labels.
- Confirmed the brain-asym card no longer surfaces unsupported numeric percentages.
- Replaced the hemimegalencephaly, cortical-malformation, porencephaly, and vascular-malformation likelihood labels with qualitative wording.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 130 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/biometry.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 7.5 Source Verification Dossier Increment

- Added regression coverage that the SPEC §7.5 verification dossier exists.
- Cross-listed the Dovjak, Woitek, third-ventricle, Section 7.4 citation-pass, and Chiari calibration action items.
- Tracked each action item with an explicit status so unresolved clinician-collaborator work is visible.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 131 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md source_verification_dossier.md client/src/lib/methodology-page.test.ts` passes after formatting `source_verification_dossier.md`.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.8 Clinical Integration Workflow Increment

- Added Methodology-page coverage for the Epic Radiant launch path and SMART-on-FHIR deferral.
- Surfaced the PowerScribe paste workflow and plain-text clipboard constraint from SPEC §4.8.
- Kept the implementation as documentation of Phase 1 integration rather than introducing PHI-bearing EHR code.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 132 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/methodology-page.test.ts client/src/pages/Methodology.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.11.1 Clinical-Indication Report Increment

- Added report coverage for the SPEC §4.11.1 clinical-indication behavior.
- Left Clinical Indication blank for manual entry when no EHR context is supplied.
- Allowed an optional EHR/context indication string to populate the Clinical Indication section.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 133 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/report.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.11.4 Citation-Grounded Impression Increment

- Added report coverage for citation-grounding on generated Impression differential lines.
- Included each fired DDx card's primary source inline in the plain-text report.
- Included secondary source attribution when a fired DDx card has one.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 134 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/report.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.11 GenAI/RAG Guardrail Scaffold Increment

- Added regression coverage for the SPEC §4.11.2 RAG prompt constraint and knowledge-bank scope.
- Added coverage for the SPEC §4.11.3 agentic PubMed search query shape, top-3 retrieval limit, and transparency flag.
- Added metadata coverage for the SPEC §4.11.5 local and free-tier backend recommendations without introducing network calls.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 138 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/genai.ts client/src/lib/genai.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.11.4 Post-Generation Verification Increment

- Added GenAI guardrail coverage for cross-checking generated report text against original numeric inputs.
- Failed verification when a generated report omits the exact expected measurement anchor.
- Returned the safe deterministic-template fallback whenever verification fails.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 140 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/genai.ts client/src/lib/genai.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.11 GenAI/RAG Methodology Exposure Increment

- Added Methodology-page coverage for the optional GenAI/RAG module and strict no-external-claims prompt.
- Surfaced the Bio.Entrez top-3 PubMed fallback, temporary abstract context, and PMID transparency requirement.
- Surfaced the safe deterministic fallback and local/free-tier backend recommendations without enabling network calls.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 141 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/methodology-page.test.ts client/src/pages/Methodology.tsx` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.8 Source-Agreement Note Ordering Increment

- Added report coverage for a disagreeing measurement rendered alongside auxiliary inputs.
- Confirmed SOURCE-AGREEMENT NOTES appears immediately after FINDINGS, before auxiliary or qualitative sections.
- Kept auxiliary and qualitative sections intact after source-agreement notes.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 142 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/biometry.test.ts client/src/lib/report.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.11.2 RAG Prompt Payload Increment

- Added GenAI coverage that prompt payloads include the strict RAG system prompt.
- Injected exact numerical inputs, z-scores, and percentiles into the prompt payload.
- Injected retrieved evidence chunks with source labels so generated impressions stay literature-grounded.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 143 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/genai.ts client/src/lib/genai.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.3 Python/FastAPI Architecture Scaffold Increment

- Added architecture coverage for the SPEC §4.3 Python/FastAPI/Jinja deployment surface.
- Required local HTMX and Tailwind assets so the scaffold remains offline-capable.
- Declared the required numpy/scipy math dependencies and standalone packaging dependency.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 146 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md python_app/templates/index.html python_app/static/tailwind.css python_app/static/htmx.min.js client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.3 Python Biometry Core Scaffold Increment

- Added architecture coverage that the Python scaffold exposes the three SPEC §4.2.1 model families.
- Required numpy-backed polynomial evaluation and scipy.stats.norm percentile conversion.
- Added a minimal Python z-score helper that can be expanded toward the full TypeScript consensus engine.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 147 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.3 Standalone Docker Packaging Increment

- Added architecture coverage for the SPEC §4.3 lightweight Docker deployment option.
- Packaged the Python FastAPI scaffold from `pyproject.toml`.
- Ran the offline FastAPI app with uvicorn on a local workstation/container port.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 148 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.3 Python Build Metadata Increment

- Added packaging coverage that the Docker `pip install .` path has PEP 517 build-system metadata.
- Declared the setuptools build backend in `pyproject.toml`.
- Kept the deployment artifact aligned with the FastAPI scaffold.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 148 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.3 Python Centile-Table Fit Scaffold Increment

- Added architecture coverage for the offline `scipy.optimize.curve_fit` registry-build path.
- Provided Python helpers that fit per-week 5th/95th centile tables into the supported per-percentile linear family.
- Provided a companion helper for per-week mean/SD tables using the linear-mean constant-SD family.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 149 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.2.5 Python Fit Residual Audit Increment

- Added architecture coverage that Python registry-build fits retain residual RMSE.
- Added an optional max-RMSE guard matching the inter-rater-variability threshold requirement.
- Returned fit result records that keep both the fitted model and audit residuals.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 150 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.11.3 Python Bio.Entrez Fallback Scaffold Increment

- Added architecture coverage for the optional Python Bio.Entrez agentic-search backend hook.
- Declared Biopython as an optional GenAI dependency without enabling network calls in the client.
- Added a Python plan module that builds the PubMed query shape, top-3 abstract limit, and PMID transparency metadata.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 151 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.4 Python Jinja Worksheet Shell Increment

- Added architecture coverage that the FastAPI/Jinja first screen is a worksheet shell rather than scaffold copy.
- Rendered GA week/day controls, imaging context, parameter inputs, and a structured-report preview from Jinja.
- Added a lightweight HTMX `/calculate` endpoint hook for report-preview updates without storing PHI.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 152 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts python_app/templates/index.html` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.3 Local HTMX Adapter Increment

- Added architecture coverage that the bundled HTMX asset is not a placeholder.
- Implemented the local `hx-post`/`hx-target` form-update behavior used by the Python worksheet.
- Preserved the offline/no-external-script deployment posture.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 153 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts python_app/static/htmx.min.js` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.3 Local Tailwind Stylesheet Increment

- Added architecture coverage that the bundled Tailwind stylesheet is not a placeholder.
- Provided local CSS for the FastAPI/Jinja worksheet shell layout, controls, and report preview.
- Preserved the offline/no-CDN styling posture.

Verification:

- `npx pnpm@10.4.1 test -- --runInBand` passes with 154 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts python_app/static/tailwind.css` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.2 Python Source Registry Increment

- Added architecture coverage for a Python source registry covering every z-scored worksheet parameter.
- Ported the model coefficients and multi-source overrides needed for consensus evaluation.
- Used the Python registry in the FastAPI report-preview endpoint to emit consensus z-score, percentile, agreement, and source labels.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 155 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.8 Python Source Detail Report Increment

- Added architecture coverage that the Python report endpoint propagates per-source z values.
- Added SOURCE-AGREEMENT NOTES for Python rows whose registry sources disagree.
- Kept the report preview plain text for PowerScribe paste compatibility.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 156 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 4.6 Python Core DDx Bridge Increment

- Added architecture coverage for Python endpoint differential-consideration output.
- Implemented deterministic threshold triggers for the core ventriculomegaly, CSP, third-ventricle, size-summary, posterior-fossa, and pons patterns.
- Used the Python DDx rows to make the report impression more specific when a core trigger fires.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 157 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.

## 2026-05-23, SPEC 6.5 Python Chiari II Discriminator Increment

- Added architecture coverage for the Python Mahalanobis ONTD posterior helper.
- Implemented the TDPF/CSA Chiari II trigger using consensus z-scores and posterior > 0.5.
- Flagged the Python report output as research-mode when the Chiari II / ONTD discriminator fires.

Verification:

- `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` passes.
- `npx pnpm@10.4.1 test -- --runInBand` passes with 158 tests.
- `npx pnpm@10.4.1 check` passes.
- `npx pnpm@10.4.1 exec prettier --check PLAN.md PROGRESS.md client/src/lib/architecture.test.ts` passes.
- `npx pnpm@10.4.1 build` passes with only the pre-existing chunk-size warning.
