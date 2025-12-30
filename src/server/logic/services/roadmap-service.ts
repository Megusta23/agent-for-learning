
import { eq, and, asc } from "drizzle-orm";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import { 
    roadmaps, 
    days, 
    lessons, 
    quizzes, 
    flashcards,
    type InsertRoadmap,
    type InsertDay,
    type InsertLesson,
    type InsertQuiz,
    type InsertFlashcard
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
    const day = await this.db.query.days.findFirst({
      where: eq(days.id, dayId)
    });

    if (!day) return null;

    const lesson = await this.db.query.lessons.findFirst({
      where: eq(lessons.dayId, dayId)
    });

    const quiz = await this.db.query.quizzes.findFirst({
      where: eq(quizzes.dayId, dayId)
    });

    const dayFlashcards = await this.db.query.flashcards.findMany({
      where: eq(flashcards.dayId, dayId)
    });

    return {
      day,
      lesson,
      quiz,
      flashcards: dayFlashcards
    };
  }

  /**
   * Generates lesson content for a specific day using LLM
   */
  async generateDayLesson(dayId: string, userId: string) {
    // 1. Check if lesson already exists
    const existingLesson = await this.db.query.lessons.findFirst({
      where: and(eq(lessons.dayId, dayId), eq(lessons.userId, userId))
    });

    if (existingLesson) {
      return existingLesson;
    }

    // 2. Get day context
    const day = await this.db.query.days.findFirst({
      where: eq(days.id, dayId)
    });

    if (!day) throw new Error("Day not found");

    console.log(`[RoadmapService] 🤖 Generating full day content for day: ${day.dayNumber} (${day.topic})`);

    // 3. Generate content in parallel (Lesson, Quiz, Flashcards)
    const dayNumber = day.dayNumber;
    
    // Scale difficulty/count based on day number
    const difficulty = Math.min(Math.floor(dayNumber / 7) + 1, 4);
    const quizQuestionCount = Math.min(3 + Math.floor((dayNumber - 1) / 2), 10);
    const flashcardCount = Math.min(5 + Math.floor((dayNumber - 1) / 3) * 2, 15);

    const [generatedLesson, generatedQuiz, generatedFlashcards] = await Promise.all([
      // Lesson
      this.llmService.generateLesson({
        topic: day.topic,
        type: "lesson",
        difficulty,
        context: {
          previousErrors: [], 
          userMasteryLevel: 0
        }
      }),
      // Quiz
      this.llmService.generateQuiz({
        topic: day.topic,
        type: "quiz",
        difficulty,
        questionCount: quizQuestionCount
      }),
      // Flashcards
      this.llmService.generateFlashcards(
        {
          topic: day.topic,
          type: "flashcards",
          difficulty,
        },
        flashcardCount
      )
    ]);

    // 4. Save Lesson
    const newLesson: InsertLesson = {
      id: nanoid(),
      userId,
      dayId,
      topic: day.topic,
      title: generatedLesson.title,
      content: generatedLesson.content,
      keyPoints: JSON.stringify(generatedLesson.keyPoints),
      difficulty,
      estimatedMinutes: generatedLesson.estimatedMinutes || 15,
      completed: false
    };
    await this.db.insert(lessons).values(newLesson);

    // 5. Save Quiz
    const newQuiz: InsertQuiz = {
      id: nanoid(),
      userId,
      dayId,
      topic: day.topic,
      title: generatedQuiz.title,
      questions: JSON.stringify(generatedQuiz.questions),
      difficulty,
      totalQuestions: generatedQuiz.questions.length,
      completed: false
    };
    await this.db.insert(quizzes).values(newQuiz);

    // 6. Save Flashcards
    for (const card of generatedFlashcards.cards) {
       await this.db.insert(flashcards).values({
         id: nanoid(),
         userId,
         dayId,
         front: card.front,
         back: card.back,
         tags: JSON.stringify(card.tags || []),
         masteryLevel: 0
       });
    }

    console.log(`[RoadmapService] ✅ Generated Lesson, Quiz (${generatedQuiz.questions.length}), and Flashcards (${generatedFlashcards.cards.length})`);
    
    return newLesson;
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
