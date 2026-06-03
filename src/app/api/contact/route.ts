import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();
    if (!name || !email || !phone || !message) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }
    await db.insert(contactMessages).values({ name, email, phone, message });
    return Response.json({ success: true });
  } catch (e) {
    console.error("Contact error:", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const messages = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  return Response.json({ messages });
}
