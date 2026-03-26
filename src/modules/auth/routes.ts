import { Router } from "express";
import { register, login, logout, me, refresh } from "./controller";
import { verifyRecaptcha } from "../../middleware/recaptcha";

const router = Router();

router.post("/register", verifyRecaptcha, register);
router.post("/login",    verifyRecaptcha, login);
router.post("/logout",   logout);
router.get( "/me",       me);
router.post("/refresh",  refresh);

export default router;
