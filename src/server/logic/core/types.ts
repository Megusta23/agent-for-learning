// src/server/logic/core/types.ts
// =====================================================
// CORE DOMAIN TYPES - Ne zavise od infrastrukture
// =====================================================

/**
 * Agent Decision Types
 */
export type AgentDecision =
  | { type: "GENERATE_LESSON"; topic: string; difficulty: number }
  | {
      type: "GENERATE_QUIZ";
      topic: string;
      difficulty: number;
      questionCount: number;
    }
  | { type: "WAIT"; reason: string }
  | {
      type: "UPDATE_MASTERY";
      userId: string;
      topic: string;
      adjustment: number;
    };

/**
 * User Learning State
 */
export interface UserLearningState {
  userId: string;
  currentTopic: string;
  masteryLevel: number; // 0-100
  lastActivity: Date;
  recentScores: number[]; // Posljednjih 5 rezultata
  needsAttention: boolean;
}

/**
 * Quiz Result Analysis
 */
export interface QuizAnalysis {
  score: number;
  totalQuestions: number;
  weakTopics: string[];
  strengths: string[];
  recommendedAction: "review" | "advance" | "practice";
}

/**
 * Agent Memory (dugoročno pamćenje o korisniku)
 */
export interface AgentMemory {
  userId: string;
  learningPatterns: {
    bestTimeOfDay?: string;
    averageSessionLength?: number;
    preferredDifficulty?: number;
  };
  historicalPerformance: {
    topic: string;
    averageScore: number;
    attempts: number;
  }[];
  lastUpdated: Date;
}

/**
 * LLM Generation Request
 */
export interface LLMGenerationRequest {
  type: "lesson" | "quiz";
  topic: string;
  difficulty: number;
  context?: {
    previousErrors?: string[];
    userMasteryLevel?: number;
  };
}

/**
 * Generated Content (od LLM-a)
 */
export interface GeneratedLesson {
  title: string;
  content: string;
  keyPoints: string[];
  estimatedMinutes: number;
}

export interface GeneratedQuiz {
  title: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

/**
 * Generated Roadmap (from LLM)
 */
export interface RoadmapDay {
  dayNumber: number;
  topic: string;
  description: string;
  objectives: string[];
}

export interface GeneratedRoadmap {
  topic: string;
  totalDays: number;
  days: RoadmapDay[];
}

/**
 * Agent Tick Result
 */
export interface TickResult {
  processed: number;
  decisions: AgentDecision[];
  errors: string[];
  timestamp: Date;
}
