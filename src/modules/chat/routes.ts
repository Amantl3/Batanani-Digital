import { Router } from "express";
import { whatsappWebhook } from "./controller";
import { handleChatMessage } from "./service";

const router = Router();

router.post("/whatsapp", whatsappWebhook);

router.post("/test", async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await handleChatMessage("test-user", message);
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error("Chat test error:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;