import { vocespaceUrl } from "@/lib/std/space";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
// import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const spaceName = request.nextUrl.searchParams.get("spaceName");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // if contains spaceName, redirect to vocespace.com use vocespaceUrl()
      if (spaceName) {
        const redirectUrl = vocespaceUrl(
          data.user.id,
          data.user.user_metadata.full_name || data.user.email!,
          "vocespace",
          spaceName
        );

        return NextResponse.redirect(redirectUrl);
      }

      // 获取用户ID并重定向到用户页面
      const userId = data.user.id;
      const userPageUrl = `/auth/user/${userId}`;

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
