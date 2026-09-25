import { useState } from "react";
import { DayPreview } from "@/components/pulse/DayPreview";
import { JourneyRibbon } from "@/components/pulse/JourneyRibbon";
import { NEEDS_YOU_HEADING_ID, NeedsYou, issueControlId } from "@/components/pulse/NeedsYou";
import { PulseHeader } from "@/components/pulse/PulseHeader";
import { ReadinessSummary } from "@/components/pulse/ReadinessSummary";
import { useBookingResolver } from "@/hooks/useBookingResolver";
import { useDemoNow } from "@/hooks/useDemoNow";
import { useAnnounce } from "@/lib/a11y/announcer";
import { useFocusAfterRender } from "@/lib/a11y/focus";
import { toLocalDateOnlyString } from "@/lib/domain/dates";
import {
  selectDayViews,
  selectFocusDayId,
  selectReadiness,
  selectTripIssues,
  selectTripPhase,
  selectTripRoute,
} from "@/lib/selectors";
import { useTrip } from "@/lib/state/TripProvider";

export default function Dashboard() {
  const { seed, state, dispatch } = useTrip();
  const now = useDemoNow();
  const announce = useAnnounce();
  const focusLater = useFocusAfterRender();
  const bookings = useBookingResolver();
  const days = selectDayViews(state, seed);
  const issues = selectTripIssues(state, seed, now);
  const [selectedDayId, setSelectedDayId] = useState(() => selectFocusDayId(seed, toLocalDateOnlyString(now)));
  const selected = days.find((view) => view.day.id === selectedDayId) ?? days[0];

  // After an issue is resolved it disappears: focus the next issue, else the previous, else the heading.
  const focusAfterResolving = (index: number) =>
    [issues[index + 1], issues[index - 1]].filter(Boolean).map((issue) => issueControlId(issue.key)).concat(NEEDS_YOU_HEADING_ID);

  const resolveTask = (taskId: string, index: number) => {
    const task = seed.tasks.find((candidate) => candidate.id === taskId);
    dispatch({ type: "setTaskResolved", taskId, resolved: true });
    announce(`Done: ${task?.label ?? "task"}. ${issues.length - 1 === 1 ? "1 item" : `${issues.length - 1} items`} still need you.`);
    focusLater(...focusAfterResolving(index));
  };

  return (
    <div className="space-y-8 sm:space-y-10 min-w-0 max-w-6xl">
      <PulseHeader trip={seed.trip} route={selectTripRoute(seed)} phase={selectTripPhase(seed, now)} demoDate={now} />

      <NeedsYou
        issues={issues}
        onResolveBooking={(bookingId, index) => bookings.open(bookingId, focusAfterResolving(index))}
        onResolveTask={resolveTask}
      />

      <div className="space-y-4">
        <JourneyRibbon days={days} selectedDayId={selected.day.id} onSelectDay={setSelectedDayId} />
        <DayPreview view={selected} />
      </div>

      <ReadinessSummary summary={selectReadiness(state, seed)} />

      {bookings.sheet}
    </div>
  );
}
