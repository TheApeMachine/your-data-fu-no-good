-- Sequences for primary keys
CREATE SEQUENCE IF NOT EXISTS datasets_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS data_rows_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS analyses_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS visualizations_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cleaning_operations_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS column_mappings_id_seq START 1;

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id BIGINT PRIMARY KEY DEFAULT nextval('datasets_id_seq'),
  name TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  row_count INTEGER DEFAULT 0,
  column_count INTEGER DEFAULT 0,
  columns TEXT NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  analysis_status TEXT DEFAULT 'pending',
  cleaning_status TEXT DEFAULT 'pending',
  visualization_status TEXT DEFAULT 'pending'
);

-- Data rows
CREATE TABLE IF NOT EXISTS data_rows (
  id BIGINT PRIMARY KEY DEFAULT nextval('data_rows_id_seq'),
  dataset_id BIGINT NOT NULL,
  row_number INTEGER NOT NULL,
  data TEXT NOT NULL,
  is_cleaned INTEGER DEFAULT 0,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

-- Analyses
CREATE TABLE IF NOT EXISTS analyses (
  id BIGINT PRIMARY KEY DEFAULT nextval('analyses_id_seq'),
  dataset_id BIGINT NOT NULL,
  analysis_type TEXT NOT NULL,
  column_name TEXT,
  result TEXT NOT NULL,
  confidence REAL DEFAULT 0.0,
  explanation TEXT NOT NULL,
  importance TEXT DEFAULT 'medium',
  quality_score REAL DEFAULT 50.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

-- Visualizations
CREATE TABLE IF NOT EXISTS visualizations (
  id BIGINT PRIMARY KEY DEFAULT nextval('visualizations_id_seq'),
  dataset_id BIGINT NOT NULL,
  analysis_id BIGINT,
  chart_type TEXT NOT NULL,
  title TEXT NOT NULL,
  config TEXT NOT NULL,
  explanation TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id),
  FOREIGN KEY (analysis_id) REFERENCES analyses(id)
);

-- Cleaning operations
CREATE TABLE IF NOT EXISTS cleaning_operations (
  id BIGINT PRIMARY KEY DEFAULT nextval('cleaning_operations_id_seq'),
  dataset_id BIGINT NOT NULL,
  column_name TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  description TEXT NOT NULL,
  rows_affected INTEGER DEFAULT 0,
  confidence REAL DEFAULT 0.0,
  applied INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

-- Column mappings
CREATE TABLE IF NOT EXISTS column_mappings (
  id BIGINT PRIMARY KEY DEFAULT nextval('column_mappings_id_seq'),
  dataset_id BIGINT NOT NULL,
  id_column TEXT NOT NULL,
  name_column TEXT NOT NULL,
  auto_detected INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dataset_id, id_column),
  FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_data_rows_dataset ON data_rows(dataset_id);
CREATE INDEX IF NOT EXISTS idx_analyses_dataset ON analyses(dataset_id, quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_visualizations_dataset ON visualizations(dataset_id, display_order);
CREATE INDEX IF NOT EXISTS idx_cleaning_ops_dataset ON cleaning_operations(dataset_id);
CREATE INDEX IF NOT EXISTS idx_column_mappings_dataset ON column_mappings(dataset_id);
