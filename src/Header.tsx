import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import IconPng from "./assets/icon.png";
import { appConfig } from "./config";

interface HeaderProps {
  stats: { total: number; ac: number };
}

export const Header: React.FC<HeaderProps> = ({ stats }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="h-20 bg-card/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 shrink-0 relative z-10">
      <div className="flex items-center gap-4 min-w-0">
        <img
          src={IconPng}
          alt="Logo"
          className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] shrink-0"
        />
        <h1 className="text-xl md:text-2xl font-bold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-primaryText to-secondaryText truncate">
          {appConfig.eventTitle}
        </h1>
      </div>

      <div className="flex items-center gap-12 font-mono">
        <div className="flex flex-col items-center">
          <span className="text-xs text-secondaryText uppercase tracking-widest">总提交</span>
          <span className="text-2xl font-bold text-primaryText">{stats.total}</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-secondaryText uppercase tracking-widest">通过 (AC)</span>
          <span className="text-2xl font-bold text-ac drop-shadow-[0_0_8px_rgba(0,200,83,0.8)]">
            {stats.ac}
          </span>
        </div>

        <div className="w-px h-10 bg-white/10 mx-2" />

        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-secondaryText" />
          <span className="text-xl font-bold text-primaryText tracking-widest">
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>
      </div>
    </header>
  );
};
