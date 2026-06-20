// Client-only resume parser. All heavy libs are dynamically imported.

export type ParsedResume = {
  rawText: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  education: string[];
  projects: string[];
  experience: string[];
  links: string[];
};

const SKILL_DICTIONARY = [
  // Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
  // Web
  "HTML", "CSS", "Sass", "Tailwind", "Bootstrap", "React", "Next.js", "Vue", "Angular", "Svelte", "Remix",
  "Redux", "Zustand", "Framer Motion",
  // Backend
  "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring", "Rails", "Laravel",
  // Data
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase", "Supabase", "GraphQL", "REST API",
  // Cloud / DevOps
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Jenkins", "Terraform",
  // Tools
  "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Figma", "Postman", "Linux",
  // Testing
  "Jest", "Vitest", "Cypress", "Playwright", "Selenium", "Testing",
  // Mobile
  "React Native", "Flutter", "Android", "iOS",
  // ML / Data
  "TensorFlow", "PyTorch", "Pandas", "NumPy", "Machine Learning", "Deep Learning", "NLP",
];

// Skills considered baseline for a modern software developer profile.
export const STANDARD_DEV_SKILLS = [
  "JavaScript", "TypeScript", "React", "Node.js", "REST API", "SQL", "Git", "GitHub",
  "HTML", "CSS", "Testing", "Docker", "AWS", "CI/CD",
];

export async function readFileAsText(file: File): Promise<string> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return await extractPdf(file);
  }
  if (lower.endsWith(".docx")) {
    return await extractDocx(file);
  }
  if (lower.endsWith(".txt")) {
    return await file.text();
  }
  throw new Error("Unsupported file type. Upload a PDF or DOCX.");
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist");
  const workerMod: any = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = workerMod.default;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => ("str" in it ? it.str : "")).join(" ");
    text += strings + "\n";
  }
  return text;
}

async function extractDocx(file: File): Promise<string> {
  const mod: any = await import(/* @vite-ignore */ "mammoth/mammoth.browser.js" as string).catch(
    () => import("mammoth" as string),
  );
  const mammoth = mod.default ?? mod;
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value as string;
}

export function parseResume(rawText: string): ParsedResume {
  const text = rawText.replace(/\r/g, "");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const email = (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || [null])[0];
  const phone = (text.match(/(\+?\d[\d\s().-]{7,}\d)/) || [null])[0];
  const links = Array.from(text.matchAll(/https?:\/\/[^\s)]+/g)).map((m) => m[0]);

  // Name heuristic: first non-empty line that's short and not an email/phone/URL
  let name: string | null = null;
  for (const l of lines.slice(0, 6)) {
    if (l.length > 60) continue;
    if (/@|http|\d{4,}/.test(l)) continue;
    if (l.split(" ").length > 5) continue;
    if (!/[A-Za-z]/.test(l)) continue;
    name = l.replace(/[•|·]/g, "").trim();
    break;
  }

  // Skills
  const lower = text.toLowerCase();
  const skills = SKILL_DICTIONARY.filter((s) => {
    const re = new RegExp(`(?:^|[^a-z0-9+#])${escapeReg(s.toLowerCase())}(?:[^a-z0-9+#]|$)`, "i");
    return re.test(lower);
  });

  const education = extractSection(text, ["education", "academic"]);
  const projects = extractSection(text, ["projects", "personal projects"]);
  const experience = extractSection(text, ["experience", "work experience", "employment", "internship"]);

  return {
    rawText: text,
    name,
    email,
    phone,
    skills,
    education,
    projects,
    experience,
    links,
  };
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSection(text: string, headings: string[]): string[] {
  const lines = text.split("\n");
  const out: string[] = [];
  let inSection = false;
  const headingRe = new RegExp(`^\\s*(${headings.join("|")})\\b`, "i");
  const otherSections = /^(skills|education|experience|projects|certifications|achievements|summary|contact|profile|interests|hobbies|languages|references)\b/i;

  for (const raw of lines) {
    const line = raw.trim();
    if (!inSection) {
      if (headingRe.test(line)) inSection = true;
      continue;
    }
    if (!line) {
      if (out.length && out[out.length - 1] !== "") out.push("");
      continue;
    }
    if (otherSections.test(line) && !headingRe.test(line)) break;
    out.push(line);
    if (out.length > 30) break;
  }
  return out.filter((l) => l.length > 0).slice(0, 12);
}

export function extractKeywords(text: string): string[] {
  const stop = new Set([
    "the", "and", "for", "with", "you", "your", "are", "from", "that", "this", "have", "has", "will",
    "our", "their", "they", "into", "over", "under", "than", "but", "not", "all", "any", "can", "should",
    "must", "able", "work", "team", "role", "job", "position", "experience", "year", "years",
    "or", "of", "to", "in", "on", "at", "by", "an", "a", "is", "be", "as", "we", "us", "it",
  ]);
  const counts = new Map<string, number>();
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !stop.has(t) && !/^\d+$/.test(t));
  for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([k]) => k);
}
