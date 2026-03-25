import fs from "node:fs";
import path from "node:path";

function parseEnvValue(rawValue) {
  const trimmed = rawValue.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseEnvFile(content) {
  const parsed = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1);
    if (!key) continue;

    parsed[key] = parseEnvValue(rawValue);
  }

  return parsed;
}

export function loadProjectEnv({
  cwd = process.cwd(),
  mode = process.env.NODE_ENV || "development",
} = {}) {
  const files = [
    ".env",
    ".env.local",
    `.env.${mode}`,
    `.env.${mode}.local`,
  ];

  const fromFiles = new Set();

  for (const relativePath of files) {
    const absolutePath = path.resolve(cwd, relativePath);
    if (!fs.existsSync(absolutePath)) continue;

    const parsed = parseEnvFile(fs.readFileSync(absolutePath, "utf8"));
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] !== undefined && !fromFiles.has(key)) {
        continue;
      }

      process.env[key] = value;
      fromFiles.add(key);
    }
  }

  return process.env;
}
