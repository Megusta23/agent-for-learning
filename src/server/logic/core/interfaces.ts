// src/server/logic/core/interfaces.ts
// =====================================================
// CORE INTERFACES - Contracts između layera
// =====================================================

import type {
  UserLearningState,
  QuizAnalysis,
  AgentMemory,
  LLMGenerationRequest,
  GeneratedLesson,
  GeneratedQuiz,
  AgentDecision,
} from "./types";

/**
 * Repository Pattern - Abstrakcija pristupa podacima
 * Omogućava da business logika ne ovisi o Drizzle implementaciji
 */
export interface IUserStateRepository {
  findUsersNeedingAttention(): Promise<UserLearningState[]>;
  getUserState(userId: string): Promise<UserLearningState | null>;
  updateMasteryLevel(
    userId: string,
    topic: string,
    newLevel: number,
  ): Promise<void>;
  recordActivity(userId: string, activityType: string): Promise<void>;
}

export interface IQuizRepository {
  getRecentQuizResults(userId: string, limit: number): Promise<QuizAnalysis[]>;
  saveQuiz(quiz: GeneratedQuiz, userId: string, topic: string): Promise<string>;
  markQuizAsProcessed(quizId: string): Promise<void>;
}

export interface ILessonRepository {
  saveLesson(
    lesson: GeneratedLesson,
    userId: string,
    topic: string,
  ): Promise<string>;
  getLessonHistory(userId: string, topic: string): Promise<string[]>;
}

export interface IAgentMemoryRepository {
  getMemory(userId: string): Promise<AgentMemory | null>;
  updateMemory(memory: AgentMemory): Promise<void>;
}

/**
 * LLM Service - Abstrakcija generisanja sadržaja
 * Može se zamijeniti različitim providerima (Groq, Together AI, etc.)
 */
export interface ILLMService {
  generateLesson(request: LLMGenerationRequest): Promise<GeneratedLesson>;
  generateQuiz(request: LLMGenerationRequest): Promise<GeneratedQuiz>;
  analyzeErrors(errors: string[], topic: string): Promise<string[]>; // Vraća preporuke
}

/**
 * Decision Engine - Srce agenta (Think faza)
 */
export interface IDecisionEngine {
  /**
   * Analizira stanje korisnika i vraća odluku šta raditi dalje
   */
  decide(state: UserLearningState, memory: AgentMemory): Promise<AgentDecision>;

  /**
   * Analizira rezultate kviza i određuje sljedeći korak
   */
  analyzeQuizResults(
    analysis: QuizAnalysis,
    state: UserLearningState,
  ): Promise<AgentDecision>;
}

/**
 * Agent Orchestrator - Koordinira cijeli Sense-Think-Act-Learn ciklus
 */
export interface IAgentOrchestrator {
  /**
   * Izvršava jedan "tick" agenta
   * Vraća broj obrađenih korisnika i listu odluka
   */
  step(): Promise<{
    processed: number;
    decisions: AgentDecision[];
    errors: string[];
  }>;
}
