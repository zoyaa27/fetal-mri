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
    return res.status(400).json({ response: "A question parameter is required." });
  }

  // Locate your Python script relative to this server file
// Use a clean relative path from the project root to bypass Windows space formatting bugs
  const scriptPath = "./python_app/pipelines/rag_assistant.py";
    
  // Note: If you use a virtual environment, you may need to change "python" to 
  // path.resolve(__dirname, "../../.venv/bin/python") depending on your OS.
  const pythonProcess = spawn("python", [scriptPath, question]);

  let resultData = "";
  let errorData = "";

  pythonProcess.stdout.on("data", (data) => {
    resultData += data.toString();
  });

  // Catching the crash logs
  pythonProcess.stderr.on("data", (data) => {
    errorData += data.toString();
  });

  pythonProcess.on("close", (code) => {
    // 1. If Python throws a fatal error, send the raw traceback to the chatbot!
    if (code !== 0 || errorData) {
      console.error(`PYTHON CRASH LOG:`, errorData);
      return res.status(500).json({ response: `[Python Crash]:\n${errorData}` });
    }
    
    // 2. If Python succeeds but prints blank space
    if (!resultData.trim()) {
      return res.status(500).json({ response: "[Silent Failure]: Script ran but printed nothing. Check your sys.stdout.flush() and print() statements." });
    }
    
    // 3. Success!
    res.json({ response: resultData.trim() });
  });
});