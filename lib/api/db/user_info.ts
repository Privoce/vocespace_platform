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
    // 如果用户信息不存在，我们需要创建一个新的用户信息记录并更新数据库
    if (error.code === "PGRST116") {
      return create(client, uid);
    }
    throw error;
  }

  return data;
};

export const create = async (
  client: SupabaseClient,
  uid: string
): Promise<UserInfo> => {
  const { data, error } = await client
    .from("user_info")
    .insert(DEFAULT_USER_INFO(uid))
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
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
  create,
  update,
  remove,
};
