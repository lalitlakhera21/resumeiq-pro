import { motion } from "framer-motion";

export function SkillBadges({
  skills,
  variant = "default",
}: {
  skills: string[];
  variant?: "default" | "missing";
}) {
  if (!skills.length) {
    return <p className="text-sm text-muted-foreground">None detected.</p>;
  }
  const base =
    variant === "missing"
      ? "bg-destructive/10 text-destructive ring-destructive/30"
      : "bg-primary/10 text-primary ring-primary/30";
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s, i) => (
        <motion.span
          key={s}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.025, duration: 0.25 }}
          whileHover={{ scale: 1.05 }}
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${base}`}
        >
          {s}
        </motion.span>
      ))}
    </div>
  );
}
