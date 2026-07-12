import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Map, ArrowRight, Plus, MapPin, Calendar, AlertCircle } from "lucide-react";
import { useTrip } from "@/context/TripContext";
import { mockLogistics } from "@/data/mockData";
import { formatDateOnlyLocale } from "@/lib/dates";
import {
  computePlanningHealth,
  countItineraryDays,
  getDashboardFeatureDay,
} from "@/lib/trip-metrics";
import { countUnresolvedBookings } from "@/lib/booking-readiness";

export default function TripLibrary() {
  const { trip, days, places } = useTrip();
  const health = computePlanningHealth(days, places, mockLogistics);
  const unresolvedBookings = countUnresolvedBookings(health.bookingReadiness);
  const featureDay = getDashboardFeatureDay(days);

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/50">
        <Link href="/">
          <div className="flex items-center gap-2 text-primary cursor-pointer">
            <Map className="w-5 h-5" />
            <span className="font-serif text-xl font-bold tracking-tight">TripCanvas</span>
          </div>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-12 space-y-10 page-enter">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight mb-2">My Trips</h1>
            <p className="text-muted-foreground text-lg">Your travel planning workspace.</p>
          </div>
          <Button className="gap-2 shrink-0" data-testid="create-trip-btn">
            <Plus className="w-4 h-4" /> Create Trip
          </Button>
        </div>

        {/* Trip Card */}
        <Card className="border-border overflow-hidden hover-elevate transition-all hover:border-primary/30 cursor-pointer" data-testid="trip-card-spain">
          <div className="h-2 bg-gradient-to-r from-sc-surface-brand via-[hsl(var(--sc-raw-sea-glass))] to-sc-surface-brand-muted" />
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6">
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-serif text-2xl font-bold text-foreground">{trip.title}</h2>
                    <span className="sc-status-ready-chip">Active</span>
                  </div>
                  <p className="text-primary font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" /> {trip.route}
                  </p>
                </div>

                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {trip.start_date
                    ? formatDateOnlyLocale(trip.start_date, { month: "short", day: "numeric" })
                    : ""}{" "}
                  –{" "}
                  {trip.end_date
                    ? formatDateOnlyLocale(trip.end_date, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-muted-foreground">{countItineraryDays(days)} itinerary days</span>
                  <span className="text-border">·</span>
                  <span className="text-muted-foreground">{places.length} saved places</span>
                  <span className="text-border">·</span>
                  {unresolvedBookings > 0 ? (
                    <span className="flex items-center gap-1 text-sc-status-attention-fg">
                      <AlertCircle className="w-3.5 h-3.5" /> {unresolvedBookings} unresolved bookings
                    </span>
                  ) : (
                    <span className="text-sc-status-ready">All bookings linked</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:items-end shrink-0">
                <Button asChild className="gap-2 w-full sm:w-auto" data-testid="open-trip-spain">
                  <Link href="/dashboard">
                    Open Trip <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                {featureDay && (
                  <Button asChild variant="outline" size="sm" className="gap-1.5 w-full sm:w-auto text-xs" data-testid="trip-mode-quick-btn">
                    <Link href={`/trip-mode/${featureDay.day.id}`}>Quick Trip Mode</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty placeholder for second trip */}
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-serif text-lg text-muted-foreground">Plan your next trip</p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Add destinations, start collecting places, and build a curated itinerary before you leave.</p>
          <Button variant="outline" className="gap-2 mt-2" data-testid="create-second-trip">
            <Plus className="w-4 h-4" /> Create New Trip
          </Button>
        </div>
      </div>
    </div>
  );
}
