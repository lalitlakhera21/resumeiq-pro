import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ScoreCircle({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * score));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const size = 200;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (display / 100) * c;

  const color = score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--destructive)";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs work";

  return (
    <div className="relative grid place-items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-5xl font-bold tracking-tight">
            {display}
            <span className="text-xl text-muted-foreground">/100</span>
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider" style={{ color }}>
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
