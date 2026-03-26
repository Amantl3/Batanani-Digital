/**
 * src/modules/chat/controller.ts
 */
import { Request, Response } from "express";
import { handleChatMessage } from "./service";
import { getAllLicences } from "../licences/service"; // FIX: Import the service
import twilio from "twilio";

const MessagingResponse = twilio.twiml.MessagingResponse;

export const whatsappWebhook = async (req: Request, res: Response) => {
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
      const results = await getAllLicences({ search: searchTerm, limit: 1 });

      if (results.results.length > 0) {
        const lic = results.results[0];
        reply = ` *Search Result found:*\n\n` +
                ` *Company:* ${lic.companyName}\n` +
                ` *Status:* ${lic.status.toUpperCase()}\n` +
                ` *ID:* ${lic.id}\n` +
                ` *Type:* ${lic.type}`;
      } else {
        reply = `No records found for "${searchTerm}". Please check the spelling and try again.`;
      }
    } else {
      // Fallback to your existing AI/Menu logic
      reply = await handleChatMessage(from, message);
    }

    twiml.message(reply);
    res.type("text/xml");
    res.send(twiml.toString());

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).send("Error processing message");
  }
};