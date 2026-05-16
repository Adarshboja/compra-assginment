import { askAI } from "./openaiService.js";
import { applyDeterministicInstruction, updateNormalizedCoordinates } from "../utils/layoutEngine.js";
import { parseLayoutJson } from "../utils/jsonRepair.js";

export const processInstruction = async (
  message,
  layout,
  history = []
) => {
  const deterministicLayout = applyDeterministicInstruction(message, layout);

  try {
    const aiResponse = await askAI(
      message,
      deterministicLayout,
      history
    );

    const parsed = parseLayoutJson(aiResponse);

    return {
      layout: updateNormalizedCoordinates(parsed),
      reply: "Layout updated with AI semantic reasoning.",
      source: "ai",
    };
  } catch (error) {
    console.log(error.message);

    return {
      layout: deterministicLayout,
      reply: "Layout updated with the smart local layout engine.",
      source: "local-engine",
    };
  }
};
