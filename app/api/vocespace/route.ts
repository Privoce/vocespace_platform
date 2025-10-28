import { dbApi } from "@/lib/api/db";
import { CreateSpaceParams } from "@/lib/api/vocespace/space";
import { UserInfo } from "@/lib/std/user";
import { createClient } from "@/lib/supabase/server";
import { PostgrestSingleResponse, User } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const API_BASE = "https://vocespace.com/api/space";

// CORS 头部配置
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin");

  const corsHeaders = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "false",
  };

  return corsHeaders;
}

// 处理 OPTIONS 预检请求
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request),
        },
      });
    }

    const client = await createClient();
    const user: UserInfo = await dbApi.userInfo.get(client,userId);

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request),
        },
      });
    }

    return new Response(
      JSON.stringify({
        username: user.nickname,
        avatar: user.avatar,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request),
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(request),
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { spaceName, owner, ownerId }: CreateSpaceParams =
      await request.json();

    const url = new URL(API_BASE);
    url.searchParams.append("space", "create");
    url.searchParams.append("spaceName", spaceName || owner);
    url.searchParams.append("ownerId", ownerId);
    url.searchParams.append("owner", owner);

    // send to vocespace.com
    const response = await fetch(url.toString(), {
      method: "GET",
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
        ...getCorsHeaders(request),
      },
    });
  } catch (error) {
    return new Response(`Internal Server Error: ${error}`, {
      status: 500,
      headers: getCorsHeaders(request),
    });
  }
}
