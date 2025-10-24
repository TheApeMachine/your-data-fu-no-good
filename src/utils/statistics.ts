// Statistical analysis utilities

export interface Stats {
  count: number;
  mean?: number;
  median?: number;
  mode?: any;
  stdDev?: number;
  min?: any;
  max?: any;
  q1?: number;
  q2?: number;
  q3?: number;
  nullCount: number;
  uniqueCount: number;
}

export function calculateStats(values: any[], columnType: string): Stats {
  const filtered = values.filter(v => v !== null && v !== undefined && v !== '');
  const nullCount = values.length - filtered.length;
  const uniqueCount = new Set(filtered).size;

  if (columnType === 'number') {
    const numbers = filtered.map(v => Number(v)).filter(n => !isNaN(n));
    return {
      count: values.length,
      mean: mean(numbers),
      median: median(numbers),
      mode: mode(numbers),
      stdDev: stdDev(numbers),
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      q1: percentile(numbers, 25),
      q2: percentile(numbers, 50),
      q3: percentile(numbers, 75),
      nullCount,
      uniqueCount
    };
  }

  return {
    count: values.length,
    mode: mode(filtered),
    min: filtered[0],
    max: filtered[filtered.length - 1],
    nullCount,
    uniqueCount
  };
}

function mean(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function mode(values: any[]): any {
  if (values.length === 0) return null;
  const frequency: Record<string, number> = {};
  let maxFreq = 0;
  let modeValue = null;

  for (const val of values) {
    const key = String(val);
    frequency[key] = (frequency[key] || 0) + 1;
    if (frequency[key] > maxFreq) {
      maxFreq = frequency[key];
      modeValue = val;
    }
  }

  return modeValue;
}

function stdDev(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const avg = mean(numbers);
  const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

function percentile(numbers: number[], p: number): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) return sorted[lower];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function detectOutliers(numbers: number[]): { indices: number[], threshold: number } {
  if (numbers.length < 4) return { indices: [], threshold: 0 };

  const q1 = percentile(numbers, 25);
  const q3 = percentile(numbers, 75);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const indices: number[] = [];
  numbers.forEach((n, i) => {
    if (n < lowerBound || n > upperBound) {
      indices.push(i);
    }
  });

  return { indices, threshold: iqr };
}

export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  if (denomX === 0 || denomY === 0) return 0;
  return numerator / Math.sqrt(denomX * denomY);
}

export function detectTrend(values: number[]): { direction: 'up' | 'down' | 'stable', strength: number } {
  if (values.length < 2) return { direction: 'stable', strength: 0 };

  // Simple linear regression
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const meanX = mean(x);
  const meanY = mean(values);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (values[i] - meanY);
    denominator += Math.pow(x[i] - meanX, 2);
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const strength = Math.min(Math.abs(slope) / (mean(values) || 1), 1);

  if (Math.abs(slope) < 0.01) return { direction: 'stable', strength: 0 };
  return { direction: slope > 0 ? 'up' : 'down', strength };
}
