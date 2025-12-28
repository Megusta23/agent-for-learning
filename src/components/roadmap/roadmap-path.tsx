"use client";

import React from "react";
import { Check, Lock, Play } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Day } from "~/server/db/schema";

interface RoadmapPathProps {
  days: Day[];
  currentDay: number;
  totalDays: number;
  selectedDayId: string;
  onDaySelect: (day: Day) => void;
}

export function RoadmapPath({ 
  days, 
  currentDay, 
  totalDays, 
  selectedDayId,
  onDaySelect 
}: RoadmapPathProps) {
  
  return (
    <div className="relative flex flex-col items-center gap-12">
      {/* Connecting Line (vertical) */}
      <div className="absolute bottom-0 left-1/2 top-0 -z-10 w-1 -translate-x-1/2 bg-gray-200" />

      {days.map((day) => {
         const isCompleted = day.status === "completed";
         const isCurrent = day.dayNumber === currentDay;
         const isLocked = day.status === "locked";
         const isSelected = day.id === selectedDayId;

         return (
           <button
             key={day.id}
             onClick={() => onDaySelect(day)}
             className={cn(
               "relative flex w-full max-w-md items-center gap-6 rounded-xl p-4 transition-all",
               isSelected ? "bg-white shadow-lg ring-2 ring-teal-500" : "hover:bg-white/50",
               isLocked && "cursor-default"
             )}
           >
             {/* Node Circle */}
             <div className={cn(
               "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-4 text-white shadow-md transition-all",
               isCompleted ? "border-teal-600 bg-teal-600" :
               isCurrent ? "border-teal-500 bg-white" :
               "border-gray-200 bg-gray-100 text-gray-400"
             )}>
               {isCompleted && <Check className="h-7 w-7" />}
               {isCurrent && <Play className="h-7 w-7 fill-teal-600 text-teal-600 pl-1" />}
               {isLocked && <Lock className="h-5 w-5" />}
             </div>
             
             {/* Day Info */}
             <div className="flex-1 text-left">
               <div className={cn(
                 "text-xs font-medium uppercase tracking-wider",
                 isCompleted ? "text-teal-600" :
                 isCurrent ? "text-teal-700" :
                 "text-gray-400"
               )}>
                 Day {day.dayNumber}
                 {isCompleted && <span className="ml-2">✓ Completed</span>}
                 {isCurrent && <span className="ml-2">• Current</span>}
                 {isLocked && <span className="ml-2">🔒 Locked</span>}
               </div>
               <div className={cn(
                 "mt-1 font-semibold",
                 isLocked ? "text-gray-400" : "text-gray-900"
               )}>
                 {day.topic}
               </div>
               {day.description && (
                 <div className={cn(
                   "mt-1 text-sm line-clamp-1",
                   isLocked ? "text-gray-300" : "text-gray-500"
                 )}>
                   {day.description}
                 </div>
               )}
             </div>
           </button>
         );
      })}
    </div>
  );
}
