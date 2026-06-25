import { hasUsableApiKey, model } from "./_openai.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.status(200).json({ openai: hasUsableApiKey, model, runtime: "vercel" });
}
