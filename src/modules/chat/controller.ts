import { Request, Response } from "express";
import { handleChatMessage } from "./service";
import twilio from "twilio";

const MessagingResponse = twilio.twiml.MessagingResponse;

export const whatsappWebhook = async (req: Request, res: Response) => {
  try {
    const from = req.body.From;
    const message = req.body.Body;

    if (!message || !from) {
      return res.status(400).send("Missing message or sender");
    }

    const reply = await handleChatMessage(from, message);

    const twiml = new MessagingResponse();
    twiml.message(reply);

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).send("Error processing message");
  }
};