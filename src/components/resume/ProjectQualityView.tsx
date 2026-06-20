import { motion } from "framer-motion";
import type { ProjectQuality } from "@/lib/resume/analyzer";

export function ProjectQualityView({ items }: { items: ProjectQuality[] }) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No projects detected. Add a Projects section with bullet titles to unlock complexity analysis.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((p, i) => {
        const tone =
          p.complexity === "Advanced"
            ? { bg: "bg-accent/10", text: "text-accent", ring: "ring-accent/30", bar: "var(--accent)" }
            : p.complexity === "Intermediate"
              ? { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/30", bar: "var(--primary)" }
              : { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/30", bar: "var(--warning)" };
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            className="rounded-xl border border-border bg-background/30 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="min-w-0 truncate text-sm font-semibold">{p.title}</h4>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>
                {p.complexity}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${p.score}%` }}
                transition={{ duration: 0.9, delay: i * 0.05 }}
                className="h-full rounded-full"
                style={{ background: tone.bar }}
              />
            </div>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {p.signals.map((s) => (
                <li key={s} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        );
      })}
    </div>
  );
}
