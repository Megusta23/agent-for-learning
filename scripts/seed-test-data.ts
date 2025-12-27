// scripts/seed-test-data.ts
import { db } from "../src/server/db";
import {
  userLearningState,
  agentMemory,
  lessons,
  quizzes,
} from "../src/server/db/schema";
import { nanoid } from "nanoid";

async function seed() {
  console.log("🌱 Seeding database with test data...\n");

  try {
    // 1. Kreiraj test korisnike
    console.log("👤 Creating test users...");

    const testUsers = [
      {
        id: nanoid(),
        userId: "test-user-1",
        currentTopic: "JavaScript Basics",
        masteryLevel: 30,
        lastActivity: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25h ago
        needsAttention: true,
        recentScores: JSON.stringify([70, 65, 80]),
      },
      {
        id: nanoid(),
        userId: "test-user-2",
        currentTopic: "React Hooks",
        masteryLevel: 60,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
        needsAttention: false,
        recentScores: JSON.stringify([85, 90, 88]),
      },
      {
        id: nanoid(),
        userId: "test-user-3",
        currentTopic: "TypeScript Advanced",
        masteryLevel: 85,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30min ago
        needsAttention: false,
        recentScores: JSON.stringify([95, 92, 100, 88, 90]),
      },
    ];

    for (const user of testUsers) {
      await db.insert(userLearningState).values(user);
      console.log(
        `  ✅ Created user: ${user.userId} (mastery: ${user.masteryLevel}%)`,
      );
    }

    // 2. Kreiraj agent memory
    console.log("\n🧠 Creating agent memories...");

    for (const user of testUsers) {
      await db.insert(agentMemory).values({
        id: nanoid(),
        userId: user.userId,
        learningPatterns: JSON.stringify({
          bestTimeOfDay: "14:00",
          averageSessionLength: 25,
          preferredDifficulty: Math.floor(user.masteryLevel / 25) + 1,
        }),
        historicalPerformance: JSON.stringify([
          {
            topic: user.currentTopic,
            averageScore: user.masteryLevel,
            attempts: 5,
          },
        ]),
        lastUpdated: new Date(),
      });
      console.log(`  ✅ Created memory for: ${user.userId}`);
    }

    // 3. Kreiraj sample lekcije
    console.log("\n📚 Creating sample lessons...");

    const sampleLessons = [
      {
        id: nanoid(),
        userId: "test-user-1",
        topic: "JavaScript Basics",
        title: "Variables and Data Types",
        content:
          "# Variables in JavaScript\n\nJavaScript uses `let`, `const`, and `var` to declare variables...",
        keyPoints: JSON.stringify([
          "Use let for variables that change",
          "Use const for constants",
          "Avoid var in modern JavaScript",
        ]),
        difficulty: 1,
        estimatedMinutes: 10,
        completed: true,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: nanoid(),
        userId: "test-user-2",
        topic: "React Hooks",
        title: "Understanding useState",
        content:
          "# useState Hook\n\nThe useState hook allows you to add state to functional components...",
        keyPoints: JSON.stringify([
          "useState returns an array with state and setter",
          "State updates trigger re-renders",
          "Use functional updates for state based on previous state",
        ]),
        difficulty: 2,
        estimatedMinutes: 15,
        completed: false,
      },
    ];

    for (const lesson of sampleLessons) {
      await db.insert(lessons).values(lesson);
      console.log(`  ✅ Created lesson: "${lesson.title}"`);
    }

    // 4. Kreiraj sample kvizove
    console.log("\n📝 Creating sample quizzes...");

    const sampleQuizzes = [
      {
        id: nanoid(),
        userId: "test-user-1",
        topic: "JavaScript Basics",
        title: "Variables Quiz",
        questions: JSON.stringify([
          {
            id: "q1",
            question: "Which keyword creates a block-scoped variable?",
            options: ["var", "let", "const", "all of the above"],
            correctAnswer: 1,
            explanation:
              "let creates a block-scoped variable that can be reassigned.",
          },
          {
            id: "q2",
            question: "What happens if you try to reassign a const variable?",
            options: [
              "Nothing, it works fine",
              "A warning is shown",
              "A TypeError is thrown",
              "The value changes",
            ],
            correctAnswer: 2,
            explanation:
              "Attempting to reassign a const variable throws a TypeError.",
          },
        ]),
        difficulty: 1,
        completed: true,
        score: 1,
        totalQuestions: 2,
        completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      },
    ];

    for (const quiz of sampleQuizzes) {
      await db.insert(quizzes).values(quiz);
      console.log(
        `  ✅ Created quiz: "${quiz.title}" (score: ${quiz.score}/${quiz.totalQuestions})`,
      );
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Seeding completed successfully!");
    console.log("=".repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`  • ${testUsers.length} test users created`);
    console.log(`  • ${testUsers.length} agent memories created`);
    console.log(`  • ${sampleLessons.length} sample lessons created`);
    console.log(`  • ${sampleQuizzes.length} sample quizzes created`);
    console.log(`\n🚀 Ready to test! Run: npm run agent:dev\n`);
  } catch (error) {
    console.error("\n❌ Error seeding database:");
    console.error(error);
    process.exit(1);
  }
}

seed()
  .then(() => {
    console.log("👋 Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:");
    console.error(error);
    process.exit(1);
  });
