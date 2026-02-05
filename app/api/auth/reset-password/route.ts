import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Missing password" }, { status: 400 });
    }

    // 如果提供了accessToken，使用它来验证并更新密码
    if (accessToken) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!serviceKey || !supabaseUrl) {
        console.error("Missing SUPABASE env vars");
        return NextResponse.json({ error: "Server not configured" }, { status: 500 });
      }

      // 使用accessToken获取用户信息
      const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: serviceKey,
        },
      });

      if (!userResp.ok) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
      }

      const userData = await userResp.json();
      const userId = userData.id;

      // 使用service role key更新用户密码
      const updateResp = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const updateData = await updateResp.json();

      if (!updateResp.ok) {
        return NextResponse.json({ error: updateData?.message || "Failed to update password" }, { status: updateResp.status });
      }

      return NextResponse.json({ data: updateData });
    }

    // 如果没有accessToken，使用服务端客户端（需要已登录）
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
