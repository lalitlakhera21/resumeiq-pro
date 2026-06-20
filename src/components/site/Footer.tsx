export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary"
        >
          <span className="inline-block size-2 rounded-full bg-primary pulse-ring" />
          Built for Digital Heroes
        </a>
        <div className="flex flex-col items-center gap-1 sm:items-end">
          <span className="font-medium text-foreground">Lalit Lakhera</span>
          <a
            href="mailto:lalitlaxkar945@gmail.com"
            className="hover:text-primary transition-colors"
          >
            lalitlaxkar945@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
