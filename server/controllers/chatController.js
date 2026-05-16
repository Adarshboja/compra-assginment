import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { processInstruction } from "../services/layoutService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handleChat = async (req, res) => {
  try {
    const { message, layout, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A message string is required" });
    }

    const layoutPath = path.join(__dirname, "../data/layout.json");
    const storedLayout = JSON.parse(fs.readFileSync(layoutPath, "utf-8"));
    const activeLayout = layout && typeof layout === "object" ? layout : storedLayout;

    const result = await processInstruction(
      message,
      activeLayout,
      history
    );

    fs.writeFileSync(
      layoutPath,
      JSON.stringify(result.layout, null, 2)
    );

    res.json(result);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "AI processing failed",
    });
  }
};
