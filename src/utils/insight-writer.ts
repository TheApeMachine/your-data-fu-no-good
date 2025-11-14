import type { ColumnDefinition, FeatureSuggestion } from '../types';
import type { Stats, TimeSeriesStats } from './statistics';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface InsightAction {
  id: string;
  label: string;
  payload?: Record<string, unknown>;
}

export interface InsightDescription {
  text: string;
  actions?: InsightAction[];
}

interface InsightNarrative {
  meaning: string;
  impact?: string;
  action?: string;
  signal?: string;
}

const DECIMAL = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const COMPACT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

const FEATURE_LABELS: Record<string, string> = {
  log1p: 'log-scaled helper',
  standardize: 'normalised helper',
  one_hot_encoding: 'category indicator helpers',
  datetime_components: 'calendar breakdown helpers',
  extract_domain: 'email domain helper',
  extract_host: 'website host helper',
  missing_indicator: 'missing-data flag',
  identifier_encoding: 'ID summary helpers',
};

function friendlyTransformationName(transformation: string): string {
  return FEATURE_LABELS[transformation] ?? transformation.replace(/_/g, ' ');
}

function buildFeatureActionLabel(transformation: string, columns: string[]): string {
  const friendly = friendlyTransformationName(transformation);
  if (!columns.length) {
    return `Apply ${friendly}`;
  }
  const columnLabel = columns.length === 1 ? columns[0] : columns.join(', ');
  switch (transformation) {
    case 'log1p':
      return `Create log helper for ${columnLabel}`;
    case 'standardize':
      return `Create z-score for ${columnLabel}`;
    case 'one_hot_encoding':
      return `Create yes/no columns for ${columnLabel}`;
    case 'datetime_components':
      return `Add calendar helpers for ${columnLabel}`;
    case 'extract_domain':
      return `Extract domain from ${columnLabel}`;
    case 'extract_host':
      return `Extract host from ${columnLabel}`;
    case 'missing_indicator':
      return `Create ${columnLabel} missing flag`;
    case 'identifier_encoding':
      return `Summarise ID ${columnLabel}`;
    default:
      return `Apply ${friendly} for ${columnLabel}`;
  }
}

export interface CorrelationInsightMetrics {
  correlation?: number | null;
  pearson?: number | null;
  spearman?: number | null;
  mutual_information?: number | null;
  normalized_mutual_information?: number | null;
  sample_size?: number;
  sampled_size?: number;
  best_metric?: 'pearson' | 'spearman' | 'nmi';
  best_metric_value?: number;
  best_strength?: number;
}

function formatSigned(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return 'n/a';
  const fixed = value.toFixed(digits);
  return value >= 0 ? `+${fixed}` : fixed;
}

function correlationStrengthLabel(value: number): 'very strong' | 'strong' | 'moderate' | 'weak' {
  if (value >= 0.8) return 'very strong';
  if (value >= 0.6) return 'strong';
  if (value >= 0.45) return 'moderate';
  return 'weak';
}

function safeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return null;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'bigint') {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) ? asNumber : undefined;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function formatNumber(value: unknown): string {
  if (value === null || value === undefined) return 'n/a';

  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  if (typeof value === 'bigint') {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) ? COMPACT.format(asNumber) : `${value.toString()} (big)`;
  }

  const numeric = toNumber(value);
  if (numeric === undefined) {
    return String(value);
  }

  if (Math.abs(numeric) >= 100_000) {
    return COMPACT.format(numeric);
  }

  if (Math.abs(numeric) >= 1) {
    return DECIMAL.format(numeric);
  }

  return numeric.toPrecision(3).replace(/\.?0+$/, '');
}

function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return 'n/a';
  const ratio = value > 1 ? value / 100 : value;
  return `${(ratio * 100).toFixed(digits).replace(/\.0+$/, '')}%`;
}

function composeNarrative(narrative: InsightNarrative): string {
  const segments: string[] = [];
  if (narrative.meaning) {
    segments.push(`<strong>What this means:</strong> ${narrative.meaning}`);
  }
  if (narrative.impact) {
    segments.push(`<strong>Why it matters:</strong> ${narrative.impact}`);
  }
  if (narrative.action) {
    segments.push(`<strong>Suggested next step:</strong> ${narrative.action}`);
  }
  if (narrative.signal) {
    segments.push(`<strong>Data signal:</strong> ${narrative.signal}`);
  }
  return segments.join('<br>');
}

function describeUniqueness(stats: Stats): string {
  const count = stats.count || 0;
  if (count === 0) return 'No rows available';
  const uniqueRatio = stats.uniqueCount / count;
  if (uniqueRatio >= 0.95) {
    return 'Almost every row is unique';
  }
  if (uniqueRatio >= 0.6) {
    return 'A wide variety of values';
  }
  if (uniqueRatio >= 0.25) {
    return 'A healthy mix of repeated and unique values';
  }
  return 'Only a handful of distinct values';
}

export function describeStatistics(column: ColumnDefinition, stats: Stats): InsightDescription {
  const count = stats.count || 0;
  const missingRatio = count > 0 ? stats.nullCount / count : 0;
  const uniqueRatio = count > 0 ? stats.uniqueCount / count : 0;

  const narrative: InsightNarrative = { meaning: '' };
  const actions: InsightAction[] = [];

  if (column.type === 'number') {
    const typical =
      toNumber(stats.median) ??
      toNumber(stats.mean) ??
      toNumber(stats.mode);
    const min = toNumber(stats.min);
    const max = toNumber(stats.max);
    const range = min !== undefined && max !== undefined ? max - min : undefined;
    const stdDev = toNumber(stats.stdDev);
    const mean = toNumber(stats.mean);
    const coeffVar =
      stdDev !== undefined && mean !== undefined && mean !== 0
        ? Math.abs(stdDev / mean)
        : undefined;

    const parts: string[] = [];

    if (typical !== undefined) {
      parts.push(`Typical records land around ${formatNumber(typical)} for ${column.name}.`);
    }

    if (range !== undefined && range !== 0 && min !== undefined && max !== undefined) {
      const longTail = typical !== undefined ? max > typical * 5 : range > Math.abs(min ?? 0) * 5;
      if (longTail) {
        parts.push(`Values stretch from ${formatNumber(min)} up to ${formatNumber(max)}, suggesting a few very large cases alongside everyday activity.`);
      } else {
        parts.push(`Values stay between ${formatNumber(min)} and ${formatNumber(max)}, so this metric is relatively well-behaved.`);
      }

      if (coeffVar !== undefined && coeffVar > 0.8) {
        parts.push('Variation is large compared with the average, so totals can swing sharply when big records arrive.');
      } else if (coeffVar !== undefined && coeffVar < 0.2) {
        parts.push('Variation is small, making this metric predictable across the dataset.');
      }
    }

    if (!parts.length) {
      parts.push(`This numeric column contains ${stats.uniqueCount} different values.`);
    }

    narrative.meaning = parts.join(' ');

    if (coeffVar !== undefined && coeffVar > 1.2) {
      actions.push({
        id: 'view_segment',
        label: 'See top 10% rows',
        payload: {
          column: column.name,
          direction: 'top',
          percentile: 10,
          limit: 25,
          title: `Top 10% of ${column.name}`,
        },
      });
    }

  } else {
    const modeValue = stats.mode ? String(stats.mode) : 'n/a';
    const uniquenessDescription = describeUniqueness(stats);

    narrative.meaning = `${column.name} captures ${stats.uniqueCount} different values. The most common entry is "${modeValue}".`;

    if (uniqueRatio >= 0.8) {
      narrative.impact = `Because ${uniquenessDescription.toLowerCase()}, ${column.name} behaves like free text or an identifier.`;
      narrative.action = `Consider extracting structured features (length, domain, tags) or keeping the raw value for drill-downs only.`;
    } else if (uniqueRatio <= 0.2) {
      narrative.impact = `A handful of categories explain most of the behaviour, which is ideal for segmentation.`;
      narrative.action = `Focus on the top categories and track how their share changes over time.`;
    } else {
      narrative.impact = `${uniquenessDescription}, giving enough variety for meaningful grouping without overwhelming complexity.`;
      narrative.action = `Use ${column.name} when slicing metrics, and roll minor categories into an "Other" bucket to keep charts readable.`;
    }
  }

  narrative.signal = [
    `Missing: ${formatPercent(missingRatio)}`,
    `Distinct share: ${formatPercent(uniqueRatio)}`
  ].join(' · ');

  return {
    text: composeNarrative(narrative),
    actions: actions.length ? actions : undefined,
  };
}

export function describeMissingData(
  column: ColumnDefinition,
  result: { count: number; percentage: number; total: number },
  stats: Stats
): InsightDescription {
  const missingRatio = result.percentage / 100;

  const narrative: InsightNarrative = {
    meaning: `${formatPercent(missingRatio)} of ${column.name} entries are blank (${result.count.toLocaleString()} rows).`
  };
  const actions: InsightAction[] = [];

  if (missingRatio >= 0.5) {
    narrative.impact = `More than half of this column is empty, so any aggregate or model using it will be unreliable.`;
    narrative.action = `Treat ${column.name} as optional until the source system can be fixed, or backfill it from other tables before analysis.`;
  } else if (missingRatio >= 0.2) {
    narrative.impact = `One in five records is missing, which can skew averages or bias model training.`;
    narrative.action = `Add validation in the data pipeline or introduce a default/imputation rule before publishing metrics.`;
  } else if (missingRatio >= 0.05) {
    narrative.impact = `The gap is noticeable; dashboards should flag these blanks so teams can address them.`;
    narrative.action = `Schedule a quick data quality audit and plug the most frequent missing scenarios.`;
  } else {
    narrative.impact = `The occasional blank shouldn't disrupt analysis but is worth monitoring.`;
    narrative.action = `Keep an eye on missing trends and alert if ${formatPercent(missingRatio)} creeps higher.`;
  }

  if (missingRatio >= 0.05) {
    actions.push({
      id: 'open_cleaner',
      label: 'Open cleaning assistant',
      payload: { column: column.name },
    });
  }

  narrative.signal = `Distinct values captured: ${stats.uniqueCount.toLocaleString()}`;

  return {
    text: composeNarrative(narrative),
    actions: actions.length ? actions : undefined,
  };
}

export function describeOutliers(
  column: ColumnDefinition,
  result: { count: number; percentage: number; indices?: number[]; values?: number[] },
  stats: Stats
): InsightDescription {
  const share = result.percentage / 100;
  const narrative: InsightNarrative = {
    meaning: `Detected ${result.count} standout ${column.name} values (~${formatPercent(share)} of rows) far beyond the usual range.`
  };

  if (share >= 0.15) {
    narrative.impact = `This many extreme points will heavily influence totals and forecasts.`;
    narrative.action = `Review the highlighted records and decide whether to cap, split into tiers, or treat them separately.`;
  } else if (share >= 0.05) {
    narrative.impact = `These cases matter because a small cluster of unusual values can distort averages.`;
    narrative.action = `Inspect a sample (e.g. row ${result.indices?.[0] !== undefined ? result.indices[0] + 1 : 'n/a'}) to confirm whether they are data errors or valid outliers.`;
  } else {
    narrative.impact = `Only a few rows are unusual, but they tell you where exceptional performance or data entry mistakes live.`;
    narrative.action = `Tag these rows and decide whether to keep them for hero-story reporting or exclude them from baseline metrics.`;
  }

  const median = toNumber(stats.median);
  const sampleValue = result.values?.[0];
  narrative.signal = [
    median !== undefined ? `Typical value: ${formatNumber(median)}` : undefined,
    sampleValue !== undefined ? `Largest outlier: ${formatNumber(sampleValue)}` : undefined
  ]
    .filter(Boolean)
    .join(' · ');

  const actions: InsightAction[] = [];
  if (Array.isArray(result.indices) && result.indices.length > 0) {
    actions.push({
      id: 'view_segment',
      label: 'Review outlier rows',
        payload: {
          column: column.name,
          rows: result.indices.slice(0, 25),
          limit: Math.min(result.indices.length, 25),
          direction: 'top',
          title: `Outlier rows for ${column.name}`,
        },
      });
    }

  return {
    text: composeNarrative(narrative),
    actions: actions.length ? actions : undefined,
  };
}

export function describeTrend(
  column: ColumnDefinition,
  trend: { direction: TrendDirection; strength: number },
  stats: Stats
): InsightDescription {
  const percentStrength = Math.round(trend.strength * 100);
  const directionLabel =
    trend.direction === 'up' ? 'rising' : trend.direction === 'down' ? 'declining' : 'stable';

  const narrative: InsightNarrative = {
    meaning: `${column.name} shows a ${directionLabel} pattern (${percentStrength}% trend strength across the dataset).`
  };

  if (trend.direction === 'stable') {
    narrative.impact = `This metric stays within a tight band, so sudden movements will stand out in monitoring.`;
    narrative.action = `Set a simple alert threshold using the recent average (${formatNumber(stats.mean)}) to catch unexpected changes.`;
  } else if (trend.strength > 0.6) {
    narrative.impact = `The movement is consistent, indicating a structural shift rather than noise.`;
    narrative.action = `Plan capacity and targets around the new direction, and dig into drivers behind the ${directionLabel} pattern.`;
  } else {
    narrative.impact = `The trend is noticeable but still influenced by volatility.`;
    narrative.action = `Combine this trend with other leading indicators to confirm whether it persists month over month.`;
  }

  narrative.signal = `Distinct values observed: ${stats.uniqueCount.toLocaleString()}`;

  return {
    text: composeNarrative(narrative),
  };
}

export function describeAnomalies(
  column: ColumnDefinition,
  result: {
    total_anomalies: number;
    share: number;
    anomalies: Array<{ row: number; value: number; score: number; direction: 'high' | 'low'; percentile: number }>;
    indices: number[];
  },
  stats: Stats
): InsightDescription {
  const shareRatio = result.share / 100;
  const narrative: InsightNarrative = {
    meaning: `${result.total_anomalies} rows in ${column.name} stand out (${formatPercent(shareRatio)} of the data).`
  };

  if (shareRatio >= 0.1) {
    narrative.impact = `This is too many anomalies to ignore—quality issues or churn in the process could be hiding here.`;
    narrative.action = `Break down the affected rows (starting with row ${result.anomalies[0]?.row ?? 'n/a'}) and confirm whether process changes or errors explain the spike.`;
  } else if (shareRatio >= 0.04) {
    narrative.impact = `A noticeable cluster of anomalies can shift KPIs or mis-train models.`;
    narrative.action = `Review the top anomalies and decide whether to treat them as special cases or smooth them before reporting.`;
  } else {
    narrative.impact = `Only a handful of rows are unusual, making them perfect for root-cause investigation.`;
    narrative.action = `Share the anomaly list with subject matter experts to validate whether they represent breakthroughs or data issues.`;
  }

  const top = result.anomalies[0];
  narrative.signal = top
    ? `Top anomaly: row ${top.row} (${top.direction === 'high' ? '+' : '−'}${formatNumber(top.value)})`
    : `Median reference: ${formatNumber(stats.median)}`;

  const actions: InsightAction[] = [];
  if (Array.isArray(result.indices) && result.indices.length > 0) {
    actions.push({
      id: 'view_segment',
      label: 'Inspect anomaly rows',
        payload: {
          column: column.name,
          rows: result.indices.slice(0, 25),
          limit: Math.min(result.indices.length, 25),
          direction: 'top',
          title: `Anomaly rows for ${column.name}`,
        },
      });
    }

  return {
    text: composeNarrative(narrative),
    actions: actions.length ? actions : undefined,
  };
}

export function describeCorrelation(
  column1: string,
  column2: string,
  metrics: number | CorrelationInsightMetrics
): InsightDescription {
  let pearson: number | null = null;
  let spearman: number | null = null;
  let normalizedMI: number | null = null;
  let sampleSize: number | null = null;
  let bestMetric: 'pearson' | 'spearman' | 'nmi' | null = null;
  let bestMetricValue: number | null = null;
  let bestStrength: number = 0;

  if (typeof metrics === 'number') {
    pearson = metrics;
  } else {
    pearson = safeNumber(metrics.pearson ?? metrics.correlation);
    spearman = safeNumber(metrics.spearman);
    const nmiCandidate = safeNumber(metrics.normalized_mutual_information);
    normalizedMI = nmiCandidate !== null ? Math.max(0, Math.min(1, nmiCandidate)) : null;
    sampleSize = safeNumber(metrics.sample_size) ?? safeNumber(metrics.sampled_size);
    bestMetric = metrics.best_metric ?? null;
    bestMetricValue = safeNumber(metrics.best_metric_value);
    bestStrength = safeNumber(metrics.best_strength) ?? 0;
  }

  const candidates: Array<{ type: 'pearson' | 'spearman' | 'nmi'; value: number }> = [];
  if (pearson !== null) candidates.push({ type: 'pearson', value: pearson });
  if (spearman !== null) candidates.push({ type: 'spearman', value: spearman });
  if (normalizedMI !== null && normalizedMI > 0) candidates.push({ type: 'nmi', value: normalizedMI });

  if (candidates.length === 0) {
    return {
      text: composeNarrative({
        meaning: `${column1} and ${column2} show little measurable relationship in this sample.`,
        impact: 'Treat these metrics independently; any link is too weak to act on right now.',
      }),
    };
  }

  if (!bestMetric || bestStrength === 0) {
    candidates.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    bestMetric = candidates[0].type;
    const bestValue = candidates[0].value;
    bestMetricValue = bestValue;
    bestStrength = bestMetric === 'nmi' ? bestValue : Math.abs(bestValue);
  }

  const strengthLabel = correlationStrengthLabel(bestStrength);
  const narrative: InsightNarrative = { meaning: '' };

  if (bestMetric === 'pearson' || bestMetric === 'spearman') {
    const value = bestMetricValue ?? 0;
    const together = value >= 0;
    const metricLabel = bestMetric === 'pearson' ? 'Pearson correlation' : 'Spearman correlation';
    narrative.meaning = `${column1} and ${column2} ${together ? 'move together' : 'move in opposite directions'} (${strengthLabel} ${metricLabel.toLowerCase()} of ${formatSigned(value)}).`;
  } else if (bestMetric === 'nmi') {
    const value = bestMetricValue ?? 0;
    narrative.meaning = `${column1} and ${column2} share a ${strengthLabel} nonlinear dependency (normalized mutual information ${value.toFixed(2)}).`;
  }

  if (!narrative.meaning) {
    narrative.meaning = `${column1} and ${column2} exhibit a ${strengthLabel} connection.`;
  }

  if (bestStrength >= 0.8) {
    narrative.impact = bestMetric === 'nmi'
      ? 'These metrics are tightly linked through a shared pattern—treat them as joint drivers when diagnosing performance.'
      : `When one metric changes, the other almost always follows—ideal for blended KPIs and alerting.`;
    narrative.action = bestMetric === 'nmi'
      ? `Plot ${column1} against ${column2} and consider interaction or ratio features to capture their combined effect.`
      : `Track a ratio or efficiency metric (${column2} ÷ ${column1}) to monitor how effectively one drives the other.`;
  } else if (bestStrength >= 0.6) {
    narrative.impact = bestMetric === 'nmi'
      ? 'The relationship is strong enough to use one metric as context for the other.'
      : `The link is clear enough to use ${column1} as a proxy when ${column2} is missing or delayed.`;
    narrative.action = bestMetric === 'nmi'
      ? `Add both metrics to dashboards and highlight when their relationship changes—it often signals a process shift.`
      : `Add both metrics to dashboards and highlight when they diverge—it typically signals a process change.`;
  } else {
    narrative.impact = bestMetric === 'nmi'
      ? 'There is meaningful shared structure alongside other influencing factors.'
      : `There is a noticeable relationship, but other variables still play a major role.`;
    narrative.action = bestMetric === 'nmi'
      ? `Include interaction terms when modelling these metrics and monitor residuals to understand where the link breaks.`
      : `Use ${column1} as an input feature when modelling ${column2}, and monitor residuals to understand exceptions.`;
  }

  const signalParts: string[] = [];
  if (pearson !== null) signalParts.push(`Pearson: ${formatSigned(pearson)}`);
  if (spearman !== null) signalParts.push(`Spearman: ${formatSigned(spearman)}`);
  if (normalizedMI !== null) signalParts.push(`NMI: ${normalizedMI.toFixed(2)}`);
  if (sampleSize !== null) signalParts.push(`Rows: ${Math.round(sampleSize).toLocaleString()}`);
  if (signalParts.length > 0) {
    narrative.signal = signalParts.join(' · ');
  }

  return {
    text: composeNarrative(narrative),
  };
}

export function describeTimeSeriesInsight(
  dateColumn: string,
  valueColumn: string,
  stats: TimeSeriesStats
): InsightDescription {
  const first = stats.firstDate.toLocaleDateString();
  const last = stats.lastDate.toLocaleDateString();
  const strength = Math.round(stats.trend.strength * 100);
  const direction = stats.trend.direction === 'up' ? 'rising' : stats.trend.direction === 'down' ? 'falling' : 'flat';
  const volatility = stats.volatility;

  const narrative: InsightNarrative = {
    meaning: `${valueColumn} covers ${first} to ${last} (${stats.granularity} cadence) and shows a ${direction} signal (${strength}% strength).`
  };

  if (stats.growthRate !== undefined && Math.abs(stats.growthRate) >= 5) {
    const growthLabel = stats.growthRate >= 0 ? 'increase' : 'decline';
    narrative.meaning += ` Overall change: ${Math.abs(stats.growthRate).toFixed(1)}% ${growthLabel}.`;
  }

  if (stats.seasonality && stats.seasonality !== 'none') {
    narrative.meaning += ` Seasonal pattern detected: ${stats.seasonality}.`;
  }

  if (volatility > 0.6) {
    narrative.impact = `Volatility is high, so short-term spikes can mask the underlying movement.`;
    narrative.action = `Use rolling averages or smoothing when reporting ${valueColumn}, and investigate outliers promptly.`;
  } else if (stats.trend.strength > 0.6) {
    narrative.impact = `The trend is strong enough to inform planning and headcount conversations.`;
    narrative.action = `Forecast ${valueColumn} using this trend and align teams before the next ${stats.granularity} period.`;
  } else {
    narrative.impact = `The signal is subtle—pair it with leading indicators before taking action.`;
    narrative.action = `Continue monitoring; flag the metric if the trend strength crosses 60%.`;
  }

  narrative.signal = [
    `Trend: ${direction} (${strength}%)`,
    stats.seasonality && stats.seasonality !== 'none' ? `Seasonality: ${stats.seasonality}` : undefined,
    `Volatility: ${formatPercent(Math.min(volatility, 1))}`
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    text: composeNarrative(narrative),
  };
}

export function describePattern(
  column: ColumnDefinition,
  result: {
    topPatterns: Array<{ value: string; count: number; percentage: number }>;
    totalCount: number;
    uniqueCount: number;
  }
): InsightDescription {
  const top = result.topPatterns[0];
  const second = result.topPatterns[1];

  const narrative: InsightNarrative = {
    meaning: `${column.name} is dominated by "${top.value}" (${top.percentage.toFixed(1)}% of records) across ${result.uniqueCount} distinct values.`
  };

  if (top.percentage >= 60) {
    narrative.impact = `A single category drives the majority of outcomes—perfect for a focused retention or upsell campaign.`;
    narrative.action = `Inspect "${top.value}" in detail and contrast it with the remaining ${result.uniqueCount - 1} categories to understand what keeps it dominant.`;
  } else if (top.percentage >= 35) {
    narrative.impact = `Two or three categories explain most of the behaviour.`;
    narrative.action = `Prioritise the leading categories (for example ${top.value}${second ? `, ${second.value}` : ''}) in dashboards and regroup everything else under an "Other" bucket.`;
  } else {
    narrative.impact = `No single category dominates, so ${column.name} can split performance evenly across many cohorts.`;
    narrative.action = `Create thematic groupings (for example the top five categories) to surface meaningful differences without overwhelming stakeholders.`;
  }

  narrative.signal = `Top categories cover ${formatPercent(
    Math.min(
      result.topPatterns.slice(0, 3).reduce((acc, pattern) => acc + pattern.percentage, 0) / 100,
      1
    )
  )} of rows`;
  const actions: InsightAction[] = [];
  if (top?.value !== undefined) {
    actions.push({
      id: 'view_segment',
      label: `View rows where ${column.name} = ${top.value}`,
      payload: {
        column: column.name,
        equals: top.value,
        limit: 25,
        title: `Rows with ${column.name} = ${top.value}`,
      },
    });
  }

  return {
    text: composeNarrative(narrative),
    actions: actions.length ? actions : undefined,
  };
}

function summarizeClusterProfile(
  cluster: { profile: Record<string, { description: 'low' | 'average' | 'high' }> }
): string {
  const highs = [];
  const lows = [];

  for (const [col, prof] of Object.entries(cluster.profile)) {
    if (prof.description === 'high') {
      highs.push(col);
    } else if (prof.description === 'low') {
      lows.push(col);
    }
  }

  const parts = [];
  if (highs.length > 0) {
    parts.push(`high ${highs.join(', ')}`);
  }
  if (lows.length > 0) {
    parts.push(`low ${lows.join(', ')}`);
  }

  if (parts.length === 0) return 'average across all metrics';
  return parts.join(' and ');
}

export function describeClustering(
  result: { columns: string[], clusters: any[] }
): InsightDescription {
  const mainAxes = result.columns.slice(0, 3).join(', ');
  const totalClusters = result.clusters.length;

  const narrative: InsightNarrative = {
    meaning: `We found ${totalClusters} distinct groups in your data based on ${mainAxes}. Each group represents a cohort with unique purchasing habits or user behaviors.`,
    impact: 'This segmentation is your cheat-sheet for targeted marketing, product personalization, or identifying at-risk customers before they churn.',
  };

  const topCluster = result.clusters[0];
  const summary = summarizeClusterProfile(topCluster);
  narrative.action = `Start by exploring the largest group (${formatPercent(topCluster.size / result.clusters.reduce((acc, c) => acc + c.size, 0), 0)} of the data), which is characterized by ${summary}. Understanding this core segment is the first step to unlocking growth.`;

  narrative.signal = `Clustering performed on ${result.columns.length} numeric columns.`;

  const actions: InsightAction[] = result.clusters.map((cluster, index) => ({
    id: 'view_cluster',
    label: `Explore Group ${index + 1} (${summarizeClusterProfile(cluster)})`,
    payload: {
      clusterId: cluster.id,
      columns: result.columns,
      title: `Group ${index + 1}: ${summarizeClusterProfile(cluster)}`
    },
  }));

  return {
    text: composeNarrative(narrative),
    actions,
  };
}

export function describeJoinSuggestion(
  leftDataset: { name: string },
  rightDataset: { name: string },
  suggestion: { left_columns: string, right_columns: string, confidence: number, left_dataset_id: number, right_dataset_id: number }
): InsightDescription {
  const leftCol = JSON.parse(suggestion.left_columns)[0];
  const rightCol = JSON.parse(suggestion.right_columns)[0];
  const confidencePercent = formatPercent(suggestion.confidence, 0);

  const narrative: InsightNarrative = {
    meaning: `We found a strong link (${confidencePercent} confidence) between ${leftDataset.name}.${leftCol} and ${rightDataset.name}.${rightCol}.`,
    impact: `Joining these two datasets on this column will allow you to connect their information, creating a richer, more complete view for analysis. For example, you could link customer profiles to their sales records.`,
    action: `Preview the join to see how the data aligns, then apply it to create a new, combined dataset for your session.`,
    signal: `Confidence is based on a blend of value similarity and column name similarity.`
  };

  const actions: InsightAction[] = [{
      id: 'preview_join',
      label: `Preview Join on ${leftCol} <> ${rightCol}`,
      payload: {
          left_dataset_id: suggestion.left_dataset_id,
          right_dataset_id: suggestion.right_dataset_id,
          left_column: leftCol,
          right_column: rightCol,
      }
  }];

  return {
    text: composeNarrative(narrative),
    actions,
  };
}

export function describeFeatureSuggestion(suggestion: FeatureSuggestion): InsightDescription {
  const columnsText = suggestion.columns.join(', ');
  const friendly = friendlyTransformationName(suggestion.transformation);
  const narrative: InsightNarrative = {
    meaning: suggestion.description,
    impact: suggestion.expected_benefit
      ? suggestion.expected_benefit
      : `This transformation can make downstream models more sensitive to changes in ${columnsText}.`,
    action: `Create a ${friendly} using ${columnsText} and validate the lift on your next experiment.`,
    signal: suggestion.confidence
      ? `Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`
      : undefined,
  };

  const actionLabel = buildFeatureActionLabel(suggestion.transformation, suggestion.columns);
  const actions: InsightAction[] = [
    {
      id: 'apply_feature',
      label: actionLabel,
      payload: {
        transformation: suggestion.transformation,
        columns: suggestion.columns,
      },
    },
  ];

  return {
    text: composeNarrative(narrative),
    actions,
  };
}

export function describePCA(
  result: {
    explainedVariance: number[];
    cumulativeVariance: number[];
    recommendedComponents: number;
    featureNames: string[];
    loadings: Array<{
      component: number;
      features: Array<{ name: string; loading: number; absLoading: number }>;
    }>;
  }
): InsightDescription {
  const totalFeatures = result.featureNames.length;
  const recommendedComponents = result.recommendedComponents;
  const reductionPercent = ((totalFeatures - recommendedComponents) / totalFeatures * 100).toFixed(0);
  const pc1Variance = result.explainedVariance[0]?.toFixed(1) || 0;
  const pc2Variance = result.explainedVariance[1]?.toFixed(1) || 0;

  const topFeatures = result.loadings[0]?.features.slice(0, 3).map(f => f.name) || [];
  const topFeaturesText = topFeatures.length > 0 ? topFeatures.join(', ') : 'various features';

  const narrative: InsightNarrative = {
    meaning: `Your ${totalFeatures}-dimensional dataset can be effectively reduced to ${recommendedComponents} principal components (${reductionPercent}% dimensionality reduction) while retaining 80% of the original variance.`,
    impact: `This reveals that much of your data's information is redundant or correlated. The first component alone explains ${pc1Variance}% of total variance and is primarily driven by ${topFeaturesText}.`,
    action: `Use these ${recommendedComponents} components for modeling, visualization, or feature selection instead of all ${totalFeatures} features. This simplifies analysis, reduces noise, and can improve model performance.`,
    signal: `First two components explain ${(parseFloat(pc1Variance) + parseFloat(pc2Variance)).toFixed(1)}% of variance combined`,
  };

  // Build component interpretation
  const componentInsights: string[] = [];
  for (let i = 0; i < Math.min(3, result.loadings.length); i++) {
    const comp = result.loadings[i];
    const topContributors = comp.features.slice(0, 2).map(f => `${f.name} (${formatSigned(f.loading)})`).join(', ');
    componentInsights.push(`PC${i + 1}: ${topContributors}`);
  }

  if (componentInsights.length > 0) {
    narrative.signal += ` · Key drivers: ${componentInsights.join(' · ')}`;
  }

  return {
    text: composeNarrative(narrative),
  };
}
