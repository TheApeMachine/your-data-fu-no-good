// Data cleaning utilities with multiple cleaning levels

import { detectOutliers } from './statistics';
import type { ColumnDefinition } from '../types';

export type CleaningLevel = 'light' | 'standard' | 'aggressive';

export interface CleaningOptions {
  level: CleaningLevel;
  keyColumns?: string[]; // Columns that must not be empty (for standard+)
  removeOutliers?: boolean; // For aggressive
  removeRareCategories?: boolean; // For aggressive (< 1% frequency)
  rareCategoryThreshold?: number; // Default 0.01 (1%)
}

export interface CleaningResult {
  originalRowCount: number;
  cleanedRowCount: number;
  removedRowCount: number;
  cleaningActions: string[];
  cleanedData: Record<string, any>[];
}

/**
 * Clean dataset based on specified level and options
 */
export function cleanDataset(
  rows: Record<string, any>[],
  columns: ColumnDefinition[],
  options: CleaningOptions
): CleaningResult {
  const actions: string[] = [];
  let cleaned = [...rows];
  const originalCount = rows.length;

  console.log(`Starting ${options.level} cleaning on ${originalCount} rows`);

  // Level 1: Light Clean (always applied)
  if (options.level === 'light' || options.level === 'standard' || options.level === 'aggressive') {
    // Remove rows with >50% empty values
    const beforeEmpty = cleaned.length;
    cleaned = removeRowsWithTooManyEmpties(cleaned, columns, 0.5);
    if (cleaned.length < beforeEmpty) {
      actions.push(`Removed ${beforeEmpty - cleaned.length} rows with >50% empty values`);
    }

    // Remove completely duplicate rows
    const beforeDupes = cleaned.length;
    cleaned = removeDuplicateRows(cleaned);
    if (cleaned.length < beforeDupes) {
      actions.push(`Removed ${beforeDupes - cleaned.length} duplicate rows`);
    }

    // Trim whitespace from text fields
    cleaned = trimWhitespace(cleaned, columns);
    actions.push('Trimmed whitespace from text fields');
  }

  // Level 2: Standard Clean
  if (options.level === 'standard' || options.level === 'aggressive') {
    // Remove rows where key columns are empty
    if (options.keyColumns && options.keyColumns.length > 0) {
      const beforeKeys = cleaned.length;
      cleaned = removeRowsWithEmptyKeys(cleaned, options.keyColumns);
      if (cleaned.length < beforeKeys) {
        actions.push(`Removed ${beforeKeys - cleaned.length} rows with empty key columns`);
      }
    }

    // Standardize text (lowercase, trim)
    cleaned = standardizeText(cleaned, columns);
    actions.push('Standardized text fields (lowercase, normalized)');

    // Fill small numeric gaps with column average
    cleaned = fillNumericGaps(cleaned, columns);
    actions.push('Filled small numeric gaps with averages');
  }

  // Level 3: Aggressive Clean
  if (options.level === 'aggressive') {
    // Remove outliers from numeric columns
    if (options.removeOutliers !== false) {
      const beforeOutliers = cleaned.length;
      cleaned = removeOutlierRows(cleaned, columns);
      if (cleaned.length < beforeOutliers) {
        actions.push(`Removed ${beforeOutliers - cleaned.length} rows with statistical outliers`);
      }
    }

    // Remove rare categories
    if (options.removeRareCategories !== false) {
      const threshold = options.rareCategoryThreshold || 0.01;
      const beforeRare = cleaned.length;
      cleaned = removeRareCategoryRows(cleaned, columns, threshold);
      if (cleaned.length < beforeRare) {
        actions.push(`Removed ${beforeRare - cleaned.length} rows with rare category values (<${threshold * 100}%)`);
      }
    }

    // Remove low-variance columns would happen at column level, not row level
    // We'll handle that separately if needed
  }

  console.log(`Cleaning complete: ${originalCount} → ${cleaned.length} rows`);

  return {
    originalRowCount: originalCount,
    cleanedRowCount: cleaned.length,
    removedRowCount: originalCount - cleaned.length,
    cleaningActions: actions,
    cleanedData: cleaned
  };
}

/**
 * Remove rows where more than threshold% of values are empty
 */
function removeRowsWithTooManyEmpties(
  rows: Record<string, any>[],
  columns: ColumnDefinition[],
  threshold: number
): Record<string, any>[] {
  return rows.filter(row => {
    const emptyCount = columns.filter(col => {
      const value = row[col.name];
      return value === null || value === undefined || value === '' || 
             (typeof value === 'string' && value.trim() === '');
    }).length;
    
    const emptyRatio = emptyCount / columns.length;
    return emptyRatio <= threshold;
  });
}

/**
 * Remove completely duplicate rows
 */
function removeDuplicateRows(rows: Record<string, any>[]): Record<string, any>[] {
  const seen = new Set<string>();
  return rows.filter(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Trim whitespace from all string values
 */
function trimWhitespace(
  rows: Record<string, any>[],
  columns: ColumnDefinition[]
): Record<string, any>[] {
  const stringColumns = columns.filter(c => c.type === 'string').map(c => c.name);
  
  return rows.map(row => {
    const cleaned = { ...row };
    for (const col of stringColumns) {
      if (typeof cleaned[col] === 'string') {
        cleaned[col] = cleaned[col].trim();
      }
    }
    return cleaned;
  });
}

/**
 * Remove rows where specified key columns are empty
 */
function removeRowsWithEmptyKeys(
  rows: Record<string, any>[],
  keyColumns: string[]
): Record<string, any>[] {
  return rows.filter(row => {
    return keyColumns.every(col => {
      const value = row[col];
      return value !== null && value !== undefined && value !== '' &&
             !(typeof value === 'string' && value.trim() === '');
    });
  });
}

/**
 * Standardize text: lowercase, normalize spacing
 */
function standardizeText(
  rows: Record<string, any>[],
  columns: ColumnDefinition[]
): Record<string, any>[] {
  const stringColumns = columns.filter(c => c.type === 'string').map(c => c.name);
  
  return rows.map(row => {
    const cleaned = { ...row };
    for (const col of stringColumns) {
      if (typeof cleaned[col] === 'string') {
        // Lowercase and normalize whitespace
        cleaned[col] = cleaned[col].toLowerCase().replace(/\s+/g, ' ').trim();
      }
    }
    return cleaned;
  });
}

/**
 * Fill small gaps in numeric data with column average
 * Only fills if <5% of values are missing
 */
function fillNumericGaps(
  rows: Record<string, any>[],
  columns: ColumnDefinition[]
): Record<string, any>[] {
  const numericColumns = columns.filter(c => c.type === 'number').map(c => c.name);
  
  // Calculate averages for each numeric column
  const averages: Record<string, number> = {};
  
  for (const col of numericColumns) {
    const values = rows
      .map(r => r[col])
      .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
      .map(v => Number(v));
    
    const emptyCount = rows.length - values.length;
    const emptyRatio = emptyCount / rows.length;
    
    // Only fill if <5% missing
    if (emptyRatio < 0.05 && emptyRatio > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      averages[col] = sum / values.length;
    }
  }
  
  // Fill gaps
  return rows.map(row => {
    const cleaned = { ...row };
    for (const col in averages) {
      if (cleaned[col] === null || cleaned[col] === undefined || cleaned[col] === '') {
        cleaned[col] = averages[col];
      }
    }
    return cleaned;
  });
}

/**
 * Remove rows containing statistical outliers in numeric columns
 */
function removeOutlierRows(
  rows: Record<string, any>[],
  columns: ColumnDefinition[]
): Record<string, any>[] {
  const numericColumns = columns.filter(c => c.type === 'number').map(c => c.name);
  
  // Detect outliers for each numeric column
  const outlierIndicesByColumn: Record<string, Set<number>> = {};
  
  for (const col of numericColumns) {
    const values = rows.map(r => {
      const val = r[col];
      return val !== null && val !== undefined ? Number(val) : NaN;
    }).filter(v => !isNaN(v));
    
    if (values.length > 10) { // Need enough data
      const outlierResult = detectOutliers(values);
      outlierIndicesByColumn[col] = new Set(outlierResult.indices);
    }
  }
  
  // Remove rows that have outliers in ANY numeric column
  return rows.filter((row, idx) => {
    for (const col in outlierIndicesByColumn) {
      if (outlierIndicesByColumn[col].has(idx)) {
        return false; // This row has an outlier
      }
    }
    return true;
  });
}

/**
 * Remove rows with rare category values (appearing < threshold frequency)
 */
function removeRareCategoryRows(
  rows: Record<string, any>[],
  columns: ColumnDefinition[],
  threshold: number
): Record<string, any>[] {
  const stringColumns = columns.filter(c => c.type === 'string').map(c => c.name);
  
  // Calculate frequencies for each string column
  const rareCategoriesByColumn: Record<string, Set<string>> = {};
  
  for (const col of stringColumns) {
    const frequency: Record<string, number> = {};
    let totalCount = 0;
    
    for (const row of rows) {
      const value = row[col];
      if (value !== null && value !== undefined && value !== '') {
        const key = String(value);
        frequency[key] = (frequency[key] || 0) + 1;
        totalCount++;
      }
    }
    
    // Find rare categories
    const rareCategories = new Set<string>();
    for (const [category, count] of Object.entries(frequency)) {
      if (count / totalCount < threshold) {
        rareCategories.add(category);
      }
    }
    
    if (rareCategories.size > 0) {
      rareCategoriesByColumn[col] = rareCategories;
    }
  }
  
  // Remove rows that have rare categories
  return rows.filter(row => {
    for (const col in rareCategoriesByColumn) {
      const value = String(row[col]);
      if (rareCategoriesByColumn[col].has(value)) {
        return false; // This row has a rare category
      }
    }
    return true;
  });
}

/**
 * Get suggested key columns (columns with few nulls and high importance)
 */
export function suggestKeyColumns(
  rows: Record<string, any>[],
  columns: ColumnDefinition[]
): string[] {
  const suggestions: string[] = [];
  
  for (const col of columns) {
    const values = rows.map(r => r[col.name]);
    const nonNullCount = values.filter(v => v !== null && v !== undefined && v !== '').length;
    const nullRatio = 1 - (nonNullCount / rows.length);
    
    // Suggest columns with <10% nulls
    if (nullRatio < 0.1) {
      // Prefer ID-like columns and important-sounding names
      const colLower = col.name.toLowerCase();
      if (colLower.includes('id') || colLower.includes('key') || 
          colLower.includes('name') || colLower.includes('email')) {
        suggestions.push(col.name);
      }
    }
  }
  
  return suggestions;
}
