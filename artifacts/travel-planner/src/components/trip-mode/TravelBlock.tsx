import { CopyButton } from "@/components/CopyButton";
import type { TravelEntry } from "@/lib/selectors";

/** Today's travel (RFC §10): legs and appointments touching the day, with times, places, and confirmations to copy. */
export function TravelBlock({ entries }: { entries: TravelEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section aria-labelledby="travel-heading" className="space-y-3">
      <h2 id="travel-heading" className="font-serif text-xl font-semibold text-foreground">
        Today's travel
      </h2>
      <ul className="divide-y divide-border/60 rounded-2xl border border-border bg-card">
        {entries.map((entry) => (
          <li key={entry.id} className="space-y-1.5 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium text-foreground">{entry.title}</p>
              {entry.time && <p className="shrink-0 text-sm tabular-nums text-muted-foreground">{entry.time}</p>}
            </div>
            <p className="text-sm text-muted-foreground">{entry.where}</p>
            {entry.steps.length > 0 && (
              <ul className="list-disc pl-5 text-sm text-foreground/85">
                {entry.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            )}
            {entry.booking?.confirmation && entry.bookingState === "secured" ? (
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">{entry.booking.provider} confirmation</span>
                <CopyButton value={entry.booking.confirmation} label={`${entry.title} confirmation`} />
              </p>
            ) : entry.booking ? (
              <p className="text-sm font-medium text-sc-status-attention-fg">Needs confirmation</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
