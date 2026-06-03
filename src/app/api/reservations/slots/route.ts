import { db } from "@/db";
import { reservations, blockedSlots, profiles } from "@/db/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { TIME_SLOTS, TRAINING_CAPACITY, type TrainingType } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  if (!date) {
    return Response.json({ error: "Date is required" }, { status: 400 });
  }

  // Get user profile for training type
  const [user] = await db.select().from(profiles).where(eq(profiles.id, session.userId)).limit(1);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const trainingType = user.trainingType as TrainingType;
  const capacity = TRAINING_CAPACITY[trainingType];

  // Get blocked slots for this date
  const blocked = await db
    .select()
    .from(blockedSlots)
    .where(
      and(
        eq(blockedSlots.date, date),
        or(isNull(blockedSlots.timeSlot), eq(blockedSlots.timeSlot, blockedSlots.timeSlot))
      )
    );

  const wholeDayBlocked = blocked.some((b) => b.timeSlot === null);
  const blockedTimeSlots = new Set(blocked.map((b) => b.timeSlot).filter(Boolean));

  // Get active reservations for this date and training type
  const activeRes = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.date, date),
        eq(reservations.trainingType, trainingType),
        eq(reservations.status, "active")
      )
    );

  // Check if user already has a booking for this date
  const userBooking = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.userId, session.userId),
        eq(reservations.date, date),
        eq(reservations.status, "active")
      )
    )
    .limit(1);

  const hasBookingForDay = userBooking.length > 0;

  // Build slot availability
  const slots = TIME_SLOTS.map((slot) => {
    const isBlocked = wholeDayBlocked || blockedTimeSlots.has(slot);
    const booked = activeRes.filter((r) => r.timeSlot === slot).length;
    const available = Math.max(0, capacity - booked);

    return {
      time: slot,
      available,
      capacity,
      isBlocked,
      isFull: available === 0,
    };
  });

  return Response.json({
    slots,
    hasBookingForDay,
    remainingSessions: user.remainingSessions,
    trainingType,
  });
}
