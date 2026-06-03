import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
      trainingType: profiles.trainingType,
      remainingSessions: profiles.remainingSessions,
      role: profiles.role,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.role, "client"));

  return Response.json({ clients });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fullName, email, password, trainingType } = await req.json();
    if (!fullName || !email || !password || !trainingType) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if email exists
    const existing = await db.select().from(profiles).where(eq(profiles.email, email.toLowerCase().trim())).limit(1);
    if (existing.length > 0) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [newClient] = await db.insert(profiles).values({
      fullName,
      email: email.toLowerCase().trim(),
      passwordHash,
      trainingType,
      role: "client",
      remainingSessions: 0,
    }).returning();

    return Response.json({ success: true, client: { ...newClient, passwordHash: undefined } });
  } catch (e) {
    console.error("Create client error:", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, trainingType, remainingSessions, newPassword } = await req.json();
    if (!id) {
      return Response.json({ error: "Client ID is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (trainingType !== undefined) updates.trainingType = trainingType;
    if (remainingSessions !== undefined) updates.remainingSessions = remainingSessions;
    if (newPassword) {
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No updates provided" }, { status: 400 });
    }

    await db.update(profiles).set(updates).where(and(eq(profiles.id, id), ne(profiles.role, "admin")));

    return Response.json({ success: true });
  } catch (e) {
    console.error("Update client error:", e);
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
      return Response.json({ error: "Client ID is required" }, { status: 400 });
    }

    await db.delete(profiles).where(and(eq(profiles.id, id), ne(profiles.role, "admin")));
    return Response.json({ success: true });
  } catch (e) {
    console.error("Delete client error:", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
