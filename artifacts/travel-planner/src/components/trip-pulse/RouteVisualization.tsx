import { TRIP_LEG_ACCENTS } from "@/data/legAccents";

interface RouteVisualizationProps {
  route: string;
  className?: string;
}

export function RouteVisualization({ route, className = "" }: RouteVisualizationProps) {
  const legs = route.split("→").map((s) => s.trim()).filter(Boolean);
  const accents = legs.map((leg) =>
    TRIP_LEG_ACCENTS.find((a) => a.label === leg) ?? TRIP_LEG_ACCENTS[0],
  );

  return (
    <div className={`w-full ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 360 72"
        className="w-full h-auto max-h-20"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="route-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--sc-raw-powder-blue))" stopOpacity="0.65" />
            <stop offset="50%" stopColor="hsl(var(--sc-raw-sea-glass))" stopOpacity="0.55" />
            <stop offset="100%" stopColor="hsl(var(--sc-raw-mist-lilac))" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        <path
          d="M 36 36 Q 120 18 180 36 T 324 36"
          fill="none"
          stroke="url(#route-line)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {accents.map((accent, index) => {
          const x = 36 + index * ((360 - 72) / Math.max(legs.length - 1, 1));
          const y = index === 1 ? 28 : 36;
          return (
            <g key={accent.id}>
              <circle
                cx={x}
                cy={y}
                r="10"
                fill="hsl(var(--background))"
                stroke={`hsl(var(${accent.cssVar}))`}
                strokeWidth="2.5"
              />
              <circle
                cx={x}
                cy={y}
                r="4"
                fill={`hsl(var(${accent.cssVar}))`}
              />
            </g>
          );
        })}
      </svg>

      <div className="flex justify-between mt-2 px-1">
        {legs.map((leg, index) => (
          <span
            key={leg}
            className={`text-[10px] sm:text-xs font-medium tracking-wide uppercase text-sc-route-label`}
          >
            {leg}
          </span>
        ))}
      </div>
    </div>
  );
}
