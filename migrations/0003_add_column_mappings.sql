-- Add column mappings table for ID -> Name relationships
CREATE TABLE IF NOT EXISTS column_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset_id INTEGER NOT NULL,
  id_column TEXT NOT NULL,
  name_column TEXT NOT NULL,
  auto_detected INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  UNIQUE(dataset_id, id_column)
);

CREATE INDEX IF NOT EXISTS idx_column_mappings_dataset ON column_mappings(dataset_id);
