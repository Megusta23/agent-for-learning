import { db } from "../index";
import { userLearningState } from "../schema";
import { eq, and, lt } from "drizzle-orm";

import type { IUserStateRepository } from "../../logic/core/interfaces";
import type { UserLearningState } from "../../logic/core/types";

export class DrizzleUserStateRepository implements IUserStateRepository {
  async findUsersNeedingAttention(): Promise<UserLearningState[]> {
    const rows = await db
      .select()
      .from(userLearningState)
      .where(eq(userLearningState.needsAttention, true));

    return rows.map(this.mapToUserState);
  }

  async getUserState(userId: string): Promise<UserLearningState | null> {
    const rows = await db
      .select()
      .from(userLearningState)
      .where(eq(userLearningState.userId, userId))
      .limit(1);

    return rows[0] ? this.mapToUserState(rows[0]) : null;
  }

  async updateMasteryLevel(
    userId: string,
    topic: string,
    newLevel: number,
  ): Promise<void> {
    await db
      .update(userLearningState)
      .set({ masteryLevel: newLevel })
      .where(
        and(
          eq(userLearningState.userId, userId),
          eq(userLearningState.currentTopic, topic),
        ),
      );
  }

  async recordActivity(userId: string, activityType: string): Promise<void> {
    await db
      .update(userLearningState)
      .set({ lastActivity: new Date() })
      .where(eq(userLearningState.userId, userId));
  }

  private mapToUserState(row: any): UserLearningState {
    return {
      userId: row.userId,
      currentTopic: row.currentTopic,
      masteryLevel: row.masteryLevel,
      lastActivity: new Date(row.lastActivity),
      recentScores: JSON.parse(row.recentScores),
      needsAttention: Boolean(row.needsAttention),
    };
  }
}
