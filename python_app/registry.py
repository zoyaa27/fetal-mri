"""Python source registry and consensus evaluator for SPEC §4.2."""

from dataclasses import dataclass

from scipy.stats import norm

from .biometry import (
    Model,
    PerPercentileLinear,
    QuadraticMeanLinearSd,
    zscore as model_zscore,
)


@dataclass(frozen=True)
class Source:
    label: str


@dataclass(frozen=True)
class Parameter:
    id: str
    label: str
    unit: str
    source: Source
    model: Model
    ga_range: tuple[float, float]


@dataclass(frozen=True)
class SourceRegistryEntry:
    source: Source
    model: Model
    ga_range: tuple[float, float]
    cross_modality: bool = False
    caveat: str | None = None


S_LUIS = Source("Luis 2025")
S_DOVJAK = Source("Dovjak 2021")
S_KYRIA = Source("Kyriakopoulou 2017")
S_WOITEK = Source("Woitek 2014")


def q(a: float, b: float, c: float, a5: float, b5: float) -> QuadraticMeanLinearSd:
    return QuadraticMeanLinearSd(a=a, b=b, c=c, a5=a5, b5=b5)


def p(p5_k: float, p5_d: float, p95_k: float, p95_d: float) -> PerPercentileLinear:
    return PerPercentileLinear(
        p5_k=p5_k,
        p5_d=p5_d,
        p95_k=p95_k,
        p95_d=p95_d,
    )


EXTRA_AXIAL_CSF_MODEL = q(
    -0.0604400737108953,
    3.650533392397,
    -44.5543682103265,
    0.0736569049728816,
    -0.34287991257886,
)


PARAMETERS: dict[str, Parameter] = {
    "skull_bpd": Parameter(
        "skull_bpd", "Skull BPD", "mm", S_LUIS, q(-0.0527, 5.7605, -46.436, 0.0895, 0.1414), (20, 40)
    ),
    "skull_ofd": Parameter(
        "skull_ofd", "Skull OFD", "mm", S_LUIS, q(-0.0984, 8.8526, -81.605, 0.1511, -1.3192), (20, 40)
    ),
    "brain_bpd": Parameter(
        "brain_bpd", "Brain BPD", "mm", S_LUIS, q(0.016, 1.763, -0.9597, 0.1308, -1.32), (20, 40)
    ),
    "brain_ofd_left": Parameter(
        "brain_ofd_left", "Brain OFD left", "mm", S_LUIS, q(-0.0781, 7.7234, -75.3, 0.1277, -0.9298), (20, 40)
    ),
    "brain_ofd_right": Parameter(
        "brain_ofd_right", "Brain OFD right", "mm", S_LUIS, q(-0.0781, 7.7234, -75.3, 0.1277, -0.9298), (20, 40)
    ),
    "extra_axial_csf": Parameter(
        "extra_axial_csf", "Extra-axial CSF", "mm", S_KYRIA, EXTRA_AXIAL_CSF_MODEL, (21, 38)
    ),
    "atrial_left": Parameter(
        "atrial_left", "Atrial diameter left", "mm", S_LUIS, q(0.0078, -0.5216, 15.374, 0.0264, 0.5152), (20, 40)
    ),
    "atrial_right": Parameter(
        "atrial_right", "Atrial diameter right", "mm", S_LUIS, q(0.0078, -0.5216, 15.374, 0.0264, 0.5152), (20, 40)
    ),
    "tcd": Parameter("tcd", "TCD", "mm", S_DOVJAK, p(1.52, -12.48, 1.85, -15.23), (14, 39.3)),
    "vermis_cc": Parameter("vermis_cc", "Vermian height", "mm", S_DOVJAK, p(0.72, -6.83, 0.95, -8.93), (14, 39.3)),
    "vermis_ap": Parameter("vermis_ap", "Vermian AP", "mm", S_DOVJAK, p(0.53, -5.26, 0.7, -6.99), (14, 39.3)),
    "pons_ap": Parameter("pons_ap", "Pons AP", "mm", S_DOVJAK, p(0.33, -0.59, 0.44, -0.78), (14, 39.3)),
    "tdpf": Parameter("tdpf", "TDPF", "mm", S_WOITEK, q(-0.01307, 2.55571, -21.71, 0.06716, 0.547), (21, 37)),
    "csa": Parameter("csa", "CSA", "degrees", S_WOITEK, q(-0.04767, 4.20404, 1.73, 0.01814, 5.821), (21, 37)),
    "cc_length": Parameter(
        "cc_length", "Corpus callosum length", "mm", S_LUIS, q(-0.0687, 5.1529, -57.904, 0.0274, 0.4763), (20, 40)
    ),
    "csp_width": Parameter(
        "csp_width", "CSP width", "mm", S_LUIS, q(-0.0156, 0.9472, -6.6953, 0.053, -0.4388), (20, 40)
    ),
}


LUIS_OVERRIDES: dict[str, QuadraticMeanLinearSd] = {
    "tcd": q(0.0051, 1.5165, -14.584, 0.0343, 0.415),
    "vermis_cc": q(-0.0138, 1.6136, -20.065, 0.0354, -0.1869),
    "vermis_ap": q(-0.0089, 1.1119, -14.637, 0.0447, -0.5126),
    "pons_ap": q(0.002, 0.3144, -1.2147, 0.0124, 0.261),
}


REGISTRY_OVERRIDES: dict[str, list[SourceRegistryEntry]] = {
    "extra_axial_csf": [
        SourceRegistryEntry(
            S_KYRIA,
            EXTRA_AXIAL_CSF_MODEL,
            (21, 38),
        )
    ],
    "tcd": [
        SourceRegistryEntry(S_LUIS, LUIS_OVERRIDES["tcd"], (20, 40)),
        SourceRegistryEntry(S_DOVJAK, p(1.52, -12.48, 1.85, -15.23), (14, 39.3)),
    ],
    "vermis_cc": [
        SourceRegistryEntry(S_LUIS, LUIS_OVERRIDES["vermis_cc"], (20, 40)),
        SourceRegistryEntry(S_DOVJAK, p(0.72, -6.83, 0.95, -8.93), (14, 39.3)),
    ],
    "vermis_ap": [
        SourceRegistryEntry(S_LUIS, LUIS_OVERRIDES["vermis_ap"], (20, 40)),
        SourceRegistryEntry(S_DOVJAK, p(0.53, -5.26, 0.7, -6.99), (14, 39.3)),
    ],
    "pons_ap": [
        SourceRegistryEntry(S_LUIS, LUIS_OVERRIDES["pons_ap"], (20, 40)),
        SourceRegistryEntry(S_DOVJAK, p(0.33, -0.59, 0.44, -0.78), (14, 39.3)),
    ],
}


def source_registry_for(parameter_id: str) -> list[SourceRegistryEntry]:
    if parameter_id in REGISTRY_OVERRIDES:
        return REGISTRY_OVERRIDES[parameter_id]

    parameter = PARAMETERS[parameter_id]
    return [SourceRegistryEntry(parameter.source, parameter.model, parameter.ga_range)]


def evaluate_parameter(parameter_id: str, ga_weeks: float, value: float) -> dict[str, object]:
    details: list[dict[str, object]] = []
    for entry in source_registry_for(parameter_id):
        result = model_zscore(entry.model, ga_weeks, value)
        in_range = entry.ga_range[0] <= ga_weeks <= entry.ga_range[1]
        details.append(
            {
                "source_label": entry.source.label,
                "in_range": in_range,
                "ga_range": entry.ga_range,
                "cross_modality": entry.cross_modality,
                "caveat": entry.caveat,
                "z": result["z"],
                "percentile": result["percentile"],
                "mean": result["mean"],
                "sigma": result["sigma"],
            }
        )

    in_range_details = [detail for detail in details if detail["in_range"]]
    contributing = in_range_details or details
    consensus_z = sum(float(detail["z"]) for detail in contributing) / len(contributing)
    disagreement_width = None
    if len(in_range_details) >= 2:
        z_values = [float(detail["z"]) for detail in in_range_details]
        disagreement_width = max(z_values) - min(z_values)

    agreement_state = (
        "single"
        if len(in_range_details) < 2
        else "disagree"
        if disagreement_width is not None and disagreement_width >= 1
        else "agree"
    )

    return {
        "z": consensus_z,
        "percentile": float(norm.cdf(consensus_z) * 100),
        "agreement_state": agreement_state,
        "disagreement_width": disagreement_width,
        "source_labels": [str(detail["source_label"]) for detail in details],
        "source_details": details,
    }
