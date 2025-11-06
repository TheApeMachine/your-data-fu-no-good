// Automatic visualization generator
export async function generateVisualizations(datasetId, rows, analyses, db) {
    console.log(`Generating visualizations for dataset ${datasetId}`);
    await db.prepare(`
    DELETE FROM visualizations WHERE dataset_id = ?
  `).bind(datasetId).run();
    // Fetch column mappings to add enrichment indicators
    const mappingsResult = await db.prepare(`
    SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
  `).bind(datasetId).all();
    const mappingsMap = new Map();
    mappingsResult.results.forEach(m => {
        mappingsMap.set(m.id_column, m.name_column);
    });
    let displayOrder = 0;
    // Sort analyses by quality score (highest first)
    const sortedAnalyses = [...analyses].sort((a, b) => (b.quality_score || 50) - (a.quality_score || 50));
    for (const analysis of sortedAnalyses) {
        // Skip visualizations for low-quality insights (score < 30)
        if ((analysis.quality_score || 50) < 30) {
            console.log(`Skipping low-quality visualization for ${analysis.column_name} (score: ${analysis.quality_score})`);
            continue;
        }
        const viz = await createVisualizationForAnalysis(analysis, rows, mappingsMap);
        if (viz) {
            await db.prepare(`
        INSERT INTO visualizations (dataset_id, analysis_id, chart_type, title, config, explanation, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(datasetId, analysis.id, viz.chartType, viz.title, JSON.stringify(viz.config), viz.explanation, displayOrder++).run();
        }
    }
    console.log(`Generated ${displayOrder} visualizations`);
}
function createVisualizationForAnalysis(analysis, rows, mappingsMap) {
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
        default:
            return null;
    }
}
function createStatisticsChart(analysis, rows, mappingsMap) {
    const colName = analysis.column_name;
    if (!colName)
        return null;
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
    const frequency = {};
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
function createCorrelationChart(analysis, rows, mappingsMap) {
    const result = analysis.result;
    const col1 = result.column1;
    const col2 = result.column2;
    if (!col1 || !col2)
        return null;
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
function createOutlierChart(analysis, rows, mappingsMap) {
    const colName = analysis.column_name;
    if (!colName)
        return null;
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
function createAnomalyChart(analysis, rows, mappingsMap) {
    const colName = analysis.column_name;
    if (!colName)
        return null;
    const enrichmentSuffix = mappingsMap.has(colName) ? ` (via ${mappingsMap.get(colName)})` : '';
    const anomalyIndices = Array.isArray(analysis.result?.indices) ? analysis.result.indices : [];
    const anomalySet = new Set(anomalyIndices);
    const values = rows.map((r, idx) => ({
        x: idx,
        y: Number(r[colName]),
        isAnomaly: anomalySet.has(idx)
    })).filter(p => !isNaN(p.y));
    if (values.length === 0)
        return null;
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
function createPatternChart(analysis, rows, mappingsMap) {
    const colName = analysis.column_name;
    if (!colName)
        return null;
    const enrichmentSuffix = mappingsMap.has(colName) ? ` (via ${mappingsMap.get(colName)})` : '';
    const topPatterns = analysis.result.topPatterns || [];
    if (topPatterns.length === 0)
        return null;
    // Limit to top 8 for readability
    const limited = topPatterns.slice(0, 8);
    const labels = limited.map((item) => Array.isArray(item) ? item[0] : item.value);
    const data = limited.map((item) => Array.isArray(item) ? item[1] : item.count);
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
function createTrendChart(analysis, rows, mappingsMap) {
    const colName = analysis.column_name;
    if (!colName)
        return null;
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
function createHistogramData(values, bins = 10) {
    if (values.length === 0)
        return { labels: [], data: [] };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const binSize = range / bins;
    const histogram = new Array(bins).fill(0);
    const labels = [];
    // Create bin labels
    for (let i = 0; i < bins; i++) {
        const binStart = min + i * binSize;
        const binEnd = min + (i + 1) * binSize;
        labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
    }
    // Count values in each bin
    values.forEach(value => {
        let binIndex = Math.floor((value - min) / binSize);
        if (binIndex >= bins)
            binIndex = bins - 1;
        if (binIndex < 0)
            binIndex = 0;
        histogram[binIndex]++;
    });
    return { labels, data: histogram };
}
function createTimeSeriesChart(analysis, rows, mappingsMap) {
    const result = analysis.result;
    const dateCol = result.dateColumn;
    const valueCol = result.valueColumn;
    if (!dateCol || !valueCol)
        return null;
    const dateColSuffix = mappingsMap.has(dateCol) ? ` (via ${mappingsMap.get(dateCol)})` : '';
    const valueColSuffix = mappingsMap.has(valueCol) ? ` (via ${mappingsMap.get(valueCol)})` : '';
    const points = [];
    for (const row of rows) {
        const dateValue = row[dateCol];
        const numValue = row[valueCol];
        if (!dateValue || numValue === null || numValue === undefined)
            continue;
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
        const value = Number(numValue);
        if (!isNaN(date.getTime()) && !isNaN(value)) {
            points.push({ date, value });
        }
    }
    // Sort by date
    points.sort((a, b) => a.date.getTime() - b.date.getTime());
    if (points.length === 0)
        return null;
    // Format dates based on granularity
    const formatDate = (date, granularity) => {
        const options = {};
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
    let color;
    let backgroundColor;
    if (result.trend && result.trend.direction === 'up') {
        color = 'rgba(16, 185, 129, 1)'; // green
        backgroundColor = 'rgba(16, 185, 129, 0.1)';
    }
    else if (result.trend && result.trend.direction === 'down') {
        color = 'rgba(239, 68, 68, 1)'; // red
        backgroundColor = 'rgba(239, 68, 68, 0.1)';
    }
    else {
        color = 'rgba(59, 130, 246, 1)'; // blue
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
    const explanationParts = [];
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
                            title: (context) => {
                                return context[0].label;
                            },
                            label: (context) => {
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
                            callback: (value) => {
                                return typeof value === 'number' ? value.toFixed(2) : value;
                            }
                        }
                    }
                }
            }
        }
    };
}
