import { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_USER_INFO, UserInfo } from "../../std/user";

export const USER_INFO_API_URL = "/api/user_info";

export const get = async (
  client: SupabaseClient,
  uid: string
): Promise<UserInfo> => {
  const { data, error } = await client
    .from("user_info")
    .select("*")
    .eq("id", uid)
    .single();

  if (error) {
    console.error("API Error:", error);
    throw error;
  }

  return data;
};

/**
 * Get user info by uid, returns null if not found (instead of throwing error)
 */
export const getOrNull = async (
  client: SupabaseClient,
  uid: string
): Promise<UserInfo | null> => {
  const { data, error } = await client
    .from("user_info")
    .select("*")
    .eq("id", uid)
    .maybeSingle();

  if (error) {
    console.error("API Error:", error);
    return null;
  }

  return data;
};

export const create = async (
  client: SupabaseClient,
  uid: string,
  nickname: string
): Promise<UserInfo> => {
  const { data, error } = await client
    .from("user_info")
    .insert(DEFAULT_USER_INFO(uid, nickname))
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

export const insert = async (
  client: SupabaseClient,
  info: UserInfo
): Promise<boolean> => {
  const { data, error } = await client.from("user_info").insert(info).single();

  if (error) {
    throw error;
  }
  return true;
};

export const update = async (
  client: SupabaseClient,
  uid: string,
  info: Partial<UserInfo>
): Promise<boolean> => {
  const { data, error } = await client
    .from("user_info")
    .update(info)
    .eq("id", uid);

  if (error) {
    throw error;
  }
  return true;
};

export const remove = async (
  client: SupabaseClient,
  uid: string
): Promise<boolean> => {
  const { data, error } = await client.from("user_info").delete().eq("id", uid);

  if (error) {
    throw error;
  }
  return true;
};

export const userInfo = {
  get,
  getOrNull,
  create,
  insert,
  update,
  remove,
};
