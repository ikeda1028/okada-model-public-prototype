import { callOpenAI, meetingSchema, readBody, sendError } from "./_openai.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = await readBody(req);
    const result = await callOpenAI({
      schemaName: "meeting_analysis",
      schema: meetingSchema,
      instructions:
        "You analyze project meeting contribution for DAO reward allocation. Do not reward speaking time alone. Reward risk discovery, decisions, concrete action items, evidence, facilitation, stakeholder alignment, and follow-through. Return Japanese content.",
      input: JSON.stringify(body),
    });
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}
