import { createElement } from "react";
import { Link } from "wouter";
import { Anchor, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerdictBadge } from "@/components/VerdictBadge";
import { formatDateOnly } from "@/lib/domain/dates";
import { formatTimeOfDay } from "@/lib/domain/time";
import type { ItineraryDay } from "@/lib/selectors";
import { nightLabel } from "./DayRow";

interface DayPanelProps {
  item: ItineraryDay;
  headingLevel: 1 | 2 | 3;
  headingId: string;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** The selected day at a glance (RFC §8): verdict and reasons, fixed times, anchor, key tasks, and the two ways in. */
export function DayPanel({ item, headingLevel, headingId }: DayPanelProps) {
  const { day, status, load, anchor, planned, optional, fixedEvents, openTasks } = item.view;
  const events = fixedEvents.filter(({ event }) => event.kind !== "wake");
  const keyTasks = openTasks.filter((task) => task.priority === "critical" || task.priority === "high");
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <time dateTime={day.date}>{formatDateOnly(day.date, "EEEE, MMMM d")}</time> · {nightLabel(item.view)}
        </p>
        {createElement(
          `h${headingLevel}`,
          { id: headingId, tabIndex: -1, className: "font-serif text-2xl font-bold leading-tight text-primary focus:outline-none" },
          day.title,
        )}
      </header>

      <div className="space-y-2">
        <VerdictBadge verdict={status.verdict} estimate={status.confidence === "estimate"} />
        {load.reasons.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
            {load.reasons.map((reason) => (
              <li key={reason.code}>{reason.message}</li>
            ))}
          </ul>
        )}
      </div>

      {events.length > 0 && (
        <ul aria-label="Fixed times" className="divide-y divide-border/60 rounded-xl border border-border bg-card text-sm">
          {events.map(({ event }) => (
            <li key={event.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <span>{event.title}</span>
              {event.window && (
                <span className="inline-flex shrink-0 items-center gap-1 tabular-nums text-muted-foreground">
                  <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                  {formatTimeOfDay(event.window.start)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Anchor</dt>
        <dd className="flex items-center gap-1.5">
          {anchor ? (
            <>
              <Anchor aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
              <span className="font-serif font-semibold">{anchor.place.name}</span>
            </>
          ) : status.needsAnchor ? (
            <span className="text-sc-status-attention-fg">None yet</span>
          ) : (
            <span className="text-muted-foreground">Not needed on a travel day</span>
          )}
        </dd>
        <dt className="text-muted-foreground">Plans</dt>
        <dd>
          {plural(planned.length, "planned stop")}
          {optional.length > 0 && `, ${optional.length} optional`}
        </dd>
      </dl>

      {keyTasks.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">Critical and high-priority tasks</p>
          <ul className="space-y-1 text-sm">
            {keyTasks.map((task) => (
              <li key={task.id} className="flex gap-2">
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-sc-status-attention-fg">{task.priority}</span>
                <span>{task.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="min-h-[44px] flex-1">
          <Link href={`/day/${day.id}`}>Plan this day</Link>
        </Button>
        <Button asChild variant="outline" className="min-h-[44px] flex-1">
          <Link href={`/trip-mode/${day.id}`}>Start Trip Mode</Link>
        </Button>
      </div>
    </div>
  );
}
