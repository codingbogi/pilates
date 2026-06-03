import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check if admin already exists
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, "admin111@studio.com"))
      .limit(1);

    if (existing.length > 0) {
      return Response.json({ message: "Admin already exists" });
    }

    const passwordHash = await bcrypt.hash("adminpilates", 10);
    await db.insert(profiles).values({
      fullName: "Administrator",
      email: "admin111@studio.com",
      passwordHash,
      trainingType: "group",
      remainingSessions: 0,
      role: "admin",
    });

    return Response.json({ message: "Admin user created successfully" });
  } catch (e) {
    console.error("Seed error:", e);
    return Response.json({ error: "Seed failed" }, { status: 500 });
  }
}
