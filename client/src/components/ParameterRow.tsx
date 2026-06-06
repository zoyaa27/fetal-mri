/*
 * Design: "Editorial Clinical" — parameter row as a journal entry.
 *   [label + info marginalia]  [input mm]  [z bell]  [z value]  [percentile]
 * Hairline bottom border. No rounded cards. Serif emphasizes label name.
 */
import {
  Parameter,
  ZResult,
  formatPct,
  formatZ,
  sourceRegistryFor,
} from "@/lib/biometry";
import ZScoreBar from "./ZScoreBar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  param: Parameter;
  value: number | null;
  zr: ZResult | null;
  onChange: (v: number | null) => void;
  ga: { weeks: number; days: number };
};

const BAND_LABEL: Record<NonNullable<ZResult>["band"], string> = {
  normal: "Within central 68%",
  note: "Worth noting",
  watch: "Uncommon — closer look",
  rare: "Rare — further evaluation",
};

const BAND_TEXT_COLOR: Record<NonNullable<ZResult>["band"], string> = {
  normal: "text-[color:var(--state-normal)]",
  note: "text-[color:var(--state-note)]",
  watch: "text-[color:var(--state-watch)]",
  rare: "text-[color:var(--state-rare)]",
};

export default function ParameterRow({ param, value, zr, onChange }: Props) {
  const sourceCount =
    zr?.sourceDetails.length ?? sourceRegistryFor(param).length;
  const unitLabel = param.unit === "degrees" ? "deg" : "mm";
  const agreementLabel = zr
    ? zr.disagreementWidth == null
      ? zr.agreementState
      : `${zr.agreementState} Delta z ${zr.disagreementWidth.toFixed(2)}`
    : null;

  return (
    <div className="grid grid-cols-12 gap-x-3 gap-y-2 items-center py-3 border-b border-[color:var(--rule)]">
      {/* Name + tooltip */}
      <div className="col-span-12 md:col-span-5 flex items-start gap-2">
        <div className="min-w-0">
          <div className="font-display text-[17px] leading-tight text-[color:var(--ink)]">
            {param.name}
          </div>
          <div className="text-[11px] smallcaps text-[color:var(--ink-soft)] mt-1">
            {param.group} · {param.short} ·
            <span
              className="ml-1 text-[color:var(--teal)]"
              title="Runtime scoring uses all applicable source-registry entries"
            >
              {sourceCount} source{sourceCount === 1 ? "" : "s"}
            </span>
            {agreementLabel && (
              <span
                className={`ml-2 ${
                  zr?.agreementState === "disagree"
                    ? "text-[color:var(--state-rare)]"
                    : "text-[color:var(--ink-soft)]"
                }`}
              >
                {agreementLabel}
              </span>
            )}
          </div>
        </div>
        <HoverCard openDelay={120} closeDelay={80}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="opacity-60 hover:opacity-100 transition-opacity mt-0.5"
              aria-label={`About ${param.name}`}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </HoverCardTrigger>
          <HoverCardContent
            side="right"
            align="start"
            className="w-96 bg-[color:var(--paper)] border-[color:var(--rule)] text-[color:var(--ink)] shadow-[0_1px_0_var(--rule),0_20px_40px_-20px_rgba(20,24,31,0.25)]"
          >
            <div className="space-y-2 text-sm leading-relaxed">
              <div className="smallcaps text-[color:var(--teal)]">
                Definition
              </div>
              <p>{param.definition}</p>
              <div className="smallcaps text-[color:var(--teal)]">
                How to measure
              </div>
              <p>{param.measurement}</p>
              <div className="smallcaps text-[color:var(--teal)]">
                Clinical significance
              </div>
              <p>{param.significance}</p>
              <div className="smallcaps text-[color:var(--teal)]">Source</div>
              <p className="text-xs">
                <a
                  href={param.primary.url}
                  target="_blank"
                  rel="noreferrer"
                  className="cite"
                >
                  {param.primary.label}
                </a>{" "}
                — {param.primary.full}
              </p>
              {param.secondary && (
                <p className="text-xs text-[color:var(--ink-soft)]">
                  Cross-validated against:{" "}
                  <a
                    href={param.secondary.url}
                    target="_blank"
                    rel="noreferrer"
                    className="cite"
                  >
                    {param.secondary.label}
                  </a>
                </p>
              )}
              <p className="text-[11px] smallcaps text-[color:var(--ink-soft)] pt-1">
                Validated GA range: {param.gaRange[0]}–{param.gaRange[1]} weeks
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      {/* Measurement input */}
      <div className="col-span-4 md:col-span-2">
        <div className="flex items-baseline gap-1">
          <input
            inputMode="decimal"
            placeholder="—"
            value={value ?? ""}
            onChange={e => {
              const raw = e.target.value.trim();
              if (raw === "") return onChange(null);
              const n = parseFloat(raw);
              onChange(Number.isFinite(n) ? n : null);
            }}
            className="font-numeric text-[17px] w-full bg-transparent border-0 border-b border-[color:var(--rule)] focus:border-[color:var(--teal)] outline-none px-0.5 py-1 text-right tracking-tight text-[color:var(--ink)] placeholder:text-[color:var(--ink-soft)]/40"
          />
          <span className="text-[11px] smallcaps text-[color:var(--ink-soft)]">
            {unitLabel}
          </span>
        </div>
      </div>

      {/* Bell-curve glyph */}
      <div className="col-span-3 md:col-span-2 flex justify-center">
        <ZScoreBar z={zr?.z ?? null} band={zr?.band ?? null} compact />
      </div>

      {/* Z + percentile */}
      <div className="col-span-5 md:col-span-3 text-right">
        {zr ? (
          <motion.div
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-0.5"
          >
            <div
              className={`font-numeric text-[15px] ${BAND_TEXT_COLOR[zr.band]}`}
            >
              z {formatZ(zr.z)} · {formatPct(zr.percentile)}
            </div>
            <div className="text-[11px] smallcaps text-[color:var(--ink-soft)]">
              {BAND_LABEL[zr.band]}
              {zr.extrapolated && (
                <span className="ml-1 text-[color:var(--state-watch)]">
                  · GA outside validated range
                </span>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="text-[11px] smallcaps text-[color:var(--ink-soft)]/60">
            awaiting input
          </div>
        )}
      </div>

      {zr && (
        <details
          id={`source-breakdown-${param.id}`}
          open={zr.agreementState === "disagree"}
          className="col-span-12 text-[11px] text-[color:var(--ink-soft)]"
        >
          <summary className="cursor-pointer smallcaps text-[color:var(--teal)]">
            {sourceCount} source{sourceCount === 1 ? "" : "s"} breakdown
          </summary>
          <div className="mt-2 grid gap-1">
            {zr.sourceDetails.map(source => (
              <div key={source.sourceLabel} className="font-numeric">
                <span className="text-[color:var(--ink)]">
                  {source.sourceLabel}
                </span>
                {": "}z {formatZ(source.z)} · {formatPct(source.percentile)} ·
                mu {source.mu.toFixed(2)} · sigma {source.sigma.toFixed(2)} ·{" "}
                {source.inRange
                  ? `in range ${source.gaRange[0]}-${source.gaRange[1]}w`
                  : `extrapolated ${source.gaRange[0]}-${source.gaRange[1]}w`}
                {source.crossModality && (
                  <span className="text-[color:var(--state-watch)]">
                    {" "}
                    · cross-modality
                  </span>
                )}
                {source.verificationTier && (
                  <span>
                    {" "}
                    · verification {source.verificationTier}
                    {source.verificationDate
                      ? ` (${source.verificationDate})`
                      : ""}
                  </span>
                )}
                {source.caveat && (
                  <div className="mt-1 font-sans text-[11px] leading-snug text-[color:var(--state-watch)]">
                    Caveat: {source.caveat}
                  </div>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
