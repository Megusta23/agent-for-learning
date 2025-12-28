"use client";

import Link from "next/link";
import { BookOpen, Brain, Zap, PlayCircle, Lock, Eye, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Day } from "~/server/db/schema";

interface DayDetailProps {
  day: Day;
  roadmapId: string;
  nextDay: Day | null;
  currentDayNumber: number;
}

// Generate dynamic activities based on day number
function getDayActivities(dayNumber: number) {
  // Base reading time increases with day number
  const readingMinutes = Math.min(5 + (dayNumber - 1) * 2, 20);
  
  // Quiz questions increase progressively
  const quizQuestions = Math.min(3 + Math.floor((dayNumber - 1) / 2), 10);
  
  // Flashcards increase every few days
  const flashcardCount = Math.min(5 + Math.floor((dayNumber - 1) / 3) * 2, 15);
  
  // Some days have bonus activities
  const hasPracticeExercise = dayNumber >= 3 && dayNumber % 3 === 0;
  
  return {
    readingMinutes,
    quizQuestions,
    flashcardCount,
    hasPracticeExercise
  };
}

export function DayDetail({ day, roadmapId, nextDay, currentDayNumber }: DayDetailProps) {
  const isLocked = day.status === "locked";
  const isCompleted = day.status === "completed";
  const isCurrent = day.dayNumber === currentDayNumber;
  const isPast = day.dayNumber < currentDayNumber;
  
  const activities = getDayActivities(day.dayNumber);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">
            Day {day.dayNumber}
          </h2>
          {isCompleted && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              <CheckCircle className="h-3 w-3" />
              Completed
            </span>
          )}
          {isCurrent && (
            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
              Current
            </span>
          )}
          {isLocked && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              <Lock className="h-3 w-3" />
              Preview
            </span>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{day.topic}</h1>
        <p className="mt-2 text-gray-600">
          {day.description ?? "Topics for today will be generated..."}
        </p>
      </div>

      {/* Activities */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              {isLocked ? "What you'll do" : "Activities"}
            </h3>
            
            {/* Reading Material */}
            <div className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${isLocked ? "opacity-60 bg-gray-50" : "hover:bg-gray-50"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Reading Material</div>
                <div className="text-xs text-gray-500">
                  ~{activities.readingMinutes} min read
                </div>
              </div>
              {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
            </div>

            {/* Quiz */}
            <div className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${isLocked ? "opacity-60 bg-gray-50" : "hover:bg-gray-50"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Brain className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Daily Quiz</div>
                <div className="text-xs text-gray-500">
                  {activities.quizQuestions} questions to test your knowledge
                </div>
              </div>
              {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
            </div>

            {/* Flashcards */}
            <div className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${isLocked ? "opacity-60 bg-gray-50" : "hover:bg-gray-50"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Zap className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Flashcards</div>
                <div className="text-xs text-gray-500">
                  {activities.flashcardCount} cards to review concepts
                </div>
              </div>
              {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
            </div>

            {/* Practice Exercise (on certain days) */}
            {activities.hasPracticeExercise && (
              <div className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${isLocked ? "opacity-60 bg-gray-50" : "hover:bg-gray-50"}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <PlayCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Practice Exercise</div>
                  <div className="text-xs text-gray-500">
                    Hands-on practice to solidify learning
                  </div>
                </div>
                {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
            )}
          </div>

          {/* Coming Next Section */}
          {nextDay && !isLocked && (
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <ArrowRight className="h-4 w-4" />
                Coming Next
              </div>
              <div className="mt-2 font-medium text-gray-900">
                Day {nextDay.dayNumber}: {nextDay.topic}
              </div>
              {nextDay.description && (
                <div className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {nextDay.description}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="border-t p-6">
        {isLocked ? (
          <Button disabled className="w-full gap-2 bg-gray-400 text-lg">
            <Lock className="h-5 w-5" />
            Complete Day {currentDayNumber} to unlock
          </Button>
        ) : isCompleted ? (
          <Link href={`/roadmap/${roadmapId}/day/${day.id}`}>
            <Button className="w-full gap-2 bg-gray-600 text-lg hover:bg-gray-700">
              <Eye className="h-5 w-5" />
              Review Day {day.dayNumber}
            </Button>
          </Link>
        ) : (
          <Link href={`/roadmap/${roadmapId}/learn`}>
            <Button className="w-full gap-2 bg-teal-600 text-lg hover:bg-teal-700">
              <PlayCircle className="h-5 w-5" />
              Start Day {day.dayNumber}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
