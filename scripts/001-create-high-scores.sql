CREATE TABLE IF NOT EXISTS high_scores (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores (score DESC);
