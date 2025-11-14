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
CREATE SEQUENCE IF NOT EXISTS workspace_sessions_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS join_suggestions_id_seq START 1;

CREATE TABLE IF NOT EXISTS workspace_sessions (
  id BIGINT PRIMARY KEY DEFAULT nextval('workspace_sessions_id_seq'),
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session_datasets (
  session_id BIGINT NOT NULL,
  dataset_id BIGINT NOT NULL,
  alias TEXT,
  position INTEGER DEFAULT 0,
  attached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (session_id, dataset_id),
  FOREIGN KEY (session_id) REFERENCES workspace_sessions(id),
  FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

CREATE TABLE IF NOT EXISTS session_state_snapshots (
  session_id BIGINT NOT NULL,
  version INTEGER DEFAULT 0,
  payload TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (session_id, version),
  FOREIGN KEY (session_id) REFERENCES workspace_sessions(id)
);

CREATE TABLE IF NOT EXISTS join_suggestions (
  id BIGINT PRIMARY KEY DEFAULT nextval('join_suggestions_id_seq'),
  session_id BIGINT NOT NULL,
  left_dataset_id BIGINT NOT NULL,
  right_dataset_id BIGINT NOT NULL,
  left_columns TEXT NOT NULL,
  right_columns TEXT NOT NULL,
  confidence REAL DEFAULT 0,
  sample TEXT,
  status TEXT DEFAULT 'suggested',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES workspace_sessions(id),
  FOREIGN KEY (left_dataset_id) REFERENCES datasets(id),
  FOREIGN KEY (right_dataset_id) REFERENCES datasets(id)
);

CREATE SEQUENCE IF NOT EXISTS forensic_events_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS forensic_cases_id_seq START 1;

CREATE TABLE IF NOT EXISTS forensic_events (
    id BIGINT PRIMARY KEY DEFAULT nextval('forensic_events_id_seq'),
    dataset_id BIGINT NOT NULL,
    session_id BIGINT,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',
    signal_score DOUBLE,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    summary TEXT,
    details JSON,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id),
    FOREIGN KEY (session_id) REFERENCES workspace_sessions(id)
);

CREATE TABLE IF NOT EXISTS forensic_cases (
    id BIGINT PRIMARY KEY DEFAULT nextval('forensic_cases_id_seq'),
    session_id BIGINT,
    primary_dataset_id BIGINT,
    case_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    severity TEXT NOT NULL DEFAULT 'medium',
    title TEXT,
    hypothesis TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evidence JSON,
    FOREIGN KEY (session_id) REFERENCES workspace_sessions(id),
    FOREIGN KEY (primary_dataset_id) REFERENCES datasets(id)
);

CREATE TABLE IF NOT EXISTS forensic_case_events (
    case_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    FOREIGN KEY (case_id) REFERENCES forensic_cases(id),
    FOREIGN KEY (event_id) REFERENCES forensic_events(id)
);

CREATE INDEX IF NOT EXISTS idx_data_rows_dataset ON data_rows(dataset_id);
CREATE INDEX IF NOT EXISTS idx_analyses_dataset ON analyses(dataset_id, quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_visualizations_dataset ON visualizations(dataset_id, display_order);
CREATE INDEX IF NOT EXISTS idx_cleaning_ops_dataset ON cleaning_operations(dataset_id);
CREATE INDEX IF NOT EXISTS idx_column_mappings_dataset ON column_mappings(dataset_id);

CREATE INDEX IF NOT EXISTS idx_session_datasets_session ON session_datasets(session_id, position);
CREATE INDEX IF NOT EXISTS idx_join_suggestions_session ON join_suggestions(session_id, confidence DESC);

CREATE INDEX IF NOT EXISTS idx_forensic_events_dataset ON forensic_events(dataset_id);
CREATE INDEX IF NOT EXISTS idx_forensic_events_session ON forensic_events(session_id);
CREATE INDEX IF NOT EXISTS idx_forensic_events_type ON forensic_events(event_type);

CREATE INDEX IF NOT EXISTS idx_forensic_cases_session ON forensic_cases(session_id);
CREATE INDEX IF NOT EXISTS idx_forensic_cases_status ON forensic_cases(status);

CREATE INDEX IF NOT EXISTS idx_forensic_case_events_event ON forensic_case_events(event_id);
