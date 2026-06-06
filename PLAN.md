## Consensus registry increment

- Add Vitest coverage for SPEC §4.2.3/§4.2.4: TCD at 28w0d and 33.0 mm must evaluate Luis 2025 and Dovjak 2021 and compute consensus z from in-range sources. Because the verbatim §7.3 coefficients yield Delta z 0.98 for 33.0 mm, add a 33.2 mm disagreement assertion for the Delta z >= 1.0 runtime flag.
- Add report coverage for SPEC §4.8: measured rows must include consensus values, per-source z/mean/SD/range details, agreement state, and SOURCE-AGREEMENT NOTES when a row disagrees.
- Replace one-model-per-parameter scoring with a per-parameter source registry and deterministic consensus reconciler.
- Surface source count, agreement badge, and per-source details in each parameter row.
- Remove the user-facing reference-set selector so the imaging-context strip only indicates multi-source consensus mode.

## Chiari II / open NTD increment

- Add Vitest coverage for SPEC §6.5.2 worked example: at 24w0d, TDPF 24.0 mm and CSA 55.0 degrees must produce severely low single-source Woitek z-scores.
- Add Vitest coverage for SPEC §6.5.4: the combined TDPF/CSA pattern must emit a Chiari II / open neural tube defect DDx card when both z-scores are below -2 and the ONTD Mahalanobis posterior is above 0.5.
- Extend the parameter model and UI/report rendering so a parameter can use degree units, not only millimetres.
- Add TDPF and CSA source-registry entries using the Woitek 2014 quadratic mean / linear SD coefficients and validated 21-37 week window.
- Implement the Mahalanobis posterior helper and DDx card using consensus z-scores.

## Source-registry acceptance increment

- Add Vitest coverage for SPEC §4.10.1 using skull BPD: an identical candidate source should pass with zero standardized divergence.
- Add Vitest coverage for SPEC §4.10.1 rejection: a candidate shifted well above the existing mean curve should fail and report the offending source, GA, and delta.
- Implement a source-registry extension validator that samples half-week increments over each overlap and computes max |mu_new - mu_existing| / max(sigma_new, sigma_existing).

## Methodology audit increment

- Add Vitest coverage for SPEC §4.10.2: cross-validation audits must be reproducible from the source registry and include half-week samples for each multi-source parameter.
- Add verification tier metadata to source-registry entries so Methodology can show byte-identical, transcribed, derived, or approximation rows per SPEC §7.5.
- Implement audit status classification (`pass`, `partial-fail`, `fail`) using the 0.5 SD threshold and contiguous excursion rule from SPEC §4.10.2.
- Replace stale Methodology copy about selectable reference sets with always-on consensus wording, audit charts, and verification-tier lines.

## DDx source-disagreement increment

- Add Vitest coverage for SPEC §4.6: a DDx card triggered from a disagreeing source row must carry source-disagreement metadata.
- Add related-parameter metadata to z-score-driven DDx cards so the engine can propagate `disagree` rows into the card output.
- Render source-disagreement badges in expanded cards and rail items.

## Third-ventricle manifest correction

- Add Vitest coverage for SPEC §4.2.2 / §7.3.12 third-ventricle metadata: Birnbaum 2018 must be tagged cross-modality, approximation-tier, and valid over 18-37 weeks.
- Correct the third-ventricle registry range so 18w is in range and 38w is extrapolated.

## Chiari research-mode report flag

- Add report coverage for SPEC §7.5: when the Chiari II / ONTD card fires, the structured report must explicitly flag that discriminator as research-mode pending local calibration.
- Add a deterministic report note tied to the fired card id.

## Gestational-age parsing increment

- Add Vitest coverage for TEST.md §1.3: GA input strings must accept weeks+days (`24+3`, `24w 3d`) and decimal weeks (`24.5 w`).
- Implement a parser that normalizes valid inputs to `{weeks, days}` and rejects out-of-range days.
- Add a compact top-bar GA text field that applies parsed GA on Enter or blur while preserving the existing week/day dropdown workflow.

## Normal-control impression increment

- Add Vitest coverage for TEST.md §2 normal controls: when measurements are present and no abnormal thresholds fire, the report impression must contain the exact sentence `No abnormal biometric findings.`
- Replace the longer prototype normal-impression sentence with the TEST.md expected line.

## Mild-VM impression increment

- Add Vitest coverage for TEST.md §3 Case M1: bilateral 11 mm atria at 24w0d should emit the isolated mild ventriculomegaly impression sentence.
- Add card-specific deterministic impression text for the mild ventriculomegaly DDx card.
- Update report generation to prefer a fired card's deterministic impression line before the generic abnormal-report fallback.

## Asymmetric mild-VM impression increment

- Add Vitest coverage for TEST.md §3 Case M3: right-sided 12 mm atrium with normal left atrium at 28w0d must use the asymmetric mild-VM impression.
- Add deterministic impression text to the asymmetric-ventricle card.
- Add impression priority so specific combined/asymmetric impressions can override generic mild-VM prose even when the mild-VM card ranks higher.

## Isolated severe-VM impression increment

- Add Vitest coverage for TEST.md §4 Case S3: bilateral 17.5 mm atria at 28w0d with otherwise normal measured context should fire severe VM only and emit the Carta 2018 isolated severe-VM impression.
- Add card-specific deterministic impression text to the severe ventriculomegaly card.
- Assign severe VM an impression priority above generic mild/moderate VM but below future combined-pattern impressions.

## Aqueductal-stenosis impression increment

- Add Vitest coverage for TEST.md §4 Case S1: severe bilateral VM with third-ventricle dilatation and macrocephaly at 26w0d should fire the triventricular hydrocephalus pattern.
- Assert the combined-pattern report impression exactly matches the Heaphy-Henault aqueductal-stenosis wording.
- Add a high-priority deterministic impression to the hydrocephalus composite card so it overrides the generic severe-VM impression.

## ACC severe-VM impression increment

- Add Vitest coverage for TEST.md §4 Case S2: severe bilateral VM with absent CSP and absent CC at 24w0d should fire the ACC composite and not the HPE or aqueductal-stenosis composites.
- Add the Santo 2012 ACC counselling impression to the ACC composite with priority above standalone severe VM.
- Tighten the HPE composite trigger so absent CSP plus severe VM alone does not misclassify the ACC fixture as HPE.

## HPE severe-VM impression increment

- Add Vitest coverage for TEST.md §4 Case S5: severe VM with absent CSP/CC and microcephaly at 32w0d should fire the HPE composite and suppress ACC.
- Add the Malinger 2013 HPE counselling impression to the HPE composite with the highest current report priority.
- Tighten the ACC composite so the HPE microcephaly pattern is not simultaneously labelled as ACC.

## Mixed-tier asymmetric VM increment

- Add Vitest coverage for TEST.md §4 Case S4: right severe VM with left mild VM should fire severe VM, mild VM, and asymmetric ventricles together.
- Change mild/moderate VM tier matching from max-only logic to side-aware logic so a contralateral lower-tier ventricle is not hidden by the more severe side.
- Preserve existing severe, mild, and asymmetric report-impression priority behavior.

## Vermian-hypoplasia caveat increment

- Add Vitest coverage for TEST.md §6 Case V3: isolated inferior vermian hypoplasia at 26w0d should fire the vermis-small card without small-TCD or small-pons cards.
- Assert the report impression references Limperopoulos 2006's warning that early fetal MRI can over-call inferior vermian hypoplasia.
- Add a deterministic impression line to the vermis-small card below higher-priority combined-pattern impressions.

## Combined cerebellar hypoplasia report increment

- Add Vitest coverage for TEST.md §6 Case V5's combined-pattern requirement: severe vermian hypoplasia with a registry-threshold small TCD should fire both `vermis-small` and `tcd-small`.
- Assert the report flags the combined small-TCD plus small-vermis concern for cerebellar agenesis or pontocerebellar hypoplasia.
- Add a report-level combined-pattern impression override without introducing a formal new DDx card.

## Centile-table fitting increment

- Add Vitest coverage for SPEC §4.2.5: per-week 5th/95th centile rows should fit into the per-percentile linear model family by ordinary least squares.
- Return the fitted model coefficients plus retained residual RMSE values for auditability.
- Reject underdetermined or malformed centile tables rather than silently producing unstable registry entries.

## Mean-SD table fitting increment

- Add Vitest coverage for SPEC §4.2.5: per-week mean/SD rows should fit into the linear-mean/constant-SD model family.
- Return fitted mean-line coefficients, average constant sigma, and retained residual RMSE values.
- Reject underdetermined rows, non-finite values, and non-positive SD inputs.

## Dandy-Walker TVA trigger increment

- Add Vitest coverage for TEST.md §7 Case D1: small vermis, small TCD, small pons, and markedly elevated TVA should fire the Dandy-Walker composite card.
- Change the DWM composite trigger from third-ventricle dilatation to elevated tegmento-vermian angle with small vermis.
- Update DWM card wording to describe the TVA-based posterior-fossa pattern.

## ACC plus Dandy-Walker report increment

- Add Vitest coverage for TEST.md §7 Case D3: ACC and Dandy-Walker composite cards should fire simultaneously.
- Add deterministic Dandy-Walker report wording for DWM-only cases.
- Add report handling so ACC plus DWM enumerates both combined-pattern diagnoses instead of hiding DWM behind the ACC impression priority.

## Mega-cisterna-magna qualitative report increment

- Add Vitest coverage for TEST.md §8 Case BP3: when the qualitative MCM/Blake's pouch panel is toggled with otherwise normal quantitative measurements, no DDx cards should fire.
- Add report handling for the qualitative panel so the IMPRESSION mentions isolated mega cisterna magna with persistent Blake's pouch as a likely benign normal variant.
- Keep the qualitative panel separate from quantitative DDx card firing.

## Isolated small-TCD report increment

- Add Vitest coverage for TEST.md §9 Case CH3: isolated small TCD with preserved vermis and pons at 32w0d should fire `tcd-small` only among posterior-fossa small-structure cards.
- Assert the report impression suggests unilateral cerebellar hypoplasia or cerebellar disruption injury and recommends postnatal MRI for laterality assessment.
- Add deterministic report wording to the `tcd-small` card below higher-priority DWM/PCH/combined-cerebellar impressions.

## Macrocerebellum plus macrocephaly report increment

- Add Vitest coverage for TEST.md §10 Case LC2: macrocerebellum with macrocephaly at 30w0d should fire both `tcd-large` and `macrocephaly`.
- Assert the report impression suggests fetal overgrowth syndromes, including Sotos and Beckwith-Wiedemann syndrome.
- Add a report-level combined-pattern impression for `tcd-large` plus `macrocephaly`, while allowing hydrocephalus-specific impressions to remain higher priority.

## Macrocerebellum plus thick-CC report increment

- Add Vitest coverage for TEST.md §10 Case LC5: macrocerebellum with thick corpus callosum at 30w0d should fire both `tcd-large` and `cc-thick`.
- Assert the report impression flags the combined finding as an overgrowth-syndrome concern.
- Extend the overgrowth combined-pattern report override to include `tcd-large` plus `cc-thick`.

## Short corpus-callosum report increment

- Add Vitest coverage for TEST.md §11 Case A4's partial / hypogenetic corpus-callosum report requirement using a registry-threshold short-CC value with preserved CSP.
- Assert `cc-short` fires without `cc-absent` or `acc-pattern`.
- Add deterministic `cc-short` impression wording recommending postnatal MRI confirmation.

## Isolated small-pons report increment

- Add Vitest coverage for TEST.md §17 Case PCH6: isolated small pons with preserved TCD and vermis at 32w0d should fire `pons-small` without `pch-pattern`.
- Assert the report impression calls this isolated brainstem / pontine hypoplasia rather than classical PCH and recommends considering PMM2-CDG and other isolated brainstem disorders.
- Add report-level isolated-pons wording that is suppressed whenever the PCH composite fires.

## Large pons plus thick-CC report increment

- Add Vitest coverage for TEST.md §18 Case LP6: large pons with thick corpus callosum at 26w0d should fire both `pons-large` and `cc-thick`.
- Assert the report impression flags the pair as a strong overgrowth-syndrome pattern.
- Add a report-level overgrowth combined-pattern impression for `pons-large` plus `cc-thick`.

## Macrocephaly plus thick-CC report increment

- Add Vitest coverage for TEST.md §20 Case MA3 / §13 Case TC2: macrocephaly with thick corpus callosum should fire both `macrocephaly` and `cc-thick`.
- Assert the report impression flags the pair as an overgrowth-syndrome combined pattern.
- Add a report-level overgrowth combined-pattern impression for `macrocephaly` plus `cc-thick`.

## Python extra-axial caveat parity increment

- Add architecture coverage that the Python source registry explicitly carries the Kyriakopoulou 2017 extra-axial CSF approximation caveat.
- Register extra-axial CSF through a Python `REGISTRY_OVERRIDES` row so report source details can disclose the approximation.
- Re-run Python compile, Vitest, typecheck/lint, formatting checks for touched files, and production build before committing.

## Python packaging hardening increment

- Add architecture coverage that `pyproject.toml` explicitly scopes setuptools discovery to `python_app`.
- Include the FastAPI/Jinja templates and local static assets as Python package data so wheel builds preserve the offline worksheet shell.
- Verify `uv build --wheel`, Python runtime import through the built project environment, Vitest, typecheck, formatting, and production build before committing.

## SPEC 7.5 approximation-tier correction increment

- Add source-document consistency coverage that SPEC §7.5 does not describe an active third-ventricle z-score approximation.
- Update the verification-tier prose so the approximation tier names the extra-axial CSF curve and preserves the third-ventricle raw-threshold-only policy.
- Re-run targeted methodology tests, full Vitest, typecheck, formatting for touched docs/tests, and production build before committing.

## SPEC 7.4 Dandy-Walker TVA trigger correction increment

- Add source-document consistency coverage that the SPEC combined-pattern manifest uses small vermis plus elevated TVA for the Dandy-Walker pattern.
- Replace the stale small-vermis plus dilated-third-ventricle trigger text in SPEC §7.4 with the implemented TVA-based trigger.
- Re-run targeted methodology tests, full Vitest, typecheck, formatting for touched docs/tests, and production build before committing.

## Validation metrics utility increment

- Add unit coverage for manuscript-grade validation metrics: Brier score, ROC-AUC, PR-AUC, locked-threshold sensitivity/specificity, calibration summary, and decision-curve net benefit.
- Implement a deterministic validation metrics helper for analyst handoff, with explicit rejection of one-class or out-of-range prediction inputs.
- Link the helper from the publication handoff checklist and rerun full tests, typecheck, formatting, and production build before committing.

## Reader-study protocol handoff increment

- Add coverage that a reader-study protocol artifact exists with IRB / QI determination, waiver-of-consent, de-identification, two-week washout, NASA-TLX, SUS, and report-completeness fields.
- Create the protocol as a radiologist handoff packet and link it from the publication checklist.
- Update the verification dossier to show the implementation side is prepared while local IRB / QI approval remains clinician-owned.

## FeTA agreement metrics utility increment

- Add unit coverage for per-parameter agreement metrics: MAE, MAPE, bias, and Bland-Altman 95% limits of agreement.
- Add grouped agreement summaries so FeTA results can be stratified by site, vendor, field strength, SVR method, and image-quality tier.
- Update handoff and dossier notes to point analysts at the agreement helper while preserving FeTA access/results as open.

## Source-data final-lock checklist increment

- Add coverage that a source-data final-lock checklist exists for Dovjak, Woitek, extra-axial CSF, third-ventricle raw-threshold policy, and Chiari calibration signoff.
- Create the checklist as a clinician-facing review packet with mismatch handling and signoff fields.
- Link the checklist from the publication handoff packet and source-verification dossier while keeping clinician signoff open.

## Isolated third-ventricle report increment

- Add Vitest coverage for TEST.md §21 Case TV2: isolated third-ventricle dilatation at 30w0d should fire `third-v-wide` without ventriculomegaly or aqueductal-stenosis cards.
- Assert the report impression suggests isolated third-ventricle prominence, early aqueductal stenosis or measurement-technique error, and short-interval follow-up.
- Add report-level isolated `third-v-wide` wording that is suppressed by hydrocephalus / aqueductal-stenosis patterns.

## Aqueductal-stenosis absent-CSP negative-control increment

- Add Vitest coverage for TEST.md §22 Case AS-P3: severe VM plus third-ventricle dilatation with absent CSP should not fire `hydrocephalus-pattern`.
- Preserve `severe-vm`, `absent-csp`, and `third-v-wide` firing for the fixture.
- Update the hydrocephalus composite matcher so an explicitly absent CSP suppresses aqueductal-stenosis classification.

## Isolated absent-CSP report increment

- Add Vitest coverage for TEST.md §14 Case CSP-A3: absent CSP with preserved corpus callosum should fire `absent-csp` without ACC or HPE composites.
- Assert the report impression recommends evaluation for septo-optic dysplasia, corpus callosum abnormality, and mild HPE-spectrum findings.
- Add deterministic `absent-csp` impression wording below ACC/HPE composite priorities.

## Isolated enlarged-CSP report increment

- Add Vitest coverage for TEST.md §15 Case CSP-E1: isolated enlarged CSP at 32w0d should fire `enlarged-csp` without other DDx cards.
- Assert the report impression describes the finding as usually benign while noting cavum vergae / velum interpositum cyst and associated-anomaly correlation.
- Add deterministic `enlarged-csp` impression wording for isolated watch-level cases.

## CMV qualitative microcephaly report increment

- Add Vitest coverage for TEST.md §19 Case MC5's qualitative CMV report requirement using registry-consistent microcephaly plus mild VM measurements.
- Assert the quantitative cards remain `microcephaly` plus `mild-vm` while a manual qualitative CMV panel drives the CMV impression.
- Add report-level `qualitative_cmv_panel` handling without introducing a quantitative CMV DDx card.

## Growth-restriction microcephaly report increment

- Add Vitest coverage for TEST.md §19 Case MC6's growth-restriction-context report requirement using registry-consistent microcephaly measurements.
- Assert `microcephaly` fires while a manual growth-restriction context value drives the IUGR-associated impression.
- Add report-level growth-restriction context handling without introducing a quantitative IUGR DDx card.

## Direct extra-axial CSF report increment

- Add Vitest coverage for TEST.md §25 Case EA1: direct extra-axial CSF measurement at 32w0d should fire the widened extra-axial-space card.
- Add an `extra_axial_csf` worksheet parameter with Kyriakopoulou 2017 provenance and an explicitly approximate GA-adjusted reference curve.
- Update the existing widened extra-axial-space card to prefer the direct measurement and keep the skull/brain BPD proxy as a fallback.
- Add deterministic external-hydrocephalus / benign macrocrania report wording for the isolated direct-measurement pattern.

## Brain-volume-loss extra-axial report increment

- Add Vitest coverage for TEST.md §25 Case EA2 using registry-consistent microcephaly, mild ventriculomegaly, and widened extra-axial CSF values.
- Assert `microcephaly`, `mild-vm`, and `extra-axial-wide` fire together without requiring a manual qualitative CMV panel.
- Add a report-level combined-pattern impression suggesting congenital CMV or another intrauterine destructive insult.
- Keep the existing qualitative-CMV and growth-restriction context impressions available for their more specific manually entered contexts.

## IUGR extra-axial report increment

- Add Vitest coverage for TEST.md §25 Case EA4 using registry-consistent microcephaly plus widened extra-axial CSF values at 28w0d.
- Assert `microcephaly` and `extra-axial-wide` fire without the mild-VM brain-volume-loss pattern.
- Add a report-level impression that references IUGR-associated extra-axial-space prominence.
- Preserve the manual growth-restriction context impression as the higher-specificity wording when that context is entered.

## Extreme-z percentile formatting increment

- Add Vitest coverage for TEST.md §27 Case STRESS4 using an exact z = +5 macrocephaly value from the active source registry.
- Assert the macrocephaly card fires and the structured report renders a percentile above 99.9 rather than collapsing to `>99th`.
- Update percentile formatting to expose sub-0.1st and above-99.9th saturation buckets.
- Keep the existing rounded ordinal formatting for ordinary 1st–99th percentile values.

## Moderate ventriculomegaly report increment

- Add Vitest coverage for TEST.md §3 Case M4: bilateral 13.5 mm atria should fire the moderate ventriculomegaly card without severe VM or ventricular asymmetry.
- Assert the structured report names the 12–14.9 mm moderate VM sub-band and recommends follow-up imaging for progression.
- Add deterministic moderate-VM impression wording with priority above isolated mild VM and below severe VM.

## Near-severe ventriculomegaly boundary increment

- Add Vitest coverage for TEST.md §3 Case M2: bilateral 14.5 mm atria should fire moderate VM without severe VM.
- Assert the report explicitly says the atrial dimensions are approaching the severe threshold at 15 mm.
- Add dynamic moderate-VM impression wording for high-end moderate values while preserving the generic M4 moderate wording.

## Pure ventricular asymmetry report increment

- Add Vitest coverage for TEST.md §5 Case AS1: atrial side-to-side difference > 2 mm should fire `asym-vent` without VM cards.
- Assert the structured report does not label a fired DDx-card case as having no abnormal biometric findings.
- Update report abnormality detection so fixed-threshold DDx cards count as abnormal even when all measured z-scores are within ±2.

## Unilateral severe-VM asymmetry report increment

- Add Vitest coverage for TEST.md §5 Case AS6: unilateral severe VM with normal contralateral atrium should fire `severe-vm` plus `asym-vent`.
- Assert the report suggests unilateral haemorrhage or encephaloclastic insult rather than isolated bilateral severe VM.
- Add a report-level asymmetric severe-VM impression suppressed by aqueductal-stenosis, ACC, and HPE combined patterns.

## Vermian-hypoplasia DWM boundary increment

- Add Vitest coverage for TEST.md §6 Case V2 boundary behavior using small vermis, borderline TVA, and registry-normal TCD/pons values.
- Assert `vermis-small` fires while `dwm-pattern`, `tcd-small`, and `pons-small` remain absent.
- Tighten the Dandy-Walker matcher so borderline TVA requires additional small TCD and small pons support, while markedly elevated TVA remains sufficient.

## Vermian-AP hypoplasia trigger increment

- Add Vitest coverage for the TEST.md §6 small-vermis rule using a normal vermis CC value and an AP-only low vermis measurement.
- Assert `vermis-small` fires without unrelated posterior-fossa cards when the AP axis is below the fifth percentile.
- Update the small-vermis matcher and linked parameter metadata so either entered vermis axis can support the card.

## Vermian-AP DWM trigger increment

- Add Vitest coverage for TEST.md §7 Dandy-Walker spectrum behavior with normal vermis CC, AP-only vermis hypoplasia, and markedly elevated TVA.
- Assert `dwm-pattern` fires alongside `vermis-small` without requiring small TCD or pons when TVA is markedly elevated.
- Update the Dandy-Walker matcher to use the same lowest entered vermis-axis logic as the small-vermis card.

## Isolated DWM With Preserved Pons Increment

- Add Vitest coverage for TEST.md §7 Case D5 using small vermis, TVA 80 degrees, small TCD, and registry-normal pons.
- Assert `dwm-pattern` fires with `vermis-small` and `tcd-small` while `pons-small` remains absent.
- Relax the moderate-TVA DWM support rule so TVA in the 60-89 degree range can be supported by either small TCD or small pons, while lower borderline TVA still requires both.

## Hemispheric-Asymmetry Z-Delta Increment

- Add Vitest coverage for TEST.md §24 boundary behavior using brain-OFD left/right values separated by 1.6 SD.
- Assert `brain-asym` does not fire below the specified >2 SD discordance threshold even when the raw percent difference exceeds 5%.
- Update the hemispheric-asymmetry card title, summary trigger, and matcher to use left/right consensus z-score delta.

## Large-TCD 95th-Percentile Threshold Increment

- Add Vitest coverage for TEST.md §10 macrocerebellum behavior using a registry-derived TCD value between +1.645 and +2 SD.
- Assert `tcd-large` fires at the 95th-percentile threshold while unrelated overgrowth combination cards remain absent.
- Lower the large-TCD matcher and card wording from +2 SD to the TEST.md §10 +1.645 SD threshold.

## Thick-CC 95th-Percentile Threshold Increment

- Add Vitest coverage for TEST.md §13 thick corpus callosum behavior using a registry-derived CC value between +1.645 and +2 SD.
- Assert `cc-thick` fires at the 95th-percentile threshold without unrelated macrocephaly or large-pons cards.
- Lower the thick-CC matcher and card wording from +2 SD to the TEST.md §13 +1.645 SD threshold.

## Large-Pons 95th-Percentile Threshold Increment

- Add Vitest coverage for TEST.md §18 large pons behavior using a registry-derived pons AP value between +1.645 and +2 SD.
- Assert `pons-large` fires at the 95th-percentile threshold without unrelated macrocephaly or thick-CC cards.
- Lower the large-pons matcher and card wording from +2 SD to the TEST.md §18 +1.645 SD threshold.

## Macrocephaly 97th-Percentile Threshold Increment

- Add Vitest coverage for TEST.md §20 macrocephaly behavior using a registry-derived skull BPD value between the 97th percentile and +2 SD.
- Assert `macrocephaly` fires at the 97th-percentile threshold while unrelated overgrowth cards remain absent.
- Lower the macrocephaly matcher and card wording from +2 SD / 97.5th percentile to the TEST.md §20 97th-percentile threshold.

## Microcephaly 3rd-Percentile Threshold Increment

- Add Vitest coverage for TEST.md §19 microcephaly behavior using a registry-derived skull BPD value between -2 SD and the 3rd percentile.
- Assert `microcephaly` fires at the 3rd-percentile threshold while unrelated ventriculomegaly and posterior-fossa cards remain absent.
- Raise the microcephaly matcher and card wording from -2 SD / 2.5th percentile to the TEST.md §19 3rd-percentile threshold.

## Early Aqueductal-Stenosis Pattern Increment

- Add Vitest coverage for TEST.md §22 Case AS-P2 using bilateral 14 mm atria, third ventricle 5.5 mm, preserved CSP, and normal skull size.
- Assert `hydrocephalus-pattern` fires with moderate VM and `third-v-wide` even when `severe-vm` and `macrocephaly` are absent.
- Add early-evolving triventricular-hydrocephalus impression wording for non-severe VM so the severe-hydrocephalus sentence remains reserved for severe cases.

## HPE 3rd-Percentile Microcephaly Increment

- Add Vitest coverage for an HPE-pattern boundary case with absent CSP, severe VM, preserved CC, and skull BPD between -2 SD and the 3rd percentile.
- Assert `microcephaly` and `hpe-pattern` both fire at the shared TEST.md §19/§16 microcephaly threshold.
- Align the HPE composite and ACC-vs-HPE suppression threshold with the 3rd-percentile microcephaly cutoff.

## PCH Vermis-Support Increment

- Add Vitest coverage for TEST.md §17 wording that small pons combined with vermian reduction can trigger `pch-pattern` even when TCD is preserved.
- Use registry-derived pons and vermis values below the fifth percentile with a normal TCD to isolate the vermis-support path.
- Update the PCH composite matcher and trigger label to accept small pons plus either small TCD or the lowest entered small vermis axis.

## BP6 TVA-60 Dandy-Walker Increment

- Add Vitest coverage for TEST.md §8 Case BP6: small vermis plus TVA 60 degrees should fire `dwm-pattern` even with preserved TCD and pons.
- Keep the existing lower-borderline TVA negative control intact so TVA values below 60 degrees still require additional posterior-fossa support.
- Relax only the Dandy-Walker moderate-TVA support rule at 60 degrees and above.

## HPE Qualitative-Toggle Increment

- Add Vitest coverage for TEST.md §16 Case HPE3 behavior: mild-range VM plus absent CSP and microcephaly should not fire `hpe-pattern` unless qualitative HPE findings are entered.
- Introduce a `qualitative_hpe_panel` matcher path, mirroring the existing qualitative CMV/MCM test values.
- Keep the existing severe-VM quantitative HPE path and 3rd-percentile microcephaly threshold intact.

## HA1 Hemispheric-Disruption Report Increment

- Add Vitest coverage for TEST.md §24 Case HA1 using right brain-OFD reduction with right-sided ventricular enlargement and marked ventricular asymmetry.
- Assert `brain-asym`, `asym-vent`, and a VM card fire together and the report suggests unilateral encephaloclastic insult or porencephaly.
- Add a report-level combined-pattern impression that outranks generic asymmetric ventriculomegaly wording when cerebral hemispheric asymmetry is present.

## HPE Plus DWM Report Increment

- Add Vitest coverage for a TEST.md §16/§27 simultaneous HPE and Dandy-Walker case using registry-derived microcephaly and vermian hypoplasia values.
- Assert `hpe-pattern` and `dwm-pattern` both fire and the report impression mentions both combined patterns.
- Add an HPE+DWM report override parallel to the existing ACC+DWM combined-pattern wording.

## LP2 Pons-Macrocephaly Overgrowth Report Increment

- Add Vitest coverage for TEST.md §18 Case LP2 using registry-derived large pons and macrocephaly values.
- Assert `pons-large` and `macrocephaly` fire together without hydrocephalus.
- Add a report-level overgrowth impression for large pons plus macrocephaly, keeping hydrocephalus-driven macrocephaly suppressed.

## LP4 Pons-Macrocerebellum Overgrowth Report Increment

- Add Vitest coverage for TEST.md §18 Case LP4 using registry-derived large pons and large TCD values.
- Assert `pons-large` and `tcd-large` fire together without macrocephaly or thick CC.
- Add a report-level overgrowth impression for large pons plus macrocerebellum.

## STRESS1 Consensus-Zero Mu Increment

- Add Vitest coverage for TEST.md §27 Case STRESS1 by filling every reportable parameter with `mu(parameter, 28w)`.
- Assert no DDx cards fire and every resulting consensus z-score is within 0.05 SD of zero, including multi-source posterior-fossa rows.
- Update the exported multi-source `mu`/`sigma` helpers so generated fixtures invert the runtime consensus-z calculation.

## SPEC 4.7 RES Qualitative Trigger Increment

- Add Vitest coverage for SPEC.md §4.7 rhombencephalosynapsis detection using small TCD plus an entered absent-primary-fissure qualitative flag.
- Assert the qualitative flag is required: small TCD alone still does not fire the RES composite card.
- Add a minimal `res-pattern` differential card that shares the TCD smallness logic and links the qualitative primary-fissure finding in its trigger label.

## SPEC 4.7 Cisterna-Magna Depth Increment

- Add Vitest coverage for SPEC.md §4.7 numeric cisterna magna depth: >10 mm should trigger the mega cisterna magna / Blake's pouch differential.
- Assert the threshold is strict so exactly 10 mm remains negative.
- Add a minimal `mega-cisterna-magna` card with deterministic benign-variant report wording.

## SPEC 4.7 Posterior-Fossa Auxiliary Inputs Increment

- Add Vitest coverage that the UI-facing auxiliary measurement registry includes `cisterna_magna_depth` in millimetres and `tva` in degrees.
- Keep these auxiliary inputs separate from the z-scored `PARAMETERS_ALL` registry so stress fixtures and source-consensus reporting remain unchanged.
- Render the auxiliary rows in the posterior-fossa worksheet section using raw-value input rows that can feed existing threshold-based DDx logic.

## SPEC 4.7 Colpocephaly Comparison Increment

- Add Vitest coverage for the SPEC.md §4.7 anterior/posterior ventricle comparison: atrial diameter >10 mm plus a normal same-side frontal horn should fire a colpocephaly card.
- Add negative controls so atrial diameter alone and atrial diameter with an enlarged frontal horn do not fire the colpocephaly card.
- Add raw frontal-horn auxiliary inputs and a minimal colpocephaly differential card without changing existing ACC or ventriculomegaly thresholds.

## TEST 8 Blake's-Pouch Advisory Toggle Increment

- Add Vitest coverage for TEST.md §8 Blake's pouch guidance: elevated TVA with normal vermis should stay negative without the qualitative advisory toggle.
- Assert `qualitative_blakes_pouch_panel` fires a low-severity Blake's pouch differential card while preserving the existing no-DWM behavior.
- Add deterministic report wording for the advisory card without turning TVA alone into a quantitative trigger.

## TEST 27 STRESS5 DWM Fallback Increment

- Add Vitest coverage for TEST.md §27 Case STRESS5, asserting the multi-card severe-malformation fixture includes `dwm-pattern` alongside HPE and PCH.
- Keep the fallback narrower than generic PCH by requiring small vermis, small TCD, small pons, and third-ventricle dilation when TVA is unavailable.
- Align the approximate direct extra-axial CSF curve so the TEST.md §27 STRESS5 5.5 mm value at 26 weeks fires `extra-axial-wide`.
- Preserve existing TVA-based Dandy-Walker paths and the PCH-only fixtures without third-ventricle support.

## SPEC 4.9 No-Analytics Shell Increment

- Add Vitest coverage that the client HTML shell contains no analytics, Umami, or `data-website-id` telemetry hooks.
- Remove the placeholder analytics script from `client/index.html` to satisfy SPEC.md §4.9 no-transmission requirements.
- Verify the build no longer emits the analytics-placeholder warnings while preserving the existing application entrypoint.

## SPEC 4.9 Offline Font Shell Increment

- Extend the client-shell privacy test to reject external `http(s)` font links and preconnect hints in `client/index.html`.
- Remove Google Fonts requests from the HTML shell so the app does not contact third-party font servers.
- Replace named web-font CSS variables with system serif, sans, and monospace stacks to preserve the layout without network font loading.

## TEST 11 Heterotopia Qualitative Add-On Increment

- Add Vitest coverage for TEST.md §11 Case A2 behavior: complete ACC stays on the existing quantitative cards without a heterotopia toggle.
- Assert `qualitative_heterotopia_panel` adds a low-severity heterotopia / cortical-malformation advisory card.
- Keep the advisory independent of ACC thresholds so it only reflects the radiologist-entered qualitative finding.

## TEST 11 Interhemispheric-Cyst Qualitative Add-On Increment

- Add Vitest coverage for TEST.md §11 Case A5 behavior: ACC with severe VM stays on quantitative cards without an interhemispheric-cyst toggle.
- Assert `qualitative_interhemispheric_cyst_panel` adds a low-severity interhemispheric-cyst advisory card.
- Keep the advisory qualitative-only so it does not change ACC, ventriculomegaly, or hydrocephalus matching.

## TEST 15 Cavum-Vergae Qualitative Label Increment

- Add Vitest coverage for TEST.md §15 Case CSP-E3 behavior: enlarged CSP fires its quantitative card without a cavum-vergae label.
- Assert `qualitative_cavum_vergae_panel` adds a low-severity cavum-vergae advisory label when the radiologist enters the finding.
- Keep the advisory qualitative-only so it does not change the CSP enlargement threshold or ventriculomegaly matching.

## TEST 14 SOD Qualitative Manual-Entry Increment

- Add Vitest coverage for TEST.md §14 Case CSP-A3 behavior: isolated absent CSP keeps the existing absent-CSP impression without a SOD manual entry.
- Assert `qualitative_sod_panel` adds a low-priority septo-optic dysplasia advisory when small optic apparatus is entered.
- Keep the advisory below the absent-CSP impression so it does not become a new quantitative combined-pattern trigger.

## TEST 19 CMV Qualitative Add-On Increment

- Add Vitest coverage for TEST.md §19 Case MC5 behavior: microcephaly with mild VM keeps the quantitative cards without a CMV qualitative entry.
- Assert `qualitative_cmv_panel` adds a congenital-CMV advisory card while preserving the existing CMV impression override.
- Keep the advisory qualitative-only so it does not alter microcephaly, ventriculomegaly, or brain-volume-loss matching.

## Qualitative Finding UI Controls Increment

- Add Vitest coverage for a UI-facing qualitative/context finding registry containing every manual-entry flag consumed by the engine and report generator.
- Render those binary findings as checkbox rows in the worksheet sections next to the existing z-scored and auxiliary inputs.
- Include growth-restriction context in the same registry so report-only context can be entered from the UI instead of hidden test fixtures.

## SPEC 4.9 Stateless Browser-Storage Hardening Increment

- Extend client-shell privacy coverage to scan client source for browser persistence APIs such as `localStorage`, `sessionStorage`, IndexedDB, and cookie writes.
- Remove theme and sidebar persistence hooks so refreshes do not retain client-side state through browser storage.
- Keep runtime-only React state for UI preferences and preserve the existing no-analytics/no-external-font shell checks.

## SPEC 4.9 No External Script Loader Increment

- Extend client-shell privacy coverage to reject dynamic external script loaders and Google Maps/proxy integration hooks in client source.
- Remove the unused Google Maps component that injects a remote script through the Forge proxy.
- Preserve citation URLs and static report source links while blocking executable third-party script loading.

## SPEC 4.8 Auxiliary Report Inclusion Increment

- Add Vitest coverage proving entered auxiliary measurements appear in the structured report as raw-threshold inputs.
- Render auxiliary findings after z-scored biometric groups without assigning z-scores or source-agreement states.
- Keep differential matching unchanged so TVA, cisterna magna depth, and frontal-horn values continue to feed existing cards.

## SPEC 4.8 Qualitative Report Inclusion Increment

- Add Vitest coverage proving entered qualitative/context findings appear in the structured report body.
- Render manual qualitative findings after numeric findings without z-scores, percentiles, or source-agreement wording.
- Keep qualitative DDx and impression matching unchanged so this increment only improves report traceability.

## SPEC 7.5 Report Source-Caveat Disclosure Increment

- Add Vitest coverage proving third-ventricle report source details disclose the approximation tier and cross-modality caveat.
- Render verification tier and verification date in per-source report detail for every measured row.
- Append source caveat text only when the registry entry carries one, preserving existing consensus and DDx behavior.

## SPEC 4.9 Unused HTTP Dependency Removal Increment

- Add client-shell coverage proving the production package does not declare a generic HTTP client dependency.
- Remove the unused Axios dependency so the stateless client surface has no bundled HTTP helper library.
- Keep source-level network API checks unchanged; this increment tightens package-level privacy posture.

## SPEC 7.5 Row Source-Caveat UI Disclosure Increment

- Add coverage proving the parameter-row source breakdown consumes verification tier, verification date, and source caveat fields.
- Render source verification tier/date beside the existing per-source z, percentile, range, and cross-modality tags.
- Render registry caveat text only inside the expanded source breakdown so routine rows stay compact.

## SPEC 4.11 Deterministic Report Dependency Increment

- Add client-shell coverage proving the package does not declare an unused streaming/Markdown response renderer dependency.
- Remove the unused Streamdown dependency so report output remains tied to deterministic string interpolation.
- Preserve existing report generation behavior; this increment only tightens the package surface.

## SPEC 4.9 Google Maps Package Removal Increment

- Add client-shell coverage proving the package does not declare Google Maps integration or type packages.
- Remove the unused `@types/google.maps` dependency left after deleting the Google Maps component.
- Preserve citation links while keeping executable and typed Maps integration surfaces out of the project.

## SPEC 4.9 Stateless Toaster Theme Increment

- Add client-shell coverage proving the package does not declare `next-themes` or import it from client source.
- Switch the toast component to the app's stateless local `ThemeContext`.
- Remove the `next-themes` dependency so theme state cannot reintroduce browser persistence through an unused provider package.

## SPEC 4.8/4.9 Raw HTML Surface Removal Increment

- Add client-shell coverage rejecting raw HTML injection surfaces in non-test client source.
- Remove the unused chart component that relied on `dangerouslySetInnerHTML` for generated style injection.
- Remove the unused Recharts dependency so the plain-text report shell has no unused rich-chart surface.

## SPEC 4.8 Plain-Text Clipboard Export Increment

- Add focused coverage for the PowerScribe copy path using a clipboard abstraction that only accepts plain text.
- Preserve report line breaks exactly when writing to the clipboard.
- Wire the existing Copy to Clipboard button through the tested helper without changing report generation.

## SPEC 4.4 Workflow Button Label Increment

- Add source-level UI coverage for the SPEC-required `Copy to Clipboard` and `Clear All` workflow labels.
- Update the top-bar copy button label from `Copy report` to `Copy to Clipboard`.
- Update the worksheet reset button label from `Clear` to `Clear All` without changing behavior.

## SPEC 4.4/4.8 Report Copy Placement Increment

- Add source-level UI coverage proving the report-panel copy control appears below the report preview.
- Change the report-panel copy label from `Copy` to the SPEC-required `Copy to Clipboard`.
- Move the existing report-panel copy action below the structured report preview without changing clipboard behavior.

## SPEC 4.4 Report Text Box Increment

- Add source-level UI coverage proving the structured report preview is a read-only text box bound to the live report.
- Replace the report preview `<pre>` with a read-only `<textarea>` so radiologists can select plain report text directly.
- Keep the existing `Copy to Clipboard` action below the preview and preserve report-generation behavior.

## SPEC 4.8 Technique Consensus Sentence Increment

- Add report coverage proving the Technique section begins with the fixed multi-source consensus sentence.
- Preserve the existing reconciliation-rule and Delta z disagreement-threshold wording in that first Technique sentence.
- Move the imaging-acquisition and motion sentence after the fixed consensus sentence without changing measured-parameter output.

## SPEC 4.10 Registry Failure Parameter Logging Increment

- Add source-registry acceptance coverage requiring failed candidates to log the offending parameter.
- Extend registry validation failures with the parameter id and display name alongside GA, Delta, candidate source, and existing source.
- Preserve accepted-candidate behavior and the existing half-week overlap sampling rule.

## SPEC 4.6 Source-Disagreement Link Increment

- Add UI coverage proving differential source-disagreement badges link to the row-level source breakdown.
- Give each measured parameter's source breakdown a stable `source-breakdown-{parameterId}` anchor target.
- Render differential source-disagreement badges as links to those anchors without changing card ranking or trigger logic.

## SPEC 4.2 Disagree Source Auto-Expansion Increment

- Add row-level UI coverage proving source breakdowns open by default when the agreement state is `disagree`.
- Bind the parameter-row source breakdown `open` state to the computed disagreement state.
- Preserve collapsed source breakdowns for non-disagree rows and keep the existing source-disagreement anchors.

## SPEC 4.2 Reference-Cohort Surface Removal Increment

- Add source-surface coverage rejecting alternate reference-set selection code such as `luis-only`.
- Remove legacy reference-set exports and the unused reference-set resolver from the biometry engine.
- Keep the Luis coefficients used as source-registry entries for multi-source consensus reconciliation.

## SPEC 4.4 N-Sources Affordance Label Increment

- Add row-level UI coverage proving the clickable source-breakdown summary includes the dynamic source count.
- Change the source breakdown summary from generic `Source breakdown` text to an `N source(s) breakdown` affordance.
- Preserve the existing source-breakdown anchor and disagreement default-open behavior.

## SPEC 4.10 QI Protocol Methodology Increment

- Add Methodology-page coverage for the SPEC-required pre/intervention/post QI deployment tracking protocol.
- Surface the 100 historical-report baseline audit, intervention deployment, and 100 new-report post-audit endpoints.
- Name the required baseline metrics: time to report, measurement completeness, and explicit z-score/percentile documentation.

## SPEC 6.3 FeTA Validation Endpoint Increment

- Add Validation-page coverage for the four SPEC §6.3 FeTA 2024 manuscript endpoints.
- Surface per-parameter agreement, multi-site/multi-vendor/multi-field-strength robustness, pathology-versus-neurotypical comparison, and ROC-AUC.
- Keep the text documentation-only; no scoring-engine behavior changes are required for this increment.

## SPEC 6.4 Institutional Validation Cohort Increment

- Add Validation-page coverage for the SPEC §6.4 institutional cohort composition and study roles.
- Surface the 60-case target with 20 neurotypical, 20 mild-or-moderate pathology, and 20 severe pathology scans.
- Document the cohort roles: expert ground truth, per-condition labels, with-tool-versus-without-tool reader study, and inter-rater reliability.

## SPEC 6.6 Validation Dataset Cross-Reference Increment

- Add Validation-page coverage for the SPEC §6.6 datasets considered and rejected.
- Surface the dHCP fetal release caveat: no expert-measured biometry and no case-level pathology labels.
- Surface the Luis 2025 cohort caveat: it is a registry reference distribution and cannot be used for circular validation.

## SPEC 6.7 Validation Timeline Increment

- Add Validation-page coverage for the SPEC §6.7 validation timeline.
- Surface the FeTA access and analysis timing: Synapse Data Access Request, Data Transfer Agreement, two-to-four-week access, and three-to-four-week analysis.
- Surface the institutional timeline: four-to-six-week IRB submission, six-to-twelve-week reader study, and six-to-nine-month manuscript path.

## SPEC 6.1 Validation Philosophy Increment

- Add Validation-page coverage for the SPEC §6.1 validation philosophy.
- Surface the measurement-layer versus interpretation-layer distinction and the Phase 1 interpretation-only scope.
- Document that validation requires both internal and external cohorts, with expert ground-truth measurements anchoring interpretation-layer agreement.

## SPEC 6.2 FeTA Cohort Composition Increment

- Add Validation-page coverage for the SPEC §6.2 FeTA 2024 external cohort composition.
- Surface the 300 super-resolution T2 volumes across five named sites, three field strengths, and four vendor classes.
- Document the neurotypical/pathological split and named pathology categories used for external validation.

## SPEC 6.2 FeTA Measurement Coverage Increment

- Add Validation-page coverage for the SPEC §6.2 FeTA ground-truth, derivable, and unavailable measurement groups.
- Surface the five direct expert-measured FeTA biometric values and the four additional values derivable from segmentation masks.
- Document the remaining parameters requiring the institutional cohort plus the 120-case training and 180-case test-set access split.

## SPEC 7.4 Mild-VM Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 mild-ventriculomegaly likelihood manifest.
- Keep the transcribed Pagani 2014 neurodevelopmental-delay statistic visible in the rationale and report impression.
- Replace estimate-only mild-VM likelihood labels with qualitative wording rather than unsupported numeric percentages.

## SPEC 7.4 Moderate-VM Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 moderate-ventriculomegaly likelihood manifest.
- Confirm the moderate-VM card no longer surfaces estimate-only numeric percentages.
- Replace the associated-anomaly, chromosomal, isolated, and CMV likelihood labels with qualitative wording.

## SPEC 7.4 Severe-VM Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 severe-ventriculomegaly likelihood manifest.
- Replace estimate-only severe-VM numeric likelihood labels with qualitative wording.
- Correct the aqueductal-stenosis rationale attribution from the placeholder Garel 2018 wording to the canonical Heaphy-Henault 2018 fetal-MRI source.

## SPEC 7.4 Absent-CSP Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 absent-CSP likelihood manifest.
- Keep the SMFM absent-CSP/ACC rationale visible while avoiding numeric likelihood labels for estimate rows.
- Replace the holoprosencephaly, ACC, hydrocephalus, SOD, and isolated likelihood labels with qualitative wording.

## SPEC 7.4 Enlarged-CSP Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 wide/enlarged-CSP likelihood manifest.
- Confirm the enlarged-CSP card no longer surfaces estimate-only numeric percentages.
- Replace the normal-variant, cavum-vergae, cavum-velum-interpositum, associated-anomaly, and obstructive-hydrocephalus labels with qualitative wording.

## SPEC 7.4 Complete-ACC Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 complete-ACC likelihood manifest.
- Preserve the transcribed Santo 2012 isolated complete-ACC likelihood label and rationale.
- Replace approximate or estimate-only monogenic and chromosomal likelihood labels with qualitative wording.

## SPEC 7.4 Partial-ACC Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 partial/hypogenesis corpus-callosum likelihood manifest.
- Confirm the partial-ACC card no longer surfaces estimate-only numeric percentages.
- Replace the isolated, monogenic, and chromosomal/CNV likelihood labels with qualitative wording.

## SPEC 7.4 Small-Pons Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 small-pons likelihood manifest.
- Preserve the van Dijk 2018 PCH Type 2 rationale while avoiding a precise estimate label.
- Replace the PCH subtype, CASK, and tubulinopathy likelihood labels with qualitative wording.

## SPEC 7.4 Small-Vermis Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 small-vermis likelihood manifest.
- Confirm the small-vermis card no longer surfaces estimate-only numeric percentages.
- Replace the Dandy-Walker, isolated hypoplasia, Joubert, and chromosomal/syndromic likelihood labels with qualitative wording.

## SPEC 7.4 Third-Ventricle Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 wide-third-ventricle likelihood manifest.
- Confirm the third-ventricle card no longer surfaces estimate-only numeric percentages.
- Replace the aqueductal-stenosis, ACC/dysgenesis, HPE, and cyst likelihood labels with qualitative wording.

## SPEC 7.4 Microcephaly Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 microcephaly likelihood manifest.
- Confirm the microcephaly card no longer surfaces estimate-only numeric percentages.
- Replace the genetic, infection, malformation, chromosomal, and constitutional likelihood labels with qualitative wording.

## SPEC 7.4 Macrocephaly Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 macrocephaly likelihood manifest.
- Confirm the macrocephaly card no longer surfaces estimate-only numeric percentages.
- Replace the hydrocephalus, benign familial macrocephaly, megalencephaly, and tumor/cyst likelihood labels with qualitative wording.

## SPEC 7.4 Hydrocephalus-Pattern Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 hydrocephalus combined-pattern likelihood manifest.
- Confirm the hydrocephalus-pattern card no longer surfaces estimate-only numeric percentages.
- Replace the aqueductal-stenosis, L1CAM, and posterior-fossa/Chiari II likelihood labels with qualitative wording.

## SPEC 7.4 HPE-Pattern Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 HPE combined-pattern likelihood manifest.
- Confirm the HPE-pattern card no longer surfaces estimate-only numeric percentages.
- Replace the alobar/semilobar, lobar, and septo-optic-dysplasia likelihood labels with qualitative wording.

## SPEC 7.4 ACC-Pattern Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 ACC combined-pattern likelihood manifest.
- Confirm the ACC-pattern card no longer surfaces estimate-only numeric percentages.
- Replace the complete-ACC, partial-ACC, and associated-syndrome likelihood labels with qualitative wording.

## SPEC 7.4 DWM-Pattern Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 Dandy-Walker combined-pattern likelihood manifest.
- Confirm the DWM-pattern card no longer surfaces estimate-only numeric percentages.
- Replace the Dandy-Walker, vermian-hypoplasia, and Blake's-pouch-remnant likelihood labels with qualitative wording.

## SPEC 7.4 PCH-Pattern Likelihood Qualitative Increment

- Add DDx coverage for the SPEC §7.4 pontocerebellar-hypoplasia combined-pattern likelihood manifest.
- Confirm the PCH-pattern card no longer surfaces estimate-only numeric percentages.
- Replace the PCH2, PCH1, other-PCH/CASK/tubulinopathy, and acquired-CMV likelihood labels with qualitative wording.

## Hemispheric-Asymmetry Likelihood Qualitative Increment

- Add DDx coverage for the TEST.md §24 hemispheric-asymmetry likelihood labels.
- Confirm the brain-asym card no longer surfaces unsupported numeric percentages.
- Replace the hemimegalencephaly, cortical-malformation, porencephaly, and vascular-malformation likelihood labels with qualitative wording.

## SPEC 7.5 Source Verification Dossier Increment

- Add regression coverage that the SPEC §7.5 verification dossier exists.
- Cross-list the Dovjak, Woitek, third-ventricle, Section 7.4 citation-pass, and Chiari calibration action items.
- Track each action item with an explicit status so unresolved clinician-collaborator work is visible.

## SPEC 4.8 Clinical Integration Workflow Increment

- Add Methodology-page coverage for the Epic Radiant launch path and SMART-on-FHIR deferral.
- Surface the PowerScribe paste workflow and plain-text clipboard constraint from SPEC §4.8.
- Keep the implementation as documentation of Phase 1 integration rather than introducing PHI-bearing EHR code.

## SPEC 4.11.1 Clinical-Indication Report Increment

- Add report coverage for the SPEC §4.11.1 clinical-indication behavior.
- Leave Clinical Indication blank for manual entry when no EHR context is supplied.
- Allow an optional EHR/context indication string to populate the Clinical Indication section.

## SPEC 4.11.4 Citation-Grounded Impression Increment

- Add report coverage for citation-grounding on generated Impression differential lines.
- Include each fired DDx card's primary source inline in the plain-text report.
- Include secondary source attribution when a fired DDx card has one.

## SPEC 4.11 GenAI/RAG Guardrail Scaffold Increment

- Add regression coverage for the SPEC §4.11.2 RAG prompt constraint and knowledge-bank scope.
- Add coverage for the SPEC §4.11.3 agentic PubMed search query shape, top-3 retrieval limit, and transparency flag.
- Add metadata coverage for the SPEC §4.11.5 local and free-tier backend recommendations without introducing network calls.

## SPEC 4.11.4 Post-Generation Verification Increment

- Add GenAI guardrail coverage for cross-checking generated report text against original numeric inputs.
- Fail verification when a generated report omits the exact expected measurement anchor.
- Return the safe deterministic-template fallback whenever verification fails.

## SPEC 4.11 GenAI/RAG Methodology Exposure Increment

- Add Methodology-page coverage for the optional GenAI/RAG module and strict no-external-claims prompt.
- Surface the Bio.Entrez top-3 PubMed fallback, temporary abstract context, and PMID transparency requirement.
- Surface the safe deterministic fallback and local/free-tier backend recommendations without enabling network calls.

## SPEC 4.8 Source-Agreement Note Ordering Increment

- Add report coverage for a disagreeing measurement rendered alongside auxiliary inputs.
- Confirm SOURCE-AGREEMENT NOTES appears immediately after FINDINGS, before auxiliary or qualitative sections.
- Keep auxiliary and qualitative sections intact after source-agreement notes.

## SPEC 4.11.2 RAG Prompt Payload Increment

- Add GenAI coverage that prompt payloads include the strict RAG system prompt.
- Inject exact numerical inputs, z-scores, and percentiles into the prompt payload.
- Inject retrieved evidence chunks with source labels so generated impressions stay literature-grounded.

## SPEC 4.3 Python/FastAPI Architecture Scaffold Increment

- Add architecture coverage for the SPEC §4.3 Python/FastAPI/Jinja deployment surface.
- Require local HTMX and Tailwind assets so the scaffold remains offline-capable.
- Declare the required numpy/scipy math dependencies and standalone packaging dependency.

## SPEC 4.3 Python Biometry Core Scaffold Increment

- Add architecture coverage that the Python scaffold exposes the three SPEC §4.2.1 model families.
- Require numpy-backed polynomial evaluation and scipy.stats.norm percentile conversion.
- Add a minimal Python z-score helper that can be expanded toward the full TypeScript consensus engine.

## SPEC 4.3 Standalone Docker Packaging Increment

- Add architecture coverage for the SPEC §4.3 lightweight Docker deployment option.
- Package the Python FastAPI scaffold from `pyproject.toml`.
- Run the offline FastAPI app with uvicorn on a local workstation/container port.

## SPEC 4.3 Python Build Metadata Increment

- Add packaging coverage that the Docker `pip install .` path has PEP 517 build-system metadata.
- Declare the setuptools build backend in `pyproject.toml`.
- Keep the deployment artifact aligned with the FastAPI scaffold.

## SPEC 4.3 Python Centile-Table Fit Scaffold Increment

- Add architecture coverage for the offline `scipy.optimize.curve_fit` registry-build path.
- Provide Python helpers that fit per-week 5th/95th centile tables into the supported per-percentile linear family.
- Provide a companion helper for per-week mean/SD tables using the linear-mean constant-SD family.

## SPEC 4.2.5 Python Fit Residual Audit Increment

- Add architecture coverage that Python registry-build fits retain residual RMSE.
- Add an optional max-RMSE guard matching the inter-rater-variability threshold requirement.
- Return fit result records that keep both the fitted model and audit residuals.

## SPEC 4.11.3 Python Bio.Entrez Fallback Scaffold Increment

- Add architecture coverage for the optional Python Bio.Entrez agentic-search backend hook.
- Declare Biopython as an optional GenAI dependency without enabling network calls in the client.
- Add a Python plan module that builds the PubMed query shape, top-3 abstract limit, and PMID transparency metadata.

## SPEC 4.4 Python Jinja Worksheet Shell Increment

- Add architecture coverage that the FastAPI/Jinja first screen is a worksheet shell rather than scaffold copy.
- Render GA week/day controls, imaging context, parameter inputs, and a structured-report preview from Jinja.
- Add a lightweight HTMX `/calculate` endpoint hook for report-preview updates without storing PHI.

## SPEC 4.3 Local HTMX Adapter Increment

- Add architecture coverage that the bundled HTMX asset is not a placeholder.
- Implement the local `hx-post`/`hx-target` form-update behavior used by the Python worksheet.
- Preserve the offline/no-external-script deployment posture.

## SPEC 4.3 Local Tailwind Stylesheet Increment

- Add architecture coverage that the bundled Tailwind stylesheet is not a placeholder.
- Provide local CSS for the FastAPI/Jinja worksheet shell layout, controls, and report preview.
- Preserve the offline/no-CDN styling posture.

## SPEC 4.2 Python Source Registry Increment

- Add architecture coverage for a Python source registry covering every z-scored worksheet parameter.
- Port the model coefficients and multi-source overrides needed for consensus evaluation.
- Use the Python registry in the FastAPI report-preview endpoint to emit consensus z-score, percentile, agreement, and source labels.

## SPEC 4.8 Python Source Detail Report Increment

- Add architecture coverage that the Python report endpoint propagates per-source z values.
- Add SOURCE-AGREEMENT NOTES for Python rows whose registry sources disagree.
- Keep the report preview plain text for PowerScribe paste compatibility.

## SPEC 4.6 Python Core DDx Bridge Increment

- Add architecture coverage for Python endpoint differential-consideration output.
- Implement deterministic threshold triggers for the core ventriculomegaly, CSP, third-ventricle, size-summary, posterior-fossa, and pons patterns.
- Use the Python DDx rows to make the report impression more specific when a core trigger fires.

## SPEC 6.5 Python Chiari II Discriminator Increment

- Add architecture coverage for the Python Mahalanobis ONTD posterior helper.
- Implement the TDPF/CSA Chiari II trigger using consensus z-scores and posterior > 0.5.
- Flag the Python report output as research-mode when the Chiari II / ONTD discriminator fires.

## SPEC 4.8 Python Source Detail Completeness Increment

- Add architecture coverage that Python report source details include z, percentile, mean, sigma, validated GA range, and extrapolated state.
- Carry source registry metadata into each Python per-source detail row.
- Expand the Python report source-detail formatter without changing consensus math.

## SPEC 4.9 Public Telemetry Removal Increment

- Add privacy-shell coverage that public assets and Vite config do not ship Manus telemetry collectors or storage proxies.
- Remove the copied debug collector asset from `client/public`.
- Strip Manus/Builder dev plugins and proxy middleware from the Vite config and package manifest.

## Production Label Cleanup Increment

- Add coverage that user-facing source and package metadata no longer label the calculator as a prototype or scaffold.
- Replace report, methodology, and home-screen prototype language with release-neutral wording.
- Update Python package/docstring metadata to describe implemented modules.

## SPEC 4.7 Python Colpocephaly Auxiliary Increment

- Add architecture coverage that the Python worksheet includes frontal horn inputs for colpocephaly comparison.
- Add left/right frontal horn raw inputs to the Python ventricular-system group.
- Emit a Python differential row when atrial dilation is disproportionate to a normal same-side frontal horn.

## SPEC 4.7 Python Posterior-Fossa Auxiliary Trigger Increment

- Add architecture coverage for Python cisterna magna and TVA auxiliary trigger output.
- Emit a Python mega-cisterna-magna / Blake's-pouch differential when cisterna magna depth exceeds 10 mm.
- Emit a Python Blake's-pouch advisory when TVA is elevated without a small-vermis Dandy-Walker pattern.

## SPEC 4.6 Python Residual DDx Trigger Increment

- Add architecture coverage for Python residual z-score and composite DDx trigger names.
- Add Python atrial asymmetry, corpus-callosum, large posterior-fossa, extra-axial, and hemispheric-asymmetry rows.
- Add Python hydrocephalus, ACC, HPE, and PCH composite pattern rows from already-computed measurements.

## SPEC 7.5 Third-Ventricle Raw-Threshold Policy Increment

- Add tests that third-ventricle width is an auxiliary raw-threshold input rather than an approximate z-scored source row.
- Remove the Birnbaum approximation from React and Python source registries while preserving the >3.5 mm DDx trigger.
- Update Methodology, Validation, and the verification dossier to document the conservative raw-threshold policy.

## Publication-Readiness Literature Audit Increment

- Add tests that the Validation page names the current reporting standards and endpoint families expected by reviewers.
- Add tests that source documents no longer describe third-ventricle width as an active Birnbaum z-scored registry row.
- Update the Validation page and verification dossier with the online literature audit: TRIPOD+AI, CLAIM, DECIDE-AI, FeTA 2024, decision-curve utility, reader-study, IRB, and source-verification blockers.
- Align SPEC.md, TEST.md, and the home footer with the raw-threshold third-ventricle policy.

## Publication Handoff Checklist Increment

- Add a test that a manuscript handoff checklist maps reviewer standards to concrete manuscript sections, endpoints, owners, and evidence.
- Create a concise publication_handoff_checklist.md for the radiologist handoff packet.
- Link the source-verification dossier's reporting-map blocker to the checklist and mark the implementation side prepared for PI review.

## TEST.md Verified-Citation Lock Increment

- Add source-document coverage that `TEST.md` has no pending citation placeholders.
- Replace the unresolved HPE4 Cureus placeholder with a PubMed/PMC/DOI-traceable Cureus source while removing the unsupported verbatim claim.
- Replace the unresolved mega-cisterna reference with verified fetal MRI/US biometry literature and correct the app citation metadata away from the wrong Cureus journal label.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## SPEC 7.4 Qualitative-Likelihood Source-Document Alignment Increment

- Add source-document coverage that the SPEC no longer asks for an already-closed Section 7.4 citation pass.
- Update the SPEC §7.4 manifest introduction to state the implemented qualitative policy for estimate-only likelihood rows.
- Replace stale Dandy-Walker citation-correction language with source-definition guidance and keep numeric estimates out of report-output claims.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST.md Citation-Line Index Cleanup Increment

- Add source-document coverage that `**Citation.**` lines do not carry stale numeric reference brackets.
- Remove bracketed reference indices from citation lines while preserving author/year/DOI/PMID text.
- Leave the end-of-file source inventory untouched to avoid a large bibliography rewrite.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## SPEC 7.5 Woitek Table 3 Source-Correction Increment

- Add source-document coverage for the machine-readable Woitek 2014 PMC Table 3 audit.
- Replace the incorrect SPEC §6.5.2 per-week TDPF/CSA control table with the PMC Table 3 normal-CNS means and standard deviations.
- Keep the existing OLS coefficients because they already match the corrected table, and document the PMC byte-check date/status.
- Update the source-verification dossier, final-lock checklist, and PROGRESS.md with the corrected source audit and remaining clinician-review scope.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## SPEC 7.5 Dovjak Table 1 Source-Verification Increment

- Add source-document coverage for the machine-readable Dovjak 2021 PMC Table 1 audit.
- Byte-check the TCD, vermis RC, vermis AP, and total pons AP 5th/95th percentile equations against PMC8457244 Table 1.
- Update SPEC §7.3.7-§7.3.10 and §7.5 so Dovjak is no longer listed as not byte-checked.
- Update the source-verification dossier, final-lock checklist, and publication handoff checklist with the closed implementation-side Dovjak audit.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## SPEC 7.5 Extra-Axial CSF Exact-Coefficient Increment

- Add coverage that extra-axial CSF uses the Kyriakopoulou 2017 supplementary workbook row 19 coefficients rather than the temporary approximation.
- Replace the React and Python extra-axial CSF model with the exact quadratic mean / linear SD formula from the fetal-centiles workbook.
- Update TEST.md §25 and stress fixtures to use values above the exact Kyriakopoulou 95th-centile line.
- Remove the approximation caveat from source details and update Methodology, Validation, SPEC, and handoff documents.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## SPEC 4.2.2 Extra-Axial Source-Registry Table Alignment Increment

- Add source-document coverage that SPEC §4.2.2 lists the active extra-axial CSF Kyriakopoulou registry row.
- Update the default source-registry table with the direct extra-cerebral CSF row and validated GA window.
- Align the §4.2.2 registry prose with the exact Kyriakopoulou workbook source-lock status.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## SPEC 2.2 Source-Dossier Alignment Increment

- Add source-document coverage that the early normative-source dossier matches the active Phase 1 registry instead of stale initial recommendations.
- Update SPEC §2.1 to mention active auxiliary and added publication-trigger measurements now implemented in Phase 1.
- Rewrite SPEC §2.2 around computational source groups: Luis, Kyriakopoulou, Dovjak, Woitek, and raw-threshold third ventricle.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Aertsen 2019 Citation Metadata Correction Increment

- Add source-document coverage that Aertsen 2019 resolves to the PMC7048594 AJNR article and DOI 10.3174/ajnr.A5930.
- Correct SPEC §7.2 AERTSEN_2019 metadata away from the stale A5921 DOI.
- Correct the TEST.md source inventory entry away from the unrelated UOG citation while preserving the case-level AJNR citation.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## D'Addario 2001 Citation Metadata Correction Increment

- Add source-document coverage that D'Addario 2001 resolves to the clivus-supraocciput article DOI 10.1046/j.1469-0705.2001.00409.x.
- Use Crossref evidence to exclude the unrelated 00472.x article from TEST.md.
- Correct the TEST.md case and source inventory D'Addario citation authors/DOI to match SPEC §7.2.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## SPEC 4.10 QI Audit Metrics Increment

- Add failing coverage for SQUIRE 2.0 and the SPEC §4.10 pre/post report-audit endpoints.
- Implement reusable QI report-audit metrics for mean time, all-required-measurement completion, explicit z-score/percentile documentation, and recommendation congruence.
- Update the publication handoff and validation page so the QI manuscript path is mapped to SQUIRE 2.0 as well as AI/model reporting standards.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Publication Confidence-Interval Metrics Increment

- Add failing coverage that binary validation outputs include Wilson confidence intervals for locked-threshold proportions.
- Implement a reusable Wilson score interval helper and attach 95% intervals to sensitivity, specificity, predictive values, and accuracy.
- Update handoff documentation so analyst exports use confidence intervals rather than point estimates alone.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Sun 2024 ACC Citation Metadata Increment

- Add source-document coverage that Sun 2024 ACC resolves to the PubMed / Crossref DOI `10.1016/j.ejogrb.2024.05.005`.
- Correct SPEC, TEST, and app citation metadata away from the unrelated `10.1016/j.ejogrb.2024.05.022` article.
- Keep the ACC monogenic likelihood qualitative and replace the stale Table 2 action wording with the current estimate-only policy.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Heaphy-Henault 2018 Citation Metadata Increment

- Add source-document coverage that the aqueductal-stenosis source resolves to PubMed PMID `29519789` and DOI `10.3174/ajnr.A5590`.
- Correct SPEC and TEST metadata away from the unrelated PMID `29545253`.
- Remove stale `Garel 2018` / citation-correction wording from the severe-ventriculomegaly likelihood manifest.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Corroenne 2023 Citation Metadata Increment

- Add source-document coverage that Corroenne 2023 resolves to DOI `10.1002/uog.26187` and PubMed PMID `36864530`.
- Correct the SPEC tooltip and source-inventory metadata away from the unrelated DOI `10.1002/uog.26280`, wrong PMID, and wrong PMCID.
- Keep Corroenne as a teaching/cross-validation source, not an active Phase 1 computational registry row.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Ma 2019 Atrial-Diameter Source Metadata Increment

- Add source-document coverage proving `MA_2019` resolves to the Medicine fetal lateral-ventricle MRI article, not the unrelated Wiley ovarian cystadenofibroma article at `10.1002/jum.15003`.
- Correct the SPEC tooltip, source inventory, and atrial-diameter cross-validation row to DOI `10.1097/MD.0000000000016118`, PMID `31261528`, and PMCID `PMC6616102`.
- Preserve Ma 2019 as a teaching/cross-validation source for atrial diameter, not an active computational coefficient source.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Vatansever 2013 Posterior-Fossa Source Metadata Increment

- Add source-document coverage that `VATANSEVER_2013` resolves to the Cerebellum posterior-fossa MRI paper with DOI `10.1007/s12311-013-0470-2` and PMID `23553467`.
- Correct the SPEC source-inventory row and reference metadata away from placeholder `(varies)` values.
- Add the same DOI / PMID lock to the runtime Vatansever source record used on posterior-fossa cards and source details.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Malinger 2005 Absent-CSP Source Metadata Increment

- Add source-document coverage proving `MALINGER_2005` resolves to the Ultrasound in Obstetrics & Gynecology absent-septum-pellucidum article, not the 2009 cerebellar-pitfalls review.
- Correct the SPEC source-inventory row and reference metadata to DOI `10.1002/uog.1787`, PMID `15593321`, and no PMC record.
- Add the same DOI / PMID lock to the runtime Malinger source strings used by absent-CSP / HPE cards.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Kertes 2021 CSP Source Metadata Increment

- Add source-document coverage proving `KERTES_2021` resolves to the European Journal of Radiology CSP MRI article with DOI `10.1016/j.ejrad.2020.109470` and PMID `33338761`.
- Correct the SPEC tooltip, source inventory, and reference metadata away from the ScienceDirect PII-in-DOI-field row and author/title typos.
- Add the same DOI / PMID lock to the runtime Kertes source record used by CSP source details.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Bahlmann 2015 Spina-Bifida Source Metadata Increment

- Add source-document coverage proving `BAHLMANN_2015` resolves to DOI `10.1002/pd.4524` and PubMed PMID `25346419`.
- Correct the SPEC source-inventory row and reference metadata away from wrong PMID `25333768`, which resolves to an unrelated nanoscience article.
- Verify the article has no PMC record and mark the PMCID field explicitly as `(not in PMC)`.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Source Inventory PMCID Absence Label Increment

- Add source-document coverage that the SPEC source inventory no longer uses ambiguous `(NA)` PMCID cells.
- Replace verified no-PMC rows with `(not in PMC)` for Corroenne 2023, SMFM 2018, SMFM 2020 CSP, Sun 2024, and Garel 2003.
- Record the NCBI ID Converter verification for those PMID lookups in PROGRESS.md.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Harreld 2011 Corpus-Callosum Metadata Increment

- Add failing-first source-document coverage that locks `HARRELD_2011` to DOI `10.3174/ajnr.A2310`, PMID `21183616`, and PMCID `PMC8013091`.
- Correct the SPEC source-inventory row away from PMID `21183617` / PMCID `PMC7965598`, which do not identify the Harreld corpus-callosum article.
- Record PubMed, NCBI ID Converter, and Crossref verification in PROGRESS.md.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## NCBI Source-Inventory Identifier Audit Increment

- Add failing-first source-document coverage for the five remaining source-inventory identifier mismatches found by the NCBI ID Converter pass.
- Correct Katorza 2016, Conte 2018, Woitek 2014, Aertsen 2019, and Santo 2012 PMID / PMCID cells to the PubMed/PMC-resolved identifiers.
- Record the NCBI ID Converter, PubMed E-utilities, and Crossref evidence in PROGRESS.md.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## PubMed DOI-Title Source-Inventory Audit Increment

- Add failing-first source-document coverage for DOI/title mismatches that the PMC-only audit cannot catch on non-PMC rows.
- Correct Tilea 2009, D'Addario 2001, SMFM 2020 absent-CSP, and Garel 2003 DOI / PMID cells to the PubMed-resolved articles.
- Record the PubMed ESummary / ESearch and NCBI ID Converter no-PMC evidence in PROGRESS.md.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Reference Numbering Hygiene Increment

- Add failing-first source-document coverage that SPEC references have unique numeric labels and no suffix labels such as `[37b]`.
- Renumber the late FeTA / validation / Chiari references so Sofia remains `[39]`, Adams remains `[40]`, Sanchez/Zalevskyi/FeTA/Aslan become `[41]` through `[45]`, and Woitek/Aertsen/D'Addario/Bahlmann become `[46]` through `[49]`.
- Update in-text citations for FeTA 2024, Aslan 2025, and Chiari II source references to the new labels.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Dovjak GA-Range Consistency Increment

- Add failing-first coverage that every Dovjak 2021 source-registry entry and UI-facing parameter row uses the audited 14.0-39.3 week range.
- Add source-document coverage that TEST.md no longer describes Dovjak as 18-35, 21-36, or 14-40 weeks.
- Normalize SPEC.md, TEST.md, React registry, and Python registry to the same Dovjak 14.0-39.3 week range, grounded in the PMC/PubMed 14+0 to 39+2 source text.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Dovjak Visible Citation Lock Increment

- Add failing-first coverage that the Methodology page no longer displays the stale Dovjak 14-40 week range.
- Add source-document coverage that the SPEC reference list and runtime source string use the PubMed-resolved Dovjak 2021 page range, DOI, PMID, and author order.
- Correct Methodology.tsx, SPEC.md, and the React source citation to match the audited PubMed / PMC metadata.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Aertsen TEST Corpus PMID Increment

- Add failing-first source-document coverage that TEST.md does not contain the stale Aertsen PMID `30606726`.
- Verify PubMed ESearch/ESummary evidence that Aertsen 2019 resolves to PMID `30591508`, while `30606726` is an unrelated AJNR deep-learning MRI article.
- Correct the TEST.md Aertsen reference-list row to DOI `10.3174/ajnr.A5930`, PMID `30591508`, and PMCID `PMC7048594`.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Hertzberg Third-Ventricle Citation Increment

- Add failing-first source-document coverage that the Hertzberg 1997 third-ventricle citation uses DOI/PMID `9169682` and not stale DOI `9169681`.
- Verify PubMed ESummary evidence that PMID `9169682` is Hertzberg 1997, while PMID `9169681` is an unrelated congenital diaphragmatic hernia MRI paper.
- Correct TEST.md and SPEC.md Hertzberg citation text to Radiology 1997;203(3):641-644 with DOI `10.1148/radiology.203.3.9169682`.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## SPIRIT-AI Prospective-Protocol Handoff Increment

- Add failing-first source-document coverage that the publication handoff packet names SPIRIT-AI separately from CONSORT-AI.
- Verify PubMed ESummary evidence for SPIRIT-AI protocol guidance and CONSORT-AI trial-report guidance.
- Update the handoff checklist and verification dossier so prospective protocol publication requirements are visible before a future intervention study.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Inter-Rater Reliability Metrics Increment

- Add failing-first validation-metrics coverage for Cohen's kappa on categorical reader labels and ICC(2,1) absolute-agreement reliability on repeated continuous measurements.
- Implement deterministic reliability helpers with input validation for empty, incomplete, or non-variable rating sets.
- Update the publication handoff docs so the radiologist reader-study packet points analysts at the new kappa / ICC helpers.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Fleiss Kappa Multi-Reader Metrics Increment

- Add failing-first validation-metrics coverage for Fleiss's kappa on three-or-more-reader categorical label matrices.
- Implement a deterministic Fleiss's kappa helper with per-subject agreement and category-prevalence outputs.
- Update the reader-study and handoff docs so the two-reader path uses Cohen's kappa while the multi-reader path uses Fleiss's kappa.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Reader-Study Crossover Metrics Increment

- Add failing-first validation-metrics coverage for paired within-reader / within-case with-tool versus without-tool deltas.
- Implement a reader-study crossover summary helper that rejects duplicate or incomplete condition pairs.
- Update the publication handoff docs so the reader-study analysis plan explicitly uses paired deltas rather than independent pre/post summaries.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Reader-Study Delta Confidence Interval Increment

- Add failing-first validation-metrics coverage that paired reader-study crossover summaries include confidence intervals for timing, completeness, and z-score-documentation deltas.
- Implement t-based mean-difference confidence intervals for paired numeric reader-study endpoints.
- Update handoff docs so exported reader-study tables include paired delta estimates with confidence intervals.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Reader-Study Usability Scoring Increment

- Add failing-first validation-metrics coverage for raw NASA Task Load Index and System Usability Scale scoring.
- Implement deterministic scoring helpers with input validation for six NASA TLX subscales and ten SUS Likert items.
- Update handoff docs so the reader-study packet points analysts at reusable usability-score helpers rather than spreadsheet-only formulas.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## FeTA Pathology-Neurotypical Comparison Increment

- Add failing-first validation-metrics coverage for the SPEC §6.3 pathology-versus-neurotypical z-score distribution comparison.
- Implement a Welch two-sample mean-difference helper with degrees of freedom, confidence interval, and significance-by-CI output.
- Update handoff docs so FeTA pathology-vs-neurotypical analysis points to the reusable helper.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Validation Analysis Lock Handoff Increment

- Add failing-first source-document coverage that a validation analysis lock template exists for threshold, cohort, endpoint, and code-version freeze.
- Create a concise `validation_analysis_lock.md` artifact for radiologist/analyst pre-analysis signoff.
- Link the publication handoff checklist and source-verification dossier to the analysis-lock artifact.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Source Verification Dossier Date Lock Increment

- Add failing-first source-document coverage that the source verification dossier's visible update date matches the current validation-analysis-lock handoff.
- Keep the dossier linked to `validation_analysis_lock.md` so radiologists see the threshold/cohort/endpoint/code freeze artifact from the blocker table.
- Update `source_verification_dossier.md` metadata without changing the open external blockers.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Validation Precision Planning Increment

- Add failing-first validation-metrics coverage for diagnostic-accuracy sample-size planning by Wilson confidence-interval half-width.
- Add failing-first validation-metrics coverage for paired reader-study mean-difference sample-size planning.
- Update the publication handoff, source verification dossier, and analysis lock so TRIPOD+AI / STARD-AI / CLAIM sample-size and precision expectations are visible before data collection.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Cohort Flow Missingness Increment

- Add failing-first validation-metrics coverage for a cohort-flow and missingness summary required by TRIPOD+AI / STARD-AI style reporting.
- Implement a reusable validation cohort-flow helper that counts included/excluded cases, exclusion reasons, available reference standards, available predictions, available pathology labels, complete-case denominators, and per-parameter missingness.
- Update the handoff artifacts so final manuscript preparation cannot skip exclusion-reason and missing-data accounting.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## ROC-AUC Confidence Interval Increment

- Add failing-first validation-metrics coverage that binary validation summaries expose a ROC-AUC confidence interval, not only a point estimate.
- Implement a deterministic Hanley-McNeil large-sample ROC-AUC interval using the same confidence level as the locked-threshold proportion intervals.
- Update the publication handoff docs so AUC uncertainty is listed with discrimination and calibration results.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Source Dossier ROC-AUC Interval Consistency Increment

- Add failing-first source-document coverage that the source verification dossier names the ROC-AUC confidence interval after the metric-layer update.
- Update the calibration and clinical-utility blocker wording without changing its open status or external-data dependencies.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Corpus Deterministic DDx Language Increment

- Add failing-first source-document coverage that TEST.md no longer uses permissive "may or may not fire" DDx language.
- Rewrite the ambiguous Dandy-Walker, aqueductal-stenosis, Chiari II post-op, and hemispheric-asymmetry fixture notes as deterministic expected behavior.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Filler Registry-Mean Consistency Increment

- Add failing-first source-document coverage that the canonical TEST.md filler table matches the active source-registry consensus mean for every z-scored filler parameter.
- Correct the filler prose and table so rounded values are near z = 0 and the third-ventricle raw-threshold placeholder is not described as a z-scored cohort mean.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Hemispheric Fixture Calibration Increment

- Add failing-first source-document coverage that parses the TEST.md hemispheric-asymmetry fixtures and verifies their documented OFD bands and asymmetry fire/no-fire expectations against the runtime engine.
- Correct the stale Brain OFD values in HA1-HA6 and CH6 so the TEST corpus no longer labels high-z measurements as normal or <5th.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Normal-Control Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md normal controls N1-N6 and evaluates them with the runtime engine.
- Recalibrate the normal-control tables to active registry-mean values so they truly emit no DDx cards and all z-scored rows remain near z = 0 after rounding.
- Update the normal-control source note so arithmetic controls are not presented as independent external-validation cases.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Mild-VM Fixture Filler Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases M1-M6 and verifies normal filler rows are near runtime z = 0 while the intended mild-VM/asymmetry cards fire.
- Recalibrate the non-VM filler rows in M1-M6 to active registry-mean values without changing the clinically abnormal atrial measurements.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Corpus Residual Numeric Audit Blocker Increment

- Add failing-first source-document coverage that the source verification dossier surfaces the residual TEST.md normal-label numeric audit count.
- Document the remaining section-by-section TEST corpus recalibration blocker after fixing the canonical filler, normal-control, hemispheric, and mild-VM fixtures.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Severe-VM Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases S1-S6 and verifies normal, low, and high z-scored rows against runtime thresholds.
- Recalibrate the severe-VM, ACC, HPE, and Chiari-II fixture rows so documented abnormal bands and expected DDx cards are executable.
- Update the residual TEST corpus numeric audit blocker count after the severe-VM section is reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Asymmetric-Ventricle Threshold Wording Increment

- Add failing-first source-document coverage that AS1-AS2 atrial edge cases are documented as below-threshold clinical controls rather than z-normal filler rows.
- Update TEST.md wording for the sub-10 mm atrial rows so the residual numeric audit no longer misclassifies intentional clinical-threshold cases as stale normal fillers.
- Update the residual TEST corpus numeric audit blocker count.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Vermian-Hypoplasia Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases V1-V6 and verifies expected vermis, TCD, pons, and VM cards against the runtime engine.
- Correct V1-V6 rows so source-specific notes, normal filler rows, and negative controls match active registry z-scores without accidental extra posterior-fossa cards.
- Update the residual TEST corpus numeric audit blocker count.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Dandy-Walker / Blake's Pouch Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases D1-D6 and BP1-BP6 and verifies posterior-fossa bands, auxiliary TVA/third-ventricle inputs, and expected DDx cards against the runtime engine.
- Recalibrate stale normal posterior-fossa rows so Dandy-Walker positives and Blake's pouch negative controls match active registry thresholds without accidental small-pons/vermis/TCD cards.
- Update the residual TEST corpus numeric audit blocker count after the Dandy-Walker / Blake's pouch section is reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Cerebellar-Hypoplasia Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases CH1-CH6 and verifies small-TCD, preserved-vermis, VM, and hemispheric-asymmetry behavior against the runtime engine.
- Recalibrate stale vermis AP and TCD rows so isolated cerebellar hypoplasia cases do not accidentally fire vermian-hypoplasia cards and intended small-TCD cases cross the active threshold.
- Update the residual TEST corpus numeric audit blocker count after the cerebellar-hypoplasia section is reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Macrocerebellum Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases LC1-LC6 and verifies large-TCD, macrocephaly, thick-CC, enlarged-CSP, and negative-control behavior against the runtime engine.
- Recalibrate stale large-TCD, macrocephaly, and thick-CC rows so threshold-derived z-score comments and expected DDx cards match active runtime thresholds.
- Update the residual TEST corpus numeric audit blocker count after the macrocerebellum section is reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST ACC Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases A1-A6 and verifies absent-CSP, absent/short-CC, VM severity, ACC-pattern, and associated DWM behavior against the runtime engine.
- Recalibrate stale partial-CC and filler rows so A4 fires `cc-short` rather than complete ACC and A5 normal OFD fillers sit inside the active registry band.
- Update the residual TEST corpus numeric audit blocker count after the ACC section is reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Short-CC Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases CC1-CC6 and verifies short-CC, complete-ACC exclusion, VM, absent-CSP, and ACC-pattern behavior against the runtime engine.
- Recalibrate stale CC and CSP rows so dysgenetic/short-CC fixtures remain above the complete-ACC threshold while preserved-CSP controls stay inside the active registry band.
- Update the residual TEST corpus numeric audit blocker count after the short-CC section is reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Thick-CC Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases TC1-TC6 and verifies thick-CC, macrocephaly, large-pons, large-TCD, and negative-control behavior against the runtime engine.
- Recalibrate stale high-CC, macrocephaly, pons, and TCD rows so threshold-derived +2 SD comments and the TC3 negative control match active runtime thresholds.
- Update the residual TEST corpus numeric audit blocker count after the thick-CC section is reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Absent-CSP Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases CSP-A1-CSP-A4 and CSP-A6 and verifies isolated absent-CSP, VM, ACC, HPE, short-CC, and thick-CC behavior against the runtime engine.
- Recalibrate stale normal-CC rows in absent-CSP fixtures so negative controls do not accidentally fire CC-thick, CC-short, or ACC-pattern cards.
- Update the residual TEST corpus numeric audit blocker count after the absent-CSP section is reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST HPE Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases HPE1-HPE6 and verifies HPE-pattern, microcephaly, VM, absent-CSP/CC, posterior-fossa, and negative-control behavior against the runtime engine.
- Recalibrate stale HPE rows so normal posterior-fossa and CC fillers stay normal, microcephaly rows actually cross the runtime threshold, monoventricle rows are executable, and HPE+DWM/PCH overlap is deterministic.
- Update the residual TEST corpus numeric audit blocker count after the HPE section is reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Large-Pons Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases LP1-LP6 and verifies large-pons, macrocephaly, large-TCD, thick-CC, and negative-control behavior against the runtime engine.
- Recalibrate stale large-pons, macrocephaly, TCD, and CC rows so threshold-derived +2 SD comments and the LP3 negative control match active runtime thresholds.
- Update the residual TEST corpus numeric audit blocker count after the large-pons section is reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Third-Ventricle/Aqueductal-Stenosis Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases TV1, AS-P2, AS-P4, and AS-P5 and verifies third-ventricle, ventriculomegaly, macrocephaly, and hydrocephalus-pattern behavior against the runtime engine.
- Recalibrate stale preserved-CSP and skull-BPD rows so documented normal bands match active runtime thresholds while raw third-ventricle threshold behavior remains auxiliary.
- Update the residual TEST corpus numeric audit blocker count after the third-ventricle/aqueductal-stenosis rows are reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Negative-Control Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases NEG1-NEG5 and verifies partial-pattern negative controls against the runtime engine.
- Recalibrate stale skull-BPD, CSP, CC, TCD, vermis, brain-BPD, and CC rows so the documented standalone cards fire without accidentally triggering excluded combined patterns.
- Update the residual TEST corpus numeric audit blocker count after the negative-control rows are reconciled.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## TEST Endcap Fixture Runtime Consistency Increment

- Add failing-first source-document coverage that parses TEST.md cases CII4, EA1, STRESS3, and STRESS6 and verifies the final residual normal-label rows plus expected card/source-agreement behavior.
- Recalibrate the remaining Chiari-II, extra-axial, high-GA stress, and TCD-disagreement values so documented bands and no-card controls match the active runtime engine.
- Update the TEST corpus numeric audit blocker when the residual normal-label audit reaches zero.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Active Goal Completion Audit Increment

- Add failing-first source-document coverage requiring a completion audit artifact that maps the active goal's deliverables to concrete evidence.
- Create `completion_audit.md` with a prompt-to-artifact checklist covering SPEC.md, TEST.md, PLAN.md, PROGRESS.md, validation/handoff docs, core gates, and publication-readiness blockers.
- Link the audit from the publication handoff checklist so radiologists can see which requirements are implementation-complete versus externally blocked.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Validation Data Dictionary Handoff Increment

- Add failing-first source-document coverage requiring a validation data dictionary with concrete CSV/export schemas for external validation, institutional validation, reader study, and report audit.
- Create `validation_data_dictionary.md` with de-identified case, measurement, diagnostic-label, reader-study, and report-audit column definitions mapped to validation-metrics helpers.
- Link the data dictionary from the publication handoff checklist, source-verification dossier, and completion audit so external blockers have concrete data-collection instructions.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Validation Data Schema Guard Increment

- Add failing-first Vitest coverage for runtime validation-data schema constants that match `validation_data_dictionary.md`.
- Implement `client/src/lib/validation-data-schema.ts` with required/conditional/optional columns for the five handoff CSV files and a required-field validator.
- Update the data dictionary to point analysts at the schema guard before running validation metrics.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Validation Data Conditional Guard Increment

- Add failing-first coverage for conditional export validation: excluded cases need an exclusion reason, unavailable measurements need a missing reason, available measurements need a value, indeterminate labels need a reason, and reader/report phase values must be locked.
- Extend `validateValidationDataRows` with conditional checks, allowed values, and finite numeric validation for high-risk analysis fields.
- Update `validation_data_dictionary.md` so analysts know the guard checks conditional fields, allowed values, and numeric fields before analysis.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Validation Data Cross-File Guard Increment

- Add failing-first coverage for a package-level validation export guard that checks `study_id` consistency across exported files.
- Implement `validateValidationDataExport` so measurement, diagnostic-label, and reader-study rows cannot reference absent `case_log.csv` rows.
- Add reader-study pair validation so every reader/case pair includes both `without_tool` and `with_tool` rows before paired deltas are computed.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Validation CSV Template Handoff Increment

- Add failing-first coverage requiring checked CSV header templates for each validation export file.
- Expand the System Usability Scale schema shorthand into explicit `sus_item_1` through `sus_item_10` columns.
- Add `validation_export_templates/*.csv` header templates generated from the runtime schema order and link them from the data dictionary.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Reader-Study Protocol Schema Alignment Increment

- Add failing-first coverage that compares `reader_study_protocol.md` against the runtime `reader_study_rows.csv` schema.
- Replace stale aggregate fields in the protocol with the checked export columns used by `validation_data_dictionary.md` and `validation_export_templates/reader_study_rows.csv`.
- Record the alignment as a publication-readiness mitigation so radiologist handoff cannot collect incompatible reader-study CSVs.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## DECIDE-AI Citation Evidence Increment

- Add failing-first source-document coverage requiring PubMed/DOI evidence for DECIDE-AI in the publication handoff packet.
- Add the PubMed-verified DECIDE-AI reporting guideline citation to `publication_handoff_checklist.md` and `source_verification_dossier.md`.
- Keep the current retrospective/QI scope clear while documenting when DECIDE-AI applies to early-stage clinical decision-support evaluation.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Validation Numeric Range Guard Increment

- Add failing-first coverage for impossible validation export values such as GA day 8, probability >1, NASA TLX >100, and SUS items outside 1-5.
- Extend validation-data column schemas with minimum and maximum bounds for high-risk numeric fields.
- Implement generic range validation so malformed exports fail before metrics, calibration, or reader-study scoring runs.
- Update the data dictionary and audit/progress trail, then run targeted/full gates before committing.

## Validation Boolean Token Guard Increment

- Add failing-first coverage so validation export fields documented as booleans reject tokens such as `yes`, `no`, or `unknown`.
- Align reader-study `recommendation_congruent` with the documented blank-if-not-applicable contract.
- Add boolean allowed-value metadata to case-log, measurement, diagnostic-label, reader-study, and report-audit schemas.
- Update the data dictionary and audit/progress trail, then run targeted/full gates before committing.

## Reader-Study Usability Completeness Guard Increment

- Add failing-first coverage for partial NASA Task Load Index and System Usability Scale exports.
- Require all six NASA TLX subscales whenever any NASA TLX field is present in a reader-study row.
- Require all ten SUS item responses whenever any SUS item field is present in a reader-study row.
- Update the data dictionary and audit/progress trail, then run targeted/full gates before committing.

## Reader-Study Duplicate Pair Guard Increment

- Add failing-first coverage for duplicate `reader_study_rows.csv` rows with the same reader, case, and condition.
- Extend export validation from "both conditions are present" to "exactly one `without_tool` and exactly one `with_tool` row per reader/case pair".
- Keep the data dictionary aligned with the paired-analysis requirement.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Measurement Value Exclusivity Guard Increment

- Add failing-first coverage for measurement rows that provide both `value_mm` and `value_deg`, or provide a numeric value while `measurement_available=false`.
- Tighten `measurement_rows.csv` validation so available measurements have exactly one value column.
- Reject unavailable measurements that still carry value columns, preserving missingness semantics.
- Update the data dictionary and audit/progress trail, then run targeted/full gates before committing.

## Report-Audit Count Consistency Guard Increment

- Add failing-first coverage for report-audit rows with zero required measurements or documented measurements exceeding required measurements.
- Align `report_audit_rows.csv` preflight validation with the QI audit metric invariants.
- Document count consistency in the validation data dictionary.
- Run targeted/full tests, typecheck, formatting checks, and build before committing.

## Validation Integer Field Guard Increment

- Add failing-first coverage for fractional values in fields documented as integer weeks, days, read order, and report-audit counts.
- Extend validation-data column schemas with integer metadata for high-risk count and order fields.
- Reject fractional values before cohort flow, reader-study ordering, or QI report-audit metrics run.
- Update the data dictionary and audit/progress trail, then run targeted/full gates before committing.

## Validation Categorical Enum Guard Increment

- Add failing-first coverage for invalid values in dictionary-defined categorical fields such as `cohort`, `svr_method`, and `source_role`.
- Add allowed-value metadata for validation cohorts, SVR methods, and measurement source roles.
- Preserve locally variable fields such as scanner vendor and image-quality tier as free text where the dictionary allows local categories.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Measurement Parameter ID Guard Increment

- Add failing-first coverage for unknown `measurement_rows.csv` `parameter_id` values.
- Validate measurement export parameter IDs against the runtime `PARAMETERS_ALL` registry.
- Document that the data dictionary's parameter IDs are runtime IDs, not free text.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Diagnostic Trigger ID Guard Increment

- Add failing-first coverage for unknown `diagnostic_labels.csv` `trigger_id` values.
- Expose runtime differential card IDs from the DDx engine and validate diagnostic-label exports against that list.
- Document that diagnostic trigger IDs must match runtime card IDs rather than free-text labels.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Report-Audit Study ID Link Guard Increment

- Add failing-first coverage for `report_audit_rows.csv` rows that cannot be linked to `case_log.csv`.
- Require `study_id` in the report-audit export schema and header template while keeping `report_id` as the report-level key.
- Extend package-level validation so report-audit rows participate in the same cross-file case-reference guard as measurement, diagnostic-label, and reader-study rows.
- Update the data dictionary, audit/progress trail, and full verification gate before committing.

## Reader-Study Washout Guard Increment

- Add failing-first coverage for `reader_study_rows.csv` rows with `washout_days` below the locked two-week washout.
- Tighten the validation export schema so paired reader-study rows require at least 14 washout days before analysis.
- Update the data dictionary and reader-study protocol wording from a target to a runtime-enforced minimum.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Validation Positive Duration Guard Increment

- Add failing-first coverage for zero-second reader-study and report-audit durations.
- Extend validation column metadata with an exclusive lower-bound guard for fields that must be positive.
- Apply the positive-duration guard to reader-study and report-audit `duration_sec` before timing endpoints are analyzed.
- Update the data dictionary, audit/progress trail, and full verification gate before committing.

## Case-Log Exclusion Reason Consistency Guard Increment

- Add failing-first coverage for included `case_log.csv` rows that still carry an `exclusion_reason`.
- Align validation export preflight with the cohort-flow metrics invariant that included cases must not carry exclusion reasons.
- Update the data dictionary so analysts know exclusion reasons are reserved for excluded cases.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Reader-Study Completeness Score Guard Increment

- Add failing-first coverage for negative `reader_study_rows.csv` `completeness_score` values.
- Align validation export preflight with the reader-study metrics invariant that completeness scores must be non-negative.
- Update the data dictionary so the locked report-completeness rubric is documented as non-negative.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Reader-Study SUS Integer Guard Increment

- Add failing-first coverage for fractional System Usability Scale item responses in `reader_study_rows.csv`.
- Mark `sus_item_1` through `sus_item_10` as integer validation fields so Likert responses stay scoreable.
- Update the data dictionary to document SUS responses as integer 1-5 items.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Case-Log Field Strength Positivity Guard Increment

- Add failing-first coverage for `case_log.csv` rows with zero Tesla field strength.
- Apply the existing exclusive lower-bound validation metadata to `field_strength_t`.
- Update the data dictionary so scanner field strength is documented as a positive Tesla value.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Case-Log Gestational Age Range Guard Increment

- Add failing-first coverage for `case_log.csv` `ga_weeks` values outside the calculator-supported 18-40 week range.
- Align validation export preflight with the SPEC/UI gestational-age bounds and TEST stress cases.
- Update the data dictionary so analysts know case logs must stay within the supported GA range.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Measurement Unit Column Guard Increment

- Add failing-first coverage for `measurement_rows.csv` rows that put millimetre parameters in `value_deg` or degree parameters in `value_mm`.
- Use runtime `PARAMETERS_ALL` unit metadata to validate the populated value column for each `parameter_id`.
- Update the data dictionary so analysts know the value column must match the runtime parameter unit.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Measurement Reader ID Consistency Guard Increment

- Add failing-first coverage for `measurement_rows.csv` rows with `source_role=reader` but no `reader_id`, and non-reader rows that carry a `reader_id`.
- Align validation export preflight with the data dictionary's repeated-reader measurement contract.
- Update the data dictionary so reader IDs are explicitly tied to `source_role=reader`.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Case-Log Duplicate Study ID Guard Increment

- Add failing-first coverage for duplicate `case_log.csv` `study_id` rows before cross-file validation.
- Extend package-level validation so de-identified case IDs remain unique before cohort-flow and join-based metrics run.
- Update the data dictionary so `study_id` is documented as a unique case key.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Diagnostic Label Duplicate Guard Increment

- Add failing-first coverage for duplicate `diagnostic_labels.csv` rows with the same `study_id` and `trigger_id`.
- Extend package-level validation so each case/trigger label contributes at most one row before diagnostic accuracy, calibration, or decision-curve metrics run.
- Update the data dictionary so diagnostic labels are documented as unique per case and runtime trigger.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Report-Audit Duplicate Report ID Guard Increment

- Add failing-first coverage for duplicate `report_audit_rows.csv` `report_id` rows.
- Extend package-level validation so each audited report contributes at most one row before QI pre/post metrics run.
- Update the data dictionary so `report_id` is documented as a unique report key.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Measurement Duplicate Row Guard Increment

- Add failing-first coverage for duplicate `measurement_rows.csv` rows at the documented case/parameter/source-role/reader grain.
- Extend package-level validation so measurement agreement, grouped robustness, and ICC inputs cannot double-count the same measurement source.
- Update the data dictionary so the measurement row grain is explicitly unique.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Measurement Positive Value Guard Increment

- Add failing-first coverage for zero or negative `measurement_rows.csv` values in millimetres and degrees.
- Extend export validation so impossible biometric distances or angles cannot enter agreement, calibration-adjacent, or reader-reliability analyses.
- Update the data dictionary so measurement values are documented as positive physical quantities.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Reporting Guideline Errata Handoff Increment

- Verify PubMed metadata for TRIPOD+AI, STARD-AI, CLAIM, DECIDE-AI, SPIRIT-AI, CONSORT-AI, and FeTA 2024 after the online literature pass.
- Add failing-first source-document coverage requiring TRIPOD+AI and DECIDE-AI errata metadata in the handoff packet.
- Update the publication handoff checklist and source-verification dossier so radiologist collaborators see the errata alongside the guideline citations.
- Update the audit/progress trail, then run targeted/full gates before committing.

## GenAI Contradictory Measurement Guard Increment

- Add failing-first coverage that generated-report verification rejects contradictory duplicate numeric mentions even when the expected anchor is present.
- Extend the deterministic verifier to scan report text for label-linked numeric values that disagree with the original measurement input.
- Keep the fallback path as the safe deterministic template whenever a contradiction is detected.
- Update the audit/progress trail, then run targeted/full gates before committing.

## GenAI Impression Citation Guard Increment

- Add failing-first coverage that generated Impression lines without inline literature citations fail verification.
- Add a deterministic citation verifier that accepts retrieved chunk IDs or PMID citations and ignores section headings.
- Reuse the safe deterministic-template fallback when citation grounding is incomplete.
- Update the audit/progress trail, then run targeted/full gates before committing.

## GenAI Traceable Citation Token Guard Increment

- Add failing-first coverage that bare numeric bracket citations such as `[1]` do not satisfy GenAI Impression grounding.
- Tighten the citation verifier so bracketed citations must look like retrieved chunk IDs rather than stale numeric reference markers.
- Preserve PMID citation support for agentic-search sources.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Validation Metrics Positive Duration Guard Increment

- Add failing-first validation-metrics coverage that QI report-audit and reader-study timing inputs reject zero-second durations.
- Align metric-layer validation with the export schema's positive-duration guard so direct helper calls cannot analyze impossible timing records.
- Keep non-duration non-negative score and count behavior unchanged.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Diagnostic Label Threshold Consistency Guard Increment

- Add failing-first validation-data-schema coverage that `diagnostic_labels.csv` predicted labels match `predicted_probability` at the locked threshold.
- Extend row validation so calibration and diagnostic-accuracy exports cannot carry internally contradictory prediction fields.
- Update the data dictionary so analysts know `predicted_label` is derived from `predicted_probability >= threshold` when probabilities are exported.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Diagnostic Threshold Open-Interval Guard Increment

- Add failing-first validation-data-schema coverage that `diagnostic_labels.csv` thresholds reject degenerate `0` and `1` values.
- Align export validation with validation-metrics helpers that require thresholds strictly between zero and one for accuracy, calibration, and decision-curve analysis.
- Update the data dictionary wording from inclusive 0-1 to open-interval threshold guidance.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Excluded Case Cross-File Guard Increment

- Add failing-first package-level validation coverage for analysis rows that reference `case_log.csv` cases marked `included=false`.
- Extend cross-file export validation so measurement, diagnostic-label, reader-study, and report-audit rows cannot pull excluded cases into downstream analyses.
- Update the data dictionary export checks to document that analysis rows must reference included cases.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Available Measurement Missing-Reason Guard Increment

- Add failing-first validation-data-schema coverage that `measurement_rows.csv` rows with `measurement_available=true` cannot carry a `missing_reason`.
- Extend row validation so available measurements must have exactly one value and no missingness explanation.
- Update the data dictionary export checks to document that `missing_reason` is reserved for unavailable measurements.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Diagnostic Indeterminate Reason Guard Increment

- Add failing-first validation-data-schema coverage that `diagnostic_labels.csv` rows with `indeterminate=false` cannot carry an `indeterminate_reason`.
- Extend diagnostic-label row validation so indeterminate reasons are present only for cases excluded from trigger analysis.
- Update the data dictionary export checks to document that `indeterminate_reason` is reserved for indeterminate rows.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Indeterminate Diagnostic Label Blank Guard Increment

- Add failing-first validation-data-schema coverage that `diagnostic_labels.csv` indeterminate rows can omit truth/prediction labels and probabilities.
- Add failing-first coverage that rows with `indeterminate=true` cannot carry label or probability fields that could be accidentally analyzed.
- Change diagnostic label schema requirements so labels are required for determinate rows and blank for indeterminate rows.
- Update the data dictionary, progress log, and audit trail, then run targeted/full gates before committing.

## Determinate Diagnostic Availability Guard Increment

- Add failing-first package-level validation coverage that determinate `diagnostic_labels.csv` rows cannot reference cases whose `case_log.csv` availability flags say reference standard, prediction, or pathology labels are unavailable.
- Extend cross-file export validation so diagnostic-accuracy, calibration, and decision-curve rows are only determinate when the case-level evidence is available.
- Update the data dictionary export checks to document the case-log availability precondition for determinate diagnostic labels.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Measurement Source Availability Guard Increment

- Add failing-first package-level validation coverage that reference measurement rows require `case_log.csv` reference-standard availability.
- Add failing-first coverage that calculator and AI-prefill measurement rows require `case_log.csv` prediction availability.
- Extend cross-file export validation so agreement and measurement-layer analyses cannot use rows contradicted by case-level availability flags.
- Update the data dictionary, progress log, and audit trail, then run targeted/full gates before committing.

## Reader Study Read-Order Uniqueness Guard Increment

- Add failing-first package-level validation coverage that each reader's `reader_study_rows.csv` `read_order` values are unique.
- Extend cross-file export validation so duplicate sequence positions are caught before counterbalanced reader-study analysis.
- Update the data dictionary export checks to document `read_order` uniqueness within each reader.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Reader Study Washout Consistency Guard Increment

- Add failing-first package-level validation coverage that paired `without_tool` and `with_tool` reader-study rows use the same `washout_days` value.
- Extend cross-file export validation so each reader-case pair has one consistent washout interval before paired analysis.
- Update the data dictionary export checks to document pair-level washout consistency.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Reader Study SUS Condition Guard Increment

- Add failing-first validation-data-schema coverage that System Usability Scale items are rejected on `without_tool` rows.
- Extend row validation so SUS item responses are reserved for `with_tool` reader-study rows.
- Update the data dictionary export checks to document the condition-specific SUS rule.
- Update the audit/progress trail, then run targeted/full gates before committing.

## Software Readiness Completion Audit Increment

- Adjust the active-goal stop condition to software-ready for radiologist evaluation rather than publication evidence complete.
- Audit SPEC.md, TEST.md, PROGRESS.md, completion_audit.md, source-verification records, validation export templates, and current gate outputs against that software-ready criterion.
- Update the completion audit so external cohort, IRB/QI, reader-study, calibration, and signoff tasks are clearly post-software evaluation work.
- Run final full gates and commit the audit before marking the active goal complete.
