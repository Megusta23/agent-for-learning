// src/server/logic/services/agent-orchestrator.ts
// =====================================================
// AGENT ORCHESTRATOR - Sense-Think-Act-Learn Ciklus
// =====================================================

import type {
  IAgentOrchestrator,
  IUserStateRepository,
  IQuizRepository,
  ILessonRepository,
  IAgentMemoryRepository,
  ILLMService,
  IDecisionEngine,
} from "../core/interfaces";

import type { AgentDecision } from "../core/types";

export class AgentOrchestrator implements IAgentOrchestrator {
  constructor(
    private readonly userStateRepo: IUserStateRepository,
    private readonly quizRepo: IQuizRepository,
    private readonly lessonRepo: ILessonRepository,
    private readonly memoryRepo: IAgentMemoryRepository,
    private readonly llmService: ILLMService,
    private readonly decisionEngine: IDecisionEngine,
  ) {}

  async step(): Promise<{
    processed: number;
    decisions: AgentDecision[];
    errors: string[];
  }> {
    const decisions: AgentDecision[] = [];
    const errors: string[] = [];
    let processed = 0;

    try {
      // ========== SENSE ==========
      console.log("[Agent] 👁️  SENSE: Scanning for users needing attention...");
      const usersNeedingAttention =
        await this.userStateRepo.findUsersNeedingAttention();

      if (usersNeedingAttention.length === 0) {
        console.log("[Agent] ✅ No users need attention right now.");
        return { processed: 0, decisions: [], errors: [] };
      }

      console.log(
        `[Agent] 🎯 Found ${usersNeedingAttention.length} users to process`,
      );

      // Obradi svakog korisnika pojedinačno
      for (const userState of usersNeedingAttention) {
        try {
          // Učitaj memory za kontekst
          const memory = await this.memoryRepo.getMemory(userState.userId);

          if (!memory) {
            console.log(
              `[Agent] ⚠️  No memory found for user ${userState.userId}, skipping`,
            );
            continue;
          }

          // ========== THINK ==========
          console.log(
            `[Agent] 🧠 THINK: Deciding action for user ${userState.userId}...`,
          );
          const decision = await this.decisionEngine.decide(userState, memory);
          decisions.push(decision);

          // ========== ACT ==========
          console.log(`[Agent] 🎬 ACT: Executing decision: ${decision.type}`);
          await this.executeDecision(decision, userState.userId);

          // ========== LEARN ==========
          console.log(
            `[Agent] 📚 LEARN: Updating memory for user ${userState.userId}`,
          );
          await this.updateMemory(memory, decision);

          processed++;
        } catch (error) {
          const errorMsg = `Error processing user ${userState.userId}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(`[Agent] ❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      console.log(
        `[Agent] ✅ Tick completed: ${processed} users processed, ${errors.length} errors`,
      );

      return { processed, decisions, errors };
    } catch (error) {
      const errorMsg = `Critical error in agent tick: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`[Agent] 💥 ${errorMsg}`);
      return { processed, decisions, errors: [...errors, errorMsg] };
    }
  }

  // ========== ACT PHASE IMPLEMENTATION ==========

  private async executeDecision(
    decision: AgentDecision,
    userId: string,
  ): Promise<void> {
    switch (decision.type) {
      case "GENERATE_LESSON": {
        const lesson = await this.llmService.generateLesson({
          type: "lesson",
          topic: decision.topic,
          difficulty: decision.difficulty,
        });

        await this.lessonRepo.saveLesson(lesson, userId, decision.topic);
        await this.userStateRepo.recordActivity(userId, "lesson_generated");
        console.log(
          `[Agent] 📖 Lesson generated for user ${userId} on topic: ${decision.topic}`,
        );
        break;
      }

      case "GENERATE_QUIZ": {
        const quiz = await this.llmService.generateQuiz({
          type: "quiz",
          topic: decision.topic,
          difficulty: decision.difficulty,
        });

        await this.quizRepo.saveQuiz(quiz, userId, decision.topic);
        await this.userStateRepo.recordActivity(userId, "quiz_generated");
        console.log(
          `[Agent] 📝 Quiz generated for user ${userId} with ${decision.questionCount} questions`,
        );
        break;
      }

      case "UPDATE_MASTERY": {
        const currentState = await this.userStateRepo.getUserState(userId);
        if (currentState) {
          const newLevel = Math.min(
            100,
            currentState.masteryLevel + decision.adjustment,
          );
          await this.userStateRepo.updateMasteryLevel(
            userId,
            decision.topic,
            newLevel,
          );
          console.log(
            `[Agent] 📈 Mastery updated for user ${userId}: ${currentState.masteryLevel} → ${newLevel}`,
          );
        }
        break;
      }

      case "WAIT": {
        console.log(
          `[Agent] ⏸️  Waiting for user ${userId}: ${decision.reason}`,
        );
        break;
      }
    }
  }

  // ========== LEARN PHASE IMPLEMENTATION ==========

  private async updateMemory(
    memory: import("../core/types").AgentMemory,
    decision: AgentDecision,
  ): Promise<void> {
    // Ažuriraj timestamp
    memory.lastUpdated = new Date();

    // Ako je generisana lekcija ili kviz, možemo trackati preference
    if (
      decision.type === "GENERATE_LESSON" ||
      decision.type === "GENERATE_QUIZ"
    ) {
      const currentHour = new Date().getHours();
      if (!memory.learningPatterns.bestTimeOfDay) {
        memory.learningPatterns.bestTimeOfDay = `${currentHour}:00`;
      }
    }

    await this.memoryRepo.updateMemory(memory);
  }
}
