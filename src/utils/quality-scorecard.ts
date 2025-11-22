// Data Quality Scorecard
// Comprehensive data quality assessment with actionable metrics

import { extractColumnMetadata } from './column-metadata';

export interface QualityDimension {
  name: string;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: QualityIssue[];
  strengths: string[];
  impact: 'critical' | 'high' | 'medium' | 'low';
}

export interface QualityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedColumns: string[];
  affectedRows: number;
  impact: string;
  recommendation: string;
  actionable: boolean;
  actionType?: 'clean_missing' | 'remove_duplicates' | 'fix_outliers' | 'standardize_format' | 'validate_range' | 'check_consistency';
  estimatedImpact: number; // 0-100, how much fixing this would improve overall score
}

export interface QualityScorecard {
  datasetId: number;
  datasetName: string;
  overallScore: number; // 0-100
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  dimensions: {
    completeness: QualityDimension;
    validity: QualityDimension;
    consistency: QualityDimension;
    accuracy: QualityDimension;
    uniqueness: QualityDimension;
  };
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    actionableIssues: number;
  };
  recommendations: PrioritizedRecommendation[];
  generatedAt: string;
}

export interface PrioritizedRecommendation {
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  expectedImprovement: number; // Expected score improvement (0-100)
  effort: 'low' | 'medium' | 'high';
  actionType: string;
  affectedColumns: string[];
}

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

/**
 * Convert numeric score to letter grade
 */
function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Convert overall score to health status
 */
function scoreToHealthStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'critical';
}

/**
 * Assess data completeness
 */
function assessCompleteness(
  columns: Array<{ name: string; type: string; nullCount: number; totalCount: number }>,
  totalRows: number
): QualityDimension {
  const issues: QualityIssue[] = [];
  const strengths: string[] = [];

  let totalCells = 0;
  let missingCells = 0;

  for (const col of columns) {
    totalCells += col.totalCount;
    missingCells += col.nullCount;

    const missingPct = (col.nullCount / col.totalCount) * 100;

    if (missingPct > 50) {
      issues.push({
        severity: 'critical',
        description: `Column "${col.name}" is ${missingPct.toFixed(1)}% empty`,
        affectedColumns: [col.name],
        affectedRows: col.nullCount,
        impact: 'Severely limits analysis potential for this variable',
        recommendation: `Consider removing this column or imputing missing values using domain knowledge`,
        actionable: true,
        actionType: 'clean_missing',
        estimatedImpact: missingPct > 80 ? 15 : 10
      });
    } else if (missingPct > 20) {
      issues.push({
        severity: 'high',
        description: `Column "${col.name}" has ${missingPct.toFixed(1)}% missing values`,
        affectedColumns: [col.name],
        affectedRows: col.nullCount,
        impact: 'May introduce bias in statistical analyses',
        recommendation: `Investigate missingness pattern (MCAR/MAR/MNAR) and apply appropriate imputation`,
        actionable: true,
        actionType: 'clean_missing',
        estimatedImpact: 8
      });
    } else if (missingPct > 5) {
      issues.push({
        severity: 'medium',
        description: `Column "${col.name}" has ${missingPct.toFixed(1)}% missing values`,
        affectedColumns: [col.name],
        affectedRows: col.nullCount,
        impact: 'Minor impact on analysis completeness',
        recommendation: `Monitor for patterns; simple imputation may be sufficient`,
        actionable: true,
        actionType: 'clean_missing',
        estimatedImpact: 5
      });
    } else if (missingPct === 0) {
      strengths.push(`"${col.name}" is 100% complete`);
    }
  }

  const completenessPct = totalCells > 0 ? ((totalCells - missingCells) / totalCells) * 100 : 100;
  const score = Math.max(0, completenessPct);

  return {
    name: 'Completeness',
    score: Math.round(score),
    grade: scoreToGrade(score),
    issues,
    strengths: strengths.slice(0, 3), // Top 3 strengths
    impact: score < 60 ? 'critical' : score < 75 ? 'high' : score < 90 ? 'medium' : 'low'
  };
}

/**
 * Assess data validity (type consistency, format compliance)
 */
function assessValidity(
  columns: Array<{
    name: string;
    type: string;
    totalCount: number;
    distinctCount?: number;
    min?: number;
    max?: number;
  }>,
  analyses: Array<{
    analysis_type: string;
    column_name?: string;
    result: any;
  }>
): QualityDimension {
  const issues: QualityIssue[] = [];
  const strengths: string[] = [];

  // Check for outliers from anomaly/outlier analyses
  const outlierAnalyses = analyses.filter(a =>
    a.analysis_type === 'outlier' || a.analysis_type === 'anomaly'
  );

  for (const analysis of outlierAnalyses) {
    if (analysis.result && analysis.result.outliers && analysis.column_name) {
      const outlierCount = Array.isArray(analysis.result.outliers)
        ? analysis.result.outliers.length
        : analysis.result.outlierCount || 0;

      const col = columns.find(c => c.name === analysis.column_name);
      const totalCount = col?.totalCount || 1;
      const outlierPct = (outlierCount / totalCount) * 100;

      if (outlierPct > 10) {
        issues.push({
          severity: 'high',
          description: `Column "${analysis.column_name}" has ${outlierCount} outliers (${outlierPct.toFixed(1)}%)`,
          affectedColumns: [analysis.column_name],
          affectedRows: outlierCount,
          impact: 'Outliers may indicate data entry errors or exceptional cases',
          recommendation: `Review outliers for validity; consider capping, transformation, or removal`,
          actionable: true,
          actionType: 'fix_outliers',
          estimatedImpact: 7
        });
      } else if (outlierPct > 5) {
        issues.push({
          severity: 'medium',
          description: `Column "${analysis.column_name}" has ${outlierCount} outliers (${outlierPct.toFixed(1)}%)`,
          affectedColumns: [analysis.column_name],
          affectedRows: outlierCount,
          impact: 'May skew statistical analyses',
          recommendation: `Investigate outlier causes; apply robust statistical methods`,
          actionable: true,
          actionType: 'fix_outliers',
          estimatedImpact: 5
        });
      }
    }
  }

  // Check for low cardinality in numeric columns (might be categorical)
  for (const col of columns) {
    if (col.type === 'number' && col.distinctCount && col.totalCount) {
      const cardinalityRatio = col.distinctCount / col.totalCount;

      if (col.distinctCount <= 10 && cardinalityRatio < 0.05) {
        issues.push({
          severity: 'low',
          description: `Numeric column "${col.name}" has only ${col.distinctCount} unique values`,
          affectedColumns: [col.name],
          affectedRows: col.totalCount,
          impact: 'May be better represented as categorical data',
          recommendation: `Consider treating as categorical variable for analysis`,
          actionable: false,
          estimatedImpact: 3
        });
      }
    }
  }

  // Calculate validity score based on issues
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;

  const score = Math.max(0, 100 - (criticalIssues * 20) - (highIssues * 10) - (mediumIssues * 5));

  if (issues.length === 0) {
    strengths.push('No significant validity issues detected');
  }

  return {
    name: 'Validity',
    score: Math.round(score),
    grade: scoreToGrade(score),
    issues,
    strengths,
    impact: score < 60 ? 'critical' : score < 75 ? 'high' : score < 90 ? 'medium' : 'low'
  };
}

/**
 * Assess data consistency (correlations, logical relationships)
 */
function assessConsistency(
  analyses: Array<{
    analysis_type: string;
    result: any;
  }>
): QualityDimension {
  const issues: QualityIssue[] = [];
  const strengths: string[] = [];

  // Check for multicollinearity from correlation analysis
  const correlationAnalyses = analyses.filter(a => a.analysis_type === 'correlation');

  for (const analysis of correlationAnalyses) {
    if (analysis.result && analysis.result.pairs) {
      const strongCorrelations = analysis.result.pairs.filter((p: any) =>
        Math.abs(p.correlation) > 0.95 && p.column1 !== p.column2
      );

      if (strongCorrelations.length > 0) {
        const affectedCols = new Set<string>();
        strongCorrelations.forEach((p: any) => {
          affectedCols.add(p.column1);
          affectedCols.add(p.column2);
        });

        issues.push({
          severity: 'high',
          description: `Found ${strongCorrelations.length} pairs of highly correlated variables (r > 0.95)`,
          affectedColumns: Array.from(affectedCols),
          affectedRows: 0,
          impact: 'Multicollinearity can distort model coefficients and inflate standard errors',
          recommendation: `Consider removing redundant variables or using dimensionality reduction (PCA)`,
          actionable: true,
          actionType: 'check_consistency',
          estimatedImpact: 8
        });
      }
    }
  }

  // Calculate consistency score
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;

  const score = Math.max(0, 100 - (highIssues * 15) - (mediumIssues * 8));

  if (issues.length === 0) {
    strengths.push('No consistency issues detected');
    strengths.push('Variable relationships appear logically sound');
  }

  return {
    name: 'Consistency',
    score: Math.round(score),
    grade: scoreToGrade(score),
    issues,
    strengths,
    impact: score < 70 ? 'high' : score < 85 ? 'medium' : 'low'
  };
}

/**
 * Assess data accuracy (statistical distributions, expected ranges)
 */
function assessAccuracy(
  columns: Array<{
    name: string;
    type: string;
    min?: number;
    max?: number;
    mean?: number;
    stddev?: number;
  }>,
  analyses: Array<{
    analysis_type: string;
    column_name?: string;
    result: any;
  }>
): QualityDimension {
  const issues: QualityIssue[] = [];
  const strengths: string[] = [];

  // Check for unrealistic ranges or distributions
  for (const col of columns) {
    if (col.type === 'number' && col.min !== undefined && col.max !== undefined) {
      // Check for negative values in potentially non-negative columns
      if (col.min < 0 && (
        col.name.toLowerCase().includes('age') ||
        col.name.toLowerCase().includes('count') ||
        col.name.toLowerCase().includes('quantity') ||
        col.name.toLowerCase().includes('price') ||
        col.name.toLowerCase().includes('amount')
      )) {
        issues.push({
          severity: 'medium',
          description: `Column "${col.name}" contains negative values (min: ${col.min})`,
          affectedColumns: [col.name],
          affectedRows: 0,
          impact: 'Negative values may indicate data entry errors',
          recommendation: `Validate negative values; correct or remove invalid entries`,
          actionable: true,
          actionType: 'validate_range',
          estimatedImpact: 6
        });
      }

      // Check for extreme age values
      if (col.name.toLowerCase().includes('age') && (col.max > 120 || col.min < 0)) {
        issues.push({
          severity: 'high',
          description: `Column "${col.name}" has unrealistic age values (${col.min} to ${col.max})`,
          affectedColumns: [col.name],
          affectedRows: 0,
          impact: 'Invalid age values compromise data reliability',
          recommendation: `Review and correct age values outside realistic range (0-120)`,
          actionable: true,
          actionType: 'validate_range',
          estimatedImpact: 8
        });
      }
    }
  }

  // Check statistical analyses for distribution issues
  const statsAnalyses = analyses.filter(a => a.analysis_type === 'statistics');

  for (const analysis of statsAnalyses) {
    if (analysis.result && analysis.column_name) {
      const { mean, stddev, min, max } = analysis.result;

      if (mean !== undefined && stddev !== undefined && stddev > 0) {
        // Check for extremely high coefficient of variation
        const cv = (stddev / Math.abs(mean)) * 100;

        if (cv > 200) {
          issues.push({
            severity: 'low',
            description: `Column "${analysis.column_name}" has very high variability (CV: ${cv.toFixed(0)}%)`,
            affectedColumns: [analysis.column_name],
            affectedRows: 0,
            impact: 'High variability may indicate heterogeneous data or measurement issues',
            recommendation: `Consider segmentation or transformation to reduce variability`,
            actionable: false,
            estimatedImpact: 4
          });
        }
      }
    }
  }

  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;

  const score = Math.max(0, 100 - (criticalIssues * 20) - (highIssues * 12) - (mediumIssues * 6));

  if (issues.length === 0) {
    strengths.push('All values within expected ranges');
    strengths.push('Statistical distributions appear normal');
  }

  return {
    name: 'Accuracy',
    score: Math.round(score),
    grade: scoreToGrade(score),
    issues,
    strengths,
    impact: score < 65 ? 'critical' : score < 80 ? 'high' : score < 90 ? 'medium' : 'low'
  };
}

/**
 * Assess data uniqueness (duplicates, unique identifiers)
 */
function assessUniqueness(
  columns: Array<{
    name: string;
    distinctCount?: number;
    totalCount: number;
  }>,
  totalRows: number
): QualityDimension {
  const issues: QualityIssue[] = [];
  const strengths: string[] = [];

  // Check for potential duplicate rows (simplified check)
  let potentialIdColumns = 0;
  let fullyUniqueColumns = 0;

  for (const col of columns) {
    if (col.distinctCount && col.totalCount) {
      const uniquenessRatio = col.distinctCount / col.totalCount;

      // Potential ID column with duplicates
      if (
        (col.name.toLowerCase().includes('id') ||
         col.name.toLowerCase().includes('key') ||
         col.name.toLowerCase().includes('code')) &&
        uniquenessRatio < 1.0
      ) {
        potentialIdColumns++;
        const duplicates = col.totalCount - col.distinctCount;

        issues.push({
          severity: 'high',
          description: `Identifier column "${col.name}" has ${duplicates} duplicate values`,
          affectedColumns: [col.name],
          affectedRows: duplicates,
          impact: 'Duplicate identifiers compromise data integrity and uniqueness constraints',
          recommendation: `Investigate and remove duplicate records; ensure unique constraints`,
          actionable: true,
          actionType: 'remove_duplicates',
          estimatedImpact: 12
        });
      }

      if (uniquenessRatio === 1.0) {
        fullyUniqueColumns++;
      }
    }
  }

  // Estimate overall duplicate rate (simplified)
  let duplicateScore = 100;

  if (potentialIdColumns > 0) {
    duplicateScore -= potentialIdColumns * 15;
  }

  if (fullyUniqueColumns > 0) {
    strengths.push(`${fullyUniqueColumns} column(s) with fully unique values`);
  }

  if (issues.length === 0) {
    strengths.push('No duplicate identifiers detected');
  }

  const score = Math.max(0, duplicateScore);

  return {
    name: 'Uniqueness',
    score: Math.round(score),
    grade: scoreToGrade(score),
    issues,
    strengths,
    impact: score < 70 ? 'high' : score < 85 ? 'medium' : 'low'
  };
}

/**
 * Generate prioritized recommendations
 */
function generateRecommendations(dimensions: QualityScorecard['dimensions']): PrioritizedRecommendation[] {
  const recommendations: PrioritizedRecommendation[] = [];

  // Collect all issues across dimensions
  const allIssues: Array<{ dimension: string; issue: QualityIssue }> = [];

  for (const [dimName, dimension] of Object.entries(dimensions)) {
    for (const issue of dimension.issues) {
      allIssues.push({ dimension: dimName, issue });
    }
  }

  // Sort by severity and estimated impact
  const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  allIssues.sort((a, b) => {
    const severityDiff = severityWeight[b.issue.severity] - severityWeight[a.issue.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.issue.estimatedImpact - a.issue.estimatedImpact;
  });

  // Take top actionable issues
  const topIssues = allIssues.filter(item => item.issue.actionable).slice(0, 5);

  topIssues.forEach((item, index) => {
    const priority = (index + 1) as 1 | 2 | 3 | 4 | 5;

    recommendations.push({
      priority,
      title: item.issue.description,
      description: item.issue.recommendation,
      expectedImprovement: item.issue.estimatedImpact,
      effort: item.issue.severity === 'critical' ? 'high' :
              item.issue.severity === 'high' ? 'medium' : 'low',
      actionType: item.issue.actionType || 'manual_review',
      affectedColumns: item.issue.affectedColumns
    });
  });

  return recommendations;
}

/**
 * Generate comprehensive data quality scorecard
 */
export async function generateQualityScorecard(
  db: any,
  datasetId: number
): Promise<QualityScorecard | null> {
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

    // Assess each quality dimension
    const completeness = assessCompleteness(
      columnData.map(c => ({
        name: c.column_name,
        type: c.column_type,
        nullCount: c.null_count || 0,
        totalCount: c.total_count || rowCount
      })),
      rowCount
    );

    const validity = assessValidity(
      columnData.map(c => ({
        name: c.column_name,
        type: c.column_type,
        totalCount: c.total_count || rowCount,
        distinctCount: c.distinct_count,
        min: c.min_value,
        max: c.max_value
      })),
      analysisData
    );

    const consistency = assessConsistency(analysisData);

    const accuracy = assessAccuracy(
      columnData.map(c => ({
        name: c.column_name,
        type: c.column_type,
        min: c.min_value,
        max: c.max_value,
        mean: c.mean_value,
        stddev: c.stddev_value
      })),
      analysisData
    );

    const uniqueness = assessUniqueness(
      columnData.map(c => ({
        name: c.column_name,
        distinctCount: c.distinct_count,
        totalCount: c.total_count || rowCount
      })),
      rowCount
    );

    const dimensions = {
      completeness,
      validity,
      consistency,
      accuracy,
      uniqueness
    };

    // Calculate overall score (weighted average)
    const weights = {
      completeness: 0.25,
      validity: 0.20,
      consistency: 0.20,
      accuracy: 0.20,
      uniqueness: 0.15
    };

    const overallScore = Math.round(
      completeness.score * weights.completeness +
      validity.score * weights.validity +
      consistency.score * weights.consistency +
      accuracy.score * weights.accuracy +
      uniqueness.score * weights.uniqueness
    );

    // Count issues by severity
    const allIssues = [
      ...completeness.issues,
      ...validity.issues,
      ...consistency.issues,
      ...accuracy.issues,
      ...uniqueness.issues
    ];

    const summary = {
      totalIssues: allIssues.length,
      criticalIssues: allIssues.filter(i => i.severity === 'critical').length,
      highIssues: allIssues.filter(i => i.severity === 'high').length,
      mediumIssues: allIssues.filter(i => i.severity === 'medium').length,
      lowIssues: allIssues.filter(i => i.severity === 'low').length,
      actionableIssues: allIssues.filter(i => i.actionable).length
    };

    const recommendations = generateRecommendations(dimensions);

    return {
      datasetId,
      datasetName: dataset.name,
      overallScore,
      overallGrade: scoreToGrade(overallScore),
      healthStatus: scoreToHealthStatus(overallScore),
      dimensions,
      summary,
      recommendations,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating quality scorecard:', error);
    return null;
  }
}
