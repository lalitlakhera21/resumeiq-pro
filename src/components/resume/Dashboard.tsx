import { motion } from "framer-motion";
import { Download, RotateCcw, Sparkles, ListChecks, AlertTriangle, BarChart3 } from "lucide-react";
import type { Analysis } from "@/lib/resume/analyzer";
import { downloadReport } from "@/lib/resume/report";
import { ScoreCircle } from "./ScoreCircle";
import { SkillBadges } from "./SkillBadges";
import { StrengthBars } from "./StrengthBars";
import { KeywordMatcher } from "./KeywordMatcher";
import { Suggestions } from "./Suggestions";
import { Achievements } from "./Achievements";
import { ResumeInfoCards } from "./ResumeInfoCards";

export function Dashboard({ analysis, onReset }: { analysis: Analysis; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your analysis</h2>
          <p className="text-sm text-muted-foreground">
            Recruiter-ready insights based on your uploaded resume.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
          >
            <RotateCcw className="size-4" /> New resume
          </button>
          <button
            onClick={() => downloadReport(analysis)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-95 btn-glow"
          >
            <Download className="size-4" /> Download report
          </button>
        </div>
      </div>

      <ResumeInfoCards p={analysis.parsed} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card icon={Sparkles} title="ATS Score" subtitle="Overall recruiter compatibility">
          <div className="grid place-items-center py-2">
            <ScoreCircle score={analysis.atsScore} />
          </div>
        </Card>

        <Card icon={BarChart3} title="Resume Strength" subtitle="Section by section">
          <StrengthBars strength={analysis.strength} />
        </Card>

        <Card icon={ListChecks} title="Skills Found" subtitle={`${analysis.parsed.skills.length} detected`}>
          <SkillBadges skills={analysis.parsed.skills} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card icon={AlertTriangle} title="Missing Skills" subtitle="vs. standard developer profile">
          <SkillBadges skills={analysis.missingSkills} variant="missing" />
        </Card>
        <Card icon={Sparkles} title="Improvement Suggestions" subtitle="Actionable next steps">
          <Suggestions items={analysis.suggestions} />
        </Card>
      </div>

      <Card icon={ListChecks} title="Keyword Match Analyzer" subtitle="Compare against a job description">
        <KeywordMatcher resumeText={analysis.parsed.rawText} />
      </Card>

      <Card icon={Sparkles} title="Achievements" subtitle="Earned by your resume">
        <Achievements items={analysis.achievements} />
      </Card>
    </motion.div>
  );
}

function Card({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}
