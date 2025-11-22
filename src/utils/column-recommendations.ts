// Smart Column Recommendations
// Analyzes columns to identify which ones deserve user attention

import { extractColumnMetadata } from './column-metadata';

function safeParseJson<T = any>(value: unknown): T | unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value;
    }
  }
  return value;
}

export interface ColumnRecommendation {
  columnName: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  score: number; // 0-100
  category: 'key_driver' | 'quality_concern' | 'high_information' | 'predictive' | 'anomalous' | 'unique_identifier' | 'explore_further';
  reasoning: string;
  metrics: {
    informationContent: number; // 0-1
    dataQuality: number; // 0-1
    predictivePower: number; // 0-1
    anomalyPotential: number; // 0-1
    uniqueness: number; // 0-1
  };
  insights: string[];
  actions: RecommendedAction[];
}

export interface RecommendedAction {
  action: string;
  description: string;
  actionType: 'explore_stats' | 'view_distribution' | 'check_correlations' | 'investigate_outliers' | 'clean_data' | 'feature_engineering';
}

export interface ColumnRecommendations {
  datasetId: number;
  datasetName: string;
  totalColumns: number;
  recommendations: ColumnRecommendation[];
  focusColumns: string[]; // Top columns to focus on
  ignoreColumns: string[]; // Low-value columns to potentially ignore
  summary: {
    keyDrivers: number;
    qualityConcerns: number;
    highInformation: number;
    predictive: number;
    anomalous: number;
  };
  generatedAt: string;
}

/**
 * Calculate information content score for a column
 * Based on variance, cardinality, and distribution
 */
function calculateInformationContent(column: {
  type: string;
  distinctCount?: number;
  totalCount: number;
  stddev?: number;
  mean?: number;
  nullCount: number;
}): number {
  if (column.type === 'number') {
    // For numeric columns: higher variance = more information
    if (column.stddev !== undefined && column.mean !== undefined && column.mean !== 0) {
      const cv = column.stddev / Math.abs(column.mean);

      // Coefficient of variation between 0.1 and 2.0 is ideal
      if (cv >= 0.1 && cv <= 2.0) {
        return 0.9;
      } else if (cv > 2.0) {
        return Math.max(0.5, 1 - (cv - 2.0) / 10);
      } else {
        return cv / 0.1 * 0.5;
      }
    }
    return 0.5;
  } else {
    // For categorical: moderate cardinality is best
    if (column.distinctCount && column.totalCount) {
      const cardinalityRatio = column.distinctCount / column.totalCount;

      // Sweet spot: 2-20% unique values for categorical
      if (cardinalityRatio >= 0.02 && cardinalityRatio <= 0.20) {
        return 0.9;
      } else if (cardinalityRatio > 0.20 && cardinalityRatio < 0.80) {
        return 0.7;
      } else if (cardinalityRatio >= 0.80) {
        // Likely a unique identifier
        return 0.3;
      } else {
        return 0.5;
      }
    }
    return 0.5;
  }
}

/**
 * Calculate data quality score for a column
 */
function calculateDataQuality(column: {
  nullCount: number;
  totalCount: number;
  distinctCount?: number;
}, outlierCount: number = 0): number {
  const missingRate = column.nullCount / column.totalCount;
  const outlierRate = outlierCount / column.totalCount;

  let score = 1.0;

  // Penalize missing values
  if (missingRate > 0.5) {
    score -= 0.5;
  } else if (missingRate > 0.2) {
    score -= 0.3;
  } else if (missingRate > 0.05) {
    score -= 0.1;
  }

  // Penalize excessive outliers
  if (outlierRate > 0.2) {
    score -= 0.3;
  } else if (outlierRate > 0.1) {
    score -= 0.2;
  } else if (outlierRate > 0.05) {
    score -= 0.1;
  }

  return Math.max(0, score);
}

/**
 * Calculate predictive power based on correlations
 */
function calculatePredictivePower(
  columnName: string,
  correlations: Array<{ column1: string; column2: string; correlation: number }>
): number {
  const relevantCorrelations = correlations.filter(
    c => (c.column1 === columnName || c.column2 === columnName) && c.column1 !== c.column2
  );

  if (relevantCorrelations.length === 0) {
    return 0.3;
  }

  // Calculate average absolute correlation
  const avgAbsCorr = relevantCorrelations.reduce((sum, c) => sum + Math.abs(c.correlation), 0) / relevantCorrelations.length;

  // Check for strong correlations
  const strongCorrelations = relevantCorrelations.filter(c => Math.abs(c.correlation) > 0.7).length;

  let score = avgAbsCorr;

  // Bonus for having strong correlations
  if (strongCorrelations > 0) {
    score = Math.min(1.0, score + 0.2);
  }

  return score;
}

/**
 * Calculate anomaly potential
 */
function calculateAnomalyPotential(
  columnName: string,
  analyses: Array<{ analysis_type: string; column_name?: string; result: any }>
): number {
  const anomalyAnalyses = analyses.filter(
    a => a.column_name === columnName && (a.analysis_type === 'anomaly' || a.analysis_type === 'outlier')
  );

  if (anomalyAnalyses.length === 0) {
    return 0.3;
  }

  // Higher score if anomalies were detected
  let score = 0.5;

  for (const analysis of anomalyAnalyses) {
    if (analysis.result && analysis.result.outliers) {
      const outlierCount = Array.isArray(analysis.result.outliers)
        ? analysis.result.outliers.length
        : analysis.result.outlierCount || 0;

      if (outlierCount > 0) {
        score = Math.min(1.0, score + 0.3);
      }
    }
  }

  return score;
}

/**
 * Calculate uniqueness score (for identifying potential keys)
 */
function calculateUniqueness(column: {
  distinctCount?: number;
  totalCount: number;
  name: string;
}): number {
  if (!column.distinctCount) return 0;

  const uniquenessRatio = column.distinctCount / column.totalCount;

  // Check if column name suggests it's an identifier
  const isLikelyId = /\b(id|key|code|uuid|guid)\b/i.test(column.name);

  if (uniquenessRatio > 0.95) {
    return isLikelyId ? 1.0 : 0.9;
  } else if (uniquenessRatio > 0.8) {
    return 0.7;
  } else {
    return uniquenessRatio;
  }
}

/**
 * Determine column category
 */
function determineCategory(metrics: ColumnRecommendation['metrics'], column: {
  name: string;
  nullCount: number;
  totalCount: number;
}): ColumnRecommendation['category'] {
  const missingRate = column.nullCount / column.totalCount;

  // Quality concerns take priority
  if (metrics.dataQuality < 0.6 || missingRate > 0.3) {
    return 'quality_concern';
  }

  // Unique identifiers
  if (metrics.uniqueness > 0.9) {
    return 'unique_identifier';
  }

  // Key drivers: high predictive power + high information content
  if (metrics.predictivePower > 0.7 && metrics.informationContent > 0.7) {
    return 'key_driver';
  }

  // Predictive columns
  if (metrics.predictivePower > 0.7) {
    return 'predictive';
  }

  // High information content
  if (metrics.informationContent > 0.7) {
    return 'high_information';
  }

  // Anomalous patterns
  if (metrics.anomalyPotential > 0.7) {
    return 'anomalous';
  }

  return 'explore_further';
}

/**
 * Calculate priority level
 */
function determinePriority(category: ColumnRecommendation['category'], score: number): ColumnRecommendation['priority'] {
  if (category === 'quality_concern' && score < 50) {
    return 'critical';
  }

  if (category === 'key_driver' || (category === 'quality_concern' && score < 60)) {
    return 'high';
  }

  if (category === 'predictive' || category === 'high_information' || category === 'anomalous') {
    return 'medium';
  }

  return 'low';
}

/**
 * Generate insights for a column
 */
function generateInsights(
  columnName: string,
  category: ColumnRecommendation['category'],
  metrics: ColumnRecommendation['metrics'],
  column: any,
  correlations: any[]
): string[] {
  const insights: string[] = [];

  // Information content insights
  if (metrics.informationContent > 0.8) {
    insights.push(`High information content - contains diverse, meaningful values`);
  } else if (metrics.informationContent < 0.3) {
    insights.push(`Low variance - values are relatively uniform`);
  }

  // Data quality insights
  if (metrics.dataQuality < 0.5) {
    const missingRate = (column.nullCount / column.totalCount * 100).toFixed(1);
    insights.push(`Poor data quality - ${missingRate}% missing values`);
  } else if (metrics.dataQuality > 0.9) {
    insights.push(`Excellent data quality - complete and clean`);
  }

  // Predictive power insights
  if (metrics.predictivePower > 0.7) {
    const strongCorrs = correlations.filter(
      c => (c.column1 === columnName || c.column2 === columnName) &&
           Math.abs(c.correlation) > 0.7 &&
           c.column1 !== c.column2
    );

    if (strongCorrs.length > 0) {
      const topCorr = strongCorrs[0];
      const otherCol = topCorr.column1 === columnName ? topCorr.column2 : topCorr.column1;
      insights.push(`Strong correlation with "${otherCol}" (r=${topCorr.correlation.toFixed(2)})`);
    }
  }

  // Uniqueness insights
  if (metrics.uniqueness > 0.95) {
    insights.push(`Likely unique identifier - ${((metrics.uniqueness * 100)).toFixed(0)}% unique values`);
  }

  // Anomaly insights
  if (metrics.anomalyPotential > 0.7) {
    insights.push(`Contains interesting anomalies worth investigating`);
  }

  return insights;
}

/**
 * Generate recommended actions
 */
function generateActions(
  category: ColumnRecommendation['category'],
  metrics: ColumnRecommendation['metrics']
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  switch (category) {
    case 'key_driver':
      actions.push({
        action: 'Explore statistics',
        description: 'View detailed statistical summary and distribution',
        actionType: 'explore_stats'
      });
      actions.push({
        action: 'Check correlations',
        description: 'Identify relationships with other variables',
        actionType: 'check_correlations'
      });
      actions.push({
        action: 'Feature engineering',
        description: 'Create derived features to capture patterns',
        actionType: 'feature_engineering'
      });
      break;

    case 'quality_concern':
      actions.push({
        action: 'Clean data',
        description: 'Address missing values and data quality issues',
        actionType: 'clean_data'
      });
      actions.push({
        action: 'Investigate outliers',
        description: 'Review and handle outliers appropriately',
        actionType: 'investigate_outliers'
      });
      break;

    case 'high_information':
      actions.push({
        action: 'View distribution',
        description: 'Analyze value distribution and patterns',
        actionType: 'view_distribution'
      });
      actions.push({
        action: 'Check correlations',
        description: 'See how this variable relates to others',
        actionType: 'check_correlations'
      });
      break;

    case 'predictive':
      actions.push({
        action: 'Check correlations',
        description: 'Explore predictive relationships',
        actionType: 'check_correlations'
      });
      actions.push({
        action: 'Feature engineering',
        description: 'Leverage predictive power in models',
        actionType: 'feature_engineering'
      });
      break;

    case 'anomalous':
      actions.push({
        action: 'Investigate outliers',
        description: 'Examine anomalous patterns and outliers',
        actionType: 'investigate_outliers'
      });
      actions.push({
        action: 'View distribution',
        description: 'Visualize distribution to understand anomalies',
        actionType: 'view_distribution'
      });
      break;

    case 'unique_identifier':
      actions.push({
        action: 'Explore statistics',
        description: 'Verify uniqueness properties',
        actionType: 'explore_stats'
      });
      break;

    default:
      actions.push({
        action: 'Explore statistics',
        description: 'Review basic statistics and properties',
        actionType: 'explore_stats'
      });
  }

  return actions;
}

/**
 * Generate reasoning text
 */
function generateReasoning(
  category: ColumnRecommendation['category'],
  metrics: ColumnRecommendation['metrics'],
  column: any
): string {
  const categoryReasons = {
    'key_driver': 'This column is a key driver with both high predictive power and rich information content. It likely plays a central role in understanding your data patterns.',
    'quality_concern': 'This column has significant data quality issues that should be addressed to ensure reliable analysis results.',
    'high_information': 'This column contains diverse, informative values that could reveal important patterns in your dataset.',
    'predictive': 'This column shows strong correlations with other variables, making it valuable for predictive analysis and understanding relationships.',
    'anomalous': 'This column exhibits unusual patterns or outliers that warrant investigation - they may represent errors or interesting edge cases.',
    'unique_identifier': 'This column appears to be a unique identifier or key. While useful for data management, it may have limited analytical value.',
    'explore_further': 'This column shows moderate characteristics across multiple dimensions and may be worth exploring further.'
  };

  return categoryReasons[category];
}

/**
 * Generate smart column recommendations
 */
export async function generateColumnRecommendations(
  db: any,
  datasetId: number
): Promise<ColumnRecommendations | null> {
  try {
    // Fetch dataset info
    const dataset = await db
      .prepare('SELECT id, name, row_count, columns FROM datasets WHERE id = ?')
      .bind(datasetId)
      .first();

    if (!dataset) {
      return null;
    }

    const rowCount = typeof dataset.row_count === 'bigint'
      ? Number(dataset.row_count)
      : Number(dataset.row_count || 0);

    const columnData = extractColumnMetadata(dataset.columns, rowCount);

    // Fetch analyses
    const analyses = await db
      .prepare('SELECT * FROM analyses WHERE dataset_id = ?')
      .bind(datasetId)
      .all();

    const analysisData = (analyses.results || []).map((analysis: any) => ({
      ...analysis,
      result: safeParseJson(analysis.result),
    }));

    // Extract correlation data
    const correlationAnalysis = analysisData.find(a => a.analysis_type === 'correlation');
    const correlations = correlationAnalysis?.result?.pairs || [];

    // Generate recommendations for each column
    const recommendations: ColumnRecommendation[] = [];

    for (const col of columnData) {
      // Get outlier count for this column
      const outlierAnalysis = analysisData.find(
        a => a.column_name === col.column_name && (a.analysis_type === 'outlier' || a.analysis_type === 'anomaly')
      );

      const outlierCount = outlierAnalysis?.result?.outliers
        ? (Array.isArray(outlierAnalysis.result.outliers)
          ? outlierAnalysis.result.outliers.length
          : outlierAnalysis.result.outlierCount || 0)
        : 0;

      // Calculate metrics
      const informationContent = calculateInformationContent({
        type: col.column_type,
        distinctCount: col.distinct_count,
        totalCount: col.total_count || rowCount,
        stddev: col.stddev_value,
        mean: col.mean_value,
        nullCount: col.null_count || 0
      });

      const dataQuality = calculateDataQuality(
        {
          nullCount: col.null_count || 0,
          totalCount: col.total_count || rowCount,
          distinctCount: col.distinct_count
        },
        outlierCount
      );

      const predictivePower = calculatePredictivePower(col.column_name, correlations);

      const anomalyPotential = calculateAnomalyPotential(col.column_name, analysisData);

      const uniqueness = calculateUniqueness({
        distinctCount: col.distinct_count,
        totalCount: col.total_count || rowCount,
        name: col.column_name
      });

      const metrics = {
        informationContent,
        dataQuality,
        predictivePower,
        anomalyPotential,
        uniqueness
      };

      // Calculate overall score (weighted average)
      const score = Math.round(
        informationContent * 0.25 +
        dataQuality * 0.30 +
        predictivePower * 0.25 +
        anomalyPotential * 0.10 +
        (1 - uniqueness) * 0.10 // Lower uniqueness is better for analysis (not IDs)
      ) * 100;

      const category = determineCategory(metrics, {
        name: col.column_name,
        nullCount: col.null_count || 0,
        totalCount: col.total_count || rowCount
      });

      const priority = determinePriority(category, score);

      const insights = generateInsights(col.column_name, category, metrics, col, correlations);

      const actions = generateActions(category, metrics);

      const reasoning = generateReasoning(category, metrics, col);

      recommendations.push({
        columnName: col.column_name,
        priority,
        score,
        category,
        reasoning,
        metrics,
        insights,
        actions
      });
    }

    // Sort by score (descending)
    recommendations.sort((a, b) => b.score - a.score);

    // Identify focus and ignore columns
    const focusColumns = recommendations
      .filter(r => r.priority === 'critical' || r.priority === 'high' || (r.priority === 'medium' && r.score > 70))
      .map(r => r.columnName)
      .slice(0, 5); // Top 5

    const ignoreColumns = recommendations
      .filter(r => r.category === 'unique_identifier' || (r.priority === 'low' && r.score < 40))
      .map(r => r.columnName);

    // Count by category
    const summary = {
      keyDrivers: recommendations.filter(r => r.category === 'key_driver').length,
      qualityConcerns: recommendations.filter(r => r.category === 'quality_concern').length,
      highInformation: recommendations.filter(r => r.category === 'high_information').length,
      predictive: recommendations.filter(r => r.category === 'predictive').length,
      anomalous: recommendations.filter(r => r.category === 'anomalous').length
    };

    return {
      datasetId,
      datasetName: dataset.name,
      totalColumns: columnData.length,
      recommendations,
      focusColumns,
      ignoreColumns,
      summary,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating column recommendations:', error);
    return null;
  }
}
