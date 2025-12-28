"use client";

import { useState, useTransition } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Upload, Link2, ArrowRight } from "lucide-react";
import { Slider } from "~/components/ui/slider";
import { createRoadmapAction } from "~/server/actions/roadmap";

interface CreateRoadmapFormProps {
  onBack?: () => void;
}

export function CreateRoadmapForm({ onBack }: CreateRoadmapFormProps) {
  const [step, setStep] = useState<"input" | "constraints">("input");
  const [topicInput, setTopicInput] = useState("");
  const [dailyTime, setDailyTime] = useState([60]); // in minutes
  const [deadline, setDeadline] = useState([14]); // in days
  const [isPending, startTransition] = useTransition();

  const handleTopicSubmit = () => {
    if (topicInput.trim()) {
      setStep("constraints");
    }
  };

  const handleGeneratePath = () => {
    startTransition(async () => {
      try {
        await createRoadmapAction(topicInput, deadline[0] ?? 14, dailyTime[0] ?? 60);
      } catch (error) {
        console.error("Failed to generate path:", error);
      }
    });
  };

  // Calculate total study time
  const totalHours = Math.floor(
    ((dailyTime?.[0] ?? 0) * (deadline?.[0] ?? 0)) / 60,
  );

  if (step === "input") {
    return (
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
    );
  }

  return (
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
            disabled={isPending}
            className="h-12 rounded-lg bg-teal-600 px-8 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {isPending ? "Generating..." : "Generate My Path"}
          </Button>
        </div>
      </div>
    </div>
  );
}
