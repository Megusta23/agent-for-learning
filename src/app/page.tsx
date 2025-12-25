"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Search, User, Upload, Link2, ArrowRight } from "lucide-react";
import { Slider } from "~/components/ui/slider";

export default function LearnFlowPage() {
  const [step, setStep] = useState<"input" | "constraints">("input");
  const [topicInput, setTopicInput] = useState("");
  const [dailyTime, setDailyTime] = useState([60]); // in minutes
  const [deadline, setDeadline] = useState([14]); // in days

  const handleTopicSubmit = () => {
    if (topicInput.trim()) {
      setStep("constraints");
    }
  };

  const handleGeneratePath = () => {
    // Handle path generation
    console.log("[v0] Generating learning path", { dailyTime, deadline });
  };

  // Convert minutes to display format
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? "1 hour" : `${hours} hours`;
  };

  // Convert days to display format
  const formatDeadline = (days: number) => {
    if (days < 7) return `${days} days`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return weeks === 1 ? "1 week" : `${Math.floor(days / 7)} weeks`;
    }
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  };

  // Calculate total study time
  const totalHours = Math.floor(
    ((dailyTime?.[0] ?? 0) * (deadline?.[0] ?? 0)) / 60,
  );

  const learningPaths = [
    { title: "Linear Algebra", progress: 40 },
    { title: "Python programming", progress: 70 },
    { title: "Formal methods", progress: 10 },
  ];

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
        {step === "input" ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="space-y-3 text-center">
              <h1 className="text-5xl font-bold text-balance">
                What do you want to learn?
              </h1>
              <p className="text-gray-600">
                Upload material or describe your topic
              </p>
            </div>

            {/* Main Input */}
            <div className="relative">
              <Input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTopicSubmit();
                }}
                placeholder="e.g., Linear Algebra, Python Programming..."
                className="h-20 rounded-2xl border-gray-300 px-6 pr-14 text-base"
              />
              <button
                onClick={handleTopicSubmit}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Upload Options */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-start gap-2 rounded-2xl border border-gray-300 bg-white p-6 text-left transition-colors hover:border-gray-400">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-gray-700" />
                  <span className="font-medium text-gray-900">
                    Upload your material
                  </span>
                </div>
                <span className="text-sm text-gray-600">Book, PDF</span>
              </button>

              <button className="flex flex-col items-start gap-2 rounded-2xl border border-gray-300 bg-white p-6 text-left transition-colors hover:border-gray-400">
                <div className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-gray-700" />
                  <span className="font-medium text-gray-900">
                    Paste your material
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  Book chapter, notes, concepts
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Constraints Section */}
            <div className="space-y-3 text-center">
              <h1 className="text-5xl font-bold text-balance">
                Set your constraints
              </h1>
              <p className="text-gray-600">Define your study schedule</p>
            </div>

            <div className="space-y-10 py-8">
              {/* Daily Time Slider */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  How much time can you commit daily?
                </label>
                <div className="space-y-2">
                  <Slider
                    value={dailyTime}
                    onValueChange={setDailyTime}
                    min={30}
                    max={240}
                    step={30}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">30 mins</span>
                    <span className="font-semibold text-gray-900">
                      {dailyTime[0]} minutes
                    </span>
                    <span className="text-gray-500">4 hours</span>
                  </div>
                </div>
              </div>

              {/* Deadline Slider */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  What is your target deadline?
                </label>
                <div className="space-y-2">
                  <Slider
                    value={deadline}
                    onValueChange={setDeadline}
                    min={7}
                    max={90}
                    step={7}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">1 week</span>
                    <span className="font-semibold text-gray-900">
                      {deadline[0]} days
                    </span>
                    <span className="text-gray-500">3 months</span>
                  </div>
                </div>
              </div>

              {/* Total Study Time & CTA */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="text-sm text-gray-600">Total study time</div>
                  <div className="text-lg font-semibold">
                    {totalHours} hours over {deadline[0]} days
                  </div>
                </div>
                <Button
                  onClick={handleGeneratePath}
                  className="h-12 rounded-lg bg-teal-600 px-8 text-white hover:bg-teal-700"
                >
                  Generate My Path
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Learning Paths Section */}
        <div className="mt-24 space-y-6">
          <h2 className="text-3xl font-bold">Your paths</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {learningPaths.map((path) => (
              <Card
                key={path.title}
                className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6"
              >
                <h3 className="font-semibold text-gray-900">{path.title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{path.progress}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-teal-600 transition-all"
                      style={{ width: `${path.progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
