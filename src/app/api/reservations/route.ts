import { db } from "@/db";
import { reservations, profiles, blockedSlots } from "@/db/schema";
import { eq, and, gte, lte, desc, isNull, or } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { TRAINING_CAPACITY, type TrainingType } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dateFilter = url.searchParams.get("date");

  if (session.role === "admin") {
    // Admin sees all reservations, join with profile for client name
    let query = db
      .select({
        id: reservations.id,
        userId: reservations.userId,
        date: reservations.date,
        timeSlot: reservations.timeSlot,
        trainingType: reservations.trainingType,
        status: reservations.status,
        createdAt: reservations.createdAt,
        clientName: profiles.fullName,
        clientEmail: profiles.email,
      })
      .from(reservations)
      .leftJoin(profiles, eq(reservations.userId, profiles.id))
      .orderBy(desc(reservations.date))
      .$dynamic();

    if (dateFilter) {
      query = query.where(eq(reservations.date, dateFilter));
    }

    const result = await query;
    return Response.json({ reservations: result });
  } else {
    // Client sees only their reservations
    const today = new Date().toISOString().split("T")[0];
    const result = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.userId, session.userId),
          eq(reservations.status, "active"),
          gte(reservations.date, today)
        )
      )
      .orderBy(reservations.date);

    return Response.json({ reservations: result });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "client") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { date, timeSlot } = await req.json();
    if (!date || !timeSlot) {
      return Response.json({ error: "Date and time slot are required" }, { status: 400 });
    }

    // Check if Sunday
    const dayOfWeek = new Date(date + "T00:00:00").getDay();
    if (dayOfWeek === 0) {
      return Response.json({ error: "Sunday is closed" }, { status: 400 });
    }

    // Get user profile
    const [user] = await db.select().from(profiles).where(eq(profiles.id, session.userId)).limit(1);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check remaining sessions
    if (user.remainingSessions <= 0) {
      return Response.json({ error: "No remaining sessions" }, { status: 400 });
    }

    // Check if already booked for this day
    const existingBooking = await db
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

    if (existingBooking.length > 0) {
      return Response.json({ error: "Already booked for this day" }, { status: 400 });
    }

    // Check if slot is blocked
    const blocked = await db
      .select()
      .from(blockedSlots)
      .where(
        and(
          eq(blockedSlots.date, date),
          or(
            eq(blockedSlots.timeSlot, timeSlot),
            isNull(blockedSlots.timeSlot)
          )
        )
      )
      .limit(1);

    if (blocked.length > 0) {
      return Response.json({ error: "Slot is blocked" }, { status: 400 });
    }

    // Check capacity for this training type
    const trainingType = user.trainingType as TrainingType;
    const capacity = TRAINING_CAPACITY[trainingType];

    const activeReservations = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.date, date),
          eq(reservations.timeSlot, timeSlot),
          eq(reservations.trainingType, trainingType),
          eq(reservations.status, "active")
        )
      );

    if (activeReservations.length >= capacity) {
      return Response.json({ error: "Slot is full" }, { status: 400 });
    }

    // Create reservation and decrement remaining sessions
    await db.insert(reservations).values({
      userId: session.userId,
      date,
      timeSlot,
      trainingType,
      status: "active",
    });

    await db
      .update(profiles)
      .set({ remainingSessions: user.remainingSessions - 1 })
      .where(eq(profiles.id, session.userId));

    return Response.json({ success: true });
  } catch (e) {
    console.error("Create reservation error:", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
