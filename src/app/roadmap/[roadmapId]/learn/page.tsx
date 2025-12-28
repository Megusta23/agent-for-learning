import { notFound } from "next/navigation";
import { RoadmapService } from "~/server/logic/services/roadmap-service";
import { db } from "~/server/db";
import { LessonContent } from "~/components/lesson/lesson-content";

interface LearnPageProps {
  params: Promise<{
    roadmapId: string;
  }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { roadmapId } = await params;
  const service = new RoadmapService(db);
  const data = await service.getRoadmapDetails(roadmapId);

  if (!data) {
    notFound();
  }

  const { days, ...roadmap } = data;
  
  // Get the current day (the one the user should be working on)
  const currentDay = days.find((d) => d.dayNumber === roadmap.currentDay);
  
  if (!currentDay) {
    notFound();
  }

  // Check if lesson already exists
  const dayData = await service.getDayWithLesson(currentDay.id);
  const existingLesson = dayData?.lesson ?? null;

  return (
    <LessonContent 
      day={currentDay} 
      roadmap={roadmap} 
      existingLesson={existingLesson}
    />
  );
}
