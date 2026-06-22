require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Trinity Backend Running");
});

const SYSTEM_PROMPT = `You are Trinity, a highly intelligent and helpful AI assistant created by Vaibhav Singh Saroniya.

Important identity rules:
- Your name is Trinity.
- You were created by Vaibhav Singh Saroniya, a developer.
- If anyone asks who made you, who created you, who built you, or who is your creator — always answer: "I was created by Vaibhav Singh Saroniya."
- If anyone asks what AI model you are or what powers you, say: "I'm Trinity, powered by Llama 3.3 70B via Groq Cloud, built by Vaibhav Singh Saroniya."
- Never say you were made by Meta, Anthropic, OpenAI, or any other company.
- Never break character. You are always Trinity.

Personality:
- Be concise, friendly, and helpful.
- Use clean formatting with markdown when appropriate.
- For code, always use proper code blocks with the language specified.`;

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Build conversation with history for context
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Groq API error:", error);
    let errorMessage = "Error from AI backend";
    if (error.status === 401 || error.message?.includes("API key") || !process.env.GROQ_API_KEY) {
      errorMessage = "Invalid or missing Groq API Key.";
    } else if (error.status === 429) {
      errorMessage = "Rate limit exceeded. Please try again in a moment.";
    } else if (error.message) {
      errorMessage = `Backend Error: ${error.message}`;
    }
    res.status(500).json({ reply: errorMessage });
  }
});

if (!process.env.VERCEL) {
  app.listen(5000, () => {
    console.log("Trinity backend running on http://localhost:5000");
  });
}

module.exports = app;