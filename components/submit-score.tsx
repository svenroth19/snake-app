"use client";

import { useState, useRef, useEffect } from "react";

interface SubmitScoreProps {
  score: number;
  onSubmitted: () => void;
  onCancel: () => void;
}

export default function SubmitScore({
  score,
  onSubmitted,
  onCancel,
}: SubmitScoreProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("ENTER YOUR NAME");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/high-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_name: name.trim(), score }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save score");
      }

      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message.toUpperCase() : "SAVE FAILED");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 p-6 border border-border rounded-lg bg-card max-w-xs w-full mx-4"
      >
        <h3 className="text-xs text-primary">SAVE SCORE</h3>
        <p className="text-2xl text-accent">{score}</p>

        <div className="w-full">
          <label htmlFor="player-name" className="sr-only">
            Player Name
          </label>
          <input
            ref={inputRef}
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="YOUR NAME"
            className="w-full bg-input border border-border rounded px-3 py-2 text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center font-sans"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <p className="text-[8px] text-destructive">{error}</p>
        )}

        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 text-[9px] border border-border text-muted-foreground rounded hover:bg-secondary transition-colors disabled:opacity-50"
          >
            SKIP
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 text-[9px] border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "SAVING..." : "SAVE"}
          </button>
        </div>
      </form>
    </div>
  );
}
