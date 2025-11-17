import { SupabaseClient } from "@supabase/supabase-js";
import { BucketApiErrMsg } from "../error";

export const FOLDER = "public";
export const AVATAR_BUCKET = "avatars";
export const AI_ANALYSIS_BUCKET = "ai_analysis";

export const createAvatarStoragePath = (
  uid: string,
  fileExt: string
): string => {
  return `${FOLDER}/${uid}_${Date.now()}.${fileExt}`;
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

/**
 * 将blob图片上传到supabase存储中
 * @param blobImg
 */
const uploadBlob = async (
  client: SupabaseClient,
  blobImg: Blob,
  name: string
) => {
  const { data, error } = await client.storage
    .from(AI_ANALYSIS_BUCKET)
    .upload(`${FOLDER}/${name}`, blobImg, {
      cacheControl: "3600",
      upsert: true,
    });
  if (error) {
    throw error;
  }

  return data.path;
};

export const storage = {
  update,
  url,
  remove,
  uploadBlob,
};
