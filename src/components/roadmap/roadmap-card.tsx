"use client";

import Link from "next/link";
import { Card } from "~/components/ui/card";

interface RoadmapCardProps {
  id: string;
  title: string;
  progress: number;
  currentDay: number;
  totalDays: number;
  status: string;
}

export function RoadmapCard({ 
  id, 
  title, 
  progress, 
  currentDay, 
  totalDays,
  status 
}: RoadmapCardProps) {
  const statusColors = {
    active: "bg-teal-100 text-teal-700",
    completed: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-600"
  };

  return (
    <Link href={`/roadmap/${id}`}>
      <Card className="group space-y-4 rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-teal-300 hover:shadow-md">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
            {title}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[status as keyof typeof statusColors] || statusColors.active}`}>
            {status}
          </span>
        </div>
        
        <div className="text-sm text-gray-500">
          Day {currentDay} of {totalDays}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-teal-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
