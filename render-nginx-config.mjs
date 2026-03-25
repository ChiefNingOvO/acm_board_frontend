import fs from "node:fs";
import path from "node:path";
import { loadProjectEnv } from "./scripts/load-env.mjs";

loadProjectEnv({ mode: "production" });

const templatePath = path.resolve(process.cwd(), "nginx.acm-board.conf.template");
const outputPath = path.resolve(process.cwd(), "nginx.acm-board.conf");

const template = fs.readFileSync(templatePath, "utf8");
const rendered = template
  .replaceAll("__SERVER_NAME__", process.env.SERVER_NAME || "_")
  .replaceAll("__STATIC_ROOT__", process.env.STATIC_ROOT || "/opt/acm-board/frontend/dist")
  .replaceAll("__API_PROXY_TARGET__", process.env.API_PROXY_TARGET || "http://127.0.0.1:8090")
  .replaceAll("__WS_PROXY_TARGET__", process.env.WS_PROXY_TARGET || "http://127.0.0.1:8080");

fs.writeFileSync(outputPath, rendered, "utf8");
console.log(`Rendered nginx config: ${outputPath}`);
