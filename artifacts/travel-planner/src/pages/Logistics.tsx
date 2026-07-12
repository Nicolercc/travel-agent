import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plane, Hotel, Car, Ticket, UtensilsCrossed, AlertTriangle, Plus } from "lucide-react";
import { mockLogistics } from "@/data/mockData";
import { formatDateOnlyLocale } from "@/lib/dates";
import { LogisticsType } from "@/types";

const typeConfig: Record<LogisticsType, { label: string; icon: typeof Plane; color: string }> = {
  flight: { label: "Flight", icon: Plane, color: "text-sc-status-ready bg-[hsl(var(--sc-raw-mist-blue))] border-[hsl(var(--sc-raw-coastal-blue)/0.35)]" },
  hotel: { label: "Hotel", icon: Hotel, color: "text-sc-status-progress bg-sc-status-progress-surface border-sc-status-attention-border" },
  car_rental: { label: "Car Rental", icon: Car, color: "text-sc-status-progress bg-sc-status-progress-surface border-sc-status-attention-border" },
  ticket: { label: "Ticket", icon: Ticket, color: "text-sc-status-ready bg-sc-status-ready-surface border-sc-status-attention-border" },
  reservation: { label: "Reservation", icon: UtensilsCrossed, color: "text-sc-status-attention-fg bg-sc-status-attention-bg border-sc-status-attention-border" },
  emergency: { label: "Emergency", icon: AlertTriangle, color: "text-sc-status-critical bg-sc-status-attention-bg border-sc-status-attention-border" },
};

const sections: { type: LogisticsType; title: string }[] = [
  { type: "flight", title: "Flights" },
  { type: "hotel", title: "Hotels" },
  { type: "car_rental", title: "Car Rental" },
  { type: "ticket", title: "Tickets" },
  { type: "reservation", title: "Reservations" },
  { type: "emergency", title: "Emergency Info" },
];

export default function Logistics() {
  return (
    <div className="space-y-12 page-enter max-w-4xl">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight">Logistics Hub</h1>
          <p className="text-lg text-muted-foreground">Flights, stays, car rentals, and booked tickets.</p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" data-testid="add-logistics-btn">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </header>

      <div className="space-y-10">
        {sections.map(({ type, title }) => {
          const items = mockLogistics.filter(l => l.type === type);
          const config = typeConfig[type];
          const Icon = config.icon;

          if (items.length === 0) return null;

          return (
            <section key={type} className="space-y-3">
              <h2 className="text-xl font-serif text-foreground flex items-center gap-2.5 border-b border-border pb-3">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md border text-xs ${config.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                {title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <Card key={item.id} className="border-border hover-elevate transition-all" data-testid={`logistics-${item.id}`}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-serif font-bold text-foreground text-lg leading-snug">{item.title}</h3>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-sm text-muted-foreground">
                            {item.date && (
                              <span>{formatDateOnlyLocale(item.date, { month: "short", day: "numeric" })}</span>
                            )}
                            {item.time && <span>{item.time}</span>}
                          </div>
                        </div>
                        {item.confirmation ? (
                          <span className="text-xs font-mono bg-secondary px-2 py-1 rounded border border-border text-muted-foreground shrink-0">
                            {item.confirmation}
                          </span>
                        ) : (
                          <span className="text-xs text-sc-status-attention-fg bg-sc-status-attention-bg border border-sc-status-attention-border px-2 py-1 rounded shrink-0">No ref</span>
                        )}
                      </div>

                      {item.address && (
                        <p className="text-sm text-muted-foreground">{item.address}</p>
                      )}

                      {item.notes && (
                        <p className="text-sm text-foreground/75 bg-secondary/40 px-3 py-2 rounded-md leading-relaxed">
                          {item.notes}
                        </p>
                      )}

                      {item.booking_link ? (
                        <Button variant="outline" size="sm" className="w-full gap-2 text-xs" asChild>
                          <a href={item.booking_link} target="_blank" rel="noreferrer">
                            View Booking <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full gap-2 text-xs text-sc-status-attention-fg border-sc-status-attention-border hover:bg-sc-status-attention-bg" data-testid={`add-link-${item.id}`}>
                          <Plus className="w-3 h-3" /> Add booking link
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
