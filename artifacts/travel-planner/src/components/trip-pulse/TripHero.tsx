import { Trip } from "@/types";
import { formatDateOnly } from "@/lib/dates";
import { TripPhaseInfo } from "@/lib/trip-metrics";
import { RouteVisualization } from "./RouteVisualization";

interface TripHeroProps {
  trip: Trip;
  phase: TripPhaseInfo;
}

export function TripHero({ trip, phase }: TripHeroProps) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-card px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10"
      aria-labelledby="trip-pulse-heading"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(200px,280px)] lg:items-end">
        <div className="space-y-4 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trip Pulse
          </p>
          <h1
            id="trip-pulse-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight"
          >
            {trip.title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            {trip.route}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <time dateTime={`${trip.start_date}/${trip.end_date}`}>
              {formatDateOnly(trip.start_date, "MMM d")} –{" "}
              {formatDateOnly(trip.end_date, "MMM d, yyyy")}
            </time>
            <span className="hidden sm:inline text-border">·</span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                phase.phase === "traveling"
                  ? "bg-sc-status-ready-surface text-sc-status-ready"
                  : phase.phase === "completed"
                    ? "bg-secondary text-muted-foreground"
                    : "bg-[hsl(var(--sc-raw-mist-lilac)/0.45)] text-primary"
              }`}
            >
              {phase.label}
            </span>
          </div>
        </div>

        <RouteVisualization route={trip.route} className="lg:pt-2" />
      </div>
    </section>
  );
}
