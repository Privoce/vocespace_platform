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
    if (!error && data?.user) {
      // 获取用户ID并重定向到用户页面
      const userId = data.user.id;
      let userPageUrl = `/auth/user/${userId}`;
      // if contains spaceName, redirect to vocespace.com use vocespaceUrl()
      if (spaceName) {
        // let's get userInfo and check if nickname exists
        const userInfo: UserInfo = await dbApi.userInfo.get(supabase, userId);
        // redirect to /auth/user/[userId], here will auto let user complete onboarding
        if (userInfo && userInfo.nickname) {
          // direct to vocespace url
          userPageUrl = vocespaceUrl(
            userId,
            userInfo.nickname,
            "vocespace",
            spaceName
          );
          return NextResponse.redirect(userPageUrl);
        } else {
          // just redirect to /auth/user/[userId] to complete onboarding with params
          userPageUrl = `/auth/user/${userId}?spaceName=${spaceName}`;
        }
      }

      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${userPageUrl}`);
      } else {
        return NextResponse.redirect(
          `https://home.vocespace.com${userPageUrl}`
        );
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
