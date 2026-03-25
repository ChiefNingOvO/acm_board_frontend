import WebSocket, { WebSocketServer } from "ws";
import { Kafka, logLevel } from "kafkajs";
import { loadProjectEnv } from "./scripts/load-env.mjs";

loadProjectEnv();

function toBoolean(value) {
  return ["1", "true", "yes", "on"].includes((value || "").trim().toLowerCase());
}

function getBrokers() {
  return (process.env.KAFKA_BROKERS || "49.234.197.24:9092")
    .split(",")
    .map((broker) => broker.trim())
    .filter(Boolean);
}

function getSaslConfig() {
  const mechanism = process.env.KAFKA_SASL_MECHANISM?.trim();
  const username = process.env.KAFKA_USERNAME?.trim();
  const password = process.env.KAFKA_PASSWORD ?? "";

  if (!mechanism || !username) {
    return undefined;
  }

  return {
    mechanism,
    username,
    password,
  };
}

const KAFKA_BROKERS = getBrokers();
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || "acm.board.submission.events";
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "acm-board-proxy";
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || "acm-board-ws-proxy";
const KAFKA_FROM_BEGINNING = toBoolean(process.env.KAFKA_FROM_BEGINNING);
const KAFKA_SSL = toBoolean(process.env.KAFKA_SSL);
const WS_HOST = process.env.WS_HOST || "0.0.0.0";
const WS_PORT = Number(process.env.WS_PORT || 8080);

const wss = new WebSocketServer({ host: WS_HOST, port: WS_PORT });
console.log(`WebSocket server started on ${WS_HOST}:${WS_PORT}`);
console.log("Kafka proxy config:", {
  brokers: KAFKA_BROKERS,
  topic: KAFKA_TOPIC,
  clientId: KAFKA_CLIENT_ID,
  groupId: KAFKA_GROUP_ID,
  fromBeginning: KAFKA_FROM_BEGINNING,
  ssl: KAFKA_SSL,
  saslEnabled: !!getSaslConfig(),
  wsHost: WS_HOST,
  wsPort: WS_PORT,
});

const clients = new Set();

wss.on("connection", (ws) => {
  console.log("Frontend client connected");
  clients.add(ws);
  console.log(`Current frontend clients: ${clients.size}`);

  ws.on("close", () => {
    console.log("Frontend client disconnected");
    clients.delete(ws);
    console.log(`Current frontend clients: ${clients.size}`);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clients.delete(ws);
  });
});

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
  ssl: KAFKA_SSL,
  sasl: getSaslConfig(),
  logLevel: logLevel.NOTHING,
});

const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });

async function startKafkaConsumer() {
  await consumer.connect();
  console.log("Kafka connected");

  await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: KAFKA_FROM_BEGINNING });
  console.log(`Kafka subscribed to topic: ${KAFKA_TOPIC}`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      const messageBody = message.value?.toString() ?? "";
      console.log("Received Kafka message:", messageBody);

      if (clients.size === 0) {
        console.warn("Kafka message received, but no frontend WebSocket clients are connected");
      }

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageBody);
        }
      });
    },
  });
}

startKafkaConsumer().catch((error) => {
  console.error("Kafka consumer failed to start:", error);
});

async function shutdown() {
  console.log("Shutting down...");

  try {
    await consumer.disconnect();
  } catch (error) {
    console.error("Kafka consumer disconnect failed:", error);
  }

  wss.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
