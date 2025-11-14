// Dimensionality Reduction utilities (PCA, t-SNE concepts)

/**
 * Principal Component Analysis (PCA)
 * Reduces high-dimensional data to lower dimensions while preserving variance
 */

export interface PCAResult {
  // Principal components (eigenvectors)
  components: number[][];

  // Explained variance by each component
  explainedVariance: number[];

  // Cumulative explained variance
  cumulativeVariance: number[];

  // Eigenvalues
  eigenvalues: number[];

  // Feature contributions to each component (loadings)
  loadings: Array<{
    component: number;
    features: Array<{
      name: string;
      loading: number;
      absLoading: number;
    }>;
  }>;

  // Transformed data (projected onto principal components)
  transformedData?: number[][];

  // Original feature names
  featureNames: string[];

  // Recommended number of components (>= 80% variance)
  recommendedComponents: number;

  // Statistics
  totalVariance: number;
  meanVector: number[];
}

/**
 * Calculate mean of each column
 */
function calculateColumnMeans(data: number[][]): number[] {
  const numCols = data[0].length;
  const means = new Array(numCols).fill(0);

  for (const row of data) {
    for (let j = 0; j < numCols; j++) {
      means[j] += row[j];
    }
  }

  return means.map(sum => sum / data.length);
}

/**
 * Center data by subtracting mean
 */
function centerData(data: number[][], means: number[]): number[][] {
  return data.map(row =>
    row.map((val, j) => val - means[j])
  );
}

/**
 * Calculate covariance matrix
 */
function calculateCovarianceMatrix(centeredData: number[][]): number[][] {
  const numCols = centeredData[0].length;
  const n = centeredData.length;
  const cov: number[][] = Array(numCols).fill(0).map(() => Array(numCols).fill(0));

  for (let i = 0; i < numCols; i++) {
    for (let j = i; j < numCols; j++) {
      let sum = 0;
      for (const row of centeredData) {
        sum += row[i] * row[j];
      }
      cov[i][j] = sum / (n - 1);
      cov[j][i] = cov[i][j]; // Symmetric
    }
  }

  return cov;
}

/**
 * Power iteration method to find dominant eigenvector
 */
function powerIteration(matrix: number[][], iterations = 100): { eigenvalue: number; eigenvector: number[] } {
  const n = matrix.length;
  let vector = new Array(n).fill(1 / Math.sqrt(n)); // Normalized initial guess

  for (let iter = 0; iter < iterations; iter++) {
    // Matrix-vector multiplication
    const newVector = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        newVector[i] += matrix[i][j] * vector[j];
      }
    }

    // Normalize
    const norm = Math.sqrt(newVector.reduce((sum, val) => sum + val * val, 0));
    vector = newVector.map(val => val / norm);
  }

  // Calculate eigenvalue (Rayleigh quotient)
  let eigenvalue = 0;
  for (let i = 0; i < n; i++) {
    let matVecProduct = 0;
    for (let j = 0; j < n; j++) {
      matVecProduct += matrix[i][j] * vector[j];
    }
    eigenvalue += vector[i] * matVecProduct;
  }

  return { eigenvalue, eigenvector: vector };
}

/**
 * Deflate matrix to find next eigenvector
 */
function deflateMatrix(matrix: number[][], eigenvalue: number, eigenvector: number[]): number[][] {
  const n = matrix.length;
  const deflated: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      deflated[i][j] = matrix[i][j] - eigenvalue * eigenvector[i] * eigenvector[j];
    }
  }

  return deflated;
}

/**
 * Calculate eigenvalues and eigenvectors using power iteration with deflation
 */
function eigenDecomposition(covMatrix: number[][], numComponents: number): {
  eigenvalues: number[];
  eigenvectors: number[][];
} {
  const eigenvalues: number[] = [];
  const eigenvectors: number[][] = [];
  let currentMatrix = covMatrix.map(row => [...row]); // Deep copy

  for (let i = 0; i < numComponents; i++) {
    const { eigenvalue, eigenvector } = powerIteration(currentMatrix, 200);

    if (Math.abs(eigenvalue) < 1e-10) break; // Stop if eigenvalue is too small

    eigenvalues.push(eigenvalue);
    eigenvectors.push(eigenvector);

    // Deflate matrix for next iteration
    currentMatrix = deflateMatrix(currentMatrix, eigenvalue, eigenvector);
  }

  return { eigenvalues, eigenvectors };
}

/**
 * Project data onto principal components
 */
function projectData(centeredData: number[][], components: number[][]): number[][] {
  return centeredData.map(row =>
    components.map(component =>
      row.reduce((sum, val, i) => sum + val * component[i], 0)
    )
  );
}

/**
 * Perform PCA on numeric data
 *
 * @param data - 2D array where each row is an observation, each column is a feature
 * @param featureNames - Names of the features/columns
 * @param numComponents - Number of principal components to compute (default: min(features, samples, 10))
 * @param includeTransformed - Whether to include transformed data in result
 * @returns PCA analysis results
 */
export function performPCA(
  data: number[][],
  featureNames: string[],
  numComponents?: number,
  includeTransformed = false
): PCAResult | null {
  // Validation
  if (data.length === 0 || data[0].length === 0) {
    return null;
  }

  if (data[0].length < 2) {
    // PCA needs at least 2 features
    return null;
  }

  const numFeatures = data[0].length;
  const numSamples = data.length;

  // Default to min of features, samples, or 10 components
  const maxComponents = Math.min(numFeatures, numSamples, 10);
  const targetComponents = numComponents ?? maxComponents;

  // Step 1: Calculate means and center data
  const means = calculateColumnMeans(data);
  const centeredData = centerData(data, means);

  // Step 2: Calculate covariance matrix
  const covMatrix = calculateCovarianceMatrix(centeredData);

  // Step 3: Find eigenvalues and eigenvectors
  const { eigenvalues, eigenvectors } = eigenDecomposition(covMatrix, targetComponents);

  if (eigenvalues.length === 0) {
    return null;
  }

  // Step 4: Calculate explained variance
  const totalVariance = eigenvalues.reduce((sum, val) => sum + Math.abs(val), 0);
  const explainedVariance = eigenvalues.map(val => (Math.abs(val) / totalVariance) * 100);

  // Step 5: Calculate cumulative variance
  const cumulativeVariance: number[] = [];
  let cumSum = 0;
  for (const variance of explainedVariance) {
    cumSum += variance;
    cumulativeVariance.push(cumSum);
  }

  // Step 6: Determine recommended number of components (80% threshold)
  const recommendedComponents = cumulativeVariance.findIndex(cum => cum >= 80) + 1 || eigenvalues.length;

  // Step 7: Calculate feature loadings (contributions)
  const loadings = eigenvectors.map((component, idx) => {
    const features = featureNames.map((name, featureIdx) => ({
      name,
      loading: component[featureIdx],
      absLoading: Math.abs(component[featureIdx])
    }));

    // Sort by absolute loading (contribution)
    features.sort((a, b) => b.absLoading - a.absLoading);

    return {
      component: idx + 1,
      features
    };
  });

  // Step 8: Optionally project data
  const transformedData = includeTransformed
    ? projectData(centeredData, eigenvectors)
    : undefined;

  return {
    components: eigenvectors,
    explainedVariance,
    cumulativeVariance,
    eigenvalues,
    loadings,
    transformedData,
    featureNames,
    recommendedComponents,
    totalVariance,
    meanVector: means
  };
}

/**
 * Analyze dataset for PCA suitability
 */
export function assessPCASuitability(
  numericColumns: number,
  rowCount: number,
  correlationStrength: number
): {
  suitable: boolean;
  reason: string;
  confidence: number;
} {
  // Need at least 3 numeric columns
  if (numericColumns < 3) {
    return {
      suitable: false,
      reason: 'Too few numeric columns for meaningful dimensionality reduction',
      confidence: 1.0
    };
  }

  // Need reasonable sample size
  if (rowCount < 10) {
    return {
      suitable: false,
      reason: 'Insufficient samples for reliable PCA',
      confidence: 1.0
    };
  }

  // High-dimensional data is ideal
  if (numericColumns >= 10) {
    return {
      suitable: true,
      reason: 'High-dimensional dataset - excellent candidate for dimensionality reduction',
      confidence: 0.95
    };
  }

  // Medium dimensions with strong correlations
  if (numericColumns >= 5 && correlationStrength > 0.3) {
    return {
      suitable: true,
      reason: 'Multiple correlated features detected - PCA can reveal underlying patterns',
      confidence: 0.85
    };
  }

  // Moderate suitability
  if (numericColumns >= 3) {
    return {
      suitable: true,
      reason: 'Dataset has multiple dimensions - PCA may reveal structure',
      confidence: 0.6
    };
  }

  return {
    suitable: false,
    reason: 'Dataset structure not ideal for PCA',
    confidence: 0.8
  };
}

/**
 * Interpret principal component based on feature loadings
 */
export function interpretComponent(
  loadings: PCAResult['loadings'][0],
  topN = 3
): string {
  const topFeatures = loadings.features.slice(0, topN);

  if (topFeatures.length === 0) return 'Unknown component';

  const descriptions = topFeatures.map(f => {
    const strength = f.absLoading > 0.7 ? 'strongly' : f.absLoading > 0.4 ? 'moderately' : 'weakly';
    const direction = f.loading > 0 ? 'positively' : 'negatively';
    return `${strength} ${direction} correlated with ${f.name}`;
  });

  return `Component ${loadings.component}: ${descriptions.join(', ')}`;
}

/**
 * Generate PCA insights
 */
export function generatePCAInsights(result: PCAResult): string[] {
  const insights: string[] = [];

  // Overall dimensionality reduction potential
  const variance80 = result.recommendedComponents;
  const totalFeatures = result.featureNames.length;
  const reduction = ((totalFeatures - variance80) / totalFeatures * 100).toFixed(0);

  if (variance80 < totalFeatures) {
    insights.push(
      `Dimensionality can be reduced from ${totalFeatures} to ${variance80} features ` +
      `(${reduction}% reduction) while retaining 80% of variance`
    );
  }

  // First component insights
  if (result.explainedVariance.length > 0) {
    const pc1Variance = result.explainedVariance[0].toFixed(1);
    insights.push(
      `First principal component explains ${pc1Variance}% of total variance`
    );

    const pc1Interpretation = interpretComponent(result.loadings[0]);
    insights.push(pc1Interpretation);
  }

  // Second component if exists
  if (result.explainedVariance.length > 1) {
    const pc2Interpretation = interpretComponent(result.loadings[1]);
    insights.push(pc2Interpretation);
  }

  // Check for highly redundant features
  const topLoading = result.loadings[0]?.features[0];
  if (topLoading && topLoading.absLoading > 0.9) {
    insights.push(
      `Feature "${topLoading.name}" dominates first component - may represent core underlying factor`
    );
  }

  return insights;
}
