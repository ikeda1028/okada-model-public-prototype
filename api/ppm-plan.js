import { callOpenAI, ppmPlanSchema, readBody, sendError } from "./_openai.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = await readBody(req);
    const result = await callOpenAI({
      schemaName: "ppm_plan",
      schema: ppmPlanSchema,
      instructions:
        "You are a senior project architect. Generate a Makiyama-style PPM plan for a DAO-style contribution evaluation app. Return Japanese content. Keep tasks concrete and suitable for Gantt planning.",
      input: JSON.stringify(body),
    });
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}
