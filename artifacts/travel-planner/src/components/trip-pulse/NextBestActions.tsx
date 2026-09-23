import { Link } from "wouter";
import { ArrowRight, Anchor, Inbox, Gauge, Link2, Plane } from "lucide-react";
import { NextBestAction } from "@/lib/trip-metrics";

const ACTION_ICONS: Record<string, typeof Anchor> = {
  "missing-anchors": Anchor,
  "days-needing-logistics": Plane,
  "missing-bookings": Link2,
  "unsorted-inbox": Inbox,
  "overloaded-days": Gauge,
};

interface NextBestActionsProps {
  actions: NextBestAction[];
}

export function NextBestActions({ actions }: NextBestActionsProps) {
  if (actions.length === 0) {
    return (
      <section aria-labelledby="before-you-go-heading" className="space-y-3">
        <h2 id="before-you-go-heading" className="text-lg font-serif font-semibold text-foreground">
          Before you go
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No urgent planning tasks right now. Browse your journey or open Trip Mode when you are on the ground.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="before-you-go-heading" className="space-y-4">
      <div className="space-y-1">
        <h2 id="before-you-go-heading" className="text-lg font-serif font-semibold text-foreground">
          Before you go
        </h2>
        <p className="text-sm text-muted-foreground">
          A short list of planning steps to keep the trip feeling calm and ready.
        </p>
      </div>
      <ol className="space-y-3 list-none p-0 m-0">
        {actions.map((action, index) => {
          const Icon = ACTION_ICONS[action.id] ?? ArrowRight;
          return (
            <li key={action.id}>
              <Link
                href={action.href}
                className="group flex gap-4 rounded-xl border border-sc-status-attention-border/60 bg-card px-4 py-4 sm:px-5 transition-colors hover:bg-[hsl(var(--sc-raw-mist-lilac)/0.25)] hover:border-sc-status-attention-border focus-ring min-h-[44px]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--sc-raw-mist-lilac)/0.45)] text-primary text-sm font-bold font-serif">
                  {index + 1}
                </span>
                <span className="flex-1 min-w-0 space-y-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </span>
                    <Icon className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" aria-hidden="true" />
                  </span>
                  <span className="block text-sm text-muted-foreground leading-relaxed">
                    {action.reason}
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 shrink-0 text-muted-foreground self-center opacity-0 group-hover:opacity-100 motion-safe:transition-opacity" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
