import { motion } from "framer-motion";
import { Trash2, TrendingUp } from "lucide-react";
import type { HistoryEntry } from "@/lib/resume/history";

export function ScoreHistory({
  entries,
  onClear,
}: {
  entries: HistoryEntry[];
  onClear: () => void;
}) {
  if (entries.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Analyze another resume to see your ATS score growth chart appear here.
      </p>
    );
  }

  const W = 600;
  const H = 160;
  const PAD = 20;
  const xs = entries.map((_, i) => PAD + (i * (W - PAD * 2)) / (entries.length - 1));
  const ats = entries.map((e) => H - PAD - (e.atsScore / 100) * (H - PAD * 2));
  const iv = entries.map((e) => H - PAD - (e.interviewScore / 100) * (H - PAD * 2));

  const pathAts = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ats[i]}`).join(" ");
  const pathIv = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${iv[i]}`).join(" ");

  const first = entries[0];
  const last = entries[entries.length - 1];
  const diff = last.atsScore - first.atsScore;
  const pct = first.atsScore ? Math.round((diff / first.atsScore) * 100) : 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Stat label="Previous" value={first.atsScore} />
          <Stat label="Current" value={last.atsScore} />
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
              diff >= 0
                ? "bg-accent/10 text-accent ring-accent/30"
                : "bg-destructive/10 text-destructive ring-destructive/30"
            }`}
          >
            <TrendingUp className="size-3.5" />
            {diff >= 0 ? "+" : ""}
            {pct}%
          </div>
        </div>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/30 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="size-3.5" /> Clear
        </button>
      </div>
      <div className="rounded-xl border border-border bg-background/30 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <defs>
            <linearGradient id="atsFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100].map((v) => {
            const y = H - PAD - (v / 100) * (H - PAD * 2);
            return <line key={v} x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 3" />;
          })}
          <motion.path
            d={`${pathAts} L ${xs[xs.length - 1]} ${H - PAD} L ${xs[0]} ${H - PAD} Z`}
            fill="url(#atsFill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d={pathAts}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.path
            d={pathIv}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="5 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
          {xs.map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={ats[i]} r={3.5} fill="var(--primary)" />
              <circle cx={x} cy={iv[i]} r={3.5} fill="var(--accent)" />
            </g>
          ))}
        </svg>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <Legend color="var(--primary)" label="ATS score" />
          <Legend color="var(--accent)" label="Interview readiness" dashed />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background/30 px-3 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-5"
        style={{ background: dashed ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 8px)` : color }}
      />
      {label}
    </div>
  );
}
