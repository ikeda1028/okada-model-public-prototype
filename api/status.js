import { hasUsableApiKey, model } from "./_openai.js";

function keyState(value) {
  if (!value) return "missing";
  if (value === "sk-your-key-here") return "placeholder";
  if (!value.startsWith("sk-")) return "invalid-prefix";
  return "present";
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.status(200).json({
    openai: hasUsableApiKey,
    model,
    runtime: "vercel",
    diagnostics: {
      DYNAMIC_PPM_OPENAI_API_KEY: keyState(process.env.DYNAMIC_PPM_OPENAI_API_KEY),
      OPENAI_API_KEY: keyState(process.env.OPENAI_API_KEY),
      OPENAI_MODEL: process.env.OPENAI_MODEL ? "present" : "default",
    },
  });
}
