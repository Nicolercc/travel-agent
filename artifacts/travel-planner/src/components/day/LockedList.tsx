import { Lock, Plane } from "lucide-react";
import { formatTimeOfDay } from "@/lib/domain/time";
import type { FixedEventView, LegView } from "@/lib/selectors";

function legTime(view: LegView): string | null {
  const { departure, arrival } = view.leg;
  if (view.relation === "arrives" && arrival) return `arrives ${formatTimeOfDay(arrival.time)}`;
  if (departure && arrival && view.relation === "within") return `${formatTimeOfDay(departure.time)} → ${formatTimeOfDay(arrival.time)}`;
  if (departure) return `departs ${formatTimeOfDay(departure.time)}`;
  return null;
}

/** Travel and appointments that shape the day but cannot be moved from here. */
export function LockedList({ legs, events }: { legs: LegView[]; events: FixedEventView[] }) {
  const timedLegs = legs.filter((view) => view.leg.departure || view.leg.arrival);
  const items = [
    ...timedLegs.map((view) => ({ key: view.leg.id, label: view.leg.label, time: legTime(view), travel: true })),
    ...events
      .filter((view) => view.event.kind !== "wake")
      .map((view) => ({
        key: view.event.id,
        label: view.event.title,
        time: view.event.window ? formatTimeOfDay(view.event.window.start) : null,
        travel: false,
      })),
  ];
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="locked-heading" className="space-y-3">
      <h2 id="locked-heading" className="flex items-center gap-2 text-lg font-serif font-semibold text-foreground">
        <Lock className="h-4 w-4 text-muted-foreground" /> Fixed today
      </h2>
      <ul className="divide-y divide-border/60 rounded-xl border border-border bg-card">
        {items.map((item) => (
          <li key={item.key} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              {item.travel && <Plane className="h-3.5 w-3.5 text-muted-foreground" />}
              {item.label}
            </span>
            {item.time && <span className="shrink-0 tabular-nums text-muted-foreground">{item.time}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
