import { motion } from "framer-motion";
import { Check, X, FileSearch } from "lucide-react";
import type { ParsedResume, SectionKey } from "@/lib/resume/parser";

const LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  skills: "Skills",
  education: "Education",
  projects: "Projects",
  experience: "Experience",
  achievements: "Achievements",
  certifications: "Certifications",
};

export function ParserDebugPanel({ p }: { p: ParsedResume }) {
  const preview = p.rawText.slice(0, 1000);
  const sections = Object.keys(LABELS) as SectionKey[];
  const confidence = p.parsingConfidence;
  const tone =
    confidence >= 80 ? "text-emerald-500" : confidence >= 55 ? "text-amber-500" : "text-destructive";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Parsing Confidence
          </p>
          <p className={`text-2xl font-bold ${tone}`}>{confidence}%</p>
        </div>
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background:
                  confidence >= 80
                    ? "linear-gradient(90deg, var(--accent), color-mix(in oklab, var(--accent) 60%, var(--primary)))"
                    : confidence >= 55
                      ? "linear-gradient(90deg, var(--primary), var(--warning))"
                      : "linear-gradient(90deg, var(--warning), var(--destructive))",
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {p.rawText.length.toLocaleString()} characters extracted ·{" "}
            {p.skills.length} skills detected
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Detected Sections
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {sections.map((k) => {
            const ok = p.sectionsDetected[k];
            return (
              <div
                key={k}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  ok
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                {ok ? (
                  <Check className="size-4 text-emerald-500" />
                ) : (
                  <X className="size-4 text-destructive" />
                )}
                <span className="font-medium">{LABELS[k]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <FileSearch className="size-3.5" />
          Extracted Text Preview (first 1000 chars)
        </p>
        <pre className="max-h-56 overflow-auto rounded-lg border border-border bg-surface/60 p-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
{preview || "No text extracted."}
        </pre>
      </div>
    </div>
  );
}
