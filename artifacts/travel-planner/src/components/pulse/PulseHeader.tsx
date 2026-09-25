import { formatDateOnly } from "@/lib/domain/dates";
import type { TripPhaseInfo } from "@/lib/domain/trip-phase";
import type { Trip } from "@/lib/domain/types";

interface PulseHeaderProps {
  trip: Trip;
  route: string[];
  phase: TripPhaseInfo;
  demoDate: Date;
}

/** One line of context, so "Needs you" is above the fold. */
export function PulseHeader({ trip, route, phase, demoDate }: PulseHeaderProps) {
  return (
    <header className="space-y-1">
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Trip Pulse</h1>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{trip.title}</span> · {route.join(" → ")} ·{" "}
        <time dateTime={`${trip.startDate}/${trip.endDate}`}>
          {formatDateOnly(trip.startDate, "MMM d")} – {formatDateOnly(trip.endDate, "MMM d")}
        </time>{" "}
        · <span className="font-medium text-primary">{phase.label}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Demo date: {demoDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
      </p>
    </header>
  );
}
