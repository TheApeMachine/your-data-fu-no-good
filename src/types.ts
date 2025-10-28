// Type definitions for the data intelligence platform

import type { DatabaseBinding } from './storage/types';

export type Bindings = {
  DB: DatabaseBinding;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  MONGODB_CONNECTION_STRING?: string;
};

export interface Dataset {
  id: number;
  name: string;
  original_filename: string;
  file_type: 'csv' | 'json' | 'mongodb';
  row_count: number;
  column_count: number;
  columns: ColumnDefinition[];
  upload_date: string;
  analysis_status: 'pending' | 'analyzing' | 'complete' | 'error';
  cleaning_status: 'pending' | 'analyzing' | 'complete' | 'error';
  visualization_status: 'pending' | 'analyzing' | 'complete' | 'error';
  mongodb_config?: MongoDBConfig; // Optional MongoDB metadata
}

export interface MongoDBConfig {
  database: string;
  collection: string;
  query?: string; // JSON string of MongoDB query
  pipeline?: string; // JSON string of aggregation pipeline
}

export type ColumnBaseType = 'number' | 'string' | 'date' | 'datetime' | 'boolean';

export interface ColumnProfile {
  base_type: ColumnBaseType;
  semantic_type?: string;
  confidence: number;
  unique_count: number;
  unique_ratio: number;
  null_count: number;
  non_null_count: number;
  total_count: number;
  is_categorical?: boolean;
  is_identifier?: boolean;
  numeric_subtype?: 'integer' | 'float';
  sample_value?: any;
  sample_values?: any[];
  notes?: string[];
  stats?: {
    min?: number;
    max?: number;
    mean?: number;
    stddev?: number;
    skewness?: number;
  };
}

export interface ColumnDefinition {
  name: string;
  type: ColumnBaseType;
  nullable: boolean;
  unique_count?: number;
  sample_values?: any[];
  semantic_type?: string;
  profile?: ColumnProfile;
}

export interface DataRow {
  id: number;
  dataset_id: number;
  row_number: number;
  data: Record<string, any>;
  is_cleaned: boolean;
}

export interface Analysis {
  id: number;
  dataset_id: number;
  analysis_type: 'statistics' | 'correlation' | 'outlier' | 'anomaly' | 'pattern' | 'trend' | 'timeseries' | 'missing' | 'feature' | 'clustering';
  column_name?: string;
  result: any;
  confidence: number;
  explanation: string;
  importance: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface Visualization {
  id: number;
  dataset_id: number;
  analysis_id?: number;
  chart_type: 'bar' | 'line' | 'scatter' | 'pie' | 'histogram' | 'heatmap';
  title: string;
  config: any;
  explanation: string;
  display_order: number;
  created_at: string;
}

export interface CleaningOperation {
  id: number;
  dataset_id: number;
  column_name: string;
  operation_type: 'fill_null' | 'remove_outlier' | 'type_conversion' | 'normalize';
  description: string;
  rows_affected: number;
  confidence: number;
  applied: boolean;
  created_at: string;
}

export interface StatisticalSummary {
  count: number;
  mean?: number;
  median?: number;
  mode?: any;
  std_dev?: number;
  min?: any;
  max?: any;
  quartiles?: number[];
  null_count: number;
  unique_count: number;
}

export interface FeatureSuggestion {
  name: string;
  description: string;
  columns: string[];
  transformation: string;
  confidence: number;
  expected_benefit?: string;
  notes?: string[];
}
