import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("SPEC §4.3 Python/FastAPI architecture scaffold", () => {
  it("declares the required Python web, math, and standalone packaging dependencies", () => {
    const pyprojectPath = resolve(process.cwd(), "pyproject.toml");

    expect(existsSync(pyprojectPath)).toBe(true);
    const pyproject = read("pyproject.toml");

    expect(pyproject).toContain("fastapi");
    expect(pyproject).toContain("jinja2");
    expect(pyproject).toContain("numpy");
    expect(pyproject).toContain("scipy");
    expect(pyproject).toContain("pyinstaller");
    expect(pyproject).toContain("[build-system]");
    expect(pyproject).toContain("setuptools.build_meta");
  });

  it("scopes Python packaging to the FastAPI app and bundled offline assets", () => {
    const pyproject = read("pyproject.toml");

    expect(pyproject).toContain("[tool.setuptools]");
    expect(pyproject).toContain(
      'packages = ["python_app", "python_app.static", "python_app.templates"]'
    );
    expect(pyproject).toContain("[tool.setuptools.package-data]");
    expect(pyproject).toContain(
      'python_app = ["templates/*.html", "static/*"]'
    );
  });

  it("provides a FastAPI app serving Jinja templates and local static assets", () => {
    const appPath = resolve(process.cwd(), "python_app/main.py");

    expect(existsSync(appPath)).toBe(true);
    const app = read("python_app/main.py");

    expect(app).toContain("FastAPI");
    expect(app).toContain("Jinja2Templates");
    expect(app).toContain("StaticFiles");
    expect(app).toContain("offline-capable");
  });

  it("renders a Python Jinja worksheet shell with SPEC §4.4 controls", () => {
    const app = read("python_app/main.py");
    const template = read("python_app/templates/index.html");

    expect(app).toContain("weeks_options");
    expect(app).toContain("parameter_groups");
    expect(app).toContain('@app.post("/calculate"');
    expect(template).not.toContain("TypeScript calculator remains");
    expect(template).toContain('name="weeks"');
    expect(template).toContain("{% for week in weeks_options %}");
    expect(template).toContain('name="days"');
    expect(template).toContain('hx-post="/calculate"');
    expect(template).toContain(
      'hx-trigger="change, keyup changed delay:300ms"'
    );
    expect(template).toContain("Structured report preview");
    expect(template).toContain("Copy to Clipboard");
    expect(template).toContain("Clear All");
  });

  it("uses local HTMX and Tailwind assets rather than remote scripts", () => {
    const templatePath = resolve(
      process.cwd(),
      "python_app/templates/index.html"
    );
    const htmxPath = resolve(process.cwd(), "python_app/static/htmx.min.js");
    const tailwindPath = resolve(
      process.cwd(),
      "python_app/static/tailwind.css"
    );

    expect(existsSync(templatePath)).toBe(true);
    expect(existsSync(htmxPath)).toBe(true);
    expect(existsSync(tailwindPath)).toBe(true);

    const template = read("python_app/templates/index.html");

    expect(template).toContain("/static/htmx.min.js");
    expect(template).toContain("/static/tailwind.css");
    expect(template).not.toMatch(/https?:\/\//);
  });

  it("bundles a local HTMX adapter for the Python worksheet form updates", () => {
    const htmx = read("python_app/static/htmx.min.js");

    expect(htmx).not.toContain("local-placeholder");
    expect(htmx).toContain("hx-post");
    expect(htmx).toContain("hx-target");
    expect(htmx).toContain("FormData");
    expect(htmx).toContain("fetch");
    expect(htmx).toContain("addEventListener");
  });

  it("bundles local stylesheet rules for the Python worksheet shell", () => {
    const stylesheet = read("python_app/static/tailwind.css");

    expect(stylesheet).not.toContain("placeholder");
    expect(stylesheet).toContain("form[hx-post]");
    expect(stylesheet).toContain("#report-preview");
    expect(stylesheet).toContain("@media (min-width: 1024px)");
    expect(stylesheet).toContain("background");
    expect(stylesheet).toContain("border");
  });

  it("provides a numpy/scipy Python biometry core scaffold for all model families", () => {
    const corePath = resolve(process.cwd(), "python_app/biometry.py");

    expect(existsSync(corePath)).toBe(true);
    const core = read("python_app/biometry.py");

    expect(core).toContain("import numpy as np");
    expect(core).toContain("from scipy.stats import norm");
    expect(core).toContain("quadratic_mean_linear_sd");
    expect(core).toContain("per_percentile_linear");
    expect(core).toContain("linear_mean_constant_sd");
    expect(core).toContain("def zscore");
  });

  it("provides a Python source registry for consensus z-score evaluation", () => {
    const app = read("python_app/main.py");
    const registryPath = resolve(process.cwd(), "python_app/registry.py");

    expect(existsSync(registryPath)).toBe(true);

    const registry = read("python_app/registry.py");
    const parameterIds = [
      "skull_bpd",
      "skull_ofd",
      "brain_bpd",
      "brain_ofd_left",
      "brain_ofd_right",
      "extra_axial_csf",
      "atrial_left",
      "atrial_right",
      "cc_length",
      "csp_width",
      "tcd",
      "vermis_cc",
      "vermis_ap",
      "pons_ap",
      "tdpf",
      "csa",
    ];

    for (const id of parameterIds) {
      expect(registry).toContain(`"${id}"`);
    }
    expect(registry).toContain("SourceRegistryEntry");
    expect(registry).toContain("source_registry_for");
    expect(registry).toContain("evaluate_parameter");
    expect(registry).toContain("agreement_state");
    expect(registry).not.toContain('"third_ventricle": Parameter');
    expect(app).toContain('"third_ventricle"');
    expect(app).toContain("evaluate_parameter");
    expect(app).toContain("consensus z");
    expect(app).toContain("percentile");
  });

  it("propagates Python per-source detail and disagreement notes into reports", () => {
    const app = read("python_app/main.py");

    expect(app).toContain("source_details");
    expect(app).toContain("SOURCE-AGREEMENT NOTES");
    expect(app).toContain("Delta z");
    expect(app).toContain("agreement:");
  });

  it("renders complete Python report source-detail fields required by SPEC §4.8", () => {
    const app = read("python_app/main.py");
    const registry = read("python_app/registry.py");

    expect(registry).toContain('"ga_range"');
    expect(registry).toContain('"cross_modality"');
    expect(registry).toContain('"caveat"');
    expect(app).toContain("mean");
    expect(app).toContain("sigma");
    expect(app).toContain("percentile");
    expect(app).toContain("validated GA");
    expect(app).toContain("extrapolated");
  });

  it("locks Python extra-axial CSF to the Kyriakopoulou workbook coefficients", () => {
    const registry = read("python_app/registry.py");

    expect(registry).toContain('"extra_axial_csf": [');
    expect(registry).toContain("EXTRA_AXIAL_CSF_MODEL");
    expect(registry).toContain("-0.0604400737108953");
    expect(registry).toContain("3.650533392397");
    expect(registry).toContain("-44.5543682103265");
    expect(registry).toContain("0.0736569049728816");
    expect(registry).toContain("-0.34287991257886");
    expect(registry).toContain("S_KYRIA");
    expect(registry).not.toContain("EXTRA_AXIAL_CSF_APPROXIMATION_CAVEAT");
    expect(registry).not.toContain(
      "caveat=EXTRA_AXIAL_CSF_APPROXIMATION_CAVEAT"
    );
  });

  it("scaffolds Python endpoint DDx output for core threshold patterns", () => {
    const app = read("python_app/main.py");

    expect(app).toContain("DIFFERENTIAL CONSIDERATIONS");
    expect(app).toContain("mild ventriculomegaly");
    expect(app).toContain("severe ventriculomegaly");
    expect(app).toContain("absent CSP");
    expect(app).toContain("wide third ventricle");
    expect(app).toContain("microcephaly");
    expect(app).toContain("Dandy-Walker");
  });

  it("implements the Python Chiari II / ONTD discriminator hook", () => {
    const app = read("python_app/main.py");
    const core = read("python_app/biometry.py");

    expect(core).toContain("def chiari_ontd_posterior");
    expect(core).toContain("mahalanobis2");
    expect(app).toContain("Chiari II / open neural tube defect");
    expect(app).toContain("ONTD posterior");
    expect(app).toContain("research-mode");
  });

  it("implements the Python colpocephaly auxiliary frontal-horn comparison", () => {
    const app = read("python_app/main.py");

    expect(app).toContain('"frontal_horn_left"');
    expect(app).toContain('"frontal_horn_right"');
    expect(app).toContain("colpocephaly pattern");
    expect(app).toContain("normal same-side frontal horn");
  });

  it("implements the Python posterior-fossa auxiliary trigger bridge", () => {
    const app = read("python_app/main.py");

    expect(app).toContain('"cisterna_magna_depth"');
    expect(app).toContain('"tva"');
    expect(app).toContain("mega cisterna magna");
    expect(app).toContain("Blake's pouch");
  });

  it("implements Python residual DDx trigger rows for SPEC §4.6 and §4.7", () => {
    const app = read("python_app/main.py");

    expect(app).toContain("ventricular asymmetry");
    expect(app).toContain("corpus callosum dysgenesis");
    expect(app).toContain("thick corpus callosum");
    expect(app).toContain("macrocerebellum");
    expect(app).toContain("pontine bulging");
    expect(app).toContain("widened extra-axial CSF");
    expect(app).toContain("cerebral hemispheric asymmetry");
    expect(app).toContain("triventricular hydrocephalus pattern");
    expect(app).toContain("agenesis of the corpus callosum pattern");
    expect(app).toContain("holoprosencephaly pattern");
    expect(app).toContain("pontocerebellar hypoplasia combined pattern");
  });

  it("scaffolds scipy curve fitting for offline centile-table registry builds", () => {
    const core = read("python_app/biometry.py");

    expect(core).toContain("from scipy.optimize import curve_fit");
    expect(core).toContain("fit_per_percentile_linear_table");
    expect(core).toContain("fit_linear_mean_constant_sd_table");
  });

  it("retains residual RMSE audits for offline Python table fits", () => {
    const core = read("python_app/biometry.py");

    expect(core).toContain("class PerPercentileLinearFit");
    expect(core).toContain("class LinearMeanConstantSdFit");
    expect(core).toContain("residual_rmse");
    expect(core).toContain("max_allowed_rmse");
    expect(core).toContain("fit residual exceeds inter-rater variability");
  });

  it("scaffolds the optional Python Bio.Entrez agentic-search fallback", () => {
    const pyproject = read("pyproject.toml");
    const genaiPath = resolve(process.cwd(), "python_app/genai.py");

    expect(pyproject).toContain("biopython");
    expect(existsSync(genaiPath)).toBe(true);

    const genai = read("python_app/genai.py");

    expect(genai).toContain("from Bio import Entrez");
    expect(genai).toContain("Entrez.efetch");
    expect(genai).toContain("max_abstracts: int = 3");
    expect(genai).toContain("PMID hyperlink");
  });

  it("provides a lightweight Docker deployment artifact for the FastAPI scaffold", () => {
    const dockerfilePath = resolve(process.cwd(), "Dockerfile");

    expect(existsSync(dockerfilePath)).toBe(true);
    const dockerfile = read("Dockerfile");

    expect(dockerfile).toContain("python:3.11");
    expect(dockerfile).toContain("pyproject.toml");
    expect(dockerfile).toContain("uvicorn");
    expect(dockerfile).toContain("python_app.main:app");
    expect(dockerfile).toContain("8000");
  });
});
