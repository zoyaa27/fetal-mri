import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("SPEC §7.5 row-level source detail disclosure", () => {
  it("renders verification metadata and caveat fields from source details", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/ParameterRow.tsx"),
      "utf8"
    );

    expect(source).toContain("source.verificationTier");
    expect(source).toContain("source.verificationDate");
    expect(source).toContain("source.caveat");
  });

  it("links differential source-disagreement badges to row source breakdowns", () => {
    const rowSource = readFileSync(
      resolve(process.cwd(), "client/src/components/ParameterRow.tsx"),
      "utf8"
    );
    const cardSource = readFileSync(
      resolve(process.cwd(), "client/src/components/DifferentialCard.tsx"),
      "utf8"
    );

    expect(rowSource).toContain("source-breakdown-${param.id}");
    expect(cardSource).toContain("#source-breakdown-${item.parameterId}");
  });

  it("opens the row source breakdown by default for disagreeing rows", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/ParameterRow.tsx"),
      "utf8"
    );

    expect(source).toContain('open={zr.agreementState === "disagree"}');
  });

  it("labels the clickable source breakdown affordance with the source count", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/ParameterRow.tsx"),
      "utf8"
    );
    const summarySource = source.slice(
      source.indexOf("<summary"),
      source.indexOf("</summary>")
    );

    expect(summarySource).toContain("{sourceCount} source");
    expect(summarySource).toContain("breakdown");
  });
});
