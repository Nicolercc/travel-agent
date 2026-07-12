import { Link } from "wouter";
import { Compass, Inbox, Plane } from "lucide-react";

interface QuickAccessProps {
  tripModeDayId: string | null;
  hasUnsortedPlaces?: boolean;
  hideInbox?: boolean;
  hideLogistics?: boolean;
}

export function QuickAccess({
  tripModeDayId,
  hasUnsortedPlaces = false,
  hideInbox = false,
  hideLogistics = false,
}: QuickAccessProps) {
  return (
    <nav aria-label="Quick access" className="pt-2 border-t border-border/40">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
        Quick access
      </p>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {tripModeDayId && (
          <Link href={`/trip-mode/${tripModeDayId}`}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors focus-ring min-h-[44px] cursor-pointer">
              <Compass className="w-4 h-4" aria-hidden="true" />
              Open Trip Mode
            </span>
          </Link>
        )}
        {!hideLogistics && (
          <Link href="/logistics">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors focus-ring min-h-[44px] cursor-pointer">
              <Plane className="w-4 h-4" aria-hidden="true" />
              Travel wallet
            </span>
          </Link>
        )}
        {!hideInbox && hasUnsortedPlaces && (
          <Link href="/inbox">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors focus-ring min-h-[44px] cursor-pointer">
              <Inbox className="w-4 h-4" aria-hidden="true" />
              Sort inbox
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
