import { neon } from "@neondatabase/serverless";

export function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error(
            "DATABASE_URL is not set. Please add it to your environment variables."
        );
    }
    return neon(process.env.DATABASE_URL);
}
