// src/server/db/repositories/lesson-repository.ts
// =====================================================
// LESSON REPOSITORY - Drizzle ORM Implementation
// =====================================================

import { db } from "../index";
import { lessons } from "../schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { ILessonRepository } from "../../logic/core/interfaces";
import type { GeneratedLesson } from "../../logic/core/types";

export class DrizzleLessonRepository implements ILessonRepository {
  /**
   * Sprema novu generisanu lekciju u bazu
   * Vraća ID nove lekcije
   */
  async saveLesson(
    lesson: GeneratedLesson,
    userId: string,
    topic: string,
  ): Promise<string> {
    const lessonId = nanoid();

    await db.insert(lessons).values({
      id: lessonId,
      userId,
      topic,
      title: lesson.title,
      content: lesson.content,
      keyPoints: JSON.stringify(lesson.keyPoints),
      difficulty: this.inferDifficulty(lesson.estimatedMinutes),
      estimatedMinutes: lesson.estimatedMinutes,
      completed: false,
      createdAt: new Date(),
    });

    console.log(`[LessonRepo] 💾 Saved lesson: ${lessonId} for user ${userId}`);
    return lessonId;
  }

  /**
   * Dohvata historiju lekcija za određeni topic
   * Vraća IDs lekcija sortirane po datumu (najnovije prvo)
   */
  async getLessonHistory(userId: string, topic: string): Promise<string[]> {
    const rows = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(and(eq(lessons.userId, userId), eq(lessons.topic, topic)))
      .orderBy(desc(lessons.createdAt));

    return rows.map((r) => r.id);
  }

  /**
   * Dohvata kompletnu lekciju po ID-u
   */
  async getLessonById(lessonId: string): Promise<GeneratedLesson | null> {
    const rows = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0]!;
    return {
      title: row.title,
      content: row.content,
      keyPoints: JSON.parse(row.keyPoints),
      estimatedMinutes: row.estimatedMinutes,
    };
  }

  /**
   * Označava lekciju kao završenu
   */
  async markLessonAsCompleted(lessonId: string): Promise<void> {
    await db
      .update(lessons)
      .set({ completed: true })
      .where(eq(lessons.id, lessonId));

    console.log(`[LessonRepo] ✅ Lesson ${lessonId} marked as completed`);
  }

  /**
   * Dohvata sve nedovršene lekcije za korisnika
   */
  async getPendingLessons(userId: string): Promise<string[]> {
    const rows = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(and(eq(lessons.userId, userId), eq(lessons.completed, false)))
      .orderBy(desc(lessons.createdAt));

    return rows.map((r) => r.id);
  }

  /**
   * Dohvata sve lekcije za korisnika (za dashboard prikaz)
   */
  async getAllUserLessons(
    userId: string,
    limit?: number,
  ): Promise<
    Array<{
      id: string;
      topic: string;
      title: string;
      completed: boolean;
      createdAt: Date;
    }>
  > {
    const query = db
      .select({
        id: lessons.id,
        topic: lessons.topic,
        title: lessons.title,
        completed: lessons.completed,
        createdAt: lessons.createdAt,
      })
      .from(lessons)
      .where(eq(lessons.userId, userId))
      .orderBy(desc(lessons.createdAt));

    if (limit) {
      query.limit(limit);
    }

    return await query;
  }

  /**
   * Broji koliko lekcija je korisnik završio za određeni topic
   */
  async countCompletedLessons(userId: string, topic: string): Promise<number> {
    const rows = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(
        and(
          eq(lessons.userId, userId),
          eq(lessons.topic, topic),
          eq(lessons.completed, true),
        ),
      );

    return rows.length;
  }

  /**
   * Dohvata najnoviju lekciju za korisnika (za notifications)
   */
  async getLatestLesson(userId: string): Promise<{
    id: string;
    title: string;
    topic: string;
    createdAt: Date;
  } | null> {
    const rows = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        topic: lessons.topic,
        createdAt: lessons.createdAt,
      })
      .from(lessons)
      .where(eq(lessons.userId, userId))
      .orderBy(desc(lessons.createdAt))
      .limit(1);

    return rows.length > 0 ? rows[0]! : null;
  }

  /**
   * Briše lekciju (admin funkcionalnost)
   */
  async deleteLesson(lessonId: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, lessonId));

    console.log(`[LessonRepo] 🗑️  Deleted lesson: ${lessonId}`);
  }

  /**
   * Ažurira lekciju (za manual editing)
   */
  async updateLesson(
    lessonId: string,
    updates: Partial<GeneratedLesson>,
  ): Promise<void> {
    const updateData: any = {};

    if (updates.title) updateData.title = updates.title;
    if (updates.content) updateData.content = updates.content;
    if (updates.keyPoints)
      updateData.keyPoints = JSON.stringify(updates.keyPoints);
    if (updates.estimatedMinutes)
      updateData.estimatedMinutes = updates.estimatedMinutes;

    if (Object.keys(updateData).length > 0) {
      await db.update(lessons).set(updateData).where(eq(lessons.id, lessonId));

      console.log(`[LessonRepo] 📝 Updated lesson: ${lessonId}`);
    }
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Inferiraj težinu na osnovu estimiranog vremena
   */
  private inferDifficulty(estimatedMinutes: number): number {
    if (estimatedMinutes <= 5) return 1; // Easy - kratke lekcije
    if (estimatedMinutes <= 15) return 2; // Medium
    if (estimatedMinutes <= 30) return 3; // Hard
    return 4; // Expert - dugačke lekcije
  }
}
