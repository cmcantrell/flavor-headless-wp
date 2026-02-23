import { NextResponse } from "next/server";
import { clearAuthCookies } from "@flavor/core/lib/auth/cookies";

export async function POST() {
  await clearAuthCookies();
  return NextResponse.json({ success: true });
}
