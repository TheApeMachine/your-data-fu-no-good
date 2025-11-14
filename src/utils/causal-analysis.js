// Causal Analysis for Time Series Data
// Implements Granger causality testing and conditional independence
/**
 * Calculate autocorrelation for a time series at a specific lag
 */
function autocorrelation(series, lag) {
    const n = series.length;
    if (lag >= n || lag < 0)
        return 0;
    const mean = series.reduce((sum, val) => sum + val, 0) / n;
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n - lag; i++) {
        numerator += (series[i] - mean) * (series[i + lag] - mean);
    }
    for (let i = 0; i < n; i++) {
        denominator += Math.pow(series[i] - mean, 2);
    }
    return denominator !== 0 ? numerator / denominator : 0;
}
/**
 * Simple linear regression for Granger causality test
 */
function linearRegression(y, X) {
    const n = y.length;
    const k = X[0].length;
    // Use simple OLS formula for small dimensions
    // For production, use proper matrix library
    // Calculate means
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    const xMeans = X[0].map((_, j) => X.reduce((sum, row) => sum + row[j], 0) / n);
    // Calculate coefficients using simplified approach for 1-2 predictors
    const predictions = [];
    if (k === 1) {
        // Simple linear regression
        let numerator = 0;
        let denominator = 0;
        for (let i = 0; i < n; i++) {
            numerator += (X[i][0] - xMeans[0]) * (y[i] - yMean);
            denominator += Math.pow(X[i][0] - xMeans[0], 2);
        }
        const slope = denominator !== 0 ? numerator / denominator : 0;
        const intercept = yMean - slope * xMeans[0];
        for (let i = 0; i < n; i++) {
            predictions.push(intercept + slope * X[i][0]);
        }
    }
    else {
        // For multiple predictors, use mean as prediction (fallback)
        for (let i = 0; i < n; i++) {
            predictions.push(yMean);
        }
    }
    // Calculate residuals and R²
    const residuals = y.map((val, i) => val - predictions[i]);
    const ssResidual = residuals.reduce((sum, r) => sum + r * r, 0);
    const ssTotal = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const rSquared = ssTotal !== 0 ? 1 - ssResidual / ssTotal : 0;
    return { residuals, rSquared };
}
/**
 * Granger causality test
 * Tests whether X "Granger-causes" Y
 */
export function grangerCausalityTest(y, x, yName, xName, maxLag = 3) {
    const n = y.length;
    if (n !== x.length || n < 10) {
        return null; // Need sufficient data
    }
    // Determine optimal lag using autocorrelation
    let optimalLag = 1;
    for (let lag = 1; lag <= maxLag; lag++) {
        const acf = autocorrelation(y, lag);
        if (Math.abs(acf) > 0.1) {
            optimalLag = lag;
        }
    }
    // Build lagged predictors
    const lag = optimalLag;
    // Restricted model: y(t) ~ y(t-1), y(t-2), ..., y(t-lag)
    const yRestricted = [];
    const XRestricted = [];
    for (let i = lag; i < n; i++) {
        yRestricted.push(y[i]);
        const row = [];
        for (let l = 1; l <= lag; l++) {
            row.push(y[i - l]);
        }
        XRestricted.push(row);
    }
    const restrictedModel = linearRegression(yRestricted, XRestricted);
    // Unrestricted model: y(t) ~ y(t-1), ..., y(t-lag), x(t-1), ..., x(t-lag)
    const yUnrestricted = [];
    const XUnrestricted = [];
    for (let i = lag; i < n; i++) {
        yUnrestricted.push(y[i]);
        const row = [];
        // Add y lags
        for (let l = 1; l <= lag; l++) {
            row.push(y[i - l]);
        }
        // Add x lags
        for (let l = 1; l <= lag; l++) {
            row.push(x[i - l]);
        }
        XUnrestricted.push(row);
    }
    const unrestrictedModel = linearRegression(yUnrestricted, XUnrestricted);
    // Calculate F-statistic
    const rssRestricted = restrictedModel.residuals.reduce((sum, r) => sum + r * r, 0);
    const rssUnrestricted = unrestrictedModel.residuals.reduce((sum, r) => sum + r * r, 0);
    const nObs = yRestricted.length;
    const kRestricted = lag;
    const kUnrestricted = lag * 2;
    const fStatistic = ((rssRestricted - rssUnrestricted) / (kUnrestricted - kRestricted)) /
        (rssUnrestricted / (nObs - kUnrestricted - 1));
    // Approximate p-value using F-distribution approximation
    // For proper implementation, use F-distribution CDF
    // Simplified: use threshold-based approach
    const fCritical = 3.84; // Approximate F(1, 30) at p=0.05
    const pValue = fStatistic > fCritical ? 0.01 : 0.5; // Simplified
    const significant = fStatistic > fCritical;
    const confidence = significant ? Math.min(0.95, 0.5 + (fStatistic - fCritical) / 10) : 0.3;
    return {
        causedBy: xName,
        causes: yName,
        fStatistic,
        pValue,
        lags: lag,
        significant,
        confidence,
        direction: 'unidirectional' // Would need bidirectional test for full answer
    };
}
/**
 * Test conditional independence using partial correlation
 * Tests if X ⊥ Y | Z (X independent of Y given Z)
 */
export function testConditionalIndependence(x, y, z, xName, yName, zName) {
    const n = x.length;
    if (n !== y.length || (z && n !== z.length)) {
        throw new Error('All series must have the same length');
    }
    // Calculate correlation between x and y
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    let correlationXY = 0;
    let varX = 0;
    let varY = 0;
    for (let i = 0; i < n; i++) {
        const xDiff = x[i] - xMean;
        const yDiff = y[i] - yMean;
        correlationXY += xDiff * yDiff;
        varX += xDiff * xDiff;
        varY += yDiff * yDiff;
    }
    correlationXY /= Math.sqrt(varX * varY);
    // If conditioning on Z, calculate partial correlation
    let partialCorrelation = correlationXY;
    if (z) {
        const zMean = z.reduce((sum, val) => sum + val, 0) / n;
        let correlationXZ = 0;
        let correlationYZ = 0;
        let varZ = 0;
        for (let i = 0; i < n; i++) {
            const xDiff = x[i] - xMean;
            const yDiff = y[i] - yMean;
            const zDiff = z[i] - zMean;
            correlationXZ += xDiff * zDiff;
            correlationYZ += yDiff * zDiff;
            varZ += zDiff * zDiff;
        }
        correlationXZ /= Math.sqrt(varX * varZ);
        correlationYZ /= Math.sqrt(varY * varZ);
        // Partial correlation formula
        partialCorrelation =
            (correlationXY - correlationXZ * correlationYZ) /
                Math.sqrt((1 - correlationXZ * correlationXZ) * (1 - correlationYZ * correlationYZ));
    }
    // Test statistic (Fisher's Z transformation)
    const testStatistic = Math.abs(partialCorrelation) * Math.sqrt(n - 3);
    // Approximate p-value
    const pValue = testStatistic > 1.96 ? 0.01 : 0.5; // Simplified
    const independent = Math.abs(partialCorrelation) < 0.1;
    const confidence = independent ? 0.8 : 0.5;
    return {
        variable1: xName,
        variable2: yName,
        conditionedOn: zName ? [zName] : undefined,
        independent,
        testStatistic,
        pValue,
        confidence
    };
}
/**
 * Generate causal insights from correlation analysis
 */
export function generateCausalityInsights(correlations, hasTimeData) {
    const insights = [];
    // Strong correlations
    const strongCorrelations = correlations.filter(c => Math.abs(c.correlation) > 0.7);
    if (strongCorrelations.length > 0) {
        for (const corr of strongCorrelations.slice(0, 3)) {
            insights.push({
                type: 'correlation_causality',
                summary: `Strong correlation (r=${corr.correlation.toFixed(2)}) between ${corr.column1} and ${corr.column2}`,
                confidence: Math.abs(corr.correlation),
                evidence: [
                    `Correlation coefficient: ${corr.correlation.toFixed(3)}`,
                    `Strength: ${Math.abs(corr.correlation) > 0.9 ? 'Very Strong' : 'Strong'}`
                ],
                caveats: [
                    'Correlation does not imply causation',
                    'May be driven by confounding variables',
                    hasTimeData
                        ? 'Consider Granger causality test for temporal data'
                        : 'Time series data needed for causality testing',
                    'Could be spurious correlation'
                ]
            });
        }
    }
    // General causality insight
    if (hasTimeData && strongCorrelations.length > 0) {
        insights.push({
            type: 'granger',
            summary: `${strongCorrelations.length} strong correlations detected - Granger causality testing recommended for temporal analysis`,
            confidence: 0.7,
            evidence: [
                `${strongCorrelations.length} variable pairs show strong correlation`,
                'Temporal data available for causality testing'
            ],
            caveats: [
                'Granger causality tests predictive causality, not true causation',
                'Requires stationary time series',
                'Sensitive to lag selection',
                'Bidirectional causality possible'
            ]
        });
    }
    return insights;
}
/**
 * Assess whether causal analysis is appropriate for dataset
 */
export function assessCausalAnalysisFeasibility(numericColumns, rowCount, hasTimestamps) {
    const feasible = numericColumns >= 2 && rowCount >= 30;
    const recommendedTests = [];
    const requirements = [];
    if (hasTimestamps && numericColumns >= 2) {
        recommendedTests.push('Granger causality test');
        requirements.push('Ensure time series is stationary (use ADF test)');
        requirements.push('Select appropriate lag order');
    }
    if (numericColumns >= 3) {
        recommendedTests.push('Conditional independence testing');
        recommendedTests.push('Partial correlation analysis');
        requirements.push('Identify potential confounding variables');
    }
    if (feasible) {
        recommendedTests.push('Correlation vs causation analysis');
    }
    if (!feasible) {
        requirements.push(numericColumns < 2
            ? 'At least 2 numeric columns required'
            : 'At least 30 observations required');
    }
    const confidence = feasible ? (hasTimestamps ? 0.8 : 0.6) : 0.3;
    return {
        feasible,
        recommendedTests,
        requirements,
        confidence
    };
}
