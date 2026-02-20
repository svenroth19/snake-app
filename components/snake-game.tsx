"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 3;
const MIN_SPEED = 60;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

interface SnakeGameProps {
  onGameOver: (score: number) => void;
}

export default function SnakeGame({ onGameOver }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const directionRef = useRef<Direction>("RIGHT");
  const nextDirectionRef = useRef<Direction>("RIGHT");
  const snakeRef = useRef<Position[]>([
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
  ]);
  const foodRef = useRef<Position>({ x: 15, y: 10 });
  const scoreRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);

  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle"
  );

  const generateFood = useCallback((): Position => {
    const snake = snakeRef.current;
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some((seg) => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const snake = snakeRef.current;
    const food = foodRef.current;

    // Background
    ctx.fillStyle = "#0a0f1a";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid lines (subtle)
    ctx.strokeStyle = "rgba(34, 197, 94, 0.06)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Snake body
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const brightness = Math.max(0.4, 1 - index * 0.03);

      if (isHead) {
        ctx.fillStyle = "#4ade80";
        ctx.shadowColor = "#22c55e";
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = `rgba(34, 197, 94, ${brightness})`;
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      const padding = isHead ? 1 : 2;
      ctx.fillRect(
        segment.x * CELL_SIZE + padding,
        segment.y * CELL_SIZE + padding,
        CELL_SIZE - padding * 2,
        CELL_SIZE - padding * 2
      );
    });

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Food
    ctx.fillStyle = "#facc15";
    ctx.shadowColor = "#eab308";
    ctx.shadowBlur = 10;
    const foodCenterX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const foodCenterY = food.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.beginPath();
    ctx.arc(foodCenterX, foodCenterY, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }, []);

  const gameLoop = useCallback(() => {
    const snake = [...snakeRef.current];
    directionRef.current = nextDirectionRef.current;
    const direction = directionRef.current;
    const head = { ...snake[0] };

    switch (direction) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
    }

    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameState("gameover");
      onGameOver(scoreRef.current);
      return;
    }

    // Self collision
    if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
      setGameState("gameover");
      onGameOver(scoreRef.current);
      return;
    }

    snake.unshift(head);

    // Eat food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      foodRef.current = generateFood();
      speedRef.current = Math.max(
        MIN_SPEED,
        speedRef.current - SPEED_INCREMENT
      );
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
    drawGame();

    gameLoopRef.current = setTimeout(gameLoop, speedRef.current);
  }, [drawGame, generateFood, onGameOver]);

  const startGame = useCallback(() => {
    snakeRef.current = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ];
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    foodRef.current = generateFood();
    scoreRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    setScore(0);
    setGameState("playing");
    drawGame();
    gameLoopRef.current = setTimeout(gameLoop, speedRef.current);
  }, [drawGame, gameLoop, generateFood]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === "idle" || gameState === "gameover") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          startGame();
          return;
        }
      }

      if (gameState !== "playing") return;

      const dir = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          if (dir !== "DOWN") nextDirectionRef.current = "UP";
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          if (dir !== "UP") nextDirectionRef.current = "DOWN";
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          if (dir !== "RIGHT") nextDirectionRef.current = "LEFT";
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          if (dir !== "LEFT") nextDirectionRef.current = "RIGHT";
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, startGame]);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState !== "playing") return;

      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const dir = directionRef.current;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && dir !== "LEFT") nextDirectionRef.current = "RIGHT";
        else if (dx < 0 && dir !== "RIGHT") nextDirectionRef.current = "LEFT";
      } else {
        if (dy > 0 && dir !== "UP") nextDirectionRef.current = "DOWN";
        else if (dy < 0 && dir !== "DOWN") nextDirectionRef.current = "UP";
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gameState]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, []);

  // Initial draw
  useEffect(() => {
    drawGame();
  }, [drawGame]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score display */}
      <div className="flex items-center justify-between w-full max-w-[400px] px-2">
        <span className="text-xs text-muted-foreground">SCORE</span>
        <span className="text-sm text-primary">{score}</span>
      </div>

      {/* Game canvas */}
      <div className="relative border-2 border-primary/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.15)]">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
          role="img"
          aria-label={`Snake game canvas. Score: ${score}. ${gameState === "idle" ? "Press Space to start" : gameState === "gameover" ? "Game over" : "Playing"}`}
        />

        {/* Overlay for idle / gameover */}
        {gameState !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            {gameState === "gameover" && (
              <p className="text-destructive text-xs mb-4">GAME OVER</p>
            )}
            {gameState === "gameover" && (
              <p className="text-primary text-sm mb-6">
                {score}
              </p>
            )}
            <button
              onClick={startGame}
              className="px-4 py-2 text-[10px] border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {gameState === "idle" ? "START GAME" : "PLAY AGAIN"}
            </button>
            <p className="text-[8px] text-muted-foreground mt-4">
              ARROW KEYS OR WASD
            </p>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="flex flex-col items-center gap-1 sm:hidden" aria-label="Mobile direction controls">
        <button
          onClick={() => {
            if (gameState === "playing" && directionRef.current !== "DOWN")
              nextDirectionRef.current = "UP";
          }}
          className="w-12 h-12 border border-border rounded flex items-center justify-center text-muted-foreground active:bg-primary/20"
          aria-label="Move up"
        >
          <span className="sr-only">Up</span>
          {"^"}
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => {
              if (gameState === "playing" && directionRef.current !== "RIGHT")
                nextDirectionRef.current = "LEFT";
            }}
            className="w-12 h-12 border border-border rounded flex items-center justify-center text-muted-foreground active:bg-primary/20"
            aria-label="Move left"
          >
            {"<"}
          </button>
          <button
            onClick={() => {
              if (gameState === "playing" && directionRef.current !== "UP")
                nextDirectionRef.current = "DOWN";
            }}
            className="w-12 h-12 border border-border rounded flex items-center justify-center text-muted-foreground active:bg-primary/20"
            aria-label="Move down"
          >
            {"v"}
          </button>
          <button
            onClick={() => {
              if (gameState === "playing" && directionRef.current !== "LEFT")
                nextDirectionRef.current = "RIGHT";
            }}
            className="w-12 h-12 border border-border rounded flex items-center justify-center text-muted-foreground active:bg-primary/20"
            aria-label="Move right"
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
}
