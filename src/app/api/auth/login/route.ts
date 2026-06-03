import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return Response.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const [user] = await db.select().from(profiles).where(eq(profiles.email, email.toLowerCase().trim())).limit(1);
    if (!user) {
      return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as "admin" | "client",
    });

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return Response.json({
      success: true,
      user: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    return Response.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
