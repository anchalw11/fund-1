/*
  # Add Mini-Challenge Access Limit System (SQLite Version)

  1. Changes
    - Create `mini_challenge_limits` table to track global access count
    - Create `mini_challenge_access_logs` table to track access attempts
    - Prevent access when limit of 100 users is reached

  2. Purpose
    - Limit mini-challenge scanner access to maximum 100 users
    - Track total access attempts with timestamps
    - Provide clear messaging when limit is reached
*/

-- Create table to track mini-challenge access limits
CREATE TABLE IF NOT EXISTS mini_challenge_limits (
  id TEXT PRIMARY KEY,
  total_access_count INTEGER NOT NULL DEFAULT 0,
  max_limit INTEGER NOT NULL DEFAULT 100,
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial record with 0 count and 100 limit (only if table is empty)
INSERT OR IGNORE INTO mini_challenge_limits (id, total_access_count, max_limit)
VALUES ('global_limit', 0, 100);

-- Create table to track individual access attempts
CREATE TABLE IF NOT EXISTS mini_challenge_access_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  user_ip TEXT,
  accessed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  granted INTEGER DEFAULT 0 -- 0 = false, 1 = true
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mini_challenge_access_logs_granted
  ON mini_challenge_access_logs(granted, accessed_at);

CREATE INDEX IF NOT EXISTS idx_mini_challenge_access_logs_email
  ON mini_challenge_access_logs(user_email);
