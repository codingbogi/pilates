import { db } from "@/db";
import { reservations, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reservationId } = await req.json();
    if (!reservationId) {
      return Response.json({ error: "Reservation ID is required" }, { status: 400 });
    }

    // Get the reservation
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .limit(1);

    if (!reservation) {
      return Response.json({ error: "Reservation not found" }, { status: 404 });
    }

    // If client, verify ownership and 12-hour rule
    if (session.role === "client") {
      if (reservation.userId !== session.userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const slotDate = new Date(`${reservation.date}T${reservation.timeSlot}:00`);
      const now = new Date();
      const diffMs = slotDate.getTime() - now.getTime();
      if (diffMs < 12 * 60 * 60 * 1000) {
        return Response.json({ error: "Cannot cancel less than 12 hours before" }, { status: 400 });
      }
    }

    // Cancel the reservation
    await db
      .update(reservations)
      .set({ status: "cancelled" })
      .where(eq(reservations.id, reservationId));

    // Restore remaining session if it was active
    if (reservation.status === "active") {
      const [user] = await db.select().from(profiles).where(eq(profiles.id, reservation.userId)).limit(1);
      if (user) {
        await db
          .update(profiles)
          .set({ remainingSessions: user.remainingSessions + 1 })
          .where(eq(profiles.id, reservation.userId));
      }
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error("Cancel reservation error:", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
