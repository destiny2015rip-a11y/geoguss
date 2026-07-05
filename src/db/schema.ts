import { pgTable, serial, text, timestamp, integer, boolean, doublePrecision, jsonb } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  settings: jsonb("settings").$type<{
    timer: number;
    region: string;
    allowMove: boolean;
    targetPoints: number;
  }>().notNull(),
  hostId: text("host_id"),
  status: text("status").notNull().default("lobby"), // lobby, playing, finished
  currentRound: integer("current_round").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const players = pgTable("players", {
  id: text("id").primaryKey(), // socket.id or uuid
  roomId: integer("room_id").references(() => rooms.id),
  nickname: text("nickname").notNull(),
  score: integer("score").default(0).notNull(),
  totalDistance: doublePrecision("total_distance").default(0).notNull(),
  isReady: boolean("is_ready").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const gameRounds = pgTable("game_rounds", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id),
  roundNumber: integer("round_number").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  panoId: text("pano_id"),
  startTime: timestamp("start_time").defaultNow().notNull(),
});

export const guesses = pgTable("guesses", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").references(() => players.id),
  roundId: integer("round_id").references(() => gameRounds.id),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  distance: doublePrecision("distance").notNull(),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  panoId: text("pano_id"),
  name: text("name"),
  region: text("region"),
});
