
"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import type { Quiz } from "~/server/db/schema";
import type { GeneratedQuiz } from "~/server/logic/core/types";

interface QuizCardProps {
  quiz: Quiz;
  onComplete?: (score: number) => void;
}

export function QuizCard({ quiz, onComplete }: QuizCardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Parse questions from JSON
  const questions = typeof quiz.questions === 'string' 
    ? JSON.parse(quiz.questions) as GeneratedQuiz['questions']
    : quiz.questions as unknown as GeneratedQuiz['questions'];

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
      return <div>Error loading question</div>;
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
    }
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
      if (onComplete) {
        onComplete(score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0));
      }
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-8 border-teal-100">
            <span className="text-3xl font-bold text-teal-600">{percentage}%</span>
          </div>
          <div className="text-center">
             <p className="text-lg font-medium">You scored {score} out of {questions.length}</p>
             <p className="text-muted-foreground mt-2">
               {percentage >= 80 ? "Great job! You've mastered this topic." : "Keep practicing to improve your score."}
             </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={handleRetry}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Quiz
          </Button>
          <Button onClick={() => window.location.reload()}> 
             Continue Learning
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
           <span className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</span>
           <span className="text-sm font-medium text-teal-600">Score: {score}</span>
        </div>
        <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup 
          onValueChange={(val) => !isAnswered && setSelectedAnswer(parseInt(val))}
          value={selectedAnswer?.toString()}
          disabled={isAnswered}
          className="space-y-3"
        >
          {currentQuestion.options.map((option, idx) => {
            let className = "flex items-center space-x-3 space-y-0 rounded-md border p-4 transition-all hover:bg-slate-50";
            
            if (isAnswered) {
               if (idx === currentQuestion.correctAnswer) {
                 className = "flex items-center space-x-3 space-y-0 rounded-md border border-green-200 bg-green-50";
               } else if (idx === selectedAnswer && idx !== currentQuestion.correctAnswer) {
                 className = "flex items-center space-x-3 space-y-0 rounded-md border border-red-200 bg-red-50";
               } else {
                  className = "flex items-center space-x-3 space-y-0 rounded-md border border-gray-100 opacity-50";
               }
            } else if (selectedAnswer === idx) {
              className = "flex items-center space-x-3 space-y-0 rounded-md border border-teal-500 bg-teal-50 ring-1 ring-teal-500";
            }

            return (
              <div key={idx} className={className}>
                <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="border-slate-400 text-teal-600 focus:ring-teal-600"/>
                <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer font-normal">
                  {option}
                </Label>
                {isAnswered && idx === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {isAnswered && idx === selectedAnswer && idx !== currentQuestion.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            );
          })}
        </RadioGroup>

        {isAnswered && (
          <div className={cn(
            "rounded-lg p-4 text-sm animate-in fade-in slide-in-from-top-2",
            selectedAnswer === currentQuestion.correctAnswer ? "bg-green-100 text-green-800" : "bg-blue-50 text-blue-800"
          )}>
            <div className="font-semibold mb-1">
              {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Explanation:"}
            </div>
            {currentQuestion.explanation}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end p-6 pt-0">
        {!isAnswered ? (
          <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className="w-full sm:w-auto">
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full sm:w-auto">
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                Next Question
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : "Finish Quiz"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
