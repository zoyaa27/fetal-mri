# Reader Study Protocol Handoff

This protocol is the implementation-side packet for the radiologist
collaborators. It does not replace the local IRB / QI determination; it lists
the de-identification workflow, fields, and reading schedule needed for that
submission and for the with-tool versus without-tool reader study. The export
schema below intentionally mirrors `validation_data_dictionary.md` and
`validation_export_templates/reader_study_rows.csv` so the reader-study data
collected by radiologists can pass the runtime validation guard before analysis.

## IRB / QI Determination

| Field        | Protocol value                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Study type   | Retrospective minimal-risk QI / implementation study of a reporting-support calculator.                                      |
| Intended use | Supplemental biometry calculation and structured-report assistance; the calculator does not replace clinical interpretation. |
| Consent path | Request waiver of consent for retrospective de-identified case review and reader-performance analysis.                       |
| Local PI     | Radiologist collaborator at the institution performing the reader study.                                                     |
| PHI handling | No PHI enters the calculator; exported analysis tables use study IDs only.                                                   |
| Data storage | Store source imaging and the secure re-identification crosswalk only on institution-approved encrypted storage.              |
| Safety stop  | Pause the study if a reader believes the tool output could alter signed clinical care outside the approved protocol.         |

## De-Identification Workflow

1. Assign each fetal MRI examination a random study ID before export.
2. Remove MRN, accession, patient name, date of birth, exact exam date, and free-text identifiers from study packets.
3. Keep gestational age, scanner metadata, image-quality tier, expert labels, and measurements required for analysis.
4. Store the secure re-identification crosswalk separately under the local PI or honest broker; implementation does not receive the crosswalk.
5. Export only aggregate validation tables and study-ID-level measurement rows for analysis.

## Reader-Study Design

| Design element | Requirement                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Readers        | Two to five fetal/neuro radiologists or radiology trainees approved by the PI.                                                              |
| Cases          | Target 60 cases: 20 neurotypical, 20 mild/moderate pathology, 20 severe pathology.                                                          |
| Precision plan | Lock expected paired effect sizes, paired-difference SDs, alpha, and power with `estimatePairedMeanDifferenceSampleSize` before scheduling. |
| Design         | Within-reader crossover: each reader interprets each case once without the calculator and once with it.                                     |
| Ordering       | Counter-balanced case order and tool condition by reader.                                                                                   |
| Washout        | Minimum two-week washout between without-tool and with-tool reads for the same case.                                                        |
| Training       | Five pilot cases for tool familiarization; exclude pilot cases from endpoint analysis.                                                      |
| Blinding       | Readers are blinded to final consensus labels during interpretation.                                                                        |

## Endpoint Capture

| Endpoint                     | Capture method                                                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reader-study timing          | Start/stop timer per case and condition; report median and interquartile range.                                                                                      |
| report-completeness endpoint | Score whether required biometric measurements, z-scores/percentiles, source caveats, and recommendations are present.                                                |
| recommendation congruence    | Compare follow-up or counselling recommendation against expert adjudication.                                                                                         |
| z-score documentation rate   | Proportion of measured parameters with z-score and percentile documented.                                                                                            |
| inter-rater reliability      | Compute Cohen's kappa for two-reader categorical labels, Fleiss's kappa for three-plus-reader categorical labels, and ICC(2,1) for repeated continuous measurements. |
| NASA Task Load Index         | Collect the six raw NASA Task Load Index subscales after each reader completes each condition block.                                                                 |
| System Usability Scale       | Collect item-level System Usability Scale responses after the with-tool block so the score can be recomputed.                                                        |
| qualitative feedback         | Record short free-text comments about confusing outputs, missing controls, and workflow friction.                                                                    |

## Analysis Table Schema

Use `reader_study_rows.csv` for one row per reader, case, and condition.
Pathology grouping is derived from `case_log.csv` / `diagnostic_labels.csv`,
not duplicated in the reader-study export.

| Column                    | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| reader_id                 | De-identified reader identifier.                                 |
| study_id                  | De-identified case identifier linked to `case_log.csv`.          |
| condition                 | `without_tool` or `with_tool`.                                   |
| read_order                | Integer order within the reader's assigned sequence.             |
| washout_days              | Days between paired reads; minimum is 14.                        |
| duration_sec              | Positive interpretation time in seconds.                         |
| completeness_score        | Non-negative predefined report-completeness score.               |
| zscore_documentation_rate | Per-case proportion from 0 to 1.                                 |
| recommendation_congruent  | Boolean adjudicated recommendation match.                        |
| categorical_label         | Reader's final categorical diagnostic label for kappa.           |
| continuous_measurement    | Repeated continuous measurement for ICC(2,1).                    |
| nasa_tlx_mental_demand    | NASA Task Load Index 0-100 mental-demand subscale.               |
| nasa_tlx_physical_demand  | NASA Task Load Index 0-100 physical-demand subscale.             |
| nasa_tlx_temporal_demand  | NASA Task Load Index 0-100 temporal-demand subscale.             |
| nasa_tlx_performance      | NASA Task Load Index 0-100 performance subscale.                 |
| nasa_tlx_effort           | NASA Task Load Index 0-100 effort subscale.                      |
| nasa_tlx_frustration      | NASA Task Load Index 0-100 frustration subscale.                 |
| sus_item_1                | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_2                | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_3                | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_4                | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_5                | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_6                | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_7                | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_8                | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_9                | System Usability Scale integer response 1-5 after with-tool use. |
| sus_item_10               | System Usability Scale integer response 1-5 after with-tool use. |

## Go / No-Go

The study can begin only after local IRB / QI determination, de-identification
workflow approval, reader recruitment, counter-balanced reading schedule,
minimum 14-day paired-read washouts, and pilot-case training are complete.
Manuscript submission remains blocked until paired within-reader / within-case
reader-study timing, report-completeness endpoint, recommendation congruence,
paired delta confidence intervals, NASA Task Load Index, System Usability Scale,
and qualitative feedback tables are exported and reviewed by the PI.
