// Automatic visualization generator

import type { Analysis, Visualization } from '../types';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    tension?: number;
  }[];
}

export async function generateVisualizations(
  datasetId: number,
  rows: Record<string, any>[],
  analyses: Analysis[],
  db: D1Database
): Promise<void> {
  console.log(`Generating visualizations for dataset ${datasetId}`);

  await db.prepare(`
    DELETE FROM visualizations WHERE dataset_id = ?
  `).bind(datasetId).run();

  // Fetch column mappings to add enrichment indicators
  const mappingsResult = await db.prepare(`
    SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
  `).bind(datasetId).all();

  const mappingsMap = new Map<string, string>();
  mappingsResult.results.forEach(m => {
    mappingsMap.set(m.id_column as string, m.name_column as string);
  });

  // Calculate priority score for each analysis to surface most valuable charts
  function calculateVisualizationPriority(analysis: Analysis): number {
    let priority = analysis.quality_score || 50;

    // Boost priority based on analysis type (more valuable insights first)
    const typeMultipliers: Record<string, number> = {
      'timeseries': 1.5,    // Time series are very valuable
      'anomaly': 1.4,        // Anomalies are critical insights
      'pca': 1.35,           // PCA reveals structure
      'correlation': 1.3,    // Correlations reveal relationships
      'clustering': 1.25,    // Clustering shows segments
      'trend': 1.2,          // Trends show patterns
      'outlier': 1.1,        // Outliers are important
      'pattern': 1.05,       // Patterns are useful
      'statistics': 1.0      // Basic stats are baseline
    };

    priority *= typeMultipliers[analysis.analysis_type] || 1.0;

    // Boost priority based on confidence
    if (analysis.confidence) {
      priority *= (1 + analysis.confidence / 100);
    }

    // Boost priority for high-impact insights (high importance)
    if (analysis.importance === 'high' || analysis.importance === 'critical') {
      priority *= 1.3;
    } else if (analysis.importance === 'medium') {
      priority *= 1.1;
    }

    // Boost priority for analyses with strong signals
    const result = analysis.result;
    if (result) {
      // Strong correlations are more valuable
      if (result.correlation && Math.abs(result.correlation) > 0.7) {
        priority *= 1.2;
      }
      // Strong trends are more valuable
      if (result.strength && result.strength > 0.5) {
        priority *= 1.15;
      }
      // Anomalies with significant share are more valuable
      if (result.share && result.share > 0.05) {
        priority *= 1.1;
      }
      // Time series with seasonality are more valuable
      if (result.seasonality && result.seasonality !== 'none') {
        priority *= 1.15;
      }
    }

    return priority;
  }

  // Calculate priorities and sort
  const analysesWithPriority = analyses.map(analysis => ({
    analysis,
    priority: calculateVisualizationPriority(analysis)
  }));

  // Sort by priority (highest first), then by quality_score, then by confidence
  analysesWithPriority.sort((a, b) => {
    if (Math.abs(a.priority - b.priority) > 1) {
      return b.priority - a.priority;
    }
    const qualityDiff = (b.analysis.quality_score || 50) - (a.analysis.quality_score || 50);
    if (Math.abs(qualityDiff) > 5) {
      return qualityDiff;
    }
    return (b.analysis.confidence || 0) - (a.analysis.confidence || 0);
  });

  let displayOrder = 0;

  for (const { analysis } of analysesWithPriority) {
    // Skip visualizations for low-quality insights (score < 30)
    // But allow high-priority types even if quality is slightly lower
    const minQuality = ['anomaly', 'timeseries', 'correlation'].includes(analysis.analysis_type) ? 25 : 30;
    if ((analysis.quality_score || 50) < minQuality) {
      console.log(`Skipping low-quality visualization for ${analysis.column_name} (score: ${analysis.quality_score})`);
      continue;
    }

    const viz = await createVisualizationForAnalysis(analysis, rows, mappingsMap);

    if (viz) {
      await db.prepare(`
        INSERT INTO visualizations (dataset_id, analysis_id, chart_type, title, config, explanation, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        datasetId,
        analysis.id,
        viz.chartType,
        viz.title,
        JSON.stringify(viz.config),
        viz.explanation,
        displayOrder++
      ).run();
    }
  }

  console.log(`Generated ${displayOrder} visualizations`);
}

function createVisualizationForAnalysis(
  analysis: Analysis,
  rows: Record<string, any>[],
  mappingsMap: Map<string, string>
): { chartType: string, title: string, config: any, explanation: string } | null {

  switch (analysis.analysis_type) {
    case 'statistics':
      return createStatisticsChart(analysis, rows, mappingsMap);

    case 'correlation':
      return createCorrelationChart(analysis, rows, mappingsMap);

    case 'outlier':
      return createOutlierChart(analysis, rows, mappingsMap);

    case 'anomaly':
      return createAnomalyChart(analysis, rows, mappingsMap);

    case 'pattern':
      return createPatternChart(analysis, rows, mappingsMap);

    case 'trend':
      return createTrendChart(analysis, rows, mappingsMap);

    case 'timeseries':
      return createTimeSeriesChart(analysis, rows, mappingsMap);

    case 'pca':
      return createPCAChart(analysis);

    default:
      return null;
  }
}

function createStatisticsChart(analysis: Analysis, rows: Record<string, any>[], mappingsMap: Map<string, string>) {
  const colName = analysis.column_name;
  if (!colName) return null;

  const stats = analysis.result;
  const enrichmentSuffix = mappingsMap.has(colName) ? ` (via ${mappingsMap.get(colName)})` : '';

  // For numeric columns, show distribution histogram
  if (stats.mean !== undefined) {
    const values = rows.map(r => Number(r[colName])).filter(n => !isNaN(n));
    const histogram = createHistogramData(values);

    return {
      chartType: 'bar',
      title: `Distribution: ${colName}${enrichmentSuffix}`,
      explanation: `This histogram shows how values in "${colName}" are distributed${enrichmentSuffix ? ' using human-readable names' : ''}. Taller bars mean more data points at that value range.`,
      config: {
        type: 'bar',
        data: {
          labels: histogram.labels,
          datasets: [{
            label: 'Frequency',
            data: histogram.data,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: `${colName} Distribution`
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Count' }
            },
            x: {
              title: { display: true, text: colName }
            }
          }
        }
      }
    };
  }

  // For categorical columns, show top values
  const values = rows.map(r => r[colName]).filter(v => v !== null && v !== undefined);
  const frequency: Record<string, number> = {};
  values.forEach(v => {
    frequency[String(v)] = (frequency[String(v)] || 0) + 1;
  });

  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    chartType: 'bar',
    title: `Top Values: ${colName}${enrichmentSuffix}`,
    explanation: `This chart shows the most common values in "${colName}"${enrichmentSuffix ? ' using human-readable names' : ''}. The tallest bar is the most frequent value.`,
    config: {
      type: 'bar',
      data: {
        labels: sorted.map(([label]) => label),
        datasets: [{
          label: 'Count',
          data: sorted.map(([, count]) => count),
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `Most Common: ${colName}`
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: 'Count' }
          }
        }
      }
    }
  };
}

function createCorrelationChart(analysis: Analysis, rows: Record<string, any>[], mappingsMap: Map<string, string>) {
  const result = analysis.result;
  const col1 = result.column1;
  const col2 = result.column2;

  if (!col1 || !col2) return null;

  const col1Suffix = mappingsMap.has(col1) ? ` (via ${mappingsMap.get(col1)})` : '';
  const col2Suffix = mappingsMap.has(col2) ? ` (via ${mappingsMap.get(col2)})` : '';

  const points = rows
    .map(r => ({
      x: Number(r[col1]),
      y: Number(r[col2])
    }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y));

  const correlation = result.correlation;
  const color = correlation > 0 ? 'rgba(139, 92, 246, 0.6)' : 'rgba(239, 68, 68, 0.6)';

  return {
    chartType: 'scatter',
    title: `Relationship: ${col1}${col1Suffix} vs ${col2}${col2Suffix}`,
    explanation: `Each dot represents one record${col1Suffix || col2Suffix ? ' using human-readable names' : ''}. ${correlation > 0 ? 'The upward pattern shows they move together.' : 'The downward pattern shows they move in opposite directions.'}`,
    config: {
      type: 'scatter',
      data: {
        datasets: [{
          label: `${col1} vs ${col2}`,
          data: points,
          backgroundColor: color,
          borderColor: color.replace('0.6', '1'),
          borderWidth: 1,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `Correlation: ${correlation.toFixed(2)}`
          }
        },
        scales: {
          x: {
            title: { display: true, text: col1 }
          },
          y: {
            title: { display: true, text: col2 }
          }
        }
      }
    }
  };
}

function createOutlierChart(analysis: Analysis, rows: Record<string, any>[], mappingsMap: Map<string, string>) {
  const colName = analysis.column_name;
  if (!colName) return null;

  const enrichmentSuffix = mappingsMap.has(colName) ? ` (via ${mappingsMap.get(colName)})` : '';

  const outlierIndices = new Set(analysis.result.indices || []);
  const values = rows.map((r, idx) => ({
    x: idx,
    y: Number(r[colName]),
    isOutlier: outlierIndices.has(idx)
  })).filter(p => !isNaN(p.y));

  const normalPoints = values.filter(p => !p.isOutlier);
  const outlierPoints = values.filter(p => p.isOutlier);

  return {
    chartType: 'scatter',
    title: `Outliers: ${colName}${enrichmentSuffix}`,
    explanation: `Red dots are unusual values that stand out from the pattern${enrichmentSuffix ? ' (using human-readable names)' : ''}. Blue dots are normal values.`,
    config: {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Normal',
            data: normalPoints,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            pointRadius: 3
          },
          {
            label: 'Outliers',
            data: outlierPoints,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 2,
            pointRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          title: {
            display: true,
            text: `${colName} - Outlier Detection`
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Record Index' }
          },
          y: {
            title: { display: true, text: colName }
          }
        }
      }
    }
  };
}

function createAnomalyChart(analysis: Analysis, rows: Record<string, any>[], mappingsMap: Map<string, string>) {
  const colName = analysis.column_name;
  if (!colName) return null;

  const enrichmentSuffix = mappingsMap.has(colName) ? ` (via ${mappingsMap.get(colName)})` : '';
  const anomalyIndices = Array.isArray(analysis.result?.indices) ? analysis.result.indices : [];
  const anomalySet = new Set<number>(anomalyIndices);

  const values = rows.map((r, idx) => ({
    x: idx,
    y: Number(r[colName]),
    isAnomaly: anomalySet.has(idx)
  })).filter(p => !isNaN(p.y));

  if (values.length === 0) return null;

  const normalPoints = values.filter(p => !p.isAnomaly);
  const anomalyPoints = values.filter(p => p.isAnomaly);
  const share = analysis.result?.share;

  return {
    chartType: 'scatter',
    title: `Key anomalies: ${colName}${enrichmentSuffix}`,
    explanation: `Highlighted dots show the rows triggering the anomaly alert${enrichmentSuffix ? ' (using human-readable names)' : ''}. They sit well outside the usual range and should be reviewed individually.${typeof share === 'number' ? ` About ${share}% of available rows are affected.` : ''}`,
    config: {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Typical values',
            data: normalPoints,
            backgroundColor: 'rgba(59, 130, 246, 0.4)',
            borderColor: 'rgba(59, 130, 246, 0.9)',
            borderWidth: 1,
            pointRadius: 3
          },
          {
            label: 'Anomalies',
            data: anomalyPoints,
            backgroundColor: 'rgba(234, 88, 12, 0.85)',
            borderColor: 'rgba(194, 65, 12, 1)',
            borderWidth: 2,
            pointRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          title: {
            display: true,
            text: `${colName} anomaly spotlight`
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Record index' }
          },
          y: {
            title: { display: true, text: colName }
          }
        }
      }
    }
  };
}

function createPatternChart(analysis: Analysis, rows: Record<string, any>[], mappingsMap: Map<string, string>) {
  const colName = analysis.column_name;
  if (!colName) return null;

  const enrichmentSuffix = mappingsMap.has(colName) ? ` (via ${mappingsMap.get(colName)})` : '';

  const topPatterns = analysis.result.topPatterns || [];

  if (topPatterns.length === 0) return null;

  // Limit to top 8 for readability
  const limited = topPatterns.slice(0, 8);
  const labels = limited.map((item: any) => Array.isArray(item) ? item[0] : item.value);
  const data = limited.map((item: any) => Array.isArray(item) ? item[1] : item.count);

  return {
    chartType: 'pie',
    title: `Pattern Distribution: ${colName}${enrichmentSuffix}`,
    explanation: `Each slice shows what percentage of records have that value${enrichmentSuffix ? ' using human-readable names' : ''}. Bigger slices are more common.`,
    config: {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          },
          title: {
            display: true,
            text: `${colName} Breakdown`
          }
        }
      }
    }
  };
}

function createTrendChart(analysis: Analysis, rows: Record<string, any>[], mappingsMap: Map<string, string>) {
  const colName = analysis.column_name;
  if (!colName) return null;

  const enrichmentSuffix = mappingsMap.has(colName) ? ` (via ${mappingsMap.get(colName)})` : '';

  const values = rows.map(r => Number(r[colName])).filter(n => !isNaN(n));
  const trend = analysis.result;

  const color = trend.direction === 'up'
    ? 'rgba(16, 185, 129, 0.6)'
    : 'rgba(239, 68, 68, 0.6)';

  return {
    chartType: 'line',
    title: `Trend: ${colName}${enrichmentSuffix}`,
    explanation: `This line shows how "${colName}" changes over time${enrichmentSuffix ? ' using human-readable names' : ''}. ${trend.direction === 'up' ? 'The upward slope indicates growth.' : 'The downward slope indicates decline.'}`,
    config: {
      type: 'line',
      data: {
        labels: values.map((_, idx) => `#${idx + 1}`),
        datasets: [{
          label: colName,
          data: values,
          backgroundColor: color,
          borderColor: color.replace('0.6', '1'),
          borderWidth: 2,
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `${colName} Over Time (${trend.direction === 'up' ? '↗' : '↘'} ${Math.round(trend.strength * 100)}% strength)`
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Record Number' }
          },
          y: {
            title: { display: true, text: colName }
          }
        }
      }
    }
  };
}

function createHistogramData(values: number[], bins: number = 10): { labels: string[], data: number[] } {
  if (values.length === 0) return { labels: [], data: [] };

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const binSize = range / bins;

  const histogram = new Array(bins).fill(0);
  const labels: string[] = [];

  // Create bin labels
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binSize;
    const binEnd = min + (i + 1) * binSize;
    labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
  }

  // Count values in each bin
  values.forEach(value => {
    let binIndex = Math.floor((value - min) / binSize);
    if (binIndex >= bins) binIndex = bins - 1;
    if (binIndex < 0) binIndex = 0;
    histogram[binIndex]++;
  });

  return { labels, data: histogram };
}

function createTimeSeriesChart(analysis: Analysis, rows: Record<string, any>[], mappingsMap: Map<string, string>) {
  const result = analysis.result;
  const dateCol = result.dateColumn;
  const valueCol = result.valueColumn;

  if (!dateCol || !valueCol) return null;

  const dateColSuffix = mappingsMap.has(dateCol) ? ` (via ${mappingsMap.get(dateCol)})` : '';
  const valueColSuffix = mappingsMap.has(valueCol) ? ` (via ${mappingsMap.get(valueCol)})` : '';

  // Parse and sort data by date
  interface TimePoint {
    date: Date;
    value: number;
  }

  const points: TimePoint[] = [];

  for (const row of rows) {
    const dateValue = row[dateCol];
    const numValue = row[valueCol];

    if (!dateValue || numValue === null || numValue === undefined) continue;

    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const value = Number(numValue);

    if (!isNaN(date.getTime()) && !isNaN(value)) {
      points.push({ date, value });
    }
  }

  // Sort by date
  points.sort((a, b) => a.date.getTime() - b.date.getTime());

  if (points.length === 0) return null;

  // Format dates based on granularity
  const formatDate = (date: Date, granularity: string): string => {
    const options: Intl.DateTimeFormatOptions = {};

    switch (granularity) {
      case 'hourly':
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          hour12: true
        });
      case 'daily':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: points.length > 365 ? 'numeric' : undefined
        });
      case 'weekly':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      case 'monthly':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        });
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
  };

  const labels = points.map(p => formatDate(p.date, result.granularity));
  const data = points.map(p => p.value);

  // Determine color based on trend
  let color: string;
  let backgroundColor: string;

  if (result.trend && result.trend.direction === 'up') {
    color = 'rgba(16, 185, 129, 1)';        // green
    backgroundColor = 'rgba(16, 185, 129, 0.1)';
  } else if (result.trend && result.trend.direction === 'down') {
    color = 'rgba(239, 68, 68, 1)';         // red
    backgroundColor = 'rgba(239, 68, 68, 0.1)';
  } else {
    color = 'rgba(59, 130, 246, 1)';        // blue
    backgroundColor = 'rgba(59, 130, 246, 0.1)';
  }

  // Build title with key metrics
  const titleParts = [`${valueCol} over Time`];
  if (result.trend && result.trend.strength > 0.3) {
    const arrow = result.trend.direction === 'up' ? '↗' : '↘';
    titleParts.push(`${arrow} ${(result.trend.strength * 100).toFixed(0)}%`);
  }
  if (result.seasonality && result.seasonality !== 'none') {
    titleParts.push(`📅 ${result.seasonality}`);
  }

  const title = titleParts.join(' | ');

  // Build detailed explanation
  const explanationParts: string[] = [];

  const firstDate = points[0].date.toLocaleDateString();
  const lastDate = points[points.length - 1].date.toLocaleDateString();
  explanationParts.push(`Time series from ${firstDate} to ${lastDate}${valueColSuffix || dateColSuffix ? ' using human-readable names' : ''}`);

  if (result.growthRate !== undefined && Math.abs(result.growthRate) > 5) {
    const change = result.growthRate > 0 ? 'increased' : 'decreased';
    explanationParts.push(`${change} by ${Math.abs(result.growthRate).toFixed(1)}%`);
  }

  if (result.seasonality && result.seasonality !== 'none') {
    explanationParts.push(`shows ${result.seasonality} patterns`);
  }

  return {
    chartType: 'line',
    title: `${title}${valueColSuffix}`,
    explanation: explanationParts.join(', ') + '.',
    config: {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: valueCol,
          data,
          borderColor: color,
          backgroundColor: backgroundColor,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: points.length > 100 ? 0 : 3,
          pointHoverRadius: 5,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: title,
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              title: (context: any) => {
                return context[0].label;
              },
              label: (context: any) => {
                const value = context.parsed.y;
                return `${valueCol}: ${value.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: dateCol
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 15
            }
          },
          y: {
            title: {
              display: true,
              text: valueCol
            },
            beginAtZero: false,
            ticks: {
              callback: (value: any) => {
                return typeof value === 'number' ? value.toFixed(2) : value;
              }
            }
          }
        }
      }
    }
  };
}

function createPCAChart(analysis: Analysis) {
  const result = analysis.result;
  if (!result || !result.explainedVariance || !result.loadings) return null;

  const numComponents = Math.min(result.explainedVariance.length, 10);

  // Create scree plot showing explained variance by component
  const componentLabels = Array.from({ length: numComponents }, (_, i) => `PC${i + 1}`);
  const explainedVariances = result.explainedVariance.slice(0, numComponents);
  const cumulativeVariances = result.cumulativeVariance?.slice(0, numComponents) || [];

  return {
    chartType: 'line',
    title: 'Principal Component Analysis - Explained Variance',
    explanation: `This scree plot shows how much variance each principal component explains. ${result.recommendedComponents} components are recommended to retain 80% of the data's variance. The first component explains ${result.explainedVariance[0]?.toFixed(1)}% of variance, primarily driven by ${result.loadings[0]?.features.slice(0, 2).map((f: any) => f.name).join(', ')}.`,
    config: {
      type: 'line',
      data: {
        labels: componentLabels,
        datasets: [
          {
            label: 'Explained Variance (%)',
            data: explainedVariances,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            yAxisID: 'y'
          },
          {
            label: 'Cumulative Variance (%)',
            data: cumulativeVariances,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.1,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'PCA Scree Plot - Variance Explained by Component',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y.toFixed(2);
                return `${label}: ${value}%`;
              }
            }
          },
          annotation: result.recommendedComponents ? {
            annotations: {
              cutoff: {
                type: 'line',
                xMin: result.recommendedComponents - 0.5,
                xMax: result.recommendedComponents - 0.5,
                borderColor: 'rgba(220, 38, 38, 0.5)',
                borderWidth: 2,
                borderDash: [10, 5],
                label: {
                  display: true,
                  content: '80% Threshold',
                  position: 'start'
                }
              }
            }
          } : undefined
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Principal Component'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Variance (%)'
            },
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value: any) => `${value}%`
            }
          }
        }
      }
    }
  };
}
