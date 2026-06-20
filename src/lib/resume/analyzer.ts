import { extractKeywords, STANDARD_DEV_SKILLS, type ParsedResume } from "./parser";

export type Strength = {
  skills: number;
  projects: number;
  education: number;
  experience: number;
  formatting: number;
};

export type ProjectQuality = {
  title: string;
  complexity: "Basic" | "Intermediate" | "Advanced";
  score: number; // 0-100
  signals: string[];
};

export type ImpactRewrite = {
  before: string;
  after: string;
};

export type HeatmapCell = {
  section: string;
  level: "strong" | "average" | "weak";
  score: number;
};

export type RecruiterVerdict = {
  decision: "Shortlist" | "Maybe" | "Reject";
  reasoning: string;
  strengths: string[];
  concerns: string[];
};

export type JobRole = {
  id: string;
  title: string;
  emoji: string;
  required: string[];
};

export type JobMatch = {
  role: JobRole;
  matchPct: number;
  matched: string[];
  missing: string[];
};

export type CareerRoadmap = {
  level: "Beginner" | "Intermediate" | "Advanced";
  targetRole: string;
  steps: { title: string; description: string; done: boolean }[];
};

export type Analysis = {
  parsed: ParsedResume;
  atsScore: number;
  interviewScore: number;
  strength: Strength;
  missingSkills: string[];
  suggestions: string[];
  achievements: { id: string; title: string; description: string; unlocked: boolean }[];
  projectQuality: ProjectQuality[];
  heatmap: HeatmapCell[];
  recruiter: RecruiterVerdict;
  jobMatches: JobMatch[];
  impactRewrites: ImpactRewrite[];
  roadmap: CareerRoadmap;
};

export const JOB_ROLES: JobRole[] = [
  {
    id: "frontend",
    title: "Frontend Developer",
    emoji: "🎨",
    required: ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Tailwind", "Git", "REST API", "Testing"],
  },
  {
    id: "backend",
    title: "Backend Developer",
    emoji: "⚙️",
    required: ["Node.js", "Express", "REST API", "SQL", "PostgreSQL", "MongoDB", "Docker", "Git", "AWS"],
  },
  {
    id: "fullstack",
    title: "Full Stack Developer",
    emoji: "🚀",
    required: ["React", "Node.js", "TypeScript", "SQL", "REST API", "Git", "Docker", "AWS", "Tailwind"],
  },
  {
    id: "ai",
    title: "AI Engineer",
    emoji: "🧠",
    required: ["Python", "PyTorch", "TensorFlow", "Pandas", "NumPy", "Machine Learning", "Deep Learning", "NLP", "Git"],
  },
  {
    id: "data",
    title: "Data Analyst",
    emoji: "📊",
    required: ["Python", "SQL", "Pandas", "NumPy", "PostgreSQL", "Git"],
  },
];

export function analyzeResume(parsed: ParsedResume): Analysis {
  const skills = clamp(parsed.skills.length * 8, 0, 100);
  const projects = clamp(parsed.projects.length * 18, 0, 100);
  const experience = clamp(parsed.experience.length * 16, 0, 100);
  const education = clamp(parsed.education.length * 30, 0, 100);
  const formatting = scoreFormatting(parsed);

  const strength: Strength = { skills, projects, experience, education, formatting };

  const atsScore = Math.round(
    skills * 0.25 + projects * 0.2 + experience * 0.25 + education * 0.15 + formatting * 0.15,
  );

  const lowerSkills = new Set(parsed.skills.map((s) => s.toLowerCase()));
  const missingSkills = STANDARD_DEV_SKILLS.filter((s) => !lowerSkills.has(s.toLowerCase()));

  const suggestions = buildSuggestions(parsed, missingSkills);
  const projectQuality = analyzeProjects(parsed);
  const interviewScore = computeInterviewScore(parsed, projectQuality, strength);

  const heatmap: HeatmapCell[] = [
    { section: "Contact Info", score: parsed.email && parsed.phone ? 95 : parsed.email ? 65 : 25, level: "strong" },
    { section: "Skills", score: skills, level: "strong" },
    { section: "Projects", score: projects, level: "strong" },
    { section: "Experience", score: experience, level: "strong" },
    { section: "Education", score: education, level: "strong" },
    { section: "Links / Profiles", score: parsed.links.length ? Math.min(100, parsed.links.length * 35) : 0, level: "strong" },
    { section: "Impact / Metrics", score: countMetrics(parsed.rawText) * 18, level: "strong" },
    { section: "Achievements", score: /achievement|award|hackathon|certification/i.test(parsed.rawText) ? 80 : 20, level: "strong" },
  ].map((c) => ({ ...c, level: levelFor(c.score) }));

  const recruiter = recruiterVerdict(atsScore, interviewScore, parsed, projectQuality);
  const jobMatches = JOB_ROLES.map((r) => matchRole(r, parsed));
  const impactRewrites = buildImpactRewrites(parsed);
  const roadmap = buildRoadmap(parsed, projectQuality, jobMatches);

  const achievements = [
    { id: "ats80", title: "ATS Score 80+", description: "Reached an ATS score above 80.", unlocked: atsScore >= 80 },
    { id: "ats90", title: "ATS Score 90+", description: "Elite ATS optimization.", unlocked: atsScore >= 90 },
    { id: "iv80", title: "Interview Ready", description: "Interview Readiness above 80.", unlocked: interviewScore >= 80 },
    { id: "complete", title: "Complete Resume", description: "Skills, education and experience present.", unlocked: parsed.skills.length > 0 && parsed.education.length > 0 && parsed.experience.length > 0 },
    { id: "linked", title: "Connected Profile", description: "Includes GitHub or LinkedIn.", unlocked: parsed.links.some((l) => /github|linkedin/i.test(l)) },
    { id: "advProj", title: "Advanced Builder", description: "Has at least one advanced project.", unlocked: projectQuality.some((p) => p.complexity === "Advanced") },
  ];

  return {
    parsed,
    atsScore,
    interviewScore,
    strength,
    missingSkills,
    suggestions,
    achievements,
    projectQuality,
    heatmap,
    recruiter,
    jobMatches,
    impactRewrites,
    roadmap,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function scoreFormatting(p: ParsedResume): number {
  let score = 40;
  if (p.email) score += 15;
  if (p.phone) score += 10;
  if (p.name) score += 10;
  if (p.links.length) score += 10;
  const len = p.rawText.length;
  if (len > 1500 && len < 8000) score += 15;
  else if (len > 800) score += 8;
  return clamp(score, 0, 100);
}

function countMetrics(text: string): number {
  const matches = text.match(/\b\d+(?:[.,]\d+)?\s?(?:%|\+|k|x|users?|customers?|hours?|days?|weeks?|months?|requests?)\b/gi);
  return matches?.length ?? 0;
}

function levelFor(score: number): "strong" | "average" | "weak" {
  if (score >= 70) return "strong";
  if (score >= 40) return "average";
  return "weak";
}

function buildSuggestions(parsed: ParsedResume, missing: string[]): string[] {
  const s: string[] = [];
  if (parsed.skills.length < 8) s.push("Add more technical skills relevant to your target role.");
  if (parsed.projects.length < 2) s.push("Showcase at least 2-3 projects with measurable impact.");
  if (!parsed.links.some((l) => /github/i.test(l))) s.push("Add a GitHub link to highlight your code.");
  if (!parsed.links.some((l) => /linkedin/i.test(l))) s.push("Include a LinkedIn URL for credibility.");
  if (parsed.experience.length < 2) s.push("Add internship or work experience with quantified outcomes.");
  if (missing.includes("REST API")) s.push("Mention REST API design or consumption experience.");
  if (missing.includes("SQL")) s.push("Add SQL or relational database experience.");
  if (missing.includes("Docker")) s.push("Highlight containerization (Docker) if relevant.");
  if (!/\d+%|\d+\+/.test(parsed.rawText)) s.push("Use numbers and percentages to quantify achievements.");
  if (parsed.rawText.length < 1200) s.push("Resume looks short — add more depth to projects and experience.");
  if (s.length === 0) s.push("Your resume looks strong. Tailor keywords for each application.");
  return s;
}

function analyzeProjects(parsed: ParsedResume): ProjectQuality[] {
  // Each non-empty line that looks like a project title (often the first line of a bullet).
  const titles = parsed.projects
    .filter((l) => /^[A-Z0-9]/.test(l) && l.length < 100)
    .slice(0, 6);
  if (!titles.length) return [];
  const text = parsed.rawText.toLowerCase();

  const advancedTokens = ["machine learning", "ai", "neural", "kubernetes", "microservice", "real-time", "graphql", "websocket", "blockchain", "scalable"];
  const intermediateTokens = ["api", "database", "auth", "payment", "dashboard", "deploy", "docker", "fullstack", "full-stack", "redux", "next.js"];

  return titles.map((title) => {
    const lower = title.toLowerCase();
    let score = 35;
    const signals: string[] = [];
    if (advancedTokens.some((t) => lower.includes(t) || text.includes(t))) {
      score += 35;
      signals.push("Advanced concepts mentioned");
    }
    if (intermediateTokens.some((t) => lower.includes(t))) {
      score += 20;
      signals.push("Integration / infra signals");
    }
    if (/\d+(k|%|\+)/.test(title)) {
      score += 15;
      signals.push("Has quantified impact");
    }
    if (parsed.links.some((l) => /github/i.test(l))) {
      score += 8;
      signals.push("GitHub linked");
    }
    score = clamp(score, 10, 100);
    const complexity: ProjectQuality["complexity"] =
      score >= 75 ? "Advanced" : score >= 50 ? "Intermediate" : "Basic";
    if (!signals.length) signals.push("Basic CRUD or static project");
    return { title: title.replace(/[•\-–—]\s*/, "").slice(0, 80), complexity, score, signals };
  });
}

function computeInterviewScore(parsed: ParsedResume, pq: ProjectQuality[], st: Strength): number {
  const projComplexity = pq.length
    ? pq.reduce((a, p) => a + p.score, 0) / pq.length
    : 0;
  const depth = st.experience * 0.35 + projComplexity * 0.35 + st.skills * 0.2 + st.formatting * 0.1;
  // Penalize if no quantified achievements
  const metrics = countMetrics(parsed.rawText);
  const bonus = clamp(metrics * 3, 0, 15);
  return clamp(Math.round(depth + bonus - (metrics === 0 ? 10 : 0)), 0, 100);
}

function recruiterVerdict(
  ats: number,
  iv: number,
  parsed: ParsedResume,
  pq: ProjectQuality[],
): RecruiterVerdict {
  const avg = (ats + iv) / 2;
  const strengths: string[] = [];
  const concerns: string[] = [];

  if (parsed.skills.length >= 10) strengths.push(`Strong skills coverage (${parsed.skills.length} technologies).`);
  if (pq.some((p) => p.complexity === "Advanced")) strengths.push("Ships advanced, non-trivial projects.");
  if (parsed.links.some((l) => /github/i.test(l))) strengths.push("Public GitHub presence.");
  if (parsed.experience.length >= 3) strengths.push("Has real-world work or internship experience.");
  if (countMetrics(parsed.rawText) >= 3) strengths.push("Quantifies impact with numbers.");

  if (parsed.skills.length < 6) concerns.push("Skill list looks thin for most roles.");
  if (parsed.projects.length < 2) concerns.push("Few projects to evaluate technical depth.");
  if (!parsed.links.some((l) => /github/i.test(l))) concerns.push("No GitHub link — hard to verify code quality.");
  if (countMetrics(parsed.rawText) === 0) concerns.push("No measurable outcomes in bullets.");
  if (parsed.experience.length < 2) concerns.push("Limited work or internship experience.");

  let decision: RecruiterVerdict["decision"];
  let reasoning: string;
  if (avg >= 78) {
    decision = "Shortlist";
    reasoning = "Solid ATS readiness and strong evidence of project depth — likely to move forward.";
  } else if (avg >= 58) {
    decision = "Maybe";
    reasoning = "Promising profile, but a few signals are missing for an immediate shortlist.";
  } else {
    decision = "Reject";
    reasoning = "Resume needs more depth, quantified outcomes and verifiable work before consideration.";
  }
  if (!strengths.length) strengths.push("Resume successfully parsed and structured.");
  if (!concerns.length) concerns.push("Tailor keywords to each job description for highest match.");

  return { decision, reasoning, strengths: strengths.slice(0, 4), concerns: concerns.slice(0, 4) };
}

function matchRole(role: JobRole, parsed: ParsedResume): JobMatch {
  const lower = new Set(parsed.skills.map((s) => s.toLowerCase()));
  const matched: string[] = [];
  const missing: string[] = [];
  for (const r of role.required) {
    if (lower.has(r.toLowerCase())) matched.push(r);
    else missing.push(r);
  }
  const matchPct = Math.round((matched.length / role.required.length) * 100);
  return { role, matchPct, matched, missing };
}

function buildImpactRewrites(parsed: ParsedResume): ImpactRewrite[] {
  const candidates = [...parsed.projects, ...parsed.experience]
    .filter((l) => l.length > 10 && l.length < 160)
    .filter((l) => !/\d+(%|\+|k|x)/i.test(l));
  const verbs = ["Built", "Made", "Created", "Worked on", "Developed", "Designed"];
  const samples = candidates.slice(0, 4);
  return samples.map((line) => {
    const clean = line.replace(/^[•\-–—\s]+/, "").trim();
    const verb = verbs.find((v) => clean.toLowerCase().startsWith(v.toLowerCase())) ?? "Built";
    const after = `${verb} ${clean
      .replace(new RegExp(`^${verb}`, "i"), "")
      .trim()} — used by 100+ users, improving task completion by 38%`;
    return { before: clean, after };
  });
}

function buildRoadmap(
  parsed: ParsedResume,
  pq: ProjectQuality[],
  matches: JobMatch[],
): CareerRoadmap {
  const skillCount = parsed.skills.length;
  const hasAdvanced = pq.some((p) => p.complexity === "Advanced");
  const level: CareerRoadmap["level"] =
    skillCount >= 12 && hasAdvanced ? "Advanced" : skillCount >= 7 ? "Intermediate" : "Beginner";

  const target = [...matches].sort((a, b) => b.matchPct - a.matchPct)[0];
  const targetRole = target?.role.title ?? "Full Stack Developer";
  const nextSkill = target?.missing[0] ?? "TypeScript";
  const ready = (target?.matchPct ?? 0) >= 75;

  return {
    level,
    targetRole,
    steps: [
      {
        title: `You are at ${level} level`,
        description: `Based on ${skillCount} detected skills and ${pq.length} project${pq.length === 1 ? "" : "s"}.`,
        done: true,
      },
      {
        title: `Learn ${nextSkill}`,
        description: `Closes a key gap for ${targetRole} roles.`,
        done: false,
      },
      {
        title: hasAdvanced ? "Ship one more advanced project" : "Build an advanced portfolio project",
        description: "Real users, a backend, auth, and a public deploy — proof of depth.",
        done: hasAdvanced,
      },
      {
        title: `Apply for ${targetRole}`,
        description: ready
          ? "Your profile already matches — start applying."
          : `Currently ${target?.matchPct ?? 0}% match — keep iterating.`,
        done: ready,
      },
    ],
  };
}

export function keywordMatch(resumeText: string, jobDescription: string) {
  const jdKeywords = extractKeywords(jobDescription);
  const resumeTokens = new Set(
    resumeText
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/),
  );
  const matched: string[] = [];
  const missing: string[] = [];
  for (const k of jdKeywords) {
    if (resumeTokens.has(k)) matched.push(k);
    else missing.push(k);
  }
  const pct = jdKeywords.length ? Math.round((matched.length / jdKeywords.length) * 100) : 0;
  return { matchPct: pct, matched, missing, total: jdKeywords.length };
}
