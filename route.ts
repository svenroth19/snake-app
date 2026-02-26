import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const sql = getDb();
        const scores = await sql`
      SELECT id, player_name, score, created_at
      FROM high_scores
      ORDER BY score DESC
      LIMIT 10
    `;
        return NextResponse.json(scores);
    } catch (error) {
        console.error("Failed to fetch high scores:", error);
        return NextResponse.json(
            { error: "Failed to fetch high scores" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { player_name, score } = await request.json();

        if (
            !player_name ||
            typeof player_name !== "string" ||
            player_name.trim().length === 0
        ) {
            return NextResponse.json(
                { error: "Player name is required" },
                { status: 400 }
            );
        }

        if (!score || typeof score !== "number" || score < 1) {
            return NextResponse.json(
                { error: "Valid score is required" },
                { status: 400 }
            );
        }

        const sanitizedName = player_name.trim().slice(0, 20);

        const sql = getDb();
        const result = await sql`
      INSERT INTO high_scores (player_name, score)
      VALUES (${sanitizedName}, ${score})
      RETURNING id, player_name, score, created_at
    `;

        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error("Failed to save high score:", error);
        return NextResponse.json(
            { error: "Failed to save high score" },
            { status: 500 }
        );
    }
}
