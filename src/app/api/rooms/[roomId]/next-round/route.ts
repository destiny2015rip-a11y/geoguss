import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, players, rounds } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getRandomLocation } from "@/lib/locations";
import { WIN_SCORE } from "@/lib/scoring";
import type { Region } from "@/lib/locations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await req.json();
    const { playerId } = body;

    const roomRows = await db.select().from(rooms).where(eq(rooms.id, roomId));
    if (roomRows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const room = roomRows[0];

    if (room.hostId !== playerId) {
      return NextResponse.json({ error: "Only host can advance" }, { status: 403 });
    }

    // Check if any player has reached WIN_SCORE
    const playerList = await db
      .select()
      .from(players)
      .where(and(eq(players.roomId, roomId), eq(players.isConnected, true)));

    const winner = playerList.find((p) => p.totalScore >= WIN_SCORE);

    if (winner) {
      await db
        .update(rooms)
        .set({
          status: "finished",
          winnerId: winner.id,
          updatedAt: new Date(),
        })
        .where(eq(rooms.id, roomId));

      return NextResponse.json({ finished: true, winnerId: winner.id });
    }

    // Start next round
    const nextRoundNumber = room.currentRound + 1;
    const location = getRandomLocation(room.region as Region, roomId);
    const roundId = randomUUID();

    await db.insert(rounds).values({
      id: roundId,
      roomId,
      roundNumber: nextRoundNumber,
      targetLat: location.lat,
      targetLng: location.lng,
      locationName: location.name,
      locationCountry: location.country,
      locationHint: location.hint ?? null,
      status: "active",
    });

    await db
      .update(rooms)
      .set({ currentRound: nextRoundNumber, updatedAt: new Date() })
      .where(eq(rooms.id, roomId));

    return NextResponse.json({
      success: true,
      roundNumber: nextRoundNumber,
      finished: false,
    });
  } catch (error) {
    console.error("Error next round:", error);
    return NextResponse.json({ error: "Failed to start next round" }, { status: 500 });
  }
}
