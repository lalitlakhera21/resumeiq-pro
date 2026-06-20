// Client-only resume parser. All heavy libs are dynamically imported.

export type SectionKey =
  | "skills"
  | "education"
  | "projects"
  | "experience"
  | "achievements"
  | "certifications"
  | "summary";

export type ParsedResume = {
  rawText: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  education: string[];
  projects: string[];
  experience: string[];
  achievements: string[];
  certifications: string[];
  links: string[];
  /** Map of section -> detected (heading found in the document). */
  sectionsDetected: Record<SectionKey, boolean>;
  /** 0-100, how confident we are the text was parsed correctly. */
  parsingConfidence: number;
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

// Heading synonyms for fuzzy section detection.
const SECTION_HEADINGS: Record<SectionKey, string[]> = {
  summary: ["summary", "profile", "objective", "about me", "career objective"],
  skills: [
    "skills", "technical skills", "core skills", "core competencies",
    "tools & technologies", "tools and technologies", "technologies", "tech stack",
    "key skills", "areas of expertise",
  ],
  education: [
    "education", "academic background", "academics", "qualifications",
    "educational qualifications", "academic qualifications", "education & training",
  ],
  projects: [
    "projects", "project experience", "academic projects", "personal projects",
    "key projects", "selected projects", "notable projects",
  ],
  experience: [
    "experience", "work experience", "professional experience", "employment",
    "employment history", "internship", "internships", "internship experience",
    "industry experience", "work history",
  ],
  achievements: [
    "achievements", "awards", "honors", "honours", "awards & honors",
    "accomplishments", "extracurricular", "extra-curricular", "co-curricular",
    "activities", "leadership",
  ],
  certifications: [
    "certifications", "certificates", "licenses", "courses", "trainings",
    "online courses", "professional development",
  ],
};

const ALL_SECTION_KEYS = Object.keys(SECTION_HEADINGS) as SectionKey[];

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
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    pages.push(await extractPageText(page));
  }
  return pages.join("\n\n");
}

/**
 * Coordinate-based line grouping: groups items by Y position to reconstruct
 * lines, then sorts left-to-right inside each line. This preserves headings
 * on their own line so section detection works.
 */
async function extractPageText(page: any): Promise<string> {
  const content = await page.getTextContent();
  const Y_TOLERANCE = 3;
  type Item = { str: string; x: number; y: number; width: number };
  const items: Item[] = [];
  for (const it of content.items) {
    if (!it || typeof it.str !== "string" || !it.str.trim()) continue;
    items.push({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5],
      width: it.width || it.str.length * 5,
    });
  }
  // Bucket by Y
  const lineMap = new Map<number, Item[]>();
  for (const it of items) {
    const key = Math.round(it.y / Y_TOLERANCE) * Y_TOLERANCE;
    if (!lineMap.has(key)) lineMap.set(key, []);
    lineMap.get(key)!.push(it);
  }
  const sorted = Array.from(lineMap.entries()).sort((a, b) => b[0] - a[0]);
  const lines: string[] = [];
  for (const [, row] of sorted) {
    row.sort((a, b) => a.x - b.x);
    let line = "";
    for (let i = 0; i < row.length; i++) {
      if (i > 0) {
        const prev = row[i - 1];
        const gap = row[i].x - (prev.x + prev.width);
        if (gap > 10) line += "   ";
        else if (gap > 1) line += " ";
      }
      line += row[i].str;
    }
    lines.push(line.replace(/\s+/g, " ").trim());
  }
  return lines.filter(Boolean).join("\n");
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

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Determine which section (if any) a line is a heading for. */
function detectHeading(line: string): SectionKey | null {
  const cleaned = line.replace(/[^\p{L}\p{N}&\s/-]/gu, " ").replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length > 60) return null;
  const lower = cleaned.toLowerCase();
  // Heuristics: heading lines are short and mostly the heading word(s).
  for (const key of ALL_SECTION_KEYS) {
    for (const h of SECTION_HEADINGS[key]) {
      const re = new RegExp(`^${escapeReg(h)}\\b[: ]*$`, "i");
      if (re.test(lower)) return key;
    }
  }
  // Allow ALL-CAPS / Title-case heading lines that *contain* the term and are short.
  if (cleaned.length <= 35) {
    for (const key of ALL_SECTION_KEYS) {
      for (const h of SECTION_HEADINGS[key]) {
        const re = new RegExp(`\\b${escapeReg(h)}\\b`, "i");
        if (re.test(lower)) {
          // Must not look like a sentence
          if (!/[.,;]/.test(cleaned)) return key;
        }
      }
    }
  }
  return null;
}

/** Split the resume into sections by walking lines and tracking headings. */
function splitSections(text: string): Record<SectionKey, string[]> {
  const out: Record<SectionKey, string[]> = {
    summary: [], skills: [], education: [], projects: [],
    experience: [], achievements: [], certifications: [],
  };
  const lines = text.split("\n").map((l) => l.trim());
  let current: SectionKey | null = null;
  for (const line of lines) {
    if (!line) continue;
    const heading = detectHeading(line);
    if (heading) {
      current = heading;
      continue;
    }
    if (current) out[current].push(line);
  }
  return out;
}

function extractSkillsFromBlock(block: string[], fullText: string): string[] {
  const haystack = (block.join(" ") + " " + fullText).toLowerCase();
  const found = new Set<string>();
  for (const s of SKILL_DICTIONARY) {
    const re = new RegExp(`(?:^|[^a-z0-9+#])${escapeReg(s.toLowerCase())}(?:[^a-z0-9+#]|$)`, "i");
    if (re.test(haystack)) found.add(s);
  }
  return Array.from(found);
}

function countProjects(block: string[]): number {
  if (!block.length) return 0;
  // Project titles usually start with a capital, a bullet, or "Project:" style.
  let count = 0;
  for (const l of block) {
    if (/^[•\-–—*]/.test(l)) { count++; continue; }
    if (/^project\s*\d*[:\-]/i.test(l)) { count++; continue; }
    if (/^[A-Z][A-Za-z0-9 .&/+\-]{2,60}$/.test(l) && l.split(" ").length <= 8) { count++; continue; }
  }
  return count || Math.min(block.length, 3);
}

export function parseResume(rawText: string): ParsedResume {
  const text = rawText.replace(/\r/g, "");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const email = (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || [null])[0];
  const phone = (text.match(/(\+?\d[\d\s().-]{7,}\d)/) || [null])[0];
  const links = Array.from(text.matchAll(/https?:\/\/[^\s)]+/g)).map((m) => m[0]);

  let name: string | null = null;
  for (const l of lines.slice(0, 6)) {
    if (l.length > 60) continue;
    if (/@|http|\d{4,}/.test(l)) continue;
    if (l.split(" ").length > 5) continue;
    if (!/[A-Za-z]/.test(l)) continue;
    name = l.replace(/[•|·]/g, "").trim();
    break;
  }

  const sections = splitSections(text);
  const sectionsDetected: Record<SectionKey, boolean> = {
    summary: sections.summary.length > 0,
    skills: sections.skills.length > 0,
    education: sections.education.length > 0,
    projects: sections.projects.length > 0,
    experience: sections.experience.length > 0,
    achievements: sections.achievements.length > 0,
    certifications: sections.certifications.length > 0,
  };

  const skills = extractSkillsFromBlock(sections.skills, text);

  // Build parsing confidence
  const detectedCount = Object.values(sectionsDetected).filter(Boolean).length;
  let confidence = 30;
  confidence += Math.min(50, detectedCount * 10);
  if (email) confidence += 6;
  if (phone) confidence += 4;
  if (text.length > 800) confidence += 6;
  if (skills.length >= 4) confidence += 4;
  confidence = Math.max(0, Math.min(100, confidence));

  console.log("[ResumeIQ] Detected sections:", sectionsDetected);
  console.log("[ResumeIQ] Skills found:", skills.length, skills);
  console.log("[ResumeIQ] Parsing confidence:", confidence);
  console.log("[ResumeIQ] Text length:", text.length);

  return {
    rawText: text,
    name,
    email,
    phone,
    skills,
    education: sections.education,
    projects: sections.projects,
    experience: sections.experience,
    achievements: sections.achievements,
    certifications: sections.certifications,
    links,
    sectionsDetected,
    parsingConfidence: confidence,
  };
}

export function countProjectItems(p: ParsedResume): number {
  return countProjects(p.projects);
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
