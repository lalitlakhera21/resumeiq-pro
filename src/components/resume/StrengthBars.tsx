import { motion } from "framer-motion";
import type { Strength } from "@/lib/resume/analyzer";

const LABELS: Record<keyof Strength, string> = {
  skills: "Skills",
  projects: "Projects",
  education: "Education",
  experience: "Experience",
  formatting: "Formatting",
};

export function StrengthBars({ strength }: { strength: Strength }) {
  const entries = Object.entries(strength) as [keyof Strength, number][];
  return (
    <div className="space-y-4">
      {entries.map(([k, v], i) => (
        <div key={k}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium">{LABELS[k]}</span>
            <span className="text-muted-foreground">{v}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${v}%` }}
              transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background:
                  v >= 80
                    ? "linear-gradient(90deg, var(--accent), color-mix(in oklab, var(--accent) 60%, var(--primary)))"
                    : v >= 50
                      ? "linear-gradient(90deg, var(--primary), color-mix(in oklab, var(--primary) 60%, var(--accent)))"
                      : "linear-gradient(90deg, var(--warning), var(--destructive))",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
