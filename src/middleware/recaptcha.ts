import { Request, Response, NextFunction } from "express";

export const verifyRecaptcha = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.body.recaptchaToken;

  if (!token) {
    return res.status(400).json({ success: false, message: "reCAPTCHA token missing" });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  const response = await fetch(verifyUrl, { method: "POST" });
  const data = await response.json() as { success: boolean; score?: number; "error-codes"?: string[] };

  // For reCAPTCHA v3, score >= 0.5 means human. For v2, just check success.
  if (!data.success || (data.score !== undefined && data.score < 0.5)) {
    return res.status(400).json({ success: false, message: "reCAPTCHA verification failed" });
  }

  next();
};
