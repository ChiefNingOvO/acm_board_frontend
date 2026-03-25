function toPositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toBoolean(value: string | undefined, fallback: boolean) {
  if (value == null || value.trim() === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function normalizePath(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export const appConfig = {
  eventTitle:
    import.meta.env.VITE_EVENT_TITLE?.trim() ||
    "华北水利水电大学第八届 ACM-ICPC 程序设计大赛",
  eventStartAt: import.meta.env.VITE_EVENT_START_AT?.trim() || "",
  apiBasePath: normalizePath(import.meta.env.VITE_API_BASE_PATH, "/api"),
  rankListPath: "",
  firstBloodPath: "",
  kafkaWebSocketUrl: import.meta.env.VITE_KAFKA_WS_URL?.trim() || "/ws",
  countdownTriggerAt: import.meta.env.VITE_COUNTDOWN_TRIGGER_AT?.trim() || "",
  countdownDurationMs:
    toPositiveNumber(import.meta.env.VITE_COUNTDOWN_DURATION_MINUTES, 60) * 60 * 1000,
  countdownTitle: import.meta.env.VITE_COUNTDOWN_TITLE?.trim() || "Countdown",
  countdownSubtitle:
    import.meta.env.VITE_COUNTDOWN_SUBTITLE?.trim() ||
    "First Blood And Judging Stream Paused",
  eventStartCountdownTitle:
    import.meta.env.VITE_EVENT_START_COUNTDOWN_TITLE?.trim() || "Contest Starts In",
  eventStartCountdownSubtitle:
    import.meta.env.VITE_EVENT_START_COUNTDOWN_SUBTITLE?.trim() ||
    "The board will open automatically at the configured time",
  rankPageSize: toPositiveNumber(import.meta.env.VITE_RANK_PAGE_SIZE, 10),
  rankRotateMs: toPositiveNumber(import.meta.env.VITE_RANK_ROTATE_MS, 5000),
  rankAutoStart: toBoolean(import.meta.env.VITE_RANK_AUTO_START, true),
};

appConfig.rankListPath = normalizePath(
  import.meta.env.VITE_RANK_LIST_PATH,
  `${appConfig.apiBasePath}/get_rank_list`,
);

appConfig.firstBloodPath = normalizePath(
  import.meta.env.VITE_FIRST_BLOOD_PATH,
  `${appConfig.apiBasePath}/get_first_blood`,
);
