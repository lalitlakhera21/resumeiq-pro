import { motion } from "framer-motion";
import type { HeatmapCell } from "@/lib/resume/analyzer";

export function ResumeHeatmap({ cells }: { cells: HeatmapCell[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cells.map((c, i) => {
        const color =
          c.level === "strong"
            ? "var(--accent)"
            : c.level === "average"
              ? "var(--warning)"
              : "var(--destructive)";
        const bg =
          c.level === "strong"
            ? "color-mix(in oklab, var(--accent) 14%, transparent)"
            : c.level === "average"
              ? "color-mix(in oklab, var(--warning) 14%, transparent)"
              : "color-mix(in oklab, var(--destructive) 14%, transparent)";
        return (
          <motion.div
            key={c.section}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -2 }}
            className="rounded-xl p-3 ring-1"
            style={{ background: bg, borderColor: color, boxShadow: `inset 0 0 0 1px ${color}33` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{c.section}</span>
              <span className="size-2 rounded-full" style={{ background: color }} />
            </div>
            <div className="mt-2 text-xl font-bold" style={{ color }}>
              {c.score}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {c.level}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
