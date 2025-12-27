// src/worker/runner.ts - UPDATED VERSION
// =====================================================
// AUTONOMOUS AGENT RUNNER - Kompletna Implementacija
// =====================================================

import { AgentOrchestrator } from "../server/logic/services/agent-orchestrator";
import { DecisionEngine } from "../server/logic/services/decision-engine";
import { createRepositories } from "../server/db/repositories";

// TODO: Uncomment kada implementiraš LLM service
// import { GroqLLMService } from "../server/llm/llm-service";

/**
 * Konfiguracija runnera
 */
const CONFIG = {
  TICK_INTERVAL_MS: Number(process.env.AGENT_TICK_INTERVAL_MS) || 30000,
  MAX_ERRORS_BEFORE_PAUSE: Number(process.env.AGENT_MAX_ERRORS) || 5,
  ERROR_PAUSE_MS: Number(process.env.AGENT_ERROR_PAUSE_MS) || 60000,
  SHUTDOWN_GRACE_PERIOD_MS: 5000,
};

/**
 * Agent Runner klasa
 */
class AgentRunner {
  private isRunning = false;
  private consecutiveErrors = 0;
  private orchestrator: AgentOrchestrator;
  private startTime: Date;
  private tickCount = 0;

  constructor(orchestrator: AgentOrchestrator) {
    this.orchestrator = orchestrator;
    this.startTime = new Date();
    this.setupGracefulShutdown();
  }

  /**
   * Pokreće agent loop
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("[Runner] ⚠️  Agent is already running!");
      return;
    }

    this.isRunning = true;
    this.startTime = new Date();

    console.log("[Runner] 🚀 EduAgent starting...");
    console.log(
      `[Runner] ⏰ Tick interval: ${CONFIG.TICK_INTERVAL_MS}ms (${CONFIG.TICK_INTERVAL_MS / 1000}s)`,
    );
    console.log(
      `[Runner] 🛡️  Max errors before pause: ${CONFIG.MAX_ERRORS_BEFORE_PAUSE}`,
    );

    await this.runLoop();
  }

  /**
   * Glavna petlja agenta
   */
  private async runLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        const tickStart = Date.now();
        this.tickCount++;

        console.log(`\n${"=".repeat(60)}`);
        console.log(
          `[Runner] 🔄 TICK #${this.tickCount} START: ${new Date().toISOString()}`,
        );
        console.log(`${"=".repeat(60)}`);

        // Izvrši jedan tick
        const result = await this.orchestrator.step();

        const tickDuration = Date.now() - tickStart;

        // Log rezultate
        console.log(
          `\n[Runner] ✅ Tick #${this.tickCount} completed in ${tickDuration}ms`,
        );
        console.log(`[Runner] 📊 Stats:`);
        console.log(`  • Processed: ${result.processed} users`);
        console.log(`  • Decisions: ${result.decisions.length}`);
        console.log(`  • Errors: ${result.errors.length}`);

        // Ako ima odluka, logi ih
        if (result.decisions.length > 0) {
          console.log(`\n[Runner] 📋 Decisions made:`);
          result.decisions.forEach((decision, i) => {
            console.log(
              `  ${i + 1}. ${decision.type} ${this.formatDecision(decision)}`,
            );
          });
        }

        // Handle errors
        if (result.errors.length > 0) {
          this.consecutiveErrors++;
          console.error(
            `\n[Runner] ⚠️  Errors occurred (${this.consecutiveErrors} consecutive):`,
          );
          result.errors.forEach((err, i) =>
            console.error(`  ${i + 1}. ${err}`),
          );

          if (this.consecutiveErrors >= CONFIG.MAX_ERRORS_BEFORE_PAUSE) {
            console.error(
              `\n[Runner] 🛑 Too many consecutive errors, pausing for ${CONFIG.ERROR_PAUSE_MS}ms`,
            );
            await this.sleep(CONFIG.ERROR_PAUSE_MS);
            this.consecutiveErrors = 0;
          }
        } else {
          this.consecutiveErrors = 0;
        }

        // Log uptime stats
        const uptime = Date.now() - this.startTime.getTime();
        console.log(
          `\n[Runner] ⏱️  Uptime: ${this.formatUptime(uptime)} | Total ticks: ${this.tickCount}`,
        );
        console.log(`[Runner] 💤 Sleeping for ${CONFIG.TICK_INTERVAL_MS}ms...`);
        console.log(`${"=".repeat(60)}\n`);

        // Čekaj prije sljedećeg ticka
        await this.sleep(CONFIG.TICK_INTERVAL_MS);
      } catch (error) {
        this.consecutiveErrors++;
        console.error("\n" + "=".repeat(60));
        console.error("[Runner] 💥 CRITICAL ERROR in run loop:");
        console.error("=".repeat(60));
        console.error(error);

        if (this.consecutiveErrors >= CONFIG.MAX_ERRORS_BEFORE_PAUSE) {
          const pauseMs = CONFIG.ERROR_PAUSE_MS * 2;
          console.error(
            `\n[Runner] 🛑 Critical error threshold reached, pausing for ${pauseMs}ms`,
          );
          await this.sleep(pauseMs);
          this.consecutiveErrors = 0;
        } else {
          await this.sleep(CONFIG.TICK_INTERVAL_MS);
        }
      }
    }

    console.log("[Runner] 👋 Agent loop ended gracefully");
  }

  /**
   * Zaustavlja agent
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn("[Runner] ⚠️  Agent is not running");
      return;
    }

    console.log("\n[Runner] 🛑 Stopping agent...");
    this.isRunning = false;

    await this.sleep(CONFIG.SHUTDOWN_GRACE_PERIOD_MS);

    const totalUptime = Date.now() - this.startTime.getTime();
    console.log(`[Runner] ✅ Agent stopped gracefully`);
    console.log(`[Runner] 📊 Final stats:`);
    console.log(`  • Total uptime: ${this.formatUptime(totalUptime)}`);
    console.log(`  • Total ticks: ${this.tickCount}`);
  }

  /**
   * Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(
        `\n[Runner] 📢 Received ${signal}, initiating graceful shutdown...`,
      );
      await this.stop();
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    process.on("uncaughtException", (error) => {
      console.error("\n[Runner] 💥 Uncaught exception:");
      console.error(error);
      shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason) => {
      console.error("\n[Runner] 💥 Unhandled rejection:");
      console.error(reason);
      shutdown("unhandledRejection");
    });
  }

  // ============ HELPER METHODS ============

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private formatDecision(decision: any): string {
    switch (decision.type) {
      case "GENERATE_LESSON":
        return `- Topic: "${decision.topic}", Difficulty: ${decision.difficulty}`;
      case "GENERATE_QUIZ":
        return `- Topic: "${decision.topic}", Questions: ${decision.questionCount}`;
      case "UPDATE_MASTERY":
        return `- User: ${decision.userId}, Adjustment: +${decision.adjustment}`;
      case "WAIT":
        return `- Reason: ${decision.reason}`;
      default:
        return "";
    }
  }
}

/**
 * Bootstrap funkcija - inicijalizira sve dependencije
 */
async function bootstrap(): Promise<AgentRunner> {
  console.log("=".repeat(60));
  console.log("🔧 BOOTSTRAP: Initializing EduAgent dependencies...");
  console.log("=".repeat(60));

  try {
    // 1. Repositories
    console.log("\n📦 Creating repositories...");
    const repositories = createRepositories();
    console.log("  ✅ UserState Repository");
    console.log("  ✅ Quiz Repository");
    console.log("  ✅ Lesson Repository");
    console.log("  ✅ Memory Repository");

    // 2. Decision Engine
    console.log("\n🧠 Initializing Decision Engine...");
    const decisionEngine = new DecisionEngine();
    console.log("  ✅ Decision Engine ready");

    // 3. LLM Service
    console.log("\n🤖 Initializing LLM Service...");

    // TODO: Uncomment when LLM service is implemented
    // const apiKey = process.env.GROQ_API_KEY;
    // if (!apiKey) {
    //   throw new Error("GROQ_API_KEY not found in environment variables");
    // }
    // const llmService = new GroqLLMService(apiKey);
    // console.log("  ✅ Groq LLM Service connected");

    // Temporary mock LLM service
    const llmService = {
      async generateLesson(req: any) {
        console.log(`[Mock LLM] Generating lesson for: ${req.topic}`);
        return {
          title: `Introduction to ${req.topic}`,
          content: `This is a mock lesson about ${req.topic}. In a real implementation, this would be generated by Llama 3.`,
          keyPoints: ["Point 1", "Point 2", "Point 3"],
          estimatedMinutes: 15,
        };
      },
      async generateQuiz(req: any) {
        console.log(`[Mock LLM] Generating quiz for: ${req.topic}`);
        return {
          title: `${req.topic} Quiz`,
          questions: [
            {
              id: "q1",
              question: `Sample question about ${req.topic}?`,
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: 0,
              explanation: "This is a mock explanation.",
            },
          ],
        };
      },
      async analyzeErrors() {
        return ["Review basics", "Practice more"];
      },
    } as any;
    console.log("  ⚠️  Using Mock LLM Service (implement real service later)");

    // 4. Orchestrator
    console.log("\n🎭 Creating Agent Orchestrator...");
    const orchestrator = new AgentOrchestrator(
      repositories.userState,
      repositories.quiz,
      repositories.lesson,
      repositories.memory,
      llmService,
      decisionEngine,
    );
    console.log("  ✅ Orchestrator ready");

    // 5. Runner
    console.log("\n🏃 Creating Agent Runner...");
    const runner = new AgentRunner(orchestrator);
    console.log("  ✅ Runner ready");

    console.log("\n" + "=".repeat(60));
    console.log("✅ Bootstrap completed successfully!");
    console.log("=".repeat(60) + "\n");

    return runner;
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ Bootstrap failed:");
    console.error("=".repeat(60));
    console.error(error);
    throw error;
  }
}

// ============================================
// MAIN - Entry point
// ============================================

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🤖 EduAgent - Autonomous AI Tutor");
  console.log("=".repeat(60));
  console.log(`📅 Started: ${new Date().toLocaleString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(60));

  try {
    const runner = await bootstrap();
    await runner.start();
  } catch (error) {
    console.error("\n[Main] 💥 Failed to start agent:");
    console.error(error);
    process.exit(1);
  }
}

// Export za testiranje
export { AgentRunner, bootstrap };

// ============================================
// AUTO-START (uvijek pokreni kada se učita fajl)
// ============================================
main().catch((error) => {
  console.error("[Main] 💥 Fatal error:");
  console.error(error);
  process.exit(1);
});
