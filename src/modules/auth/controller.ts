import { Request, Response } from "express";
import { registerUser, loginUser } from "./service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, omangNumber, preferredLanguage } = req.body;
    const data = await registerUser(email, password, fullName, omangNumber, preferredLanguage);
    res.status(201).json({
      user: data.user,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.status(200).json({
      user: data.user,
      accessToken: data.session?.access_token,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};