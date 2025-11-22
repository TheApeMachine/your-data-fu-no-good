import type { ColumnDefinition } from '../types';

export interface DerivedColumnMetadata {
  column_name: string;
  column_type: string;
  total_count: number;
  distinct_count?: number;
  null_count: number;
  mean_value?: number;
  stddev_value?: number;
  min_value?: number;
  max_value?: number;
  semantic_type?: string;
  is_identifier?: number;
  is_categorical?: number;
}

function normalizeRowCount(value: unknown): number {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function toColumnArray(value: unknown): ColumnDefinition[] {
  if (Array.isArray(value)) {
    return value as ColumnDefinition[];
  }
  if (value && typeof value === 'object' && Array.isArray((value as any).columns)) {
    return (value as any).columns as ColumnDefinition[];
  }
  return [];
}

function parseColumns(rawColumns: unknown): ColumnDefinition[] {
  if (!rawColumns) {
    return [];
  }
  if (Array.isArray(rawColumns)) {
    return rawColumns as ColumnDefinition[];
  }

  if (typeof rawColumns === 'string') {
    try {
      const parsed = JSON.parse(rawColumns);
      return toColumnArray(parsed);
    } catch {
      return [];
    }
  }

  if (typeof rawColumns === 'object') {
    return toColumnArray(rawColumns);
  }

  return [];
}

/**
 * Extracts column metadata from the dataset.columns JSON payload.
 */
export function extractColumnMetadata(
  rawColumns: unknown,
  rowCount: unknown = 0
): DerivedColumnMetadata[] {
  const totalRows = normalizeRowCount(rowCount);
  const columns = parseColumns(rawColumns);

  if (!columns.length) {
    return [];
  }

  return columns.map((column) => {
    const profile = column.profile;
    const stats = profile?.stats;

    const totalCount = normalizeRowCount(profile?.total_count ?? totalRows);
    const nonNullCount = normalizeRowCount(profile?.non_null_count ?? (totalCount || totalRows));
    const nullCount = profile?.null_count !== undefined
      ? normalizeRowCount(profile?.null_count)
      : Math.max(0, totalCount - nonNullCount);

    return {
      column_name: column.name,
      column_type: column.type,
      total_count: totalCount || totalRows,
      distinct_count: profile?.unique_count ?? column.unique_count,
      null_count: nullCount,
      mean_value: stats?.mean,
      stddev_value: stats?.stddev,
      min_value: stats?.min,
      max_value: stats?.max,
      semantic_type: column.semantic_type ?? profile?.semantic_type,
      is_identifier: profile?.is_identifier ? 1 : 0,
      is_categorical: profile?.is_categorical ? 1 : 0,
    };
  });
}


