import { Request, Response } from "express";
import { registerUser, loginUser, refreshSession, getUser, logoutUser } from "./service";

const IS_PROD = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure:   IS_PROD,
  sameSite: (IS_PROD ? "none" : "lax") as "none" | "lax",
  path:     "/",
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("access_token",  accessToken,  { ...cookieOptions, maxAge: 60 * 60 * 1000 });        // 1 hour
  res.cookie("refresh_token", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
}

function clearAuthCookies(res: Response) {
  res.clearCookie("access_token",  cookieOptions);
  res.clearCookie("refresh_token", cookieOptions);
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, omangNumber, preferredLanguage } = req.body;
    const data = await registerUser(email, password, fullName, omangNumber, preferredLanguage);

    if (data.session) {
      setAuthCookies(res, data.session.access_token, data.session.refresh_token);
    }

    res.status(201).json({
      user: {
        id:                data.user?.id,
        email:             data.user?.email,
        fullName:          data.user?.user_metadata?.full_name ?? fullName ?? "",
        role:              "public",
        omangVerified:     false,
        preferredLanguage: preferredLanguage ?? "en",
        createdAt:         data.user?.created_at,
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

    setAuthCookies(res, data.session!.access_token, data.session!.refresh_token);

    res.status(200).json({
      user: {
        id:                data.user?.id,
        email:             data.user?.email,
        fullName:          data.user?.user_metadata?.full_name ?? email,
        role:              "public",
        omangVerified:     false,
        preferredLanguage: data.user?.user_metadata?.preferred_language ?? "en",
        createdAt:         data.user?.created_at,
      },
    });
  } catch (error: any) {
    res.status(400).json({ detail: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.access_token ?? req.headers.authorization?.split(" ")[1];
  if (token) await logoutUser(token);
  clearAuthCookies(res);
  res.status(200).json({ success: true, message: "Logged out" });
};

export const me = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.access_token ?? req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ detail: "Not authenticated" });

    const user = await getUser(token);
    res.status(200).json({
      id:                user?.id,
      email:             user?.email,
      fullName:          user?.user_metadata?.full_name ?? "",
      role:              "public",
      omangVerified:     false,
      preferredLanguage: user?.user_metadata?.preferred_language ?? "en",
      createdAt:         user?.created_at,
    });
  } catch (error: any) {
    res.status(401).json({ detail: "Invalid or expired session" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) return res.status(401).json({ detail: "No refresh token" });

    const data = await refreshSession(refreshToken);
    if (!data.session) return res.status(401).json({ detail: "Refresh failed" });

    setAuthCookies(res, data.session.access_token, data.session.refresh_token);
    res.status(200).json({ success: true });
  } catch (error: any) {
    clearAuthCookies(res);
    res.status(401).json({ detail: "Session expired, please log in again" });
  }
};
