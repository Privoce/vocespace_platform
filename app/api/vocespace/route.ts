import { CreateSpaceParams } from "@/lib/api/vocespace/space";
import { createClient } from "@/lib/supabase/server";
import { PostgrestSingleResponse, User } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const API_BASE = "https://vocespace.com/api/space";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const authGoogle = request.nextUrl.searchParams.get("auth") === "google";
    if (userId && authGoogle) {
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
        { status: 200 }
      );
    }

    return new Response("Bad Request", { status: 400 });
  } catch (error) {
    return new Response(`Internal Server Error: ${error}`, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

  return response;
}
