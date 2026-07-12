import { ReadinessDimension, ReadinessStage } from "@/lib/trip-metrics";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

const STAGE_CONFIG: Record<
  ReadinessStage,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  ready: {
    label: "Ready",
    icon: CheckCircle2,
    className: "text-sc-status-ready",
  },
  "in-progress": {
    label: "In progress",
    icon: Circle,
    className: "text-sc-status-progress",
  },
  "needs-attention": {
    label: "Needs attention",
    icon: AlertCircle,
    className: "text-sc-status-attention-fg",
  },
};

interface TripReadinessProps {
  summary: string;
  dimensions: ReadinessDimension[];
}

export function TripReadiness({ summary, dimensions }: TripReadinessProps) {
  return (
    <section aria-labelledby="readiness-heading" className="space-y-4 rounded-2xl border border-border/40 bg-card/50 px-5 py-5 sm:px-6">
      <div className="space-y-2">
        <h2 id="readiness-heading" className="text-base font-serif font-semibold text-foreground">
          Trip readiness
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
      </div>

      <ul className="space-y-2.5 list-none p-0 m-0">
        {dimensions.map((dimension) => {
          const config = STAGE_CONFIG[dimension.stage];
          const Icon = config.icon;
          return (
            <li
              key={dimension.id}
              className="flex gap-3 py-2 border-b border-border/30 last:border-0"
            >
              <Icon
                className={`w-4 h-4 shrink-0 mt-0.5 ${config.className}`}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <span className="text-sm text-foreground">
                    {dimension.label}
                  </span>
                  <span className={`text-[11px] font-medium ${config.className}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {dimension.summary}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
