import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, AlertCircle } from "lucide-react";

const MAX_SIZE = 5 * 1024 * 1024;

export function UploadZone({ onFile, onDemo }: { onFile: (f: File) => void; onDemo: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (file?: File | null) => {
    setError(null);
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setError("File is too large (max 5MB).");
      return;
    }
    const ok = /\.(pdf|docx|txt)$/i.test(file.name);
    if (!ok) {
      setError("Only PDF, DOCX or TXT files are supported.");
      return;
    }
    onFile(file);
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={`glass relative overflow-hidden rounded-3xl p-10 text-center transition-all ${
          hover ? "ring-2 ring-primary/60 btn-glow scale-[1.01]" : ""
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(600px 200px at 50% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="grid size-16 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30"
          >
            <UploadCloud className="size-7" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold">Drop your resume here</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              PDF or DOCX, up to 5MB. Everything is processed in your browser.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-95 btn-glow"
            >
              <FileText className="size-4" /> Choose file
            </button>
            <button
              onClick={onDemo}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              View Demo Report
            </button>
          </div>
          {error && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm text-destructive">
              <AlertCircle className="size-4" /> {error}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            hidden
            onChange={(e) => handle(e.target.files?.[0])}
          />
        </div>
      </motion.div>
    </div>
  );
}
