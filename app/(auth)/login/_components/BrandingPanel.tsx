import { Bus, CheckCircle2 } from "lucide-react";

const FEATURES = [
  "Real-time fleet tracking & status",
  "Driver and conductor management",
  "Schedule planning & dispatch",
  "Maintenance logs & cost tracking",
];

const STOPS = [0, 1, 2, 3];

function TransitPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.07]"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <g transform="translate(40, 60)" stroke="white" fill="none" strokeWidth="1.5">
        <rect x="0" y="4" width="28" height="18" rx="3" />
        <rect x="2" y="8" width="8" height="6" rx="1" />
        <rect x="12" y="8" width="8" height="6" rx="1" />
        <circle cx="5" cy="24" r="2.5" />
        <circle cx="23" cy="24" r="2.5" />
        <line x1="0" y1="16" x2="-6" y2="16" />
        <line x1="28" y1="16" x2="34" y2="16" />
      </g>
      <g fill="white">
        <circle cx="120" cy="40" r="3" />
        <circle cx="160" cy="40" r="3" />
        <circle cx="200" cy="40" r="3" />
        <circle cx="240" cy="40" r="3" />
        <line x1="123" y1="40" x2="157" y2="40" stroke="white" strokeWidth="1" strokeDasharray="4 2" />
        <line x1="163" y1="40" x2="197" y2="40" stroke="white" strokeWidth="1" strokeDasharray="4 2" />
        <line x1="203" y1="40" x2="237" y2="40" stroke="white" strokeWidth="1" strokeDasharray="4 2" />
      </g>
      <g transform="translate(220, 320)" stroke="white" fill="none" strokeWidth="1.5" opacity="0.6">
        <rect x="0" y="4" width="40" height="26" rx="4" />
        <rect x="3" y="9" width="12" height="9" rx="1" />
        <rect x="18" y="9" width="12" height="9" rx="1" />
        <circle cx="8" cy="33" r="3.5" />
        <circle cx="32" cy="33" r="3.5" />
      </g>
      <g stroke="white" fill="none" strokeWidth="1.5">
        <path d="M 80 280 C 80 266 94 260 94 272 C 94 284 80 290 80 280 Z" />
        <circle cx="87" cy="271" r="3" />
        <path d="M 300 120 C 300 106 314 100 314 112 C 314 124 300 130 300 120 Z" />
        <circle cx="307" cy="111" r="3" />
      </g>
      <path
        d="M 0 350 Q 80 300 160 350 T 320 350"
        stroke="white"
        fill="none"
        strokeWidth="1"
        strokeDasharray="6 3"
        opacity="0.5"
      />
    </svg>
  );
}

export function BrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-[55%] bg-slate-900 relative overflow-hidden flex-col items-center justify-center p-12">
      <style>{`
        @keyframes bp-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes bp-blob {
          0%, 100% { transform: scale(1) translate(0px, 0px); border-radius: 60% 40% 55% 45% / 45% 55% 40% 60%; }
          33%       { transform: scale(1.1) translate(16px, -14px); border-radius: 45% 55% 40% 60% / 60% 40% 55% 45%; }
          66%       { transform: scale(0.92) translate(-12px, 10px); border-radius: 55% 45% 60% 40% / 40% 60% 45% 55%; }
        }
        @keyframes bp-bus-drive {
          0%   { transform: translateX(-52px); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateX(296px); opacity: 0; }
        }
        @keyframes bp-fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bp-dot-pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 1;   transform: translate(-50%, -50%) scale(1.45); }
        }
        @keyframes bp-shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bp-glow {
          0%, 100% { filter: drop-shadow(0 0 3px rgba(96,165,250,0.25)); }
          50%      { filter: drop-shadow(0 0 12px rgba(96,165,250,0.75)); }
        }
        @keyframes bp-breathe {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 0.85; }
        }
        .bp-float    { animation: bp-float      3.6s ease-in-out infinite; }
        .bp-blob     { animation: bp-blob        8s   ease-in-out infinite; }
        .bp-bus      { animation: bp-bus-drive   4.5s ease-in-out infinite; }
        .bp-fade-up  { animation: bp-fade-up     0.65s ease-out both; }
        .bp-dot      { animation: bp-dot-pulse   1.8s  ease-in-out infinite; }
        .bp-shimmer  {
          background: linear-gradient(90deg, #60a5fa, #818cf8, #38bdf8, #a78bfa, #60a5fa);
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: bp-shimmer 5s ease-in-out infinite;
        }
        .bp-glow     { animation: bp-glow    2.8s ease-in-out infinite; }
        .bp-breathe  { animation: bp-breathe 5s   ease-in-out infinite; }
      `}</style>

      {/* Ambient blobs */}
      <div className="absolute -top-20 -left-16 w-96 h-96 bg-blue-600/25 blur-3xl bp-blob" />
      <div
        className="absolute -bottom-16 -right-12 w-72 h-72 bg-indigo-500/20 blur-3xl bp-blob"
        style={{ animationDelay: "4s" }}
      />

      <TransitPattern />

      <div className="relative z-10 text-center max-w-md">

        {/* Logo */}
        <div
          className="flex items-center justify-center gap-3 mb-10 bp-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <div className="bg-blue-500 p-3.5 rounded-2xl shadow-lg shadow-blue-500/30 bp-float">
            <Bus className="h-9 w-9 text-white" />
          </div>
          <span className="text-4xl font-bold text-white tracking-tight">
            Transit<span className="text-blue-400 bp-glow">Live</span>
          </span>
        </div>

        {/* Heading */}
        <div className="bp-fade-up" style={{ animationDelay: "150ms" }}>
          <h1 className="text-3xl font-bold text-white mb-4 leading-snug">
            Manage your fleet<br />
            <span className="bp-shimmer">with confidence.</span>
          </h1>
        </div>

        {/* Description */}
        <div className="bp-fade-up" style={{ animationDelay: "300ms" }}>
          <p className="text-slate-400 text-base leading-relaxed mb-8 bp-breathe">
            A unified platform for SLTB depot managers to oversee buses, drivers,
            schedules, and maintenance — in real time.
          </p>
        </div>

        {/* Animated route strip */}
        <div className="bp-fade-up mb-10" style={{ animationDelay: "450ms" }}>
          <div className="relative h-8 mx-auto w-72">
            {/* Track line */}
            <div className="absolute inset-x-3 top-1/2 h-px bg-slate-600 -translate-y-1/2" />

            {/* Stop dots */}
            {STOPS.map((i) => (
              <div
                key={i}
                className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-blue-500/70 bp-dot"
                style={{
                  left: `${8 + i * 28}%`,
                  animationDelay: `${i * 0.45}s`,
                }}
              />
            ))}

            {/* Driving bus */}
            <div
              className="absolute bp-bus"
              style={{ top: "calc(50% - 11px)" }}
            >
              <div className="flex items-center gap-0.5 bg-blue-500 rounded px-1.5 py-0.5 shadow-md shadow-blue-500/50">
                <Bus className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div className="space-y-3 mx-auto w-fit">
          {FEATURES.map((feat, i) => (
            <div
              key={feat}
              className="flex items-center gap-3 text-slate-300 text-sm bp-fade-up"
              style={{ animationDelay: `${600 + i * 100}ms` }}
            >
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              {feat}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-900/80 to-transparent" />
    </div>
  );
}
