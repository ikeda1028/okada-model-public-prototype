import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4181);

loadDotEnv(join(root, ".env"));

const apiKey = process.env.DYNAMIC_PPM_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const hasUsableApiKey = Boolean(apiKey && apiKey !== "sk-your-key-here" && apiKey.startsWith("sk-"));

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function safeJoin(pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const clean = normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, "");
  return join(root, clean);
}

function jsonResponseText(data) {
  const outputText = data.output_text;
  if (outputText) return outputText;
  const item = data.output?.flatMap((entry) => entry.content || []).find((content) => content.text);
  return item?.text || "";
}

async function callOpenAI({ instructions, input, schemaName, schema }) {
  if (!hasUsableApiKey) {
    const error = new Error("DYNAMIC_PPM_OPENAI_API_KEY is not set");
    error.status = 401;
    throw error;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions,
      input,
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error?.message || "OpenAI API request failed");
    error.status = response.status;
    throw error;
  }

  const text = jsonResponseText(data);
  return JSON.parse(text);
}

const ppmPlanSchema = {
  type: "object",
  additionalProperties: false,
  required: ["mission", "vision", "phases", "risks", "budgetAssumptions"],
  properties: {
    mission: { type: "string" },
    vision: { type: "string" },
    risks: {
      type: "array",
      items: { type: "string" },
    },
    budgetAssumptions: {
      type: "array",
      items: { type: "string" },
    },
    phases: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "title", "description", "tasks"],
        properties: {
          key: { type: "string", enum: ["image", "pilot", "master", "implementation"] },
          title: { type: "string" },
          description: { type: "string" },
          tasks: {
            type: "array",
            minItems: 2,
            maxItems: 5,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "parameter", "estimatedHours", "impact", "rationale"],
              properties: {
                title: { type: "string" },
                parameter: {
                  type: "string",
                  enum: ["marketing", "technology", "stakeholders", "finance", "regulation", "hr", "process", "decision"],
                },
                estimatedHours: { type: "number" },
                impact: { type: "number", minimum: 1, maximum: 5 },
                rationale: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

const meetingSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "decisions", "contributions"],
  properties: {
    summary: { type: "string" },
    decisions: {
      type: "array",
      items: { type: "string" },
    },
    contributions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["memberName", "score", "parameter", "contributionType", "evidence", "confidence"],
        properties: {
          memberName: { type: "string" },
          score: { type: "number", minimum: 0, maximum: 100 },
          parameter: {
            type: "string",
            enum: ["marketing", "technology", "stakeholders", "finance", "regulation", "hr", "process", "decision"],
          },
          contributionType: { type: "string" },
          evidence: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
      },
    },
  },
};

async function handleApi(req, res) {
  try {
    const body = await readJson(req);
    if (req.url === "/api/ppm-plan") {
      const result = await callOpenAI({
        schemaName: "ppm_plan",
        schema: ppmPlanSchema,
        instructions:
          "You are a senior project architect. Generate a Makiyama-style PPM plan for a DAO-style contribution evaluation app. Return Japanese content. Keep tasks concrete and suitable for Gantt planning.",
        input: JSON.stringify(body),
      });
      sendJson(res, 200, result);
      return;
    }

    if (req.url === "/api/meeting-analysis") {
      const result = await callOpenAI({
        schemaName: "meeting_analysis",
        schema: meetingSchema,
        instructions:
          "You analyze project meeting contribution for DAO reward allocation. Do not reward speaking time alone. Reward risk discovery, decisions, concrete action items, evidence, facilitation, stakeholder alignment, and follow-through. Return Japanese content.",
        input: JSON.stringify(body),
      });
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, { error: "Unknown API route" });
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message });
  }
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/api/status") {
    sendJson(res, 200, { openai: hasUsableApiKey, model });
    return;
  }

  if (req.method === "POST" && req.url?.startsWith("/api/")) {
    await handleApi(req, res);
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const path = safeJoin(new URL(req.url || "/", `http://localhost:${port}`).pathname);
    const data = await readFile(path);
    res.writeHead(200, { "content-type": mimeTypes[extname(path)] || "application/octet-stream" });
    res.end(data);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Dynamic PPM DAO AI prototype: http://127.0.0.1:${port}/`);
  console.log(
    hasUsableApiKey
      ? `OpenAI enabled with model ${model}`
      : "OpenAI disabled: set DYNAMIC_PPM_OPENAI_API_KEY to enable real AI."
  );
});
