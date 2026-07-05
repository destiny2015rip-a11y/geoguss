import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, players } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { customAlphabet } from "nanoid";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerName, isPrivate, maxPlayers, timeLimit, region } = body;

    if (!playerName || typeof playerName !== "string" || playerName.trim().length < 1) {
      return NextResponse.json({ error: "Player name is required" }, { status: 400 });
    }

    const roomId = uuidv4();
    const playerId = uuidv4();
    const code = generateCode();

    await db.insert(rooms).values({
      id: roomId,
      code,
      hostId: playerId,
      status: "waiting",
      isPrivate: isPrivate ?? true,
      maxPlayers: maxPlayers ?? 8,
      timeLimit: timeLimit ?? null,
      region: region ?? "world",
      currentRound: 0,
    });

    await db.insert(players).values({
      id: playerId,
      roomId,
      name: playerName.trim().slice(0, 20),
      totalScore: 0,
      isReady: false,
      isConnected: true,
    });

    return NextResponse.json({
      roomId,
      roomCode: code,
      playerId,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
