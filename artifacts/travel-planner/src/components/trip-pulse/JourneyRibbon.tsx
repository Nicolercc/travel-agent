import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import { Link } from "wouter";
import { DayWithMeta } from "@/lib/trip-metrics";
import { formatDateOnly } from "@/lib/dates";
import { getLegAccentForCity } from "@/data/legAccents";
import { getDayRibbonStatus } from "@/lib/day-readiness";
import { LogisticsItem, SavedPlace } from "@/types";
import { Anchor, AlertTriangle, Luggage } from "lucide-react";

interface JourneyRibbonProps {
  days: DayWithMeta[];
  places: SavedPlace[];
  logistics: LogisticsItem[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
}

export function JourneyRibbon({
  days,
  places,
  logistics,
  selectedDayId,
  onSelectDay,
}: JourneyRibbonProps) {
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
        onSelectDay(days[nextIndex].id);
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
        {days.map((day, index) => {
          const isSelected = day.id === selectedDayId;
          const accent = getLegAccentForCity(day.city);
          const status = getDayRibbonStatus(day, places, logistics);
          const StatusIcon =
            status.variant === "ok"
              ? status.label.includes("Logistics")
                ? Luggage
                : Anchor
              : AlertTriangle;

          return (
            <button
              key={day.id}
              type="button"
              role="tab"
              id={`journey-tab-${day.id}`}
              aria-selected={isSelected}
              aria-controls={`day-preview-${day.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelectDay(day.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`snap-start shrink-0 min-w-[9.25rem] sm:min-w-[8.75rem] rounded-xl px-3 py-3 text-left transition-colors focus-ring min-h-[44px] border ${
                isSelected
                  ? "sc-ribbon-tab-selected"
                  : "border-transparent bg-secondary/40 hover:bg-secondary/70"
              }`}
              data-testid={`journey-ribbon-${day.id}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {formatDateOnly(day.date, "MMM d")}
              </p>
              <p className="text-sm font-serif font-semibold text-foreground leading-tight mt-1 truncate">
                {day.city}
              </p>
              <div className="flex items-start gap-1.5 mt-2 min-w-0">
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1 ${accent.dotClass}`}
                  aria-hidden="true"
                />
                <span
                  className={`text-[10px] leading-snug flex items-start gap-1 min-w-0 ${
                    status.variant === "ok"
                      ? "text-muted-foreground"
                      : "text-sc-status-attention-fg"
                  }`}
                >
                  <StatusIcon className="w-2.5 h-2.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="break-words">{status.label}</span>
                </span>
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
