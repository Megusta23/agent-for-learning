// src/server/logic/services/decision-engine.ts
// =====================================================
// DECISION ENGINE - Mozak agenta (THINK faza)
// =====================================================

import type { IDecisionEngine } from "../core/interfaces";

import type {
  UserLearningState,
  AgentMemory,
  AgentDecision,
  QuizAnalysis,
} from "../core/types";

/**
 * Konfiguracija pragova za donošenje odluka
 * Može se kasnije učitavati iz baze ili environment varijabli
 */
const THRESHOLDS = {
  MASTERY_LOW: 40,
  MASTERY_MEDIUM: 70,
  MASTERY_HIGH: 90,
  QUIZ_PASS_SCORE: 70,
  INACTIVITY_HOURS: 24,
};

export class DecisionEngine implements IDecisionEngine {
  async decide(
    state: UserLearningState,
    memory: AgentMemory,
  ): Promise<AgentDecision> {
    // 1. Provjeri koliko dugo korisnik nije bio aktivan
    const hoursSinceLastActivity = this.getHoursSince(state.lastActivity);

    // 2. Ako je neaktivan predugo, generiši reminder lekciju
    if (hoursSinceLastActivity > THRESHOLDS.INACTIVITY_HOURS) {
      return {
        type: "GENERATE_LESSON",
        topic: state.currentTopic,
        difficulty: this.calculateDifficulty(state.masteryLevel),
      };
    }

    // 3. Analiziraj recent performance
    const avgRecentScore = this.calculateAverage(state.recentScores);

    // 4. Ako je mastery nizak, generiši lakšu lekciju
    if (state.masteryLevel < THRESHOLDS.MASTERY_LOW) {
      return {
        type: "GENERATE_LESSON",
        topic: state.currentTopic,
        difficulty: 1, // Lako
      };
    }

    // 5. Ako je mastery srednji i recent scores su dobri, daj kviz
    if (
      state.masteryLevel >= THRESHOLDS.MASTERY_LOW &&
      state.masteryLevel < THRESHOLDS.MASTERY_HIGH &&
      avgRecentScore >= THRESHOLDS.QUIZ_PASS_SCORE
    ) {
      return {
        type: "GENERATE_QUIZ",
        topic: state.currentTopic,
        difficulty: this.calculateDifficulty(state.masteryLevel),
        questionCount: 5,
      };
    }

    // 6. Ako je mastery visok, čekaj na korisnikov input
    if (state.masteryLevel >= THRESHOLDS.MASTERY_HIGH) {
      return {
        type: "WAIT",
        reason: "User has high mastery, waiting for their initiative",
      };
    }

    // 7. Default: generiši lekciju prilagođenu nivou
    return {
      type: "GENERATE_LESSON",
      topic: state.currentTopic,
      difficulty: this.calculateDifficulty(state.masteryLevel),
    };
  }

  async analyzeQuizResults(
    analysis: QuizAnalysis,
    state: UserLearningState,
  ): Promise<AgentDecision> {
    const percentage = (analysis.score / analysis.totalQuestions) * 100;

    // Ako je prolaz, podesi mastery
    if (percentage >= THRESHOLDS.QUIZ_PASS_SCORE) {
      const adjustment = percentage >= 90 ? 10 : 5;
      return {
        type: "UPDATE_MASTERY",
        userId: state.userId,
        topic: state.currentTopic,
        adjustment,
      };
    }

    // Ako nije prošao, generiši review lekciju fokusiranu na weak topics
    if (analysis.weakTopics.length > 0) {
      return {
        type: "GENERATE_LESSON",
        topic: analysis.weakTopics[0]!, // Fokusiraj se na najslabijem
        difficulty: 1, // Vraćamo na osnove
      };
    }

    // Default: practice kviz
    return {
      type: "GENERATE_QUIZ",
      topic: state.currentTopic,
      difficulty: Math.max(1, this.calculateDifficulty(state.masteryLevel) - 1),
      questionCount: 3,
    };
  }

  // ============ HELPER METHODS ============

  private calculateDifficulty(masteryLevel: number): number {
    if (masteryLevel < THRESHOLDS.MASTERY_LOW) return 1;
    if (masteryLevel < THRESHOLDS.MASTERY_MEDIUM) return 2;
    if (masteryLevel < THRESHOLDS.MASTERY_HIGH) return 3;
    return 4;
  }

  private calculateAverage(scores: number[]): number {
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private getHoursSince(date: Date): number {
    return (Date.now() - date.getTime()) / (1000 * 60 * 60);
  }
}
