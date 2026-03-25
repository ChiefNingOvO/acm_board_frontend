import { useState, useEffect, useCallback, useRef } from "react";
import type { BroadcastMessage } from "./GlobalMessage";
import { useKafka, type KafkaMessage } from "./useKafka";
import { appConfig } from "./config";

export type ProblemId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";
export type SubStatus = "Pending" | "AC" | "WA";

export interface Submission {
  id: string;
  team: string;
  problem: ProblemId;
  status: SubStatus;
  timestamp: number;
  judge_time?: string;
}

export interface FirstBlood {
  problem: ProblemId;
  team: string | null;
  timestamp: number | null;
  isNew?: boolean;
  submitCount: number;
  acCount: number;
  judge_time?: string;
}

interface FirstBloodApiItem {
  problem_id: string;
  user_id: string;
}

export const PROBLEMS: ProblemId[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

function randomId() {
  return Math.random().toString(36).substring(2, 9);
}

function parseStatus(raw: string): SubStatus {
  if (!raw) return "WA";
  const status = raw.toUpperCase();
  if (status.includes("AC") || status.includes("ACCEPTED") || status === "TRUE") return "AC";
  if (status.includes("PENDING") || status.includes("WAITING")) return "Pending";
  return "WA";
}

function formatJudgeTime(judgeTime?: string) {
  if (!judgeTime) return "";

  try {
    const date = new Date(judgeTime);
    return date.toLocaleTimeString("en-US", { hour12: false });
  } catch {
    return judgeTime;
  }
}

function extractDisplayName(rawUserId?: string | null) {
  if (!rawUserId || rawUserId === "-1") return null;

  const trimmed = rawUserId.trim();
  if (!trimmed) return null;

  return trimmed.split(/\s+/)[0] || null;
}

function normalizeKafkaMessage(message: KafkaMessage): KafkaMessage | null {
  const hasPayload = !!message.payload && typeof message.payload === "object";
  if (!hasPayload) {
    return message.type ? message : null;
  }

  const payload = message.payload as Partial<KafkaMessage>;
  const normalizedType = payload.type || message.event_type;
  if (!normalizedType) return null;

  return {
    ...message,
    ...payload,
    type: normalizedType,
    event_type: message.event_type || normalizedType,
    event_key: payload.event_key || message.event_key,
  } as KafkaMessage;
}

export function useEngine() {
  const [firstBloods, setFirstBloods] = useState<Record<ProblemId, FirstBlood>>(() => {
    const initial: Partial<Record<ProblemId, FirstBlood>> = {};
    PROBLEMS.forEach((problem) => {
      initial[problem] = {
        problem,
        team: null,
        timestamp: null,
        isNew: false,
        submitCount: 0,
        acCount: 0,
      };
    });
    return initial as Record<ProblemId, FirstBlood>;
  });

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionQueue, setSubmissionQueue] = useState<KafkaMessage[]>([]);
  const [stats, setStats] = useState({ total: 0, ac: 0 });
  const [tickers, setTickers] = useState<string[]>([
    "欢迎来到 ACM/ICPC 比赛现场",
    "系统已连接至实时评测后端",
  ]);
  const [globalMessage, setGlobalMessage] = useState<BroadcastMessage | null>(null);

  const processedMessageIds = useRef<Set<string>>(new Set());
  const processedBroadcastIds = useRef<Set<string>>(new Set());
  const broadcastTimeoutRef = useRef<number | null>(null);
  const maxDisplayCount = 8;

  const addTicker = useCallback((message: string) => {
    setTickers((prev) => [...prev.slice(-4), message]);
  }, []);

  const showBroadcastMessage = useCallback((message: {
    content?: string;
    duration?: number;
    id?: string;
    time?: string;
    timestamp?: number;
  }) => {
    if (!message.content) return;

    const uniqueKey = [
      message.id ?? "",
      message.time ?? "",
      message.timestamp ?? "",
      message.content,
      message.duration ?? "",
    ].join("|");

    if (processedBroadcastIds.current.has(uniqueKey)) {
      return;
    }
    processedBroadcastIds.current.add(uniqueKey);

    const nextMessage: BroadcastMessage = {
      id: uniqueKey || `broadcast-${Date.now()}`,
      content: message.content,
      duration: message.duration || 5000,
    };

    if (broadcastTimeoutRef.current !== null) {
      window.clearTimeout(broadcastTimeoutRef.current);
    }

    setGlobalMessage(nextMessage);

    broadcastTimeoutRef.current = window.setTimeout(() => {
      setGlobalMessage(null);
      broadcastTimeoutRef.current = null;
    }, nextMessage.duration);
  }, []);

  useEffect(() => {
    if (submissionQueue.length === 0 || submissions.length >= maxDisplayCount) {
      return;
    }

    const item = submissionQueue[0];
    setSubmissionQueue((currentQueue) => currentQueue.slice(1));

    if (item.type === "message") {
      const problemId = item.label as ProblemId | undefined;
      if (!problemId) return;

      const finalStatus = parseStatus(item.status ?? "");
      const submissionId = randomId();
      const formattedTime = formatJudgeTime(item.judge_time);

      const newSubmission: Submission = {
        id: submissionId,
        team: item.name || "Unknown Team",
        problem: problemId,
        status: "Pending",
        timestamp: Date.now(),
        judge_time: formattedTime,
      };

      setSubmissions((prev) => [...prev, newSubmission]);

      setFirstBloods((current) => ({
        ...current,
        [problemId]: {
          ...current[problemId],
          submitCount: (current[problemId]?.submitCount || 0) + 1,
        },
      }));

      const judgingDelay = Math.floor(Math.random() * 2000) + 1000;

      setTimeout(() => {
        setSubmissions((current) =>
          current.map((submission) =>
            submission.id === submissionId ? { ...submission, status: finalStatus } : submission,
          ),
        );

        if (finalStatus === "AC") {
          setFirstBloods((current) => ({
            ...current,
            [problemId]: {
              ...current[problemId],
              acCount: (current[problemId]?.acCount || 0) + 1,
            },
          }));
        }

        setStats((prev) => ({
          total: prev.total + 1,
          ac: prev.ac + (finalStatus === "AC" ? 1 : 0),
        }));

        setTimeout(() => {
          setSubmissions((current) => current.filter((submission) => submission.id !== submissionId));
        }, 4000);
      }, judgingDelay);

      return;
    }

    if (item.type === "first_blood") {
      const problemId = item.problem_id as ProblemId | undefined;
      if (!problemId) return;

      const team = extractDisplayName(item.user_id);
      if (!team) return;

      const formattedJudgeTime = formatJudgeTime(item.judge_time);

      setFirstBloods((current) => ({
        ...current,
        [problemId]: {
          problem: problemId,
          team,
          timestamp: Date.now(),
          isNew: true,
          submitCount: (current[problemId]?.submitCount || 0) + 1,
          acCount: (current[problemId]?.acCount || 0) + 1,
          judge_time: formattedJudgeTime,
        },
      }));

      addTicker(`恭喜 ${team} 斩获 ${problemId} 题 First Blood`);
    }
  }, [submissionQueue, submissions.length, addTicker]);

  const handleKafkaMessage = useCallback((rawMessage: KafkaMessage) => {
    console.log("收到 Kafka 消息:", rawMessage);

    const message = normalizeKafkaMessage(rawMessage);
    if (!message) {
      console.warn("无法识别的 Kafka 消息格式，已跳过:", rawMessage);
      return;
    }

    if (message.type === "broadcast") {
      showBroadcastMessage(message);
      return;
    }

    const uniqueKey =
      message.event_key ||
      `${message.type}-${message.judge_time || message.time || ""}-${message.name || message.user_id || ""}-${message.label || message.problem_id || ""}-${message.status || ""}`;

    if (processedMessageIds.current.has(uniqueKey)) {
      console.log("消息已处理过，跳过:", uniqueKey);
      return;
    }
    processedMessageIds.current.add(uniqueKey);

    setSubmissionQueue((prev) => [...prev, message]);
  }, [showBroadcastMessage]);

  useKafka(handleKafkaMessage);

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialFirstBloods() {
      try {
        const response = await fetch(appConfig.firstBloodPath);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as FirstBloodApiItem[];
        if (cancelled || !Array.isArray(data)) return;

        setFirstBloods((current) => {
          let changed = false;
          const next = { ...current };

          for (const item of data) {
            const problemId = item.problem_id as ProblemId;
            if (!PROBLEMS.includes(problemId)) continue;

            const team = extractDisplayName(item.user_id);
            if (!team) continue;
            if (current[problemId]?.team) continue;

            next[problemId] = {
              ...current[problemId],
              problem: problemId,
              team,
              timestamp: current[problemId]?.timestamp ?? Date.now(),
              isNew: false,
            };
            changed = true;
          }

          return changed ? next : current;
        });
      } catch (error) {
        console.error("Fetch first blood error:", error);
      }
    }

    fetchInitialFirstBloods();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFirstBloods((current) => {
        let changed = false;
        const next = { ...current };

        for (const problem of PROBLEMS) {
          if (next[problem]?.isNew) {
            next[problem] = { ...next[problem], isNew: false };
            changed = true;
          }
        }

        return changed ? next : current;
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [firstBloods]);

  useEffect(() => {
    return () => {
      if (broadcastTimeoutRef.current !== null) {
        window.clearTimeout(broadcastTimeoutRef.current);
      }
    };
  }, []);

  return { firstBloods, submissions, stats, tickers, globalMessage };
}
