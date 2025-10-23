import { SupabaseClient } from "@supabase/supabase-js";

export interface SBClientNeeded {
  client: SupabaseClient;
}

export type Nullable<T> = T | null;

export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Mobi|Android/i.test(navigator.userAgent);
};
