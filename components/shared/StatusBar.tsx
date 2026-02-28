interface StatusBarProps {
  label: string;
  count: number;
  total: number;
  color: string; // Tailwind bg-* class, e.g. "bg-emerald-500"
}

export function StatusBar({ label, count, total, color }: StatusBarProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-600 capitalize">{label.replace(/_/g, " ")}</span>
        <span className="font-semibold text-slate-700">
          {count}{" "}
          <span className="text-slate-400 font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
