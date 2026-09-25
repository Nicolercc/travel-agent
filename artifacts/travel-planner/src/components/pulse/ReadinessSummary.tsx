import type { Progress, ReadinessSummary as Summary } from "@/lib/selectors";

const fraction = ({ done, total }: Progress) => `${done} of ${total}`;

/** Counts derived from the same selectors as "Needs you", collapsed by default (RFC §6). */
export function ReadinessSummary({ summary }: { summary: Summary }) {
  const rows = [
    { label: "Bookings confirmed", value: fraction(summary.bookings), complete: summary.bookings.done === summary.bookings.total },
    { label: "Days that fit", value: fraction(summary.days), complete: summary.days.done === summary.days.total },
    { label: "Tasks done", value: fraction(summary.tasks), complete: summary.tasks.done === summary.tasks.total },
    { label: "Saves sorted", value: summary.unsorted === 0 ? "All" : `${summary.unsorted} to sort`, complete: summary.unsorted === 0 },
    { label: "Packed", value: fraction(summary.packing), complete: summary.packing.done === summary.packing.total },
  ];
  const complete = rows.filter((row) => row.complete).length;
  return (
    <section aria-labelledby="readiness-heading">
      <details className="group rounded-2xl border border-border/50 bg-card/50 px-5 py-4">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 focus-ring rounded-md">
          <h2 id="readiness-heading" className="text-base font-serif font-semibold text-foreground">
            Readiness
          </h2>
          <span className="text-sm text-muted-foreground">
            {complete} of {rows.length} areas complete
          </span>
        </summary>
        <dl className="mt-2 divide-y divide-border/30">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3 py-2">
              <dt className="text-sm text-foreground">{row.label}</dt>
              <dd className={`text-sm font-medium tabular-nums ${row.complete ? "text-sc-status-ready" : "text-muted-foreground"}`}>
                {row.value}
                {row.complete && <span className="sr-only"> (complete)</span>}
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
