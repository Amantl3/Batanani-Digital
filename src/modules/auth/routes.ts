import { Router } from "express";
import { register, login } from "./controller";
import { verifyRecaptcha } from "../../middleware/recaptcha";

const router = Router();

router.post("/register", verifyRecaptcha, register);
router.post("/login", verifyRecaptcha, login);

export default router;