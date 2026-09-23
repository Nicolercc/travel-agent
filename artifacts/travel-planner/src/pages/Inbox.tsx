import { useState } from "react";
import { useTrip } from "@/context/TripContext";
import { AddSourceForm } from "@/components/shared/AddSourceForm";
import { StatusPill, CategoryPill } from "@/components/ui/Pills";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDateOnly } from "@/lib/dates";
import { daySectionForInboxAssignment } from "@/lib/assignment";
import { ItemCategory } from "@/types";

const categoryFilters: { value: "all" | ItemCategory; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "food", label: "Food" },
  { value: "bar", label: "Bar" },
  { value: "cafe", label: "Cafe" },
  { value: "museum", label: "Museum" },
  { value: "experience", label: "Experience" },
  { value: "shop", label: "Shop" },
  { value: "accommodation", label: "Accommodation" },
  { value: "transport", label: "Transport" },
  { value: "viewpoint", label: "Viewpoint" },
  { value: "nightlife", label: "Nightlife" },
  { value: "beach", label: "Beach" },
];

export default function Inbox() {
  const { places, days, movePlace } = useTrip();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const inboxPlaces = places.filter(p => !p.assigned_day_id);

  const filteredPlaces = inboxPlaces.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.area.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 page-enter">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight">Inbox</h1>
        <p className="text-lg text-muted-foreground" role="status">
          {inboxPlaces.length} unsorted places
        </p>
      </header>

      <AddSourceForm />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              aria-label="Search places or areas"
              placeholder="Search places or areas..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger aria-label="Filter by category" className="w-full sm:w-[200px] bg-background">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {categoryFilters.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlaces.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
              No places found matching your filters.
            </div>
          ) : (
            filteredPlaces.map(place => (
              <Card key={place.id} className="hover-elevate transition-all border-border">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-foreground">{place.name}</h3>
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
                    <p className="text-sm text-foreground/80 leading-relaxed bg-secondary/50 p-3 rounded-md">
                      "{place.notes}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Select
                      onValueChange={(val) =>
                        movePlace(place.id, val, daySectionForInboxAssignment(place))
                      }
                    >
                      <SelectTrigger aria-label={`Assign ${place.name} to a day`} className="w-[180px] h-8 text-xs bg-background">
                        <SelectValue placeholder="Assign to day..." />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map(day => (
                          <SelectItem key={day.id} value={day.id}>
                            {formatDateOnly(day.date, "MMM d")} - {day.area_context}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {place.source_url && (
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" asChild>
                        <a href={place.source_url} target="_blank" rel="noreferrer">
                          Source <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
