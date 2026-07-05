import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  jsonb,
} from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  hostId: text("host_id").notNull(),
  status: text("status").notNull().default("waiting"), // waiting | playing | finished
  isPrivate: boolean("is_private").notNull().default(true),
  maxPlayers: integer("max_players").notNull().default(8),
  timeLimit: integer("time_limit"), // seconds, null = no limit
  region: text("region").notNull().default("world"),
  currentRound: integer("current_round").notNull().default(0),
  winnerId: text("winner_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull(),
  name: text("name").notNull(),
  totalScore: integer("total_score").notNull().default(0),
  isReady: boolean("is_ready").notNull().default(false),
  isConnected: boolean("is_connected").notNull().default(true),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const rounds = pgTable("rounds", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull(),
  roundNumber: integer("round_number").notNull(),
  targetLat: doublePrecision("target_lat").notNull(),
  targetLng: doublePrecision("target_lng").notNull(),
  locationName: text("location_name").notNull(),
  locationCountry: text("location_country").notNull(),
  locationHint: text("location_hint"),
  status: text("status").notNull().default("active"), // active | completed
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const guesses = pgTable("guesses", {
  id: text("id").primaryKey(),
  roundId: text("round_id").notNull(),
  playerId: text("player_id").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  distance: doublePrecision("distance").notNull(),
  score: integer("score").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});
