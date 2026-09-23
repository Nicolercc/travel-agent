import { Link, useLocation } from "wouter";
import { MapPin, Inbox, CalendarDays, Luggage, Plane, Menu, LayoutDashboard, Map, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { useTrip } from "@/context/TripContext";
import { formatTripDateRangeShort } from "@/lib/trip-metrics";

export function Navigation() {
  const [location] = useLocation();
  const { trip, resetDemoState } = useTrip();
  const tripDateRange = formatTripDateRangeShort(trip.start_date, trip.end_date);

  const navItems = [
    { href: "/dashboard", label: "Trip Pulse", icon: LayoutDashboard },
    { href: "/itinerary", label: "Itinerary", icon: CalendarDays },
    { href: "/inbox", label: "Inbox", icon: Inbox },
    { href: "/logistics", label: "Logistics", icon: Plane },
    { href: "/packing", label: "Packing", icon: Luggage },
  ];

  const isActive = (href: string) => location === href || (href === "/dashboard" && location === "/");

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
            <span
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer text-sm ${
                active
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              }`}
              data-testid={`nav-link-${item.label.toLowerCase()}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </span>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Nav */}
      <aside className="hidden md:flex flex-col w-60 bg-card border-r border-border min-h-[100dvh] p-5 shrink-0 sticky top-0">
        <Link href="/trips">
          <div className="flex items-center gap-2 mb-8 text-primary cursor-pointer group">
            <Map className="w-6 h-6" />
            <h1 className="text-xl font-serif font-bold tracking-tight group-hover:opacity-80 transition-opacity">TripCanvas</h1>
          </div>
        </Link>

        <div className="mb-3 px-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{trip.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{tripDateRange}</p>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLinks />
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <button
            type="button"
            onClick={resetDemoState}
            className="flex w-full items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Demo
          </button>
          <Link href="/trips">
            <span className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <MapPin className="w-3 h-3" /> All Trips
            </span>
          </Link>
        </div>
      </aside>

      {/* Mobile Nav Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-10">
        <Link href="/trips">
          <div className="flex items-center gap-2 text-primary cursor-pointer">
            <Map className="w-5 h-5" />
            <h1 className="text-lg font-serif font-bold tracking-tight">TripCanvas</h1>
          </div>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 min-h-[44px] min-w-[44px]"
              aria-label="Open navigation menu"
              data-testid="mobile-nav-toggle"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-5 bg-card border-r-0">
            <SheetHeader className="mb-6 text-left text-primary flex flex-row items-center gap-2">
              <Map className="w-5 h-5" />
              <SheetTitle className="font-serif text-xl font-bold">TripCanvas</SheetTitle>
            </SheetHeader>
            <div className="mb-4 px-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{trip.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tripDateRange}</p>
            </div>
            <nav className="flex flex-col gap-1">
              <NavLinks />
            </nav>
            <button
              type="button"
              onClick={resetDemoState}
              className="mt-6 flex w-full items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset Demo
            </button>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
