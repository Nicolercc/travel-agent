import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useTrip } from "@/context/TripContext";
import { mockLogistics } from "@/data/mockData";
import { TripHero } from "@/components/trip-pulse/TripHero";
import { NextBestActions } from "@/components/trip-pulse/NextBestActions";
import { TripReadiness } from "@/components/trip-pulse/TripReadiness";
import { JourneyRibbon } from "@/components/trip-pulse/JourneyRibbon";
import { DayPreview } from "@/components/trip-pulse/DayPreview";
import { QuickAccess } from "@/components/trip-pulse/QuickAccess";
import { readPackingProgress, subscribePackingProgress } from "@/lib/packing-storage";
import {
  computeDaysWithMeta,
  computeNextBestActions,
  computePlanningHealth,
  computeTripReadiness,
  getDashboardFeatureDay,
  getDayPreviewSnapshot,
  getTripPhase,
} from "@/lib/trip-metrics";

export default function Dashboard() {
  const [location] = useLocation();
  const { trip, days, places } = useTrip();
  const [packingRevision, setPackingRevision] = useState(0);

  useEffect(
    () => subscribePackingProgress(() => setPackingRevision((n) => n + 1)),
    [],
  );

  const health = useMemo(
    () => computePlanningHealth(days, places, mockLogistics),
    [days, places],
  );
  const daysWithMeta = useMemo(
    () => computeDaysWithMeta(days, places),
    [days, places],
  );
  const phase = useMemo(() => getTripPhase(trip), [trip]);
  const actions = useMemo(
    () => computeNextBestActions(health),
    [health],
  );
  const packingProgress = useMemo(
    () => readPackingProgress(),
    [location, packingRevision],
  );
  const readiness = useMemo(
    () => computeTripReadiness(days, places, mockLogistics, packingProgress),
    [days, places, packingProgress],
  );
  const featureDay = useMemo(
    () => getDashboardFeatureDay(days),
    [days],
  );

  const defaultDayId = featureDay?.day.id ?? days[0]?.id ?? "";
  const [selectedDayId, setSelectedDayId] = useState(defaultDayId);

  const selectedDay =
    days.find((d) => d.id === selectedDayId) ?? days[0] ?? null;
  const previewSnapshot = selectedDay
    ? getDayPreviewSnapshot(selectedDay, places)
    : null;

  const hiddenQuickLinks = useMemo(() => {
    const hidden = new Set<"inbox" | "logistics" | "trip-mode">();
    for (const action of actions) {
      if (action.id === "unsorted-inbox") hidden.add("inbox");
      if (
        action.id === "missing-bookings" ||
        action.id === "days-needing-logistics"
      ) {
        hidden.add("logistics");
      }
    }
    return hidden;
  }, [actions]);

  return (
    <div className="trip-pulse-enter space-y-8 sm:space-y-10 lg:space-y-12 min-w-0 overflow-x-hidden max-w-6xl">
      <TripHero trip={trip} phase={phase} />

      <JourneyRibbon
        days={daysWithMeta}
        places={places}
        logistics={mockLogistics}
        selectedDayId={selectedDay?.id ?? defaultDayId}
        onSelectDay={setSelectedDayId}
      />

      {selectedDay && previewSnapshot && (
        <DayPreview
          day={selectedDay}
          snapshot={previewSnapshot}
          logistics={mockLogistics}
        />
      )}

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7 min-w-0">
          <NextBestActions actions={actions} />
        </div>

        <div className="lg:col-span-5 min-w-0">
          <TripReadiness
            summary={readiness.summary}
            dimensions={readiness.dimensions}
          />
        </div>
      </div>

      <QuickAccess
        tripModeDayId={selectedDay?.id ?? null}
        hasUnsortedPlaces={health.unsortedPlaces.length > 0}
        hideInbox={hiddenQuickLinks.has("inbox")}
        hideLogistics={hiddenQuickLinks.has("logistics")}
      />
    </div>
  );
}
