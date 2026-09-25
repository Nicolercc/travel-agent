import { useId, useState } from "react";
import { Link } from "wouter";
import type { Issue } from "@/lib/selectors";

const SEVERITY_LABEL: Record<Issue["severity"], string> = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };
const SEVERITY_STYLE: Record<Issue["severity"], string> = {
  critical: "text-sc-status-critical",
  high: "text-sc-status-attention-fg",
  medium: "text-sc-status-progress",
  low: "text-muted-foreground",
};
const VISIBLE = 3;

export const issueControlId = (key: string) => `issue-${key.replace(/[^\w-]/g, "-")}`;
export const NEEDS_YOU_HEADING_ID = "needs-you-heading";

interface NeedsYouProps {
  issues: Issue[];
  onResolveBooking: (bookingId: string, issueIndex: number) => void;
  onResolveTask: (taskId: string, issueIndex: number) => void;
}

const actionClass =
  "inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-secondary focus-ring";

/** Everything that needs the traveler, one entry per thing that is wrong, each resolvable from here. */
export function NeedsYou({ issues, onResolveBooking, onResolveTask }: NeedsYouProps) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const shown = expanded ? issues : issues.slice(0, VISIBLE);

  return (
    <section aria-labelledby={NEEDS_YOU_HEADING_ID} className="space-y-3">
      <h2 id={NEEDS_YOU_HEADING_ID} tabIndex={-1} className="text-lg font-serif font-semibold text-foreground focus:outline-none">
        Needs you
        {issues.length > 0 && <span className="ml-2 text-sm font-sans font-normal text-muted-foreground">{issues.length}</span>}
      </h2>
      {issues.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing needs you right now. Browse your days or open Trip Mode.</p>
      ) : (
        <>
          <ol id={listId} className="space-y-2 list-none p-0 m-0">
            {shown.map((issue, index) => {
              const action = issue.action;
              const titleId = `${issueControlId(issue.key)}-title`;
              const control = { id: issueControlId(issue.key), "aria-describedby": titleId, className: actionClass };
              return (
                <li key={issue.key} className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${SEVERITY_STYLE[issue.severity]}`}>
                      {SEVERITY_LABEL[issue.severity]}
                    </p>
                    <p id={titleId} className="font-medium text-foreground">{issue.title}</p>
                    {issue.detail && <p className="text-sm text-muted-foreground">{issue.detail}</p>}
                  </div>
                  {action.type === "resolveBooking" && (
                    <button type="button" {...control} onClick={() => onResolveBooking(action.bookingId, index)}>
                      Add confirmation
                    </button>
                  )}
                  {action.type === "resolveTask" && (
                    <button type="button" {...control} onClick={() => onResolveTask(action.taskId, index)}>
                      Mark done
                    </button>
                  )}
                  {action.type === "openDay" && (
                    <Link {...control} href={`/day/${action.dayId}`}>
                      Open day
                    </Link>
                  )}
                  {action.type === "openInbox" && (
                    <Link {...control} href="/inbox">
                      Sort Inbox
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
          {issues.length > VISIBLE && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={listId}
              onClick={() => setExpanded(!expanded)}
              className="min-h-[44px] text-sm font-medium text-primary underline-offset-4 hover:underline focus-ring rounded-sm"
            >
              {expanded ? "Show fewer" : `Show ${issues.length - VISIBLE} more`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
