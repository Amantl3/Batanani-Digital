import { Request, Response } from "express";
import { registerUser, loginUser } from "./service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await registerUser(email, password);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};