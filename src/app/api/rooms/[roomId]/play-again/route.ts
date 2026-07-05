import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, players, rounds } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getRandomLocation, clearRoomLocations } from "@/lib/locations";
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
      return NextResponse.json({ error: "Only host can restart" }, { status: 403 });
    }

    // Reset all connected players' scores
    const connectedPlayers = await db
      .select()
      .from(players)
      .where(and(eq(players.roomId, roomId), eq(players.isConnected, true)));

    for (const p of connectedPlayers) {
      await db
        .update(players)
        .set({ totalScore: 0, isReady: false })
        .where(eq(players.id, p.id));
    }

    // Clear used locations
    clearRoomLocations(roomId);

    // Generate first round
    const location = getRandomLocation(room.region as Region, roomId);
    const roundId = uuidv4();

    await db.insert(rounds).values({
      id: roundId,
      roomId,
      roundNumber: 1,
      targetLat: location.lat,
      targetLng: location.lng,
      locationName: location.name,
      locationCountry: location.country,
      locationHint: location.hint ?? null,
      status: "active",
    });

    await db
      .update(rooms)
      .set({
        status: "playing",
        currentRound: 1,
        winnerId: null,
        updatedAt: new Date(),
      })
      .where(eq(rooms.id, roomId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error restarting game:", error);
    return NextResponse.json({ error: "Failed to restart" }, { status: 500 });
  }
}
