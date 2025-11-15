// Anomaly Explanation Engine
// Explains WHY anomalies exist rather than just detecting them

export interface AnomalyExplanation {
  anomalyId: string;
  columnName: string;
  value: number | string;
  isOutlier: boolean;
  primaryCause: Cause;
  alternativeCauses: Cause[];
  contextualFactors: ContextualFactor[];
  confidence: number; // 0-1
  actionableInsights: string[];
  recommendedActions: ExplanationAction[];
}

export interface Cause {
  type: 'data_entry_error' | 'measurement_error' | 'natural_variation' | 'systemic_issue' | 'seasonal_pattern' | 'data_corruption' | 'edge_case' | 'legitimate_outlier';
  name: string;
  probability: number; // 0-1
  evidence: Evidence[];
  explanation: string;
}

export interface Evidence {
  type: 'statistical' | 'pattern' | 'contextual' | 'temporal' | 'distributional';
  description: string;
  strength: 'strong' | 'moderate' | 'weak';
  supportsPrimary: boolean;
}

export interface ContextualFactor {
  factor: string;
  description: string;
  impact: 'increases_likelihood' | 'decreases_likelihood' | 'neutral';
}

export interface ExplanationAction {
  action: string;
  description: string;
  actionType: 'investigate' | 'correct' | 'flag' | 'accept' | 'review_similar';
}

export interface AnomalyExplanationReport {
  datasetId: number;
  datasetName: string;
  totalAnomalies: number;
  explainedAnomalies: number;
  explanations: AnomalyExplanation[];
  summary: {
    dataEntryErrors: number;
    measurementErrors: number;
    naturalVariation: number;
    systemicIssues: number;
    seasonalPatterns: number;
    dataCorruption: number;
    edgeCases: number;
    legitimateOutliers: number;
  };
  generatedAt: string;
}

/**
 * Calculate statistical deviation score
 */
function calculateDeviationScore(
  value: number,
  mean: number,
  stddev: number
): number {
  if (stddev === 0) return 0;
  return Math.abs((value - mean) / stddev);
}

/**
 * Detect if value is a potential data entry error
 */
function detectDataEntryError(
  value: number,
  columnName: string,
  stats: { min: number; max: number; mean: number; stddev: number }
): { isLikely: boolean; evidence: Evidence[] } {
  const evidence: Evidence[] = [];
  let isLikely = false;

  // Check for common data entry patterns

  // Negative values in fields that should be positive
  if (value < 0 && (
    columnName.toLowerCase().includes('age') ||
    columnName.toLowerCase().includes('count') ||
    columnName.toLowerCase().includes('price') ||
    columnName.toLowerCase().includes('amount') ||
    columnName.toLowerCase().includes('quantity')
  )) {
    evidence.push({
      type: 'contextual',
      description: `Negative value in field "${columnName}" which typically contains positive values`,
      strength: 'strong',
      supportsPrimary: true
    });
    isLikely = true;
  }

  // Extreme age values
  if (columnName.toLowerCase().includes('age')) {
    if (value > 120) {
      evidence.push({
        type: 'contextual',
        description: `Age value ${value} exceeds realistic human lifespan`,
        strength: 'strong',
        supportsPrimary: true
      });
      isLikely = true;
    } else if (value < 0) {
      evidence.push({
        type: 'contextual',
        description: `Negative age value is impossible`,
        strength: 'strong',
        supportsPrimary: true
      });
      isLikely = true;
    }
  }

  // Check for obvious typos (like extra zeros: 1000 instead of 100)
  if (value > stats.mean * 10 && value % 10 === 0) {
    const reducedValue = value / 10;
    const reducedDeviation = calculateDeviationScore(reducedValue, stats.mean, stats.stddev);

    if (reducedDeviation < 2) {
      evidence.push({
        type: 'pattern',
        description: `Value ${value} may be a typo; ${reducedValue} (10x smaller) would fit distribution better`,
        strength: 'moderate',
        supportsPrimary: true
      });
      isLikely = true;
    }
  }

  // Check for decimal point errors (12.5 entered as 125)
  if (value > stats.mean * 5) {
    const decimalShifted = value / 10;
    const decimalDeviation = calculateDeviationScore(decimalShifted, stats.mean, stats.stddev);

    if (decimalDeviation < 2) {
      evidence.push({
        type: 'pattern',
        description: `Value ${value} may have decimal point error; ${decimalShifted} would be more typical`,
        strength: 'moderate',
        supportsPrimary: true
      });
      isLikely = true;
    }
  }

  return { isLikely, evidence };
}

/**
 * Detect if value is from natural variation
 */
function detectNaturalVariation(
  value: number,
  stats: { mean: number; stddev: number; min: number; max: number }
): { isLikely: boolean; evidence: Evidence[] } {
  const evidence: Evidence[] = [];
  const zScore = calculateDeviationScore(value, stats.mean, stats.stddev);

  // Value is within expected range but still flagged as outlier
  if (zScore >= 2 && zScore < 4) {
    evidence.push({
      type: 'statistical',
      description: `Z-score of ${zScore.toFixed(2)} indicates value is unusual but within natural variation (2-4 standard deviations)`,
      strength: 'moderate',
      supportsPrimary: true
    });

    return { isLikely: true, evidence };
  }

  return { isLikely: false, evidence };
}

/**
 * Detect systemic issues
 */
function detectSystemicIssue(
  value: number,
  allOutliers: number[],
  stats: { mean: number; stddev: number }
): { isLikely: boolean; evidence: Evidence[] } {
  const evidence: Evidence[] = [];

  // Check if multiple outliers cluster at similar values
  const similarOutliers = allOutliers.filter(v =>
    Math.abs(v - value) / (stats.stddev || 1) < 1
  );

  if (similarOutliers.length >= 3) {
    evidence.push({
      type: 'pattern',
      description: `${similarOutliers.length} outliers cluster near this value, suggesting systematic pattern`,
      strength: 'strong',
      supportsPrimary: true
    });

    return { isLikely: true, evidence };
  }

  // Check if outliers all share common characteristic (e.g., all very high or all very low)
  const highOutliers = allOutliers.filter(v => v > stats.mean);
  const lowOutliers = allOutliers.filter(v => v < stats.mean);

  if (highOutliers.length > lowOutliers.length * 3 || lowOutliers.length > highOutliers.length * 3) {
    evidence.push({
      type: 'distributional',
      description: `Outliers are predominantly ${highOutliers.length > lowOutliers.length ? 'high' : 'low'}, suggesting systematic bias`,
      strength: 'moderate',
      supportsPrimary: true
    });

    return { isLikely: true, evidence };
  }

  return { isLikely: false, evidence };
}

/**
 * Detect measurement errors
 */
function detectMeasurementError(
  value: number,
  columnName: string,
  stats: { mean: number; stddev: number }
): { isLikely: boolean; evidence: Evidence[] } {
  const evidence: Evidence[] = [];
  const zScore = calculateDeviationScore(value, stats.mean, stats.stddev);

  // Very extreme outliers (>5 SD) in measurement-type columns
  if (zScore > 5 && (
    columnName.toLowerCase().includes('measure') ||
    columnName.toLowerCase().includes('sensor') ||
    columnName.toLowerCase().includes('temp') ||
    columnName.toLowerCase().includes('pressure') ||
    columnName.toLowerCase().includes('voltage')
  )) {
    evidence.push({
      type: 'contextual',
      description: `Extreme deviation (${zScore.toFixed(1)} SD) in measurement column suggests sensor/instrument malfunction`,
      strength: 'strong',
      supportsPrimary: true
    });

    return { isLikely: true, evidence };
  }

  // Round numbers in precise measurement fields
  if (value % 100 === 0 && (
    columnName.toLowerCase().includes('measure') ||
    columnName.toLowerCase().includes('sensor')
  )) {
    evidence.push({
      type: 'pattern',
      description: `Suspiciously round value (${value}) in precise measurement field`,
      strength: 'weak',
      supportsPrimary: true
    });

    return { isLikely: true, evidence };
  }

  return { isLikely: false, evidence };
}

/**
 * Detect if value is a legitimate edge case
 */
function detectEdgeCase(
  value: number,
  stats: { min: number; max: number; mean: number },
  percentilePosition: number
): { isLikely: boolean; evidence: Evidence[] } {
  const evidence: Evidence[] = [];

  // Value at extreme percentile but still plausible
  if (percentilePosition > 0.99 || percentilePosition < 0.01) {
    evidence.push({
      type: 'statistical',
      description: `Value at ${(percentilePosition * 100).toFixed(1)}th percentile represents rare but valid case`,
      strength: 'moderate',
      supportsPrimary: true
    });

    return { isLikely: true, evidence };
  }

  return { isLikely: false, evidence };
}

/**
 * Generate contextual factors
 */
function generateContextualFactors(
  value: number,
  columnName: string,
  stats: { mean: number; stddev: number; min: number; max: number },
  hasTimestamp: boolean
): ContextualFactor[] {
  const factors: ContextualFactor[] = [];

  const zScore = calculateDeviationScore(value, stats.mean, stats.stddev);

  if (zScore > 3) {
    factors.push({
      factor: 'Extreme deviation',
      description: `Value is ${zScore.toFixed(1)} standard deviations from mean`,
      impact: 'increases_likelihood'
    });
  }

  if (value === stats.min || value === stats.max) {
    factors.push({
      factor: 'Boundary value',
      description: 'Value is at the extreme boundary of observed range',
      impact: 'increases_likelihood'
    });
  }

  if (hasTimestamp) {
    factors.push({
      factor: 'Temporal data available',
      description: 'Timeline analysis could reveal seasonal or trend-based explanations',
      impact: 'neutral'
    });
  }

  const range = stats.max - stats.min;
  const dataSpread = range / (stats.mean || 1);

  if (dataSpread > 10) {
    factors.push({
      factor: 'High data variability',
      description: 'Dataset shows significant natural variation',
      impact: 'decreases_likelihood'
    });
  }

  return factors;
}

/**
 * Generate recommended actions
 */
function generateRecommendedActions(primaryCause: Cause['type']): ExplanationAction[] {
  const actionMap: Record<Cause['type'], ExplanationAction[]> = {
    'data_entry_error': [
      {
        action: 'Review and correct',
        description: 'Manually verify the value and correct if erroneous',
        actionType: 'correct'
      },
      {
        action: 'Check source data',
        description: 'Verify against original data source',
        actionType: 'investigate'
      },
      {
        action: 'Find similar cases',
        description: 'Look for similar entry errors in other records',
        actionType: 'review_similar'
      }
    ],
    'measurement_error': [
      {
        action: 'Flag for review',
        description: 'Mark value as potentially erroneous measurement',
        actionType: 'flag'
      },
      {
        action: 'Check instrument logs',
        description: 'Review measurement equipment status during this period',
        actionType: 'investigate'
      }
    ],
    'natural_variation': [
      {
        action: 'Accept as valid',
        description: 'Value represents natural variation in the data',
        actionType: 'accept'
      },
      {
        action: 'Review context',
        description: 'Examine surrounding data points for patterns',
        actionType: 'investigate'
      }
    ],
    'systemic_issue': [
      {
        action: 'Investigate pattern',
        description: 'Examine all similar anomalies for root cause',
        actionType: 'investigate'
      },
      {
        action: 'Review data pipeline',
        description: 'Check data collection and processing procedures',
        actionType: 'investigate'
      }
    ],
    'seasonal_pattern': [
      {
        action: 'Analyze timeline',
        description: 'Check for seasonal or cyclical patterns',
        actionType: 'investigate'
      },
      {
        action: 'Accept as seasonal',
        description: 'Value may reflect legitimate seasonal variation',
        actionType: 'accept'
      }
    ],
    'data_corruption': [
      {
        action: 'Remove value',
        description: 'Exclude corrupted value from analysis',
        actionType: 'correct'
      },
      {
        action: 'Check data integrity',
        description: 'Verify data storage and transmission integrity',
        actionType: 'investigate'
      }
    ],
    'edge_case': [
      {
        action: 'Document case',
        description: 'Record as legitimate edge case for future reference',
        actionType: 'flag'
      },
      {
        action: 'Accept as rare event',
        description: 'Acknowledge as valid but rare occurrence',
        actionType: 'accept'
      }
    ],
    'legitimate_outlier': [
      {
        action: 'Accept as valid',
        description: 'Value represents a true outlier in the population',
        actionType: 'accept'
      },
      {
        action: 'Study outlier characteristics',
        description: 'Analyze what makes this case unique',
        actionType: 'investigate'
      }
    ]
  };

  return actionMap[primaryCause] || [];
}

/**
 * Explain a single anomaly
 */
export function explainAnomaly(
  anomalyValue: number,
  columnName: string,
  columnStats: {
    mean: number;
    stddev: number;
    min: number;
    max: number;
  },
  allOutliers: number[],
  hasTimestamp: boolean,
  rowIndex?: number
): AnomalyExplanation {
  const causes: Cause[] = [];

  // Test each possible cause
  const dataEntry = detectDataEntryError(anomalyValue, columnName, columnStats);
  if (dataEntry.isLikely) {
    causes.push({
      type: 'data_entry_error',
      name: 'Data Entry Error',
      probability: 0.7,
      evidence: dataEntry.evidence,
      explanation: 'Value likely resulted from human or system error during data entry, such as a typo, decimal point error, or negative sign error.'
    });
  }

  const measurement = detectMeasurementError(anomalyValue, columnName, columnStats);
  if (measurement.isLikely) {
    causes.push({
      type: 'measurement_error',
      name: 'Measurement Error',
      probability: 0.65,
      evidence: measurement.evidence,
      explanation: 'Value may be caused by faulty measurement equipment, sensor malfunction, or instrument calibration issues.'
    });
  }

  const systemic = detectSystemicIssue(anomalyValue, allOutliers, columnStats);
  if (systemic.isLikely) {
    causes.push({
      type: 'systemic_issue',
      name: 'Systemic Issue',
      probability: 0.75,
      evidence: systemic.evidence,
      explanation: 'Anomaly appears to be part of a systematic pattern affecting multiple values, suggesting a data pipeline or process issue.'
    });
  }

  const natural = detectNaturalVariation(anomalyValue, columnStats);
  if (natural.isLikely) {
    causes.push({
      type: 'natural_variation',
      name: 'Natural Variation',
      probability: 0.6,
      evidence: natural.evidence,
      explanation: 'Value falls within expected natural variation for this variable, albeit at the high or low end of the distribution.'
    });
  }

  const percentilePosition = 0.99; // Simplified - would need full dataset to calculate properly
  const edgeCase = detectEdgeCase(anomalyValue, columnStats, percentilePosition);
  if (edgeCase.isLikely) {
    causes.push({
      type: 'edge_case',
      name: 'Edge Case',
      probability: 0.55,
      evidence: edgeCase.evidence,
      explanation: 'Value represents a rare but legitimate edge case in the data distribution.'
    });
  }

  // If no specific causes identified, mark as legitimate outlier
  if (causes.length === 0) {
    causes.push({
      type: 'legitimate_outlier',
      name: 'Legitimate Outlier',
      probability: 0.5,
      evidence: [{
        type: 'statistical',
        description: 'No specific error pattern detected',
        strength: 'moderate',
        supportsPrimary: true
      }],
      explanation: 'Value appears to be a genuine outlier without obvious error indicators.'
    });
  }

  // Sort by probability
  causes.sort((a, b) => b.probability - a.probability);

  const primaryCause = causes[0];
  const alternativeCauses = causes.slice(1);

  const contextualFactors = generateContextualFactors(
    anomalyValue,
    columnName,
    columnStats,
    hasTimestamp
  );

  const recommendedActions = generateRecommendedActions(primaryCause.type);

  const actionableInsights: string[] = [];

  // Generate actionable insights
  if (primaryCause.type === 'data_entry_error') {
    actionableInsights.push('Manual review recommended - value shows signs of data entry error');
    actionableInsights.push(`Check if value should be corrected or removed`);
  } else if (primaryCause.type === 'systemic_issue') {
    actionableInsights.push('Review all similar outliers - may indicate process issue');
    actionableInsights.push('Investigate data collection procedures');
  } else if (primaryCause.type === 'natural_variation') {
    actionableInsights.push('Value likely valid - represents natural variation');
    actionableInsights.push('Consider keeping in analysis with robust methods');
  }

  return {
    anomalyId: `anomaly-${columnName}-${rowIndex || 0}`,
    columnName,
    value: anomalyValue,
    isOutlier: true,
    primaryCause,
    alternativeCauses,
    contextualFactors,
    confidence: primaryCause.probability,
    actionableInsights,
    recommendedActions
  };
}

/**
 * Generate explanation report for all anomalies in a dataset
 */
export async function generateAnomalyExplanations(
  db: any,
  datasetId: number
): Promise<AnomalyExplanationReport | null> {
  try {
    // Fetch dataset info
    const dataset = await db
      .prepare('SELECT id, name FROM datasets WHERE id = ?')
      .bind(datasetId)
      .first();

    if (!dataset) {
      return null;
    }

    // Fetch outlier/anomaly analyses
    const analyses = await db
      .prepare('SELECT * FROM analyses WHERE dataset_id = ? AND (analysis_type = ? OR analysis_type = ?)')
      .bind(datasetId, 'outlier', 'anomaly')
      .all();

    const analysisData = analyses.results || [];

    if (analysisData.length === 0) {
      return null;
    }

    // Fetch column metadata for stats
    const columns = await db
      .prepare('SELECT * FROM column_metadata WHERE dataset_id = ?')
      .bind(datasetId)
      .all();

    const columnData = columns.results || [];

    // Check if dataset has timestamp
    const hasTimestamp = columnData.some(c =>
      c.column_type === 'timestamp' || c.column_name.toLowerCase().includes('date') || c.column_name.toLowerCase().includes('time')
    );

    const explanations: AnomalyExplanation[] = [];
    const summary = {
      dataEntryErrors: 0,
      measurementErrors: 0,
      naturalVariation: 0,
      systemicIssues: 0,
      seasonalPatterns: 0,
      dataCorruption: 0,
      edgeCases: 0,
      legitimateOutliers: 0
    };

    // Process each anomaly analysis
    for (const analysis of analysisData) {
      const columnName = analysis.column_name;
      if (!columnName) continue;

      const columnMeta = columnData.find(c => c.column_name === columnName);
      if (!columnMeta) continue;

      const stats = {
        mean: columnMeta.mean_value || 0,
        stddev: columnMeta.stddev_value || 1,
        min: columnMeta.min_value || 0,
        max: columnMeta.max_value || 0
      };

      // Extract outliers
      const outliers = analysis.result?.outliers || [];
      const outlierValues = Array.isArray(outliers)
        ? outliers.map((o: any) => typeof o === 'number' ? o : o.value)
        : [];

      // Explain each outlier (limit to first 10 per column to avoid overwhelming)
      const outliersToExplain = outlierValues.slice(0, 10);

      for (let i = 0; i < outliersToExplain.length; i++) {
        const outlierValue = outliersToExplain[i];

        const explanation = explainAnomaly(
          outlierValue,
          columnName,
          stats,
          outlierValues,
          hasTimestamp,
          i
        );

        explanations.push(explanation);

        // Update summary
        switch (explanation.primaryCause.type) {
          case 'data_entry_error': summary.dataEntryErrors++; break;
          case 'measurement_error': summary.measurementErrors++; break;
          case 'natural_variation': summary.naturalVariation++; break;
          case 'systemic_issue': summary.systemicIssues++; break;
          case 'seasonal_pattern': summary.seasonalPatterns++; break;
          case 'data_corruption': summary.dataCorruption++; break;
          case 'edge_case': summary.edgeCases++; break;
          case 'legitimate_outlier': summary.legitimateOutliers++; break;
        }
      }
    }

    const totalAnomalies = analysisData.reduce((sum, a) => {
      const outliers = a.result?.outliers || [];
      return sum + (Array.isArray(outliers) ? outliers.length : 0);
    }, 0);

    return {
      datasetId,
      datasetName: dataset.name,
      totalAnomalies,
      explainedAnomalies: explanations.length,
      explanations,
      summary,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating anomaly explanations:', error);
    return null;
  }
}
