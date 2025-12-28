// src/server/db/schema.ts
// =====================================================
// COMPLETE DRIZZLE SCHEMA FOR EDUAGENT
// =====================================================

import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";

// ============================================
// USER LEARNING STATE TABLE
// Tracks current learning state for each user
// ============================================
export const userLearningState = sqliteTable(
  "user_learning_state",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    currentTopic: text("current_topic").notNull(),
    masteryLevel: real("mastery_level").notNull().default(0), // 0-100
    lastActivity: integer("last_activity", { mode: "timestamp" }).notNull(),
    needsAttention: integer("needs_attention", { mode: "boolean" })
      .notNull()
      .default(false),
    recentScores: text("recent_scores").notNull().default("[]"), // JSON array of numbers
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index("user_learning_state_user_id_idx").on(table.userId),
  }),
);

// ============================================
// ROADMAPS TABLE
// High-level plan for a user
// ============================================
export const roadmaps = sqliteTable(
  "roadmaps",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    topic: text("topic").notNull(),
    status: text("status", { enum: ["active", "completed", "archived"] })
      .notNull()
      .default("active"),
    totalDays: integer("total_days").notNull(),
    dailyMinutes: integer("daily_minutes").notNull(),
    currentDay: integer("current_day").notNull().default(1),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index("roadmaps_user_id_idx").on(table.userId),
    statusIdx: index("roadmaps_status_idx").on(table.status),
  }),
);

// ============================================
// DAYS TABLE
// Specific day within a roadmap
// ============================================
export const days = sqliteTable(
  "days",
  {
    id: text("id").primaryKey(),
    roadmapId: text("roadmap_id").notNull(),
    dayNumber: integer("day_number").notNull(),
    topic: text("topic").notNull(),
    description: text("description"), // Brief overview of the day
    status: text("status", { enum: ["locked", "available", "completed"] })
      .notNull()
      .default("locked"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    roadmapIdx: index("days_roadmap_id_idx").on(table.roadmapId),
    statusIdx: index("days_status_idx").on(table.status),
  }),
);

// ============================================
// FLASHCARDS TABLE
// Flashcards for specific days/topics
// ============================================
export const flashcards = sqliteTable(
  "flashcards",
  {
    id: text("id").primaryKey(),
    dayId: text("day_id"), // Optional: can be linked to a specific day
    userId: text("user_id").notNull(),
    front: text("front").notNull(),
    back: text("back").notNull(),
    tags: text("tags"), // JSON array of strings
    masteryLevel: integer("mastery_level").notNull().default(0), // 0-5 (Leitner system)
    nextReviewAt: integer("next_review_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index("flashcards_user_id_idx").on(table.userId),
    dayIdIdx: index("flashcards_day_id_idx").on(table.dayId),
    nextReviewIdx: index("flashcards_next_review_idx").on(table.nextReviewAt),
  }),
);

// ============================================
// LESSONS TABLE
// Stores AI-generated lessons
// ============================================
export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    dayId: text("day_id"), // Link to specific day in roadmap
    topic: text("topic").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(), // Markdown content
    keyPoints: text("key_points").notNull(), // JSON array of strings
    difficulty: integer("difficulty").notNull(), // 1-4
    estimatedMinutes: integer("estimated_minutes").notNull(),
    order: integer("order").notNull().default(1), // Order within the day
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index("lessons_user_id_idx").on(table.userId),
    topicIdx: index("lessons_topic_idx").on(table.topic),
    completedIdx: index("lessons_completed_idx").on(table.completed),
  }),
);

// ============================================
// QUIZZES TABLE
// Stores AI-generated quizzes
// ============================================
export const quizzes = sqliteTable(
  "quizzes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    dayId: text("day_id"), // Link to specific day in roadmap
    topic: text("topic").notNull(),
    title: text("title").notNull(),
    questions: text("questions").notNull(), // JSON array of question objects
    difficulty: integer("difficulty").notNull(), // 1-4
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),
    score: real("score"), // Number of correct answers
    totalQuestions: integer("total_questions").notNull().default(0),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index("quizzes_user_id_idx").on(table.userId),
    topicIdx: index("quizzes_topic_idx").on(table.topic),
    completedIdx: index("quizzes_completed_idx").on(table.completed),
  }),
);

// ============================================
// AGENT MEMORY TABLE
// Long-term memory about user learning patterns
// ============================================
export const agentMemory = sqliteTable(
  "agent_memory",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    learningPatterns: text("learning_patterns").notNull(), // JSON object
    historicalPerformance: text("historical_performance").notNull(), // JSON array
    lastUpdated: integer("last_updated", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index("agent_memory_user_id_idx").on(table.userId),
  }),
);

// ============================================
// AGENT LOGS TABLE
// Tracks agent decisions for debugging and analytics
// ============================================
export const agentLogs = sqliteTable(
  "agent_logs",
  {
    id: text("id").primaryKey(),
    tickId: text("tick_id").notNull(), // Groups logs from same tick
    userId: text("user_id"), // Nullable - some logs are system-wide
    decisionType: text("decision_type").notNull(), // GENERATE_LESSON, GENERATE_QUIZ, etc.
    decisionData: text("decision_data").notNull(), // JSON with decision details
    success: integer("success", { mode: "boolean" }).notNull(),
    error: text("error"), // Error message if failed
    executionTimeMs: integer("execution_time_ms"), // How long it took
    timestamp: integer("timestamp", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    tickIdIdx: index("agent_logs_tick_id_idx").on(table.tickId),
    userIdIdx: index("agent_logs_user_id_idx").on(table.userId),
    timestampIdx: index("agent_logs_timestamp_idx").on(table.timestamp),
  }),
);

// ============================================
// QUIZ SUBMISSIONS TABLE (Optional - for detailed tracking)
// Tracks individual quiz answers
// ============================================
export const quizSubmissions = sqliteTable(
  "quiz_submissions",
  {
    id: text("id").primaryKey(),
    quizId: text("quiz_id").notNull(),
    userId: text("user_id").notNull(),
    questionId: text("question_id").notNull(),
    userAnswer: integer("user_answer").notNull(), // Index of selected answer
    correctAnswer: integer("correct_answer").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
    timeSpentSeconds: integer("time_spent_seconds"),
    submittedAt: integer("submitted_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    quizIdIdx: index("quiz_submissions_quiz_id_idx").on(table.quizId),
    userIdIdx: index("quiz_submissions_user_id_idx").on(table.userId),
  }),
);

// ============================================
// TYPES FOR TYPE SAFETY
// ============================================

export type UserLearningState = typeof userLearningState.$inferSelect;
export type InsertUserLearningState = typeof userLearningState.$inferInsert;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

export type AgentMemory = typeof agentMemory.$inferSelect;
export type InsertAgentMemory = typeof agentMemory.$inferInsert;

export type AgentLog = typeof agentLogs.$inferSelect;
export type InsertAgentLog = typeof agentLogs.$inferInsert;

export type QuizSubmission = typeof quizSubmissions.$inferSelect;
export type InsertQuizSubmission = typeof quizSubmissions.$inferInsert;

export type Roadmap = typeof roadmaps.$inferSelect;
export type InsertRoadmap = typeof roadmaps.$inferInsert;

export type Day = typeof days.$inferSelect;
export type InsertDay = typeof days.$inferInsert;

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = typeof flashcards.$inferInsert;
