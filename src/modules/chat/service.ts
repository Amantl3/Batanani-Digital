import Groq from "groq-sdk";
import { PrismaClient } from "@prisma/client";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const prisma = new PrismaClient();

const detectLanguage = (text: string): string => {
  const setswanaWords = ["dumela", "ke", "ga", "le", "ba", "go", "wa", "mo", "se", "re", "di", "lo", "ng", "thusa", "kopa"];
  const words = text.toLowerCase().split(" ");
  const matches = words.filter(w => setswanaWords.includes(w));
  return matches.length >= 1 ? "se" : "en";
};

export const handleChatMessage = async (from: string, message: string) => {
  const language = detectLanguage(message);

  const systemPrompt = language === "se"
    ? `O assistant wa BOCRA — Bothapi jwa Dithulaganyo tsa Dikhumisano jwa Botswana.
       Araba ka Setswana. Thusa batho ka dipotso tsa laesense, dipetso, le ditirelo tsa BOCRA.
       Nna mo go bonolo le go thusa.`
    : `You are a BOCRA assistant — Botswana Communications Regulatory Authority.
       Help users with questions about licences, complaints, and BOCRA services.
       Be friendly, clear and helpful. Keep responses concise.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ],
    max_tokens: 500,
  });

  const reply = response.choices[0]?.message?.content || "Sorry I could not process that.";

  await prisma.chatMessage.create({
    data: { from, message, response: reply, language }
  });

  return reply;
};