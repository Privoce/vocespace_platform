import { SupabaseClient } from "@supabase/supabase-js";
import { BucketApiErrMsg } from "../error";

export const AVATAR_BUCKET = "avatars";
export const AVATAR_FOLDER = "public";

export const createAvatarStoragePath = (
  uid: string,
  fileExt: string
): string => {
  return `${AVATAR_FOLDER}/${uid}.${fileExt}`;
};

const update = async (client: SupabaseClient, uid: string, file: File) => {
  const fileExt = file.name.split(".").pop();
  if (!fileExt) {
    throw new Error(BucketApiErrMsg.FILE_NO_EXT);
  }
  const filePath = createAvatarStoragePath(uid, fileExt);
  const { data, error } = await client.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });
  if (error) {
    throw error;
  }

  return data.path;
};

const url = async (client: SupabaseClient, path: string) => {
  const {
    data: { publicUrl },
  } = client.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  return publicUrl;
};

const remove = async (
  client: SupabaseClient,
  path: string
): Promise<boolean> => {
  const { data, error } = await client.storage
    .from(AVATAR_BUCKET)
    .remove([path]);
  if (error) throw error;
  return true;
};

export const storage = {
  update,
  url,
  remove,
};
