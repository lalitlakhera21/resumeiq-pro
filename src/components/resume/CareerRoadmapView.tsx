import { motion } from "framer-motion";
import type { CareerRoadmap } from "@/lib/resume/analyzer";
import { Check, ArrowRight } from "lucide-react";

export function CareerRoadmapView({ roadmap }: { roadmap: CareerRoadmap }) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Badge tone="primary">{roadmap.level}</Badge>
        <ArrowRight className="size-4 text-muted-foreground" />
        <Badge tone="accent">Target: {roadmap.targetRole}</Badge>
      </div>
      <ol className="relative space-y-4 border-l border-border/80 pl-6">
        {roadmap.steps.map((s, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative"
          >
            <span
              className={`absolute -left-[33px] grid size-6 place-items-center rounded-full ring-4 ring-background ${
                s.done ? "bg-accent text-accent-foreground" : "bg-primary/15 text-primary ring-1 ring-primary/30"
              }`}
            >
              {s.done ? <Check className="size-3.5" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
            </span>
            <div className="rounded-xl border border-border bg-background/30 p-3">
              <div className="text-sm font-semibold">{s.title}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "primary" | "accent" }) {
  const cls = tone === "primary"
    ? "bg-primary/10 text-primary ring-primary/30"
    : "bg-accent/10 text-accent ring-accent/30";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${cls}`}>
      {children}
    </span>
  );
}
