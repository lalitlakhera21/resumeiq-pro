import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Download, RotateCcw, Sparkles, ListChecks, AlertTriangle, BarChart3,
  Briefcase, User, LineChart, Map, Layers, Target, Flame, Trophy, Activity, Bug,
} from "lucide-react";
import type { Analysis } from "@/lib/resume/analyzer";
import { downloadReport } from "@/lib/resume/report";
import { ScoreCard } from "./ScoreCard";
import { SkillBadges } from "./SkillBadges";
import { StrengthBars } from "./StrengthBars";
import { KeywordMatcher } from "./KeywordMatcher";
import { Suggestions } from "./Suggestions";
import { Achievements } from "./Achievements";
import { ResumeInfoCards } from "./ResumeInfoCards";
import { CareerRoadmapView } from "./CareerRoadmapView";
import { ProjectQualityView } from "./ProjectQualityView";
import { ResumeHeatmap } from "./ResumeHeatmap";
import { RecruiterView } from "./RecruiterView";
import { JobMatchCenter } from "./JobMatchCenter";
import { ImpactMeter } from "./ImpactMeter";
import { ScoreHistory } from "./ScoreHistory";
import { ParserDebugPanel } from "./ParserDebugPanel";
import type { HistoryEntry } from "@/lib/resume/history";

type Mode = "candidate" | "recruiter";

export function Dashboard({
  analysis,
  history,
  onClearHistory,
  onReset,
}: {
  analysis: Analysis;
  history: HistoryEntry[];
  onClearHistory: () => void;
  onReset: () => void;
}) {
  const [mode, setMode] = useState<Mode>("candidate");

  useEffect(() => {
    if (analysis.atsScore >= 90 || analysis.interviewScore >= 90) {
      const end = Date.now() + 800;
      (function frame() {
        confetti({
          particleCount: 4,
          startVelocity: 35,
          spread: 70,
          origin: { x: Math.random(), y: Math.random() * 0.3 },
          colors: ["#3B82F6", "#22C55E", "#F59E0B"],
          disableForReducedMotion: true,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [analysis.atsScore, analysis.interviewScore]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your analysis</h2>
          <p className="text-sm text-muted-foreground">
            Recruiter-grade insights based on your uploaded resume.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle mode={mode} onChange={setMode} />
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

      {/* Scores */}
      <div className="grid gap-4 md:grid-cols-2">
        <ScoreCard
          label="ATS Score"
          score={analysis.atsScore}
          hint="Recruiter & applicant-tracking system compatibility."
        />
        <ScoreCard
          label="Interview Readiness"
          score={analysis.interviewScore}
          tone="accent"
          hint="Depth signal: project complexity, quantified impact, experience."
        />
      </div>

      {mode === "recruiter" ? (
        <>
          <Card icon={Briefcase} title="Recruiter view" subtitle="How a hiring manager would react">
            <RecruiterView verdict={analysis.recruiter} />
          </Card>
          <Card icon={Target} title="Job Match Center" subtitle="Match against common roles">
            <JobMatchCenter matches={analysis.jobMatches} />
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card icon={Flame} title="Resume Heatmap" subtitle="Strong · Average · Weak per section">
              <ResumeHeatmap cells={analysis.heatmap} />
            </Card>
            <Card icon={Layers} title="Project Quality" subtitle="Per-project complexity rating">
              <ProjectQualityView items={analysis.projectQuality} />
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card icon={BarChart3} title="Resume Strength" subtitle="Section by section">
              <StrengthBars strength={analysis.strength} />
            </Card>
            <Card icon={ListChecks} title="Skills Found" subtitle={`${analysis.parsed.skills.length} detected`}>
              <SkillBadges skills={analysis.parsed.skills} />
            </Card>
            <Card icon={AlertTriangle} title="Missing Skills" subtitle="vs. standard dev profile">
              <SkillBadges skills={analysis.missingSkills} variant="missing" />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card icon={Flame} title="Resume Heatmap" subtitle="Where your resume is strong or weak">
              <ResumeHeatmap cells={analysis.heatmap} />
            </Card>
            <Card icon={Map} title="Career Roadmap" subtitle="Your next moves">
              <CareerRoadmapView roadmap={analysis.roadmap} />
            </Card>
          </div>

          <Card icon={Target} title="Job Match Center" subtitle="Compare against 5 popular roles">
            <JobMatchCenter matches={analysis.jobMatches} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card icon={Layers} title="Project Quality" subtitle="Per-project complexity">
              <ProjectQualityView items={analysis.projectQuality} />
            </Card>
            <Card icon={Activity} title="Impact Meter" subtitle="Before & after rewrites">
              <ImpactMeter items={analysis.impactRewrites} />
            </Card>
          </div>

          <Card icon={Sparkles} title="Improvement Suggestions" subtitle="Actionable next steps">
            <Suggestions items={analysis.suggestions} />
          </Card>

          <Card icon={ListChecks} title="Keyword Match Analyzer" subtitle="Compare against a job description">
            <KeywordMatcher resumeText={analysis.parsed.rawText} />
          </Card>

          <Card icon={LineChart} title="Score History" subtitle="Your progress across analyses">
            <ScoreHistory entries={history} onClear={onClearHistory} />
          </Card>

          <Card icon={Trophy} title="Achievements" subtitle="Earned by your resume">
            <Achievements items={analysis.achievements} />
          </Card>
        </>
      )}
    </motion.div>
  );
}

function ViewToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="relative inline-flex rounded-xl border border-border bg-surface/60 p-1 text-sm">
      {(["candidate", "recruiter"] as Mode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`relative z-10 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
            mode === m ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {m === "candidate" ? <User className="size-3.5" /> : <Briefcase className="size-3.5" />}
          {m === "candidate" ? "Candidate" : "Recruiter"}
          {mode === m && (
            <motion.span
              layoutId="view-toggle"
              className="absolute inset-0 -z-10 rounded-lg bg-primary"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
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
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}
