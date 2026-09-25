import { Luggage, Shirt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateOnly } from "@/lib/domain/dates";
import { selectReadiness } from "@/lib/selectors";
import { useTrip } from "@/lib/state/TripProvider";

export default function Packing() {
  const { seed, state, dispatch } = useTrip();
  const { packing } = selectReadiness(state, seed);
  const packed = new Set(state.packed);
  const outfits = seed.days.filter((day) => day.outfitNote);

  return (
    <div className="space-y-12 page-enter max-w-4xl">
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight">Packing</h1>
        <p className="text-lg text-muted-foreground">The packing list and what to wear each day.</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <progress
            className="h-1.5 w-24 overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-sc-status-ready [&::-moz-progress-bar]:bg-sc-status-ready"
            value={packing.done}
            max={packing.total}
            aria-label="Packing progress"
          />
          <span role="status">
            {packing.done} of {packing.total} packed
          </span>
        </div>
      </header>

      <section className="space-y-4" aria-labelledby="packing-list-heading">
        <h2 id="packing-list-heading" className="text-2xl font-serif text-foreground flex items-center gap-2.5 border-b border-border pb-3">
          <Luggage className="w-5 h-5 text-muted-foreground" /> Packing list
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {seed.packing.map((category) => {
            const counted = category.items.filter((item) => !item.optional);
            const done = counted.filter((item) => packed.has(item.key)).length;
            return (
              <Card key={category.name} className="border-border">
                <CardContent className="p-5 space-y-3">
                  <fieldset>
                    <legend className="flex w-full items-center justify-between font-serif font-bold text-foreground">
                      <span>{category.name}</span>
                      <span className="text-xs font-sans font-normal text-muted-foreground">
                        {done} of {counted.length}
                      </span>
                    </legend>
                    <ul className="mt-2 space-y-1">
                      {category.items.map((item) => {
                        const id = `pack-${item.key}`.replace(/[^\w-]/g, "-");
                        const isPacked = packed.has(item.key);
                        return (
                          <li key={item.key}>
                            <label htmlFor={id} className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
                              <input
                                id={id}
                                type="checkbox"
                                checked={isPacked}
                                onChange={() => dispatch({ type: "togglePacked", key: item.key })}
                                className="h-4 w-4 shrink-0 accent-[hsl(var(--primary))] focus-ring"
                              />
                              <span className={isPacked ? "line-through text-muted-foreground" : "text-foreground/85"}>
                                {item.label}
                                {item.optional && <span className="text-muted-foreground"> · not counted</span>}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </fieldset>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="outfits-heading">
        <h2 id="outfits-heading" className="text-2xl font-serif text-foreground flex items-center gap-2.5 border-b border-border pb-3">
          <Shirt className="w-5 h-5 text-muted-foreground" /> What to wear
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {outfits.map((day) => (
            <li key={day.id} className="rounded-lg border border-border bg-card p-4">
              <p className="font-serif font-bold text-foreground text-sm">
                {formatDateOnly(day.date, "EEE MMM d")} · {day.title}
              </p>
              <p className="mt-1 text-sm text-foreground/80">{day.outfitNote}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
