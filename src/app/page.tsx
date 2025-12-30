import { Search, User } from "lucide-react";
import { CreateRoadmapForm } from "~/components/roadmap/create-roadmap-form";
import { RoadmapCard } from "~/components/roadmap/roadmap-card";
import { getUserRoadmapsAction } from "~/server/actions/roadmap";

export default async function LearnFlowPage() {
  const roadmaps = await getUserRoadmapsAction();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="text-lg font-semibold">LearnFlow</div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm text-gray-700 hover:text-gray-900">
              Roadmaps
            </a>
            <a href="#" className="text-sm text-gray-700 hover:text-gray-900">
              Upgrade
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              <Search className="h-5 w-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <CreateRoadmapForm />

        {/* Learning Paths Section */}
        <div className="mt-24 space-y-6">
          <h2 className="text-3xl font-bold">Your paths</h2>

          {roadmaps.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                No learning paths yet. Create your first one above!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {roadmaps.map((roadmap) => (
                <RoadmapCard
                  key={roadmap.id}
                  id={roadmap.id}
                  title={roadmap.topic}
                  progress={roadmap.progress}
                  currentDay={roadmap.currentDay}
                  totalDays={roadmap.totalDays}
                  status={roadmap.status}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
