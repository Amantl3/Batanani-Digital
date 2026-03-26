"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChatMessage = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const client_1 = require("@prisma/client");
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
const prisma = new client_1.PrismaClient();
const detectLanguage = (text) => {
    const setswanaWords = ["dumela", "ke", "ga", "le", "ba", "go", "wa", "mo", "se", "re", "di", "lo", "ng", "thusa", "kopa"];
    const words = text.toLowerCase().split(" ");
    const matches = words.filter(w => setswanaWords.includes(w));
    return matches.length >= 1 ? "se" : "en";
};
const handleChatMessage = (from, message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const language = detectLanguage(message);
    const systemPrompt = language === "se"
        ? `O assistant wa BOCRA — Bothapi jwa Dithulaganyo tsa Dikhumisano jwa Botswana.
       Araba ka Setswana. Thusa batho ka dipotso tsa laesense, dipetso, le ditirelo tsa BOCRA.
       Nna mo go bonolo le go thusa.`
        : `You are a BOCRA assistant — Botswana Communications Regulatory Authority.
       Help users with questions about licences, complaints, and BOCRA services.
       Be friendly, clear and helpful. Keep responses concise.`;
    const response = yield groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ],
        max_tokens: 500,
    });
    const reply = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "Sorry I could not process that.";
    yield prisma.chatMessage.create({
        data: { from, message, response: reply, language }
    });
    return reply;
});
exports.handleChatMessage = handleChatMessage;
