import { describe, expect, it } from "vitest";

import {
  GENAI_BACKENDS,
  GENAI_GUARDRAILS,
  GENAI_KNOWLEDGE_BANK_SCOPE,
  RAG_SYSTEM_PROMPT,
  buildAgenticSearchPlan,
  buildRagPromptPayload,
  verifyGeneratedImpressionCitations,
  verifyGeneratedReportAgainstNumericInputs,
} from "./genai";

describe("SPEC §4.11.2 RAG knowledge bank and prompt guardrail", () => {
  it("exposes the curated knowledge-bank scope and exact no-external-claims prompt", () => {
    expect(GENAI_KNOWLEDGE_BANK_SCOPE).toEqual(
      expect.arrayContaining([
        "~36 peer-reviewed papers cited in SPEC.md",
        "ISUOG guidelines",
        "ESPR guidelines",
        "authoritative fetal neuroradiology textbooks",
      ])
    );
    expect(RAG_SYSTEM_PROMPT).toContain(
      "You must only use the provided numerical data and retrieved literature to generate the report. Do not introduce external medical claims."
    );
  });

  it("injects exact numerical inputs, z-scores, and retrieved chunks into the prompt payload", () => {
    const payload = buildRagPromptPayload({
      numericalInputs: [
        {
          label: "Left atrium",
          value: 12,
          unit: "mm",
          z: 2.1,
          percentile: 98.2,
        },
      ],
      retrievedChunks: [
        {
          id: "pagani-2014-nd-delay",
          source: "Pagani 2014",
          text: "Isolated mild ventriculomegaly pooled neurodevelopmental delay rate 7.9%.",
        },
      ],
    });

    expect(payload.systemPrompt).toBe(RAG_SYSTEM_PROMPT);
    expect(payload.numericalContext).toEqual([
      "Left atrium: 12.0 mm; z +2.10; percentile 98.2",
    ]);
    expect(payload.retrievedLiterature).toEqual([
      "[pagani-2014-nd-delay] Pagani 2014: Isolated mild ventriculomegaly pooled neurodevelopmental delay rate 7.9%.",
    ]);
  });
});

describe("SPEC §4.11.3 agentic search fallback", () => {
  it("builds the PubMed query shape, top-3 retrieval plan, and transparency metadata", () => {
    const plan = buildAgenticSearchPlan([
      "absent CSP",
      "cerebellar hypoplasia",
    ]);

    expect(plan).toMatchObject({
      api: "Bio.Entrez",
      query:
        "absent CSP AND cerebellar hypoplasia AND fetal MRI AND differential diagnosis",
      maxAbstracts: 3,
      contextInjection: "temporary abstracts only",
      requiresRadiologistReview: true,
      transparencySource: "PMID hyperlink required for every agentic claim",
    });
  });
});

describe("SPEC §4.11.4 hallucination guardrails", () => {
  it("declares deterministic findings, citation grounding, judge verification, and safe fallback", () => {
    expect(GENAI_GUARDRAILS).toMatchObject({
      deterministicFindings: true,
      llmScope: "impression synthesis only",
      citationGrounding:
        "inline citation required for every Impression diagnosis",
      postGenerationVerification:
        "judge cross-checks generated report against numeric inputs",
      fallback: "safe deterministic template",
    });
  });

  it("fails generated-report verification when the original numeric anchor is missing", () => {
    const result = verifyGeneratedReportAgainstNumericInputs(
      "FINDINGS\nThe left atrium measures 22.0 mm.",
      [{ label: "Left atrium", value: 12, unit: "mm" }]
    );

    expect(result).toMatchObject({
      ok: false,
      fallback: "safe deterministic template",
      failures: expect.arrayContaining([
        expect.objectContaining({
          label: "Left atrium",
          expectedAnchor: "Left atrium: 12.0 mm",
        }),
      ]),
    });
  });

  it("passes generated-report verification when every numeric anchor is preserved", () => {
    const result = verifyGeneratedReportAgainstNumericInputs(
      "FINDINGS\nLeft atrium: 12.0 mm.\nCSA: 55.0 degrees.",
      [
        { label: "Left atrium", value: 12, unit: "mm" },
        { label: "CSA", value: 55, unit: "degrees" },
      ]
    );

    expect(result).toEqual({
      ok: true,
      failures: [],
      fallback: null,
    });
  });

  it("fails generated-report verification when a duplicate numeric mention contradicts the input", () => {
    const result = verifyGeneratedReportAgainstNumericInputs(
      "FINDINGS\nLeft atrium: 12.0 mm.\nLeft atrium: 22.0 mm.",
      [{ label: "Left atrium", value: 12, unit: "mm" }]
    );

    expect(result.ok).toBe(false);
    expect(result.fallback).toBe("safe deterministic template");
    expect(result.failures).toContainEqual(
      expect.objectContaining({
        label: "Left atrium",
        expectedAnchor: "Left atrium: 12.0 mm",
        observedAnchor: "Left atrium: 22.0 mm",
      })
    );
  });

  it("fails Impression citation verification when a diagnosis lacks grounding", () => {
    const result = verifyGeneratedImpressionCitations(
      "IMPRESSION\nMild ventriculomegaly is the leading consideration."
    );

    expect(result).toEqual({
      ok: false,
      failures: [
        {
          lineNumber: 2,
          line: "Mild ventriculomegaly is the leading consideration.",
        },
      ],
      fallback: "safe deterministic template",
    });
  });

  it("passes Impression citation verification for retrieved chunk IDs and PMID citations", () => {
    const result = verifyGeneratedImpressionCitations(
      [
        "IMPRESSION",
        "Mild ventriculomegaly is the leading consideration [pagani-2014-nd-delay].",
        "Recommend follow-up because related fetal MRI evidence is limited (PMID 30591508).",
      ].join("\n")
    );

    expect(result).toEqual({
      ok: true,
      failures: [],
      fallback: null,
    });
  });

  it("rejects bare numeric bracket citations as non-traceable Impression grounding", () => {
    const result = verifyGeneratedImpressionCitations(
      "IMPRESSION\nMild ventriculomegaly is the leading consideration [1]."
    );

    expect(result).toEqual({
      ok: false,
      failures: [
        {
          lineNumber: 2,
          line: "Mild ventriculomegaly is the leading consideration [1].",
        },
      ],
      fallback: "safe deterministic template",
    });
  });
});

describe("SPEC §4.11.5 accessible backend recommendations", () => {
  it("lists local zero-cost and free-tier cloud backend options without enabling network calls", () => {
    expect(GENAI_BACKENDS.local).toEqual(
      expect.arrayContaining([
        "llama.cpp",
        "Gemma 4 (4B)",
        "MedGemma 1.5",
        "Llama 4 Scout",
        "Phi-3.5-mini",
      ])
    );
    expect(GENAI_BACKENDS.freeTierCloud).toEqual(
      expect.arrayContaining([
        "Google AI Studio",
        "Groq Cloud",
        "Hugging Face Serverless Inference API",
        "OpenRouter",
      ])
    );
    expect(GENAI_BACKENDS.networkCallsEnabled).toBe(false);
  });
});
