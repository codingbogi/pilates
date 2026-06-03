import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const email = "admin1110@studio.com";

    const rows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    return Response.json(rows[0] ?? null);
  } catch (e: any) {
    console.error("admin-test error:", e);
    return Response.json(
      { error: "admin-test failed", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}