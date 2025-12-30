
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { Flashcard } from "~/server/db/schema";

interface FlashcardDeckProps {
  flashcards: Flashcard[];
}

export function FlashcardDeck({ flashcards }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // If no cards, show empty state
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
        No flashcards available for this lesson.
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  if (!currentCard) {
    return null;
  }

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 200);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full max-w-md mx-auto py-8">
      <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
        <span>Card {currentIndex + 1} of {flashcards.length}</span>
        <span className="flex items-center gap-2">
            Click to flip
        </span>
      </div>

      <div 
        className="relative h-[300px] w-full cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <motion.div
          className="relative h-full w-full preserve-3d transition-transform duration-500"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT */}
          <Card className="absolute h-full w-full backface-hidden flex flex-col items-center justify-center p-8 text-center bg-white shadow-lg border-2 border-teal-50">
             <div className="text-xs font-semibold text-teal-600 mb-4 uppercase tracking-wider">Question</div>
             <div className="text-xl font-medium text-slate-800">
               {currentCard.front}
             </div>
          </Card>

          {/* BACK */}
          <Card 
            className="absolute h-full w-full backface-hidden flex flex-col items-center justify-center p-8 text-center bg-teal-50 shadow-lg border-2 border-teal-100"
            style={{ transform: "rotateY(180deg)" }}
          >
             <div className="text-xs font-semibold text-teal-600 mb-4 uppercase tracking-wider">Answer</div>
             <div className="text-lg text-slate-700">
               {currentCard.back}
             </div>
          </Card>
        </motion.div>
      </div>

      <div className="mt-8 flex items-center justify-between">
         <Button variant="outline" size="icon" onClick={handlePrev} disabled={flashcards.length <= 1}>
            <ChevronLeft className="h-4 w-4" />
         </Button>

         <div className="flex gap-2">
             <Button variant="ghost" size="sm" onClick={() => setIsFlipped(false)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
             </Button>
         </div>

         <Button variant="outline" size="icon" onClick={handleNext} disabled={flashcards.length <= 1}>
            <ChevronRight className="h-4 w-4" />
         </Button>
      </div>
    </div>
  );
}
