"use client";

import { useState } from "react";
import Link from "next/link";
import { RoadmapPath } from "~/components/roadmap/roadmap-path";
import { DayDetail } from "~/components/roadmap/day-detail";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import type { Day, Roadmap } from "~/server/db/schema";

interface RoadmapClientProps {
  roadmap: Roadmap;
  days: Day[];
  initialDay: Day;
  nextDay: Day | null;
}

export function RoadmapClient({ roadmap, days, initialDay, nextDay }: RoadmapClientProps) {
  const [selectedDay, setSelectedDay] = useState<Day>(initialDay);
  
  // Find next day relative to selected day
  const selectedNextDay = days.find(d => d.dayNumber === selectedDay.dayNumber + 1) ?? null;

  return (
    <div className="flex h-screen bg-white">
      {/* LEFT: Roadmap Path */}
      <div className="flex-1 overflow-hidden bg-gray-50/50">
        <header className="flex h-16 items-center justify-between border-b px-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <h1 className="text-xl font-bold">{roadmap.topic}</h1>
              <p className="text-sm text-muted-foreground">
                Day {roadmap.currentDay} of {roadmap.totalDays}
              </p>
            </div>
          </div>
          <div className="h-2 w-32 rounded-full bg-gray-200">
            <div 
              className="h-full rounded-full bg-teal-600 transition-all"
              style={{ width: `${((roadmap.currentDay - 1) / roadmap.totalDays) * 100}%` }}
            />
          </div>
        </header>
        
        <ScrollArea className="h-[calc(100vh-64px)] w-full p-8">
          <div className="mx-auto max-w-2xl py-8">
            <RoadmapPath 
              days={days} 
              currentDay={roadmap.currentDay} 
              totalDays={roadmap.totalDays}
              selectedDayId={selectedDay.id}
              onDaySelect={setSelectedDay}
            />
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT: Detail Sidebar */}
      <div className="w-[420px] border-l bg-white shadow-sm">
        <DayDetail 
          day={selectedDay} 
          roadmapId={roadmap.id}
          nextDay={selectedNextDay}
          currentDayNumber={roadmap.currentDay}
        />
      </div>
    </div>
  );
}
