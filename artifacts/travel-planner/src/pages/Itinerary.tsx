import { useTrip } from "@/context/TripContext";
import { formatDateOnly } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Itinerary() {
  const { trip, days, places } = useTrip();

  const daysWithMeta = days.map(day => {
    const dayPlaces = places.filter(p => p.assigned_day_id === day.id);
    const anchor = dayPlaces.find(p => p.day_section === 'anchor');
    const booked = dayPlaces.filter(p => p.day_section === 'booked');
    const planned = dayPlaces.filter(p => p.day_section === 'planned');
    const hasAnchor = !!anchor;
    const activeItems = dayPlaces.filter(p => p.day_section !== 'do-not-cram' && p.day_section !== 'backup');
    const isOverloaded = activeItems.length > 6;
    return { ...day, anchor, booked, planned, hasAnchor, isOverloaded, count: dayPlaces.length };
  });

  const cities = [...new Set(days.map(d => d.city))];

  return (
    <div className="space-y-10 page-enter max-w-3xl">
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight">Itinerary</h1>
        <p className="text-lg text-muted-foreground">{trip.title} · {trip.route}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {cities.map(city => (
            <span key={city} className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full border border-border">{city}</span>
          ))}
        </div>
      </header>

      <div className="space-y-0 relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

        {daysWithMeta.map((day, idx) => (
          <div key={day.id} className="relative flex gap-6 pb-8 last:pb-0" data-testid={`itinerary-day-${day.id}`}>
            {/* Day number bubble */}
            <div className="relative z-10 flex flex-col items-center shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-serif shadow-sm border-2 border-background ${day.hasAnchor ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                {idx + 1}
              </div>
            </div>

            {/* Day card */}
            <div className="flex-1 min-w-0 -mt-1">
              <Card className={`transition-all ${day.hasAnchor ? 'border-border hover:border-primary/40' : 'border-dashed border-sc-status-attention-border hover:border-sc-status-progress'}`}>
                <CardContent className="p-5 space-y-3">
                  <Link href={`/day/${day.id}`}>
                    <div className="space-y-3 cursor-pointer hover-elevate rounded-lg -m-1 p-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                              {formatDateOnly(day.date, "EEE, MMM d")}
                            </p>
                            <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{day.city}</span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-foreground mt-1 leading-snug">{day.title}</h3>
                          <p className="text-xs text-muted-foreground italic mt-0.5">{day.day_vibe}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {day.isOverloaded && (
                            <span title="Overloaded day" className="text-sc-status-progress">
                              <Zap className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {!day.hasAnchor && (
                            <span title="Missing anchor" className="text-sc-status-attention-fg">
                              <AlertCircle className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">{day.count} places</span>
                        </div>
                      </div>

                      {day.anchor ? (
                        <div className="bg-secondary/50 px-3 py-2.5 rounded-lg">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Anchor</p>
                          <p className="font-serif font-semibold text-foreground">{day.anchor.name}</p>
                        </div>
                      ) : (
                        <div className="border border-dashed border-sc-status-attention-border bg-sc-status-attention-bg/50 px-3 py-2.5 rounded-lg">
                          <p className="text-xs text-sc-status-attention-fg italic">No anchor set for this day</p>
                        </div>
                      )}

                      {(day.booked.length > 0 || day.planned.length > 0) && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {day.booked.length > 0 && (
                            <span className="flex items-center gap-1 bg-sc-status-ready-surface text-sc-status-ready px-2 py-0.5 rounded-full border border-sc-status-attention-border">
                              {day.booked.length} booked
                            </span>
                          )}
                          {day.planned.length > 0 && (
                            <span className="flex items-center gap-1 bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                              {day.planned.length} planned
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex gap-2 pt-1">
                    <Button asChild variant="outline" size="sm" className="text-xs h-7">
                      <Link href={`/day/${day.id}`}>Plan Day</Link>
                    </Button>
                    <Button asChild size="sm" className="text-xs h-7">
                      <Link href={`/trip-mode/${day.id}`}>Trip Mode</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
