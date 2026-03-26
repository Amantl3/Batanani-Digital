import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  // Read from httpOnly cookie first, fall back to Authorization header
  const token = req.cookies?.access_token ?? req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized - no token" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ success: false, message: "Not authorized - invalid token" });
  }

  (req as any).user = data.user;
  next();
};
