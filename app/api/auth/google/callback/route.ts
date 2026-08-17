import { NextRequest, NextResponse } from "next/server";
import { findOrCreateOAuthUser } from "@/lib/auth";
import { setAuthSession } from "@/lib/session";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(`${req.nextUrl.origin}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({ error: "Invalid Google OAuth configuration." }, { status: 400 });
    }

    const redirectUri = REDIRECT_URI ?? `${req.nextUrl.origin}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const data = await tokenRes.text();
      return NextResponse.json({
        error: `Failed to exchange code: ${data}`,
        redirectUri,
      }, { status: 500 });
    }

    const tokenData = await tokenRes.json();
    const idToken = tokenData.id_token;

    if (!idToken) {
      return NextResponse.json({ error: "Google did not return an id_token." }, { status: 500 });
    }

    const userInfoRes = await fetch("https://oauth2.googleapis.com/tokeninfo?" + new URLSearchParams({ id_token: idToken }));
    if (!userInfoRes.ok) {
      const data = await userInfoRes.text();
      return NextResponse.json({ error: `Failed to validate token: ${data}` }, { status: 500 });
    }

    const userInfo = await userInfoRes.json();
    const email = userInfo.email as string;
    const fullName = (userInfo.name as string) ?? email.split("@")[0];

    if (!email) {
      return NextResponse.json({ error: "Google account did not return an email." }, { status: 500 });
    }

    const user = findOrCreateOAuthUser(email, fullName);
    await setAuthSession(user.id);

    return NextResponse.redirect(`${req.nextUrl.origin}/account`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.json({
      error: "An error occurred during authentication",
      details: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
