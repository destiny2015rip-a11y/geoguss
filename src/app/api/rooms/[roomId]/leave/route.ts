import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await params;
    const body = await req.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json({ error: "Player ID required" }, { status: 400 });
    }

    await db
      .update(players)
      .set({ isConnected: false })
      .where(eq(players.id, playerId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving room:", error);
    return NextResponse.json({ error: "Failed to leave" }, { status: 500 });
  }
}
