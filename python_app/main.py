"""Offline-capable FastAPI/Jinja entry point for SPEC §4.3."""

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .biometry import chiari_ontd_posterior
from .registry import evaluate_parameter


BASE_DIR = Path(__file__).resolve().parent
WEEKS_OPTIONS = list(range(18, 41))
DAYS_OPTIONS = list(range(7))
FIELD_STRENGTH_OPTIONS = ["0.55T", "1.5T", "3T"]
MOTION_OPTIONS = ["None", "Mild", "Moderate", "Severe"]
RAW_THRESHOLD_PARAMETER_IDS = {
    "third_ventricle",
    "frontal_horn_left",
    "frontal_horn_right",
    "cisterna_magna_depth",
    "tva",
}
PARAMETER_GROUPS = [
    {
        "name": "Global brain / skull",
        "parameters": [
            {"id": "skull_bpd", "label": "Skull BPD", "unit": "mm"},
            {"id": "skull_ofd", "label": "Skull OFD", "unit": "mm"},
            {"id": "brain_bpd", "label": "Brain BPD", "unit": "mm"},
            {"id": "brain_ofd_left", "label": "Brain OFD left", "unit": "mm"},
            {"id": "brain_ofd_right", "label": "Brain OFD right", "unit": "mm"},
            {"id": "extra_axial_csf", "label": "Extra-axial CSF", "unit": "mm"},
        ],
    },
    {
        "name": "Ventricular system",
        "parameters": [
            {"id": "atrial_left", "label": "Atrial diameter left", "unit": "mm"},
            {"id": "atrial_right", "label": "Atrial diameter right", "unit": "mm"},
            {"id": "frontal_horn_left", "label": "Frontal horn left", "unit": "mm"},
            {"id": "frontal_horn_right", "label": "Frontal horn right", "unit": "mm"},
            {"id": "third_ventricle", "label": "Third ventricle", "unit": "mm"},
        ],
    },
    {
        "name": "Midline structures",
        "parameters": [
            {"id": "cc_length", "label": "Corpus callosum length", "unit": "mm"},
            {"id": "csp_width", "label": "CSP width", "unit": "mm"},
        ],
    },
    {
        "name": "Posterior fossa",
        "parameters": [
            {"id": "tcd", "label": "Transcerebellar diameter", "unit": "mm"},
            {"id": "vermis_cc", "label": "Vermian height", "unit": "mm"},
            {"id": "vermis_ap", "label": "Vermian AP", "unit": "mm"},
            {"id": "tdpf", "label": "TDPF", "unit": "mm"},
            {"id": "csa", "label": "CSA", "unit": "degrees"},
            {"id": "cisterna_magna_depth", "label": "Cisterna magna", "unit": "mm"},
            {"id": "tva", "label": "TVA", "unit": "degrees"},
        ],
    },
    {
        "name": "Brainstem",
        "parameters": [
            {"id": "pons_ap", "label": "Pons AP", "unit": "mm"},
        ],
    },
]

app = FastAPI(title="Fetal Brain MRI Biometry Calculator")
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


def _initial_report(weeks: int = 30, days: int = 0) -> str:
    ga_label = f"{weeks}w {days}d ({weeks + days / 7:.1f} weeks)"
    return "\n".join(
        [
            "CLINICAL INDICATION",
            "",
            "",
            "TECHNIQUE",
            (
                "Calculator operated in multi-source consensus mode. "
                f"Gestational age: {ga_label}."
            ),
            "",
            "FINDINGS",
            "No measurements entered.",
            "",
            "IMPRESSION",
            "No abnormal biometric findings.",
        ]
    )


def _entered_measurements(form: dict[str, str]) -> list[tuple[str, str, str, str, str]]:
    rows: list[tuple[str, str, str, str, str]] = []
    for group in PARAMETER_GROUPS:
        for parameter in group["parameters"]:
            raw_value = form.get(parameter["id"], "").strip()
            if raw_value:
                rows.append(
                    (
                        group["name"],
                        parameter["id"],
                        parameter["label"],
                        raw_value,
                        parameter["unit"],
                    )
                )
    return rows


def _source_detail_text(source_details: list[dict[str, object]]) -> str:
    rows: list[str] = []
    for detail in source_details:
        ga_range = detail.get("ga_range")
        if isinstance(ga_range, tuple) and len(ga_range) == 2:
            range_text = (
                f"validated GA {float(ga_range[0]):g}-{float(ga_range[1]):g}w"
            )
        else:
            range_text = "validated GA unavailable"
        range_status = "in-range" if detail["in_range"] else "extrapolated"
        caveats = []
        if detail.get("cross_modality"):
            caveats.append("cross-modality")
        if detail.get("caveat"):
            caveats.append(str(detail["caveat"]))
        caveat_text = f"; {'; '.join(caveats)}" if caveats else ""
        rows.append(
            f"{detail['source_label']} z {float(detail['z']):+.2f}, "
            f"{float(detail['percentile']):.0f} percentile, "
            f"mean {float(detail['mean']):.1f}, "
            f"sigma {float(detail['sigma']):.2f}, "
            f"{range_text}, {range_status}{caveat_text}"
        )
    return "; ".join(rows)


def _z_value(results: dict[str, dict[str, object]], parameter_id: str) -> float | None:
    result = results.get(parameter_id)
    return None if result is None else float(result["z"])


def _python_differential_rows(
    values: dict[str, float], results: dict[str, dict[str, object]]
) -> list[str]:
    rows: list[str] = []
    atrial_values = [
        value
        for parameter_id in ("atrial_left", "atrial_right")
        if (value := values.get(parameter_id)) is not None
    ]
    max_atrium = max(atrial_values) if atrial_values else None
    if max_atrium is not None and max_atrium >= 15:
        rows.append("severe ventriculomegaly: atrial diameter is >= 15 mm.")
    elif max_atrium is not None and max_atrium >= 12:
        rows.append("moderate ventriculomegaly: atrial diameter is 12-15 mm.")
    elif max_atrium is not None and max_atrium >= 10:
        rows.append("mild ventriculomegaly: atrial diameter is 10-12 mm.")

    left_atrium = values.get("atrial_left")
    right_atrium = values.get("atrial_right")
    if (
        left_atrium is not None
        and right_atrium is not None
        and abs(left_atrium - right_atrium) > 2
    ):
        rows.append(
            "ventricular asymmetry: atrial diameter side-to-side difference "
            "is > 2 mm."
        )

    for side, atrium_id, frontal_horn_id in (
        ("left", "atrial_left", "frontal_horn_left"),
        ("right", "atrial_right", "frontal_horn_right"),
    ):
        atrium = values.get(atrium_id)
        frontal_horn = values.get(frontal_horn_id)
        if (
            atrium is not None
            and frontal_horn is not None
            and atrium > 10
            and frontal_horn < 10
        ):
            rows.append(
                f"colpocephaly pattern: {side} atrium is > 10 mm with "
                "normal same-side frontal horn."
            )
            break

    csp_width = values.get("csp_width")
    if csp_width is not None and csp_width < 1:
        rows.append("absent CSP: CSP width is < 1 mm.")
    elif csp_width is not None and csp_width > 10:
        rows.append("enlarged CSP: CSP width is > 10 mm.")

    third_ventricle = values.get("third_ventricle")
    third_ventricle_wide = third_ventricle is not None and third_ventricle > 3.5
    if third_ventricle_wide:
        rows.append("wide third ventricle: third-ventricle width is > 3.5 mm.")

    head_z_values = [
        z_value
        for parameter_id in ("skull_bpd", "brain_bpd")
        if (z_value := _z_value(results, parameter_id)) is not None
    ]
    microcephaly_pattern = bool(head_z_values and min(head_z_values) < -1.88)
    if microcephaly_pattern:
        rows.append("microcephaly: skull or brain BPD is below the 3rd percentile.")
    if head_z_values and max(head_z_values) > 1.88:
        rows.append("macrocephaly: skull or brain BPD is above the 97th percentile.")

    skull_bpd_z = _z_value(results, "skull_bpd")
    brain_bpd_z = _z_value(results, "brain_bpd")
    if (
        skull_bpd_z is not None
        and brain_bpd_z is not None
        and skull_bpd_z - brain_bpd_z > 2
    ):
        rows.append(
            "brain volume loss / atrophy: brain size is discordant from skull size."
        )

    brain_ofd_left_z = _z_value(results, "brain_ofd_left")
    brain_ofd_right_z = _z_value(results, "brain_ofd_right")
    if (
        brain_ofd_left_z is not None
        and brain_ofd_right_z is not None
        and abs(brain_ofd_left_z - brain_ofd_right_z) > 2
    ):
        rows.append(
            "cerebral hemispheric asymmetry: brain OFD left-right z-score gap is > 2."
        )

    extra_axial_z = _z_value(results, "extra_axial_csf")
    if extra_axial_z is not None and extra_axial_z > 1.645:
        rows.append(
            "widened extra-axial CSF space: extra-axial CSF is above the "
            "95th percentile."
        )

    cc_z = _z_value(results, "cc_length")
    cc_small = cc_z is not None and cc_z < -1.645
    if cc_small:
        rows.append(
            "corpus callosum dysgenesis: corpus callosum length is below the "
            "5th percentile."
        )
    elif cc_z is not None and cc_z > 1.645:
        rows.append(
            "thick corpus callosum: corpus callosum length is above the "
            "95th percentile."
        )

    tcd_z = _z_value(results, "tcd")
    tcd_small = tcd_z is not None and tcd_z < -1.645
    if tcd_small:
        rows.append("cerebellar hypoplasia: TCD is below the 5th percentile.")
    elif tcd_z is not None and tcd_z > 1.645:
        rows.append("macrocerebellum: TCD is above the 95th percentile.")

    cisterna_magna_depth = values.get("cisterna_magna_depth")
    if cisterna_magna_depth is not None and cisterna_magna_depth > 10:
        rows.append(
            "mega cisterna magna / Blake's pouch cyst differential: "
            "cisterna magna depth is > 10 mm."
        )

    vermis_z_values = [
        z_value
        for parameter_id in ("vermis_cc", "vermis_ap")
        if (z_value := _z_value(results, parameter_id)) is not None
    ]
    vermis_small = bool(vermis_z_values and min(vermis_z_values) < -1.645)
    if vermis_small:
        if (values.get("tva") or 0) > 23:
            rows.append("Dandy-Walker spectrum: small vermis with elevated TVA.")
        else:
            rows.append(
                "vermian hypoplasia: vermian measurement is below the "
                "5th percentile."
            )
    elif vermis_z_values and max(vermis_z_values) > 1.645:
        rows.append("large vermis: vermian measurement is above the 95th percentile.")
    elif (values.get("tva") or 0) > 23:
        rows.append(
            "Blake's pouch cyst advisory: elevated TVA without a small-vermis "
            "Dandy-Walker pattern."
        )

    pons_z = _z_value(results, "pons_ap")
    pons_small = pons_z is not None and pons_z < -1.645
    if pons_small:
        rows.append(
            "pontocerebellar hypoplasia pattern: pons AP is below the "
            "5th percentile."
        )
    elif pons_z is not None and pons_z > 1.645:
        rows.append("pontine bulging: pons AP is above the 95th percentile.")

    absent_csp = csp_width is not None and csp_width < 1
    if max_atrium is not None and max_atrium >= 15 and third_ventricle_wide:
        rows.append(
            "triventricular hydrocephalus pattern: severe ventriculomegaly "
            "with wide third ventricle."
        )
    if absent_csp and cc_small:
        rows.append(
            "agenesis of the corpus callosum pattern: absent CSP with short "
            "corpus callosum."
        )
    if absent_csp and microcephaly_pattern:
        rows.append("holoprosencephaly pattern: absent CSP with microcephaly.")
    if pons_small and (tcd_small or vermis_small):
        rows.append(
            "pontocerebellar hypoplasia combined pattern: small pons with "
            "small cerebellar or vermian measurement."
        )

    tdpf_z = _z_value(results, "tdpf")
    csa_z = _z_value(results, "csa")
    if tdpf_z is not None and csa_z is not None and tdpf_z < -2 and csa_z < -2:
        posterior = chiari_ontd_posterior(tdpf_z, csa_z)
        if posterior.ontd > 0.5:
            rows.insert(
                0,
                "Chiari II / open neural tube defect: "
                f"ONTD posterior {posterior.ontd:.0%} "
                "(research-mode; evaluate the fetal spine).",
            )

    return rows


@app.get("/", response_class=HTMLResponse)
def index(request: Request) -> HTMLResponse:
    """Render the offline-capable calculator shell."""

    return templates.TemplateResponse(
        request,
        "index.html",
        {
            "app_name": "Fetal Brain MRI Biometry Calculator",
            "privacy_posture": "client-side, no PHI storage",
            "weeks_options": WEEKS_OPTIONS,
            "days_options": DAYS_OPTIONS,
            "field_strength_options": FIELD_STRENGTH_OPTIONS,
            "motion_options": MOTION_OPTIONS,
            "parameter_groups": PARAMETER_GROUPS,
            "initial_report": _initial_report(),
        },
    )


@app.post("/calculate", response_class=PlainTextResponse)
async def calculate(request: Request) -> PlainTextResponse:
    """Return a plain-text report preview without persisting request data."""

    raw_form = await request.form()
    form = {key: str(value) for key, value in raw_form.items()}
    weeks = int(form.get("weeks", "30"))
    days = int(form.get("days", "0"))
    field_strength = form.get("field_strength", "1.5T")
    motion = form.get("motion", "None")
    measurements = _entered_measurements(form)
    has_abnormal_z = False
    disagreeing_rows: list[tuple[str, dict[str, object]]] = []
    numeric_values: dict[str, float] = {}
    results_by_id: dict[str, dict[str, object]] = {}

    ga_label = f"{weeks}w {days}d ({weeks + days / 7:.1f} weeks)"
    ga_weeks = weeks + days / 7
    lines = [
        "CLINICAL INDICATION",
        "",
        "",
        "TECHNIQUE",
        (
            "Calculator operated in multi-source consensus mode. "
            f"Gestational age: {ga_label}. Field strength: {field_strength}. "
            f"Motion artefact: {motion.lower()}."
        ),
        "",
        "FINDINGS",
    ]

    if measurements:
        current_group = ""
        for group_name, parameter_id, label, value, unit in measurements:
            if group_name != current_group:
                current_group = group_name
                lines.append(f"-- {group_name.upper()} --")
            try:
                numeric_value = float(value)
                numeric_values[parameter_id] = numeric_value
                if parameter_id in RAW_THRESHOLD_PARAMETER_IDS:
                    lines.append(
                        f"  * {label}: {numeric_value:.1f} {unit} "
                        "(raw threshold input)."
                    )
                    continue
                result = evaluate_parameter(parameter_id, ga_weeks, numeric_value)
                results_by_id[parameter_id] = result
                z_value = float(result["z"])
                has_abnormal_z = has_abnormal_z or abs(z_value) > 2
                source_details = result["source_details"]
                source_text = _source_detail_text(source_details)
                if result["agreement_state"] == "disagree":
                    disagreeing_rows.append((label, result))
                lines.append(
                    f"  * {label}: {numeric_value:.1f} {unit} "
                    f"(consensus z {z_value:+.2f}, "
                    f"{float(result['percentile']):.0f} percentile; "
                    f"agreement: {result['agreement_state']}). "
                    f"Sources: {source_text}."
                )
            except (KeyError, ValueError):
                lines.append(f"  * {label}: {value} {unit}.")
    else:
        lines.append("No measurements entered.")

    if disagreeing_rows:
        lines.extend(["", "SOURCE-AGREEMENT NOTES"])
        for label, result in disagreeing_rows:
            source_text = _source_detail_text(result["source_details"])
            lines.append(
                f"{label} Delta z {float(result['disagreement_width']):.2f}: "
                f"{source_text}."
            )

    differential_rows = _python_differential_rows(numeric_values, results_by_id)
    if differential_rows:
        lines.extend(["", "DIFFERENTIAL CONSIDERATIONS"])
        for row in differential_rows:
            lines.append(f"  * {row}")

    impression = (
        differential_rows[0]
        if differential_rows
        else "One or more measurements fall outside the expected range; review source details."
        if has_abnormal_z
        else "No abnormal biometric findings."
    )
    lines.extend(["", "IMPRESSION", impression])
    return PlainTextResponse("\n".join(lines))
