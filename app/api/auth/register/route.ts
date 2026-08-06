import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";
import { setAuthSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const user = registerUser(email, password, fullName);
    await setAuthSession(user.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to register" }, { status: 400 });
  }
}
