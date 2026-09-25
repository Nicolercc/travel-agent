import { Link } from "wouter";
import { Anchor, ArrowRight, MapPin, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerdictBadge } from "@/components/VerdictBadge";
import { formatDateOnly } from "@/lib/domain/dates";
import { formatTimeOfDay } from "@/lib/domain/time";
import type { DayView } from "@/lib/selectors";

export function DayPreview({ view }: { view: DayView }) {
  const { day, status, anchor, base } = view;
  const firstLeg = view.legs.find((leg) => leg.leg.departure || leg.leg.arrival);
  return (
    <div
      id={`day-preview-${day.id}`}
      role="tabpanel"
      aria-labelledby={`journey-tab-${day.id}`}
      className="sc-selected-day-surface relative overflow-hidden rounded-2xl px-5 py-6 sm:px-7 sm:py-8 shadow-sm"
    >
      <div className="space-y-5">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <time dateTime={day.date}>{formatDateOnly(day.date, "EEEE, MMM d")}</time>
            {base && (
              <>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                  <MapPin className="w-3 h-3" /> Sleeps in {base.city}
                </span>
              </>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary leading-tight">{day.title}</h3>
          <p className="font-serif italic text-foreground/80 text-sm sm:text-base leading-relaxed max-w-prose">{day.theme}</p>
        </header>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <VerdictBadge verdict={status.verdict} estimate={status.confidence === "estimate"} />
            {status.headline && <p className="text-sm text-muted-foreground">{status.headline}</p>}
          </div>
          {anchor ? (
            <p className="flex items-center gap-2 text-sm text-foreground">
              <Anchor className="w-4 h-4 text-primary" /> Anchor: <span className="font-serif font-semibold">{anchor.place.name}</span>
            </p>
          ) : firstLeg ? (
            <p className="flex items-center gap-2 text-sm text-foreground">
              <Plane className="w-4 h-4 text-primary" /> {firstLeg.leg.label}
              {firstLeg.relation !== "arrives" && firstLeg.leg.departure && ` · departs ${formatTimeOfDay(firstLeg.leg.departure.time)}`}
              {firstLeg.relation === "arrives" && firstLeg.leg.arrival && ` · arrives ${formatTimeOfDay(firstLeg.leg.arrival.time)}`}
            </p>
          ) : null}
          {status.openTasks > 0 && (
            <p className="text-sm text-sc-status-attention-fg">
              {status.openTasks === 1 ? "1 open task" : `${status.openTasks} open tasks`}
              {status.criticalTasks > 0 && ` (${status.criticalTasks} critical)`}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button asChild className="flex-1 min-h-[44px] gap-2">
            <Link href={`/day/${day.id}`}>
              Open day <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 min-h-[44px]">
            <Link href={`/trip-mode/${day.id}`}>Trip Mode</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
