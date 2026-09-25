import { Badge } from "@/components/ui/badge";
import type { ItemCategory, Priority } from "@/lib/domain/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  must: "bg-[hsl(var(--sc-raw-mist-blue))] text-sc-status-ready border-[hsl(var(--sc-raw-coastal-blue)/0.35)]",
  high: "bg-sc-status-ready-surface text-sc-status-ready border-sc-status-attention-border",
  medium: "bg-sc-status-progress-surface text-sc-status-attention-fg border-sc-status-attention-border",
  low: "bg-secondary text-muted-foreground border-border",
};

export const PRIORITY_LABEL: Record<Priority, string> = { must: "Must", high: "High", medium: "Medium", low: "Low" };

export function PriorityPill({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={`${PRIORITY_STYLES[priority]} font-medium`}>
      <span className="sr-only">Priority: </span>
      {PRIORITY_LABEL[priority]}
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
  viewpoint: "bg-[hsl(var(--sc-raw-sea-glass)/0.35)] text-foreground border-[hsl(var(--sc-raw-coastal-blue)/0.3)]",
  nightlife: "bg-sc-status-progress-surface text-sc-status-progress border-sc-status-attention-border",
  beach: "bg-[hsl(var(--sc-raw-mist-blue))] text-sc-status-ready border-[hsl(var(--sc-raw-coastal-blue)/0.3)]",
  other: "bg-secondary text-muted-foreground border-border",
};

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  food: "Food",
  bar: "Bar",
  cafe: "Cafe",
  museum: "Museum",
  experience: "Experience",
  shop: "Shop",
  viewpoint: "Viewpoint",
  nightlife: "Nightlife",
  beach: "Beach",
  other: "Other",
};

export function CategoryPill({ category }: { category: ItemCategory }) {
  return (
    <Badge variant="outline" className={CATEGORY_STYLES[category]}>
      {CATEGORY_LABEL[category]}
    </Badge>
  );
}
