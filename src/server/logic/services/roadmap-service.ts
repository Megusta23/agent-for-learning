
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
import { GroqLLMService } from "../../llm/llm-service";
import { env } from "~/env";

export class RoadmapService {
  private llmService: GroqLLMService;
  
  constructor(private readonly db: LibSQLDatabase<typeof schema>) {
    // Initialize LLM service for roadmap generation
    this.llmService = new GroqLLMService(env.GROQ_API_KEY);
  }


  /**
   * Creates a new roadmap for a user with AI-generated topics
   */
  async createRoadmap(
    userId: string, 
    topic: string, 
    totalDays: number, 
    dailyMinutes: number
  ): Promise<string> {
    const roadmapId = nanoid();
    
    // Generate roadmap content using LLM
    console.log(`[RoadmapService] 🚀 Generating AI roadmap for "${topic}"...`);
    const generatedRoadmap = await this.llmService.generateRoadmap(
      topic,
      totalDays,
      dailyMinutes
    );
    
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

    // Create days with AI-generated content
    const dayInserts: InsertDay[] = generatedRoadmap.days.map((day, index) => ({
        id: nanoid(),
        roadmapId,
        dayNumber: day.dayNumber,
        topic: day.topic,
        status: day.dayNumber === 1 ? "available" : "locked",
        description: day.description
    }));

    await this.db.insert(days).values(dayInserts);
    
    console.log(`[RoadmapService] ✅ Roadmap created with ${dayInserts.length} AI-generated days`);
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

  /**
   * Gets a specific day with its lesson (if exists)
   */
  async getDayWithLesson(dayId: string) {
    const day = await this.db.select().from(days).where(eq(days.id, dayId)).get();
    if (!day) return null;

    // Get associated lesson
    const lesson = await this.db
      .select()
      .from(lessons)
      .where(eq(lessons.dayId, dayId))
      .get();

    // Get the roadmap for topic context
    const roadmap = await this.db
      .select()
      .from(roadmaps)
      .where(eq(roadmaps.id, day.roadmapId))
      .get();

    return { day, lesson, roadmap };
  }

  /**
   * Generates lesson content for a specific day using LLM
   */
  async generateDayLesson(dayId: string, userId: string) {
    const dayData = await this.getDayWithLesson(dayId);
    if (!dayData) {
      throw new Error("Day not found");
    }

    const { day, lesson: existingLesson, roadmap } = dayData;

    // If lesson already exists, return it
    if (existingLesson) {
      console.log(`[RoadmapService] Lesson already exists for day ${day.dayNumber}`);
      return existingLesson;
    }

    // Generate new lesson using LLM
    console.log(`[RoadmapService] 📚 Generating lesson for "${day.topic}"...`);
    const generatedLesson = await this.llmService.generateLesson({
      type: "lesson",
      topic: day.topic,
      difficulty: 2, // Default to intermediate
      context: {
        userMasteryLevel: 50 // Default mastery
      }
    });

    // Save lesson to database
    const lessonId = nanoid();
    await this.db.insert(lessons).values({
      id: lessonId,
      userId,
      dayId,
      topic: day.topic,
      title: generatedLesson.title,
      content: generatedLesson.content,
      keyPoints: JSON.stringify(generatedLesson.keyPoints),
      difficulty: 2,
      estimatedMinutes: generatedLesson.estimatedMinutes,
      order: 1,
      completed: false
    });

    console.log(`[RoadmapService] ✅ Lesson created: "${generatedLesson.title}"`);

    // Fetch and return the saved lesson
    const savedLesson = await this.db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .get();

    return savedLesson;
  }

  /**
   * Marks a day as complete and unlocks the next day
   */
  async completeDay(roadmapId: string, dayId: string) {
    // Get the day info
    const day = await this.db.select().from(days).where(eq(days.id, dayId)).get();
    if (!day) {
      throw new Error("Day not found");
    }

    // Mark current day lesson as completed
    await this.db.update(lessons)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(lessons.dayId, dayId));

    // Unlock next day
    const nextDayNumber = await this.unlockNextDay(roadmapId, day.dayNumber);

    console.log(`[RoadmapService] ✅ Day ${day.dayNumber} completed, Day ${nextDayNumber} unlocked`);

    return { completedDay: day.dayNumber, nextDay: nextDayNumber };
  }

  /**
   * Deletes a roadmap and all associated data
   */
  async deleteRoadmap(roadmapId: string) {
    console.log(`[RoadmapService] 🗑️ Deleting roadmap: ${roadmapId}`);
    
    // Get all days for this roadmap
    const roadmapDays = await this.db
      .select()
      .from(days)
      .where(eq(days.roadmapId, roadmapId));

    // Delete all lessons associated with each day
    for (const day of roadmapDays) {
      await this.db.delete(lessons).where(eq(lessons.dayId, day.id));
      await this.db.delete(flashcards).where(eq(flashcards.dayId, day.id));
      await this.db.delete(quizzes).where(eq(quizzes.dayId, day.id));
    }

    // Delete all days
    await this.db.delete(days).where(eq(days.roadmapId, roadmapId));

    // Delete the roadmap itself
    await this.db.delete(roadmaps).where(eq(roadmaps.id, roadmapId));

    console.log(`[RoadmapService] ✅ Roadmap deleted with all associated data`);
    return { success: true };
  }
}
