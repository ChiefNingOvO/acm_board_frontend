/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVENT_TITLE?: string;
  readonly VITE_EVENT_START_AT?: string;
  readonly VITE_EVENT_START_COUNTDOWN_TITLE?: string;
  readonly VITE_EVENT_START_COUNTDOWN_SUBTITLE?: string;
  readonly VITE_API_BASE_PATH?: string;
  readonly VITE_RANK_LIST_PATH?: string;
  readonly VITE_FIRST_BLOOD_PATH?: string;
  readonly VITE_KAFKA_WS_URL?: string;
  readonly VITE_COUNTDOWN_TRIGGER_AT?: string;
  readonly VITE_COUNTDOWN_DURATION_MINUTES?: string;
  readonly VITE_COUNTDOWN_TITLE?: string;
  readonly VITE_COUNTDOWN_SUBTITLE?: string;
  readonly VITE_RANK_PAGE_SIZE?: string;
  readonly VITE_RANK_ROTATE_MS?: string;
  readonly VITE_RANK_AUTO_START?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
