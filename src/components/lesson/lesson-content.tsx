"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ArrowLeft, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { startLearningAction, completeDayAction } from "~/server/actions/roadmap";
import type { Lesson, Day, Roadmap } from "~/server/db/schema";

interface LessonContentProps {
  day: Day;
  roadmap: Roadmap;
  existingLesson: Lesson | null;
}

export function LessonContent({ day, roadmap, existingLesson }: LessonContentProps) {
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(existingLesson);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleting, startCompleting] = useTransition();

  useEffect(() => {
    if (!lesson) {
      generateLesson();
    }
  }, []);

  const generateLesson = async () => {
    setIsGenerating(true);
    try {
      const generatedLesson = await startLearningAction(day.id);
      setLesson(generatedLesson ?? null);
    } catch (error) {
      console.error("Failed to generate lesson:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteDay = () => {
    startCompleting(async () => {
      try {
        await completeDayAction(roadmap.id, day.id);
        router.push(`/roadmap/${roadmap.id}`);
        router.refresh();
      } catch (error) {
        console.error("Failed to complete day:", error);
      }
    });
  };

  if (isGenerating) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-teal-600" />
          <h2 className="mt-4 text-xl font-semibold">Generating your lesson...</h2>
          <p className="mt-2 text-gray-600">Our AI tutor is preparing content for "{day.topic}"</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">Failed to load lesson. Please try again.</p>
          <Button onClick={generateLesson} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const keyPoints = JSON.parse(lesson.keyPoints || "[]") as string[];

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <button 
          onClick={() => router.push(`/roadmap/${roadmap.id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Roadmap
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          ~{lesson.estimatedMinutes} min read
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* Day indicator */}
          <div className="mb-4 text-sm font-medium uppercase tracking-wider text-teal-600">
            Day {day.dayNumber} of {roadmap.totalDays}
          </div>
          
          {/* Title */}
          <h1 className="mb-8 text-4xl font-bold text-gray-900">{lesson.title}</h1>

          {/* Key Points */}
          <div className="mb-8 rounded-xl bg-teal-50 p-6">
            <h3 className="mb-3 font-semibold text-teal-900">What you'll learn</h3>
            <ul className="space-y-2">
              {keyPoints.map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-teal-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lesson content in markdown */}
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-pre:bg-gray-900">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
        </div>
      </ScrollArea>

      {/* Footer with Complete button */}
      <footer className="border-t bg-gray-50 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Ready to continue?</p>
            <p className="text-sm text-gray-600">Mark this day as complete to unlock the next lesson</p>
          </div>
          <Button 
            onClick={handleCompleteDay}
            disabled={isCompleting}
            className="gap-2 bg-teal-600 hover:bg-teal-700"
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Complete Day {day.dayNumber}
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
