import { SupabaseClient } from "@supabase/supabase-js";

export interface SBClientNeeded {
  client: SupabaseClient;
}

export type Nullable<T> = T | null;

export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Mobi|Android/i.test(navigator.userAgent);
};

// 对spaceName进行分割形成名字
// - 去除首尾空格
// - 查找`-`,`_`,` `等分隔符，形成数组
// - 如果是英语则将数组的每个首字母大写后就是结果
// - 如果是中文则直接连接数组元素作为结果
export const createSpaceName = (spaceName: string): string => {
  const trimmed = spaceName.trim();
  const separators = /[-_\s]+/;
  const parts = trimmed.split(separators).filter((part) => part.length > 0);
  
  if (parts.length === 1) {
    // 如果没有有效部分，返回spaceName的首字母大写
    return trimmed.slice(0, 1).toUpperCase();
  }

  // 检查是否包含非ASCII字符（如中文）
  const containsNonASCII = /[^\x00-\x7F]/.test(trimmed);

  if (containsNonASCII) {
    // 如果包含非ASCII字符，直接连接数组元素
    return parts.join("");
  } else {
    // 否则，将每个部分的首字母大写后连接
    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");
  }
};
