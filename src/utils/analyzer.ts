// Automated data analysis engine

import { calculateStats, detectOutliers, calculateCorrelation, detectTrend } from './statistics';
import { scoreInsightQuality } from './quality-scorer';
import type { Analysis } from '../types';

export async function analyzeDataset(
  datasetId: number,
  rows: Record<string, any>[],
  columns: { name: string, type: string }[],
  db: D1Database
): Promise<void> {
  console.log(`Starting analysis for dataset ${datasetId}`);

  // 1. Statistical analysis for each column
  for (const col of columns) {
    const values = rows.map(r => r[col.name]);
    const stats = calculateStats(values, col.type);

    // Store statistics analysis
    const explanation = generateStatsExplanation(col.name, col.type, stats);
    const importance = determineImportance(stats, col.type);
    const qualityScore = scoreInsightQuality('statistics', col.name, stats, stats);

    await db.prepare(`
      INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      datasetId,
      'statistics',
      col.name,
      JSON.stringify(stats),
      1.0,
      explanation,
      importance,
      qualityScore.score
    ).run();

    // 2. Outlier detection for numeric columns
    if (col.type === 'number') {
      const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
      const outliers = detectOutliers(numbers);

      if (outliers.indices.length > 0) {
        const outlierExplanation = `Found ${outliers.indices.length} unusual values in "${col.name}" (${((outliers.indices.length / numbers.length) * 100).toFixed(1)}% of data). These values are significantly different from the rest and might need attention.`;
        const outlierResult = { count: outliers.indices.length, indices: outliers.indices.slice(0, 10) };
        const outlierQuality = scoreInsightQuality('outlier', col.name, outlierResult, stats);
        
        await db.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          datasetId,
          'outlier',
          col.name,
          JSON.stringify(outlierResult),
          0.85,
          outlierExplanation,
          outliers.indices.length > numbers.length * 0.05 ? 'high' : 'medium',
          outlierQuality.score
        ).run();
      }

      // 3. Trend detection for numeric columns
      if (numbers.length > 5) {
        const trend = detectTrend(numbers);
        if (trend.direction !== 'stable') {
          const trendExplanation = `"${col.name}" shows a ${trend.direction === 'up' ? 'rising' : 'falling'} trend with ${(trend.strength * 100).toFixed(0)}% strength. This ${trend.direction === 'up' ? 'increase' : 'decrease'} is consistent across the dataset.`;
          const trendQuality = scoreInsightQuality('trend', col.name, trend, stats);
          
          await db.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            datasetId,
            'trend',
            col.name,
            JSON.stringify(trend),
            trend.strength,
            trendExplanation,
            trend.strength > 0.5 ? 'high' : 'medium',
            trendQuality.score
          ).run();
        }
      }
    }
  }

  // 4. Correlation analysis between numeric columns
  const numericColumns = columns.filter(c => c.type === 'number');
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];

      const values1 = rows.map(r => Number(r[col1.name])).filter(n => !isNaN(n));
      const values2 = rows.map(r => Number(r[col2.name])).filter(n => !isNaN(n));

      if (values1.length > 5 && values2.length > 5) {
        const correlation = calculateCorrelation(values1, values2);

        if (Math.abs(correlation) > 0.5) {
          const corrExplanation = generateCorrelationExplanation(col1.name, col2.name, correlation);
          const corrResult = { column1: col1.name, column2: col2.name, correlation };
          const corrQuality = scoreInsightQuality('correlation', undefined, corrResult, { count: values1.length });
          
          await db.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            datasetId,
            'correlation',
            `${col1.name}_vs_${col2.name}`,
            JSON.stringify(corrResult),
            Math.abs(correlation),
            corrExplanation,
            Math.abs(correlation) > 0.7 ? 'high' : 'medium',
            corrQuality.score
          ).run();
        }
      }
    }
  }

  // 5. Pattern detection - find most common patterns
  for (const col of columns) {
    if (col.type === 'string') {
      const values = rows.map(r => r[col.name]).filter(v => v);
      const frequency: Record<string, number> = {};
      
      values.forEach(v => {
        frequency[v] = (frequency[v] || 0) + 1;
      });

      const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
      const topPatterns = sorted.slice(0, 5);

      if (topPatterns.length > 0 && topPatterns[0][1] > values.length * 0.1) {
        const patternExplanation = `The most common value in "${col.name}" is "${topPatterns[0][0]}" appearing ${topPatterns[0][1]} times (${((topPatterns[0][1] / values.length) * 100).toFixed(1)}% of records).`;
        const patternResult = { topPatterns };
        const patternStats = { count: values.length, uniqueCount: new Set(values).size };
        const patternQuality = scoreInsightQuality('pattern', col.name, patternResult, patternStats);
        
        await db.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          datasetId,
          'pattern',
          col.name,
          JSON.stringify(patternResult),
          0.9,
          patternExplanation,
          'medium',
          patternQuality.score
        ).run();
      }
    }
  }

  console.log(`Analysis complete for dataset ${datasetId}`);
}

function generateStatsExplanation(colName: string, colType: string, stats: any): string {
  if (colType === 'number') {
    return `"${colName}" ranges from ${stats.min?.toFixed(2)} to ${stats.max?.toFixed(2)} with an average of ${stats.mean?.toFixed(2)}. About half the values are below ${stats.median?.toFixed(2)}.`;
  }
  return `"${colName}" contains ${stats.count} values with ${stats.uniqueCount} unique entries. Most common: "${stats.mode}".`;
}

function generateCorrelationExplanation(col1: string, col2: string, correlation: number): string {
  const strength = Math.abs(correlation) > 0.7 ? 'strong' : 'moderate';
  const direction = correlation > 0 ? 'positive' : 'negative';
  
  if (correlation > 0) {
    return `There's a ${strength} relationship between "${col1}" and "${col2}": when ${col1} increases, ${col2} tends to increase too (correlation: ${correlation.toFixed(2)}).`;
  } else {
    return `There's a ${strength} inverse relationship between "${col1}" and "${col2}": when ${col1} increases, ${col2} tends to decrease (correlation: ${correlation.toFixed(2)}).`;
  }
}

function determineImportance(stats: any, colType: string): 'low' | 'medium' | 'high' {
  if (stats.nullCount > stats.count * 0.5) return 'high'; // Lots of missing data
  if (stats.uniqueCount === 1) return 'low'; // All same value
  if (colType === 'number' && stats.stdDev > stats.mean) return 'high'; // High variance
  return 'medium';
}
