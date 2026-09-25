import { useId, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_LABEL, PRIORITY_LABEL } from "@/components/ui/Pills";
import { useAnnounce } from "@/lib/a11y/announcer";
import { useFocusAfterRender } from "@/lib/a11y/focus";
import { formatDateOnly } from "@/lib/domain/dates";
import type { AssignmentChange } from "@/lib/domain/trip-state";
import type { ItemCategory, Place, Priority } from "@/lib/domain/types";
import { PLACEMENT_LABEL } from "@/lib/domain/vocabulary";
import { inboxOrder, selectInbox } from "@/lib/selectors";
import { useTrip } from "@/lib/state/TripProvider";
import { CaptureSheet } from "./inbox/CaptureSheet";
import { AssignedRow, InboxCard, assignControlId, cardId, undoControlId } from "./inbox/InboxCard";

const SAVE_BUTTON_ID = "save-a-place";
const nativeSelect = "flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 text-sm focus-ring";

interface Assigned {
  dayId: string;
  changes: AssignmentChange[];
}

/**
 * Inbox (RFC §11): what have I saved that isn't placed yet? Capture lives in a sheet; triage is
 * the list. An assigned card becomes an untimed "Assigned to … · Undo · Open day" row in place.
 */
export default function Inbox() {
  const { seed, state, dispatch } = useTrip();
  const announce = useAnnounce();
  const focusLater = useFocusAfterRender();
  const id = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | ItemCategory>("all");
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [capturing, setCapturing] = useState(false);
  const [assigned, setAssigned] = useState<Record<string, Assigned>>({});
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const closeFocus = useRef<string>(SAVE_BUTTON_ID);

  const inbox = selectInbox(state, seed);
  const daysById = new Map(seed.days.map((day) => [day.id, day]));
  const isRecentlyAssigned = (place: Place) => place.assignment !== null && assigned[place.id]?.dayId === place.assignment.dayId;
  const rows = inboxOrder(state.places.filter((place) => place.assignment === null || isRecentlyAssigned(place)));
  const needle = query.trim().toLowerCase();
  const visible = rows.filter(
    (place) =>
      (!needle || [place.name, place.area, place.city, place.notes].some((text) => (text ?? "").toLowerCase().includes(needle))) &&
      (category === "all" || place.category === category) &&
      (priority === "all" || place.priority === priority),
  );

  const assign = (place: Place, dayId: string, message?: (placement: string) => string) => {
    const effects = dispatch({ type: "assignToDay", placeId: place.id, dayId });
    const changes = effects.flatMap((effect) => (effect.type === "assignmentsChanged" ? effect.changes : []));
    const mine = changes.find((change) => change.placeId === place.id);
    if (!mine?.after) return;
    setAssigned((current) => ({ ...current, [place.id]: { dayId, changes } }));
    setHighlightId(null);
    const date = formatDateOnly(daysById.get(dayId)!.date, "EEE MMM d");
    const placement = PLACEMENT_LABEL[mine.after.placement].toLowerCase();
    announce(message ? message(`${date} as ${placement}`) : `Assigned ${place.name} to ${date} as ${placement}.`);
    focusLater(undoControlId(place.id));
  };

  const undo = (place: Place) => {
    const entry = assigned[place.id];
    if (!entry) return;
    const effects = dispatch({ type: "restoreAssignments", changes: entry.changes.map((change) => ({ placeId: change.placeId, assignment: change.before })) });
    setAssigned(({ [place.id]: _removed, ...rest }) => rest);
    if (effects[0]?.type === "rejected") {
      announce(`${place.name} can't be put back because that day has changed since.`);
      return;
    }
    announce(`${place.name} is back in the Inbox.`);
    focusLater(assignControlId(place.id));
  };

  const save = (place: Place, dayId: string | null) => {
    dispatch({ type: "addPlace", place });
    if (dayId) {
      closeFocus.current = undoControlId(place.id);
      assign(place, dayId, (where) => `Saved ${place.name} to ${where}.`);
    } else {
      closeFocus.current = cardId(place.id);
      setHighlightId(place.id);
      announce(`Saved ${place.name} to Inbox.`);
    }
    setCapturing(false);
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setPriority("all");
    focusLater(`${id}-search`);
  };

  return (
    <div className="space-y-8 page-enter">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl tracking-tight text-primary md:text-5xl">Inbox</h1>
          <p role="status" className="text-lg text-muted-foreground">
            {inbox.length === 0 ? "Nothing to sort" : `${inbox.length} to sort`}
          </p>
        </div>
        <Button
          id={SAVE_BUTTON_ID}
          size="lg"
          className="min-h-[44px] w-full gap-2 sm:w-auto"
          onClick={() => {
            closeFocus.current = SAVE_BUTTON_ID;
            setCapturing(true);
          }}
        >
          <Plus aria-hidden="true" className="h-4 w-4" /> Save a place
        </Button>
      </header>

      <div role="search" className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_180px]">
        <div className="space-y-1">
          <label htmlFor={`${id}-search`} className="text-sm font-medium text-foreground">
            Search
          </label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={`${id}-search`}
              type="search"
              placeholder="Name, area, city, or notes"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-[44px] bg-background pl-9"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor={`${id}-category`} className="text-sm font-medium text-foreground">
            Category
          </label>
          <select id={`${id}-category`} value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className={nativeSelect}>
            <option value="all">All categories</option>
            {(Object.entries(CATEGORY_LABEL) as [ItemCategory, string][]).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor={`${id}-priority`} className="text-sm font-medium text-foreground">
            Priority
          </label>
          <select id={`${id}-priority`} value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)} className={nativeSelect}>
            <option value="all">All priorities</option>
            {(Object.entries(PRIORITY_LABEL) as [Priority, string][]).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-border py-12 text-center text-muted-foreground">Everything has a day. Nice.</p>
      ) : visible.length === 0 ? (
        <div className="space-y-3 rounded-xl border-2 border-dashed border-border py-10 text-center">
          <p className="text-muted-foreground">No saved places match these filters.</p>
          <Button variant="outline" className="min-h-[44px]" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((place) => (
            <li key={place.id}>
              {isRecentlyAssigned(place) ? (
                <AssignedRow place={place} day={daysById.get(place.assignment!.dayId)!} onUndo={undo} />
              ) : (
                <InboxCard place={place} days={seed.days} highlighted={place.id === highlightId} onAssign={(target, dayId) => assign(target, dayId)} />
              )}
            </li>
          ))}
        </ul>
      )}

      <CaptureSheet
        open={capturing}
        days={seed.days}
        onSave={save}
        onClose={() => setCapturing(false)}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById(closeFocus.current)?.focus();
        }}
      />
    </div>
  );
}
