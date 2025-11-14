const MAX_CLUSTERS = 6;
const MAX_ITERATIONS = 50;
const MIN_ROWS_FOR_CLUSTERING = 50;
const MIN_VARIANCE_FOR_CLUSTERING = 0.1;
function normalize(data) {
    const numSamples = data.length;
    if (numSamples === 0)
        return [];
    const numFeatures = data[0].length;
    const normalized = Array.from({ length: numSamples }, () => new Array(numFeatures).fill(0));
    for (let j = 0; j < numFeatures; j++) {
        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < numSamples; i++) {
            if (data[i][j] < min)
                min = data[i][j];
            if (data[i][j] > max)
                max = data[i][j];
        }
        const range = max - min;
        if (range < 1e-9) {
            for (let i = 0; i < numSamples; i++)
                normalized[i][j] = 0;
        }
        else {
            for (let i = 0; i < numSamples; i++) {
                normalized[i][j] = (data[i][j] - min) / range;
            }
        }
    }
    return normalized;
}
function euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
}
function runKMeans(data, k) {
    const numSamples = data.length;
    const numFeatures = data[0].length;
    let centroids = [];
    const initialIndices = new Set();
    while (initialIndices.size < k) {
        initialIndices.add(Math.floor(Math.random() * numSamples));
    }
    centroids = Array.from(initialIndices).map(idx => [...data[idx]]);
    let assignments = new Array(numSamples).fill(0);
    let changed = true;
    for (let iter = 0; iter < MAX_ITERATIONS && changed; iter++) {
        changed = false;
        // Assignment step
        for (let i = 0; i < numSamples; i++) {
            let minDistance = Infinity;
            let closestCentroid = -1;
            for (let j = 0; j < k; j++) {
                const distance = euclideanDistance(data[i], centroids[j]);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCentroid = j;
                }
            }
            if (assignments[i] !== closestCentroid) {
                assignments[i] = closestCentroid;
                changed = true;
            }
        }
        // Update step
        const newCentroids = Array.from({ length: k }, () => new Array(numFeatures).fill(0));
        const counts = new Array(k).fill(0);
        for (let i = 0; i < numSamples; i++) {
            const clusterId = assignments[i];
            counts[clusterId]++;
            for (let j = 0; j < numFeatures; j++) {
                newCentroids[clusterId][j] += data[i][j];
            }
        }
        for (let j = 0; j < k; j++) {
            if (counts[j] > 0) {
                for (let l = 0; l < numFeatures; l++) {
                    newCentroids[j][l] /= counts[j];
                }
            }
            else {
                // Re-initialize empty clusters
                newCentroids[j] = data[Math.floor(Math.random() * numSamples)];
            }
        }
        centroids = newCentroids;
    }
    return { clusters: centroids, assignments };
}
function calculateWCSS(data, assignments, centroids) {
    let wcss = 0;
    for (let i = 0; i < data.length; i++) {
        const clusterId = assignments[i];
        if (centroids[clusterId]) {
            wcss += euclideanDistance(data[i], centroids[clusterId]) ** 2;
        }
    }
    return wcss;
}
function getColumnProfile(clusterCentroidValue, overallStats) {
    const { mean, stdDev } = overallStats;
    const oneStdDev = stdDev || 0.001;
    let description = 'average';
    if (clusterCentroidValue < mean - 0.5 * oneStdDev) {
        description = 'low';
    }
    else if (clusterCentroidValue > mean + 0.5 * oneStdDev) {
        description = 'high';
    }
    return {
        mean: clusterCentroidValue,
        min: overallStats.min,
        max: overallStats.max,
        description,
    };
}
export function findOptimalClusters(rows, columns) {
    const numericColumns = columns.filter(c => c.type === 'number' &&
        c.profile?.is_identifier !== true &&
        (c.profile?.stats?.stddev ?? 0 / (c.profile?.stats?.mean ?? 1)) > MIN_VARIANCE_FOR_CLUSTERING);
    if (numericColumns.length < 2 || rows.length < MIN_ROWS_FOR_CLUSTERING) {
        return null;
    }
    const columnNames = numericColumns.map(c => c.name);
    const data = rows.map(row => columnNames.map(name => Number(row[name]) || 0));
    const normalizedData = normalize(data);
    const wcssValues = [];
    for (let k = 2; k <= MAX_CLUSTERS; k++) {
        const { assignments, clusters } = runKMeans(normalizedData, k);
        wcssValues.push(calculateWCSS(normalizedData, assignments, clusters));
    }
    // Use elbow method to find optimal k
    let bestK = 2;
    let maxElbow = 0;
    for (let i = 1; i < wcssValues.length - 1; i++) {
        const elbow = wcssValues[i - 1] - wcssValues[i] > wcssValues[i] - wcssValues[i + 1] ? wcssValues[i - 1] - wcssValues[i] : 0;
        if (elbow > maxElbow) {
            maxElbow = elbow;
            bestK = i + 2;
        }
    }
    const { assignments, clusters: finalCentroidsNormalized } = runKMeans(normalizedData, bestK);
    // De-normalize centroids
    const finalCentroids = [];
    for (const normCentroid of finalCentroidsNormalized) {
        const centroid = [];
        for (let j = 0; j < columnNames.length; j++) {
            const colData = data.map(d => d[j]);
            const min = Math.min(...colData);
            const max = Math.max(...colData);
            centroid.push(normCentroid[j] * (max - min) + min);
        }
        finalCentroids.push(centroid);
    }
    const overallColumnStats = {};
    for (let i = 0; i < columnNames.length; i++) {
        const name = columnNames[i];
        const values = data.map(row => row[i]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / values.length);
        overallColumnStats[name] = { mean, stdDev, min: Math.min(...values), max: Math.max(...values) };
    }
    const clusterDetails = [];
    const counts = new Array(bestK).fill(0);
    assignments.forEach(a => counts[a]++);
    for (let i = 0; i < bestK; i++) {
        const centroidMap = {};
        const profileMap = {};
        columnNames.forEach((name, j) => {
            centroidMap[name] = finalCentroids[i][j];
            profileMap[name] = getColumnProfile(finalCentroids[i][j], overallColumnStats[name]);
        });
        clusterDetails.push({
            id: i,
            centroid: centroidMap,
            size: counts[i],
            profile: profileMap,
        });
    }
    return {
        columns: columnNames,
        clusters: clusterDetails.sort((a, b) => b.size - a.size),
        totalWithinClusterSumOfSquares: wcssValues[bestK - 2],
        elbowScore: maxElbow,
    };
}
