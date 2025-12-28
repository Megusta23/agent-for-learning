
"use client";

import Link from "next/link";
import { BookOpen, Brain, Zap, PlayCircle, Lock } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Day } from "~/server/db/schema";

interface DayDetailProps {
  day: Day;
  roadmapId: string;
}

export function DayDetail({ day, roadmapId }: DayDetailProps) {
  const isLocked = day.status === "locked";
  const isCompleted = day.status === "completed";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-6">
        <div className="flex items-center gap-2">
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-500">Day {day.dayNumber}</h2>
          {isCompleted && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Completed
            </span>
          )}
          {isLocked && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              Locked
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{day.topic}</h1>
        <p className="mt-2 text-gray-600">{day.description ?? "Topics for today will be generated..."}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8">
            {/* Main Activities */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Activities</h3>
                
                <div className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${isLocked ? "opacity-50" : "hover:bg-gray-50"}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">Reading Material</div>
                        <div className="text-xs text-gray-500">5-10 min read</div>
                    </div>
                </div>

                <div className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${isLocked ? "opacity-50" : "hover:bg-gray-50"}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <Brain className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">Daily Quiz</div>
                        <div className="text-xs text-gray-500">Test your knowledge</div>
                    </div>
                </div>

                <div className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${isLocked ? "opacity-50" : "hover:bg-gray-50"}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">Flashcards</div>
                        <div className="text-xs text-gray-500">Review concepts</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="border-t p-6">
        {isLocked ? (
          <Button disabled className="w-full gap-2 bg-gray-400 text-lg">
            <Lock className="h-5 w-5" />
            Complete previous day to unlock
          </Button>
        ) : isCompleted ? (
          <Link href={`/roadmap/${roadmapId}/learn`}>
            <Button className="w-full gap-2 bg-green-600 text-lg hover:bg-green-700">
              <PlayCircle className="h-5 w-5" />
              Review Lesson
            </Button>
          </Link>
        ) : (
          <Link href={`/roadmap/${roadmapId}/learn`}>
            <Button className="w-full gap-2 bg-teal-600 text-lg hover:bg-teal-700">
              <PlayCircle className="h-5 w-5" />
              Start Learning
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

