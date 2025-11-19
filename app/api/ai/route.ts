import { NextRequest, NextResponse } from "next/server";
import { dbApi } from "@/lib/api/db";
import { createClient } from "@/lib/supabase/server";
import { AICutAnalysisRes } from "@/lib/std/ai";
import { convertBase64ToImg, todayTimestamp } from "@/lib/std";

interface ReqPost {
  id: string;
  timestamp: number;
  data: {
    screenShot?: string;
    result: AICutAnalysisRes;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { data, id, timestamp }: ReqPost = await request.json();
    console.warn(data.result.lines);
    // 更新数据库
    if (data.result.lines.length > 0) {
      if (!data || !id) {
        return NextResponse.json(
          { error: "Missing data or id in request body" },
          { status: 400 }
        );
      }
      const client = await createClient();
      const date = todayTimestamp();

      const success = await dbApi.ai.insertOrUpdate(client, {
        id,
        date: date.toString(),
        result: data.result.lines,
      });
      if (!success) {
        return NextResponse.json(
          { error: "Failed to insert/update AI data" },
          { status: 500 }
        );
      }

      // 如果有图片，需要将base64转换为Blob并上传到存储中
      if (data.screenShot) {
        const blobImg = await convertBase64ToImg(data.screenShot);
        const imgName = `${id}_${timestamp}.jpg`;
        // 上传图片到supabase存储
        await dbApi.storage.uploadBlob(client, blobImg, imgName);
      }
    }
    return NextResponse.json(
      { message: "AI data inserted/updated successfully" },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error in POST /api/ai:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
