export type PlainTextClipboard = {
  writeText: (text: string) => Promise<void>;
};

export const copyReportPlainText = (
  report: string,
  clipboard: PlainTextClipboard = navigator.clipboard
): Promise<void> => clipboard.writeText(report);
