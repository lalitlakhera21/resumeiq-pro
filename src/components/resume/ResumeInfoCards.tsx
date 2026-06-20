import { Mail, Phone, User, Link as LinkIcon } from "lucide-react";
import type { ParsedResume } from "@/lib/resume/parser";

export function ResumeInfoCards({ p }: { p: ParsedResume }) {
  const items = [
    { icon: User, label: "Name", value: p.name ?? "Not detected" },
    { icon: Mail, label: "Email", value: p.email ?? "Not detected" },
    { icon: Phone, label: "Phone", value: p.phone ?? "Not detected" },
    { icon: LinkIcon, label: "Links", value: p.links.length ? `${p.links.length} found` : "None" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Icon className="size-3.5" />
            {label}
          </div>
          <div className="mt-1.5 truncate text-sm font-medium">{value}</div>
        </div>
      ))}
    </div>
  );
}
