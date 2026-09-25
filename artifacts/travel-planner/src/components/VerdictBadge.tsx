import { AlertOctagon, AlertTriangle, CheckCircle2, CircleDot } from "lucide-react";
import { VERDICT_LABEL, type Verdict } from "@/lib/domain/vocabulary";

const STYLE: Record<Verdict, { className: string; Icon: typeof CheckCircle2 }> = {
  comfortable: { className: "text-sc-status-ready bg-sc-status-ready-surface", Icon: CheckCircle2 },
  full: { className: "text-sc-status-progress bg-sc-status-progress-surface", Icon: CircleDot },
  tight: { className: "text-sc-status-attention-fg bg-sc-status-attention-bg", Icon: AlertTriangle },
  overloaded: { className: "text-sc-status-critical bg-sc-status-attention-bg", Icon: AlertOctagon },
};

/** A day's realistic-day verdict: always a word plus a shape, never color alone. */
export function VerdictBadge({ verdict, estimate = false, size = "md" }: { verdict: Verdict; estimate?: boolean; size?: "sm" | "md" }) {
  const { className, Icon } = STYLE[verdict];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${className} ${
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {VERDICT_LABEL[verdict]}
      {estimate && <span className="font-normal">· estimate</span>}
    </span>
  );
}
