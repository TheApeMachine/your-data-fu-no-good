// CSV Parser using PapaParse with Streaming Support

import Papa from 'papaparse';
import type { ColumnDefinition } from '../types';
import type { DatabaseBinding } from '../storage/types';
import { profileColumns } from './column-profiler';

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
  const { maxRows } = options;

  const result = Papa.parse(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    // When maxRows is provided, parse only that many rows; otherwise parse all
    preview: typeof maxRows === 'number' ? maxRows : 0
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

export function inferColumnTypes(rows: Record<string, any>[]): Record<string, ColumnProfile> {
  if (!rows || rows.length === 0) {
    return {};
  }
  return profileColumns(rows);
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

export function inspectCsv(filePath: string): Promise<{ columnDefs: ColumnDefinition[], totalRows: number }> {
    return new Promise((resolve, reject) => {
        let rowCount = 0;
        let columnDefs: ColumnDefinition[] = [];

        Papa.parse(filePath, {
            download: true,
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            step: (results, parser) => {
                if (rowCount === 0) {
                    columnDefs = results.meta.fields.map(f => ({
                        name: f,
                        type: 'string', // Default to string, will be refined by profiling
                    }));
                }
                rowCount++;
            },
            complete: () => {
                resolve({ columnDefs, totalRows: rowCount });
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

export function profileCsv(filePath: string, columns: ColumnDefinition[]): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
        Papa.parse(filePath, {
            download: true,
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: (results) => {
                const profiles = profileColumns(results.data);
                resolve(profiles);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

export function streamCsvToDb(db: DatabaseBinding, filePath: string, datasetId: number, chunkSize: number): Promise<void> {
    let rows: any[] = [];
    let rowCounter = 0;

    return new Promise((resolve, reject) => {
        Papa.parse(filePath, {
            download: true,
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            chunk: async (results, parser) => {
                parser.pause();
                const batch = results.data;
                const statements = batch.map((row, idx) =>
                    db.prepare('INSERT INTO data_rows (dataset_id, row_number, data) VALUES (?, ?, ?)')
                      .bind(datasetId, rowCounter + idx + 1, JSON.stringify(row))
                );
                await db.batch(statements);
                rowCounter += batch.length;
                parser.resume();
            },
            complete: () => {
                resolve();
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

export async function insertDataset(db: DatabaseBinding, name: string, type: string, rowCount: number, columns: ColumnDefinition[]): Promise<number> {
    const result = await db.prepare(
        `INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
        name,
        name,
        type,
        rowCount,
        columns.length,
        JSON.stringify(columns)
    ).run();

    return result.meta.last_row_id as number;
}
