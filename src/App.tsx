import { useEffect, useState } from "react";
import { useEngine } from "./useEngine";
import { Header } from "./Header";
import { FirstBloodPanel } from "./FirstBloodPanel";
import { EventStream } from "./EventStream";
import { BottomTicker } from "./BottomTicker";
import { Footer } from "./Footer";
import { RankListPanel } from "./RankListPanel";
import { GlobalMessage } from "./GlobalMessage";
import { appConfig } from "./config";

function parseDateConfig(label: string, value?: string) {
  if (!value?.trim()) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    console.warn(`Invalid ${label} value:`, value);
    return null;
  }

  return parsed;
}

function formatRemainingTime(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function formatTargetTime(date: Date) {
  return date.toLocaleString("zh-CN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function PostStartCountdownOverlay({ triggerAt, now }: { triggerAt: Date; now: Date }) {
  const elapsed = now.getTime() - triggerAt.getTime();
  const remainingMs = Math.max(0, appConfig.countdownDurationMs - elapsed);

  return (
    <div className="flex-1 relative z-10 overflow-hidden border-r border-white/5">
      <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl" />
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-firstblood/10 blur-[140px] pointer-events-none" />

      <div className="relative flex h-full flex-col items-center justify-center px-10 text-center">
        <p className="text-sm font-mono tracking-[0.4em] text-secondaryText uppercase mb-6">
          {appConfig.countdownTitle}
        </p>
        <div className="text-[clamp(4rem,10vw,8rem)] font-black font-mono tracking-[0.12em] text-firstblood drop-shadow-[0_0_24px_rgba(255,215,0,0.28)] leading-none">
          {formatRemainingTime(remainingMs)}
        </div>
        <p className="mt-8 max-w-2xl text-lg tracking-[0.3em] text-primaryText/80 uppercase">
          {appConfig.countdownSubtitle}
        </p>
      </div>
    </div>
  );
}

function PreStartCountdownScreen({ startAt, now }: { startAt: Date; now: Date }) {
  const remainingMs = Math.max(0, startAt.getTime() - now.getTime());

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden relative selection:bg-firstblood/30">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-3/4 h-3/4 bg-ac/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-firstblood/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-1/3 h-1/3 bg-wa/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[10px]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-sm font-mono tracking-[0.42em] text-secondaryText uppercase">
          {appConfig.eventStartCountdownTitle}
        </p>
        <h1 className="max-w-5xl text-[clamp(1.8rem,4vw,3.5rem)] font-black tracking-[0.08em] text-transparent bg-clip-text bg-gradient-to-r from-primaryText to-secondaryText">
          {appConfig.eventTitle}
        </h1>
        <div className="mt-10 text-[clamp(4rem,12vw,9rem)] font-black font-mono tracking-[0.12em] text-firstblood drop-shadow-[0_0_24px_rgba(255,215,0,0.28)] leading-none">
          {formatRemainingTime(remainingMs)}
        </div>
        <p className="mt-8 text-base md:text-xl tracking-[0.2em] text-primaryText/80 uppercase">
          {appConfig.eventStartCountdownSubtitle}
        </p>
        <p className="mt-4 text-sm md:text-base font-mono tracking-[0.18em] text-secondaryText">
          Starts At {formatTargetTime(startAt)}
        </p>
      </div>
    </div>
  );
}

function App() {
  const { firstBloods, submissions, stats, tickers, globalMessage } = useEngine();
  const [now, setNow] = useState(() => new Date());

  const eventStartAt = parseDateConfig("VITE_EVENT_START_AT", appConfig.eventStartAt);
  const countdownTriggerAt = parseDateConfig(
    "VITE_COUNTDOWN_TRIGGER_AT",
    appConfig.countdownTriggerAt,
  );
  const eventStartTimestamp = eventStartAt?.getTime() ?? null;
  const countdownTriggerTimestamp = countdownTriggerAt?.getTime() ?? null;

  const shouldShowPreStartCountdown = eventStartTimestamp !== null
    ? now.getTime() < eventStartTimestamp
    : false;
  const shouldShowPostStartCountdown = countdownTriggerTimestamp !== null
    ? now.getTime() >= countdownTriggerTimestamp
    : false;

  useEffect(() => {
    if (eventStartTimestamp === null && countdownTriggerTimestamp === null) return;

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [eventStartTimestamp, countdownTriggerTimestamp]);

  useEffect(() => {
    document.title = appConfig.eventTitle;
  }, []);

  if (shouldShowPreStartCountdown && eventStartAt) {
    return <PreStartCountdownScreen startAt={eventStartAt} now={now} />;
  }

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden relative selection:bg-firstblood/30">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-3/4 h-3/4 bg-ac/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-firstblood/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-1/3 h-1/3 bg-wa/5 blur-[150px] rounded-full pointer-events-none" />

      <Header stats={stats} />
      <BottomTicker tickers={tickers} />

      <div className="flex-1 flex overflow-hidden relative z-10">
        {shouldShowPostStartCountdown && countdownTriggerAt ? (
          <PostStartCountdownOverlay triggerAt={countdownTriggerAt} now={now} />
        ) : (
          <>
            <FirstBloodPanel firstBloods={firstBloods} />
            <EventStream submissions={submissions} />
          </>
        )}
        <RankListPanel />
      </div>

      <Footer />
      <GlobalMessage message={globalMessage} />
    </div>
  );
}

export default App;
