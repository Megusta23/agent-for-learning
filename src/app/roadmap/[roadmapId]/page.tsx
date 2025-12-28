
import { notFound } from "next/navigation";
import { RoadmapService } from "~/server/logic/services/roadmap-service";
import { db } from "~/server/db";
import { RoadmapClient } from "~/components/roadmap/roadmap-client";

interface RoadmapPageProps {
  params: Promise<{
    roadmapId: string;
  }>;
}

export default async function RoadmapPage({ params }: RoadmapPageProps) {
  const { roadmapId } = await params;
  const service = new RoadmapService(db);
  const data = await service.getRoadmapDetails(roadmapId);

  if (!data) {
    notFound();
  }

  const { days, ...roadmap } = data;
  const currentDay = days.find((d) => d.dayNumber === roadmap.currentDay) || days[0];
  const nextDay = days.find((d) => d.dayNumber === roadmap.currentDay + 1) ?? null;

  if (!currentDay) {
    notFound();
  }

  return (
    <RoadmapClient 
      roadmap={roadmap}
      days={days}
      initialDay={currentDay}
      nextDay={nextDay}
    />
  );
}
