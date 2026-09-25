import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LockedList } from "@/components/day/LockedList";
import { PlanCard, placementControlId, type PlacementChoice } from "@/components/day/PlanCard";
import { UndoNotice } from "@/components/day/UndoNotice";
import { VERDICT_HEADING_ID, VerdictPanel } from "@/components/day/VerdictPanel";
import { useBookingResolver } from "@/hooks/useBookingResolver";
import { useAnnounce } from "@/lib/a11y/announcer";
import { useFocusAfterRender } from "@/lib/a11y/focus";
import { formatDateOnly } from "@/lib/domain/dates";
import type { AssignmentChange } from "@/lib/domain/trip-state";
import type { Placement } from "@/lib/domain/types";
import { PLACEMENT_LABEL, VERDICT_LABEL } from "@/lib/domain/vocabulary";
import { selectDayIdeas, selectDayView, type PlaceView } from "@/lib/selectors";
import type { TripAction, TripEffect } from "@/lib/state/transition";
import { useTrip } from "@/lib/state/TripProvider";

const PLANS_HEADING_ID = "plans-heading";

function changesOf(effects: TripEffect[]): AssignmentChange[] {
  return effects.flatMap((effect) => (effect.type === "assignmentsChanged" ? effect.changes : []));
}

export default function DayBuilder() {
  const { dayId } = useParams();
  const { seed, state, dispatch } = useTrip();
  const announce = useAnnounce();
  const focusLater = useFocusAfterRender();
  const bookings = useBookingResolver();
  const [undo, setUndo] = useState<{ message: string; changes: AssignmentChange[] } | null>(null);
  const view = selectDayView(state, seed, dayId ?? "");

  // One announcement per change; a verdict change is folded into the same message.
  const pending = useRef<string | null>(null);
  const lastVerdict = useRef(view?.status.verdict);
  const verdict = view?.status.verdict;
  useEffect(() => {
    if (pending.current && view) {
      const changed = lastVerdict.current !== verdict;
      const dayLabel = formatDateOnly(view.day.date, "EEE MMM d");
      announce(`${pending.current}${changed ? ` ${dayLabel} is now ${VERDICT_LABEL[verdict!]}.` : ""}`);
      pending.current = null;
    }
    lastVerdict.current = verdict;
  }, [announce, verdict, view, state]);

  if (!view) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-bold">Day not found</h1>
        <Link href="/itinerary" className="text-primary underline-offset-4 hover:underline">
          Back to the itinerary
        </Link>
      </div>
    );
  }
  const { day, previous, next } = view;

  const nameOf = (placeId: string) => state.places.find((place) => place.id === placeId)?.name ?? "Plan";
  const orderedIds = [
    view.anchor,
    ...view.planned,
    ...view.optional,
    ...view.backup,
    ...view.doNotCram,
  ].filter((entry): entry is PlaceView => entry !== null).map((entry) => entry.place.id);
  const neighbourControls = (placeId: string) => {
    const index = orderedIds.indexOf(placeId);
    return [orderedIds[index + 1], orderedIds[index - 1]].filter(Boolean).map(placementControlId);
  };

  const run = (action: TripAction, message: (changes: AssignmentChange[], effects: TripEffect[]) => string) => {
    const effects = dispatch(action);
    const changes = changesOf(effects);
    if (changes.length === 0) return;
    const text = message(changes, effects);
    pending.current = text;
    setUndo({ message: text, changes });
  };

  const handlePlacement = (placeId: string, choice: PlacementChoice) => {
    if (choice === "inbox") {
      focusLater(...neighbourControls(placeId), PLANS_HEADING_ID);
      run({ type: "unassignPlace", placeId }, () => `Moved ${nameOf(placeId)} back to the Inbox.`);
      return;
    }
    focusLater(placementControlId(placeId));
    run({ type: "setPlacement", placeId, dayId: day.id, placement: choice }, (_changes, effects) => {
      const demoted = effects.find((effect) => effect.type === "anchorDemoted");
      const base = `${nameOf(placeId)} is now ${choice === "anchor" ? "the anchor" : PLACEMENT_LABEL[choice as Placement]}.`;
      return demoted?.type === "anchorDemoted" ? `${base} ${nameOf(demoted.placeId)} moved to Planned.` : base;
    });
  };

  const handleMove = (placeId: string, targetDayId: string) => {
    const target = seed.days.find((candidate) => candidate.id === targetDayId);
    focusLater(...neighbourControls(placeId), PLANS_HEADING_ID);
    run({ type: "assignToDay", placeId, dayId: targetDayId }, () =>
      `Moved ${nameOf(placeId)} to ${target ? formatDateOnly(target.date, "EEE MMM d") : "another day"}.`,
    );
  };

  const applySuggestion = (placeId: string) => {
    focusLater(VERDICT_HEADING_ID);
    run({ type: "setPlacement", placeId, dayId: day.id, placement: "optional" }, () => `Moved ${nameOf(placeId)} to Optional.`);
  };

  const undoLast = () => {
    if (!undo) return;
    const effects = dispatch({ type: "restoreAssignments", changes: undo.changes.map((change) => ({ placeId: change.placeId, assignment: change.before })) });
    setUndo(null);
    if (effects[0]?.type === "rejected") {
      announce("That can't be undone any more because the day has changed since.");
      return;
    }
    pending.current = "Undone.";
    focusLater(placementControlId(undo.changes[0].placeId), VERDICT_HEADING_ID);
  };

  const dayIdeas = selectDayIdeas(state, seed, day.id);
  const ideas = dayIdeas.places.slice(0, 5);
  const otherDays = seed.days.map((candidate) => ({ id: candidate.id, label: `${formatDateOnly(candidate.date, "EEE MMM d")} · ${candidate.title}` }));

  const card = (placeView: PlaceView) => (
    <PlanCard
      key={placeView.place.id}
      view={placeView}
      dayId={day.id}
      otherDays={otherDays}
      onPlacementChange={handlePlacement}
      onMoveToDay={handleMove}
      onResolveBooking={(bookingId) => bookings.open(bookingId, [placementControlId(placeView.place.id)])}
    />
  );

  const resolveTask = (taskId: string) => {
    const task = seed.tasks.find((candidate) => candidate.id === taskId);
    dispatch({ type: "setTaskResolved", taskId, resolved: true });
    announce(`Done: ${task?.label ?? "task"}.`);
    focusLater("tasks-heading", VERDICT_HEADING_ID);
  };

  return (
    <div className="space-y-8 pb-20">
      <nav aria-label="Days" className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="min-h-[44px] text-muted-foreground">
          <Link href="/itinerary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Itinerary
          </Link>
        </Button>
        <div className="flex gap-2">
          {previous && (
            <Button asChild variant="outline" size="icon" className="h-11 w-11">
              <Link href={`/day/${previous.id}`} aria-label={`Previous day: ${previous.title}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}
          {next && (
            <Button asChild variant="outline" size="icon" className="h-11 w-11">
              <Link href={`/day/${next.id}`} aria-label={`Next day: ${next.title}`}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </nav>

      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {formatDateOnly(day.date, "EEEE, MMMM d")}
            {view.base && ` · sleeps in ${view.base.city}`}
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">{day.title}</h1>
          <p className="font-serif italic text-muted-foreground">{day.theme}</p>
        </div>
        <Button asChild size="lg" className="min-h-[44px] w-full md:w-auto">
          <Link href={`/trip-mode/${day.id}`}>Open Trip Mode</Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
        <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
          <VerdictPanel load={view.load} onApplySuggestion={applySuggestion} />
        </div>

        <div className="space-y-8 lg:col-span-8 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <h2 id={PLANS_HEADING_ID} tabIndex={-1} className="sr-only">
            Plans for this day
          </h2>
          {undo && <UndoNotice message={undo.message} onUndo={undoLast} onDismiss={() => setUndo(null)} />}

          <LockedList legs={view.legs} events={view.fixedEvents} />

          <section aria-labelledby="anchor-heading" className="space-y-3">
            <h2 id="anchor-heading" className="text-lg font-serif font-semibold text-primary">
              Anchor
            </h2>
            {view.anchor ? card(view.anchor) : <p className="text-sm text-muted-foreground">No anchor yet: choose the one plan that defines this day.</p>}
          </section>

          {view.planned.length > 0 && (
            <section aria-labelledby="planned-heading" className="space-y-3">
              <h2 id="planned-heading" className="text-lg font-serif font-semibold text-primary">
                Planned
              </h2>
              {view.planned.map(card)}
            </section>
          )}

          {view.optional.length > 0 && (
            <section aria-labelledby="optional-heading" className="space-y-3">
              <h2 id="optional-heading" className="text-lg font-serif font-semibold text-primary">
                Optional <span className="text-sm font-sans font-normal text-muted-foreground">not counted in the day</span>
              </h2>
              {view.optional.map(card)}
            </section>
          )}

          {(view.backup.length > 0 || day.fallbacks.length > 0) && (
            <details className="group space-y-3">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 rounded-md py-2 focus-ring [&::-webkit-details-marker]:hidden">
                <ChevronRight aria-hidden="true" className="h-4 w-4 text-muted-foreground transition-transform motion-reduce:transition-none group-open:rotate-90" />
                <h2 className="inline text-lg font-serif font-semibold text-muted-foreground">
                  Backup ({view.backup.length + day.fallbacks.length})
                </h2>
              </summary>
              {day.fallbacks.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
                  {day.fallbacks.map((fallback) => (
                    <li key={fallback}>{fallback}</li>
                  ))}
                </ul>
              )}
              {view.backup.map(card)}
            </details>
          )}

          {(view.doNotCram.length > 0 || day.guardrails.length > 0) && (
            <details className="group space-y-3">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 rounded-md py-2 focus-ring [&::-webkit-details-marker]:hidden">
                <ChevronRight aria-hidden="true" className="h-4 w-4 text-muted-foreground transition-transform motion-reduce:transition-none group-open:rotate-90" />
                <h2 className="inline text-lg font-serif font-semibold text-muted-foreground">
                  Do not cram ({view.doNotCram.length + day.guardrails.length})
                </h2>
              </summary>
              {day.guardrails.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
                  {day.guardrails.map((guardrail) => (
                    <li key={guardrail}>{guardrail}</li>
                  ))}
                </ul>
              )}
              {view.doNotCram.map(card)}
            </details>
          )}
        </div>

        {/* Tasks and ideas follow the plans on narrow screens; they join the right rail on wide ones. */}
        <div className="space-y-6 lg:col-span-4 lg:col-start-9 lg:row-start-2">
          {view.openTasks.length > 0 && (
            <section aria-labelledby="tasks-heading" className="space-y-2">
              <h2 id="tasks-heading" tabIndex={-1} className="text-base font-serif font-semibold focus:outline-none">
                Open tasks
              </h2>
              <ul className="space-y-2">
                {view.openTasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    <span id={`task-${task.id}`}>{task.label}</span>
                    {task.resolvedBy === "booking" && task.relatedBookingId ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[44px] shrink-0"
                        aria-describedby={`task-${task.id}`}
                        onClick={() => bookings.open(task.relatedBookingId!, ["tasks-heading", VERDICT_HEADING_ID])}
                      >
                        Add confirmation
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="min-h-[44px] shrink-0" aria-describedby={`task-${task.id}`} onClick={() => resolveTask(task.id)}>
                        Mark done
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="ideas-heading" className="space-y-2 rounded-xl border border-border bg-secondary/30 p-4">
            <h2 id="ideas-heading" className="text-base font-serif font-semibold">
              {dayIdeas.nearbyCities.length > 0 ? `Unsorted places in ${dayIdeas.nearbyCities.join(" and ")}` : "Other unsorted places"}
            </h2>
            {ideas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing left to sort.</p>
            ) : (
              <ul className="space-y-2">
                {ideas.map((place) => (
                  <li key={place.id} className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2">
                    <span className="min-w-0 text-sm">
                      <span className="block font-medium">{place.name}</span>
                      <span className="block text-xs text-muted-foreground">{place.area}</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 shrink-0"
                      aria-label={`Add ${place.name} to this day`}
                      onClick={() => {
                        focusLater(placementControlId(place.id), "ideas-heading");
                        run({ type: "assignToDay", placeId: place.id, dayId: day.id }, (changes) =>
                          `Added ${place.name} as ${PLACEMENT_LABEL[changes[0].after!.placement].toLowerCase()}.`,
                        );
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {bookings.sheet}
    </div>
  );
}
