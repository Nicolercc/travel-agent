import { useEffect, useState } from "react";
import { useTrip } from "@/context/TripContext";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateOnly } from "@/lib/dates";
import {
  PACKING_CATEGORIES,
  PACKING_OUTFIT_NOTES,
  countActionablePackingItems,
  getPackingItemKey,
} from "@/data/packing-data";
import {
  countCheckedPackingItems,
  readPackingState,
  subscribePackingProgress,
  writePackingState,
} from "@/lib/packing-storage";
import { CheckCircle2, Circle, Luggage, Shirt } from "lucide-react";

export default function Packing() {
  const { days } = useTrip();
  const [checked, setChecked] = useState(readPackingState);

  useEffect(() => subscribePackingProgress(() => setChecked(readPackingState())), []);

  const toggleItem = (key: string) => {
    const current = readPackingState();
    if (current[key]) {
      const { [key]: _removed, ...rest } = current;
      writePackingState(rest);
      return;
    }
    writePackingState({ ...current, [key]: true });
  };

  const totalItems = countActionablePackingItems();
  const checkedCount = countCheckedPackingItems(checked);

  return (
    <div className="space-y-12 page-enter max-w-4xl">
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight">Packing</h1>
        <p className="text-lg text-muted-foreground">Outfits by day and packing list.</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-sc-status-ready rounded-full transition-all duration-300"
              style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }}
            />
          </div>
          <span>{checkedCount}/{totalItems} packed</span>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-serif text-foreground flex items-center gap-2.5 border-b border-border pb-3">
          <Shirt className="w-5 h-5 text-muted-foreground" /> Daily Outfits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PACKING_OUTFIT_NOTES.map(({ dayId, label, outfit }) => {
            const day = days.find((d) => d.id === dayId);
            return (
              <Card key={dayId} className="border-border" data-testid={`outfit-${dayId}`}>
                <CardContent className="p-4 flex gap-4">
                  <div className="shrink-0 w-24">
                    <p className="font-serif font-bold text-foreground text-sm leading-tight">{label}</p>
                    {day && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateOnly(day.date, "MMM d")}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 bg-secondary/30 px-3 py-2 rounded-md border border-border/50 text-sm text-foreground/80 italic leading-relaxed">
                    {outfit}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-serif text-foreground flex items-center gap-2.5 border-b border-border pb-3">
          <Luggage className="w-5 h-5 text-muted-foreground" /> Packing List
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PACKING_CATEGORIES.map((category) => {
            const actionableItems = category.items.filter((item) => !item.optional);
            const catChecked = actionableItems.filter((item) =>
              checked[getPackingItemKey(category.name, item)],
            ).length;
            return (
              <Card key={category.name} className="border-border" data-testid={`packing-category-${category.name.toLowerCase()}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-foreground">{category.name}</h3>
                    <span className="text-xs text-muted-foreground">{catChecked}/{actionableItems.length}</span>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item) => {
                      const key = getPackingItemKey(category.name, item);
                      const isChecked = !!checked[key];
                      return (
                        <li key={item.label}>
                          <button
                            onClick={() => toggleItem(key)}
                            className="w-full flex items-start gap-2.5 text-left group min-h-[44px]"
                            data-testid={`packing-item-${key.toLowerCase().replace(/\s/g, "-")}`}
                          >
                            <span className="mt-0.5 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors">
                              {isChecked
                                ? <CheckCircle2 className="w-4 h-4 text-sc-status-ready" />
                                : <Circle className="w-4 h-4" />
                              }
                            </span>
                            <span className={`text-sm leading-snug ${isChecked ? "line-through text-muted-foreground/50" : item.optional ? "text-muted-foreground/70" : "text-foreground/80"}`}>
                              {item.label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
