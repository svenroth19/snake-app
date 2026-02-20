"use client";

import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";

interface HighScore {
  id: number;
  player_name: string;
  score: number;
  created_at: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HighScores() {
  const { data: scores, isLoading } = useSWR<HighScore[]>(
    "/api/high-scores",
    fetcher,
    { refreshInterval: 10000 }
  );

  return (
    <div className="w-full max-w-md">
      <h2 className="text-xs text-primary mb-4 text-center">HIGH SCORES</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" role="status">
            <span className="sr-only">Loading scores</span>
          </div>
        </div>
      ) : !scores || scores.length === 0 ? (
        <p className="text-center text-muted-foreground text-[10px] py-8">
          NO SCORES YET. BE THE FIRST!
        </p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-[8px] text-muted-foreground text-left px-3 py-2 font-normal">
                  #
                </th>
                <th className="text-[8px] text-muted-foreground text-left px-3 py-2 font-normal">
                  PLAYER
                </th>
                <th className="text-[8px] text-muted-foreground text-right px-3 py-2 font-normal">
                  SCORE
                </th>
                <th className="text-[8px] text-muted-foreground text-right px-3 py-2 font-normal hidden sm:table-cell">
                  WHEN
                </th>
              </tr>
            </thead>
            <tbody>
              {scores.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`border-b border-border/50 last:border-b-0 ${
                    index === 0
                      ? "bg-primary/5"
                      : index < 3
                        ? "bg-accent/5"
                        : ""
                  }`}
                >
                  <td className="px-3 py-2 text-[10px]">
                    {index === 0 ? (
                      <span className="text-accent">1ST</span>
                    ) : index === 1 ? (
                      <span className="text-muted-foreground">2ND</span>
                    ) : index === 2 ? (
                      <span className="text-muted-foreground">3RD</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {index + 1}TH
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[10px] text-foreground">
                    {entry.player_name}
                  </td>
                  <td className="px-3 py-2 text-[10px] text-primary text-right">
                    {entry.score}
                  </td>
                  <td className="px-3 py-2 text-[8px] text-muted-foreground text-right hidden sm:table-cell">
                    {formatDistanceToNow(new Date(entry.created_at), {
                      addSuffix: true,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
