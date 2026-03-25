import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Submission } from "./useEngine";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Props {
  submissions: Submission[];
}

export const EventStream: React.FC<Props> = ({ submissions }) => {
  return (
    <div className="flex-1 h-full overflow-hidden p-8 pb-24 relative z-10 flex flex-col justify-end">
      {/* Container for cards, aligning them to the bottom to float up */}
      <div className="w-full max-w-5xl mx-auto relative z-10 h-full">
        <div className="relative flex h-full flex-col justify-end gap-3">
          <AnimatePresence mode="popLayout">
            {submissions.map((sub) => (
              <SubmissionCard key={sub.id} sub={sub} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SubmissionCard = React.forwardRef<HTMLDivElement, { sub: Submission }>(({ sub }, ref) => {
  const isPending = sub.status === "Pending";
  const isAC = sub.status === "AC";
  const isWA = sub.status === "WA";

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 800,
        damping: 50,
        opacity: { duration: 0.1 },
      }}
      className={`relative h-[92px] overflow-hidden rounded-xl border px-6 py-4 flex items-center justify-between w-full transition-colors duration-500 ${
        isAC
          ? "border-ac/50 bg-ac/10 shadow-[0_0_15px_rgba(0,200,83,0.15)]"
          : isWA
            ? "border-wa/30 bg-wa/5"
            : "border-white/10 bg-white/5"
      }`}
    >
      {/* 渐变背景光晕 */}
      {isAC && (
        <div className="absolute inset-0 bg-gradient-to-r from-ac/10 to-transparent pointer-events-none" />
      )}
      {isWA && (
        <div className="absolute inset-0 bg-gradient-to-r from-wa/10 to-transparent pointer-events-none" />
      )}

      <div className="flex min-w-0 items-center gap-6 z-10">
        <div
          className={`shrink-0 text-3xl font-black font-mono w-12 text-center ${
            isAC
              ? "text-ac drop-shadow-[0_0_6px_rgba(0,200,83,0.8)]"
              : isWA
                ? "text-wa drop-shadow-[0_0_6px_rgba(255,82,82,0.8)]"
              : "text-white/80"
        }`}
        >
          {sub.problem}
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <span
            className="text-xl font-bold text-primaryText tracking-wide truncate leading-tight"
            title={sub.team}
          >
            {sub.team}
          </span>
          <span className={`mt-1 h-5 text-sm font-mono text-white/40 ${sub.judge_time ? "" : "opacity-0"}`}>
            {sub.judge_time || "00:00:00"}
          </span>
        </div>
      </div>

      <div className="flex min-w-[120px] justify-end items-center z-10">
        <AnimatePresence mode="wait">
          {isPending && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 text-white/50 bg-white/5 px-4 py-2 rounded-full border border-white/10"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-bold tracking-widest text-sm">
                评测中...
              </span>
            </motion.div>
          )}
          {isAC && (
            <motion.div
              key="ac"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 text-ac border border-ac/50 bg-ac/10 px-4 py-2 rounded-full shadow-[0_0_10px_rgba(0,200,83,0.3)]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold tracking-widest text-sm">
                通过
              </span>
            </motion.div>
          )}
          {isWA && (
            <motion.div
              key="wa"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 text-wa border border-wa/30 bg-wa/10 px-4 py-2 rounded-full"
            >
              <XCircle className="w-5 h-5" />
              <span className="font-bold tracking-widest text-sm">
                未通过
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

SubmissionCard.displayName = "SubmissionCard";
