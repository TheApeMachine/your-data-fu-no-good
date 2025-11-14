-- Insight feedback table for learning from user preferences
CREATE SEQUENCE IF NOT EXISTS insight_feedback_id_seq START 1;

CREATE TABLE IF NOT EXISTS insight_feedback (
  id BIGINT PRIMARY KEY DEFAULT nextval('insight_feedback_id_seq'),
  analysis_id BIGINT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('thumbs_up', 'thumbs_down')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Note: Foreign key constraint omitted due to DuckDB limitations with existing tables
  -- Referential integrity maintained at application level
  UNIQUE(analysis_id, feedback_type)
);

CREATE INDEX IF NOT EXISTS idx_insight_feedback_analysis ON insight_feedback(analysis_id);
CREATE INDEX IF NOT EXISTS idx_insight_feedback_type ON insight_feedback(feedback_type);

