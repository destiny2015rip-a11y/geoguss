import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import { db } from "../src/db/index";
import { rooms, players, gameRounds, guesses, locations } from "../src/db/schema";
import { eq, and } from "drizzle-orm";
import { calculateDistance, calculateScore } from "../src/lib/game-logic";
import { SOCKET_EVENTS } from "../src/lib/socket-events";
import { v4 as uuidv4 } from "uuid";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(async () => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on(SOCKET_EVENTS.ROOM_CREATE, async ({ nickname, settings }) => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      try {
        const [room] = await db.insert(rooms).values({
          code,
          settings: settings || { timer: 60, region: "all", allowMove: true, targetPoints: 10000 },
          hostId: socket.id,
          status: "lobby",
        }).returning();

        const [player] = await db.insert(players).values({
          id: socket.id,
          roomId: room.id,
          nickname,
          isReady: true,
        }).returning();

        socket.join(code);
        socket.emit(SOCKET_EVENTS.ROOM_CREATED, { code, roomId: room.id });
        io.to(code).emit(SOCKET_EVENTS.ROOM_PLAYER_JOINED, [player]);
      } catch (err) {
        socket.emit(SOCKET_EVENTS.ERROR, "Failed to create room");
      }
    });

    socket.on(SOCKET_EVENTS.ROOM_JOIN, async ({ code, nickname }) => {
      try {
        const room = await db.query.rooms.findFirst({ where: eq(rooms.code, code) });
        if (!room) return socket.emit(SOCKET_EVENTS.ERROR, "Room not found");
        if (room.status !== "lobby") return socket.emit(SOCKET_EVENTS.ERROR, "Game already in progress");

        const [player] = await db.insert(players).values({
          id: socket.id,
          roomId: room.id,
          nickname,
          isReady: false,
        }).returning();

        socket.join(code);
        const allPlayers = await db.query.players.findMany({ where: eq(players.roomId, room.id) });
        io.to(code).emit(SOCKET_EVENTS.ROOM_PLAYER_JOINED, allPlayers);
        socket.emit(SOCKET_EVENTS.ROOM_SETTINGS, room.settings);
      } catch (err) {
        socket.emit(SOCKET_EVENTS.ERROR, "Failed to join room");
      }
    });

    socket.on(SOCKET_EVENTS.ROOM_READY, async ({ ready }) => {
      const player = await db.query.players.findFirst({ where: eq(players.id, socket.id) });
      if (!player) return;

      await db.update(players).set({ isReady: ready }).where(eq(players.id, socket.id));
      const room = await db.query.rooms.findFirst({ where: eq(rooms.id, player.roomId!) });
      if (room) {
        const allPlayers = await db.query.players.findMany({ where: eq(players.roomId, room.id) });
        io.to(room.code).emit(SOCKET_EVENTS.ROOM_PLAYER_JOINED, allPlayers);
      }
    });

    socket.on(SOCKET_EVENTS.ROOM_START, async () => {
      const player = await db.query.players.findFirst({ where: eq(players.id, socket.id) });
      if (!player) return;
      const room = await db.query.rooms.findFirst({ where: eq(rooms.id, player.roomId!) });
      if (!room || room.hostId !== socket.id) return;

      await startNewRound(room.id, room.code, 1);
    });

    socket.on(SOCKET_EVENTS.GAME_SUBMIT_GUESS, async ({ lat, lng }) => {
      const player = await db.query.players.findFirst({ where: eq(players.id, socket.id) });
      if (!player || !player.roomId) return;
      const room = await db.query.rooms.findFirst({ where: eq(rooms.id, player.roomId) });
      if (!room || room.status !== "playing") return;

      const round = await db.query.gameRounds.findFirst({
        where: and(eq(gameRounds.roomId, room.id), eq(gameRounds.roundNumber, room.currentRound!)),
      });
      if (!round) return;

      const distance = calculateDistance(lat, lng, round.lat, round.lng);
      const points = calculateScore(distance);

      await db.insert(guesses).values({
        playerId: player.id,
        roundId: round.id,
        lat,
        lng,
        distance,
        points,
      });

      io.to(room.code).emit(SOCKET_EVENTS.GAME_PLAYER_GUESSED, { nickname: player.nickname });

      // Check if all players guessed
      const allPlayers = await db.query.players.findMany({ where: eq(players.roomId, room.id) });
      const allGuesses = await db.query.guesses.findMany({ where: eq(guesses.roundId, round.id) });

      if (allGuesses.length === allPlayers.length) {
        await endRound(room, round, allPlayers, allGuesses);
      }
    });

    socket.on("disconnect", async () => {
      const player = await db.query.players.findFirst({ where: eq(players.id, socket.id) });
      if (player) {
        const room = await db.query.rooms.findFirst({ where: eq(rooms.id, player.roomId!) });
        await db.delete(players).where(eq(players.id, socket.id));
        if (room) {
          const remainingPlayers = await db.query.players.findMany({ where: eq(players.roomId, room.id) });
          if (remainingPlayers.length === 0) {
            await db.delete(rooms).where(eq(rooms.id, room.id));
          } else {
            if (room.hostId === socket.id) {
              await db.update(rooms).set({ hostId: remainingPlayers[0].id }).where(eq(rooms.id, room.id));
            }
            io.to(room.code).emit(SOCKET_EVENTS.ROOM_PLAYER_JOINED, remainingPlayers);
          }
        }
      }
    });
  });

  async function startNewRound(roomId: number, roomCode: string, roundNumber: number) {
    const allLocations = await db.query.locations.findMany();
    const randomLoc = allLocations[Math.floor(Math.random() * allLocations.length)];

    await db.update(rooms).set({ status: "playing", currentRound: roundNumber }).where(eq(rooms.id, roomId));
    const [round] = await db.insert(gameRounds).values({
      roomId,
      roundNumber,
      lat: randomLoc.lat,
      lng: randomLoc.lng,
      panoId: randomLoc.panoId,
    }).returning();

    io.to(roomCode).emit(SOCKET_EVENTS.GAME_ROUND_START, {
      roundNumber,
      lat: randomLoc.lat, // In a real app, hide this and use panoId
      lng: randomLoc.lng,
      panoId: randomLoc.panoId,
    });
  }

  async function endRound(room: any, round: any, allPlayers: any[], allGuesses: any[]) {
    // Update player scores
    const roundResults = [];
    for (const player of allPlayers) {
      const guess = allGuesses.find(g => g.playerId === player.id);
      const points = guess ? guess.points : 0;
      const distance = guess ? guess.distance : 0;
      
      const newScore = player.score + points;
      const newDistance = player.totalDistance + distance;
      
      await db.update(players).set({ 
        score: newScore, 
        totalDistance: newDistance 
      }).where(eq(players.id, player.id));
      
      roundResults.push({
        id: player.id,
        nickname: player.nickname,
        guess: guess ? { lat: guess.lat, lng: guess.lng } : null,
        distance,
        points,
        totalScore: newScore
      });
    }

    const updatedPlayers = await db.query.players.findMany({ where: eq(players.roomId, room.id) });
    
    io.to(room.code).emit(SOCKET_EVENTS.GAME_ROUND_END, {
      results: roundResults,
      realLocation: { lat: round.lat, lng: round.lng },
      players: updatedPlayers
    });

    // Check for match end
    const winner = updatedPlayers.find((p: any) => p.score >= room.settings.targetPoints);
    if (winner) {
      await db.update(rooms).set({ status: "finished" }).where(eq(rooms.id, room.id));
      io.to(room.code).emit(SOCKET_EVENTS.GAME_MATCH_END, {
        ranking: updatedPlayers.sort((a: any, b: any) => b.score - a.score || a.totalDistance - b.totalDistance)
      });
    }
  }

  server.use((req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
