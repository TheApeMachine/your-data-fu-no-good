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

/**
 * Time-series specific statistics and analysis
 */
export interface TimeSeriesPoint {
  timestamp: number; // Unix timestamp
  value: number;
  date: Date;
}

export interface TimeSeriesStats {
  points: TimeSeriesPoint[];
  firstDate: Date;
  lastDate: Date;
  duration: number; // in milliseconds
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  trend: { direction: 'up' | 'down' | 'stable', strength: number };
  seasonality?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
  volatility: number; // coefficient of variation
  growthRate?: number; // percentage change from first to last
}

/**
 * Parse date string to Date object with better format support
 */
export function parseDate(dateString: string): Date | null {
  const trimmed = String(dateString).trim();
  const parsed = Date.parse(trimmed);
  
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }
  
  // Try additional formats
  // Handle "Jan 1, 2024" format
  const monthDayYear = /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/;
  const match = trimmed.match(monthDayYear);
  if (match) {
    return new Date(`${match[1]} ${match[2]}, ${match[3]}`);
  }
  
  return null;
}

/**
 * Analyze time-series data
 */
export function analyzeTimeSeries(
  dates: (string | Date)[],
  values: number[]
): TimeSeriesStats | null {
  if (dates.length !== values.length || dates.length < 2) return null;
  
  // Parse dates and create time-series points
  const points: TimeSeriesPoint[] = [];
  
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i] instanceof Date ? dates[i] as Date : parseDate(dates[i] as string);
    if (!date || isNaN(date.getTime())) continue;
    
    const value = Number(values[i]);
    if (isNaN(value)) continue;
    
    points.push({
      timestamp: date.getTime(),
      value,
      date
    });
  }
  
  if (points.length < 2) return null;
  
  // Sort by timestamp
  points.sort((a, b) => a.timestamp - b.timestamp);
  
  const firstDate = points[0].date;
  const lastDate = points[points.length - 1].date;
  const duration = lastDate.getTime() - firstDate.getTime();
  
  // Determine granularity based on average gap between points
  const gaps = [];
  for (let i = 1; i < points.length; i++) {
    gaps.push(points[i].timestamp - points[i - 1].timestamp);
  }
  const avgGap = mean(gaps);
  
  let granularity: TimeSeriesStats['granularity'];
  if (avgGap < 3600000 * 6) granularity = 'hourly';        // < 6 hours
  else if (avgGap < 86400000 * 3) granularity = 'daily';   // < 3 days
  else if (avgGap < 86400000 * 10) granularity = 'weekly'; // < 10 days
  else if (avgGap < 86400000 * 45) granularity = 'monthly';// < 45 days
  else granularity = 'yearly';
  
  // Calculate trend
  const valueArray = points.map(p => p.value);
  const trend = detectTrend(valueArray);
  
  // Calculate volatility (coefficient of variation)
  const meanValue = mean(valueArray);
  const stdDevValue = stdDev(valueArray);
  const volatility = meanValue !== 0 ? stdDevValue / Math.abs(meanValue) : 0;
  
  // Calculate growth rate
  const growthRate = points[0].value !== 0 
    ? ((points[points.length - 1].value - points[0].value) / Math.abs(points[0].value)) * 100
    : 0;
  
  // Detect seasonality (simplified - check for periodic patterns)
  const seasonality = detectSeasonality(points, granularity);
  
  return {
    points,
    firstDate,
    lastDate,
    duration,
    granularity,
    trend,
    seasonality,
    volatility,
    growthRate
  };
}

/**
 * Detect seasonal patterns in time-series data
 */
function detectSeasonality(
  points: TimeSeriesPoint[],
  granularity: string
): 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none' {
  if (points.length < 14) return 'none'; // Need at least 2 weeks of data
  
  // For daily granularity, check weekly patterns (7-day cycle)
  if (granularity === 'daily' || granularity === 'hourly') {
    const weeklyCorrelation = checkPeriodicCorrelation(points, 7);
    if (weeklyCorrelation > 0.6) return 'weekly';
  }
  
  // For weekly/monthly granularity, check monthly patterns (4-week cycle)
  if (granularity === 'weekly') {
    const monthlyCorrelation = checkPeriodicCorrelation(points, 4);
    if (monthlyCorrelation > 0.6) return 'monthly';
  }
  
  // For monthly granularity, check yearly patterns (12-month cycle)
  if (granularity === 'monthly' && points.length >= 24) {
    const yearlyCorrelation = checkPeriodicCorrelation(points, 12);
    if (yearlyCorrelation > 0.6) return 'yearly';
  }
  
  return 'none';
}

/**
 * Check correlation for periodic patterns
 */
function checkPeriodicCorrelation(points: TimeSeriesPoint[], period: number): number {
  if (points.length < period * 2) return 0;
  
  const values = points.map(p => p.value);
  const firstCycle = values.slice(0, period);
  const secondCycle = values.slice(period, period * 2);
  
  return Math.abs(calculateCorrelation(firstCycle, secondCycle));
}

/**
 * Aggregate time-series data by time period
 */
export function aggregateTimeSeries(
  points: TimeSeriesPoint[],
  aggregation: 'hourly' | 'daily' | 'weekly' | 'monthly'
): TimeSeriesPoint[] {
  if (points.length === 0) return [];
  
  const buckets = new Map<string, number[]>();
  
  points.forEach(point => {
    const date = point.date;
    let key: string;
    
    switch (aggregation) {
      case 'hourly':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      case 'daily':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
      case 'weekly':
        const weekNum = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
        key = `week-${weekNum}`;
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${date.getMonth()}`;
        break;
    }
    
    if (!buckets.has(key)) {
      buckets.set(key, []);
    }
    buckets.get(key)!.push(point.value);
  });
  
  // Aggregate each bucket (using mean)
  const aggregated: TimeSeriesPoint[] = [];
  
  buckets.forEach((values, key) => {
    const avgValue = mean(values);
    // Reconstruct approximate date from key
    const firstPoint = points.find(p => {
      const date = p.date;
      let checkKey: string;
      switch (aggregation) {
        case 'hourly':
          checkKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
          break;
        case 'daily':
          checkKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          break;
        case 'weekly':
          const weekNum = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
          checkKey = `week-${weekNum}`;
          break;
        case 'monthly':
          checkKey = `${date.getFullYear()}-${date.getMonth()}`;
          break;
      }
      return checkKey === key;
    });
    
    if (firstPoint) {
      aggregated.push({
        timestamp: firstPoint.timestamp,
        value: avgValue,
        date: firstPoint.date
      });
    }
  });
  
  return aggregated.sort((a, b) => a.timestamp - b.timestamp);
}
