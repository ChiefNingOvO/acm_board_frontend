import React from "react";

const SPECIAL_THANKS = [
  "RainbowDash",
  "ColdCloud",
  "RainFly",
  "Tttshaoqi",
  "Txwin",
  "Rain"
];

export const Footer: React.FC = () => {
  return (
    <footer className="h-12 bg-card/80 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-6 px-8 shrink-0 relative z-10 text-[11px] md:text-xs font-mono">
      <div className="shrink-0 tracking-[0.28em] text-secondaryText/80 uppercase">
        <span className="text-white/60">Powered By </span>
        <span className="font-bold text-primaryText">ChiefNing</span>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-3 text-secondaryText/85">
        <span className="shrink-0 tracking-[0.28em] text-firstblood/90 uppercase">
          特别鸣谢
        </span>
        <div className="flex min-w-0 flex-wrap justify-end gap-2">
          {SPECIAL_THANKS.map((name) => (
            <span
              key={name}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 tracking-[0.18em] text-primaryText shadow-[0_0_16px_rgba(255,255,255,0.04)]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};
