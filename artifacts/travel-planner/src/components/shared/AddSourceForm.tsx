import { FormEvent, useState } from "react";
import { useTrip } from "@/context/TripContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Plus } from "lucide-react";
import { ItemCategory, SavedPlace, SourceType } from "@/types";

const categoryOptions: { value: ItemCategory; label: string }[] = [
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

function inferSourceType(url: string): SourceType {
  const normalized = url.toLowerCase();

  if (normalized.includes("tiktok.com")) return "tiktok";
  if (normalized.includes("instagram.com")) return "instagram";
  if (normalized.includes("google.") || normalized.includes("goo.gl/maps")) return "google_maps";
  if (normalized.startsWith("http")) return "blog";
  return "manual";
}

function buildFallbackName(sourceType: SourceType) {
  const labels: Record<SourceType, string> = {
    tiktok: "TikTok save",
    instagram: "Instagram save",
    google_maps: "Google Maps save",
    blog: "Article save",
    manual: "Manual save",
  };

  return labels[sourceType];
}

export function AddSourceForm() {
  const { addPlace } = useTrip();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Barcelona");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<ItemCategory>("experience");
  const [lastSavedName, setLastSavedName] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url) return;

    const sourceType = inferSourceType(url);
    const placeName = name.trim() || buildFallbackName(sourceType);

    const newPlace: SavedPlace = {
      id: `place-${Date.now()}`,
      name: placeName,
      city: city.trim() || "Barcelona",
      area: area.trim() || "Unassigned Area",
      category,
      priority: "medium",
      status: "planned",
      notes: notes.trim(),
      source_type: sourceType,
      source_url: url,
      raw_notes: null,
      google_maps_url: sourceType === "google_maps" ? url : null,
      assigned_day_id: null,
    };

    addPlace(newPlace);
    setLastSavedName(placeName);
    setUrl("");
    setName("");
    setCity("Barcelona");
    setArea("");
    setNotes("");
    setCategory("experience");
  };

  return (
    <Card className="border-primary/20 bg-secondary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Link className="w-5 h-5" /> Quick Save
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              aria-label="Source link"
              placeholder="Paste TikTok, Instagram, Google Maps, or article link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              aria-label="Place name"
              placeholder="Place name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
            />
            <Input
              aria-label="City"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-background"
            />
            <Input
              aria-label="Area or neighborhood"
              placeholder="Area or neighborhood"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
            <Textarea
              aria-label="Notes"
              placeholder="Why is this worth saving?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background min-h-[80px]"
            />
            <div className="space-y-4 flex flex-col justify-between">
              <Select value={category} onValueChange={(val: ItemCategory) => setCategory(val)}>
                <SelectTrigger aria-label="Category" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full" disabled={!url}>
                <Plus className="w-4 h-4 mr-2" /> Save to Inbox
              </Button>
            </div>
          </div>
          <p role="status" className="sr-only">
            {lastSavedName ? `Saved ${lastSavedName} to Inbox.` : ""}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
