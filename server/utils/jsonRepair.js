export function extractJson(value) {
  if (!value || typeof value !== "string") {
    throw new Error("AI returned an empty response");
  }

  const withoutFence = value
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("AI response did not contain JSON");
  }

  return withoutFence.slice(start, end + 1);
}

export function parseLayoutJson(value) {
  return JSON.parse(extractJson(value));
}
