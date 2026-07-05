import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, players } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, playerName } = body;

    if (!code || !playerName) {
      return NextResponse.json({ error: "Code and player name required" }, { status: 400 });
    }

    const roomRows = await db.select().from(rooms).where(eq(rooms.code, code.toUpperCase()));
    if (roomRows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const room = roomRows[0];

    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Game already in progress" }, { status: 400 });
    }

    const existingPlayers = await db
      .select()
      .from(players)
      .where(and(eq(players.roomId, room.id), eq(players.isConnected, true)));

    if (existingPlayers.length >= room.maxPlayers) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    const playerId = uuidv4();

    await db.insert(players).values({
      id: playerId,
      roomId: room.id,
      name: playerName.trim().slice(0, 20),
      totalScore: 0,
      isReady: false,
      isConnected: true,
    });

    return NextResponse.json({
      roomId: room.id,
      roomCode: room.code,
      playerId,
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
