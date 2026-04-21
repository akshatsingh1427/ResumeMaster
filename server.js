import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post("/api/parse-resume", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = req.file.path;
  const originalName = req.file.originalname.toLowerCase();
  let extractedText = "";

  try {
    if (originalName.endsWith(".pdf")) {
      try {
        const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      } catch (e) {
        console.error("PDF parse error:", e.message);
        const raw = fs.readFileSync(filePath, "latin1");
        const matches = raw.match(/[^\x00-\x1F\x7F-\xFF]{4,}/g);
        extractedText = matches ? matches.join(" ") : "";
      }
    } else if (originalName.endsWith(".docx") || originalName.endsWith(".doc")) {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value;
      } catch (e) {
        console.error("DOCX parse error:", e.message);
        extractedText = fs.readFileSync(filePath, "utf8");
      }
    } else {
      extractedText = fs.readFileSync(filePath, "utf8");
    }

    extractedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();

    try { fs.unlinkSync(filePath); } catch {}

    if (!extractedText || extractedText.length < 50) {
      return res.status(422).json({ error: "Could not extract text. Please paste your resume manually." });
    }

    res.json({ text: extractedText, length: extractedText.length });
  } catch (err) {
    try { fs.unlinkSync(filePath); } catch {}
    res.status(500).json({ error: "Failed to parse file", message: err.message });
  }
});

// ── AI Chat via Groq ───────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, system } = req.body;
    const groqMessages = [];
    if (system) groqMessages.push({ role: "system", content: system });
    groqMessages.push(...messages);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: "Groq API error", details: err });
    }

    const data = await response.json();
    res.json({ reply: data.choices?.[0]?.message?.content || "" });
  } catch (error) {
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.listen(3001, () => {
  console.log("✅ Server running at http://localhost:3001");
  console.log("🤖 Groq: llama-3.3-70b-versatile (FREE)");
  console.log("📄 PDF + DOCX parsing enabled");
});
