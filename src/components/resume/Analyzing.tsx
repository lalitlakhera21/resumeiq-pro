import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  "Reading your resume…",
  "Checking ATS compatibility…",
  "Scanning skills & keywords…",
  "Computing strength breakdown…",
  "Generating suggestions…",
];

export function Analyzing() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % STEPS.length), 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass mt-8 flex flex-col items-center gap-6 rounded-3xl p-12 text-center">
      <div className="relative size-16">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="text-sm font-medium text-muted-foreground"
        >
          {STEPS[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
