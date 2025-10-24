// CSV Parser using PapaParse

import Papa from 'papaparse';

export function parseCSV(content: string): Record<string, any>[] {
  const result = Papa.parse(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors.slice(0, 5));
  }

  return result.data as Record<string, any>[];
}

export function inferColumnTypes(rows: Record<string, any>[]): Record<string, string> {
  if (rows.length === 0) return {};

  const columns = Object.keys(rows[0]);
  const types: Record<string, string> = {};

  for (const col of columns) {
    const samples = rows.slice(0, Math.min(100, rows.length)).map(r => r[col]);
    types[col] = inferType(samples);
  }

  return types;
}

function inferType(values: any[]): string {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'string';

  // PapaParse already does type conversion, so check actual types
  const numberCount = nonNullValues.filter(v => typeof v === 'number').length;
  if (numberCount === nonNullValues.length) return 'number';

  const boolCount = nonNullValues.filter(v => typeof v === 'boolean').length;
  if (boolCount === nonNullValues.length) return 'boolean';

  // Check if all are dates
  const dateCount = nonNullValues.filter(v => {
    if (typeof v === 'string') {
      const parsed = Date.parse(v);
      return !isNaN(parsed);
    }
    return false;
  }).length;
  if (dateCount === nonNullValues.length && dateCount > 0) return 'date';

  return 'string';
}
