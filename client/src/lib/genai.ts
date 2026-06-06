/*
 * Optional GenAI/RAG module from SPEC §4.11.
 *
 * This module intentionally contains only deterministic metadata and prompt /
 * query construction. It does not execute LLM inference, PubMed requests, or
 * browser/network calls, preserving the client-side privacy posture while
 * making the required guardrails auditable in tests.
 */

export const GENAI_KNOWLEDGE_BANK_SCOPE = [
  "~36 peer-reviewed papers cited in SPEC.md",
  "ISUOG guidelines",
  "ESPR guidelines",
  "authoritative fetal neuroradiology textbooks",
] as const;

export const RAG_SYSTEM_PROMPT =
  "You must only use the provided numerical data and retrieved literature to generate the report. Do not introduce external medical claims.";

export const GENAI_GUARDRAILS = {
  deterministicFindings: true,
  llmScope: "impression synthesis only",
  citationGrounding: "inline citation required for every Impression diagnosis",
  postGenerationVerification:
    "judge cross-checks generated report against numeric inputs",
  fallback: "safe deterministic template",
} as const;

export const GENAI_BACKENDS = {
  local: [
    "llama.cpp",
    "Gemma 4 (4B)",
    "MedGemma 1.5",
    "Llama 4 Scout",
    "Phi-3.5-mini",
  ],
  freeTierCloud: [
    "Google AI Studio",
    "Groq Cloud",
    "Hugging Face Serverless Inference API",
    "OpenRouter",
  ],
  networkCallsEnabled: false,
} as const;

export type AgenticSearchPlan = {
  api: "Bio.Entrez";
  query: string;
  maxAbstracts: 3;
  contextInjection: "temporary abstracts only";
  requiresRadiologistReview: true;
  transparencySource: "PMID hyperlink required for every agentic claim";
};

export type RagNumericInput = {
  label: string;
  value: number;
  unit: "mm" | "degrees";
  z: number;
  percentile: number;
};

export type RagEvidenceChunk = {
  id: string;
  source: string;
  text: string;
};

export type RagPromptPayload = {
  systemPrompt: typeof RAG_SYSTEM_PROMPT;
  numericalContext: string[];
  retrievedLiterature: string[];
};

export type NumericReportInput = {
  label: string;
  value: number;
  unit: "mm" | "degrees";
};

export type NumericVerificationFailure = {
  label: string;
  expectedAnchor: string;
  observedAnchor?: string;
};

export type NumericVerificationResult = {
  ok: boolean;
  failures: NumericVerificationFailure[];
  fallback: "safe deterministic template" | null;
};

export type ImpressionCitationVerificationFailure = {
  lineNumber: number;
  line: string;
};

export type ImpressionCitationVerificationResult = {
  ok: boolean;
  failures: ImpressionCitationVerificationFailure[];
  fallback: "safe deterministic template" | null;
};

const normalizeFinding = (finding: string): string =>
  finding.trim().replace(/\s+/g, " ");

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const numericAnchorFor = (input: NumericReportInput): string =>
  `${input.label}: ${input.value.toFixed(1)} ${input.unit}`;

const formatPromptZ = (z: number): string =>
  `${z >= 0 ? "+" : "-"}${Math.abs(z).toFixed(2)}`;

export function buildRagPromptPayload({
  numericalInputs,
  retrievedChunks,
}: {
  numericalInputs: RagNumericInput[];
  retrievedChunks: RagEvidenceChunk[];
}): RagPromptPayload {
  return {
    systemPrompt: RAG_SYSTEM_PROMPT,
    numericalContext: numericalInputs.map(
      input =>
        `${input.label}: ${input.value.toFixed(1)} ${
          input.unit
        }; z ${formatPromptZ(input.z)}; percentile ${input.percentile.toFixed(
          1
        )}`
    ),
    retrievedLiterature: retrievedChunks.map(
      chunk => `[${chunk.id}] ${chunk.source}: ${chunk.text}`
    ),
  };
}

export function buildAgenticSearchPlan(findings: string[]): AgenticSearchPlan {
  const normalizedFindings = findings
    .map(normalizeFinding)
    .filter(finding => finding.length > 0);

  if (normalizedFindings.length === 0) {
    throw new Error("At least one abnormal finding is required");
  }

  return {
    api: "Bio.Entrez",
    query: `${normalizedFindings.join(
      " AND "
    )} AND fetal MRI AND differential diagnosis`,
    maxAbstracts: 3,
    contextInjection: "temporary abstracts only",
    requiresRadiologistReview: true,
    transparencySource: "PMID hyperlink required for every agentic claim",
  };
}

export function verifyGeneratedReportAgainstNumericInputs(
  report: string,
  inputs: NumericReportInput[]
): NumericVerificationResult {
  const missingAnchorFailures = inputs
    .map(input => ({
      label: input.label,
      expectedAnchor: numericAnchorFor(input),
    }))
    .filter(anchor => !report.includes(anchor.expectedAnchor));
  const contradictoryMentionFailures = inputs.flatMap(input => {
    const labelPattern = escapeRegExp(input.label).replace(/\s+/g, "\\s+");
    const mentionPattern = new RegExp(
      `${labelPattern}\\s*(?::|measures|=)?\\s*(-?\\d+(?:\\.\\d+)?)\\s*(mm|degrees?)\\b`,
      "gi"
    );
    const failures: NumericVerificationFailure[] = [];

    const matches = Array.from(report.matchAll(mentionPattern));
    for (const match of matches) {
      const observedValue = Number(match[1]);
      const observedUnit = match[2].toLowerCase();
      const expectedUnit =
        input.unit === "degrees" ? "degree" : input.unit.toLowerCase();
      const unitMatches =
        observedUnit === expectedUnit || observedUnit === `${expectedUnit}s`;

      if (
        !unitMatches ||
        !Number.isFinite(observedValue) ||
        Math.abs(observedValue - input.value) > 0.05
      ) {
        failures.push({
          label: input.label,
          expectedAnchor: numericAnchorFor(input),
          observedAnchor: match[0].trim(),
        });
      }
    }

    return failures;
  });
  const failures = [...missingAnchorFailures, ...contradictoryMentionFailures];

  return {
    ok: failures.length === 0,
    failures,
    fallback: failures.length === 0 ? null : GENAI_GUARDRAILS.fallback,
  };
}

export function verifyGeneratedImpressionCitations(
  impression: string
): ImpressionCitationVerificationResult {
  const citationPattern =
    /\[(?=[A-Za-z0-9._:-]*[A-Za-z])[A-Za-z0-9][A-Za-z0-9._:-]*\]|\bPMID\s*:?\s*\d{6,9}\b/i;
  const failures = impression
    .split(/\r?\n/)
    .map((line, index) => ({
      lineNumber: index + 1,
      line: line.trim(),
    }))
    .filter(({ line }) => line.length > 0)
    .filter(({ line }) => !/^impression\s*:?\s*$/i.test(line))
    .filter(({ line }) => !citationPattern.test(line));

  return {
    ok: failures.length === 0,
    failures,
    fallback: failures.length === 0 ? null : GENAI_GUARDRAILS.fallback,
  };
}
