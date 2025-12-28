// src/server/llm/llm-service.ts
// =====================================================
// GROQ LLM SERVICE - Besplatna LLM Integracija
// =====================================================

import Groq from "groq-sdk";
import type {
  ILLMService,
} from "../logic/core/interfaces";

import type {
  GeneratedLesson,
  GeneratedQuiz,
  GeneratedRoadmap,
  LLMGenerationRequest
} from "../logic/core/types";
import {
  getLessonSystemPrompt,
  getLessonUserPrompt,
} from "./prompts/lesson-prompt";
import { getQuizSystemPrompt, getQuizUserPrompt } from "./prompts/quiz-prompt";
import { getRoadmapSystemPrompt, getRoadmapUserPrompt } from "./prompts/roadmap-prompt";

/**
 * Groq LLM Service - Koristi besplatan Groq API
 * Model: llama-3.3-70b-versatile (najbolji za reasoning)
 */
export class GroqLLMService implements ILLMService {
  private client: Groq;
  private model = "llama-3.3-70b-versatile"; // Ili: "gemma2-9b-it" za brži response

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is required");
    }

    this.client = new Groq({ apiKey });
    console.log(`[LLM] ✅ Groq client initialized with model: ${this.model}`);
  }

  /**
   * Generiše lekciju pomoću Llama 3.3
   */
  async generateLesson(
    request: LLMGenerationRequest,
  ): Promise<GeneratedLesson> {
    console.log(
      `[LLM] 📖 Generating lesson: "${request.topic}" (difficulty: ${request.difficulty})`,
    );

    const systemPrompt = getLessonSystemPrompt(request.difficulty);
    const userPrompt = getLessonUserPrompt(request.topic, request.context);

    try {
      const startTime = Date.now();

      const completion = await this.client.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        stream: false,
      });

      const duration = Date.now() - startTime;
      const rawContent = completion.choices[0]?.message?.content || "";

      console.log(`[LLM] ⏱️  Generation completed in ${duration}ms`);

      // Parse JSON response
      const lesson = this.parseJSON<GeneratedLesson>(rawContent, "lesson");

      // Validate structure
      this.validateLesson(lesson);

      console.log(`[LLM] ✅ Lesson generated: "${lesson.title}"`);
      return lesson;
    } catch (error) {
      console.error("[LLM] ❌ Error generating lesson:");
      console.error(error);

      // Fallback: vraćamo basic lekciju ako LLM zakaže
      return this.createFallbackLesson(request.topic, request.difficulty);
    }
  }

  /**
   * Generiše kviz pomoću Llama 3.3
   */
  async generateQuiz(request: LLMGenerationRequest): Promise<GeneratedQuiz> {
    const questionCount = 5; // Default
    console.log(
      `[LLM] 📝 Generating quiz: "${request.topic}" (${questionCount} questions)`,
    );

    const systemPrompt = getQuizSystemPrompt(request.difficulty, questionCount);
    const userPrompt = getQuizUserPrompt(
      request.topic,
      request.difficulty,
      questionCount,
    );

    try {
      const startTime = Date.now();

      const completion = await this.client.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: this.model,
        temperature: 0.8, // Malo više kreativnosti za kvizove
        max_tokens: 1500,
        top_p: 1,
        stream: false,
      });

      const duration = Date.now() - startTime;
      const rawContent = completion.choices[0]?.message?.content || "";

      console.log(`[LLM] ⏱️  Generation completed in ${duration}ms`);

      // Parse JSON response
      const quiz = this.parseJSON<GeneratedQuiz>(rawContent, "quiz");

      // Validate structure
      this.validateQuiz(quiz);

      console.log(
        `[LLM] ✅ Quiz generated: "${quiz.title}" (${quiz.questions.length} questions)`,
      );
      return quiz;
    } catch (error) {
      console.error("[LLM] ❌ Error generating quiz:");
      console.error(error);

      // Fallback
      return this.createFallbackQuiz(request.topic, request.difficulty);
    }
  }

  /**
   * Analizira greške korisnika i vraća preporuke
   */
  async analyzeErrors(errors: string[], topic: string): Promise<string[]> {
    console.log(
      `[LLM] 🔍 Analyzing ${errors.length} errors for topic: ${topic}`,
    );

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an educational expert. Analyze student errors and provide 3-5 specific, actionable recommendations for improvement. Return ONLY a JSON array of strings.",
          },
          {
            role: "user",
            content: `Topic: ${topic}\n\nStudent errors:\n${errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}\n\nProvide recommendations as JSON array: ["recommendation 1", "recommendation 2", ...]`,
          },
        ],
        model: this.model,
        temperature: 0.6,
        max_tokens: 500,
      });

      const rawContent = completion.choices[0]?.message?.content || "[]";
      const recommendations = this.parseJSON<string[]>(
        rawContent,
        "recommendations",
      );

      console.log(
        `[LLM] ✅ Generated ${recommendations.length} recommendations`,
      );
      return recommendations;
    } catch (error) {
      console.error("[LLM] ❌ Error analyzing errors:");
      console.error(error);

      // Fallback recommendations
      return [
        "Review the fundamental concepts",
        "Practice with more examples",
        "Focus on understanding rather than memorization",
      ];
    }
  }

  /**
   * Generates a structured learning roadmap
   */
  async generateRoadmap(
    topic: string,
    totalDays: number,
    dailyMinutes: number
  ): Promise<GeneratedRoadmap> {
    console.log(
      `[LLM] 🗺️  Generating roadmap: "${topic}" (${totalDays} days, ${dailyMinutes} min/day)`
    );

    const systemPrompt = getRoadmapSystemPrompt();
    const userPrompt = getRoadmapUserPrompt(topic, totalDays, dailyMinutes);

    try {
      const startTime = Date.now();

      const completion = await this.client.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 4000, // Larger for roadmaps
        top_p: 1,
        stream: false,
      });

      const duration = Date.now() - startTime;
      const rawContent = completion.choices[0]?.message?.content || "";

      console.log(`[LLM] ⏱️  Roadmap generation completed in ${duration}ms`);

      // Parse JSON response
      const roadmap = this.parseJSON<GeneratedRoadmap>(rawContent, "roadmap");

      // Validate structure
      this.validateRoadmap(roadmap, totalDays);

      console.log(`[LLM] ✅ Roadmap generated with ${roadmap.days.length} days`);
      return roadmap;
    } catch (error) {
      console.error("[LLM] ❌ Error generating roadmap:");
      console.error(error);

      // Fallback
      return this.createFallbackRoadmap(topic, totalDays);
    }
  }

  /**
   * Validates roadmap structure
   */
  private validateRoadmap(roadmap: any, expectedDays: number): asserts roadmap is GeneratedRoadmap {
    if (!roadmap.topic || typeof roadmap.topic !== "string") {
      throw new Error("Invalid roadmap: missing or invalid topic");
    }
    if (!Array.isArray(roadmap.days) || roadmap.days.length === 0) {
      throw new Error("Invalid roadmap: missing or invalid days");
    }
    // Validate each day
    for (const day of roadmap.days) {
      if (typeof day.dayNumber !== "number" || !day.topic || !day.description) {
        throw new Error("Invalid roadmap: day missing required fields");
      }
    }
  }

  /**
   * Fallback roadmap if LLM fails
   */
  private createFallbackRoadmap(topic: string, totalDays: number): GeneratedRoadmap {
    console.log("[LLM] ⚠️  Using fallback roadmap");
    const days = [];
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        dayNumber: i,
        topic: `${topic} - Day ${i}`,
        description: `Study session ${i} for ${topic}. AI generation was unavailable.`,
        objectives: [
          "Review key concepts",
          "Practice exercises",
          "Self-assessment"
        ]
      });
    }
    return {
      topic,
      totalDays,
      days
    };
  }

  // ============ HELPER METHODS ============

  /**
   * Parsira JSON response od LLM-a
   * Pokušava ukloniti markdown backticks i druge česte greške
   */
  private parseJSON<T>(content: string, type: string): T {
    // Ukloni markdown code blocks
    let cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Ukloni potencijalni tekst prije/poslije JSON-a
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch (error) {
      console.error(`[LLM] ❌ Failed to parse ${type} JSON:`);
      console.error("Raw content:", content);
      console.error("Cleaned content:", cleaned);
      throw new Error(`Invalid JSON response for ${type}`);
    }
  }

  /**
   * Validira da li lesson ima sve potrebne fieldove
   */
  private validateLesson(lesson: any): asserts lesson is GeneratedLesson {
    if (!lesson.title || typeof lesson.title !== "string") {
      throw new Error("Invalid lesson: missing or invalid title");
    }
    if (!lesson.content || typeof lesson.content !== "string") {
      throw new Error("Invalid lesson: missing or invalid content");
    }
    if (!Array.isArray(lesson.keyPoints) || lesson.keyPoints.length === 0) {
      throw new Error("Invalid lesson: missing or invalid keyPoints");
    }
    if (
      typeof lesson.estimatedMinutes !== "number" ||
      lesson.estimatedMinutes <= 0
    ) {
      throw new Error("Invalid lesson: missing or invalid estimatedMinutes");
    }
  }

  /**
   * Validira da li quiz ima sve potrebne fieldove
   */
  private validateQuiz(quiz: any): asserts quiz is GeneratedQuiz {
    if (!quiz.title || typeof quiz.title !== "string") {
      throw new Error("Invalid quiz: missing or invalid title");
    }
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      throw new Error("Invalid quiz: missing or invalid questions");
    }

    // Validiraj svako pitanje
    for (const q of quiz.questions) {
      if (!q.question || !q.options || !Array.isArray(q.options)) {
        throw new Error("Invalid quiz: question missing required fields");
      }
      if (q.options.length !== 4) {
        throw new Error("Invalid quiz: question must have exactly 4 options");
      }
      if (
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        throw new Error("Invalid quiz: correctAnswer must be 0-3");
      }
    }
  }

  /**
   * Fallback lekcija ako LLM zakaže
   */
  private createFallbackLesson(
    topic: string,
    difficulty: number,
  ): GeneratedLesson {
    console.log("[LLM] ⚠️  Using fallback lesson");
    return {
      title: `Introduction to ${topic}`,
      content: `# ${topic}\n\nThis is a fallback lesson. The AI service was unavailable.\n\n## Overview\n\nThis topic covers important concepts in ${topic}. In a production environment, this would be a comprehensive, AI-generated lesson.\n\n## Key Concepts\n\n- Fundamental principles\n- Practical applications\n- Best practices\n\n## Summary\n\nThis is a demonstration lesson. Please try again later for AI-generated content.`,
      keyPoints: [
        "Understand the basics",
        "Apply concepts practically",
        "Follow best practices",
      ],
      estimatedMinutes: 10,
    };
  }

  /**
   * Fallback kviz ako LLM zakaže
   */
  private createFallbackQuiz(topic: string, difficulty: number): GeneratedQuiz {
    console.log("[LLM] ⚠️  Using fallback quiz");
    return {
      title: `${topic} Quiz`,
      questions: [
        {
          id: "q1",
          question: `What is a key concept in ${topic}?`,
          options: [
            "This is a fallback question",
            "Option B",
            "Option C",
            "Option D",
          ],
          correctAnswer: 0,
          explanation:
            "This is a fallback quiz. The AI service was unavailable.",
        },
      ],
    };
  }
}
