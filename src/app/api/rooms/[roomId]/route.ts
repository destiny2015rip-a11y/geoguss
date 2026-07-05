import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, players, rounds, guesses } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

type GuessRow = {
  id: string;
  roundId: string;
  playerId: string;
  lat: number;
  lng: number;
  distance: number;
  score: number;
  submittedAt: Date;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const playerId = req.nextUrl.searchParams.get("playerId");

    const roomRows = await db.select().from(rooms).where(eq(rooms.id, roomId));
    if (roomRows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const room = roomRows[0];

    // Update player last seen
    if (playerId) {
      await db
        .update(players)
        .set({ lastSeen: new Date(), isConnected: true })
        .where(eq(players.id, playerId));
    }

    const playerList = await db
      .select()
      .from(players)
      .where(eq(players.roomId, roomId));

    // Get current round if playing
    let currentRound: (typeof roundRows)[number] | null = null;
    let roundGuesses: GuessRow[] = [];

    const roundRows = await db
      .select()
      .from(rounds)
      .where(and(eq(rounds.roomId, roomId)));

    if (room.status === "playing" && room.currentRound > 0) {
      const activeRound = roundRows.find(
        (r) => r.roundNumber === room.currentRound
      );

      if (activeRound) {
        currentRound = activeRound;

        const guessRows = await db
          .select()
          .from(guesses)
          .where(eq(guesses.roundId, activeRound.id));
        roundGuesses = guessRows;
      }
    }

    const connectedPlayers = playerList.filter((p) => p.isConnected);

    // Determine if current player has already guessed
    const hasGuessed = playerId && currentRound
      ? roundGuesses.some((g: GuessRow) => g.playerId === playerId)
      : false;

    // Check if all connected players have guessed
    const allGuessed = currentRound
      ? connectedPlayers.every((p) =>
          roundGuesses.some((g: GuessRow) => g.playerId === p.id)
        )
      : false;

    return NextResponse.json({
      room: {
        id: room.id,
        code: room.code,
        hostId: room.hostId,
        status: room.status,
        isPrivate: room.isPrivate,
        maxPlayers: room.maxPlayers,
        timeLimit: room.timeLimit,
        region: room.region,
        currentRound: room.currentRound,
        winnerId: room.winnerId,
      },
      players: playerList.map((p) => ({
        id: p.id,
        name: p.name,
        totalScore: p.totalScore,
        isReady: p.isReady,
        isConnected: p.isConnected,
      })),
      currentRound: currentRound
        ? {
            id: currentRound.id,
            roundNumber: currentRound.roundNumber,
            status: currentRound.status,
            startedAt: currentRound.startedAt,
            // Only reveal target if round is completed or all guessed
            ...(currentRound.status === "completed" || allGuessed
              ? {
                  targetLat: currentRound.targetLat,
                  targetLng: currentRound.targetLng,
                  locationName: currentRound.locationName,
                  locationCountry: currentRound.locationCountry,
                  locationHint: currentRound.locationHint,
                }
              : {}),
          }
        : null,
      guesses: currentRound?.status === "completed" || allGuessed
        ? roundGuesses.map((g: GuessRow) => ({
            playerId: g.playerId,
            lat: g.lat,
            lng: g.lng,
            distance: g.distance,
            score: g.score,
          }))
        : roundGuesses.map((g: GuessRow) => ({
            playerId: g.playerId,
            submitted: true,
          })),
      hasGuessed,
      allGuessed,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}
