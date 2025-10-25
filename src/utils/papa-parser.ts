// CSV Parser using PapaParse with Streaming Support

import Papa from 'papaparse';

export interface ParseOptions {
  maxRows?: number;
  onProgress?: (progress: number) => void;
}

/**
 * Parse CSV with streaming for better memory efficiency
 * For Cloudflare Workers, we still need to load the full content,
 * but we process it in chunks to avoid blocking
 */
export function parseCSV(content: string, options: ParseOptions = {}): Record<string, any>[] {
  const { maxRows = 10000 } = options;
  
  const result = Papa.parse(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    preview: maxRows // Limit rows to prevent memory issues
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors.slice(0, 5));
  }

  return result.data as Record<string, any>[];
}

/**
 * Parse CSV in chunks for very large files
 * This prevents memory overflow by processing rows incrementally
 */
export async function parseCSVChunked(
  content: string,
  chunkSize: number = 1000,
  onChunk: (chunk: Record<string, any>[], progress: number) => Promise<void>
): Promise<number> {
  return new Promise((resolve, reject) => {
    let totalRows = 0;
    let currentChunk: Record<string, any>[] = [];

    Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      chunk: async (results, parser) => {
        try {
          // Add rows to current chunk
          currentChunk.push(...(results.data as Record<string, any>[]));
          
          // When chunk reaches size, process it
          if (currentChunk.length >= chunkSize) {
            parser.pause();
            await onChunk(currentChunk, totalRows);
            totalRows += currentChunk.length;
            currentChunk = [];
            parser.resume();
          }
        } catch (error) {
          parser.abort();
          reject(error);
        }
      },
      complete: async () => {
        try {
          // Process remaining rows
          if (currentChunk.length > 0) {
            await onChunk(currentChunk, totalRows);
            totalRows += currentChunk.length;
          }
          resolve(totalRows);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function inferColumnTypes(rows: Record<string, any>[]): Record<string, string> {
  if (rows.length === 0) return {};

  const columns = Object.keys(rows[0]);
  const types: Record<string, string> = {};

  for (const col of columns) {
    // Sample up to 100 rows for type inference
    const samples = rows.slice(0, Math.min(100, rows.length)).map(r => r[col]);
    types[col] = inferType(samples);
  }

  return types;
}

function inferType(values: any[]): string {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'string';

  // PapaParse already does type conversion, so check actual types
  const numberCount = nonNullValues.filter(v => typeof v === 'number' && !isNaN(v)).length;
  if (numberCount === nonNullValues.length) return 'number';

  const boolCount = nonNullValues.filter(v => typeof v === 'boolean').length;
  if (boolCount === nonNullValues.length) return 'boolean';

  // Enhanced date/datetime detection
  const dateInfo = detectDateType(nonNullValues);
  if (dateInfo.isDate && dateInfo.confidence > 0.8) {
    return dateInfo.hasTime ? 'datetime' : 'date';
  }

  return 'string';
}

/**
 * Detect if values are dates/datetimes with confidence scoring
 */
function detectDateType(values: any[]): { isDate: boolean; hasTime: boolean; confidence: number } {
  if (values.length === 0) return { isDate: false, hasTime: false, confidence: 0 };
  
  let validDateCount = 0;
  let hasTimeCount = 0;
  const stringValues = values.filter(v => typeof v === 'string');
  
  if (stringValues.length === 0) return { isDate: false, hasTime: false, confidence: 0 };
  
  // Common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,                           // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/,                         // MM/DD/YYYY or DD/MM/YYYY
    /^\d{4}\/\d{2}\/\d{2}$/,                         // YYYY/MM/DD
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,        // ISO 8601 datetime
    /^\d{2}-\d{2}-\d{4}$/,                           // DD-MM-YYYY or MM-DD-YYYY
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,                  // M/D/YY or M/D/YYYY
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,       // YYYY-MM-DD HH:MM:SS
    /^[A-Za-z]{3} \d{1,2}, \d{4}$/,                  // Jan 1, 2024
  ];
  
  for (const value of stringValues) {
    const trimmed = String(value).trim();
    
    // Check against patterns
    const matchesPattern = datePatterns.some(pattern => pattern.test(trimmed));
    
    // Try parsing
    const parsed = Date.parse(trimmed);
    const isValidDate = !isNaN(parsed);
    
    if (isValidDate || matchesPattern) {
      validDateCount++;
      
      // Check if it includes time component
      if (trimmed.includes(':') || trimmed.includes('T') || /\d{2}:\d{2}/.test(trimmed)) {
        hasTimeCount++;
      }
    }
  }
  
  const confidence = validDateCount / stringValues.length;
  const hasTime = hasTimeCount / Math.max(validDateCount, 1) > 0.5;
  
  return {
    isDate: confidence > 0.8,
    hasTime,
    confidence
  };
}

/**
 * Quick validation: check if content looks like valid CSV
 */
export function validateCSV(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // Check for header row
  const firstLine = content.split('\n')[0];
  if (!firstLine || firstLine.trim().length === 0) {
    return { valid: false, error: 'No header row found' };
  }

  // Quick parse to check for errors
  const result = Papa.parse(content, {
    header: true,
    preview: 1,
    skipEmptyLines: true
  });

  if (result.errors.length > 0) {
    const criticalErrors = result.errors.filter(e => e.type === 'Delimiter' || e.type === 'FieldMismatch');
    if (criticalErrors.length > 0) {
      return { valid: false, error: criticalErrors[0].message };
    }
  }

  return { valid: true };
}
