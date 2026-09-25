import { Link } from "wouter";
import { Anchor, Check, MapPin } from "lucide-react";
import type { PlaceView, TripModeItem } from "@/lib/selectors";

interface PlanItemProps {
  item: TripModeItem;
  dayId: string;
  /** Backups for this plan (or the day's general ones), revealed when it is skipped. */
  backups: PlaceView[];
  fallbacks: string[];
  chosenBackupIds: readonly string[];
  onToggle: (item: TripModeItem, mark: "done" | "skipped") => void;
  onChooseBackup: (backup: PlaceView) => void;
}

const toggleClass = (active: boolean) =>
  `inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-medium focus-ring ${
    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"
  }`;

/**
 * One plan in Trip Mode. Module scope on purpose: an inline component would remount on every
 * toggle and drop keyboard focus. Button names carry the completion state (RFC §10).
 */
export function PlanItem({ item, dayId, backups, fallbacks, chosenBackupIds, onToggle, onChooseBackup }: PlanItemProps) {
  const done = item.mark === "done";
  const skipped = item.mark === "skipped";
  return (
    <li className="space-y-3 border-b border-border/60 px-4 py-4 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {item.anchor && (
            <p className="mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-primary">
              <Anchor aria-hidden="true" className="h-3 w-3" /> Anchor
            </p>
          )}
          <h3 className={`font-serif text-lg font-bold leading-snug ${done || skipped ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground">{[item.timeLabel, item.where].filter(Boolean).join(" · ")}</p>
          {done && <p className="text-xs font-medium text-sc-status-ready">Done</p>}
          {skipped && <p className="text-xs font-medium text-muted-foreground">Skipped</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={toggleClass(done)} aria-label={done ? `Undo done: ${item.title}` : `Mark ${item.title} done`} onClick={() => onToggle(item, "done")}>
          <Check aria-hidden="true" className="h-4 w-4" /> {done ? "Undo" : "Done"}
        </button>
        <button type="button" className={toggleClass(skipped)} aria-label={skipped ? `Unskip ${item.title}` : `Skip ${item.title}`} onClick={() => onToggle(item, "skipped")}>
          {skipped ? "Unskip" : "Skip"}
        </button>
        {item.mapsUrl && (
          <a href={item.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm text-primary underline-offset-4 hover:underline focus-ring">
            <MapPin aria-hidden="true" className="h-4 w-4" /> Open in Maps<span className="sr-only"> for {item.title} (opens in a new tab)</span>
          </a>
        )}
      </div>
      {skipped && (
        <div className="rounded-lg bg-secondary/50 p-3 text-sm">
          {backups.length > 0 ? (
            <>
              <p className="font-medium text-foreground">Backups for this:</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {backups.map((backup) => {
                  const chosen = chosenBackupIds.includes(backup.place.id);
                  return (
                    <li key={backup.place.id}>
                      <button type="button" aria-pressed={chosen} className={toggleClass(chosen)} onClick={() => onChooseBackup(backup)}>
                        {chosen ? `${backup.place.name} is next` : `Do ${backup.place.name} instead`}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p>
              No backup planned.{" "}
              <Link href={`/day/${dayId}`} className="font-medium text-primary underline underline-offset-4 focus-ring rounded">
                Replan in Day Builder
              </Link>
            </p>
          )}
          {fallbacks.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              {fallbacks.map((fallback) => (
                <li key={fallback}>{fallback}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
