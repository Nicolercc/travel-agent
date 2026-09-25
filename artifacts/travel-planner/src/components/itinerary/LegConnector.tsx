import { Bus, CableCar, Car, Footprints, Plane, Ship, TrainFront, type LucideIcon } from "lucide-react";
import { formatDateOnly } from "@/lib/domain/dates";
import { formatApproxDuration, formatTimeOfDay } from "@/lib/domain/time";
import type { TransportMode } from "@/lib/domain/types";
import { TRANSPORT_MODE_LABEL } from "@/lib/domain/vocabulary";
import type { ItineraryLeg } from "@/lib/selectors";

const MODE_ICON: Record<TransportMode, LucideIcon> = {
  flight: Plane,
  car: Car,
  train: TrainFront,
  funicular: CableCar,
  walk: Footprints,
  shuttle: Bus,
  ferry: Ship,
};

/** "dep 6:55 PM → arr 8:45 AM Jul 29 · about 7¾ hours", or as much of it as is known. */
export function legTimes({ leg, relation, durationMinutes }: ItineraryLeg): string {
  const departure = leg.departure ? `dep ${formatTimeOfDay(leg.departure.time)}` : null;
  const arrival = leg.arrival
    ? `arr ${formatTimeOfDay(leg.arrival.time)}${leg.departure && leg.arrival.date !== leg.departure.date ? ` ${formatDateOnly(leg.arrival.date, "MMM d")}` : ""}`
    : null;
  const times = [departure, arrival].filter(Boolean).join(" → ");
  const parts = [times || null, durationMinutes !== null ? formatApproxDuration(durationMinutes) : null];
  if (relation === "departs") parts.push("continues overnight");
  if (relation === "arrives") parts.push(`arrives, left ${formatDateOnly(leg.departure!.date, "MMM d")}`);
  return parts.filter(Boolean).join(" · ");
}

interface LegConnectorProps {
  legs: ItineraryLeg[];
  otherMoves: number;
  dateLabel: string;
}

/** The day's travel, drawn between day rows. Status is text ("unconfirmed"), never color alone. */
export function LegConnector({ legs, otherMoves, dateLabel }: LegConnectorProps) {
  if (legs.length === 0 && otherMoves === 0) return null;
  return (
    <ul aria-label={`Travel on ${dateLabel}`} className="ml-5 space-y-1.5 border-l-2 border-dashed border-border py-2 pl-5">
      {legs.map((legView) => {
        const Icon = MODE_ICON[legView.leg.mode];
        return (
          <li key={legView.leg.id} className="flex items-start gap-2 text-sm">
            <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
              <span className="sr-only">{TRANSPORT_MODE_LABEL[legView.leg.mode]}: </span>
              <span className="font-medium text-foreground">{legView.leg.label}</span>
              {legTimes(legView) && <span className="block text-xs text-muted-foreground">{legTimes(legView)}</span>}
              {legView.bookingState !== null && legView.bookingState !== "secured" && (
                <span className="block text-xs font-medium text-sc-status-attention-fg">unconfirmed</span>
              )}
            </span>
          </li>
        );
      })}
      {otherMoves > 0 && (
        <li className="text-xs text-muted-foreground">
          {legs.length > 0 ? "and " : ""}
          {otherMoves === 1 ? "1 local move" : `${otherMoves} local moves`} during the day
        </li>
      )}
    </ul>
  );
}
