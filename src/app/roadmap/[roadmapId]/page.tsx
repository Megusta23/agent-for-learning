
import { notFound } from "next/navigation";
import { RoadmapService } from "~/server/logic/services/roadmap-service";
import { db } from "~/server/db";
import { RoadmapPath } from "~/components/roadmap/roadmap-path";
import { DayDetail } from "../../../components/roadmap/day-detail";
import { ScrollArea } from "../../../components/ui/scroll-area";

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

  return (
    <div className="flex h-screen bg-white">
      {/* LEFT: Roadmap Path (Snake Layout) */}
      <div className="flex-1 overflow-hidden bg-gray-50/50">
        <header className="flex h-16 items-center justify-between border-b px-8">
            <div>
                <h1 className="text-xl font-bold">{roadmap.topic}</h1>
                <p className="text-sm text-muted-foreground">Day {roadmap.currentDay} of {roadmap.totalDays}</p>
            </div>
            <div className="h-2 w-32 rounded-full bg-gray-200">
                <div 
                    className="h-full rounded-full bg-teal-600 transition-all"
                    style={{ width: `${(roadmap.currentDay / roadmap.totalDays) * 100}%` }}
                />
            </div>
        </header>
        
        <ScrollArea className="h-[calc(100vh-64px)] w-full p-8">
            <div className="mx-auto max-w-2xl py-12">
                <RoadmapPath 
                    days={days} 
                    currentDay={roadmap.currentDay} 
                    totalDays={roadmap.totalDays}
                />
            </div>
        </ScrollArea>
      </div>

      {/* RIGHT: Detail Sidebar */}
      <div className="w-[400px] border-l bg-white shadow-sm">
        {currentDay && <DayDetail day={currentDay} roadmapId={roadmap.id} />}
      </div>
    </div>
  );
}
