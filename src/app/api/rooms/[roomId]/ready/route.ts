import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await params; // consume params
    const body = await req.json();
    const { playerId, isReady } = body;

    if (!playerId) {
      return NextResponse.json({ error: "Player ID required" }, { status: 400 });
    }

    await db
      .update(players)
      .set({ isReady: isReady ?? true })
      .where(eq(players.id, playerId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating ready:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
