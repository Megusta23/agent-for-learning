
"use client";

import React from "react";
import { Check, Lock, Play } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Day } from "~/server/db/schema";

interface RoadmapPathProps {
  days: Day[];
  currentDay: number;
  totalDays: number;
}

export function RoadmapPath({ days, currentDay, totalDays }: RoadmapPathProps) {
  // Simple vertical implementation for MVP, "snake" can be added with more complex SVG logic
  // based on index % 2 === 0 to switch directions.
  
  return (
    <div className="relative flex flex-col items-center gap-16">
      {/* Connecting Line (vertical for now) */}
      <div className="absolute bottom-0 left-1/2 top-0 -z-10 w-1 -translate-x-1/2 bg-gray-200" />

      {days.map((day, index) => {
         const isCompleted = day.dayNumber < currentDay;
         const isCurrent = day.dayNumber === currentDay;
         const isLocked = day.dayNumber > currentDay;

         return (
             <div key={day.id} className="relative flex w-full max-w-sm items-center justify-center">
                 <div className="relative">
                    {/* Node Circle */}
                    <div className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full border-4 text-white shadow-lg transition-all",
                        isCompleted ? "border-teal-600 bg-teal-600" :
                        isCurrent ? "border-teal-500 bg-white" :
                        "border-gray-200 bg-gray-100 text-gray-400"
                    )}>
                        {isCompleted && <Check className="h-8 w-8" />}
                        {isCurrent && <Play className="h-8 w-8 fill-teal-600 text-teal-600 pl-1" />}
                        {isLocked && <Lock className="h-6 w-6" />}
                    </div>
                    
                    {/* Label */}
                    <div className={cn(
                        "absolute top-full left-1/2 mt-3 -translate-x-1/2 whitespace-nowrap text-sm font-medium",
                        isCurrent ? "text-teal-700" : "text-gray-500"
                    )}>
                        Day {day.dayNumber}
                    </div>
                 </div>
             </div>
         )
      })}
    </div>
  );
}
