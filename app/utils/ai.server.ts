import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const AI_MODEL = process.env.MINIMAX_MODEL || "MiniMax-M3.1-Flash";
const AI_BASE_URL = (process.env.MINIMAX_BASE_URL || "https://api.minimax.io/anthropic").replace(/\/+$/, "");
const AI_API_KEY = process.env.MINIMAX_API_KEY;
export const AI_TIMEOUT_MS = Number(process.env.MINIMAX_TIMEOUT_MS || 120000);

if (!AI_API_KEY) {
  throw new Error("MiniMax API key is not configured. Please set MINIMAX_API_KEY in your .env file");
}

type ContentBlock = { type: string; text?: string };

// Calls MiniMax through its Anthropic-compatible Messages API and returns the text output.
// The model spends part of maxTokens on thinking, so callers should leave headroom.
export async function generateText(
  prompt: string,
  { temperature = 0.1, maxTokens = 4096, timeoutMs = AI_TIMEOUT_MS }: { temperature?: number; maxTokens?: number; timeoutMs?: number } = {}
): Promise<string> {
  const response = await axios.post(
    `${AI_BASE_URL}/v1/messages`,
    {
      model: AI_MODEL,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": AI_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      timeout: timeoutMs,
    }
  );

  const blocks = (response.data?.content || []) as ContentBlock[];
  return blocks
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("")
    .trim();
}
