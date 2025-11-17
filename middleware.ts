import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // 处理 CORS 预检请求
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      },
    });
  }

  // 如果 URL 包含 code 参数（OAuth 回调），重定向到 /auth/callback
  const code = request.nextUrl.searchParams.get("code");
  if (code && request.nextUrl.pathname === "/") {
    const callbackUrl = new URL("/auth/callback", request.url);
    // 保留所有查询参数
    request.nextUrl.searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value);
    });
    console.log("Redirecting OAuth callback from / to /auth/callback");
    return NextResponse.redirect(callbackUrl);
  }

  // 对于 vocespace API 路由，跳过身份验证，直接处理
  if (request.nextUrl.pathname.startsWith("/api/vocespace")) {
    // 直接返回 NextResponse.next() 而不调用 updateSession
    const response = NextResponse.next();
    
    // 添加 CORS 头部
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    
    return response;
  }

  // 对于其他 API 路由，正常处理身份验证
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = await updateSession(request);
    
    // 添加 CORS 头部到所有 API 响应
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    
    return response;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths including API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/:path*", // 明确包含 API 路由
  ],
};
