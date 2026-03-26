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
exports.whatsappWebhook = void 0;
const service_1 = require("./service");
const service_2 = require("../licences/service"); // FIX: Import the service
const twilio_1 = __importDefault(require("twilio"));
const MessagingResponse = twilio_1.default.twiml.MessagingResponse;
const whatsappWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const from = req.body.From;
        const body = req.body.Body || "";
        const message = body.trim();
        if (!message || !from) {
            return res.status(400).send("Missing message or sender");
        }
        const twiml = new MessagingResponse();
        let reply = "";
        // FIX: Add logic to handle "Search [Company]" specifically
        if (message.toLowerCase().startsWith("search ")) {
            const searchTerm = message.substring(7).trim();
            const results = yield (0, service_2.getAllLicences)({ search: searchTerm, limit: 1 });
            if (results.results.length > 0) {
                const lic = results.results[0];
                reply = ` *Search Result found:*\n\n` +
                    ` *Company:* ${lic.companyName}\n` +
                    ` *Status:* ${lic.status.toUpperCase()}\n` +
                    ` *ID:* ${lic.id}\n` +
                    ` *Type:* ${lic.type}`;
            }
            else {
                reply = `No records found for "${searchTerm}". Please check the spelling and try again.`;
            }
        }
        else {
            // Fallback to your existing AI/Menu logic
            reply = yield (0, service_1.handleChatMessage)(from, message);
        }
        twiml.message(reply);
        res.type("text/xml");
        res.send(twiml.toString());
    }
    catch (error) {
        console.error("Chat error:", error);
        res.status(500).send("Error processing message");
    }
});
exports.whatsappWebhook = whatsappWebhook;
