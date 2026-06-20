import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export function Suggestions({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((s, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-3 rounded-xl border border-border bg-background/30 p-3"
        >
          <div className="mt-0.5 grid size-7 place-items-center rounded-lg bg-warning/15 text-warning ring-1 ring-warning/30">
            <Lightbulb className="size-3.5" />
          </div>
          <p className="text-sm leading-relaxed">{s}</p>
        </motion.li>
      ))}
    </ul>
  );
}
