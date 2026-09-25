import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Inbox, CalendarDays, Luggage, Plane, Menu, LayoutDashboard, Map, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { useTrip } from "@/lib/state/TripProvider";
import { formatDateOnly } from "@/lib/domain/dates";
import { useAnnounce } from "@/lib/a11y/announcer";
import { useDemoNow } from "@/hooks/useDemoNow";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Trip Pulse", icon: LayoutDashboard },
  { href: "/itinerary", label: "Itinerary", icon: CalendarDays },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/logistics", label: "Logistics", icon: Plane },
  { href: "/packing", label: "Packing", icon: Luggage },
];

// Module scope: an inline component would remount on every render and lose focus.
function NavLinks({ location, onNavigate }: { location: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = location === item.href || location.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={`flex min-h-[44px] items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm focus-ring ${
              active ? "bg-primary text-primary-foreground font-medium" : "text-foreground/70 hover:bg-secondary hover:text-foreground"
            }`}
            data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

function ResetDemo({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmId = useId();

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
  }, [confirming]);

  if (!confirming) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setConfirming(true)}
        className="flex min-h-[44px] w-full items-center gap-2 rounded-md px-4 text-sm text-muted-foreground hover:text-foreground focus-ring"
      >
        <RotateCcw className="w-4 h-4" /> Reset demo
      </button>
    );
  }
  return (
    <div role="group" aria-labelledby={confirmId} className="space-y-2 rounded-md border border-sc-status-attention-border bg-sc-status-attention-bg p-3">
      <p id={confirmId} className="text-sm text-foreground">
        Reset the demo? Your changes will be lost.
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="destructive" className="min-h-[44px] flex-1" onClick={onReset}>
          Reset
        </Button>
        <Button ref={cancelRef} size="sm" variant="outline" className="min-h-[44px] flex-1" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function TripSummary({ title, dates, demoDate }: { title: string; dates: string; demoDate: Date }) {
  return (
    <div className="mb-3 px-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{dates}</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Demo date: {demoDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
      </p>
    </div>
  );
}

export function Navigation() {
  const [location] = useLocation();
  const { seed, dispatch } = useTrip();
  const announce = useAnnounce();
  const now = useDemoNow();
  const [sheetOpen, setSheetOpen] = useState(false);
  const trip = seed.trip;
  const dates = `${formatDateOnly(trip.startDate, "MMM d")} – ${formatDateOnly(trip.endDate, "MMM d")}`;

  const reset = () => {
    dispatch({ type: "reset" });
    setSheetOpen(false);
    announce("Demo reset.");
    document.getElementById("main")?.focus();
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 bg-card border-r border-border min-h-[100dvh] p-5 shrink-0 sticky top-0">
        <Link href="/" className="flex items-center gap-2 mb-8 text-primary rounded-md focus-ring">
          <Map className="w-6 h-6" />
          <span className="text-xl font-serif font-bold tracking-tight">TripCanvas</span>
        </Link>
        <TripSummary title={trip.title} dates={dates} demoDate={now} />
        <nav aria-label="Main" className="flex flex-col gap-1">
          <NavLinks location={location} />
        </nav>
        <div className="mt-auto pt-6 border-t border-border">
          <ResetDemo onReset={reset} />
        </div>
      </aside>

      <header className="lg:hidden flex items-center justify-between px-4 py-2 bg-card border-b border-border sticky top-0 z-10">
        <Link href="/" className="flex min-h-[44px] items-center gap-2 text-primary rounded-md focus-ring">
          <Map className="w-5 h-5" />
          <span className="text-lg font-serif font-bold tracking-tight">TripCanvas</span>
        </Link>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Open navigation menu" data-testid="mobile-nav-toggle">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-5 bg-card border-r-0">
            <SheetHeader className="mb-6 text-left text-primary flex flex-row items-center gap-2">
              <Map className="w-5 h-5" />
              <SheetTitle className="font-serif text-xl font-bold">TripCanvas</SheetTitle>
            </SheetHeader>
            <TripSummary title={trip.title} dates={dates} demoDate={now} />
            <nav aria-label="Main" className="flex flex-col gap-1">
              <NavLinks location={location} onNavigate={() => setSheetOpen(false)} />
            </nav>
            <div className="mt-6 border-t border-border pt-4">
              <ResetDemo onReset={reset} />
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
