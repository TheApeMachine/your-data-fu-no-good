// CSV Parser using PapaParse with Streaming Support
import Papa from 'papaparse';
import { profileColumns } from './column-profiler';
/**
 * Parse CSV with streaming for better memory efficiency
 * For Cloudflare Workers, we still need to load the full content,
 * but we process it in chunks to avoid blocking
 */
export function parseCSV(content, options = {}) {
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
    return result.data;
}
/**
 * Parse CSV in chunks for very large files
 * This prevents memory overflow by processing rows incrementally
 */
export async function parseCSVChunked(content, chunkSize = 1000, onChunk) {
    return new Promise((resolve, reject) => {
        let totalRows = 0;
        let currentChunk = [];
        Papa.parse(content, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            chunk: async (results, parser) => {
                try {
                    // Add rows to current chunk
                    currentChunk.push(...results.data);
                    // When chunk reaches size, process it
                    if (currentChunk.length >= chunkSize) {
                        parser.pause();
                        await onChunk(currentChunk, totalRows);
                        totalRows += currentChunk.length;
                        currentChunk = [];
                        parser.resume();
                    }
                }
                catch (error) {
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
                }
                catch (error) {
                    reject(error);
                }
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}
export function inferColumnTypes(rows) {
    if (!rows || rows.length === 0) {
        return {};
    }
    return profileColumns(rows);
}
/**
 * Quick validation: check if content looks like valid CSV
 */
export function validateCSV(content) {
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
