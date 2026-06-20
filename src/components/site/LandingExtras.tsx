import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Sparkles, ShieldCheck, Zap, FileSearch, Briefcase, LineChart, Map, Target, Layers, Trophy,
  ChevronDown,
} from "lucide-react";

export function LandingExtras({ onCTA, onDemo }: { onCTA: () => void; onDemo: () => void }) {
  return (
    <>
      {/* Stats */}
      <section className="mt-24">
        <div className="glass grid grid-cols-2 gap-4 rounded-3xl p-8 sm:grid-cols-4">
          <Stat value={12} suffix="+" label="Signals analyzed" />
          <Stat value={5} label="Career paths" />
          <Stat value={100} suffix="%" label="Browser-side" />
          <Stat value={0} label="API keys needed" />
        </div>
      </section>

      {/* Feature grid */}
      <section className="mt-24">
        <SectionHead eyebrow="Built like a real product" title="Everything a job seeker actually needs" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className="glass rounded-2xl p-5"
            >
              <div className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
                <f.icon className="size-4" />
              </div>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mt-24">
        <SectionHead eyebrow="Loved by job seekers" title="What people say" />
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass flex flex-col gap-4 rounded-2xl p-5"
            >
              <blockquote className="text-sm leading-relaxed text-foreground/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span
                  className="grid size-9 place-items-center rounded-full text-sm font-semibold text-primary-foreground"
                  style={{ background: t.gradient }}
                >
                  {t.initials}
                </span>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-24">
        <SectionHead eyebrow="FAQ" title="Questions, answered" />
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQ.map((q, i) => (
            <Faq key={i} q={q.q} a={q.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(600px 240px at 50% 0%, color-mix(in oklab, var(--primary) 25%, transparent), transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold tracking-tight">Ready to land that interview?</h3>
            <p className="mt-2 text-muted-foreground">Drop a resume and get recruiter-grade feedback in seconds.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onCTA}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-95 btn-glow"
              >
                Analyze your resume
              </button>
              <button
                onClick={onDemo}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-medium transition-colors hover:bg-surface"
              >
                See demo report
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const FEATURES = [
  { icon: ShieldCheck, title: "100% Private", body: "Parsed entirely in your browser. Nothing is uploaded." },
  { icon: Zap, title: "Interview Readiness", body: "A second score that measures depth, not just keywords." },
  { icon: Map, title: "Career Roadmap", body: "See the next skill, project and milestone for your target role." },
  { icon: Layers, title: "Project Quality", body: "Each project gets a complexity tier — Basic, Intermediate, Advanced." },
  { icon: Target, title: "Job Match Center", body: "Compare against 5 popular roles and see exact gaps." },
  { icon: Briefcase, title: "Recruiter View", body: "Shortlist · Maybe · Reject — with strengths and concerns." },
  { icon: LineChart, title: "Score History", body: "Track how your resume improves across iterations." },
  { icon: FileSearch, title: "Impact Meter", body: "Rewrite weak bullets with quantified, recruiter-ready language." },
  { icon: Trophy, title: "Achievements", body: "Unlock badges as your resume crosses key milestones." },
];

const TESTIMONIALS = [
  {
    quote: "Replaced three different tools for me. The recruiter view is genuinely useful.",
    name: "Ananya R.", role: "SDE intern at a fintech", initials: "AR",
    gradient: "linear-gradient(135deg, #3B82F6, #22C55E)",
  },
  {
    quote: "The interview readiness score made me rewrite my projects section in 20 minutes.",
    name: "Karthik M.", role: "Frontend Engineer", initials: "KM",
    gradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
  },
  {
    quote: "Beautiful UI and the keyword match actually pinpointed the gaps for a JD I was applying to.",
    name: "Sara P.", role: "Final-year CS student", initials: "SP",
    gradient: "linear-gradient(135deg, #22C55E, #3B82F6)",
  },
];

const FAQ = [
  { q: "Is my resume uploaded to a server?", a: "No. Parsing happens in your browser using pdf.js and mammoth — your file never leaves your device." },
  { q: "Which file types are supported?", a: "PDF and DOCX, up to 5MB. Plain text files also work." },
  { q: "How is the ATS score calculated?", a: "We weight Skills (25%), Experience (25%), Projects (20%), Education (15%), and Formatting (15%) — the same buckets recruiters scan first." },
  { q: "What is Interview Readiness?", a: "A second score that measures depth: project complexity, quantified outcomes, and experience signals — not just keyword presence." },
  { q: "Do I need an account?", a: "No. Your history is stored locally in your browser." },
];

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-2xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="font-medium">{q}</span>
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="px-4 pb-4 text-sm text-muted-foreground">{a}</p>
      </motion.div>
    </div>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1200);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className="text-center">
      <div className="text-3xl font-bold tracking-tight">
        {n}
        {suffix}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8 text-center">
      <div className="text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</div>
      <h2 className="mt-1 text-3xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

export { Sparkles };
