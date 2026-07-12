import { Link } from "wouter";
import { LogisticsItem, TripDay } from "@/types";
import { DayPreviewSnapshot } from "@/lib/trip-metrics";
import { formatDateOnly } from "@/lib/dates";
import {
  dayHasSecuredLogistics,
  isLogisticsPrimaryDayKind,
  logisticsForDay,
} from "@/lib/day-readiness";
import { isLogisticsItemSecured } from "@/lib/booking-readiness";
import { Button } from "@/components/ui/button";
import { Anchor, ArrowRight, Luggage, MapPin } from "lucide-react";

interface DayPreviewProps {
  day: TripDay;
  snapshot: DayPreviewSnapshot;
  logistics: LogisticsItem[];
}

export function DayPreview({ day, snapshot, logistics }: DayPreviewProps) {
  const isLogisticsDay = isLogisticsPrimaryDayKind(day.day_kind);
  const dayLogistics = logisticsForDay(day, logistics);
  const logisticsReady = dayHasSecuredLogistics(day, logistics);

  return (
    <article
      id={`day-preview-${day.id}`}
      role="tabpanel"
      aria-labelledby={`journey-tab-${day.id}`}
      className="sc-selected-day-surface relative overflow-hidden rounded-2xl px-5 py-6 sm:px-7 sm:py-8 shadow-sm"
    >
      <div className="space-y-5">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <time dateTime={day.date}>{formatDateOnly(day.date, "EEEE, MMM d")}</time>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--sc-raw-mist-lilac)/0.5)] px-2 py-0.5 text-sc-route-label normal-case tracking-normal">
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {day.city}
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary leading-tight">
            {day.title}
          </h3>
          {day.day_vibe && (
            <p className="font-serif italic text-foreground/80 text-sm sm:text-base leading-relaxed max-w-prose">
              "{day.day_vibe}"
            </p>
          )}
        </header>

        <div className="space-y-3">
          {isLogisticsDay ? (
            dayLogistics.length > 0 ? (
              <div className="rounded-xl bg-card border border-border/50 px-4 py-3 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Luggage className="w-3.5 h-3.5" aria-hidden="true" />
                  Travel logistics
                </p>
                <ul className="space-y-1.5">
                  {dayLogistics.map((item) => (
                    <li key={item.id} className="text-sm text-foreground flex justify-between gap-3">
                      <span>{item.title}</span>
                      <span className={isLogisticsItemSecured(item) ? "text-sc-status-ready text-xs" : "text-sc-status-attention-fg text-xs"}>
                        {isLogisticsItemSecured(item) ? "Secured" : "Needs details"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="sc-attention-panel">
                No logistics are scheduled on this date yet — add flights, stays, or transport in Travel wallet.
              </p>
            )
          ) : snapshot.anchor ? (
            <div className="flex items-start gap-3 rounded-xl bg-card border border-border/50 px-4 py-3">
              <Anchor className="w-4 h-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Anchor
                </p>
                <p className="font-serif font-semibold text-foreground">{snapshot.anchor.name}</p>
                {snapshot.anchor.time && (
                  <p className="text-xs text-muted-foreground mt-0.5">{snapshot.anchor.time}</p>
                )}
              </div>
            </div>
          ) : snapshot.isAnchorExpected ? (
            <p className="sc-attention-panel">
              No anchor set yet — choose one defining activity for this day.
            </p>
          ) : null}

          {!isLogisticsDay && (
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-card border border-border/40 py-2.5 px-2">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Booked</dt>
                <dd className="font-serif text-xl font-bold text-foreground">{snapshot.bookedCount}</dd>
              </div>
              <div className="rounded-lg bg-card border border-border/40 py-2.5 px-2">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Planned</dt>
                <dd className="font-serif text-xl font-bold text-foreground">{snapshot.plannedCount}</dd>
              </div>
              <div className="rounded-lg bg-card border border-border/40 py-2.5 px-2">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Optional</dt>
                <dd className="font-serif text-xl font-bold text-foreground">{snapshot.optionalCount}</dd>
              </div>
            </dl>
          )}

          {isLogisticsDay && !logisticsReady && dayLogistics.length > 0 && (
            <p className="text-xs text-sc-status-attention-fg">
              At least one booking on this day still needs a confirmation or link.
            </p>
          )}

          {snapshot.isOverloaded && (
            <p className="text-xs text-sc-status-attention-fg">
              This day has more than six active items — consider moving some to backup.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button asChild className="flex-1 min-h-[44px] gap-2">
            <Link href={`/day/${day.id}`}>
              Continue planning <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 min-h-[44px]">
            <Link href={`/trip-mode/${day.id}`}>Preview Trip Mode</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
