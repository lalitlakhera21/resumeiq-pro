import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { ThemeProvider } from "@/lib/theme";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { LandingExtras } from "@/components/site/LandingExtras";
import { UploadZone } from "@/components/resume/UploadZone";
import { Analyzing } from "@/components/resume/Analyzing";
import { Dashboard } from "@/components/resume/Dashboard";
import { parseResume, readFileAsText } from "@/lib/resume/parser";
import { analyzeResume, type Analysis } from "@/lib/resume/analyzer";
import { DEMO_RESUME_TEXT } from "@/lib/resume/demo";
import { clearHistory, loadHistory, saveHistory, type HistoryEntry } from "@/lib/resume/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeIQ — Career Intelligence for Job Seekers" },
      {
        name: "description",
        content:
          "Get an ATS score, interview readiness, recruiter view, career roadmap, project quality and job match — instantly, in your browser.",
      },
      { property: "og:title", content: "ResumeIQ — Career Intelligence Platform" },
      {
        property: "og:description",
        content:
          "ATS score, interview readiness, recruiter view, career roadmap, project quality and job match in one premium tool.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ThemeProvider>
      <div id="top" className="min-h-screen">
        <Navbar />
        <Home />
        <Footer />
      </div>
    </ThemeProvider>
  );
}

function Home() {
  const [status, setStatus] = useState<"idle" | "analyzing" | "done">("idle");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const finalize = (a: Analysis) => {
    setAnalysis(a);
    const updated = saveHistory({
      atsScore: a.atsScore,
      interviewScore: a.interviewScore,
      name: a.parsed.name,
    });
    setHistory(updated);
    setStatus("done");
    requestAnimationFrame(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const runFile = async (file: File) => {
    setError(null);
    setStatus("analyzing");
    try {
      const text = await readFileAsText(file);
      await new Promise((r) => setTimeout(r, 700));
      const parsed = parseResume(text);
      finalize(analyzeResume(parsed));
    } catch (e: any) {
      setError(e?.message ?? "Could not read your file.");
      setStatus("idle");
    }
  };

  const runDemo = async () => {
    setStatus("analyzing");
    await new Promise((r) => setTimeout(r, 900));
    const parsed = parseResume(DEMO_RESUME_TEXT);
    finalize(analyzeResume(parsed));
  };

  const reset = () => {
    setAnalysis(null);
    setStatus("idle");
    requestAnimationFrame(() => {
      document.getElementById("analyze")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const goAnalyze = () => {
    document.getElementById("analyze")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Career intelligence for modern job seekers
          </div>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            <span className="text-gradient">ResumeIQ</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Analyze your resume, see how recruiters score you, find your next skill and land the interview.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#analyze"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-95 btn-glow"
            >
              Analyze Resume <ArrowRight className="size-4" />
            </a>
            <button
              onClick={runDemo}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-medium transition-colors hover:bg-surface"
            >
              View Demo Report
            </button>
          </div>
        </motion.div>
      </section>

      {/* Upload */}
      <section id="analyze" className="scroll-mt-24">
        <SectionTitle eyebrow="Step 1" title="Upload your resume" />
        {status !== "analyzing" && <UploadZone onFile={runFile} onDemo={runDemo} />}
        {status === "analyzing" && <Analyzing />}
        {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
      </section>

      {/* Results */}
      <section id="results" className="mt-16 scroll-mt-24">
        {analysis && status === "done" && (
          <Dashboard
            analysis={analysis}
            history={history}
            onClearHistory={handleClearHistory}
            onReset={reset}
          />
        )}
      </section>

      {/* How it works */}
      <section id="how" className="mt-24 scroll-mt-24">
        <SectionTitle eyebrow="How it works" title="Three steps to a sharper resume" centered />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { n: "01", t: "Upload", d: "Drop a PDF or DOCX — we extract structure and content." },
            { n: "02", t: "Analyze", d: "Two scores, heatmap, project quality and recruiter view." },
            { n: "03", t: "Improve", d: "Targeted suggestions, rewrites and a downloadable report." },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="glass rounded-2xl p-6"
            >
              <div className="text-xs font-medium text-primary">{s.n}</div>
              <div className="mt-1 text-lg font-semibold">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <LandingExtras onCTA={goAnalyze} onDemo={runDemo} />
    </main>
  );
}

function SectionTitle({
  eyebrow,
  title,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  centered?: boolean;
}) {
  return (
    <div className={`mb-8 ${centered ? "text-center" : ""}`}>
      <div className="text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</div>
      <h2 className="mt-1 text-3xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}
