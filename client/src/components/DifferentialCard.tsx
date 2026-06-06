/*
 * Differential-diagnosis card. Two presentations:
 *
 *   - <DifferentialCard dx={...} />            full expanded card (used for 0–2 firing cards)
 *   - <DifferentialRailItem dx selected onSel/> compact, ranked rail item (used for 3+ cards)
 *
 * Both variants share the same colour language: a left edge stripe whose
 * colour is driven by `severity`, and a small rank badge so radiologists
 * can scan the order at a glance.
 */
import { Differential } from "@/lib/biometry";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

const SEVERITY_LABEL: Record<Differential["severity"], string> = {
  urgent: "Urgent",
  concern: "Concern",
  watch: "Watch",
  info: "Note",
};

const SEVERITY_COLOR: Record<Differential["severity"], string> = {
  urgent: "var(--state-rare)",
  concern: "var(--state-watch)",
  watch: "var(--state-note)",
  info: "var(--ink-soft)",
};

/* ---------- Full expanded card ---------- */

export default function DifferentialCard({
  dx,
  rank,
}: {
  dx: Differential;
  /** 1-based rank within the firing cards. */
  rank?: number;
}) {
  const sev = SEVERITY_COLOR[dx.severity];
  return (
    <motion.article
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="relative bg-[color:var(--paper)] border border-[color:var(--rule)] rounded-sm p-4 pl-5 sm:p-5 sm:pl-6 overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: sev }}
      />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
        {rank != null && (
          <span
            className="inline-flex items-center justify-center text-[11px] font-numeric font-semibold px-1.5 min-w-[20px] h-[20px] rounded-sm text-white"
            style={{ background: sev }}
            aria-label={`Ranked #${rank}`}
          >
            {rank}
          </span>
        )}
        <span className="smallcaps" style={{ color: sev }}>
          {SEVERITY_LABEL[dx.severity]}
        </span>
        <span className="text-xs text-[color:var(--ink-soft)] sm:ml-auto font-numeric break-words min-w-0">
          Trigger: {dx.triggerLabel}
        </span>
      </div>
      {dx.sourceDisagreements && dx.sourceDisagreements.length > 0 && (
        <div className="mb-3 inline-flex flex-wrap gap-1.5 text-[11px] smallcaps text-[color:var(--state-rare)]">
          {dx.sourceDisagreements.map(item => (
            <a
              key={item.parameterId}
              href={`#source-breakdown-${item.parameterId}`}
              className="border border-[color:var(--state-rare)]/40 rounded-sm px-1.5 py-0.5"
            >
              Source disagreement: {item.parameterName} Delta z{" "}
              {item.disagreementWidth.toFixed(2)}
            </a>
          ))}
        </div>
      )}
      <h3 className="font-display text-[22px] leading-tight mb-2 text-[color:var(--ink)]">
        {dx.title}
      </h3>
      <p className="text-sm leading-relaxed text-[color:var(--ink-soft)] mb-4">
        {dx.summary}
      </p>

      <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
        <table className="min-w-[480px] w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[color:var(--rule)]">
              <th className="text-left smallcaps text-[color:var(--ink-soft)] py-1.5 font-normal">
                Diagnosis
              </th>
              <th className="text-left smallcaps text-[color:var(--ink-soft)] py-1.5 font-normal w-[24%]">
                Likelihood
              </th>
              <th className="text-left smallcaps text-[color:var(--ink-soft)] py-1.5 font-normal">
                Rationale
              </th>
            </tr>
          </thead>
          <tbody>
            {dx.rows.map((r, i) => (
              <tr
                key={i}
                className="border-b border-[color:var(--rule)] last:border-b-0 align-top"
              >
                <td className="py-2 pr-3 font-medium text-[color:var(--ink)]">
                  {r.dx}
                </td>
                <td className="py-2 pr-3 font-numeric text-[13px] text-[color:var(--ink)]">
                  {r.likelihood}
                </td>
                <td className="py-2 text-[color:var(--ink-soft)]">
                  {r.rationale}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="smallcaps text-[color:var(--teal)]">
            Recommended next steps
          </span>
          <p className="mt-1 text-[color:var(--ink)]">{dx.nextSteps}</p>
        </div>
        <div>
          <span className="smallcaps text-[color:var(--teal)]">
            Limitations
          </span>
          <p className="mt-1 text-[color:var(--ink-soft)]">{dx.limitations}</p>
        </div>
        <div className="pt-2 text-xs text-[color:var(--ink-soft)]">
          Primary:{" "}
          <a
            href={dx.primary.url}
            target="_blank"
            rel="noreferrer"
            className="cite"
          >
            {dx.primary.label}
          </a>{" "}
          — {dx.primary.full}
          {dx.secondary && (
            <>
              <br />
              Secondary:{" "}
              <a
                href={dx.secondary.url}
                target="_blank"
                rel="noreferrer"
                className="cite"
              >
                {dx.secondary.label}
              </a>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ---------- Compact rail item ---------- */

export function DifferentialRailItem({
  dx,
  rank,
  selected,
  onSelect,
}: {
  dx: Differential;
  rank: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const sev = SEVERITY_COLOR[dx.severity];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "group w-full text-left relative flex items-start gap-3 py-3 pr-3 pl-4 border-l-2 transition-colors",
        selected
          ? "bg-[color:var(--paper)] border-l-[color:var(--teal)]"
          : "bg-transparent border-l-transparent hover:bg-[color:var(--paper)]/60"
      )}
      aria-pressed={selected}
    >
      <span
        className="mt-[3px] inline-flex items-center justify-center text-[11px] font-numeric font-semibold px-1.5 min-w-[20px] h-[20px] rounded-sm text-white shrink-0"
        style={{ background: sev }}
      >
        {rank}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-medium text-[color:var(--ink)] leading-snug">
          {dx.title}
        </span>
        <span className="block mt-0.5 text-[11.5px] text-[color:var(--ink-soft)] leading-snug">
          {dx.oneLine}
        </span>
        <span className="block mt-1 text-[10.5px] font-numeric text-[color:var(--ink-soft)]">
          {dx.triggerLabel}
        </span>
        {dx.sourceDisagreements && dx.sourceDisagreements.length > 0 && (
          <span className="block mt-1 text-[10px] smallcaps text-[color:var(--state-rare)]">
            Source disagreement
          </span>
        )}
      </span>
      <ChevronRight
        className={clsx(
          "h-3.5 w-3.5 mt-1 shrink-0 transition-opacity",
          selected
            ? "opacity-100 text-[color:var(--teal)]"
            : "opacity-0 group-hover:opacity-50"
        )}
      />
    </button>
  );
}
