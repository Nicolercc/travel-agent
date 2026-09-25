import type { Location } from "@/lib/domain/types";
import type { RouteDiagramData } from "@/lib/selectors";

/**
 * Route diagram (RFC §8) — not a map: no tiles, roads, scale, pan or zoom. Real coordinates are
 * projected equirectangularly into a fixed viewBox to show how far apart the bases are and which
 * moves are flights. The accessible equivalent is the timeline; the figure is one labelled image.
 */
const WIDTH = 320;
const HEIGHT = 200;
const PAD = 22;
const LABEL_HEIGHT = 11;

function projector(points: Location[]) {
  const lats = points.map((point) => point.coordinates.lat);
  const lngs = points.map((point) => point.coordinates.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const lngScale = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const spanX = Math.max((maxLng - minLng) * lngScale, 1e-6);
  const spanY = Math.max(maxLat - minLat, 1e-6);
  const scale = Math.min((WIDTH - PAD * 2) / spanX, (HEIGHT - PAD * 2) / spanY);
  const offsetX = (WIDTH - spanX * scale) / 2;
  const offsetY = (HEIGHT - spanY * scale) / 2;
  return (location: Location) => ({
    x: offsetX + (location.coordinates.lng - minLng) * lngScale * scale,
    y: offsetY + (maxLat - location.coordinates.lat) * scale,
  });
}

interface RouteDiagramProps {
  data: RouteDiagramData;
  selectedDayId: string | null;
  className?: string;
}

export function RouteDiagram({ data, selectedDayId, className = "" }: RouteDiagramProps) {
  const points = [...data.bases.map((stop) => stop.location), ...data.segments.flatMap((segment) => [segment.from, segment.to])];
  const project = projector(points);
  const gateway = data.offMap.map((segment) => (segment.from.regionId === "transit" ? segment.to : segment.from))[0] ?? null;

  // Place base labels right of their dot, nudging down past any label already placed nearby.
  const placed: { x: number; y: number }[] = [];
  const labels = data.bases.map((stop) => {
    const { x, y } = project(stop.location);
    const alignEnd = x > WIDTH * 0.6;
    let labelY = y + 3;
    while (placed.some((other) => Math.abs(other.y - labelY) < LABEL_HEIGHT && Math.abs(other.x - x) < 90)) labelY += LABEL_HEIGHT;
    placed.push({ x, y: labelY });
    return { stop, x, y, labelX: alignEnd ? x - 7 : x + 7, labelY, anchor: alignEnd ? ("end" as const) : ("start" as const) };
  });

  return (
    <figure className={`space-y-2 ${className}`}>
      <div role="img" aria-label={`Route diagram. ${data.summary}`}>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full rounded-xl border border-border bg-secondary/30" aria-hidden="true" focusable="false">
          {gateway && (
            <g className="text-muted-foreground">
              <line x1={4} y1={project(gateway).y} x2={project(gateway).x} y2={project(gateway).y} stroke="currentColor" strokeWidth={1} strokeDasharray="5 4" />
              <text x={4} y={project(gateway).y - 5} fontSize={9} fill="currentColor">
                ← New York
              </text>
            </g>
          )}
          {data.segments.map((segment) => {
            const from = project(segment.from);
            const to = project(segment.to);
            const selected = segment.dayId === selectedDayId;
            return (
              <line
                key={segment.legId}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={selected ? "text-primary" : "text-muted-foreground/70"}
                stroke="currentColor"
                strokeWidth={selected ? 3 : 1.25}
                strokeDasharray={segment.kind === "flight" ? "5 4" : undefined}
                strokeLinecap="round"
              />
            );
          })}
          {labels.map(({ stop, x, y, labelX, labelY, anchor }) => {
            const selected = selectedDayId !== null && stop.dayIds.includes(selectedDayId);
            return (
              <g key={stop.location.id} className={selected ? "text-primary" : "text-foreground"}>
                <circle cx={x} cy={y} r={selected ? 5 : 3.5} fill="currentColor" stroke="white" strokeWidth={1.5} />
                <text x={labelX} y={labelY} fontSize={9} fontWeight={selected ? 700 : 500} textAnchor={anchor} fill="currentColor">
                  {stop.location.city}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="text-xs text-muted-foreground">
        Straight lines between real coordinates, not roads. Dashed: flights. Solid: ground. Bold: the selected day.
      </figcaption>
    </figure>
  );
}
