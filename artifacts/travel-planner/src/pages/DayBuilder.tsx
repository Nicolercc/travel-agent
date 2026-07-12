import { useTrip } from "@/context/TripContext";
import { useParams, Link } from "wouter";
import { StatusPill, CategoryPill } from "@/components/ui/Pills";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { formatDateOnly } from "@/lib/dates";
import { daySectionForInboxAssignment } from "@/lib/assignment";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DaySection, SavedPlace } from "@/types";

export default function DayBuilder() {
  const { dayId } = useParams();
  const { days, places, movePlace } = useTrip();

  const dayIndex = days.findIndex(d => d.id === dayId);
  const day = days[dayIndex];
  
  if (!day) return <div>Day not found</div>;

  const prevDay = dayIndex > 0 ? days[dayIndex - 1] : null;
  const nextDay = dayIndex < days.length - 1 ? days[dayIndex + 1] : null;

  const dayPlaces = places.filter(p => p.assigned_day_id === day.id);
  const inboxPlaces = places.filter(p => !p.assigned_day_id);
  const nearbyInboxPlaces = inboxPlaces.filter(p => (
    p.city === day.city ||
    p.city.includes(day.city) ||
    day.city.includes(p.city) ||
    p.area === day.area_context
  ));

  // Group by section
  const sections: Record<DaySection, SavedPlace[]> = {
    anchor: [],
    booked: [],
    planned: [],
    optional: [],
    backup: [],
    "do-not-cram": []
  };

  dayPlaces.forEach(p => {
    if (p.day_section) {
      sections[p.day_section].push(p);
    } else {
      sections.planned.push(p);
    }
  });

  const handleSectionChange = (placeId: string, value: DaySection | "inbox") => {
    if (value === "inbox") {
      movePlace(placeId, null);
      return;
    }

    movePlace(placeId, day.id, value);
  };

  const SectionCard = ({ place, section }: { place: SavedPlace, section: DaySection }) => (
    <Card className="mb-3 hover-elevate transition-all border-border bg-card">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h4 className="font-serif text-lg font-bold">{place.name}</h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {place.area}
              </p>
            </div>
            <div className="flex gap-2">
              <CategoryPill category={place.category} />
              <StatusPill status={place.status} />
            </div>
          </div>
          
          {place.notes && (
            <p className="text-sm leading-relaxed text-foreground/80">{place.notes}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/50">
            <Select value={section} onValueChange={(val) => handleSectionChange(place.id, val as DaySection | "inbox")}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anchor">Anchor</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="optional">Optional</SelectItem>
                <SelectItem value="backup">Backup</SelectItem>
                <SelectItem value="do-not-cram">Do Not Cram</SelectItem>
                <SelectItem value="inbox">Move to Inbox</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {place.booking_link && (
                <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                  <a href={place.booking_link} target="_blank" rel="noreferrer">Tickets <ExternalLink className="w-3 h-3 ml-1"/></a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 pb-20 page-enter">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex gap-2">
          {prevDay && (
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-11 w-11 min-h-[44px] min-w-[44px]"
              aria-label={`Go to previous day: ${prevDay.title}`}
            >
              <Link href={`/day/${prevDay.id}`}>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
          )}
          {nextDay && (
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-11 w-11 min-h-[44px] min-w-[44px]"
              aria-label={`Go to next day: ${nextDay.title}`}
            >
              <Link href={`/day/${nextDay.id}`}>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight">
              {formatDateOnly(day.date, "EEEE, MMMM d")}
            </h1>
            <p className="text-xl text-muted-foreground mt-2 font-serif italic">
              {day.area_context}
            </p>
          </div>
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link href={`/trip-mode/${day.id}`}>Open Trip Mode</Link>
          </Button>
        </div>
        
        {day.day_vibe && (
          <div className="bg-secondary/50 p-4 rounded-lg border border-border">
            <p className="text-foreground italic">"{day.day_vibe}"</p>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section>
            <h3 className="text-xl font-serif font-bold text-primary mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span> Anchor
            </h3>
            {sections.anchor.length === 0 && <p className="text-muted-foreground text-sm italic">No anchor set for this day.</p>}
            {sections.anchor.map(p => <SectionCard key={p.id} place={p} section="anchor" />)}
          </section>

          {(sections.booked.length > 0 || sections.planned.length > 0) && (
            <section>
              <h3 className="text-xl font-serif font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span> The Core Plan
              </h3>
              {sections.booked.map(p => <SectionCard key={p.id} place={p} section="booked" />)}
              {sections.planned.map(p => <SectionCard key={p.id} place={p} section="planned" />)}
            </section>
          )}

          {sections.optional.length > 0 && (
            <section>
              <h3 className="text-xl font-serif font-bold text-primary mb-4 opacity-70">Nearby / Optional</h3>
              {sections.optional.map(p => <SectionCard key={p.id} place={p} section="optional" />)}
            </section>
          )}

          {sections.backup.length > 0 && (
            <section>
              <h3 className="text-lg font-serif font-bold text-muted-foreground mb-3 opacity-60">Backup</h3>
              {sections.backup.map(p => <SectionCard key={p.id} place={p} section="backup" />)}
            </section>
          )}

          {sections["do-not-cram"].length > 0 && (
            <section>
              <h3 className="text-lg font-serif font-bold text-muted-foreground mb-3 opacity-60">Do Not Cram</h3>
              {sections["do-not-cram"].map(p => <SectionCard key={p.id} place={p} section="do-not-cram" />)}
            </section>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-secondary/30 p-5 rounded-xl border border-border">
            <h4 className="font-serif font-bold text-lg mb-4">Nearby Ideas</h4>
            <p className="text-sm text-muted-foreground mb-4">Unsorted places near {day.city}</p>
            <div className="space-y-3">
              {(nearbyInboxPlaces.length > 0 ? nearbyInboxPlaces : inboxPlaces).slice(0, 5).map(p => (
                <div key={p.id} className="bg-card p-3 rounded border border-border flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.area}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0"
                    aria-label={`Add ${p.name} to this day`}
                    onClick={() => movePlace(p.id, day.id, daySectionForInboxAssignment(p))}
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
