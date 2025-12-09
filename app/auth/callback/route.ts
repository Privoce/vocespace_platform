import { dbApi } from "@/lib/api/db";
import { vocespaceUrl } from "@/lib/std/space";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const spaceName = request.nextUrl.searchParams.get("spaceName");
  const from = request.nextUrl.searchParams.get("from");
  const origin = request.nextUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${error.message}`
      );
    }

    if (data?.user) {
      // 获取用户ID并重定向到用户页面
      const userId = data.user.id;
      let redirectUrl: string;

      const isLocalEnv = process.env.NODE_ENV === "development";
      const baseUrl = isLocalEnv ? origin : "https://home.vocespace.com";

      // 获取用户信息（新用户可能不存在）
      const userInfo = await dbApi.userInfo.getOrNull(supabase, userId);
      if (userInfo && userInfo.username) {
        // 用户存在就改变online状态
        await dbApi.userInfo.online(supabase, userId);
        if (spaceName) {
          // 用户已有昵称,说明用户已经注册完毕，直接跳转到 重定向位置
          redirectUrl = vocespaceUrl(
            userId,
            userInfo.username,
            from === "space" ? "space" : "vocespace",
            spaceName
          );
        } else {
          redirectUrl = `${baseUrl}/auth/user/${userId}`;
        }
      } else {
        redirectUrl = `${baseUrl}/auth/user/${userId}${
          spaceName
            ? `?spaceName=${encodeURIComponent(spaceName)}&from=${
                from === "space" ? "space" : "vocespace"
              }`
            : ""
        }`;
      }

      console.log("Redirecting to:", redirectUrl);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`);
}
