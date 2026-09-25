import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import { Link } from "wouter";
import { formatDateOnly } from "@/lib/domain/dates";
import type { DayView } from "@/lib/selectors";
import { VerdictBadge } from "@/components/VerdictBadge";

interface JourneyRibbonProps {
  days: DayView[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
}

export function JourneyRibbon({ days, selectedDayId, onSelectDay }: JourneyRibbonProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const previousSelectedDayIdRef = useRef(selectedDayId);

  useEffect(() => {
    const previousSelectedDayId = previousSelectedDayIdRef.current;
    previousSelectedDayIdRef.current = selectedDayId;

    if (previousSelectedDayId === selectedDayId) {
      return;
    }

    const selected = listRef.current?.querySelector<HTMLElement>(
      `#journey-tab-${selectedDayId}`,
    );
    selected?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [selectedDayId]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent, index: number) => {
      let nextIndex: number | null = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = Math.min(index + 1, days.length - 1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = Math.max(index - 1, 0);
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = days.length - 1;
      }

      if (nextIndex !== null && nextIndex !== index) {
        event.preventDefault();
        onSelectDay(days[nextIndex].day.id);
        const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
          '[role="tab"]',
        );
        buttons?.[nextIndex]?.focus();
      }
    },
    [days, onSelectDay],
  );

  return (
    <section aria-labelledby="journey-ribbon-heading" className="space-y-3 min-w-0">
      <div className="flex items-end justify-between gap-4">
        <h2 id="journey-ribbon-heading" className="text-lg font-serif font-semibold text-foreground">
          Your journey
        </h2>
      </div>

      <div
        ref={listRef}
        role="tablist"
        aria-label="Trip days"
        className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {days.map(({ day, status }, index) => {
          const isSelected = day.id === selectedDayId;
          return (
            <button
              key={day.id}
              type="button"
              role="tab"
              id={`journey-tab-${day.id}`}
              aria-selected={isSelected}
              aria-controls={isSelected ? `day-preview-${day.id}` : undefined}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelectDay(day.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`snap-start shrink-0 w-40 rounded-xl px-3 py-3 text-left transition-colors focus-ring min-h-[44px] border ${
                isSelected ? "sc-ribbon-tab-selected" : "border-transparent bg-secondary/40 hover:bg-secondary/70"
              }`}
              data-testid={`journey-ribbon-${day.id}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {formatDateOnly(day.date, "EEE MMM d")}
              </p>
              <p className="text-sm font-serif font-semibold text-foreground leading-tight mt-1 line-clamp-2">{day.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <VerdictBadge verdict={status.verdict} estimate={status.confidence === "estimate"} size="sm" />
                {status.criticalTasks > 0 && (
                  <span className="text-[10px] font-medium text-sc-status-critical">
                    {status.criticalTasks} critical
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <Link
        href="/itinerary"
        className="inline-flex min-h-[44px] items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline shrink-0 focus-ring rounded-sm"
      >
        See full itinerary
      </Link>
    </section>
  );
}
