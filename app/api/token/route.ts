import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { TokenResult } from "@/lib/std/space";
import { currentTimestamp } from "@/lib/std";

const SECRET_KEY = "vocespace_secret_privoce";

export async function POST(request: NextRequest) {
  try {
    const payload: TokenResult = await request.json();

    const now = Math.floor(currentTimestamp() / 1000);
    const iat = payload.iat && payload.iat > 0 ? payload.iat : now;
    const exp =
      payload.exp && payload.exp > 0 ? payload.exp : now + 3600 * 24 * 15; // default 15 days

    const claims: Record<string, any> = {
      ...payload,
      iat,
      exp,
    };

    if (!claims.id && claims.userId) claims.id = claims.userId;

    const token = jwt.sign(claims, SECRET_KEY, {
      algorithm: "HS256",
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
