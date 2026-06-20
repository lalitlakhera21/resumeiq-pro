import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ImpactRewrite } from "@/lib/resume/analyzer";

export function ImpactMeter({ items }: { items: ImpactRewrite[] }) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Great — your bullets already include measurable outcomes.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-border bg-background/30 p-4"
        >
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div>
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-destructive">Before</div>
              <p className="text-sm text-muted-foreground line-through decoration-destructive/50">{it.before}</p>
            </div>
            <ArrowRight className="hidden size-4 text-primary md:block" />
            <div>
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-accent">After</div>
              <p className="text-sm text-foreground">{it.after}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
