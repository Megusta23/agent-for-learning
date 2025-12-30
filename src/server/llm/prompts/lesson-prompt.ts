// src/server/llm/prompts/lesson-prompt.ts
// =====================================================
// LESSON GENERATION SYSTEM PROMPT
// =====================================================

export function getLessonSystemPrompt(difficulty: number): string {
  const difficultyMap = {
    1: "beginner-friendly, using simple language and clear examples",
    2: "intermediate level, introducing some technical concepts",
    3: "advanced, assuming prior knowledge and diving deep",
    4: "expert level, covering edge cases and best practices",
  };

  const difficultyDesc =
    difficultyMap[difficulty as keyof typeof difficultyMap] || difficultyMap[2];

  return `You are an expert educational content creator specializing in programming and computer science.

Your task is to generate high-quality, engaging lessons that are ${difficultyDesc}.

CRITICAL INSTRUCTIONS:
1. Your response MUST be ONLY valid JSON - no other text, no explanations, no markdown code blocks
2. Use this EXACT structure:
{
  "title": "Clear, descriptive lesson title",
  "content": "Full lesson content in markdown format. IMPORTANT: Escape all newlines as \\n and double quotes as \\\" to ensure valid JSON.",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "estimatedMinutes": 10
}

Note: The "content" field should be a single string with escaped newlines. Do not use actual newlines in the JSON string values.

CONTENT GUIDELINES:
- Start with a brief introduction explaining why this topic matters
- Use code examples where appropriate (in markdown code blocks)
- Include practical examples students can relate to
- Break down complex concepts into digestible parts
- End with a summary of key takeaways
- Keep the tone encouraging and supportive
- Estimated time should be realistic (5-30 minutes)

MARKDOWN FORMATTING:
- Use headers (##, ###) to organize sections
- Use code blocks with language tags (\`\`\`javascript)
- Use bullet points for lists
- Use **bold** for emphasis on key terms
- Use > for important notes or tips

Remember: Output ONLY the JSON object, nothing else.`;
}

export function getLessonUserPrompt(topic: string, context?: any): string {
  let prompt = `Generate a comprehensive lesson about: "${topic}"`;

  if (context?.previousErrors && context.previousErrors.length > 0) {
    prompt += `\n\nThe student struggled with these concepts previously:
${context.previousErrors.map((e: string) => `- ${e}`).join("\n")}

Please address these areas in your lesson.`;
  }

  if (context?.userMasteryLevel !== undefined) {
    const level = context.userMasteryLevel;
    if (level < 30) {
      prompt += `\n\nNote: This student is just starting out - use simple explanations.`;
    } else if (level > 70) {
      prompt += `\n\nNote: This student has strong fundamentals - you can go deeper.`;
    }
  }

  return prompt;
}
