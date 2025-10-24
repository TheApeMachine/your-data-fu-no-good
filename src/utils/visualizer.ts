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

  let displayOrder = 0;

  // Sort analyses by quality score (highest first)
  const sortedAnalyses = [...analyses].sort((a, b) => 
    (b.quality_score || 50) - (a.quality_score || 50)
  );

  for (const analysis of sortedAnalyses) {
    // Skip visualizations for low-quality insights (score < 30)
    if ((analysis.quality_score || 50) < 30) {
      console.log(`Skipping low-quality visualization for ${analysis.column_name} (score: ${analysis.quality_score})`);
      continue;
    }

    const viz = await createVisualizationForAnalysis(analysis, rows);
    
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
  rows: Record<string, any>[]
): { chartType: string, title: string, config: any, explanation: string } | null {
  
  switch (analysis.analysis_type) {
    case 'statistics':
      return createStatisticsChart(analysis, rows);
    
    case 'correlation':
      return createCorrelationChart(analysis, rows);
    
    case 'outlier':
      return createOutlierChart(analysis, rows);
    
    case 'pattern':
      return createPatternChart(analysis, rows);
    
    case 'trend':
      return createTrendChart(analysis, rows);
    
    default:
      return null;
  }
}

function createStatisticsChart(analysis: Analysis, rows: Record<string, any>[]) {
  const colName = analysis.column_name;
  if (!colName) return null;

  const stats = analysis.result;
  
  // For numeric columns, show distribution histogram
  if (stats.mean !== undefined) {
    const values = rows.map(r => Number(r[colName])).filter(n => !isNaN(n));
    const histogram = createHistogramData(values);

    return {
      chartType: 'bar',
      title: `Distribution: ${colName}`,
      explanation: `This histogram shows how values in "${colName}" are distributed. Taller bars mean more data points at that value range.`,
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
    title: `Top Values: ${colName}`,
    explanation: `This chart shows the most common values in "${colName}". The tallest bar is the most frequent value.`,
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

function createCorrelationChart(analysis: Analysis, rows: Record<string, any>[]) {
  const result = analysis.result;
  const col1 = result.column1;
  const col2 = result.column2;
  
  if (!col1 || !col2) return null;

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
    title: `Relationship: ${col1} vs ${col2}`,
    explanation: `Each dot represents one record. ${correlation > 0 ? 'The upward pattern shows they move together.' : 'The downward pattern shows they move in opposite directions.'}`,
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

function createOutlierChart(analysis: Analysis, rows: Record<string, any>[]) {
  const colName = analysis.column_name;
  if (!colName) return null;

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
    title: `Outliers: ${colName}`,
    explanation: `Red dots are unusual values that stand out from the pattern. Blue dots are normal values.`,
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

function createPatternChart(analysis: Analysis, rows: Record<string, any>[]) {
  const colName = analysis.column_name;
  if (!colName) return null;

  const topPatterns = analysis.result.topPatterns || [];
  
  if (topPatterns.length === 0) return null;

  // Limit to top 8 for readability
  const limited = topPatterns.slice(0, 8);
  
  return {
    chartType: 'pie',
    title: `Pattern Distribution: ${colName}`,
    explanation: `Each slice shows what percentage of records have that value. Bigger slices are more common.`,
    config: {
      type: 'pie',
      data: {
        labels: limited.map(([label]: [string, number]) => label),
        datasets: [{
          data: limited.map(([, count]: [string, number]) => count),
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

function createTrendChart(analysis: Analysis, rows: Record<string, any>[]) {
  const colName = analysis.column_name;
  if (!colName) return null;

  const values = rows.map(r => Number(r[colName])).filter(n => !isNaN(n));
  const trend = analysis.result;

  const color = trend.direction === 'up' 
    ? 'rgba(16, 185, 129, 0.6)' 
    : 'rgba(239, 68, 68, 0.6)';

  return {
    chartType: 'line',
    title: `Trend: ${colName}`,
    explanation: `This line shows how "${colName}" changes over time. ${trend.direction === 'up' ? 'The upward slope indicates growth.' : 'The downward slope indicates decline.'}`,
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
