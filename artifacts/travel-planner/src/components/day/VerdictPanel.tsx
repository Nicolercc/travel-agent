import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerdictBadge } from "@/components/VerdictBadge";
import type { DayLoad } from "@/lib/domain/day-load";
import { formatApproxDuration } from "@/lib/domain/time";
import { VERDICT_LABEL } from "@/lib/domain/vocabulary";

export const VERDICT_HEADING_ID = "verdict-heading";

interface VerdictPanelProps {
  load: DayLoad;
  onApplySuggestion: (placeId: string) => void;
}

/** Answers "Is this day realistic?" — a verdict word, the reasons, and the one change that helps most. */
export function VerdictPanel({ load, onApplySuggestion }: VerdictPanelProps) {
  const available = load.availableMinutes;
  const committed = load.committedMinutes;
  const valueText =
    available === 0
      ? "No free time today"
      : `${formatApproxDuration(committed)} planned of ${formatApproxDuration(available)} available`;
  return (
    <section aria-labelledby={VERDICT_HEADING_ID} className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id={VERDICT_HEADING_ID} tabIndex={-1} className="text-lg font-serif font-semibold text-foreground focus:outline-none">
          Is this day realistic?
        </h2>
        <VerdictBadge verdict={load.verdict} estimate={load.confidence === "estimate"} />
      </div>

      <div className="space-y-1">
        <label htmlFor="day-time-meter" className="text-sm text-muted-foreground">
          Time: {valueText}
        </label>
        <meter
          id="day-time-meter"
          className="block h-2 w-full"
          min={0}
          max={Math.max(available, 1)}
          low={Math.max(available, 1) * 0.6}
          high={Math.max(available, 1) * 0.85}
          optimum={0}
          value={Math.min(committed, Math.max(available, 1))}
          aria-valuetext={valueText}
        />
      </div>

      {load.reasons.length > 0 ? (
        <ul className="space-y-1 text-sm text-foreground/85 list-disc pl-5">
          {load.reasons.map((reason) => (
            <li key={reason.code}>{reason.message}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nothing stands out: there is room in this day.</p>
      )}

      {load.suggestion && (
        <div className="flex flex-col gap-3 rounded-xl bg-secondary/50 p-4 sm:flex-row sm:items-center">
          <p className="flex flex-1 items-start gap-2 text-sm text-foreground">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Moving <strong>{load.suggestion.label}</strong> to Optional would make this day{" "}
              <strong>{VERDICT_LABEL[load.suggestion.verdictAfter]}</strong>.
            </span>
          </p>
          <Button className="min-h-[44px]" onClick={() => onApplySuggestion(load.suggestion!.placeId)}>
            Move to Optional
          </Button>
        </div>
      )}
    </section>
  );
}
