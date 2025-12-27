// src/server/db/repositories/index.ts
// =====================================================
// REPOSITORY EXPORTS & FACTORY FUNCTIONS
// =====================================================

export { DrizzleUserStateRepository } from "./user-state-repository";
export { DrizzleQuizRepository } from "./quiz-repository";
export { DrizzleLessonRepository } from "./lesson-repository";
export { DrizzleAgentMemoryRepository } from "./memory-repository";

// =====================================================
// FACTORY FUNCTION - Kreira sve repositories odjednom
// =====================================================

import { DrizzleUserStateRepository } from "./user-state-repository";
import { DrizzleQuizRepository } from "./quiz-repository";
import { DrizzleLessonRepository } from "./lesson-repository";
import { DrizzleAgentMemoryRepository } from "./memory-repository";

/**
 * Factory funkcija koja kreira sve repository instance
 * Koristi se u runner.ts bootstrap funkciji
 */
export function createRepositories() {
  return {
    userState: new DrizzleUserStateRepository(),
    quiz: new DrizzleQuizRepository(),
    lesson: new DrizzleLessonRepository(),
    memory: new DrizzleAgentMemoryRepository(),
  };
}

// =====================================================
// TYPE EXPORTS - Za type-safe usage
// =====================================================

import type {
  IUserStateRepository,
  IQuizRepository,
  ILessonRepository,
  IAgentMemoryRepository,
} from "../../logic/core/interfaces";

export type Repositories = {
  userState: IUserStateRepository;
  quiz: IQuizRepository;
  lesson: ILessonRepository;
  memory: IAgentMemoryRepository;
};
