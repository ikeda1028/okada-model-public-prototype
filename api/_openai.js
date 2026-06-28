const apiKey = process.env.DYNAMIC_PPM_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
export const model = process.env.OPENAI_MODEL || "gpt-5.5";
export const hasUsableApiKey = Boolean(apiKey && apiKey !== "sk-your-key-here" && apiKey.startsWith("sk-"));

export const ppmPlanSchema = {
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

export const meetingSchema = {
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

export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function jsonResponseText(data) {
  const outputText = data.output_text;
  if (outputText) return outputText;
  const item = data.output?.flatMap((entry) => entry.content || []).find((content) => content.text);
  return item?.text || "";
}

export async function callOpenAI({ instructions, input, schemaName, schema }) {
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

  return JSON.parse(jsonResponseText(data));
}

export function sendError(res, error) {
  res.status(error.status || 500).json({ error: error.message || "Server error" });
}
