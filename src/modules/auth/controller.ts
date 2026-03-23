import { Request, Response } from "express";
import { registerUser, loginUser } from "./service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, omangNumber, preferredLanguage } = req.body;
    const data = await registerUser(email, password, fullName, omangNumber, preferredLanguage);
    res.status(201).json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        fullName: data.user?.user_metadata?.full_name ?? fullName ?? "",
        role: "public",
        omangVerified: false,
        preferredLanguage: preferredLanguage ?? "en",
        createdAt: data.user?.created_at,
      }
    });
  } catch (error: any) {
    res.status(400).json({ detail: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.status(200).json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        fullName: data.user?.user_metadata?.full_name ?? email,
        role: "public",
        omangVerified: false,
        preferredLanguage: data.user?.user_metadata?.preferred_language ?? "en",
        createdAt: data.user?.created_at,
      },
      accessToken: data.session?.access_token,
    });
  } catch (error: any) {
    res.status(400).json({ detail: error.message });
  }
};