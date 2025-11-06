// Quality/Usefulness scoring for insights and visualizations
export function scoreInsightQuality(analysisType, columnName, result, stats) {
    let score = 50; // Start neutral
    const reasons = [];
    // High-value column detection (negative signals)
    if (columnName) {
        const colLower = columnName.toLowerCase();
        // IDs are usually low-value for insights
        if (colLower.includes('id') || colLower === 'index') {
            score -= 30;
            reasons.push('Identifier column (typically unique values)');
        }
        // Names are usually low-value (too many unique values)
        if (colLower.includes('name') && stats.uniqueCount / stats.count > 0.8) {
            score -= 25;
            reasons.push('High cardinality name column');
        }
        // Email/phone/address - typically unique
        if (colLower.includes('email') || colLower.includes('phone') || colLower.includes('address')) {
            score -= 30;
            reasons.push('Personal identifier (typically unique)');
        }
        // Timestamps/dates with all unique values
        if ((colLower.includes('time') || colLower.includes('date')) && stats.uniqueCount / stats.count > 0.9) {
            score -= 20;
            reasons.push('High precision timestamp');
        }
    }
    // Analysis type specific scoring
    switch (analysisType) {
        case 'statistics':
            if (stats.uniqueCount === 1) {
                score -= 40;
                reasons.push('All values are identical');
            }
            else if (stats.uniqueCount === stats.count) {
                score -= 35;
                reasons.push('All values are unique (no patterns)');
            }
            else if (stats.uniqueCount / stats.count > 0.9) {
                score -= 25;
                reasons.push('Very high cardinality (few patterns)');
            }
            else if (stats.uniqueCount / stats.count < 0.1) {
                score += 20;
                reasons.push('Low cardinality (clear patterns)');
            }
            // High variance in numeric data is interesting
            if (stats.stdDev !== undefined && stats.mean !== undefined) {
                const cv = stats.stdDev / Math.abs(stats.mean || 1); // Coefficient of variation
                if (cv > 0.5) {
                    score += 15;
                    reasons.push('High variability in data');
                }
            }
            break;
        case 'correlation':
            const pearsonValue = typeof result.pearson === 'number'
                ? result.pearson
                : (typeof result.correlation === 'number' ? result.correlation : 0);
            const spearmanValue = typeof result.spearman === 'number' ? result.spearman : 0;
            const nmiValue = typeof result.normalized_mutual_information === 'number'
                ? result.normalized_mutual_information
                : 0;
            const correlationStrength = result.best_strength !== undefined
                ? Math.abs(result.best_strength)
                : Math.max(Math.abs(pearsonValue || 0), Math.abs(spearmanValue || 0), nmiValue || 0);
            if (correlationStrength > 0.8) {
                score += 30;
                reasons.push('Very strong dependency between metrics');
            }
            else if (correlationStrength > 0.6) {
                score += 20;
                reasons.push('Strong dependency between metrics');
            }
            else if (correlationStrength > 0.5) {
                score += 10;
                reasons.push('Moderate dependency between metrics');
            }
            break;
        case 'outlier':
            const outlierCount = result.count || 0;
            const outlierPercent = result.percentage !== undefined
                ? (result.percentage / 100)
                : outlierCount / Math.max(stats.count || 1, 1);
            if (outlierPercent > 0.05 && outlierPercent < 0.2) {
                score += 25;
                reasons.push('Significant outliers detected');
            }
            else if (outlierPercent > 0) {
                score += 10;
                reasons.push('Some outliers present');
            }
            break;
        case 'pattern':
            const topPattern = result.topPatterns?.[0];
            if (topPattern) {
                const count = Array.isArray(topPattern) ? topPattern[1] : topPattern.count || 0;
                const dominance = topPattern.percentage !== undefined
                    ? (topPattern.percentage / 100)
                    : count / Math.max(stats.count || 1, 1);
                if (dominance > 0.3 && dominance < 0.9) {
                    score += 20;
                    reasons.push('Clear dominant pattern');
                }
            }
            break;
        case 'missing':
            const missingPercent = result.percentage !== undefined
                ? (result.percentage / 100)
                : (result.count || 0) / Math.max(result.total || stats.count || 1, 1);
            if (missingPercent > 0.5) {
                score += 25;
                reasons.push('Extensive missing data detected');
            }
            else if (missingPercent > 0.2) {
                score += 15;
                reasons.push('Notable rate of missing values');
            }
            else if (missingPercent > 0.05) {
                score += 5;
                reasons.push('Some missing data requiring attention');
            }
            break;
        case 'anomaly':
            const anomalyShare = result.share !== undefined
                ? (result.share / 100)
                : (result.total_anomalies || 0) / Math.max(stats.count || 1, 1);
            if (anomalyShare > 0.1) {
                score += 30;
                reasons.push('Large cluster of unusual values');
            }
            else if (anomalyShare > 0.05) {
                score += 20;
                reasons.push('Noticeable group of anomalies');
            }
            else if (anomalyShare > 0.01) {
                score += 10;
                reasons.push('A few standout records worth investigating');
            }
            break;
        case 'feature':
            const featureConfidence = result.confidence ?? 0.5;
            score += Math.round(featureConfidence * 30);
            reasons.push('Automatic feature engineering opportunity');
            if (typeof result.expected_benefit === 'string') {
                score += 5;
                reasons.push('Includes clear benefit statement');
            }
            if (Array.isArray(result.columns) && result.columns.length > 1) {
                score += 5;
                reasons.push('Combines multiple columns for richer context');
            }
            break;
        case 'trend':
            const strength = result.strength || 0;
            if (strength > 0.5) {
                score += 30;
                reasons.push('Strong trend detected');
            }
            else if (strength > 0.3) {
                score += 15;
                reasons.push('Moderate trend');
            }
            break;
        case 'timeseries':
            // Time-series are high-value insights
            score += 20;
            reasons.push('Time-series analysis');
            const tsStrength = result.trend?.strength || 0;
            if (tsStrength > 0.6) {
                score += 25;
                reasons.push('Strong temporal trend');
            }
            else if (tsStrength > 0.3) {
                score += 15;
                reasons.push('Moderate temporal trend');
            }
            if (result.seasonality && result.seasonality !== 'none') {
                score += 25;
                reasons.push(`${result.seasonality} seasonality detected`);
            }
            if (result.growthRate && Math.abs(result.growthRate) > 20) {
                score += 15;
                reasons.push('Significant growth/decline');
            }
            // Long time-series are more valuable
            if (result.points > 50) {
                score += 10;
                reasons.push('Sufficient data points for analysis');
            }
            break;
    }
    // Null handling
    if (stats.nullCount > 0) {
        const nullPercent = stats.nullCount / stats.count;
        if (nullPercent > 0.5) {
            score -= 30;
            reasons.push('More than 50% missing data');
        }
        else if (nullPercent > 0.2) {
            score -= 15;
            reasons.push('Significant missing data');
        }
    }
    // Clamp score to 0-100
    score = Math.max(0, Math.min(100, score));
    return { score, reasons };
}
export function shouldGenerateVisualization(qualityScore) {
    // Only generate visualizations for insights with score >= 30
    return qualityScore.score >= 30;
}
export function getQualityLabel(score) {
    if (score >= 70)
        return 'High Value';
    if (score >= 50)
        return 'Moderate Value';
    if (score >= 30)
        return 'Low Value';
    return 'Very Low Value';
}
export function getQualityColor(score) {
    if (score >= 70)
        return 'green';
    if (score >= 50)
        return 'yellow';
    if (score >= 30)
        return 'orange';
    return 'red';
}
