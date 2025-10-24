// Type definitions for the data intelligence platform

export type Bindings = {
  DB: D1Database;
};

export interface Dataset {
  id: number;
  name: string;
  original_filename: string;
  file_type: 'csv' | 'json';
  row_count: number;
  column_count: number;
  columns: ColumnDefinition[];
  upload_date: string;
  analysis_status: 'pending' | 'analyzing' | 'complete' | 'error';
  cleaning_status: 'pending' | 'analyzing' | 'complete' | 'error';
  visualization_status: 'pending' | 'analyzing' | 'complete' | 'error';
}

export interface ColumnDefinition {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  nullable: boolean;
  unique_count?: number;
  sample_values?: any[];
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
  analysis_type: 'statistics' | 'correlation' | 'outlier' | 'pattern' | 'trend' | 'clustering';
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
