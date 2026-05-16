import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import { getNodesByRole } from "../utils/semanticRoles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

function getClient() {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_key_here") {
    throw new Error("OPENAI_API_KEY is missing");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export const askAI = async (
  message,
  layout,
  history = []
) => {
  const roles = getNodesByRole(layout);

  const systemPrompt = `
You are an expert AI layout transformation agent for a Canva-like editor.

Return ONLY valid JSON. Do not use Markdown.

The response must be the complete updated layout JSON, not a diff.

Design rules:
- Preserve every node id and do not remove nodes.
- Use x, y, width, height for absolute layout.
- Keep nx, ny, nw, nh consistent with the artboard size.
- Headline remains the largest text element.
- Product image remains the main focal element.
- Offer badge is the yellow circle and its discount text should travel with it.
- Preserve aspect ratios for images.
- Avoid overlap and keep the hierarchy premium and balanced.
- Supported aspect ratios: 1:1, 9:16, 16:9, 4:5.

Detected semantic roles:
${JSON.stringify(Object.fromEntries(Object.entries(roles).map(([role, nodes]) => [role, nodes.map((node) => node.id)])), null, 2)}

Current layout JSON:
${JSON.stringify(layout)}
`;

  const response = await getClient().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ],
    response_format: { type: "json_object" },
    temperature: 0.25,
  });

  return response.choices[0].message.content;
};
