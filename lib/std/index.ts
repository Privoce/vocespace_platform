import { SupabaseClient } from "@supabase/supabase-js";

export interface SBClientNeeded {
  client: SupabaseClient;
}

export type Nullable<T> = T | null;

export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Mobi|Android/i.test(navigator.userAgent);
};

// - 去除首尾空格
// - 查找`-`,`_`,` `等分隔符，形成数组
// - 如果是英语则将数组的每个首字母大写后就是结果
// - 如果是中文则直接连接数组元素作为结果
// ```
//console.warn(createSpaceName("  live_kit-space test  ")); // LKST
// console.warn(createSpaceName("  你好_世界-测试  ")); // 你世测
// console.warn(createSpaceName("singleword")); // S
// console.warn(createSpaceName("  多字节字符测试  ")); // 多
// console.warn(createSpaceName("  mixed_语言-test  ")); // M语T
// console.warn(createSpaceName("中文 交流")); // 中交
// ```
export const createSpaceName = (spaceName: string): string => {
  const trimmed = spaceName.trim();
  const separators = /[-_\s]+/;
  const parts = trimmed.split(separators).filter((part) => part.length > 0);
  
  if (parts.length === 1) {
    // 如果没有有效部分，返回spaceName的首字母大写
    return trimmed.slice(0, 1).toUpperCase();
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
};