import { Badge } from "@/components/ui/badge";
import { ItemCategory, SavedPlace } from "@/types";

export function StatusPill({ status }: { status: SavedPlace["status"] }) {
  const styles = {
    booked: "bg-[hsl(var(--sc-raw-mist-blue))] text-sc-status-ready border-[hsl(var(--sc-raw-coastal-blue)/0.35)]",
    planned: "bg-sc-status-ready-surface text-sc-status-ready border-sc-status-attention-border",
    optional: "bg-sc-status-progress-surface text-sc-status-attention-fg border-sc-status-attention-border",
    backup: "bg-secondary text-muted-foreground border-border",
    "do-not-cram": "bg-sc-status-attention-bg text-sc-status-critical border-sc-status-attention-border",
  };

  const labels = {
    booked: "Booked",
    planned: "Planned",
    optional: "Optional",
    backup: "Backup",
    "do-not-cram": "Do Not Cram",
  };

  return (
    <Badge variant="outline" className={`${styles[status]} font-medium`}>
      {labels[status]}
    </Badge>
  );
}

const CATEGORY_STYLES: Record<ItemCategory, string> = {
  food: "bg-card text-muted-foreground border-border",
  bar: "bg-sc-status-progress-surface text-sc-status-progress border-sc-status-attention-border",
  cafe: "bg-card text-muted-foreground border-border",
  museum: "bg-[hsl(var(--sc-raw-sea-glass)/0.35)] text-foreground border-[hsl(var(--sc-raw-coastal-blue)/0.3)]",
  experience: "bg-[hsl(var(--sc-raw-sea-glass)/0.35)] text-foreground border-[hsl(var(--sc-raw-coastal-blue)/0.3)]",
  shop: "bg-secondary text-muted-foreground border-border",
  accommodation: "bg-[hsl(var(--sc-raw-mist-blue))] text-sc-status-ready border-[hsl(var(--sc-raw-coastal-blue)/0.3)]",
  transport: "bg-secondary text-muted-foreground border-border",
  viewpoint: "bg-[hsl(var(--sc-raw-sea-glass)/0.35)] text-foreground border-[hsl(var(--sc-raw-coastal-blue)/0.3)]",
  nightlife: "bg-sc-status-progress-surface text-sc-status-progress border-sc-status-attention-border",
  beach: "bg-[hsl(var(--sc-raw-mist-blue))] text-sc-status-ready border-[hsl(var(--sc-raw-coastal-blue)/0.3)]",
};

export function CategoryPill({ category }: { category: SavedPlace["category"] }) {
  return (
    <Badge variant="outline" className={`${CATEGORY_STYLES[category]} capitalize`}>
      {category}
    </Badge>
  );
}
