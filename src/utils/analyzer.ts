// Automated data analysis engine

import {
  calculateStats,
  detectOutliers,
  detectRobustAnomalies,
  calculateCorrelation,
  calculateSpearmanCorrelation,
  calculateMutualInformationMetrics,
  detectTrend,
  analyzeTimeSeries,
} from './statistics';
import { scoreInsightQuality } from './quality-scorer';
import { deriveFeatureSuggestions } from './feature-engineer';
import type { ColumnDefinition, FeatureSuggestion, ForensicSeverity } from '../types';
import {
  describeAnomalies,
  describeCorrelation,
  describeFeatureSuggestion,
  describeMissingData,
  describeOutliers,
  describePattern,
  describeStatistics,
  describeTimeSeriesInsight,
  describeTrend,
  describeClustering,
  describePCA,
} from './insight-writer';
import type { DatabaseBinding } from '../storage/types';
import { recordForensicEvent } from './forensics';
import { findOptimalClusters } from './cluster-analysis';
import { performPCA, assessPCASuitability } from './dimensionality-reduction';

const MAX_CORRELATION_SAMPLE = 1500;

function classifyMissingSeverity(percentage: number): ForensicSeverity {
  if (percentage >= 50) return 'critical';
  if (percentage >= 30) return 'high';
  if (percentage >= 15) return 'medium';
  if (percentage >= 5) return 'low';
  return 'info';
}

function classifyOutlierSeverity(ratio: number): ForensicSeverity {
  if (ratio >= 0.4) return 'high';
  if (ratio >= 0.2) return 'medium';
  if (ratio >= 0.1) return 'low';
  return 'info';
}

function classifyTrendSeverity(strength: number): ForensicSeverity {
  if (strength >= 0.75) return 'high';
  if (strength >= 0.45) return 'medium';
  if (strength >= 0.2) return 'low';
  return 'info';
}

async function logForensicEvent(
  db: DatabaseBinding,
  input: Parameters<typeof recordForensicEvent>[1],
): Promise<void> {
  try {
    await recordForensicEvent(db, input);
  } catch (error) {
    console.error('Failed to store forensic event:', error, input.eventType);
  }
}

export async function analyzeDataset(
  datasetId: number,
  rows: Record<string, any>[],
  columns: ColumnDefinition[],
  db: DatabaseBinding
): Promise<void> {
  console.log(`Starting analysis for dataset ${datasetId}`);

  // 1. Statistical analysis for each column
  for (const col of columns) {
    // Clean values: filter out null, undefined, empty strings, and whitespace-only strings
    const rawValues = rows.map(r => r[col.name]);
    const values = rawValues
      .filter(v => {
        if (v === null || v === undefined) return false;
        if (typeof v === 'string') {
          const trimmed = v.trim();
          return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined' && trimmed !== 'N/A' && trimmed !== 'NA';
        }
        return true;
      });

    const stats = calculateStats(rawValues, col.type);

    // Store statistics analysis
    const statsDescription = describeStatistics(col, stats);
    const statsPayload = {
      ...stats,
      insight_actions: statsDescription.actions ?? [],
    };
    const importance = determineImportance(stats, col.type);
    const qualityScore = scoreInsightQuality('statistics', col.name, stats, stats);

    await db.prepare(`
      INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      datasetId,
      'statistics',
      col.name,
      JSON.stringify(statsPayload),
      1.0,
      statsDescription.text,
      importance,
      qualityScore.score
    ).run();

    if (stats.nullCount > 0) {
      const missingPercentage = stats.count > 0 ? (stats.nullCount / stats.count) * 100 : 0;
      const missingResult = {
        count: stats.nullCount,
        percentage: Number(missingPercentage.toFixed(2)),
        total: stats.count
      };
      const missingDescription = describeMissingData(col, missingResult, stats);
      const missingPayload = {
        ...missingResult,
        insight_actions: missingDescription.actions ?? [],
      };
      const missingImportance = missingPercentage > 20 ? 'high' : missingPercentage > 5 ? 'medium' : 'low';
      const missingQuality = scoreInsightQuality('missing', col.name, missingResult, stats);

      await db.prepare(`
        INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        datasetId,
        'missing',
        col.name,
        JSON.stringify(missingPayload),
        1.0,
        missingDescription.text,
        missingImportance,
        missingQuality.score
      ).run();

      const missingSeverity = classifyMissingSeverity(missingPercentage);
      if (missingSeverity !== 'info') {
        await logForensicEvent(db, {
          datasetId,
          eventType: 'missing_spike',
          severity: missingSeverity,
          summary: `${missingPercentage.toFixed(1)}% missing values detected in ${col.name}`,
          details: {
            column: col.name,
            missingCount: stats.nullCount,
            totalCount: stats.count,
            missingPercentage,
          },
        });
      }
    }

    // 2. Outlier detection for numeric columns
    if (col.type === 'number') {
      const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
      const outliers = detectOutliers(numbers);

      if (outliers.indices.length > 0) {
        const outlierPercentage = numbers.length > 0 ? (outliers.indices.length / numbers.length) * 100 : 0;
        const outlierResult = {
          count: outliers.indices.length,
          percentage: Number(outlierPercentage.toFixed(2)),
          indices: outliers.indices.slice(0, 25),
          values: outliers.indices.slice(0, 25).map(idx => numbers[idx]),
        };
        const outlierDescription = describeOutliers(col, outlierResult, stats);
        const outlierPayload = {
          ...outlierResult,
          insight_actions: outlierDescription.actions ?? [],
        };
        const outlierQuality = scoreInsightQuality('outlier', col.name, outlierResult, stats);

        await db.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          datasetId,
          'outlier',
          col.name,
          JSON.stringify(outlierPayload),
          0.85,
          outlierDescription.text,
          outlierPercentage > 5 ? 'high' : 'medium',
          outlierQuality.score
        ).run();

        const outlierRatio = numbers.length > 0 ? outliers.indices.length / numbers.length : 0;
        const outlierSeverity = classifyOutlierSeverity(outlierRatio);
        if (outlierSeverity !== 'info') {
          await logForensicEvent(db, {
            datasetId,
            eventType: 'outlier_cluster',
            severity: outlierSeverity,
            summary: `${outliers.indices.length} potential outliers identified in ${col.name}`,
            details: {
              column: col.name,
              outlierCount: outliers.indices.length,
              ratio: outlierRatio,
              sampleValues: outlierResult.values,
            },
          });
        }
      }

      // 3. Trend detection for numeric columns
      if (numbers.length > 5) {
        const trend = detectTrend(numbers);
        if (trend.direction !== 'stable') {
          const trendDescription = describeTrend(col, trend, stats);
          const trendPayload = {
            ...trend,
            insight_actions: trendDescription.actions ?? [],
          };
          const trendQuality = scoreInsightQuality('trend', col.name, trend, stats);

          await db.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            datasetId,
            'trend',
            col.name,
            JSON.stringify(trendPayload),
            trend.strength,
            trendDescription.text,
            trend.strength > 0.5 ? 'high' : 'medium',
            trendQuality.score
          ).run();

          const trendSeverity = classifyTrendSeverity(trend.strength);
          if (trendSeverity !== 'info') {
            await logForensicEvent(db, {
              datasetId,
              eventType: 'trend_shift',
              severity: trendSeverity,
              summary: `Detected ${trend.direction} trend in ${col.name}`,
              details: {
                column: col.name,
                direction: trend.direction,
                strength: trend.strength,
              },
            });
          }
        }
      }
    }

    if (col.type === 'number') {
      const numericSeries = rows
        .map((r, idx) => ({ value: Number(r[col.name]), index: idx }))
        .filter(p => !isNaN(p.value));

      const anomalies = detectRobustAnomalies(numericSeries, { threshold: 3.2, maxResults: 10 });

      if (anomalies.length > 0) {
        const share = numericSeries.length > 0 ? (anomalies.length / numericSeries.length) * 100 : 0;
        const topSignal = anomalies[0];

        const anomalyResult = {
          total_anomalies: anomalies.length,
          share: Number(share.toFixed(2)),
          threshold: 3.2,
          median: stats.median,
          anomalies: anomalies.slice(0, 5).map(a => ({
            row: a.index + 1,
            value: a.value,
            score: Number(a.score.toFixed(2)),
            direction: a.direction,
            percentile: Number(a.percentileRank.toFixed(1))
          })),
          indices: anomalies.map(a => a.index),
          values: anomalies.map(a => a.value)
        };

        const anomalyImportance = share >= 10 ? 'high' : share >= 4 ? 'medium' : 'low';
        const anomalyQuality = scoreInsightQuality('anomaly', col.name, anomalyResult, {
          count: numericSeries.length,
          nullCount: stats.nullCount,
          uniqueCount: stats.uniqueCount
        });
        const anomalyDescription = describeAnomalies(col, anomalyResult, stats);
        const anomalyPayload = {
          ...anomalyResult,
          insight_actions: anomalyDescription.actions ?? [],
        };

        await db.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          datasetId,
          'anomaly',
          col.name,
          JSON.stringify(anomalyPayload),
          Math.min(topSignal.score / 10, 1),
          anomalyDescription.text,
          anomalyImportance,
          anomalyQuality.score
        ).run();
      }
    }
  }

  // 4. Correlation and dependency analysis between numeric columns
  const numericColumns = columns.filter(c => c.type === 'number');
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];

      const pairedValues: Array<[number, number]> = [];
      for (const row of rows) {
        const raw1 = row[col1.name];
        const raw2 = row[col2.name];
        const num1 = typeof raw1 === 'number' ? raw1 : Number(raw1);
        const num2 = typeof raw2 === 'number' ? raw2 : Number(raw2);
        if (Number.isFinite(num1) && Number.isFinite(num2)) {
          pairedValues.push([num1, num2]);
        }
      }

      if (pairedValues.length < 6) continue;

      const sampleStep = Math.max(1, Math.floor(pairedValues.length / MAX_CORRELATION_SAMPLE));
      const sampleX: number[] = [];
      const sampleY: number[] = [];
      for (let idx = 0; idx < pairedValues.length; idx += sampleStep) {
        const [vx, vy] = pairedValues[idx];
        sampleX.push(vx);
        sampleY.push(vy);
      }

      if (sampleX.length < 6) continue;

      const pearson = calculateCorrelation(sampleX, sampleY);
      const spearman = calculateSpearmanCorrelation(sampleX, sampleY);
      const miMetrics = calculateMutualInformationMetrics(sampleX, sampleY);
      const normalizedMI = Number.isFinite(miMetrics.normalized) ? miMetrics.normalized : 0;

      const candidates: Array<{ type: 'pearson' | 'spearman' | 'nmi'; value: number }> = [];
      if (Number.isFinite(pearson)) {
        candidates.push({ type: 'pearson', value: pearson });
      }
      if (Number.isFinite(spearman)) {
        candidates.push({ type: 'spearman', value: spearman });
      }
      if (normalizedMI > 0) {
        candidates.push({ type: 'nmi', value: normalizedMI });
      }

      if (candidates.length === 0) continue;

      candidates.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
      const bestMetric = candidates[0];
      const bestStrength = bestMetric.type === 'nmi' ? bestMetric.value : Math.abs(bestMetric.value);
      if (bestStrength < 0.45) continue;

      const confidence = Math.min(1, bestStrength);
      const importance = bestStrength > 0.75 ? 'high' : 'medium';

      const corrResult = {
        column1: col1.name,
        column2: col2.name,
        correlation: pearson,
        pearson,
        spearman,
        mutual_information: miMetrics.mi,
        normalized_mutual_information: normalizedMI,
        sample_size: pairedValues.length,
        sampled_size: sampleX.length,
        best_metric: bestMetric.type,
        best_metric_value: bestMetric.value,
        best_strength: bestStrength,
      };

      const corrDescription = describeCorrelation(col1.name, col2.name, corrResult);
      const corrPayload = {
        ...corrResult,
        insight_actions: corrDescription.actions ?? [],
      };

      const corrQuality = scoreInsightQuality('correlation', undefined, corrResult, { count: sampleX.length });

      await db.prepare(`
        INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        datasetId,
        'correlation',
        `${col1.name}_vs_${col2.name}`,
        JSON.stringify(corrPayload),
        confidence,
        corrDescription.text,
        importance,
        corrQuality.score
      ).run();
    }
  }

  // 5. Time-series analysis for date/datetime columns
  const dateColumns = columns.filter(c => c.type === 'date' || c.type === 'datetime');

  // For each date column, analyze with each numeric column
  for (const dateCol of dateColumns) {
    for (const numCol of numericColumns) {
      const dates = rows.map(r => r[dateCol.name]).filter(v => v);
      const values = rows.map(r => r[numCol.name]).filter(v => v !== null && v !== undefined);

      if (dates.length !== values.length || dates.length < 5) continue;

      const tsStats = analyzeTimeSeries(dates, values.map(v => Number(v)));

      if (tsStats && (tsStats.trend.strength > 0.3 || tsStats.seasonality !== 'none')) {
        const timeseriesResult = {
          dateColumn: dateCol.name,
          valueColumn: numCol.name,
          ...tsStats,
          // Don't serialize the full points array in result (too large)
          points: tsStats.points.length
        };
        const timeseriesDescription = describeTimeSeriesInsight(dateCol.name, numCol.name, tsStats);
        const timeseriesPayload = {
          ...timeseriesResult,
          insight_actions: timeseriesDescription.actions ?? [],
        };

        const importance = tsStats.trend.strength > 0.6 || tsStats.seasonality !== 'none' ? 'high' : 'medium';
        const tsQuality = scoreInsightQuality('timeseries', numCol.name, timeseriesResult, { count: dates.length });

        await db.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          datasetId,
          'timeseries',
          `${dateCol.name}_${numCol.name}`,
          JSON.stringify(timeseriesPayload),
          tsStats.trend.strength,
          timeseriesDescription.text,
          importance,
          tsQuality.score
        ).run();
      }
    }
  }

  // 6. Pattern detection - find most common patterns
  for (const col of columns) {
    if (col.type === 'string') {
      // Clean values: filter out null, undefined, empty strings, and common null representations
      const values = rows
        .map(r => r[col.name])
        .filter(v => {
          if (!v) return false;
          if (typeof v === 'string') {
            const trimmed = v.trim();
            return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined' && trimmed !== 'N/A' && trimmed !== 'NA';
          }
          return true;
        });

      const frequency: Record<string, number> = {};

      values.forEach(v => {
        frequency[v] = (frequency[v] || 0) + 1;
      });

      const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
      const topPatterns = sorted.slice(0, 5);

      if (topPatterns.length > 0 && topPatterns[0][1] > values.length * 0.1) {
        const totalCount = values.length;
        const uniqueCount = new Set(values).size;
        const patternEntries = topPatterns.map(([value, count]) => ({
          value,
          count,
          percentage: Number(((count / totalCount) * 100).toFixed(2))
        }));
        const primaryPattern = patternEntries[0];
        const patternResult = {
          topPatterns: patternEntries,
          totalCount,
          uniqueCount,
          mode: primaryPattern.value,
          modeCount: primaryPattern.count,
          modePercentage: primaryPattern.percentage
        };
        const patternStats = { count: totalCount, uniqueCount };
        const patternQuality = scoreInsightQuality('pattern', col.name, patternResult, patternStats);
        const patternDescription = describePattern(col, patternResult);
        const patternPayload = {
          ...patternResult,
          insight_actions: patternDescription.actions ?? [],
        };

        await db.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          datasetId,
          'pattern',
          col.name,
          JSON.stringify(patternPayload),
          0.9,
          patternDescription.text,
          'medium',
          patternQuality.score
        ).run();
      }
    }
  }

  console.log(`Analysis complete for dataset ${datasetId}`);

  const featureSuggestions: FeatureSuggestion[] = deriveFeatureSuggestions(rows, columns);
  if (featureSuggestions.length > 0) {
    for (const suggestion of featureSuggestions) {
      const importance =
        suggestion.confidence >= 0.75 ? 'high' : suggestion.confidence >= 0.5 ? 'medium' : 'low';
      const quality = scoreInsightQuality('feature', suggestion.columns[0], suggestion, {
        count: rows.length,
        uniqueCount: suggestion.columns.length,
        nullCount: 0,
      });
      const featureDescription = describeFeatureSuggestion(suggestion);
      const featurePayload = {
        ...suggestion,
        insight_actions: featureDescription.actions ?? [],
      };

      await db.prepare(`
        INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        datasetId,
        'feature',
        suggestion.columns.join(', '),
        JSON.stringify(featurePayload),
        suggestion.confidence,
        featureDescription.text,
        importance,
        quality.score
      ).run();
    }
  }

  // 7. Cluster analysis
  const clusteringResult = findOptimalClusters(rows, columns);
  if (clusteringResult && clusteringResult.clusters.length > 0) {
    const clusterDescription = describeClustering(clusteringResult);
    const clusterPayload = {
      ...clusteringResult,
      insight_actions: clusterDescription.actions ?? [],
    };
    await db.prepare(`
      INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      datasetId,
      'clustering',
      clusteringResult.columns.join(', '),
      JSON.stringify(clusterPayload),
      clusteringResult.elbowScore, // Confidence based on elbow score
      clusterDescription.text,
      'high',
      75 // Default high score for now
    ).run();
  }

  // 8. Principal Component Analysis (PCA) for dimensionality reduction
  const numericColumns = columns.filter(col => col.type === 'number');

  if (numericColumns.length >= 3) {
    // Calculate average correlation strength for suitability assessment
    let totalCorr = 0;
    let corrCount = 0;
    const sampleSize = Math.min(numericColumns.length, 5);

    for (let i = 0; i < sampleSize; i++) {
      for (let j = i + 1; j < sampleSize; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        const vals1 = rows.map(r => Number(r[col1.name])).filter(v => !isNaN(v));
        const vals2 = rows.map(r => Number(r[col2.name])).filter(v => !isNaN(v));

        if (vals1.length > 5 && vals2.length > 5) {
          const corr = calculateCorrelation(vals1, vals2);
          if (corr !== null && !isNaN(corr)) {
            totalCorr += Math.abs(corr);
            corrCount++;
          }
        }
      }
    }

    const avgCorrelation = corrCount > 0 ? totalCorr / corrCount : 0;
    const suitability = assessPCASuitability(numericColumns.length, rows.length, avgCorrelation);

    if (suitability.suitable) {
      // Prepare numeric data matrix
      const numericData: number[][] = [];

      for (const row of rows) {
        const numRow: number[] = [];
        let hasAllValues = true;

        for (const col of numericColumns) {
          const val = Number(row[col.name]);
          if (isNaN(val)) {
            hasAllValues = false;
            break;
          }
          numRow.push(val);
        }

        if (hasAllValues) {
          numericData.push(numRow);
        }
      }

      // Only perform PCA if we have sufficient complete rows
      if (numericData.length >= 10) {
        const featureNames = numericColumns.map(col => col.name);
        const pcaResult = performPCA(numericData, featureNames, undefined, false);

        if (pcaResult) {
          const pcaDescription = describePCA(pcaResult);
          const pcaPayload = {
            ...pcaResult,
            // Don't store transformed data in DB to save space
            transformedData: undefined,
            components: pcaResult.components.map(comp =>
              comp.map(val => Number(val.toFixed(6)))
            ),
            suitability: suitability.reason,
            insight_actions: [],
          };

          const pcaQuality = scoreInsightQuality('pca', featureNames.join(', '), pcaResult, {
            count: numericData.length,
            uniqueCount: numericColumns.length,
            nullCount: rows.length - numericData.length,
          });

          await db.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            datasetId,
            'pca',
            featureNames.join(', '),
            JSON.stringify(pcaPayload),
            suitability.confidence,
            pcaDescription.text,
            numericColumns.length >= 10 ? 'high' : 'medium',
            pcaQuality.score
          ).run();
        }
      }
    }
  }
}

function determineImportance(stats: any, colType: string): 'low' | 'medium' | 'high' {
  if (stats.nullCount > stats.count * 0.5) return 'high'; // Lots of missing data
  if (stats.uniqueCount === 1) return 'low'; // All same value
  if (colType === 'number' && stats.stdDev > stats.mean) return 'high'; // High variance
  return 'medium';
}
