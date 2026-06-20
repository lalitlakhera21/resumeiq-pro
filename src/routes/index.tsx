import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, FileSearch, Sparkles } from "lucide-react";

import { ThemeProvider } from "@/lib/theme";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { UploadZone } from "@/components/resume/UploadZone";
import { Analyzing } from "@/components/resume/Analyzing";
import { Dashboard } from "@/components/resume/Dashboard";
import { parseResume, readFileAsText } from "@/lib/resume/parser";
import { analyzeResume, type Analysis } from "@/lib/resume/analyzer";
import { DEMO_RESUME_TEXT } from "@/lib/resume/demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeIQ — ATS Resume Analyzer for Modern Job Seekers" },
      {
        name: "description",
        content:
          "Analyze your resume against ATS systems, see missing skills, match against job descriptions and get actionable improvements — instantly, in your browser.",
      },
      { property: "og:title", content: "ResumeIQ — ATS Resume Analyzer" },
      {
        property: "og:description",
        content:
          "Modern ATS resume analyzer with keyword matching, scoring and downloadable reports.",
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

  const runFile = async (file: File) => {
    setError(null);
    setStatus("analyzing");
    try {
      const text = await readFileAsText(file);
      // Small artificial delay so the loader stages can breathe.
      await new Promise((r) => setTimeout(r, 700));
      const parsed = parseResume(text);
      const result = analyzeResume(parsed);
      setAnalysis(result);
      setStatus("done");
      requestAnimationFrame(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (e: any) {
      setError(e?.message ?? "Could not read your file.");
      setStatus("idle");
    }
  };

  const runDemo = async () => {
    setStatus("analyzing");
    await new Promise((r) => setTimeout(r, 900));
    const parsed = parseResume(DEMO_RESUME_TEXT);
    setAnalysis(analyzeResume(parsed));
    setStatus("done");
    requestAnimationFrame(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const reset = () => {
    setAnalysis(null);
    setStatus("idle");
    requestAnimationFrame(() => {
      document.getElementById("analyze")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
            Built for modern job seekers and recruiters
          </div>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            <span className="text-gradient">ResumeIQ</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Analyze your resume, improve ATS compatibility, and increase your chances of landing the interview.
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

        {/* Feature strip */}
        <div id="features" className="mt-16 grid gap-4 sm:grid-cols-3">
          <Feature
            icon={ShieldCheck}
            title="100% Private"
            body="Files are parsed in your browser. Nothing leaves your device."
          />
          <Feature
            icon={Zap}
            title="Instant Insights"
            body="ATS score, strengths, missing skills and keyword match in seconds."
          />
          <Feature
            icon={FileSearch}
            title="Recruiter Lens"
            body="Quantified, actionable suggestions modeled on real hiring filters."
          />
        </div>
      </section>

      {/* Upload */}
      <section id="analyze" className="scroll-mt-24">
        <SectionTitle eyebrow="Step 1" title="Upload your resume" />
        {status !== "analyzing" && <UploadZone onFile={runFile} onDemo={runDemo} />}
        {status === "analyzing" && <Analyzing />}
        {error && (
          <p className="mt-4 text-center text-sm text-destructive">{error}</p>
        )}
      </section>

      {/* How */}
      <section id="how" className="mt-20 scroll-mt-24">
        <SectionTitle eyebrow="How it works" title="Three steps to a sharper resume" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { n: "01", t: "Upload", d: "Drop a PDF or DOCX — we extract structure and content." },
            { n: "02", t: "Analyze", d: "We score ATS readiness across five recruiter-grade signals." },
            { n: "03", t: "Improve", d: "Get targeted suggestions and a downloadable report." },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6"
            >
              <div className="text-xs font-medium text-primary">{s.n}</div>
              <div className="mt-1 text-lg font-semibold">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Results */}
      <section id="results" className="mt-20 scroll-mt-24">
        {analysis && status === "done" && <Dashboard analysis={analysis} onReset={reset} />}
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass rounded-2xl p-5"
    >
      <div className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
        <Icon className="size-4" />
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </motion.div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <div className="text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</div>
      <h2 className="mt-1 text-3xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}
