import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const email = "admin111@studio.com";

  try {
    const rows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    return Response.json(rows[0] ?? null);
  } catch (err: any) {
    console.error("admin-test error:", err);

    const pg = err?.cause ?? err;

    return Response.json(
      {
        error: "admin-test failed",
        message: err?.message ?? String(err),
        code: pg?.code,
        detail: pg?.detail,
        hint: pg?.hint,
      },
      { status: 500 }
    );
  }
}