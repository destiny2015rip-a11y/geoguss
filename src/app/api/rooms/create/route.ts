import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, players } from "@/db/schema";
import { customAlphabet } from "nanoid";
import { randomUUID } from "crypto";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerName, isPrivate, maxPlayers, timeLimit, region } = body;

    if (!playerName || typeof playerName !== "string" || playerName.trim().length < 1) {
      return NextResponse.json({ error: "Player name is required" }, { status: 400 });
    }

    const roomId = randomUUID();
    const playerId = randomUUID();
    const code = generateCode();

    // Use a transaction to ensure both room and player are created
    return await db.transaction(async (tx) => {
      await tx.insert(rooms).values({
        id: roomId,
        code: code.toUpperCase(),
        hostId: playerId,
        status: "waiting",
        isPrivate: Boolean(isPrivate),
        maxPlayers: Number(maxPlayers) || 8,
        timeLimit: timeLimit ? Number(timeLimit) : null,
        region: String(region || "world"),
        currentRound: 0,
      });

      await tx.insert(players).values({
        id: playerId,
        roomId: roomId,
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
    });
  } catch (error) {
    console.error("Error creating room:", error);
    // Extract a cleaner error message if possible
    let errorMessage = "Failed to create room";
    if (error instanceof Error) {
      errorMessage = error.message;
      // If it's a Drizzle/PG error, it might have a "detail" field
      if ("detail" in error && error.detail) {
        errorMessage = `${errorMessage}: ${error.detail}`;
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
