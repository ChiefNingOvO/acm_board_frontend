import { useEffect, useCallback, useRef } from "react";
import { appConfig } from "./config";

export interface KafkaMessage {
  type: "message" | "first_blood" | "broadcast";
  name?: string;
  label?: string;
  status?: string;
  judge_time?: string;
  user_id?: string;
  problem_id?: string;
  content?: string;
  duration?: number;
  id?: string;
  time?: string;
  timestamp?: number;
  event_key?: string;
  event_type?: "message" | "first_blood" | "broadcast";
  source?: string;
  payload?: Partial<KafkaMessage> | null;
}

function resolveWebSocketUrl() {
  const configuredUrl = appConfig.kafkaWebSocketUrl;
  if (configuredUrl) {
    if (configuredUrl.startsWith("ws://") || configuredUrl.startsWith("wss://")) {
      return configuredUrl;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const pathname = configuredUrl.startsWith("/") ? configuredUrl : `/${configuredUrl}`;
    return `${protocol}//${window.location.host}${pathname}`;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

export function useKafka(onMessage: (message: KafkaMessage) => void, enabled = true) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    shouldReconnectRef.current = false;
    clearReconnectTimer();

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [clearReconnectTimer]);

  const connectWebSocket = useCallback(() => {
    if (!enabled) return;

    shouldReconnectRef.current = true;
    clearReconnectTimer();

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const wsUrl = resolveWebSocketUrl();
    console.log("Connecting Kafka WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Kafka WebSocket connected");
      clearReconnectTimer();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as KafkaMessage;
        onMessage(message);
      } catch (error) {
        console.error("Kafka message parse error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("Kafka WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Kafka WebSocket closed");
      if (!shouldReconnectRef.current || reconnectTimerRef.current !== null) {
        return;
      }

      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        if (shouldReconnectRef.current) {
          console.log("Reconnecting Kafka WebSocket...");
          connectWebSocket();
        }
      }, 3000);
    };
  }, [clearReconnectTimer, enabled, onMessage]);

  useEffect(() => {
    if (!enabled) {
      disconnectWebSocket();
      return;
    }

    connectWebSocket();
    return disconnectWebSocket;
  }, [connectWebSocket, disconnectWebSocket, enabled]);
}
