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

/**
 * Convert a base64 encoded string to a compressed Blob object
 * Works in both Node.js (using sharp) and browser environments (using canvas)
 * @param base64Str Base64 encoded image string (with or without data URI prefix)
 * @param maxSize Maximum size in KB (default 1024KB = 1MB)
 * @returns Compressed image as Blob
 */
export const convertBase64ToImg = async (base64Str: string, maxSize = 512): Promise<Blob> => {
  const isNode = typeof window === 'undefined';
  
  if (isNode) {
    // Node.js 环境：使用 sharp
    return convertBase64ToImgNode(base64Str, maxSize);
  } else {
    // 浏览器环境：使用 canvas
    return convertBase64ToImgBrowser(base64Str, maxSize);
  }
};

/**
 * Node.js 环境下的图片压缩（使用 sharp）
 */
const convertBase64ToImgNode = async (base64Str: string, maxSize: number): Promise<Blob> => {
  // 移除 data URI 前缀（如果存在）
  const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, '');
  
  // 将 base64 转换为 Buffer
  const buffer = Buffer.from(base64Data, 'base64');
  
  // 检查当前大小
  const currentSizeKB = buffer.length / 1024;
  
  // 如果已经小于目标大小，直接返回
  if (currentSizeKB <= maxSize) {
    return new Blob([buffer], { type: 'image/jpeg' });
  }
  
  try {
    // 动态导入 sharp
    const sharp = require('sharp');
    
    // 计算压缩质量
    const quality = Math.max(10, Math.min(100, Math.floor((maxSize / currentSizeKB) * 100)));
    
    // 压缩图片
    let compressedBuffer = await sharp(buffer)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    
    // 如果压缩后仍然过大，进一步降低质量
    let currentQuality = quality;
    while (compressedBuffer.length / 1024 > maxSize && currentQuality > 10) {
      currentQuality = Math.max(10, currentQuality - 10);
      compressedBuffer = await sharp(buffer)
        .jpeg({ quality: currentQuality, mozjpeg: true })
        .toBuffer();
    }
    
    // 如果降低质量还不够，尝试缩小尺寸
    if (compressedBuffer.length / 1024 > maxSize) {
      const metadata = await sharp(buffer).metadata();
      const scale = Math.sqrt(maxSize / (compressedBuffer.length / 1024));
      const newWidth = Math.floor((metadata.width || 800) * scale);
      
      compressedBuffer = await sharp(buffer)
        .resize(newWidth)
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();
    }
    
    return new Blob([compressedBuffer], { type: 'image/jpeg' });
  } catch (error) {
    console.error('Error compressing image with sharp:', error);
    return new Blob([buffer], { type: 'image/jpeg' });
  }
};

/**
 * 浏览器环境下的图片压缩（使用 canvas）
 */
const convertBase64ToImgBrowser = async (base64Str: string, maxSize: number): Promise<Blob> => {
  // 确保有 data URI 前缀
  const dataUri = base64Str.startsWith('data:') 
    ? base64Str 
    : `data:image/jpeg;base64,${base64Str}`;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // 设置 canvas 尺寸
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制图片
      ctx.drawImage(img, 0, 0);
      
      // 压缩图片
      let quality = 0.9;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            const sizeKB = blob.size / 1024;
            
            // 如果小于目标大小或质量已经很低，返回结果
            if (sizeKB <= maxSize || quality <= 0.1) {
              resolve(blob);
              return;
            }
            
            // 如果还是太大，降低质量重试
            quality -= 0.1;
            tryCompress();
          },
          'image/jpeg',
          quality
        );
      };
      
      tryCompress();
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = dataUri;
  });
}

