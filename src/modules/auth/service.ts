import { supabase } from "../../config/supabase";

export const registerUser = async (
  email: string,
  password: string,
  fullName?: string,
  omangNumber?: string,
  preferredLanguage?: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        omang_number: omangNumber,
        preferred_language: preferredLanguage,
      }
    }
  });
  if (error) throw new Error(error.message);
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
};

export const refreshSession = async (refreshToken: string) => {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error) throw new Error(error.message);
  return data;
};

export const getUser = async (accessToken: string) => {
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) throw new Error(error.message);
  return data.user;
};

export const logoutUser = async (accessToken: string) => {
  await supabase.auth.admin.signOut(accessToken).catch(() => {});
};
