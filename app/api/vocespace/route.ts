import { CreateSpaceParams } from "@/lib/api/vocespace/space";
import { createClient } from "@/lib/supabase/server";
import { PostgrestSingleResponse, User } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const API_BASE = "https://vocespace.com/api/space";

// CORS 头部配置
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  // 允许的源列表
  const allowedOrigins = [
    "http://localhost:3099",
    "http://localhost:3030",
    "https://vocespace.com",
    "https://home.vocespace.com",
    // 添加您的具体域名
  ];

  const corsHeaders = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin || "") ? origin! : "*",
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

    if (userId) {
      const client = await createClient();
      const user: PostgrestSingleResponse<User> = await client
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      return new Response(
        JSON.stringify({
          email: user.data?.email,
          username: user.data?.user_metadata.full_name || user.data?.email,
          avatar: user.data?.user_metadata.picture,
        }),
        { 
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(request),
          }
        }
      );
    }

    return new Response("Bad Request", { 
      status: 400,
      headers: getCorsHeaders(request),
    });
  } catch (error) {
    return new Response(`Internal Server Error: ${error}`, { 
      status: 500,
      headers: getCorsHeaders(request),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { spaceName, owner, ownerId }: CreateSpaceParams = await request.json();

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
        "Content-Type": response.headers.get("Content-Type") || "application/json",
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
