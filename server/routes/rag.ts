import { Router } from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ragRouter = Router();

ragRouter.post("/query", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "A question parameter is required." });
  }

  // Locate your Python script relative to this server file
  const scriptPath = path.resolve(__dirname, "../../python_app/pipelines/rag_assistant.py");
  
  // Spawn the python process, passing the user question as an argument
  const pythonProcess = spawn("python", [scriptPath, question]);

  let resultData = "";
  let errorData = "";

  pythonProcess.stdout.on("data", (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorData += data.toString();
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}. Error: ${errorData}`);
      return res.status(500).json({ error: "Failed to execute RAG pipeline engine." });
    }
    
    res.json({ response: resultData.trim() });
  });
});