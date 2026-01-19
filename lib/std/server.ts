/**
 * Server-side utilities (Node.js only)
 * DO NOT import this file in client components
 */

import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import { TokenResult } from './space';
import { currentTimestamp } from '.';

const SECRET_KEY = "vocespace_secret_privoce";

/**
 * Generate JWT token on the server side
 * This is the server-side version that doesn't use fetch
 */
export const generateTokenServer = (payload: TokenResult): string => {
  const now = Math.floor(currentTimestamp() / 1000);
  const iat = payload.iat && payload.iat > 0 ? payload.iat : now;
  const exp =
    payload.exp && payload.exp > 0 ? payload.exp : now + 3600 * 24 * 15; // default 15 days

  const claims: Record<string, any> = {
    ...payload,
    iat,
    exp,
  };

  if (!claims.id && claims.userId) claims.id = claims.userId;

  const token = jwt.sign(claims, SECRET_KEY, {
    algorithm: "HS256",
  });

  return token;
};

/**
 * Server-side image compression using sharp
 * @param base64Str Base64 encoded image string (with or without data URI prefix)
 * @param maxSize Maximum size in KB (default 512KB)
 * @returns Compressed image as Buffer
 */
export const convertBase64ToImgServer = async (
  base64Str: string, 
  maxSize = 512
): Promise<Buffer> => {
  // 移除 data URI 前缀（如果存在）
  const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, '');
  
  // 将 base64 转换为 Buffer
  const buffer = Buffer.from(base64Data, 'base64');
  
  // 检查当前大小
  const currentSizeKB = buffer.length / 1024;
  
  // 如果已经小于目标大小,直接返回
  if (currentSizeKB <= maxSize) {
    return buffer;
  }
  
  try {
    // 计算压缩质量
    const quality = Math.max(10, Math.min(100, Math.floor((maxSize / currentSizeKB) * 100)));
    
    // 压缩图片
    let compressedBuffer = await sharp(buffer)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    
    // 如果压缩后仍然过大,进一步降低质量
    let currentQuality = quality;
    while (compressedBuffer.length / 1024 > maxSize && currentQuality > 10) {
      currentQuality = Math.max(10, currentQuality - 10);
      compressedBuffer = await sharp(buffer)
        .jpeg({ quality: currentQuality, mozjpeg: true })
        .toBuffer();
    }
    
    // 如果降低质量还不够,尝试缩小尺寸
    if (compressedBuffer.length / 1024 > maxSize) {
      const metadata = await sharp(buffer).metadata();
      const scale = Math.sqrt(maxSize / (compressedBuffer.length / 1024));
      const newWidth = Math.floor((metadata.width || 800) * scale);
      
      compressedBuffer = await sharp(buffer)
        .resize(newWidth)
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();
    }
    
    return compressedBuffer;
  } catch (error) {
    console.error('Error compressing image with sharp:', error);
    return buffer;
  }
};

/**
 * Convert Buffer to Blob (for API responses)
 * Note: In Node.js, use Response with buffer directly instead
 */
export const bufferToBlob = (buffer: Buffer, type = 'image/jpeg'): Blob => {
  // Convert Buffer to Uint8Array for Blob compatibility
  return new Blob([new Uint8Array(buffer)], { type });
};
