import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { AlertTriangle, ArrowLeft, Check } from "lucide-react";
import { NEXT_HEADING_ID, NowNext } from "@/components/trip-mode/NowNext";
import { PlanItem } from "@/components/trip-mode/PlanItem";
import { SkipLink } from "@/components/SkipLink";
import { TravelBlock } from "@/components/trip-mode/TravelBlock";
import { useDemoNow } from "@/hooks/useDemoNow";
import { useAnnounce } from "@/lib/a11y/announcer";
import { formatDateOnly, toLocalDateOnlyString } from "@/lib/domain/dates";
import { formatClock } from "@/lib/domain/time";
import { selectTripMode, type PlaceView, type TripModeItem } from "@/lib/selectors";
import { useTrip } from "@/lib/state/TripProvider";

function describe(item: TripModeItem | null): string {
  if (!item) return "Nothing else planned today.";
  return `Next: ${item.title}${item.timeLabel ? `, ${item.timeLabel}` : ""}.`;
}

function DayNotFound() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto flex min-h-[100dvh] max-w-[560px] flex-col justify-center gap-4 px-4 focus:outline-none">
      <h1 className="font-serif text-3xl text-primary">Day not found</h1>
      <p className="text-muted-foreground">This trip has no such day.</p>
      <Link href="/itinerary" className="font-medium text-primary underline underline-offset-4 focus-ring rounded">
        Go to the Itinerary
      </Link>
    </main>
  );
}

/**
 * Trip Mode (RFC §10): execution, not planning. Now/Next from the demo clock, today's travel with
 * confirmations, Done/Skip per item, backups on skip. No verdicts, placements, or readiness.
 */
export default function TripMode() {
  const { dayId = "" } = useParams<{ dayId: string }>();
  const { seed, state, dispatch } = useTrip();
  const clock = useDemoNow();
  const announce = useAnnounce();
  const [chosenBackupIds, setChosenBackupIds] = useState<string[]>([]);
  const view = selectTripMode(state, seed, dayId, clock, chosenBackupIds);

  // Announce after the state has re-rendered, so "Next" reflects the change.
  const pending = useRef<((next: TripModeItem | null) => string) | null>(null);
  const fromNextBar = useRef(false);
  const next = view?.next ?? null;
  useEffect(() => {
    if (!pending.current) return;
    announce(pending.current(next));
    pending.current = null;
    // The Next bar disappears when nothing is left; keep focus in the page instead of losing it.
    if (fromNextBar.current && !next) document.getElementById(NEXT_HEADING_ID)?.focus();
    fromNextBar.current = false;
  });

  if (!view) return <DayNotFound />;
  const { dayView } = view;
  const { day } = dayView;
  const plans = view.items.filter((item) => item.kind === "plan");

  const toggle = (item: TripModeItem, mark: "done" | "skipped") => {
    const undoing = item.mark === mark;
    pending.current = (after) =>
      undoing ? `${item.title}: ${mark === "done" ? "not done" : "not skipped"}.` : `${mark === "done" ? "Done" : "Skipped"}. ${describe(after)}`;
    dispatch({ type: "toggleProgress", dayId: day.id, itemId: item.id, mark });
  };
  const chooseBackup = (backup: PlaceView) => {
    setChosenBackupIds((ids) => (ids.includes(backup.place.id) ? ids.filter((id) => id !== backup.place.id) : [...ids, backup.place.id]));
    pending.current = (after) => describe(after);
  };
  const backupsFor = (item: TripModeItem) => view.backupsFor[item.id] ?? view.generalBackups;

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <SkipLink />
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/40 bg-background/90 px-4 py-2 backdrop-blur-xl">
        <Link href={`/day/${day.id}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-md text-sm text-muted-foreground hover:text-foreground focus-ring">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Day plan
        </Link>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Trip Mode</p>
        <p className="text-xs text-muted-foreground">
          {view.previewing ? `Previewing ${formatDateOnly(day.date, "EEE MMM d")}` : `Now ${formatClock(view.clockMinutes)}`}
        </p>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-[560px] space-y-8 px-4 pt-8 focus:outline-none">
        <header className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <time dateTime={day.date}>{formatDateOnly(day.date, "EEEE, MMMM d")}</time>
            {dayView.base && ` · Sleeps in ${dayView.base.city}`}
          </p>
          <h1 className="font-serif text-3xl leading-tight tracking-tight text-primary sm:text-4xl">{day.title}</h1>
          {view.previewing && (
            <p className="text-sm text-muted-foreground">
              Previewing: the demo date is {formatDateOnly(toLocalDateOnlyString(clock), "EEE MMM d")}, {formatClock(view.clockMinutes)}, so nothing is under way yet.
            </p>
          )}
        </header>

        {view.criticalTasks.length > 0 && (
          <div className="flex gap-3 rounded-xl border border-sc-status-attention-border bg-sc-status-attention-bg p-4 text-sm text-sc-status-attention-fg">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{view.criticalTasks.length === 1 ? "1 critical task is still open" : `${view.criticalTasks.length} critical tasks are still open`}</p>
              <ul className="list-disc pl-5">
                {view.criticalTasks.map((task) => (
                  <li key={task.id}>{task.label}</li>
                ))}
              </ul>
              <Link href={`/day/${day.id}`} className="inline-flex min-h-[44px] items-center font-medium underline underline-offset-4 focus-ring rounded">
                Resolve in Day Builder
              </Link>
            </div>
          </div>
        )}

        <NowNext now={view.now} next={view.next} previewing={view.previewing} />

        <TravelBlock entries={view.travel} />

        {plans.length > 0 && (
          <section aria-labelledby="plan-heading" className="space-y-3">
            <h2 id="plan-heading" className="font-serif text-xl font-semibold text-foreground">
              Today's plan
            </h2>
            <ul className="rounded-2xl border border-border bg-card">
              {plans.map((item) => (
                <PlanItem
                  key={item.id}
                  item={item}
                  dayId={day.id}
                  backups={backupsFor(item)}
                  fallbacks={view.fallbacks}
                  chosenBackupIds={chosenBackupIds}
                  onToggle={toggle}
                  onChooseBackup={chooseBackup}
                />
              ))}
            </ul>
          </section>
        )}

        {view.optional.length > 0 && (
          <section aria-labelledby="optional-heading" className="space-y-3">
            <h2 id="optional-heading" className="font-serif text-xl font-semibold text-foreground">
              If there's time
            </h2>
            <ul className="rounded-2xl border border-border bg-card">
              {view.optional.map((item) => (
                <PlanItem
                  key={item.id}
                  item={item}
                  dayId={day.id}
                  backups={[]}
                  fallbacks={[]}
                  chosenBackupIds={chosenBackupIds}
                  onToggle={toggle}
                  onChooseBackup={chooseBackup}
                />
              ))}
            </ul>
          </section>
        )}

        {view.items.length === 0 && view.optional.length === 0 && <p className="text-muted-foreground">Free day. Nothing scheduled.</p>}

        {(day.theme || day.outfitNote) && (
          <details className="group rounded-xl border border-border bg-secondary/30 px-4">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center py-2 font-medium focus-ring rounded [&::-webkit-details-marker]:hidden">
              Day notes
            </summary>
            <div className="space-y-2 pb-4 text-sm text-foreground/85">
              {day.theme && <p className="font-serif italic">{day.theme}</p>}
              {day.outfitNote && <p>Outfit: {day.outfitNote}</p>}
            </div>
          </details>
        )}
      </main>

      {view.next && (
        <aside aria-label="Next up" className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[560px] items-center justify-between gap-3">
            <p className="min-w-0 text-sm">
              <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Next</span>
              <span className="block truncate font-medium text-foreground">
                {view.next.title}
                {view.next.timeLabel && <span className="text-muted-foreground"> · {view.next.timeLabel}</span>}
              </span>
            </p>
            <button
              type="button"
              aria-label={`Mark ${view.next.title} done`}
              onClick={() => {
                fromNextBar.current = true;
                toggle(view.next!, "done");
              }}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-ring"
            >
              <Check aria-hidden="true" className="h-4 w-4" /> Done
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
