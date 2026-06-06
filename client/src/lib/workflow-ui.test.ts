import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("SPEC §4.4 workflow controls", () => {
  it("uses the specified reset and copy workflow button labels", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Home.tsx"),
      "utf8"
    );

    expect(source).toContain("Clear All");
    expect(source).toContain("Copy to Clipboard");
  });

  it("places the report-panel copy action below the report preview", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Home.tsx"),
      "utf8"
    );
    const reportPanel = source.slice(source.indexOf("Structured report"));
    const previewIndex = reportPanel.indexOf("<textarea");
    const reportCopyIndex = reportPanel.indexOf(
      "Copy to Clipboard",
      previewIndex
    );

    expect(previewIndex).toBeGreaterThan(-1);
    expect(reportCopyIndex).toBeGreaterThan(previewIndex);
  });

  it("renders the structured report preview as a read-only text box", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/pages/Home.tsx"),
      "utf8"
    );
    const reportPanel = source.slice(source.indexOf("Structured report"));

    expect(reportPanel).toContain("<textarea");
    expect(reportPanel).toContain("readOnly");
    expect(reportPanel).toContain("value={report}");
  });
});
