import { dbApi } from "@/lib/api/db";
import { vocespaceUrl } from "@/lib/std/space";
import { UserInfo } from "@/lib/std/user";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
// import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const spaceName = request.nextUrl.searchParams.get("spaceName");
  const origin = request.nextUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error.message}`);
    }
    
    if (data?.user) {
      // 获取用户ID并重定向到用户页面
      const userId = data.user.id;
      let redirectUrl: string;
      
      // if contains spaceName, redirect to vocespace.com use vocespaceUrl()
      if (spaceName) {
        // let's get userInfo and check if nickname exists
        const userInfo: UserInfo = await dbApi.userInfo.get(supabase, userId);
        
        if (userInfo && userInfo.nickname) {
          // 用户已有昵称，直接跳转到 vocespace.com
          redirectUrl = vocespaceUrl(
            userId,
            userInfo.nickname,
            "google",
            spaceName
          );
        } else {
          // 用户需要完成 onboarding，跳转到用户页面
          const isLocalEnv = process.env.NODE_ENV === "development";
          const baseUrl = isLocalEnv ? origin : "https://home.vocespace.com";
          redirectUrl = `${baseUrl}/auth/user/${userId}?spaceName=${spaceName}`;
        }
      } else {
        // 没有 spaceName，跳转到用户页面
        const isLocalEnv = process.env.NODE_ENV === "development";
        const baseUrl = isLocalEnv ? origin : "https://home.vocespace.com";
        redirectUrl = `${baseUrl}/auth/user/${userId}`;
      }

      return NextResponse.redirect(redirectUrl);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`);
}
