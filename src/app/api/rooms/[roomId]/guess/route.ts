import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, players, rounds, guesses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { haversineDistance, calculateScore } from "@/lib/scoring";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await req.json();
    const { playerId, lat, lng } = body;

    if (!playerId || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const roomRows = await db.select().from(rooms).where(eq(rooms.id, roomId));
    if (roomRows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const room = roomRows[0];

    if (room.status !== "playing") {
      return NextResponse.json({ error: "Game not in progress" }, { status: 400 });
    }

    // Get current round
    const roundRows = await db
      .select()
      .from(rounds)
      .where(
        and(
          eq(rounds.roomId, roomId),
          eq(rounds.roundNumber, room.currentRound)
        )
      );

    if (roundRows.length === 0) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const round = roundRows[0];

    if (round.status !== "active") {
      return NextResponse.json({ error: "Round already completed" }, { status: 400 });
    }

    // Check if player already guessed (anti-cheat)
    const existingGuess = await db
      .select()
      .from(guesses)
      .where(and(eq(guesses.roundId, round.id), eq(guesses.playerId, playerId)));

    if (existingGuess.length > 0) {
      return NextResponse.json({ error: "Already guessed this round" }, { status: 400 });
    }

    // Calculate distance and score
    const distance = haversineDistance(lat, lng, round.targetLat, round.targetLng);
    const score = calculateScore(distance);

    // Save guess
    await db.insert(guesses).values({
      id: uuidv4(),
      roundId: round.id,
      playerId,
      lat,
      lng,
      distance,
      score,
    });

    // Update player total score
    await db
      .update(players)
      .set({ totalScore: (await db.select().from(players).where(eq(players.id, playerId)))[0].totalScore + score })
      .where(eq(players.id, playerId));

    // Check if all connected players have guessed
    const connectedPlayers = await db
      .select()
      .from(players)
      .where(and(eq(players.roomId, roomId), eq(players.isConnected, true)));

    const allGuesses = await db
      .select()
      .from(guesses)
      .where(eq(guesses.roundId, round.id));

    const allGuessed = connectedPlayers.every((p) =>
      allGuesses.some((g) => g.playerId === p.id)
    );

    if (allGuessed) {
      // Mark round as completed
      await db
        .update(rounds)
        .set({ status: "completed", endedAt: new Date() })
        .where(eq(rounds.id, round.id));
    }

    return NextResponse.json({
      success: true,
      distance,
      score,
      allGuessed,
    });
  } catch (error) {
    console.error("Error submitting guess:", error);
    return NextResponse.json({ error: "Failed to submit guess" }, { status: 500 });
  }
}
