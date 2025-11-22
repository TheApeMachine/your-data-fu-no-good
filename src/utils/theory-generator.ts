// Advanced Theory Generation for Data Forensics
// Formulates statistical hypotheses, confidence scores, and investigation paths

import type { DatabaseBinding } from '../storage/types';
import type { ForensicSeverity } from '../types';

export interface DataTheory {
  id: string;
  hypothesis: string;
  alternativeHypothesis: string;
  confidenceScore: number; // 0-1, Bayesian posterior probability
  evidenceStrength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  statisticalTests: StatisticalTest[];
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
  openQuestions: string[];
  suggestedActions: InvestigationAction[];
  priority: number; // 0-100
  caseType: string;
  severity: ForensicSeverity;
}

export interface StatisticalTest {
  testName: string;
  testStatistic: number;
  pValue?: number;
  criticalValue?: number;
  result: 'reject_null' | 'fail_to_reject' | 'inconclusive';
  interpretation: string;
}

export interface Evidence {
  type: 'pattern' | 'correlation' | 'anomaly' | 'trend' | 'distribution' | 'missing_data';
  description: string;
  strength: number; // 0-1
  source: string; // Column or analysis reference
  metrics?: Record<string, number>;
}

export interface InvestigationAction {
  action: string;
  rationale: string;
  expectedOutcome: string;
  priority: 'low' | 'medium' | 'high';
  toolsRequired?: string[];
}

export interface DatasetProfile {
  datasetId: number;
  columns: Array<{
    name: string;
    type: string;
    nullPercentage: number;
    uniqueRatio: number;
    stats?: any;
  }>;
  analyses: Array<{
    type: string;
    column?: string;
    result: any;
    confidence: number;
  }>;
  rowCount: number;
}

/**
 * Generate theories from missing data patterns
 */
export function generateMissingDataTheories(
  profile: DatasetProfile
): DataTheory[] {
  const theories: DataTheory[] = [];
  const missingColumns = profile.columns.filter(col => col.nullPercentage > 10);

  if (missingColumns.length === 0) return theories;

  // Theory 1: Systematic missing data (MCAR vs MAR vs MNAR)
  const avgMissing = missingColumns.reduce((sum, col) => sum + col.nullPercentage, 0) / missingColumns.length;

  if (avgMissing > 20) {
    const highMissing = missingColumns.filter(c => c.nullPercentage > 40);
    const confidence = calculateBayesianConfidence({
      priorProbability: 0.3, // 30% base rate for systematic missing data
      likelihood: Math.min(avgMissing / 50, 1.0), // Higher missing % = stronger evidence
      evidenceCount: highMissing.length,
      totalObservations: profile.columns.length
    });

    theories.push({
      id: `missing-systematic-${profile.datasetId}`,
      hypothesis: highMissing.length > 1
        ? `Missing data follows a systematic pattern across ${highMissing.length} columns: ${highMissing.map(c => c.name).slice(0, 3).join(', ')}`
        : `Missing data in ${missingColumns[0].name} is likely Missing At Random (MAR) or Missing Not At Random (MNAR)`,
      alternativeHypothesis: 'Missing data is completely random (MCAR) with no underlying pattern',
      confidenceScore: confidence,
      evidenceStrength: confidence > 0.75 ? 'very_strong' : confidence > 0.55 ? 'strong' : confidence > 0.35 ? 'moderate' : 'weak',
      statisticalTests: [{
        testName: 'Missing Data Pattern Analysis',
        testStatistic: avgMissing,
        result: avgMissing > 30 ? 'reject_null' : 'fail_to_reject',
        interpretation: `Average missing rate of ${avgMissing.toFixed(1)}% suggests ${avgMissing > 30 ? 'systematic' : 'potentially random'} missingness`
      }],
      supportingEvidence: missingColumns.map(col => ({
        type: 'missing_data' as const,
        description: `${col.name}: ${col.nullPercentage.toFixed(1)}% missing`,
        strength: Math.min(col.nullPercentage / 50, 1.0),
        source: col.name
      })),
      contradictingEvidence: [],
      openQuestions: [
        'Is missing data correlated with specific time periods or user cohorts?',
        'Are missing values concentrated in specific rows (case deletion) or columns?',
        'Could external factors (data collection issues, user behavior) explain the pattern?',
        highMissing.length > 0 ? `Why do ${highMissing.map(c => c.name).join(', ')} have particularly high missing rates?` : null
      ].filter((q): q is string => q !== null),
      suggestedActions: [
        {
          action: 'Cross-reference missing data with temporal columns',
          rationale: 'Missing data may correlate with time periods (e.g., system outages, seasonal effects)',
          expectedOutcome: 'Identify if missingness is time-dependent',
          priority: 'high' as const
        },
        {
          action: 'Perform Little\'s MCAR test if applicable',
          rationale: 'Statistical test to distinguish between MCAR, MAR, and MNAR',
          expectedOutcome: 'Definitive classification of missing data mechanism',
          priority: 'medium' as const
        },
        {
          action: 'Investigate data collection pipeline',
          rationale: 'High missing rates often indicate upstream data quality issues',
          expectedOutcome: 'Identify root cause in ETL or data entry processes',
          priority: highMissing.length > 2 ? 'high' as const : 'medium' as const
        }
      ],
      priority: Math.min(avgMissing * 1.5, 100),
      caseType: 'missing_data_pattern',
      severity: avgMissing > 40 ? 'high' : avgMissing > 20 ? 'medium' : 'low'
    });
  }

  return theories;
}

/**
 * Generate theories from correlation patterns
 */
export function generateCorrelationTheories(
  profile: DatasetProfile
): DataTheory[] {
  const theories: DataTheory[] = [];
  const correlationAnalyses = profile.analyses.filter(a => a.type === 'correlation');

  if (correlationAnalyses.length === 0) return theories;

  // Group correlations by strength
  const strongCorrs = correlationAnalyses.filter(a => {
    const r = a.result?.best_strength ?? a.result?.correlation ?? 0;
    return Math.abs(r) > 0.7;
  });

  const moderateCorrs = correlationAnalyses.filter(a => {
    const r = a.result?.best_strength ?? a.result?.correlation ?? 0;
    return Math.abs(r) > 0.45 && Math.abs(r) <= 0.7;
  });

  // Theory: Multicollinearity or underlying latent variable
  if (strongCorrs.length >= 3) {
    const confidence = calculateBayesianConfidence({
      priorProbability: 0.25,
      likelihood: Math.min(strongCorrs.length / 5, 1.0),
      evidenceCount: strongCorrs.length,
      totalObservations: correlationAnalyses.length
    });

    theories.push({
      id: `correlation-multicollinearity-${profile.datasetId}`,
      hypothesis: `Multiple strong correlations detected (${strongCorrs.length} pairs) suggest an underlying latent variable or redundant features`,
      alternativeHypothesis: 'Strong correlations are coincidental or represent independent causal relationships',
      confidenceScore: confidence,
      evidenceStrength: confidence > 0.7 ? 'very_strong' : confidence > 0.5 ? 'strong' : 'moderate',
      statisticalTests: [{
        testName: 'Correlation Strength Distribution',
        testStatistic: strongCorrs.length,
        result: strongCorrs.length >= 3 ? 'reject_null' : 'inconclusive',
        interpretation: `${strongCorrs.length} strong correlations (|r| > 0.7) indicate potential multicollinearity`
      }],
      supportingEvidence: strongCorrs.map(a => ({
        type: 'correlation' as const,
        description: `Strong correlation detected: ${a.column ?? 'unknown'}`,
        strength: Math.abs(a.result?.best_strength ?? a.result?.correlation ?? 0),
        source: a.column ?? 'correlation analysis',
        metrics: {
          correlation: a.result?.best_strength ?? a.result?.correlation,
          metric_type: a.result?.best_metric
        }
      })),
      contradictingEvidence: moderateCorrs.length > strongCorrs.length * 2 ? [{
        type: 'correlation' as const,
        description: 'Many weak-to-moderate correlations suggest independence',
        strength: 0.3,
        source: 'correlation distribution'
      }] : [],
      openQuestions: [
        'What is the underlying latent variable driving these correlations?',
        'Are correlated features measuring the same underlying construct?',
        'Should we perform factor analysis or PCA to extract principal components?',
        'Could these correlations be spurious due to confounding variables?'
      ],
      suggestedActions: [
        {
          action: 'Perform Principal Component Analysis (PCA)',
          rationale: 'PCA can reveal underlying structure and reduce dimensionality',
          expectedOutcome: 'Identify latent factors and reduce feature redundancy',
          priority: 'high' as const,
          toolsRequired: ['PCA analysis tool']
        },
        {
          action: 'Calculate Variance Inflation Factor (VIF)',
          rationale: 'VIF quantifies multicollinearity severity for regression models',
          expectedOutcome: 'Numerical assessment of multicollinearity impact',
          priority: 'medium' as const
        },
        {
          action: 'Examine temporal relationships',
          rationale: 'Strong correlations may be time-dependent or lagged',
          expectedOutcome: 'Understand causal directionality',
          priority: 'medium' as const
        }
      ],
      priority: Math.min(strongCorrs.length * 15, 95),
      caseType: 'correlation_pattern',
      severity: strongCorrs.length > 5 ? 'medium' : 'low'
    });
  }

  return theories;
}

/**
 * Generate theories from anomaly and outlier patterns
 */
export function generateAnomalyTheories(
  profile: DatasetProfile
): DataTheory[] {
  const theories: DataTheory[] = [];
  const anomalyAnalyses = profile.analyses.filter(a =>
    a.type === 'anomaly' || a.type === 'outlier'
  );

  if (anomalyAnalyses.length === 0) return theories;

  // Check for widespread anomalies
  const highAnomalyRate = anomalyAnalyses.filter(a => {
    const share = a.result?.share ?? 0;
    return share > 5; // More than 5% anomalies
  });

  if (highAnomalyRate.length > 0) {
    const avgAnomalyRate = highAnomalyRate.reduce((sum, a) => sum + (a.result?.share ?? 0), 0) / highAnomalyRate.length;

    const confidence = calculateBayesianConfidence({
      priorProbability: 0.15, // 15% base rate for data quality issues
      likelihood: Math.min(avgAnomalyRate / 10, 1.0),
      evidenceCount: highAnomalyRate.length,
      totalObservations: profile.columns.filter(c => c.type === 'number').length
    });

    theories.push({
      id: `anomaly-data-quality-${profile.datasetId}`,
      hypothesis: `High anomaly rate (${avgAnomalyRate.toFixed(1)}% avg across ${highAnomalyRate.length} columns) suggests systematic data quality issues or measurement errors`,
      alternativeHypothesis: 'Anomalies represent genuine extreme values from a heavy-tailed distribution',
      confidenceScore: confidence,
      evidenceStrength: confidence > 0.7 ? 'very_strong' : confidence > 0.5 ? 'strong' : 'moderate',
      statisticalTests: [{
        testName: 'Anomaly Rate Analysis',
        testStatistic: avgAnomalyRate,
        result: avgAnomalyRate > 10 ? 'reject_null' : 'inconclusive',
        interpretation: `Anomaly rate of ${avgAnomalyRate.toFixed(1)}% ${avgAnomalyRate > 10 ? 'significantly exceeds' : 'is within'} expected range for normal distributions`
      }],
      supportingEvidence: highAnomalyRate.map(a => ({
        type: 'anomaly' as const,
        description: `${a.column}: ${a.result?.total_anomalies ?? 0} anomalies (${a.result?.share?.toFixed(1)}%)`,
        strength: Math.min((a.result?.share ?? 0) / 15, 1.0),
        source: a.column ?? 'anomaly detection',
        metrics: {
          anomaly_count: a.result?.total_anomalies,
          anomaly_percentage: a.result?.share
        }
      })),
      contradictingEvidence: [],
      openQuestions: [
        'Are anomalies concentrated in specific time periods or data batches?',
        'Could anomalies be legitimate outliers from heavy-tailed distributions?',
        'Is there a common root cause (sensor malfunction, data entry error, ETL bug)?',
        'Do anomalies correlate with other variables (user type, geography, etc.)?'
      ],
      suggestedActions: [
        {
          action: 'Inspect anomalous records in detail',
          rationale: 'Manual review can reveal patterns invisible to statistical tests',
          expectedOutcome: 'Identify common characteristics of anomalous data',
          priority: 'high' as const
        },
        {
          action: 'Validate data collection instrumentation',
          rationale: 'Sensor drift or measurement errors often cause systematic anomalies',
          expectedOutcome: 'Identify hardware/software issues in data pipeline',
          priority: 'high' as const
        },
        {
          action: 'Test for distribution type (e.g., Kolmogorov-Smirnov test)',
          rationale: 'Determine if data follows expected distribution or has heavy tails',
          expectedOutcome: 'Statistical evidence for distribution assumptions',
          priority: 'medium' as const
        }
      ],
      priority: Math.min(avgAnomalyRate * 8, 100),
      caseType: 'anomaly_pattern',
      severity: avgAnomalyRate > 15 ? 'high' : avgAnomalyRate > 8 ? 'medium' : 'low'
    });
  }

  return theories;
}

/**
 * Generate theories from trend patterns
 */
export function generateTrendTheories(
  profile: DatasetProfile
): DataTheory[] {
  const theories: DataTheory[] = [];
  const trendAnalyses = profile.analyses.filter(a => a.type === 'trend' || a.type === 'timeseries');

  if (trendAnalyses.length === 0) return theories;

  // Look for strong trends
  const strongTrends = trendAnalyses.filter(a => {
    const strength = a.result?.strength ?? 0;
    return strength > 0.6;
  });

  if (strongTrends.length > 0) {
    const upTrends = strongTrends.filter(a => a.result?.direction === 'up');
    const downTrends = strongTrends.filter(a => a.result?.direction === 'down');

    const dominantDirection = upTrends.length > downTrends.length ? 'increasing' : 'decreasing';
    const dominantCount = Math.max(upTrends.length, downTrends.length);

    const confidence = calculateBayesianConfidence({
      priorProbability: 0.2,
      likelihood: Math.min(dominantCount / 3, 1.0),
      evidenceCount: strongTrends.length,
      totalObservations: profile.columns.filter(c => c.type === 'number').length
    });

    theories.push({
      id: `trend-systematic-${profile.datasetId}`,
      hypothesis: `Systematic ${dominantDirection} trend detected across ${dominantCount} variables, suggesting temporal drift or non-stationarity`,
      alternativeHypothesis: 'Trends are random fluctuations without underlying temporal pattern',
      confidenceScore: confidence,
      evidenceStrength: confidence > 0.7 ? 'very_strong' : confidence > 0.5 ? 'strong' : 'moderate',
      statisticalTests: [{
        testName: 'Trend Strength Analysis',
        testStatistic: dominantCount,
        result: dominantCount >= 2 ? 'reject_null' : 'inconclusive',
        interpretation: `${dominantCount} strong ${dominantDirection} trends indicate temporal non-stationarity`
      }],
      supportingEvidence: strongTrends.map(a => ({
        type: 'trend' as const,
        description: `${a.column}: ${a.result?.direction} trend (strength: ${a.result?.strength?.toFixed(2)})`,
        strength: a.result?.strength ?? 0,
        source: a.column ?? 'trend analysis'
      })),
      contradictingEvidence: [],
      openQuestions: [
        'What external factors could explain the temporal trend?',
        'Is the trend linear or accelerating/decelerating?',
        'Are trends cyclical (seasonality) or monotonic?',
        'Will the trend continue, plateau, or reverse?'
      ],
      suggestedActions: [
        {
          action: 'Perform stationarity tests (ADF, KPSS)',
          rationale: 'Confirm non-stationarity and guide forecasting approach',
          expectedOutcome: 'Statistical evidence for trend persistence',
          priority: 'high' as const
        },
        {
          action: 'Build time series forecasting model',
          rationale: 'Predict future values and identify change points',
          expectedOutcome: 'Forecasts with confidence intervals',
          priority: 'medium' as const,
          toolsRequired: ['ARIMA', 'Prophet', 'Exponential Smoothing']
        },
        {
          action: 'Investigate business/operational changes',
          rationale: 'Trends often reflect policy changes, market shifts, or operational adjustments',
          expectedOutcome: 'Contextual explanation for observed trends',
          priority: 'high' as const
        }
      ],
      priority: Math.min(strongTrends.length * 20, 95),
      caseType: 'trend_pattern',
      severity: strongTrends.length > 3 ? 'medium' : 'low'
    });
  }

  return theories;
}

/**
 * Calculate Bayesian confidence using prior probability and evidence
 */
function calculateBayesianConfidence(params: {
  priorProbability: number;
  likelihood: number;
  evidenceCount: number;
  totalObservations: number;
}): number {
  const { priorProbability, likelihood, evidenceCount, totalObservations } = params;

  // Bayesian update: P(H|E) = P(E|H) * P(H) / P(E)
  // Simplified: Use evidence strength to update prior

  // Evidence ratio (how much of total data supports hypothesis)
  const evidenceRatio = evidenceCount / Math.max(totalObservations, 1);

  // Combine prior with likelihood and evidence ratio
  const posterior = priorProbability * likelihood * (1 + evidenceRatio);

  // Normalize to [0, 1]
  return Math.min(Math.max(posterior, 0), 1);
}

/**
 * Generate all theories for a dataset
 */
export async function generateAllTheories(
  db: DatabaseBinding,
  datasetId: number
): Promise<DataTheory[]> {
  // Fetch dataset profile
  const profile = await fetchDatasetProfile(db, datasetId);

  if (!profile) {
    return [];
  }

  // Generate theories from different angles
  const allTheories = [
    ...generateMissingDataTheories(profile),
    ...generateCorrelationTheories(profile),
    ...generateAnomalyTheories(profile),
    ...generateTrendTheories(profile)
  ];

  // Sort by priority
  allTheories.sort((a, b) => b.priority - a.priority);

  return allTheories;
}

/**
 * Fetch dataset profile for theory generation
 */
async function fetchDatasetProfile(
  db: DatabaseBinding,
  datasetId: number
): Promise<DatasetProfile | null> {
  // Fetch dataset metadata
  const dataset = await db.prepare('SELECT * FROM datasets WHERE id = ?')
    .bind(datasetId)
    .first<any>();

  if (!dataset) return null;

  const columns = JSON.parse(dataset.columns || '[]');

  // Fetch analyses
  const analysesResult = await db.prepare(
    'SELECT analysis_type, column_name, result, confidence FROM analyses WHERE dataset_id = ?'
  ).bind(datasetId).all<any>();

  const analyses = analysesResult.results.map(a => ({
    type: a.analysis_type,
    column: a.column_name,
    result: typeof a.result === 'string' ? JSON.parse(a.result) : a.result,
    confidence: a.confidence
  }));

  return {
    datasetId,
    columns: columns.map((col: any) => ({
      name: col.name,
      type: col.type,
      nullPercentage: (col.profile?.null_count / col.profile?.total_count * 100) || 0,
      uniqueRatio: col.profile?.unique_ratio || 0,
      stats: col.profile?.stats
    })),
    analyses,
    rowCount: dataset.row_count
  };
}
