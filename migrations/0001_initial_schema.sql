-- Datasets: Stores metadata about uploaded datasets
CREATE TABLE IF NOT EXISTS datasets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'csv' or 'json'
  row_count INTEGER DEFAULT 0,
  column_count INTEGER DEFAULT 0,
  columns TEXT NOT NULL, -- JSON array of column definitions
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  analysis_status TEXT DEFAULT 'pending', -- 'pending', 'analyzing', 'complete', 'error'
  cleaning_status TEXT DEFAULT 'pending',
  visualization_status TEXT DEFAULT 'pending'
);

-- Data rows: Stores actual data in flexible JSON format
CREATE TABLE IF NOT EXISTS data_rows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset_id INTEGER NOT NULL,
  row_number INTEGER NOT NULL,
  data TEXT NOT NULL, -- JSON object with column:value pairs
  is_cleaned INTEGER DEFAULT 0, -- 0 = original, 1 = cleaned
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

-- Analysis results: Stores insights and findings
CREATE TABLE IF NOT EXISTS analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset_id INTEGER NOT NULL,
  analysis_type TEXT NOT NULL, -- 'statistics', 'correlation', 'outlier', 'pattern', 'trend', 'clustering'
  column_name TEXT, -- NULL for dataset-wide analyses
  result TEXT NOT NULL, -- JSON with findings
  confidence REAL DEFAULT 0.0, -- 0.0 to 1.0
  explanation TEXT NOT NULL, -- Plain English explanation
  importance TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

-- Visualizations: Stores generated chart configurations
CREATE TABLE IF NOT EXISTS visualizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset_id INTEGER NOT NULL,
  analysis_id INTEGER, -- Link to specific analysis if applicable
  chart_type TEXT NOT NULL, -- 'bar', 'line', 'scatter', 'pie', 'histogram', 'heatmap'
  title TEXT NOT NULL,
  config TEXT NOT NULL, -- JSON chart.js configuration
  explanation TEXT NOT NULL, -- Why this visualization was chosen
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE SET NULL
);

-- Cleaning operations: Log of automated cleaning actions
CREATE TABLE IF NOT EXISTS cleaning_operations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset_id INTEGER NOT NULL,
  column_name TEXT NOT NULL,
  operation_type TEXT NOT NULL, -- 'fill_null', 'remove_outlier', 'type_conversion', 'normalize'
  description TEXT NOT NULL,
  rows_affected INTEGER DEFAULT 0,
  confidence REAL DEFAULT 0.0,
  applied INTEGER DEFAULT 1, -- 0 = suggested, 1 = applied
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_rows_dataset ON data_rows(dataset_id);
CREATE INDEX IF NOT EXISTS idx_analyses_dataset ON analyses(dataset_id);
CREATE INDEX IF NOT EXISTS idx_visualizations_dataset ON visualizations(dataset_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_ops_dataset ON cleaning_operations(dataset_id);
