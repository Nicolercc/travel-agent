import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Map, Compass, Layers, CheckCircle } from "lucide-react";
import { useTrip } from "@/context/TripContext";
import { mockLogistics } from "@/data/mockData";
import {
  computePlanningHealth,
  countItineraryDays,
  formatTripDateRangeShort,
  getDashboardFeatureDay,
  getFeatureDaySnapshot,
} from "@/lib/trip-metrics";
import { countUnresolvedBookings } from "@/lib/booking-readiness";

export default function Landing() {
  const { trip, days, places } = useTrip();
  const health = computePlanningHealth(days, places, mockLogistics);
  const unresolvedBookings = countUnresolvedBookings(health.bookingReadiness);
  const feature = getDashboardFeatureDay(days);
  const featureSnapshot = feature ? getFeatureDaySnapshot(feature.day, places) : null;

  const confirmedLogistics = mockLogistics.filter(
    (item) => item.confirmation && item.type !== "emergency",
  );

  return (
    <div className="min-h-[100dvh] bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/50">
        <div className="flex items-center gap-2 text-primary">
          <Map className="w-5 h-5" />
          <span className="font-serif text-xl font-bold tracking-tight">TripCanvas</span>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link href="/trips">My Trips</Link>
          </Button>
          <Button asChild size="sm" data-testid="cta-open-demo">
            <Link href="/dashboard">Open Spain Demo</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/70 bg-primary/8 px-3 py-1.5 rounded-full mb-8 border border-primary/15">
          <Compass className="w-3 h-3" /> Spain 2026 Demo Available
        </div>

        <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-tight tracking-tight mb-6">
          Turn chaotic travel saves<br className="hidden md:block" />
          <span className="text-primary"> into realistic curated days.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          A beautiful travel planning workspace for people with too many saved places and high standards.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="px-8 text-base gap-2 h-12" data-testid="hero-cta-primary">
            <Link href="/dashboard">
              Open Spain Demo <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8 text-base h-12" data-testid="hero-cta-secondary">
            <Link href="/trips">View Trip Library</Link>
          </Button>
        </div>
      </section>

      {/* Preview Card */}
      <section className="max-w-3xl mx-auto px-6 md:px-12 pb-20">
        <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-primary/10 border-b border-border/60 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Demo Trip</p>
              <h3 className="font-serif text-2xl text-foreground font-bold">{trip.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{trip.route}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {formatTripDateRangeShort(trip.start_date, trip.end_date)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {countItineraryDays(days)} itinerary days
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
            <div className="px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                {feature?.label ?? "Trip Preview"}
              </p>
              {feature && featureSnapshot ? (
                <>
                  <p className="font-serif text-lg font-bold text-foreground">{feature.day.title}</p>
                  {featureSnapshot.anchor ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      Anchor: {featureSnapshot.anchor.name}
                      {featureSnapshot.anchor.time ? `, ${featureSnapshot.anchor.time}` : ""}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1 italic">No anchor set yet</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">Open the demo to explore days</p>
              )}
            </div>
            <div className="px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Planning</p>
              <div className="space-y-1.5 text-sm text-sc-status-attention-fg">
                {health.missingAnchors.length > 0 && (
                  <p>{health.missingAnchors.length} days missing anchors</p>
                )}
                {health.daysNeedingLogistics.length > 0 && (
                  <p>{health.daysNeedingLogistics.length} travel days need logistics</p>
                )}
                {health.unsortedPlaces.length > 0 && (
                  <p>{health.unsortedPlaces.length} unsorted saves</p>
                )}
                {unresolvedBookings > 0 && (
                  <p>{unresolvedBookings} unresolved bookings</p>
                )}
                {health.missingAnchors.length === 0 &&
                  health.daysNeedingLogistics.length === 0 &&
                  health.unsortedPlaces.length === 0 &&
                  unresolvedBookings === 0 && (
                    <p className="text-sc-status-ready">Looking good — no open issues</p>
                  )}
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Status</p>
              <div className="space-y-1.5 text-sm">
                {confirmedLogistics.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sc-status-ready">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {item.title}
                  </div>
                ))}
                {confirmedLogistics.length === 0 && (
                  <p className="text-muted-foreground italic">No confirmed bookings yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 px-6 py-4 bg-secondary/20 flex justify-end">
            <Button asChild size="sm" className="gap-2" data-testid="preview-card-cta">
              <Link href="/dashboard">
                Open Trip <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/50 bg-secondary/20 py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">One flow. Four modes.</h2>
          <p className="text-muted-foreground text-lg">From messy saves to a calm day on the ground.</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Save a place", desc: "Paste a TikTok, Instagram, or Google Maps link. Add notes. Done.", icon: Layers },
            { step: "02", title: "Sort the inbox", desc: "Assign places to days. Set priority, status, and area context.", icon: Compass },
            { step: "03", title: "Build the day", desc: "Anchor → Booked → Planned → Optional → Backup → Do Not Cram.", icon: Map },
            { step: "04", title: "Use Trip Mode", desc: "Open it while walking in Barcelona. Calm. Clear. Ready.", icon: CheckCircle },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="bg-card border border-border rounded-xl p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-muted-foreground">{step}</span>
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Ready to plan Spain?</h2>
        <p className="text-muted-foreground mb-8">The demo is already loaded. Just open it.</p>
        <Button asChild size="lg" className="px-10 gap-2 h-12 text-base" data-testid="footer-cta">
          <Link href="/dashboard">
            Open Spain 2026 <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        TripCanvas — A calm travel planning workspace
      </footer>
    </div>
  );
}
