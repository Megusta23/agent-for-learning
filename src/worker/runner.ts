// src/worker/runner.ts
// =====================================================
// AUTONOMOUS AGENT RUNNER - Zaseban Node.js proces
// =====================================================

import { AgentOrchestrator } from "../server/logic/services/agent-orchestrator";
import { DecisionEngine } from "../server/logic/services/decision-engine";

// Import repository implementacija (trebat će ih kreirati)
// import { DrizzleUserStateRepository } from "./repositories/user-state-repository";
// import { DrizzleLessonRepository } from "./repositories/lesson-repository";
// ... etc

/**
 * Konfiguracija runnera
 */
const CONFIG = {
  TICK_INTERVAL_MS: 30000, // 30 sekundi između tickova
  MAX_ERRORS_BEFORE_PAUSE: 5,
  ERROR_PAUSE_MS: 60000, // 1 minuta pauze nakon grešaka
  SHUTDOWN_GRACE_PERIOD_MS: 5000,
};

/**
 * Agent Runner klasa
 * Upravlja životnim ciklusom agenta
 */
class AgentRunner {
  private isRunning = false;
  private consecutiveErrors = 0;
  private orchestrator: AgentOrchestrator;

  constructor(orchestrator: AgentOrchestrator) {
    this.orchestrator = orchestrator;
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
    console.log("[Runner] 🚀 EduAgent starting...");
    console.log(`[Runner] ⏰ Tick interval: ${CONFIG.TICK_INTERVAL_MS}ms`);

    await this.runLoop();
  }

  /**
   * Glavna petlja agenta
   */
  private async runLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        const tickStart = Date.now();
        console.log(
          `\n[Runner] 🔄 ========== TICK START: ${new Date().toISOString()} ==========`,
        );

        // Izvrši jedan tick
        const result = await this.orchestrator.step();

        const tickDuration = Date.now() - tickStart;
        console.log(`[Runner] ✅ Tick completed in ${tickDuration}ms`);
        console.log(
          `[Runner] 📊 Stats: ${result.processed} processed, ${result.errors.length} errors`,
        );

        // Ako ima grešaka, logi ih detaljno
        if (result.errors.length > 0) {
          this.consecutiveErrors++;
          console.error(`[Runner] ⚠️  Errors in tick:`);
          result.errors.forEach((err, i) =>
            console.error(`  ${i + 1}. ${err}`),
          );

          // Ako ima previše uzastopnih grešaka, pauziraj
          if (this.consecutiveErrors >= CONFIG.MAX_ERRORS_BEFORE_PAUSE) {
            console.error(
              `[Runner] 🛑 Too many consecutive errors (${this.consecutiveErrors}), pausing for ${CONFIG.ERROR_PAUSE_MS}ms`,
            );
            await this.sleep(CONFIG.ERROR_PAUSE_MS);
            this.consecutiveErrors = 0; // Reset counter
          }
        } else {
          this.consecutiveErrors = 0; // Reset ako nema grešaka
        }

        console.log(`[Runner] 💤 Sleeping for ${CONFIG.TICK_INTERVAL_MS}ms...`);
        console.log(`[Runner] ========== TICK END ==========\n`);

        // Čekaj prije sljedećeg ticka
        await this.sleep(CONFIG.TICK_INTERVAL_MS);
      } catch (error) {
        this.consecutiveErrors++;
        console.error("[Runner] 💥 CRITICAL ERROR in run loop:");
        console.error(error);

        // Ako je kritična greška, pauziraj duže
        if (this.consecutiveErrors >= CONFIG.MAX_ERRORS_BEFORE_PAUSE) {
          console.error(
            `[Runner] 🛑 Critical error threshold reached, pausing for ${CONFIG.ERROR_PAUSE_MS * 2}ms`,
          );
          await this.sleep(CONFIG.ERROR_PAUSE_MS * 2);
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

    console.log("[Runner] 🛑 Stopping agent...");
    this.isRunning = false;

    // Daj vremena za završetak trenutnog ticka
    await this.sleep(CONFIG.SHUTDOWN_GRACE_PERIOD_MS);
    console.log("[Runner] ✅ Agent stopped");
  }

  /**
   * Setup graceful shutdown na SIGINT i SIGTERM
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

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("[Runner] 💥 Uncaught exception:");
      console.error(error);
      shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason) => {
      console.error("[Runner] 💥 Unhandled rejection:");
      console.error(reason);
      shutdown("unhandledRejection");
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Bootstrap funkcija - inicijalizira sve dependencije
 */
async function bootstrap(): Promise<AgentRunner> {
  console.log("[Bootstrap] 🔧 Initializing dependencies...");

  // TODO: Inicijaliziraj database connection (Drizzle)
  // const db = await initializeDatabase();

  // TODO: Kreiraj repository implementacije
  // const userStateRepo = new DrizzleUserStateRepository(db);
  // const quizRepo = new DrizzleQuizRepository(db);
  // const lessonRepo = new DrizzleLessonRepository(db);
  // const memoryRepo = new DrizzleAgentMemoryRepository(db);

  // TODO: Inicijaliziraj LLM service (Groq/Together AI)
  // const llmService = new LlamaLLMService(process.env.GROQ_API_KEY!);

  // Kreiraj Decision Engine (nema dependencija)
  const decisionEngine = new DecisionEngine();

  // Kreiraj Orchestrator sa svim dependencijama
  // const orchestrator = new AgentOrchestrator(
  //   userStateRepo,
  //   quizRepo,
  //   lessonRepo,
  //   memoryRepo,
  //   llmService,
  //   decisionEngine
  // );

  // Za sada mock orchestrator dok ne implementiraš sve
  const orchestrator = new AgentOrchestrator(
    null as any, // userStateRepo - implementirat ćemo
    null as any, // quizRepo
    null as any, // lessonRepo
    null as any, // memoryRepo
    null as any, // llmService
    decisionEngine,
  );

  console.log("[Bootstrap] ✅ Dependencies initialized");

  return new AgentRunner(orchestrator);
}

/**
 * MAIN - Entry point
 */
async function main() {
  console.log("=".repeat(60));
  console.log("🤖 EduAgent - Autonomous AI Tutor");
  console.log("=".repeat(60));

  try {
    const runner = await bootstrap();
    await runner.start();
  } catch (error) {
    console.error("[Main] 💥 Failed to start agent:");
    console.error(error);
    process.exit(1);
  }
}

// Pokreni ako je direktno izvršen
if (require.main === module) {
  main().catch((error) => {
    console.error("[Main] 💥 Fatal error:");
    console.error(error);
    process.exit(1);
  });
}

export { AgentRunner, bootstrap };
