"""Python biometry model families for SPEC §4.2 / §4.3."""

from collections.abc import Sequence
from dataclasses import dataclass

import numpy as np
from scipy.optimize import curve_fit
from scipy.stats import norm


@dataclass(frozen=True)
class QuadraticMeanLinearSd:
    """mu(GA) = a*GA^2 + b*GA + c; sigma(GA) = a5*GA + b5."""

    a: float
    b: float
    c: float
    a5: float
    b5: float


@dataclass(frozen=True)
class PerPercentileLinear:
    """Recover mean/sigma from 5th and 95th percentile linear equations."""

    p5_k: float
    p5_d: float
    p95_k: float
    p95_d: float


@dataclass(frozen=True)
class LinearMeanConstantSd:
    """mu(GA) = m_mu*GA + b_mu; sigma is constant."""

    m_mu: float
    b_mu: float
    sigma: float


@dataclass(frozen=True)
class PerPercentileLinearFit:
    """Auditable fit result retained for registry-build review."""

    model: PerPercentileLinear
    residual_rmse: dict[str, float]


@dataclass(frozen=True)
class LinearMeanConstantSdFit:
    """Auditable fit result retained for registry-build review."""

    model: LinearMeanConstantSd
    residual_rmse: dict[str, float]


@dataclass(frozen=True)
class ChiariPosterior:
    controls: float
    ontd: float
    cntd: float


Model = QuadraticMeanLinearSd | PerPercentileLinear | LinearMeanConstantSd


def _as_float_array(name: str, values: Sequence[float]) -> np.ndarray:
    if len(values) == 0:
        raise ValueError(f"{name} must not be empty")
    return np.asarray(values, dtype=float)


def _linear(ga_weeks: np.ndarray, slope: float, intercept: float) -> np.ndarray:
    return slope * ga_weeks + intercept


def _rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
    return float(np.sqrt(np.mean((actual - predicted) ** 2)))


def _enforce_rmse_threshold(
    residual_rmse: dict[str, float], max_allowed_rmse: float | None
) -> None:
    if max_allowed_rmse is None:
        return
    worst_name, worst_rmse = max(
        residual_rmse.items(), key=lambda item: item[1]
    )
    if worst_rmse > max_allowed_rmse:
        raise ValueError(
            "fit residual exceeds inter-rater variability: "
            f"{worst_name} RMSE {worst_rmse:.3f} > {max_allowed_rmse:.3f}"
        )


def quadratic_mean_linear_sd(
    model: QuadraticMeanLinearSd, ga_weeks: float
) -> tuple[float, float]:
    mean = float(np.polyval([model.a, model.b, model.c], ga_weeks))
    sigma = float(model.a5 * ga_weeks + model.b5)
    return mean, sigma


def per_percentile_linear(
    model: PerPercentileLinear, ga_weeks: float
) -> tuple[float, float]:
    p5 = model.p5_k * ga_weeks + model.p5_d
    p95 = model.p95_k * ga_weeks + model.p95_d
    mean = (p5 + p95) / 2
    sigma = (p95 - p5) / (2 * 1.6449)
    return mean, sigma


def linear_mean_constant_sd(
    model: LinearMeanConstantSd, ga_weeks: float
) -> tuple[float, float]:
    mean = model.m_mu * ga_weeks + model.b_mu
    return mean, model.sigma


def evaluate_model(model: Model, ga_weeks: float) -> tuple[float, float]:
    if isinstance(model, QuadraticMeanLinearSd):
        return quadratic_mean_linear_sd(model, ga_weeks)
    if isinstance(model, PerPercentileLinear):
        return per_percentile_linear(model, ga_weeks)
    return linear_mean_constant_sd(model, ga_weeks)


def fit_per_percentile_linear_table(
    ga_weeks: Sequence[float],
    p5_values: Sequence[float],
    p95_values: Sequence[float],
    max_allowed_rmse: float | None = None,
) -> PerPercentileLinearFit:
    ga = _as_float_array("ga_weeks", ga_weeks)
    p5 = _as_float_array("p5_values", p5_values)
    p95 = _as_float_array("p95_values", p95_values)
    if len(ga) != len(p5) or len(ga) != len(p95):
        raise ValueError("ga_weeks, p5_values, and p95_values must match")

    p5_slope, p5_intercept = curve_fit(_linear, ga, p5)[0]
    p95_slope, p95_intercept = curve_fit(_linear, ga, p95)[0]
    residual_rmse = {
        "p5": _rmse(p5, _linear(ga, p5_slope, p5_intercept)),
        "p95": _rmse(p95, _linear(ga, p95_slope, p95_intercept)),
    }
    _enforce_rmse_threshold(residual_rmse, max_allowed_rmse)
    model = PerPercentileLinear(
        float(p5_slope),
        float(p5_intercept),
        float(p95_slope),
        float(p95_intercept),
    )
    return PerPercentileLinearFit(model=model, residual_rmse=residual_rmse)


def fit_linear_mean_constant_sd_table(
    ga_weeks: Sequence[float],
    mean_values: Sequence[float],
    sd_values: Sequence[float],
    max_allowed_rmse: float | None = None,
) -> LinearMeanConstantSdFit:
    ga = _as_float_array("ga_weeks", ga_weeks)
    means = _as_float_array("mean_values", mean_values)
    sds = _as_float_array("sd_values", sd_values)
    if len(ga) != len(means) or len(ga) != len(sds):
        raise ValueError("ga_weeks, mean_values, and sd_values must match")
    if np.any(sds <= 0):
        raise ValueError("sd_values must be positive")

    mean_slope, mean_intercept = curve_fit(_linear, ga, means)[0]
    sigma = float(np.mean(sds))
    residual_rmse = {
        "mean": _rmse(means, _linear(ga, mean_slope, mean_intercept)),
        "sd": _rmse(sds, np.full_like(sds, sigma)),
    }
    _enforce_rmse_threshold(residual_rmse, max_allowed_rmse)
    model = LinearMeanConstantSd(
        float(mean_slope),
        float(mean_intercept),
        sigma,
    )
    return LinearMeanConstantSdFit(model=model, residual_rmse=residual_rmse)


def mahalanobis2(
    point: tuple[float, float],
    mean: tuple[float, float],
    covariance: tuple[tuple[float, float], tuple[float, float]],
) -> float:
    dx = point[0] - mean[0]
    dy = point[1] - mean[1]
    ((a, b), (c, d)) = covariance
    det = a * d - b * c
    if det <= 0:
        return float("inf")

    inv00 = d / det
    inv01 = -b / det
    inv10 = -c / det
    inv11 = a / det
    return dx * (inv00 * dx + inv01 * dy) + dy * (inv10 * dx + inv11 * dy)


def chiari_ontd_posterior(z_tdpf: float, z_csa: float) -> ChiariPosterior:
    point = (z_tdpf, z_csa)
    distances = {
        "controls": mahalanobis2(point, (0, 0), ((1, 0), (0, 1))),
        "ontd": mahalanobis2(
            point,
            (-3.6, -2.6),
            ((0.9 * 0.9, 0.54), (0.54, 1.1 * 1.1)),
        ),
        "cntd": mahalanobis2(point, (-1.4, -0.6), ((1, 0), (0, 1))),
    }
    controls = float(np.exp(-distances["controls"] / 2))
    ontd = float(np.exp(-distances["ontd"] / 2))
    cntd = float(np.exp(-distances["cntd"] / 2))
    total = controls + ontd + cntd
    return ChiariPosterior(
        controls=controls / total,
        ontd=ontd / total,
        cntd=cntd / total,
    )


def zscore(model: Model, ga_weeks: float, value: float) -> dict[str, float]:
    mean, sigma = evaluate_model(model, ga_weeks)
    if sigma <= 0:
        raise ValueError("sigma must be positive")

    z_value = (value - mean) / sigma
    return {
        "mean": mean,
        "sigma": sigma,
        "z": z_value,
        "percentile": float(norm.cdf(z_value) * 100),
    }
