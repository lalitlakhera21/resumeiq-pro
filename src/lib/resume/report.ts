import type { Analysis } from "./analyzer";

export async function downloadReport(analysis: Analysis) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 56;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ResumeIQ — Analysis Report", 48, y);
  y += 10;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(2);
  doc.line(48, y, W - 48, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 48, y);
  y += 24;

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("ATS Score", 48, y);
  y += 6;
  doc.setFontSize(36);
  doc.setTextColor(59, 130, 246);
  doc.text(`${analysis.atsScore}/100`, 48, (y += 30));
  y += 16;

  doc.setTextColor(20);
  doc.setFontSize(13);
  doc.text("Resume Summary", 48, (y += 18));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const summary = [
    `Name: ${analysis.parsed.name ?? "—"}`,
    `Email: ${analysis.parsed.email ?? "—"}`,
    `Phone: ${analysis.parsed.phone ?? "—"}`,
    `Skills found: ${analysis.parsed.skills.length}`,
    `Projects: ${analysis.parsed.projects.length}`,
    `Experience lines: ${analysis.parsed.experience.length}`,
  ];
  summary.forEach((line) => {
    y += 16;
    doc.text(line, 48, y);
  });

  y = section(doc, y, "Skills Found");
  y = bulletList(doc, y, analysis.parsed.skills);

  y = section(doc, y, "Missing Skills");
  y = bulletList(doc, y, analysis.missingSkills);

  y = section(doc, y, "Resume Strength");
  Object.entries(analysis.strength).forEach(([k, v]) => {
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`${cap(k)}: ${v}%`, 48, y);
  });

  y = section(doc, y, "Improvement Suggestions");
  y = bulletList(doc, y, analysis.suggestions);

  doc.save("resumeiq-report.pdf");
}

function section(doc: any, y: number, title: string) {
  if (y > 720) {
    doc.addPage();
    y = 56;
  }
  y += 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text(title, 48, y);
  doc.setDrawColor(220);
  doc.setLineWidth(0.5);
  doc.line(48, y + 4, 547, y + 4);
  return y + 4;
}

function bulletList(doc: any, y: number, items: string[]) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(40);
  if (!items.length) {
    y += 16;
    doc.text("—", 56, y);
    return y;
  }
  for (const it of items) {
    if (y > 760) {
      doc.addPage();
      y = 56;
    }
    y += 16;
    const wrapped = doc.splitTextToSize(`• ${it}`, 500);
    doc.text(wrapped, 56, y);
    y += (wrapped.length - 1) * 14;
  }
  return y;
}

function cap(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}
