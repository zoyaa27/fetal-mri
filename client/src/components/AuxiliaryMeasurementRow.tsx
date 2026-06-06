import { AuxiliaryMeasurement } from "@/lib/biometry";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

type Props = {
  field: AuxiliaryMeasurement;
  value: number | null;
  onChange: (v: number | null) => void;
};

export default function AuxiliaryMeasurementRow({
  field,
  value,
  onChange,
}: Props) {
  const unitLabel = field.unit === "degrees" ? "deg" : "mm";

  return (
    <div className="grid grid-cols-12 gap-x-3 gap-y-2 items-center py-3 border-b border-[color:var(--rule)] bg-[color:var(--paper)]/35">
      <div className="col-span-12 md:col-span-5 flex items-start gap-2">
        <div className="min-w-0">
          <div className="font-display text-[17px] leading-tight text-[color:var(--ink)]">
            {field.name}
          </div>
          <div className="text-[11px] smallcaps text-[color:var(--ink-soft)] mt-1">
            {field.group} · {field.short} · auxiliary input
          </div>
        </div>
        <HoverCard openDelay={120} closeDelay={80}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="opacity-60 hover:opacity-100 transition-opacity mt-0.5"
              aria-label={`About ${field.name}`}
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
              <p>{field.definition}</p>
              <div className="smallcaps text-[color:var(--teal)]">
                How to measure
              </div>
              <p>{field.measurement}</p>
              <div className="smallcaps text-[color:var(--teal)]">
                Clinical significance
              </div>
              <p>{field.significance}</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

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

      <div className="col-span-3 md:col-span-2 text-center text-[11px] smallcaps text-[color:var(--ink-soft)]">
        raw threshold
      </div>

      <div className="col-span-5 md:col-span-3 text-right text-[11px] smallcaps text-[color:var(--ink-soft)]">
        {value == null ? "awaiting input" : "entered"}
      </div>
    </div>
  );
}
