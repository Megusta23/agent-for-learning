// src/server/db/repositories/memory-repository.ts
// =====================================================
// AGENT MEMORY REPOSITORY - Drizzle ORM Implementation
// =====================================================

import { db } from "../index";
import { agentMemory } from "../schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { IAgentMemoryRepository } from "../../logic/core/interfaces";
import type { AgentMemory } from "../../logic/core/types";

export class DrizzleAgentMemoryRepository implements IAgentMemoryRepository {
  /**
   * Dohvata agent memory za korisnika
   * Ovo je dugoročno pamćenje agenta o učeničkim navikama i performansama
   */
  async getMemory(userId: string): Promise<AgentMemory | null> {
    const rows = await db
      .select()
      .from(agentMemory)
      .where(eq(agentMemory.userId, userId))
      .limit(1);

    if (rows.length === 0) {
      // Ako memory ne postoji, kreiraj inicijalnu verziju
      console.log(`[MemoryRepo] 🆕 Creating new memory for user ${userId}`);
      return await this.createInitialMemory(userId);
    }

    return this.mapToAgentMemory(rows[0]!);
  }

  /**
   * Ažurira ili kreira agent memory
   */
  async updateMemory(memory: AgentMemory): Promise<void> {
    const existing = await db
      .select({ id: agentMemory.id })
      .from(agentMemory)
      .where(eq(agentMemory.userId, memory.userId))
      .limit(1);

    const data = {
      userId: memory.userId,
      learningPatterns: JSON.stringify(memory.learningPatterns),
      historicalPerformance: JSON.stringify(memory.historicalPerformance),
      lastUpdated: new Date(),
    };

    if (existing.length > 0) {
      // Update postojećeg
      await db
        .update(agentMemory)
        .set(data)
        .where(eq(agentMemory.id, existing[0]!.id));

      console.log(`[MemoryRepo] 🔄 Updated memory for user ${memory.userId}`);
    } else {
      // Insert novog
      await db.insert(agentMemory).values({
        id: nanoid(),
        ...data,
      });

      console.log(`[MemoryRepo] ➕ Created memory for user ${memory.userId}`);
    }
  }

  /**
   * Dodaje novi performance record u historical performance
   */
  async addPerformanceRecord(
    userId: string,
    topic: string,
    score: number,
  ): Promise<void> {
    const memory = await this.getMemory(userId);
    if (!memory) {
      console.error(`[MemoryRepo] ❌ No memory found for user ${userId}`);
      return;
    }

    // Pronađi postojeći record za topic ili kreiraj novi
    const existingRecord = memory.historicalPerformance.find(
      (p) => p.topic === topic,
    );

    if (existingRecord) {
      // Ažuriraj prosječan score i broj pokušaja
      const totalScore =
        existingRecord.averageScore * existingRecord.attempts + score;
      existingRecord.attempts += 1;
      existingRecord.averageScore = totalScore / existingRecord.attempts;
    } else {
      // Dodaj novi record
      memory.historicalPerformance.push({
        topic,
        averageScore: score,
        attempts: 1,
      });
    }

    await this.updateMemory(memory);
    console.log(
      `[MemoryRepo] 📊 Added performance record for ${userId} - ${topic}: ${score}`,
    );
  }

  /**
   * Ažurira learning patterns (npr. najbolje vrijeme dana)
   */
  async updateLearningPattern(
    userId: string,
    pattern: Partial<AgentMemory["learningPatterns"]>,
  ): Promise<void> {
    const memory = await this.getMemory(userId);
    if (!memory) {
      console.error(`[MemoryRepo] ❌ No memory found for user ${userId}`);
      return;
    }

    // Merge sa postojećim patterns
    memory.learningPatterns = {
      ...memory.learningPatterns,
      ...pattern,
    };

    await this.updateMemory(memory);
    console.log(`[MemoryRepo] 🧠 Updated learning patterns for ${userId}`);
  }

  /**
   * Dohvata performance statistiku za određeni topic
   */
  async getTopicPerformance(
    userId: string,
    topic: string,
  ): Promise<{ averageScore: number; attempts: number } | null> {
    const memory = await this.getMemory(userId);
    if (!memory) return null;

    const record = memory.historicalPerformance.find((p) => p.topic === topic);
    return record || null;
  }

  /**
   * Dohvata sve topics koje je korisnik vježbao, sortirane po performance
   */
  async getTopicsByPerformance(userId: string): Promise<
    Array<{
      topic: string;
      averageScore: number;
      attempts: number;
    }>
  > {
    const memory = await this.getMemory(userId);
    if (!memory) return [];

    // Sortiraj po average score (najlošiji prvo - trebaju pomoć)
    return [...memory.historicalPerformance].sort(
      (a, b) => a.averageScore - b.averageScore,
    );
  }

  /**
   * Briše memory za korisnika (admin funkcionalnost)
   */
  async deleteMemory(userId: string): Promise<void> {
    await db.delete(agentMemory).where(eq(agentMemory.userId, userId));

    console.log(`[MemoryRepo] 🗑️  Deleted memory for user ${userId}`);
  }

  /**
   * Resetuje memory za korisnika (čuva userId ali briše sve podatke)
   */
  async resetMemory(userId: string): Promise<void> {
    const initialMemory = this.createEmptyMemory(userId);
    await this.updateMemory(initialMemory);

    console.log(`[MemoryRepo] 🔄 Reset memory for user ${userId}`);
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Mapira database row u AgentMemory domain tip
   */
  private mapToAgentMemory(row: any): AgentMemory {
    return {
      userId: row.userId,
      learningPatterns: JSON.parse(row.learningPatterns),
      historicalPerformance: JSON.parse(row.historicalPerformance),
      lastUpdated: new Date(row.lastUpdated),
    };
  }

  /**
   * Kreira inicijalnu memory strukturu za novog korisnika
   */
  private async createInitialMemory(userId: string): Promise<AgentMemory> {
    const initialMemory = this.createEmptyMemory(userId);

    await db.insert(agentMemory).values({
      id: nanoid(),
      userId: initialMemory.userId,
      learningPatterns: JSON.stringify(initialMemory.learningPatterns),
      historicalPerformance: JSON.stringify(
        initialMemory.historicalPerformance,
      ),
      lastUpdated: initialMemory.lastUpdated,
    });

    return initialMemory;
  }

  /**
   * Helper za kreiranje prazne memory strukture
   */
  private createEmptyMemory(userId: string): AgentMemory {
    return {
      userId,
      learningPatterns: {
        bestTimeOfDay: undefined,
        averageSessionLength: undefined,
        preferredDifficulty: undefined,
      },
      historicalPerformance: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * Dohvata statistiku za sve korisnike (admin dashboard)
   */
  async getAllMemoriesStats(): Promise<
    Array<{
      userId: string;
      totalTopics: number;
      averageScore: number;
      lastUpdated: Date;
    }>
  > {
    const rows = await db.select().from(agentMemory);

    return rows.map((row) => {
      const memory = this.mapToAgentMemory(row);
      const totalTopics = memory.historicalPerformance.length;

      const averageScore =
        totalTopics > 0
          ? memory.historicalPerformance.reduce(
              (sum, p) => sum + p.averageScore,
              0,
            ) / totalTopics
          : 0;

      return {
        userId: memory.userId,
        totalTopics,
        averageScore,
        lastUpdated: memory.lastUpdated,
      };
    });
  }
}
