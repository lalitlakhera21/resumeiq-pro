import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function Navbar() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-40 mx-auto w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
            <Sparkles className="size-4" />
          </span>
          <span className="text-lg">ResumeIQ</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#analyze" className="hover:text-foreground transition-colors">Analyze</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        </nav>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border/70 bg-surface/60 text-foreground transition-colors hover:bg-surface"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
  );
}
