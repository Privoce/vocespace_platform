import { NextRequest, NextResponse } from "next/server";
import { dbApi } from "@/lib/api/db";
import { createClient } from "@/lib/supabase/server";
import { AICutAnalysisRes } from "@/lib/std/ai";
import { todayTimestamp } from "@/lib/std";
import { convertBase64ToImgServer } from "@/lib/std/server";

interface ReqPost {
  id: string;
  timestamp: number;
  data: {
    screenShot?: string;
    result: AICutAnalysisRes;
  };
}

export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get("uid");
    const date = request.nextUrl.searchParams.get("date");

    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid parameter" },
        { status: 400 }
      );
    }

    const client = await createClient();
    if (date) {
      // 有date代表查询具体某日的
      const aiData = await dbApi.ai.get(client, uid, date);
      return NextResponse.json({ data: aiData });
    }else {
      // 没有表示查询所有的，目前不提供查询所有的接口，数据量太大
      return NextResponse.json(
        { error: "date parameter - `date: string` is required" },
        { status: 400 }
      );  
    }


  }catch (e) {
    console.error("Error in GET /api/ai:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data, id, timestamp }: ReqPost = await request.json();
    // console.warn(data.result.lines);
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

      // 如果有图片，需要将base64转换为Buffer并上传到存储中
      if (data.screenShot) {
        const imgBuffer = await convertBase64ToImgServer(data.screenShot, 512);
        const imgName = `${id}_${timestamp}.jpg`;
        // 上传图片到supabase存储
        await dbApi.storage.uploadBuffer(client, imgBuffer, imgName);
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
