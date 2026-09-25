import { Link } from "wouter";
import { ExternalLink, MapPin, Undo2 } from "lucide-react";
import { CategoryPill, PriorityPill } from "@/components/ui/Pills";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SOURCE_LABEL, parseCaptureLink, sourceTypeOf } from "@/lib/domain/capture";
import { formatDateOnly } from "@/lib/domain/dates";
import type { Day, Place } from "@/lib/domain/types";

export const cardId = (placeId: string) => `inbox-card-${placeId}`;
export const assignControlId = (placeId: string) => `assign-${placeId}`;
export const undoControlId = (placeId: string) => `undo-${placeId}`;

const dayLabel = (day: Day) => `${formatDateOnly(day.date, "EEE MMM d")} · ${day.title}`;

interface InboxCardProps {
  place: Place;
  days: Day[];
  highlighted: boolean;
  onAssign: (place: Place, dayId: string) => void;
}

/** An unsorted save: name → where → priority → notes → assign (RFC §5 hierarchy). */
export function InboxCard({ place, days, highlighted, onAssign }: InboxCardProps) {
  const url = place.sourceUrl ? parseCaptureLink(place.sourceUrl) : null;
  return (
    <article
      id={cardId(place.id)}
      tabIndex={-1}
      aria-labelledby={`${cardId(place.id)}-name`}
      className={`flex flex-col gap-3 rounded-xl border bg-card p-5 focus-ring ${highlighted ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${cardId(place.id)}-name`} className="font-serif text-lg font-bold text-foreground">
            {place.name}
          </h2>
          {(place.area || place.city) && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="h-3 w-3" /> {[place.area, place.city].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <PriorityPill priority={place.priority} />
          <CategoryPill category={place.category} />
        </div>
      </div>
      {place.notes && <p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">{place.notes}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
        <Select onValueChange={(dayId) => onAssign(place, dayId)}>
          <SelectTrigger id={assignControlId(place.id)} aria-label={`Assign ${place.name} to a day`} className="min-h-[44px] w-full bg-background sm:w-[220px]">
            <SelectValue placeholder="Assign to a day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((day) => (
              <SelectItem key={day.id} value={day.id}>
                {dayLabel(day)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {url && (
          <a href={url.toString()} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-1 rounded text-sm text-muted-foreground hover:text-foreground focus-ring">
            {SOURCE_LABEL[sourceTypeOf(url)]} source <ExternalLink aria-hidden="true" className="h-3 w-3" />
            <span className="sr-only"> for {place.name} (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}

interface AssignedRowProps {
  place: Place;
  day: Day;
  onUndo: (place: Place) => void;
}

/** What a card becomes once assigned. It stays until the traveler leaves (no timeout: WCAG 2.2.1). */
export function AssignedRow({ place, day, onUndo }: AssignedRowProps) {
  return (
    <div id={cardId(place.id)} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-2 text-sm">
      <p className="min-w-0 flex-1">
        <span className="font-medium text-foreground">{place.name}</span>{" "}
        <span className="text-muted-foreground">· Assigned to {formatDateOnly(day.date, "EEE MMM d")}</span>
      </p>
      <button
        id={undoControlId(place.id)}
        type="button"
        onClick={() => onUndo(place)}
        aria-label={`Undo: put ${place.name} back in the Inbox`}
        className="inline-flex min-h-[44px] items-center gap-1 rounded px-2 font-medium text-primary focus-ring"
      >
        <Undo2 aria-hidden="true" className="h-4 w-4" /> Undo
      </button>
      <Link href={`/day/${day.id}`} className="inline-flex min-h-[44px] items-center rounded px-2 font-medium text-primary underline-offset-4 hover:underline focus-ring">
        Open day
      </Link>
    </div>
  );
}
