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