import { extractKeywords, STANDARD_DEV_SKILLS, type ParsedResume } from "./parser";

export type Strength = {
  skills: number;
  projects: number;
  education: number;
  experience: number;
  formatting: number;
};

export type Analysis = {
  parsed: ParsedResume;
  atsScore: number;
  strength: Strength;
  missingSkills: string[];
  suggestions: string[];
  achievements: { id: string; title: string; description: string; unlocked: boolean }[];
};

export function analyzeResume(parsed: ParsedResume): Analysis {
  const skills = clamp(parsed.skills.length * 8, 0, 100); // 12+ skills => 100
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

  const suggestions: string[] = [];
  if (parsed.skills.length < 8) suggestions.push("Add more technical skills relevant to your target role.");
  if (parsed.projects.length < 2) suggestions.push("Showcase at least 2-3 projects with measurable impact.");
  if (!parsed.links.some((l) => /github/i.test(l))) suggestions.push("Add a GitHub link to highlight your code.");
  if (!parsed.links.some((l) => /linkedin/i.test(l))) suggestions.push("Include a LinkedIn URL for credibility.");
  if (parsed.experience.length < 2) suggestions.push("Add internship or work experience with quantified outcomes.");
  if (missingSkills.includes("REST API")) suggestions.push("Mention REST API design or consumption experience.");
  if (missingSkills.includes("SQL")) suggestions.push("Add SQL or relational database experience.");
  if (missingSkills.includes("Docker")) suggestions.push("Highlight containerization (Docker) if relevant.");
  if (!/\d+%|\d+\+/.test(parsed.rawText)) suggestions.push("Use numbers and percentages to quantify achievements.");
  if (parsed.rawText.length < 1200) suggestions.push("Resume looks short — add more depth to projects and experience.");
  if (suggestions.length === 0) suggestions.push("Your resume looks strong. Tailor keywords for each job application.");

  const achievements = [
    { id: "ats80", title: "ATS Score 80+", description: "Reached an ATS score above 80.", unlocked: atsScore >= 80 },
    { id: "ats90", title: "ATS Score 90+", description: "Elite ATS optimization.", unlocked: atsScore >= 90 },
    { id: "complete", title: "Complete Resume", description: "Has skills, education and experience.", unlocked: parsed.skills.length > 0 && parsed.education.length > 0 && parsed.experience.length > 0 },
    { id: "linked", title: "Connected Profile", description: "Includes GitHub or LinkedIn.", unlocked: parsed.links.some((l) => /github|linkedin/i.test(l)) },
  ];

  return { parsed, atsScore, strength, missingSkills, suggestions, achievements };
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
