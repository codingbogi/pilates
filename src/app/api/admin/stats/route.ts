import { db } from "@/db";
import { profiles, reservations } from "@/db/schema";
import { eq, and, gte, lte, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Get end of week (Sunday)
  const dayOfWeek = today.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + daysUntilSunday);
  const endOfWeekStr = endOfWeek.toISOString().split("T")[0];

  const [clientCount] = await db
    .select({ value: count() })
    .from(profiles)
    .where(eq(profiles.role, "client"));

  const [todayReservations] = await db
    .select({ value: count() })
    .from(reservations)
    .where(and(eq(reservations.date, todayStr), eq(reservations.status, "active")));

  const [weekReservations] = await db
    .select({ value: count() })
    .from(reservations)
    .where(
      and(
        gte(reservations.date, todayStr),
        lte(reservations.date, endOfWeekStr),
        eq(reservations.status, "active")
      )
    );

  return Response.json({
    totalClients: clientCount.value,
    todayReservations: todayReservations.value,
    weekReservations: weekReservations.value,
  });
}
