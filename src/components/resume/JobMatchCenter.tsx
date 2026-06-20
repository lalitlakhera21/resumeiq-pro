import { motion } from "framer-motion";
import type { JobMatch } from "@/lib/resume/analyzer";

export function JobMatchCenter({ matches }: { matches: JobMatch[] }) {
  const sorted = [...matches].sort((a, b) => b.matchPct - a.matchPct);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((m, i) => {
        const color =
          m.matchPct >= 75 ? "var(--accent)" : m.matchPct >= 50 ? "var(--primary)" : "var(--warning)";
        return (
          <motion.div
            key={m.role.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="glass relative overflow-hidden rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{m.role.emoji}</span>
                <h4 className="text-sm font-semibold">{m.role.title}</h4>
              </div>
              <span className="text-lg font-bold" style={{ color }}>
                {m.matchPct}%
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.matchPct}%` }}
                transition={{ duration: 1, delay: i * 0.06 }}
                className="h-full rounded-full"
                style={{ background: color }}
              />
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <Row label="Matched" items={m.matched} tone="accent" />
              <Row label="Missing" items={m.missing} tone="muted" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function Row({ label, items, tone }: { label: string; items: string[]; tone: "accent" | "muted" }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.length ? (
          items.map((it) => (
            <span
              key={it}
              className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ${
                tone === "accent"
                  ? "bg-accent/10 text-accent ring-accent/30"
                  : "bg-muted text-muted-foreground ring-border"
              }`}
            >
              {it}
            </span>
          ))
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}
