import { notFound, redirect } from "next/navigation";
import { RoadmapService } from "~/server/logic/services/roadmap-service";
import { db } from "~/server/db";
import ActivityView from "~/components/lesson/activity-view";
// import { auth } from "@clerk/nextjs/server"; (Removed for demo)

interface LearnPageProps {
  params: Promise<{
    roadmapId: string;
  }>;
  searchParams: Promise<{
    dayId?: string;
  }>;
}

export default async function LearnPage({ params, searchParams }: LearnPageProps) {
  const { roadmapId } = await params;
  const { dayId } = await searchParams;

  if (!dayId) {
    redirect(`/roadmap/${roadmapId}`);
  }

  // DEMO MODE: Bypass auth
  // const { userId } = await auth();
  const userId = "user_default";
  
  /*
  if (!userId) {
     redirect("/sign-in");
  }
  */

  const service = new RoadmapService(db);
  const data = await service.getDayWithLesson(dayId);

  // If no content exists, generate it
  if (!data || !data.lesson) {
    try {
      await service.generateDayLesson(dayId, userId);
      // Re-fetch after generation
      const newData = await service.getDayWithLesson(dayId);
      if (!newData || !newData.lesson) {
          throw new Error("Failed to generate lesson");
      }
      return <ActivityView lesson={newData.lesson} quiz={newData.quiz} flashcards={newData.flashcards} roadmapId={roadmapId} dayNumber={newData.day.dayNumber} />;
    } catch (error) {
       console.error(error);
       return <div>Error generating lesson. Please try again.</div>;
    }
  }

  return <ActivityView lesson={data.lesson} quiz={data.quiz} flashcards={data.flashcards} roadmapId={roadmapId} dayNumber={data.day.dayNumber} />;
}
