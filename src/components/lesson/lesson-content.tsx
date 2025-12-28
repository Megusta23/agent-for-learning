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
  lesson: Lesson;
  roadmapId: string;
  dayNumber: number;
  totalDays?: number;
}

export function LessonContent({ lesson, roadmapId, dayNumber, totalDays = 30 }: LessonContentProps) {
  const router = useRouter();
  const [isCompleting, startCompleting] = useTransition();

  const handleCompleteDay = () => {
    startCompleting(async () => {
      try {
        await completeDayAction(roadmapId, lesson.dayId || "");
        router.push(`/roadmap/${roadmapId}`);
        router.refresh();
      } catch (error) {
        console.error("Failed to complete day:", error);
      }
    });
  };

  const keyPoints = JSON.parse(lesson.keyPoints || "[]") as string[];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* Day indicator */}
          <div className="mb-4 text-sm font-medium uppercase tracking-wider text-teal-600">
            Day {dayNumber} of {totalDays}
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
      <footer className="border-t bg-gray-50 px-6 py-4 mt-auto">
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
                Complete Day {dayNumber}
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
