# Active Goal Completion Audit

Last updated: 2026-05-24.

Goal status: Software-ready complete; external evaluation pending.

This audit maps the active thread goal to concrete repository evidence. It is
not a substitute for clinical validation or radiologist signoff; it records what
is implementation-complete and what still blocks declaring the project done.

## Objective Restatement

Build the project described in SPEC.md from scratch in small, verifiable
increments. Each increment should append PLAN.md, use TEST.md as the behavior
source, add failing-first coverage before implementation, run tests/linter/type
checks/build gates, update PROGRESS.md, and commit. The adjusted stop condition
from the user on 2026-05-24 is software-ready for radiologist evaluation: every
implementation-side SPEC.md acceptance criterion has passing evidence, the test
corpus is internally audited, the export validators prevent known bad
evaluation inputs, the suite is green, and remaining work is limited to real
external/internal evaluation data and clinician signoff.

The publication-readiness extension of the goal adds: validate as deeply as
possible, research the publication landscape, document gaps that could prevent
successful publication, and address all implementation-side issues before
radiologist handoff. That implementation-side scope is complete; outcome
evaluation remains post-handoff work.

## Prompt-to-artifact checklist

| Requirement                                                   | Evidence artifact or command                                                | Current evidence                                                                                                                                                                                                | Status               |
| ------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Canonical requirements exist and drive implementation         | SPEC.md                                                                     | SPEC.md is present and remains the normative technical, validation, source, and publication specification.                                                                                                      | Implementation-ready |
| Test corpus exists and is runtime-aligned                     | TEST.md; source-document tests in `client/src/lib/methodology-page.test.ts` | TEST corpus numeric audit is closed with 0 residual normal-label rows in `source_verification_dossier.md`.                                                                                                      | Closed               |
| Small increment planning is recorded                          | PLAN.md                                                                     | PLAN.md contains the per-increment plan history through the Software Readiness Completion Audit Increment.                                                                                                      | Complete             |
| Progress and verification evidence are recorded               | PROGRESS.md                                                                 | PROGRESS.md records command-level evidence for each committed increment, including failing-first checks and full gates through 290 passing tests.                                                               | Complete             |
| Browser calculator implementation exists                      | `client/src/lib/biometry.ts`, UI pages, report tests                        | Full Vitest suite covers source registry, DDx cards, report generation, validation metrics, workflow UI, methodology, and privacy shell.                                                                        | Implementation-ready |
| Python offline app exists                                     | python_app, pyproject.toml                                                  | `python3 -m py_compile python_app/__init__.py python_app/main.py python_app/biometry.py python_app/genai.py python_app/registry.py` is part of the full gate; packaging hardening is documented in PROGRESS.md. | Implementation-ready |
| Publication handoff is operationalized                        | publication_handoff_checklist.md                                            | Checklist maps TRIPOD+AI, CLAIM, SQUIRE 2.0, STARD-AI, DECIDE-AI, SPIRIT-AI, and CONSORT-AI to evidence and owners.                                                                                             | Prepared             |
| Source verification and clinical-reliance caveats are visible | source_verification_dossier.md; source_data_final_lock.md                   | Implementation-side Dovjak, Woitek, extra-axial CSF, third-ventricle, likelihood-label, and TEST numeric audit items are closed; clinician countersignature remains explicit post-handoff work.                 | Software-ready       |
| Validation analysis is pre-specified                          | validation_analysis_lock.md; validation_data_dictionary.md                  | Threshold, cohort, endpoint, code-freeze, calibration, clinical-utility, no-post-hoc-threshold templates, de-identified export schemas, and runtime export validators are present.                              | Software-ready       |
| Reader study and IRB/QI workflow are specified                | reader_study_protocol.md                                                    | IRB / QI determination, waiver path, de-identification, timing, washout, usability, report-completeness endpoints, and reader-study export guards are documented.                                               | Software-ready       |
| Full test gate is required before each commit                 | `npx pnpm@10.4.1 test -- --runInBand`                                       | Software readiness completion audit reran the full Vitest suite with 290 passing tests.                                                                                                                         | Passed               |
| Type check is required before each commit                     | `npx pnpm@10.4.1 check`                                                     | Software readiness completion audit reran the TypeScript check successfully.                                                                                                                                    | Passed               |
| Production build is required before each commit               | `npx pnpm@10.4.1 build`                                                     | Software readiness completion audit reran the production build successfully; build has only the known chunk-size warning.                                                                                       | Passed               |
| Python compile gate is required before each commit            | `python3 -m py_compile`                                                     | Software readiness completion audit reran the Python compile gate successfully.                                                                                                                                 | Passed               |
| Formatting and diff hygiene are required before commit        | Prettier check; `git diff --check`                                          | Software readiness completion audit reran Prettier check for touched audit files and `git diff --check` successfully.                                                                                           | Passed               |

## Post-Software Evaluation Work

These are not implementation-side bugs and no longer block the adjusted
software-ready goal. They are the real evaluation and publication tasks the
radiology / analyst team must complete after handoff.

| Blocker                               | Evidence                                                                                        | Required closure condition                                                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| FeTA 2024 biometry gap                | source_verification_dossier.md; publication_handoff_checklist.md; validation_data_dictionary.md | FeTA access, measurements, cohort flow, subgroup tables, and external validation results are locked.                                   |
| Institutional cohort and reader study | reader_study_protocol.md; publication_handoff_checklist.md; validation_data_dictionary.md       | IRB / QI determination, de-identification workflow, local case set, reader assignments, and exported paired results are complete.      |
| IRB / QI determination                | reader_study_protocol.md                                                                        | Local PI confirms QI versus IRB path and records waiver / approval outcome.                                                            |
| Calibration and clinical utility      | validation_analysis_lock.md; source_verification_dossier.md                                     | Locked thresholds, labels, calibration table, decision-curve net benefit, and exported results are available.                          |
| Sample-size / precision assumptions   | publication_handoff_checklist.md; validation_analysis_lock.md                                   | PI selects target Wilson half-widths, expected paired effects, and feasible case counts.                                               |
| Source-data final lock                | source_data_final_lock.md                                                                       | Radiologist reviewer and PI countersign Dovjak, Woitek, extra-axial CSF, third-ventricle policy, and final clinical-reliance decision. |
| Chiari II / ONTD calibration          | SPEC.md Section 6.5; source_data_final_lock.md                                                  | Local cohort calibrates Mahalanobis centroids / ONTD threshold and records sensitivity, specificity, and threshold.                    |

## Completion Decision

Under the adjusted 2026-05-24 stop condition, the repository is software-ready
for radiologist evaluation. The implementation, tests, source documents, export
schemas, validation metrics, handoff scaffolding, and runtime guardrails are in
place; the TEST.md normal-label audit is closed at 0 residual normal-label rows;
and the latest full gate is green. The remaining items above are real
evaluation / publication dependencies, not software-readiness blockers.
