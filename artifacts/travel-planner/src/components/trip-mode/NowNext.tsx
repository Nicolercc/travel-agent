import { MapPin } from "lucide-react";
import type { TripModeItem } from "@/lib/selectors";

export const NEXT_HEADING_ID = "next-heading";

function ItemDetails({ item }: { item: TripModeItem }) {
  return (
    <div className="space-y-1">
      <p className="font-serif text-xl font-bold leading-snug text-foreground">
        {item.title}
        {item.anchor && <span className="ml-2 align-middle text-xs font-semibold uppercase tracking-widest text-primary">Anchor</span>}
      </p>
      <p className="text-sm text-muted-foreground">{[item.timeLabel, item.where].filter(Boolean).join(" · ")}</p>
      {item.steps.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-foreground/85">
          {item.steps.map((step) => (
            <li key={step.id}>{step.label}</li>
          ))}
        </ul>
      )}
      {item.mapsUrl && (
        <a href={item.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-ring rounded">
          <MapPin aria-hidden="true" className="h-4 w-4" /> Open in Maps<span className="sr-only"> for {item.title} (opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}

interface NowNextProps {
  now: TripModeItem | null;
  next: TripModeItem | null;
  previewing: boolean;
}

/** "What do I need right now?" — the item under way and the one after it. */
export function NowNext({ now, next, previewing }: NowNextProps) {
  return (
    <section aria-label="Now and next" className="space-y-5 rounded-2xl border border-border bg-card p-5">
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Now</h2>
        {now ? (
          <ItemDetails item={now} />
        ) : (
          <p className="text-sm text-muted-foreground">{previewing ? "Nothing yet: this day hasn't started." : "Nothing scheduled right now."}</p>
        )}
      </div>
      <div className="space-y-2 border-t border-border/60 pt-4">
        <h2 id={NEXT_HEADING_ID} tabIndex={-1} className="text-xs font-bold uppercase tracking-widest text-muted-foreground focus:outline-none">
          Next
        </h2>
        {next ? <ItemDetails item={next} /> : <p className="text-sm text-muted-foreground">Nothing else planned today.</p>}
      </div>
    </section>
  );
}
