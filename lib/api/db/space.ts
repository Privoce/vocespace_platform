import { castToSpace, Space } from "@/lib/std/space";
import { SupabaseClient } from "@supabase/supabase-js";

const TABLE = "space";

export const getById = async (
  client: SupabaseClient,
  id: string
): Promise<Space> => {
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return castToSpace(data);
};

export const get = async (client: SupabaseClient): Promise<Space[]> => {
  const { data, error } = await client.from(TABLE).select("*");
  if (error) throw error;

  return data.map((space) => {
    return castToSpace(space);
  });
};

export const getByUserId = async (
  client: SupabaseClient,
  uid: string
): Promise<Space[]> => {
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("owner_id", uid);

  if (error) throw error;
  return data.map((space) => {
    return castToSpace(space);
  });
};

export const insert = async (
  client: SupabaseClient,
  space: Space
): Promise<boolean> => {
  const { error } = await client.from(TABLE).insert(space);

  if (error) throw error;
  return true;
};

export const update = async (client: SupabaseClient, space: Space) => {
  const { data, error } = await client
    .from(TABLE)
    .update(space)
    .eq("id", space.id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const remove = async (
  client: SupabaseClient,
  id: string
): Promise<boolean> => {
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
  return true;
};

export const space = {
  get,
  getById,
  getByUserId,
  insert,
  update,
  remove,
};
