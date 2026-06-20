import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { keywordMatch } from "@/lib/resume/analyzer";
import { Target } from "lucide-react";

export function KeywordMatcher({ resumeText }: { resumeText: string }) {
  const [jd, setJd] = useState("");
  const result = useMemo(() => (jd.trim() ? keywordMatch(resumeText, jd) : null), [jd, resumeText]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <Target className="size-4" />
        </div>
        <div>
          <h3 className="font-semibold">Keyword Match</h3>
          <p className="text-xs text-muted-foreground">Paste a job description to compare.</p>
        </div>
      </div>
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste a job description here…"
        className="min-h-32 w-full resize-y rounded-xl border border-border bg-background/40 p-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
      />
      {result && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">Match</span>
              <span className="text-muted-foreground">
                {result.matched.length}/{result.total} keywords · {result.matchPct}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.matchPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background:
                    result.matchPct >= 70
                      ? "linear-gradient(90deg, var(--accent), var(--primary))"
                      : result.matchPct >= 40
                        ? "linear-gradient(90deg, var(--primary), var(--warning))"
                        : "linear-gradient(90deg, var(--warning), var(--destructive))",
                }}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <KeywordList title="Matched" items={result.matched.slice(0, 20)} tone="success" />
            <KeywordList title="Missing" items={result.missing.slice(0, 20)} tone="danger" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function KeywordList({ title, items, tone }: { title: string; items: string[]; tone: "success" | "danger" }) {
  const cls =
    tone === "success"
      ? "bg-accent/10 text-accent ring-accent/30"
      : "bg-destructive/10 text-destructive ring-destructive/30";
  return (
    <div className="rounded-xl border border-border bg-background/30 p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
      {items.length ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((k) => (
            <span key={k} className={`inline-flex rounded-full px-2.5 py-1 text-xs ring-1 ${cls}`}>
              {k}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">—</p>
      )}
    </div>
  );
}
