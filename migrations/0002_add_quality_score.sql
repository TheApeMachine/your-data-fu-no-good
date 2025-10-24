-- Add quality score to analyses table
ALTER TABLE analyses ADD COLUMN quality_score REAL DEFAULT 50.0;

-- Add index for sorting by quality
CREATE INDEX IF NOT EXISTS idx_analyses_quality ON analyses(dataset_id, quality_score DESC);
