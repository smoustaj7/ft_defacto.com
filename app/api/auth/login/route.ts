import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";
import { setAuthSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = loginUser(email, password);
    await setAuthSession(user.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to login" }, { status: 401 });
  }
}
