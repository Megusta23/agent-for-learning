"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2 } from "lucide-react";
import { Card } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { deleteRoadmapAction } from "~/server/actions/roadmap";

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
  const router = useRouter();
  const [isDeleting, startDeleting] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const statusColors = {
    active: "bg-teal-100 text-teal-700",
    completed: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-600"
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    startDeleting(async () => {
      try {
        await deleteRoadmapAction(id);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete roadmap:", error);
      }
    });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card className="group relative space-y-4 rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-teal-300 hover:shadow-md">
      {/* Dropdown Menu */}
      <div className="absolute top-4 right-4 z-10" onClick={handleMenuClick}>
        <DropdownMenu onOpenChange={() => setShowConfirm(false)}>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={handleDelete}
              className={`cursor-pointer ${showConfirm ? "bg-red-50 text-red-600 focus:bg-red-100 focus:text-red-700" : "text-red-600 focus:bg-red-50 focus:text-red-700"}`}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : showConfirm ? "Click to confirm" : "Delete roadmap"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card Content - Wrapped in Link */}
      <Link href={`/roadmap/${id}`} className="block">
        <div className="flex items-start justify-between pr-8">
          <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
            {title}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[status as keyof typeof statusColors] || statusColors.active}`}>
            {status}
          </span>
        </div>
        
        <div className="text-sm text-gray-500 mt-4">
          Day {currentDay} of {totalDays}
        </div>
        
        <div className="space-y-2 mt-4">
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
      </Link>
    </Card>
  );
}
