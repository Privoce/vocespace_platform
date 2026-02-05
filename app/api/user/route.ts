import { dbApi } from "@/lib/api/db";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const uid = request.nextUrl.searchParams.get("uid");

    if (!uid) {
      return new Response(JSON.stringify({ error: "Missing uid parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await createClient();
    let exist = await dbApi.userInfo.exist(client, uid);
    return new Response(JSON.stringify({ exist }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error in GET /api/user:", e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
