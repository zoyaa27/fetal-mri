import { describe, expect, it, vi } from "vitest";

import { copyReportPlainText } from "./clipboard";

describe("SPEC §4.8 plain-text clipboard export", () => {
  it("writes the report through text/plain clipboard semantics and preserves line breaks", async () => {
    const writeText = vi.fn<[(text: string) => Promise<void>]>(() =>
      Promise.resolve()
    );
    const report =
      "FINDINGS\n  • Atrial diameter: 11.0 mm\n\nIMPRESSION\nNo PHI.";

    await copyReportPlainText(report, { writeText });

    expect(writeText).toHaveBeenCalledWith(report);
    expect(writeText.mock.calls[0][0]).toContain("\n\nIMPRESSION\n");
  });
});
