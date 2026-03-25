import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Play } from "lucide-react";
import { appConfig } from "./config";

interface RankItem {
  rank: number;
  name: string;
}

export const RankListPanel: React.FC = () => {
  const [allRanks, setAllRanks] = useState<RankItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isStarted, setIsStarted] = useState(appConfig.rankAutoStart);
  const itemsPerPage = appConfig.rankPageSize;

  const fetchRanks = useCallback(async () => {
    try {
      const response = await fetch(appConfig.rankListPath);
      if (!response.ok) return;

      const data = await response.json();
      if (Array.isArray(data)) {
        setAllRanks(data);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Fetch rank list error:", error);
    }
  }, []);

  useEffect(() => {
    if (!isStarted) return;
    fetchRanks();
  }, [fetchRanks, isStarted]);

  useEffect(() => {
    if (!isStarted || allRanks.length === 0) return;

    const totalPages = Math.ceil(allRanks.length / itemsPerPage);
    if (totalPages <= 1) {
      const timer = window.setTimeout(() => {
        fetchRanks();
      }, appConfig.rankRotateMs);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setInterval(() => {
      setCurrentPage((prev) => {
        const nextPage = prev + 1;
        if (nextPage >= totalPages) {
          fetchRanks();
          return prev;
        }
        return nextPage;
      });
    }, appConfig.rankRotateMs);

    return () => window.clearInterval(timer);
  }, [allRanks.length, fetchRanks, isStarted, itemsPerPage]);

  const currentDisplayRanks = allRanks.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  return (
    <div className="w-[300px] h-full border-l border-white/10 bg-white/5 flex flex-col backdrop-blur-md relative z-10 shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.5)]">
      <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5 shrink-0">
        <Trophy className="text-ac drop-shadow-[0_0_8px_rgba(0,200,83,0.6)] w-5 h-5" />
        <h2 className="text-lg font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          TOP 100 RANKS
        </h2>
      </div>

      <div className="flex-1 overflow-hidden p-2 flex flex-col justify-start gap-1.5 relative">
        <AnimatePresence mode="popLayout">
          {!isStarted ? (
            <motion.div
              key="start-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-ac/10 flex items-center justify-center mb-4 border border-ac/30 shadow-[0_0_20px_rgba(0,200,83,0.2)]">
                <Trophy className="w-8 h-8 text-ac/60" />
              </div>
              <p className="text-secondaryText text-sm mb-6 leading-relaxed">
                实时榜单已就绪
                <br />
                点击下方按钮开始同步数据
              </p>
              <button
                onClick={() => setIsStarted(true)}
                className="group relative px-6 py-3 bg-ac/20 hover:bg-ac/30 border border-ac/50 rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden shadow-[0_0_15px_rgba(0,200,83,0.1)] hover:shadow-[0_0_25px_rgba(0,200,83,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Play className="w-4 h-4 text-ac fill-ac group-hover:scale-110 transition-transform" />
                <span className="text-ac font-bold tracking-widest uppercase text-sm">
                  开始同步
                </span>
              </button>
            </motion.div>
          ) : (
            currentDisplayRanks.map((item) => (
              <motion.div
                layout
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`flex items-center gap-3 p-2 rounded-lg border shadow-sm flex-1 shrink-0 ${
                  item.rank === 1
                    ? "bg-gradient-to-r from-yellow-500/30 to-transparent border-yellow-500/50"
                    : item.rank === 2
                      ? "bg-gradient-to-r from-gray-300/30 to-transparent border-gray-300/50"
                      : item.rank === 3
                        ? "bg-gradient-to-r from-amber-700/30 to-transparent border-amber-700/50"
                        : "bg-black/40 border-white/10"
                }`}
              >
                <div
                  className={`w-8 text-center font-black font-mono ${
                    item.rank === 1
                      ? "text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]"
                      : item.rank === 2
                        ? "text-gray-300 drop-shadow-[0_0_5px_rgba(209,213,219,0.8)]"
                        : item.rank === 3
                          ? "text-amber-700 drop-shadow-[0_0_5px_rgba(180,83,9,0.8)]"
                          : "text-white/40"
                  }`}
                >
                  #{item.rank}
                </div>
                <div className="flex-1 font-bold text-sm truncate text-primaryText" title={item.name}>
                  {item.name}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
