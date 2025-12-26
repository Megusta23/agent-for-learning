import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// User Learning State
export const userLearningState = sqliteTable("user_learning_state", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  currentTopic: text("current_topic").notNull(),
  masteryLevel: real("mastery_level").notNull().default(0),
  lastActivity: integer("last_activity", { mode: "timestamp" }).notNull(),
  needsAttention: integer("needs_attention", { mode: "boolean" }).default(
    false,
  ),
  recentScores: text("recent_scores").notNull().default("[]"), // JSON array
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

// Lessons
export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  topic: text("topic").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  keyPoints: text("key_points").notNull(), // JSON array
  difficulty: integer("difficulty").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

// Quizzes
export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  topic: text("topic").notNull(),
  title: text("title").notNull(),
  questions: text("questions").notNull(), // JSON array
  difficulty: integer("difficulty").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
  score: real("score"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

// Agent Memory
export const agentMemory = sqliteTable("agent_memory", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  learningPatterns: text("learning_patterns").notNull(), // JSON
  historicalPerformance: text("historical_performance").notNull(), // JSON array
  lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull(),
});

// Agent Logs (za debugging)
export const agentLogs = sqliteTable("agent_logs", {
  id: text("id").primaryKey(),
  tickId: text("tick_id").notNull(),
  userId: text("user_id"),
  decision: text("decision").notNull(),
  success: integer("success", { mode: "boolean" }).notNull(),
  error: text("error"),
  timestamp: integer("timestamp", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});
