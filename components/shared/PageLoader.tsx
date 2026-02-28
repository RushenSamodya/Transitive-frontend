import { Bus } from "lucide-react";

// Stop positions as percentages across the route line (0–100).
const STOPS = [0, 33, 66, 100];

interface PageLoaderProps {
  /** Text shown below the route animation */
  label?: string;
  /** Fills the full viewport (for page-level transitions) */
  fullPage?: boolean;
}

export function PageLoader({
  label = "Loading…",
  fullPage = false,
}: PageLoaderProps) {
  const wrapper = fullPage
    ? "fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
    : "flex items-center justify-center min-h-[260px]";

  return (
    <div className={wrapper}>
      <div className="flex flex-col items-center gap-5 select-none">

        {/* ── Route strip ── */}
        <div className="relative w-72 h-12">

          {/* Road track */}
          <div className="absolute top-1/2 inset-x-0 h-px -translate-y-1/2 bg-indigo-100" />
          {/* Dashed centre line */}
          <div className="absolute top-1/2 inset-x-3 -translate-y-1/2 border-t-2 border-dashed border-indigo-200/70" />

          {/* Stop dots */}
          {STOPS.map((pct, i) => (
            <div
              key={i}
              className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-400 animate-stop-ping"
              style={{
                left: `${pct}%`,
                transform: "translate(-50%, -50%)",
                animationDelay: `${(i / STOPS.length) * 2.4}s`,
              }}
            />
          ))}

          {/* Bus — slides from left to right, clipped at the container edges */}
          <div className="absolute inset-0 overflow-hidden rounded">
            <div
              className="absolute top-1/2 -translate-y-1/2 animate-drive"
              style={{ left: 0 }}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-300">
                <Bus className="h-5 w-5 text-white" strokeWidth={1.75} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Label + bouncing dots ── */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-slate-500 tracking-wide">{label}</p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
