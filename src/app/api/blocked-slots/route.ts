import { db } from "@/db";
import { blockedSlots } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slots = await db.select().from(blockedSlots).orderBy(desc(blockedSlots.date));
  return Response.json({ blockedSlots: slots });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { date, timeSlot } = await req.json();
    if (!date) {
      return Response.json({ error: "Date is required" }, { status: 400 });
    }

    await db.insert(blockedSlots).values({
      date,
      timeSlot: timeSlot || null,
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error("Block slot error:", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "Slot ID is required" }, { status: 400 });
    }

    await db.delete(blockedSlots).where(eq(blockedSlots.id, id));
    return Response.json({ success: true });
  } catch (e) {
    console.error("Unblock slot error:", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
