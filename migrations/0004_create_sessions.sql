-- Workspace sessions for interactive data canvas

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

CREATE INDEX IF NOT EXISTS idx_session_datasets_session ON session_datasets(session_id, position);
CREATE INDEX IF NOT EXISTS idx_join_suggestions_session ON join_suggestions(session_id, confidence DESC);
