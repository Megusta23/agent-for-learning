// Roadmap generation prompts for LLM

export function getRoadmapSystemPrompt(): string {
  return `You are an expert educational curriculum designer. Your task is to create structured, day-by-day learning roadmaps for any topic.

RULES:
1. Break down the topic into logical, progressive daily lessons
2. Each day should build on the previous one
3. Start with fundamentals and progress to advanced concepts
4. Each day should be achievable in the given daily time commitment
5. Include clear learning objectives for each day
6. Make topics specific and actionable, not vague

Return ONLY valid JSON in the exact format specified. No markdown, no extra text.`;
}

export function getRoadmapUserPrompt(
  topic: string,
  totalDays: number,
  dailyMinutes: number
): string {
  return `Create a ${totalDays}-day learning roadmap for: "${topic}"

Daily study time: ${dailyMinutes} minutes per day

Return a JSON object with this EXACT structure:
{
  "topic": "${topic}",
  "totalDays": ${totalDays},
  "days": [
    {
      "dayNumber": 1,
      "topic": "Day 1 specific topic title",
      "description": "Brief description of what will be covered",
      "objectives": ["objective 1", "objective 2", "objective 3"]
    },
    ... repeat for all ${totalDays} days
  ]
}

IMPORTANT:
- Generate exactly ${totalDays} days
- Each day should have 2-4 clear learning objectives
- Topics should progress logically from beginner to advanced
- Make descriptions concise but informative (1-2 sentences)
- Return ONLY the JSON, no other text`;
}
