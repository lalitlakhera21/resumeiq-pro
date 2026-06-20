import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";

export function Achievements({
  items,
}: {
  items: { id: string; title: string; description: string; unlocked: boolean }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06 }}
          className={`relative overflow-hidden rounded-xl border p-4 text-center transition ${
            a.unlocked
              ? "border-accent/40 bg-accent/10"
              : "border-border bg-background/30 opacity-70"
          }`}
        >
          <div
            className={`mx-auto grid size-10 place-items-center rounded-xl ${
              a.unlocked ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
            }`}
          >
            {a.unlocked ? <Award className="size-5" /> : <Lock className="size-4" />}
          </div>
          <div className="mt-2 text-sm font-semibold">{a.title}</div>
          <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{a.description}</div>
        </motion.div>
      ))}
    </div>
  );
}
