import { Info } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { QualitativeFinding } from "@/lib/biometry";

type Props = {
  finding: QualitativeFinding;
  value: number | null;
  onChange: (v: number | null) => void;
};

export default function QualitativeFindingRow({
  finding,
  value,
  onChange,
}: Props) {
  const checked = (value ?? 0) > 0;

  return (
    <div className="grid grid-cols-12 gap-x-3 gap-y-2 items-center py-3 border-b border-[color:var(--rule)] bg-[color:var(--paper)]/25">
      <div className="col-span-12 md:col-span-5 flex items-start gap-2">
        <div className="min-w-0">
          <div className="font-display text-[17px] leading-tight text-[color:var(--ink)]">
            {finding.name}
          </div>
          <div className="text-[11px] smallcaps text-[color:var(--ink-soft)] mt-1">
            {finding.group} · {finding.short} · qualitative/context
          </div>
        </div>
        <HoverCard openDelay={120} closeDelay={80}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="opacity-60 hover:opacity-100 transition-opacity mt-0.5"
              aria-label={`About ${finding.name}`}
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
              <div className="smallcaps text-[color:var(--teal)]">Finding</div>
              <p>{finding.finding}</p>
              <div className="smallcaps text-[color:var(--teal)]">
                Clinical significance
              </div>
              <p>{finding.significance}</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="col-span-4 md:col-span-2 flex justify-end">
        <Checkbox
          checked={checked}
          onCheckedChange={state => onChange(state === true ? 1 : null)}
          aria-label={finding.name}
          className="mt-1"
        />
      </div>

      <div className="col-span-3 md:col-span-2 text-center text-[11px] smallcaps text-[color:var(--ink-soft)]">
        binary
      </div>

      <div className="col-span-5 md:col-span-3 text-right text-[11px] smallcaps text-[color:var(--ink-soft)]">
        {checked ? "entered" : "not entered"}
      </div>
    </div>
  );
}
