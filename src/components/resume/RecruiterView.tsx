import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, ThumbsUp, AlertCircle } from "lucide-react";
import type { RecruiterVerdict } from "@/lib/resume/analyzer";

export function RecruiterView({ verdict }: { verdict: RecruiterVerdict }) {
  const map = {
    Shortlist: { Icon: CheckCircle2, color: "var(--accent)", bg: "bg-accent/10", ring: "ring-accent/30", text: "text-accent" },
    Maybe: { Icon: AlertTriangle, color: "var(--warning)", bg: "bg-warning/10", ring: "ring-warning/30", text: "text-warning" },
    Reject: { Icon: XCircle, color: "var(--destructive)", bg: "bg-destructive/10", ring: "ring-destructive/30", text: "text-destructive" },
  } as const;
  const m = map[verdict.decision];
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-4 rounded-2xl p-5 ring-1 ${m.bg} ${m.ring}`}
      >
        <div className={`grid size-12 shrink-0 place-items-center rounded-xl bg-background/40 ${m.text}`}>
          <m.Icon className="size-6" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Recruiter verdict</div>
          <div className={`text-2xl font-bold ${m.text}`}>{verdict.decision}</div>
          <p className="mt-1 text-sm text-muted-foreground">{verdict.reasoning}</p>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Block
          title="Top strengths"
          icon={<ThumbsUp className="size-4" />}
          items={verdict.strengths}
          tone="accent"
        />
        <Block
          title="Top concerns"
          icon={<AlertCircle className="size-4" />}
          items={verdict.concerns}
          tone="destructive"
        />
      </div>
    </div>
  );
}

function Block({
  title,
  icon,
  items,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone: "accent" | "destructive";
}) {
  const cls = tone === "accent" ? "text-accent" : "text-destructive";
  return (
    <div className="rounded-xl border border-border bg-background/30 p-4">
      <div className={`mb-3 flex items-center gap-2 text-sm font-semibold ${cls}`}>{icon}{title}</div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={`mt-1 inline-block size-1.5 shrink-0 rounded-full ${tone === "accent" ? "bg-accent" : "bg-destructive"}`} />
            <span className="text-muted-foreground">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
