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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const router = (0, express_1.Router)();
router.post("/whatsapp", controller_1.whatsappWebhook);
router.post("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message } = req.body;
        const reply = yield (0, service_1.handleChatMessage)("test-user", message);
        res.json({ success: true, reply });
    }
    catch (error) {
        console.error("Chat test error:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
}));
exports.default = router;
