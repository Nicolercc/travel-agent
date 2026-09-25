import { Link } from "wouter";
import { VerdictBadge } from "@/components/VerdictBadge";
import { formatDateOnly } from "@/lib/domain/dates";
import { DAY_TYPE_LABEL } from "@/lib/domain/vocabulary";
import type { DayView } from "@/lib/selectors";

export const dayRowId = (dayId: string) => `itinerary-row-${dayId}`;

/** Where the night is spent, in words. */
export function nightLabel({ day, base }: DayView): string {
  if (base) return `Sleeps in ${base.city}`;
  return day.dayType === "departure" ? "Flies home" : "Overnight in transit";
}

function criticalLabel(count: number): string | null {
  if (count === 0) return null;
  return count === 1 ? "1 critical task" : `${count} critical tasks`;
}

interface DayRowProps {
  view: DayView;
  selected: boolean;
  onSelect?: () => void;
}

/** One day in the timeline. A link: Enter selects the day and the URL changes (RFC §8). */
export function DayRow({ view, selected, onSelect }: DayRowProps) {
  const { day, status } = view;
  const date = formatDateOnly(day.date, "EEE MMM d");
  const critical = criticalLabel(status.criticalTasks);
  const verdict = `${status.verdictLabel}${status.confidence === "estimate" ? " estimate" : ""}`;
  const night = nightLabel(view);
  const name = [date, DAY_TYPE_LABEL[day.dayType], day.title, night[0].toLowerCase() + night.slice(1), verdict, critical].filter(Boolean).join(", ");
  return (
    <Link
      id={dayRowId(day.id)}
      href={`/itinerary/${day.id}`}
      aria-label={name}
      aria-current={selected ? "true" : undefined}
      onClick={onSelect}
      className={`block rounded-xl border p-4 transition-colors motion-reduce:transition-none focus-ring ${
        selected ? "sc-selected-day-surface" : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0 space-y-0.5">
          <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <time dateTime={day.date}>{formatDateOnly(day.date, "EEE, MMM d")}</time> · {DAY_TYPE_LABEL[day.dayType]}
          </span>
          <span className="block font-serif text-lg font-bold leading-snug text-foreground">{day.title}</span>
          <span className="block text-xs text-muted-foreground">{nightLabel(view)}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1.5">
          <VerdictBadge verdict={status.verdict} estimate={status.confidence === "estimate"} size="sm" />
          {critical && (
            <span className="rounded-full border border-sc-status-attention-border bg-sc-status-attention-bg px-2 py-0.5 text-[11px] font-semibold text-sc-status-attention-fg">
              {critical}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}
