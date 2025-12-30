
"use client";

import { useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BookOpen, HelpCircle, Layers } from "lucide-react";
import { LessonContent } from "./lesson-content";
import { QuizCard } from "./quiz-card";
import { FlashcardDeck } from "./flashcard-deck";
import type { Lesson, Quiz, Flashcard } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { completeDayAction } from "~/server/actions/roadmap"; // Using existing action directly

interface ActivityViewProps {
  lesson: Lesson;
  quiz?: Quiz | null;
  flashcards?: Flashcard[];
  roadmapId: string;
  dayNumber: number;
}

export default function ActivityView({ lesson, quiz, flashcards = [], roadmapId, dayNumber }: ActivityViewProps) {
  // ... (useTransition hook remains the same)
  const [pending, startTransition] = useTransition();
  const handleComplete = () => {
        startTransition(async () => {
             await completeDayAction(roadmapId, lesson.dayId || "");
             // Redirect is handled in action or we can force it here
             window.location.href = `/roadmap/${roadmapId}`;
        });
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
       {/* ... (Header component remains the same, though removed in previous step for brevity, need to ensure it's kept or replaced) */}
       {/* Actually, I will replace the component content to be safe and clear. */}
       <div className="flex items-center justify-between mb-8">
            {/* Header Content */}
             <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{lesson.topic}</h1>
                <p className="text-slate-500">{lesson.title}</p>
             </div>
             <Button 
                onClick={handleComplete} 
                disabled={pending}
                className="bg-green-600 hover:bg-green-700 text-white"
            >
                {pending ? "Saving..." : "Complete Day"}
             </Button>
       </div>
       
      <Tabs defaultValue="lesson" className="w-full">
        {/* ... TabsList ... */}
         <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="lesson" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lesson
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Flashcards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lesson" className="focus-visible:outline-none perspective-none animate-in fade-in slide-in-from-bottom-4 duration-500">
           <LessonContent lesson={lesson} roadmapId={roadmapId} dayNumber={dayNumber} />
        </TabsContent>
        {/* ... other tabs ... */}


        <TabsContent value="quiz" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
           {quiz ? (
             <div className="py-4">
               <QuizCard quiz={quiz} />
             </div>
           ) : (
             <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
               No quiz available for this day.
             </div>
           )}
        </TabsContent>

        <TabsContent value="flashcards" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="py-4">
               <FlashcardDeck flashcards={flashcards} />
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
