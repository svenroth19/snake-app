"use client";

import { useState, useCallback } from "react";
import { mutate } from "swr";
import SnakeGame from "@/components/snake-game";
import HighScores from "@/components/high-scores";
import SubmitScore from "@/components/submit-score";

export default function Home() {
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  const handleGameOver = useCallback((score: number) => {
    setLastScore(score);
    if (score > 0) {
      setShowSubmit(true);
    }
  }, []);

  const handleScoreSubmitted = useCallback(() => {
    setShowSubmit(false);
    mutate("/api/high-scores");
  }, []);

  const handleCancel = useCallback(() => {
    setShowSubmit(false);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 gap-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-lg text-primary tracking-wider mb-2 text-balance">
          SNAKE ARCADE
        </h1>
        <p className="text-[8px] text-muted-foreground">
          A CLASSIC REIMAGINED
        </p>
      </header>

      {/* Game */}
      <SnakeGame onGameOver={handleGameOver} />

      {/* High Scores */}
      <HighScores />

      {/* Submit Score Modal */}
      {showSubmit && lastScore !== null && (
        <SubmitScore
          score={lastScore}
          onSubmitted={handleScoreSubmitted}
          onCancel={handleCancel}
        />
      )}

      {/* Footer */}
      <footer className="text-[8px] text-muted-foreground mt-auto pb-4">
        BUILT WITH NEXT.JS + NEON
      </footer>
    </main>
  );
}
