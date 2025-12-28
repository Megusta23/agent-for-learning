
"use client";

import { BookOpen, Brain, Zap, PlayCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Day } from "~/server/db/schema";

interface DayDetailProps {
  day: Day;
  roadmapId: string;
}

export function DayDetail({ day, roadmapId }: DayDetailProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-6">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-500">Day {day.dayNumber}</h2>
        <h1 className="text-2xl font-bold text-gray-900">{day.topic}</h1>
        <p className="mt-2 text-gray-600">{day.description ?? "Topics for today will be generated..."}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8">
            {/* Main Activities */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Activities</h3>
                
                <div className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-gray-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">Reading Material</div>
                        <div className="text-xs text-gray-500">5-10 min read</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-gray-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <Brain className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">Daily Quiz</div>
                        <div className="text-xs text-gray-500">Test your knowledge</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-gray-50">
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
        <Button className="w-full gap-2 bg-teal-600 text-lg hover:bg-teal-700">
            <PlayCircle className="h-5 w-5" />
            Start Learning
        </Button>
      </div>
    </div>
  );
}
