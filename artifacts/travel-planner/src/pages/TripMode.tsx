import { useTrip } from "@/context/TripContext";
import { useParams, Link as WouterLink } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Map, CheckCircle2, Ticket, Clock, Star, Shield, XCircle, Shirt } from "lucide-react";
import { formatDateOnly } from "@/lib/dates";
import { SavedPlace } from "@/types";

export default function TripMode() {
  const { dayId } = useParams();
  const { days, places, itemStates, toggleItemDone, toggleItemSkipped } = useTrip();

  const day = days.find(d => d.id === dayId);
  if (!day) return (
    <div className="min-h-[100dvh] flex items-center justify-center text-muted-foreground">
      Day not found
    </div>
  );

  const dayPlaces = places.filter(p => p.assigned_day_id === day.id);
  const anchor = dayPlaces.find(p => p.day_section === 'anchor');
  const booked = dayPlaces.filter(p => p.day_section === 'booked');
  const planned = dayPlaces.filter(p => p.day_section === 'planned');
  const optional = dayPlaces.filter(p => p.day_section === 'optional');
  const backups = dayPlaces.filter(p => p.day_section === 'backup');
  const doNotCram = dayPlaces.filter(p => p.day_section === 'do-not-cram');

  const TripItem = ({ place, isAnchor = false, compact = false }: { place: SavedPlace, isAnchor?: boolean, compact?: boolean }) => {
    const isDone = itemStates[place.id] === 'done';
    const isSkip = itemStates[place.id] === 'skipped';

    if (isAnchor) {
      return (
        <div className={`p-6 rounded-2xl transition-all duration-300 ${isDone ? 'opacity-60' : ''} bg-primary text-primary-foreground`}>
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => toggleItemDone(place.id)}
              className={`shrink-0 h-11 w-11 min-h-[44px] min-w-[44px] rounded-full border-2 flex items-center justify-center transition-colors ${isDone ? 'bg-primary-foreground border-primary-foreground' : 'border-primary-foreground/40 hover:border-primary-foreground'}`}
              data-testid={`complete-${place.id}`}
              aria-label={
                isDone
                  ? `Mark ${place.name} incomplete`
                  : `Mark ${place.name} complete`
              }
            >
              {isDone && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </button>
            <div className="flex-1">
              <h3 className={`font-serif font-bold text-2xl leading-tight mb-1 ${isDone ? 'line-through opacity-70' : ''}`}>{place.name}</h3>
              <p className="text-sm text-primary-foreground/70">{place.area}{place.time ? ` · ${place.time}` : ''}</p>
              {place.notes && (
                <p className="text-sm text-primary-foreground/85 mt-3 leading-relaxed">{place.notes}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {place.google_maps_url && (
                  <Button size="sm" variant="secondary" className="h-8 rounded-full gap-1.5 text-xs" asChild>
                    <a href={place.google_maps_url} target="_blank" rel="noreferrer"><Map className="w-3 h-3" /> Map</a>
                  </Button>
                )}
                {place.booking_link && (
                  <Button size="sm" className="h-8 rounded-full gap-1.5 text-xs bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
                    <a href={place.booking_link} target="_blank" rel="noreferrer"><Ticket className="w-3 h-3" /> Open booking</a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (compact) {
      return (
        <div className={`px-5 py-4 transition-all duration-200 ${isDone || isSkip ? 'opacity-40' : ''} border-b border-border/50 last:border-0`}>
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-2" />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium text-foreground leading-snug ${isDone || isSkip ? 'line-through' : ''}`}>{place.name}</p>
              {place.notes && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{place.notes}</p>}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`px-5 py-5 transition-all duration-200 ${isDone || isSkip ? 'opacity-50' : ''} border-b border-border/50 last:border-0`}>
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => toggleItemDone(place.id)}
            className={`shrink-0 h-11 w-11 min-h-[44px] min-w-[44px] rounded-full border-2 flex items-center justify-center transition-colors ${isDone ? 'bg-sc-status-ready border-sc-status-ready' : 'border-muted-foreground/30 hover:border-foreground/50'}`}
            data-testid={`complete-${place.id}`}
            aria-label={
              isDone
                ? `Mark ${place.name} incomplete`
                : `Mark ${place.name} complete`
            }
          >
            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className={`font-serif font-bold text-lg leading-tight ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{place.name}</h4>
              {place.time && <span className="text-xs text-muted-foreground shrink-0">{place.time}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{place.area}</p>
            {place.notes && (
              <p className="text-sm text-foreground/75 mt-2 leading-relaxed">{place.notes}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {place.google_maps_url && (
                <Button size="sm" variant="outline" className="h-7 rounded-full gap-1.5 text-xs" asChild>
                  <a href={place.google_maps_url} target="_blank" rel="noreferrer"><Map className="w-3 h-3" /> Map</a>
                </Button>
              )}
              {place.booking_link && (
                <Button size="sm" variant="default" className="h-7 rounded-full gap-1.5 text-xs" asChild>
                  <a href={place.booking_link} target="_blank" rel="noreferrer"><Ticket className="w-3 h-3" /> Tickets</a>
                </Button>
              )}
              <button
                type="button"
                onClick={() => toggleItemSkipped(place.id)}
                className={`inline-flex min-h-[44px] items-center text-xs px-3 py-2 rounded-full border transition-colors focus-ring ${isSkip ? 'bg-secondary text-foreground border-border' : 'text-muted-foreground border-transparent hover:border-border'}`}
                data-testid={`skip-${place.id}`}
                aria-label={isSkip ? `Unskip ${place.name}` : `Skip ${place.name}`}
              >
                {isSkip ? 'Unskip' : 'Skip'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background page-enter pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full h-11 w-11 min-h-[44px] min-w-[44px]"
          data-testid="trip-mode-back"
        >
          <WouterLink href={`/day/${day.id}`} aria-label="Back to day builder">
            <ArrowLeft className="w-4 h-4" />
          </WouterLink>
        </Button>
        <div className="text-center">
          <span className="font-bold text-xs tracking-widest uppercase text-muted-foreground">Trip Mode</span>
        </div>
        <div className="w-9" />
      </div>

      <div className="max-w-lg mx-auto px-4 pt-10 space-y-10">
        {/* Header */}
        <header className="text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {formatDateOnly(day.date, "EEEE, MMMM d")}
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight leading-tight">
            {day.city}
          </h1>
          <h2 className="font-serif text-xl text-foreground">{day.title}</h2>
          <p className="text-base text-muted-foreground font-serif italic max-w-sm mx-auto leading-relaxed">
            {day.day_vibe}
          </p>
        </header>

        {/* Outfit */}
        {day.outfit_note && (
          <div className="bg-secondary/40 rounded-xl px-5 py-4 flex items-start gap-3 border border-border/50">
            <Shirt className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Outfit</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{day.outfit_note}</p>
            </div>
          </div>
        )}

        {/* Anchor */}
        {anchor && (
          <section className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:delay-100">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Star className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Anchor</span>
            </div>
            <TripItem place={anchor} isAnchor />
          </section>
        )}

        {/* Booked + Planned */}
        {(booked.length > 0 || planned.length > 0) && (
          <section className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:delay-150">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">The Plan</span>
            </div>
            <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
              {booked.map(p => <TripItem key={p.id} place={p} />)}
              {planned.map(p => <TripItem key={p.id} place={p} />)}
            </div>
          </section>
        )}

        {/* Optional Nearby */}
        {optional.length > 0 && (
          <section className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:delay-200">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Map className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Optional Nearby</span>
            </div>
            <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
              {optional.map(p => <TripItem key={p.id} place={p} />)}
            </div>
          </section>
        )}

        {/* Backup */}
        {backups.length > 0 && (
          <section className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:delay-250">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Shield className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Backup</span>
            </div>
            <div className="bg-secondary/20 rounded-xl overflow-hidden border border-border/50">
              {backups.map(p => <TripItem key={p.id} place={p} compact />)}
            </div>
          </section>
        )}

        {/* Do Not Cram */}
        {doNotCram.length > 0 && (
          <section className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:delay-300">
            <div className="flex items-center gap-2 mb-3 px-1">
              <XCircle className="w-3.5 h-3.5 text-muted-foreground/40" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Do Not Cram</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-dashed border-border/40">
              {doNotCram.map(p => (
                <div key={p.id} className="px-5 py-4 border-b border-border/30 last:border-0">
                  <p className="text-sm text-muted-foreground/60 line-through leading-snug">{p.name}</p>
                  {p.notes && <p className="text-xs text-muted-foreground/40 mt-0.5">{p.notes}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
