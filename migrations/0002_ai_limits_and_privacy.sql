-- Atomic monthly quota and aggregate token accounting.
CREATE TABLE IF NOT EXISTS ai_monthly_usage (
 month TEXT PRIMARY KEY, calls INTEGER NOT NULL DEFAULT 0 CHECK(calls>=0)
);
CREATE TABLE IF NOT EXISTS ai_token_usage (
 month TEXT PRIMARY KEY, input_tokens INTEGER NOT NULL DEFAULT 0,
 output_tokens INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO ai_monthly_usage(month,calls)
 SELECT substr(day,1,7), SUM(calls) FROM ai_usage GROUP BY substr(day,1,7);
UPDATE events SET user_id=NULL WHERE kind='ai_answer';
