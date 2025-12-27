// src/server/db/repositories/quiz-repository.ts
// =====================================================
// QUIZ REPOSITORY - Drizzle ORM Implementation
// =====================================================

import { db } from "../index";
import { quizzes } from "../schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { IQuizRepository } from "../../logic/core/interfaces";
import type { QuizAnalysis, GeneratedQuiz } from "../../logic/core/types";

export class DrizzleQuizRepository implements IQuizRepository {
  /**
   * Dohvata nedavne rezultate kvizova za korisnika
   * Koristi se za analizu napretka i decision making
   */
  async getRecentQuizResults(
    userId: string,
    limit: number,
  ): Promise<QuizAnalysis[]> {
    const rows = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.userId, userId), eq(quizzes.completed, true)))
      .orderBy(desc(quizzes.createdAt))
      .limit(limit);

    return rows
      .map(this.mapToQuizAnalysis)
      .filter((a): a is QuizAnalysis => a !== null);
  }

  /**
   * Sprema novi generisani kviz u bazu
   * Vraća ID novog kviza
   */
  async saveQuiz(
    quiz: GeneratedQuiz,
    userId: string,
    topic: string,
  ): Promise<string> {
    const quizId = nanoid();

    await db.insert(quizzes).values({
      id: quizId,
      userId,
      topic,
      title: quiz.title,
      questions: JSON.stringify(quiz.questions),
      difficulty: this.inferDifficulty(quiz.questions.length),
      completed: false,
      score: null,
      createdAt: new Date(),
    });

    return quizId;
  }

  /**
   * Označava kviz kao obrađen od strane agenta
   * Koristi se da se izbegne duplo procesiranje
   */
  async markQuizAsProcessed(quizId: string): Promise<void> {
    // Ova metoda može se koristiti za flagovanje da je agent već analizirao rezultate
    // Za sada, možemo samo ažurirati timestamp ili dodati flag u budućnosti
    // Opciono: dodaj "processedByAgent" field u šemu kasnije
    // await db.update(quizzes)
    //   .set({ processedByAgent: true })
    //   .where(eq(quizzes.id, quizId));
  }

  /**
   * Dohvata kviz po ID-u (helper metoda)
   */
  async getQuizById(quizId: string): Promise<GeneratedQuiz | null> {
    const rows = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0]!;
    return {
      title: row.title,
      questions: JSON.parse(row.questions),
    };
  }

  /**
   * Ažurira rezultat kviza nakon što ga korisnik završi
   */
  async updateQuizScore(
    quizId: string,
    score: number,
    totalQuestions: number,
  ): Promise<void> {
    await db
      .update(quizzes)
      .set({
        completed: true,
        score,
      })
      .where(eq(quizzes.id, quizId));
  }

  /**
   * Dohvata sve nedovršene kvizove za korisnika
   */
  async getPendingQuizzes(userId: string): Promise<string[]> {
    const rows = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(and(eq(quizzes.userId, userId), eq(quizzes.completed, false)))
      .orderBy(desc(quizzes.createdAt));

    return rows.map((r) => r.id);
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Mapira database row u QuizAnalysis domain tip
   */
  private mapToQuizAnalysis(row: any): QuizAnalysis | null {
    if (!row.completed || row.score === null) {
      return null; // Samo completed kvizovi
    }

    const questions = JSON.parse(row.questions);
    const score = row.score;
    const totalQuestions = questions.length;

    // Analiziraj slabe tačke na osnovu pitanja
    // (Ovo je simplifikovana verzija - možeš dodati detaljniju analizu)
    const weakTopics = this.analyzeWeakTopics(questions, score, totalQuestions);
    const strengths = this.analyzeStrengths(questions, score, totalQuestions);

    // Određi preporučenu akciju
    const percentage = (score / totalQuestions) * 100;
    let recommendedAction: "review" | "advance" | "practice";

    if (percentage < 60) {
      recommendedAction = "review";
    } else if (percentage >= 80) {
      recommendedAction = "advance";
    } else {
      recommendedAction = "practice";
    }

    return {
      score,
      totalQuestions,
      weakTopics,
      strengths,
      recommendedAction,
    };
  }

  /**
   * Analizira slabe teme na osnovu rezultata
   * Ovo je simplifikovana verzija - može se unaprijediti sa detaljnijom analizom
   */
  private analyzeWeakTopics(
    questions: any[],
    score: number,
    totalQuestions: number,
  ): string[] {
    // Simplifikovana logika - u realnoj implementaciji bi analizirao
    // koje tačno odgovore je korisnik promašio
    const percentage = (score / totalQuestions) * 100;

    if (percentage < 60) {
      // Ekstraktuj unique topics iz pitanja (ako ih ima)
      const topics = questions
        .map((q) => q.topic)
        .filter((t): t is string => t !== undefined);

      return [...new Set(topics)];
    }

    return [];
  }

  /**
   * Analizira jake strane korisnika
   */
  private analyzeStrengths(
    questions: any[],
    score: number,
    totalQuestions: number,
  ): string[] {
    const percentage = (score / totalQuestions) * 100;

    if (percentage >= 80) {
      // Ekstraktuj topics gdje je korisnik bio jak
      const topics = questions
        .map((q) => q.topic)
        .filter((t): t is string => t !== undefined);

      return [...new Set(topics)];
    }

    return [];
  }

  /**
   * Inferiraj težinu na osnovu broja pitanja
   */
  private inferDifficulty(questionCount: number): number {
    if (questionCount <= 3) return 1; // Easy
    if (questionCount <= 5) return 2; // Medium
    if (questionCount <= 8) return 3; // Hard
    return 4; // Expert
  }
}
