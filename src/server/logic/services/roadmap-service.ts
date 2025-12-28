
import { eq, and, asc } from "drizzle-orm";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import { 
    roadmaps, 
    days, 
    lessons, 
    quizzes, 
    flashcards,
    type InsertRoadmap,
    type InsertDay
} from "../../db/schema";
import * as schema from "../../db/schema"; // Import full schema for type definition
import { nanoid } from "nanoid";

export class RoadmapService {
  constructor(private readonly db: LibSQLDatabase<typeof schema>) {}


  /**
   * Creates a new roadmap for a user
   */
  async createRoadmap(
    userId: string, 
    topic: string, 
    totalDays: number, 
    dailyMinutes: number
  ): Promise<string> {
    const roadmapId = nanoid();
    
    // Create the roadmap
    const newRoadmap: InsertRoadmap = {
        id: roadmapId,
        userId,
        topic,
        totalDays,
        dailyMinutes,
        status: "active",
        currentDay: 1
    };

    await this.db.insert(roadmaps).values(newRoadmap);

    // Create empty days placeholders
    // The content for these days will be generated just-in-time
    const dayInserts: InsertDay[] = [];
    for (let i = 1; i <= totalDays; i++) {
        dayInserts.push({
            id: nanoid(),
            roadmapId,
            dayNumber: i,
            topic: `Day ${i} Placeholder`, // Will be updated by LLM
            status: i === 1 ? "available" : "locked",
            description: i === 1 ? "Getting Started" : undefined
        });
    }

    await this.db.insert(days).values(dayInserts);
    
    return roadmapId;
  }

  /**
   * Gets the active roadmap for a user
   */
  async getActiveRoadmap(userId: string) {
    const result = await this.db
        .select()
        .from(roadmaps)
        .where(
            and(
                eq(roadmaps.userId, userId), 
                eq(roadmaps.status, "active")
            )
        )
        .limit(1);
        
    return result[0] || null;
  }

  /**
   * Gets updates for a specific roadmap
   */
  async getRoadmapDetails(roadmapId: string) {
    const roadmap = await this.db.select().from(roadmaps).where(eq(roadmaps.id, roadmapId)).get();
    if (!roadmap) return null;

    const roadmapDays = await this.db
        .select()
        .from(days)
        .where(eq(days.roadmapId, roadmapId))
        .orderBy(asc(days.dayNumber));
        
    return { ...roadmap, days: roadmapDays };
  }

  /**
   * Unlocks the next day if criteria are met
   */
  async unlockNextDay(roadmapId: string, currentDayNumber: number) {
     // 1. Mark current day as completed
     await this.db.update(days)
        .set({ status: "completed" })
        .where(
            and(
                eq(days.roadmapId, roadmapId),
                eq(days.dayNumber, currentDayNumber)
            )
        );

     // 2. Unlock next day
     const nextDayNumber = currentDayNumber + 1;
     await this.db.update(days)
        .set({ status: "available" })
        .where(
             and(
                eq(days.roadmapId, roadmapId),
                eq(days.dayNumber, nextDayNumber)
            )
        );
        
     // 3. Update roadmap pointer
     await this.db.update(roadmaps)
        .set({ currentDay: nextDayNumber })
        .where(eq(roadmaps.id, roadmapId));
        
     return nextDayNumber;
  }

  /**
   * Gets all roadmaps for a user with progress info
   */
  async getUserRoadmaps(userId: string) {
    const userRoadmaps = await this.db
        .select()
        .from(roadmaps)
        .where(eq(roadmaps.userId, userId))
        .orderBy(asc(roadmaps.createdAt));

    // Calculate progress for each roadmap
    const roadmapsWithProgress = await Promise.all(
      userRoadmaps.map(async (roadmap) => {
        const roadmapDays = await this.db
          .select()
          .from(days)
          .where(eq(days.roadmapId, roadmap.id));
        
        const completedDays = roadmapDays.filter(d => d.status === "completed").length;
        const progress = Math.round((completedDays / roadmap.totalDays) * 100);
        
        return {
          ...roadmap,
          progress,
          completedDays
        };
      })
    );
    
    return roadmapsWithProgress;
  }
}
