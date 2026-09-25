import { useEffect, useRef } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { DayPanel } from "@/components/itinerary/DayPanel";
import { DayRow, dayRowId } from "@/components/itinerary/DayRow";
import { LegConnector } from "@/components/itinerary/LegConnector";
import { RouteDiagram } from "@/components/itinerary/RouteDiagram";
import { useDemoNow } from "@/hooks/useDemoNow";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAnnounce } from "@/lib/a11y/announcer";
import { formatDateOnly, toLocalDateOnlyString } from "@/lib/domain/dates";
import { selectFocusDayId, selectItinerary, selectRouteDiagram, selectTripRoute, type ItineraryDay } from "@/lib/selectors";
import { useTrip } from "@/lib/state/TripProvider";

const PANEL_HEADING_ID = "itinerary-day-heading";

function dayRange(days: ItineraryDay[]): string {
  const first = formatDateOnly(days[0].view.day.date, "MMM d");
  const last = formatDateOnly(days[days.length - 1].view.day.date, "MMM d");
  return first === last ? first : `${first} – ${last}`;
}

function InvalidDayNotice({ requested }: { requested: string }) {
  return (
    <p role="status" className="rounded-lg border border-sc-status-attention-border bg-sc-status-attention-bg px-4 py-3 text-sm text-sc-status-attention-fg">
      There is no day “{requested}” in this trip, so the first day is shown.
    </p>
  );
}

/**
 * Itinerary (RFC §8): how the trip flows, night by night. The URL holds the selection
 * (/itinerary/:dayId). Wide screens: timeline + sticky panel with the Route diagram. Medium:
 * the selected day expands inline under its row. Narrow: selecting a day opens it as a full view.
 */
export default function Itinerary() {
  const { dayId: requested } = useParams<{ dayId?: string }>();
  const { seed, state } = useTrip();
  const now = useDemoNow();
  const announce = useAnnounce();
  const wide = useMediaQuery("(min-width: 1024px)");
  const medium = useMediaQuery("(min-width: 768px)") && !wide;
  const narrow = !wide && !medium;

  const regions = selectItinerary(state, seed);
  const days = regions.flatMap((region) => region.days);
  const found = requested ? days.find((item) => item.view.day.id === requested) : undefined;
  const invalid = requested !== undefined && found === undefined;
  const focusDayId = selectFocusDayId(seed, toLocalDateOnlyString(now));
  const selected = found ?? (invalid ? days[0] : wide ? days.find((item) => item.view.day.id === focusDayId) : undefined);

  // Announce a changed selection (not the first render); on narrow screens, move focus into the new view.
  const previous = useRef<string | undefined>(requested);
  useEffect(() => {
    const before = previous.current;
    previous.current = requested;
    if (before === requested) return;
    if (requested && selected) {
      announce(`Showing ${formatDateOnly(selected.view.day.date, "EEEE, MMMM d")}: ${selected.view.day.title}.`);
      if (narrow) document.getElementById(PANEL_HEADING_ID)?.focus();
    } else if (!requested && before) {
      // Back to the timeline: return focus to the day just viewed.
      document.getElementById(dayRowId(before))?.focus();
    }
  }, [requested, selected, narrow, announce]);

  if (narrow && selected && requested) {
    return (
      <div className="max-w-2xl space-y-6 page-enter">
        <Link href="/itinerary" className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-ring rounded-md">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to trip
        </Link>
        {invalid && <InvalidDayNotice requested={requested} />}
        <DayPanel item={selected} headingLevel={1} headingId={PANEL_HEADING_ID} />
        <LegConnector legs={selected.keyLegs} otherMoves={selected.otherMoves} dateLabel={formatDateOnly(selected.view.day.date, "EEE MMM d")} />
      </div>
    );
  }

  const route = selectRouteDiagram(seed);
  const selectedId = selected?.view.day.id ?? null;

  return (
    <div className="space-y-8 page-enter">
      <header className="space-y-2">
        <h1 className="text-4xl font-serif tracking-tight text-primary md:text-5xl">Itinerary</h1>
        <p className="text-lg text-muted-foreground">
          {seed.trip.title} · {selectTripRoute(seed).join(" → ")}
        </p>
      </header>

      {invalid && requested && <InvalidDayNotice requested={requested} />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          {medium && <RouteDiagram data={route} selectedDayId={selectedId} className="max-w-xl" />}
          {regions.map((group) => (
            <section key={`${group.region.id}-${group.days[0].view.day.id}`} aria-labelledby={`region-${group.days[0].view.day.id}`} className="space-y-3">
              <h2
                id={`region-${group.days[0].view.day.id}`}
                className="sticky top-[60px] z-[5] -mx-1 flex items-baseline gap-3 bg-background/95 px-1 py-2 font-serif text-2xl font-semibold text-foreground lg:static"
              >
                {group.region.name}
                <span className="sr-only">,</span>{" "}
                <span className="font-sans text-sm font-normal text-muted-foreground">{dayRange(group.days)}</span>
              </h2>
              <ol className="list-none space-y-0 p-0">
                {group.days.map((item) => {
                  const isSelected = item.view.day.id === selectedId;
                  return (
                    <li key={item.view.day.id} data-testid={`itinerary-day-${item.view.day.id}`}>
                      <DayRow view={item.view} selected={isSelected} />
                      {medium && isSelected && (
                        <section aria-labelledby={PANEL_HEADING_ID} className="mt-2 rounded-xl border border-border bg-card p-5">
                          <DayPanel item={item} headingLevel={3} headingId={PANEL_HEADING_ID} />
                        </section>
                      )}
                      <LegConnector legs={item.keyLegs} otherMoves={item.otherMoves} dateLabel={formatDateOnly(item.view.day.date, "EEE MMM d")} />
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>

        {wide && selected && (
          <section aria-labelledby={PANEL_HEADING_ID} className="lg:col-span-5">
            <div className="space-y-6 rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-6">
              <RouteDiagram data={route} selectedDayId={selectedId} />
              <DayPanel item={selected} headingLevel={2} headingId={PANEL_HEADING_ID} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
