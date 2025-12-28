
/**
 * Prompts for generating flashcards
 */

export const getFlashcardSystemPrompt = (difficulty: number, count: number) => {
  const difficultyLevels = {
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert"
  };
  
  const level = difficultyLevels[difficulty as keyof typeof difficultyLevels] || "Intermediate";

  return `You are an expert educator creating flashcards for a ${level} level student.
Your goal is to create ${count} high-quality flashcards to help the student memorize key concepts.
Each flashcard must have a concise 'front' (question/term) and a clear 'back' (answer/definition).

Return ONLY valid JSON in the following format:
{
  "flashcards": {
    "topic": "Topic Name",
    "cards": [
      {
        "front": "Question or Term",
        "back": "Answer or Definition",
        "tags": ["tag1", "tag2"]
      }
    ]
  }
}`;
};

export const getFlashcardUserPrompt = (topic: string, count: number) => {
  return `Create ${count} flashcards for the topic: "${topic}".
Focus on key definitions, core concepts, and important facts.
Keep the content concise and easy to memorize.`;
};
