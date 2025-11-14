// Unstructured Data Processing
// Named Entity Recognition, Log Parsing, and Pattern Extraction

export interface NamedEntity {
  text: string;
  type: 'PERSON' | 'ORG' | 'LOCATION' | 'DATE' | 'TIME' | 'MONEY' | 'PERCENT' | 'EMAIL' | 'URL' | 'PHONE';
  confidence: number;
  position: { start: number; end: number };
}

export interface LogEntry {
  timestamp?: string;
  level?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  message: string;
  source?: string;
  metadata?: Record<string, string>;
  raw: string;
}

export interface PatternExtraction {
  pattern: string;
  regex: RegExp;
  matches: string[];
  frequency: number;
  examples: string[];
}

export interface UnstructuredAnalysis {
  entities: NamedEntity[];
  logEntries?: LogEntry[];
  patterns: PatternExtraction[];
  structuredFeatures: Record<string, any>;
  isLogData: boolean;
  entityCounts: Record<string, number>;
}

/**
 * Extract named entities using regex-based patterns
 * (Note: For production, integrate with NLP library like compromise.js or spaCy via API)
 */
export function extractNamedEntities(text: string): NamedEntity[] {
  const entities: NamedEntity[] = [];

  // Email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  let match;
  while ((match = emailRegex.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'EMAIL',
      confidence: 0.95,
      position: { start: match.index, end: emailRegex.lastIndex }
    });
  }

  // URL pattern
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  while ((match = urlRegex.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'URL',
      confidence: 0.95,
      position: { start: match.index, end: urlRegex.lastIndex }
    });
  }

  // Phone number pattern (US format)
  const phoneRegex = /\b(\+?1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'PHONE',
      confidence: 0.85,
      position: { start: match.index, end: phoneRegex.lastIndex }
    });
  }

  // Money pattern
  const moneyRegex = /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s?(?:USD|EUR|GBP|dollars?|euros?|pounds?)/gi;
  while ((match = moneyRegex.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'MONEY',
      confidence: 0.90,
      position: { start: match.index, end: moneyRegex.lastIndex }
    });
  }

  // Percentage pattern
  const percentRegex = /\b\d+(?:\.\d+)?%/g;
  while ((match = percentRegex.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'PERCENT',
      confidence: 0.95,
      position: { start: match.index, end: percentRegex.lastIndex }
    });
  }

  // Date patterns (various formats)
  const dateRegex = /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/gi;
  while ((match = dateRegex.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'DATE',
      confidence: 0.85,
      position: { start: match.index, end: dateRegex.lastIndex }
    });
  }

  // Time pattern
  const timeRegex = /\b\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?\b/g;
  while ((match = timeRegex.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'TIME',
      confidence: 0.90,
      position: { start: match.index, end: timeRegex.lastIndex }
    });
  }

  // Organization pattern (simple heuristic: capitalized words ending with Inc, LLC, Corp, Ltd)
  const orgRegex = /\b(?:[A-Z][a-z]+\s+){0,3}(?:Inc|LLC|Corp|Corporation|Ltd|Limited|Co|Company)\b\.?/g;
  while ((match = orgRegex.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'ORG',
      confidence: 0.70,
      position: { start: match.index, end: orgRegex.lastIndex }
    });
  }

  // Person name pattern (simple heuristic: capitalized first and last name)
  // This is very basic and will have false positives
  const personRegex = /\b(?:Mr|Mrs|Ms|Dr|Prof)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  while ((match = personRegex.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'PERSON',
      confidence: 0.60,
      position: { start: match.index, end: personRegex.lastIndex }
    });
  }

  // Location pattern (cities, states - limited)
  const locationRegex = /\b(?:New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose|Austin|Jacksonville|Fort Worth|Columbus|Indianapolis|Charlotte|San Francisco|Seattle|Denver|Washington|Boston|London|Paris|Tokyo|Beijing|Mumbai|Sydney|Toronto|Berlin|Moscow|Rome|Madrid)\b/g;
  while ((match = locationRegex.exec(text)) !== null) {
    entities.push({
      text: match[0],
      type: 'LOCATION',
      confidence: 0.80,
      position: { start: match.index, end: locationRegex.lastIndex }
    });
  }

  return entities;
}

/**
 * Detect if text appears to be log data
 */
export function isLogFormat(text: string): boolean {
  // Common log patterns
  const logPatterns = [
    /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/, // ISO timestamp
    /\[(DEBUG|INFO|WARN|ERROR|FATAL)\]/, // Log level in brackets
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO 8601
    /^\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}/, // Syslog format
    /\d+\.\d+\.\d+\.\d+/, // IP address
  ];

  return logPatterns.some(pattern => pattern.test(text));
}

/**
 * Parse log entries from text
 */
export function parseLogEntry(text: string): LogEntry | null {
  const entry: LogEntry = { message: text, raw: text };

  // Try various timestamp formats
  const isoTimestamp = text.match(/^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/);
  if (isoTimestamp) {
    entry.timestamp = isoTimestamp[1];
    text = text.substring(isoTimestamp[0].length).trim();
  } else {
    const syslogTimestamp = text.match(/^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/);
    if (syslogTimestamp) {
      entry.timestamp = syslogTimestamp[1];
      text = text.substring(syslogTimestamp[0].length).trim();
    }
  }

  // Extract log level
  const levelMatch = text.match(/\[(DEBUG|INFO|WARN|ERROR|FATAL)\]|^(DEBUG|INFO|WARN|ERROR|FATAL):/i);
  if (levelMatch) {
    entry.level = (levelMatch[1] || levelMatch[2]).toUpperCase() as LogEntry['level'];
    text = text.replace(levelMatch[0], '').trim();
  }

  // Extract source/logger name
  const sourceMatch = text.match(/\[([^\]]+)\]|^([a-zA-Z0-9._-]+):/);
  if (sourceMatch && !levelMatch) { // Only if we didn't already match level
    entry.source = sourceMatch[1] || sourceMatch[2];
    text = text.replace(sourceMatch[0], '').trim();
  }

  // Extract key-value pairs
  const metadata: Record<string, string> = {};
  const kvRegex = /(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let kvMatch;
  while ((kvMatch = kvRegex.exec(text)) !== null) {
    const key = kvMatch[1];
    const value = kvMatch[2] || kvMatch[3] || kvMatch[4];
    metadata[key] = value;
  }

  if (Object.keys(metadata).length > 0) {
    entry.metadata = metadata;
    // Remove k=v pairs from message
    text = text.replace(kvRegex, '').trim();
  }

  entry.message = text || entry.message;

  return entry.timestamp || entry.level ? entry : null;
}

/**
 * Extract common patterns from text
 */
export function extractPatterns(texts: string[]): PatternExtraction[] {
  const patterns: PatternExtraction[] = [];

  // IP addresses
  const ipPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  const ipMatches = new Set<string>();
  texts.forEach(text => {
    const matches = text.match(ipPattern);
    if (matches) {
      matches.forEach(m => ipMatches.add(m));
    }
  });
  if (ipMatches.size > 0) {
    patterns.push({
      pattern: 'IP Address',
      regex: ipPattern,
      matches: Array.from(ipMatches),
      frequency: ipMatches.size,
      examples: Array.from(ipMatches).slice(0, 5)
    });
  }

  // UUIDs
  const uuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
  const uuidMatches = new Set<string>();
  texts.forEach(text => {
    const matches = text.match(uuidPattern);
    if (matches) {
      matches.forEach(m => uuidMatches.add(m));
    }
  });
  if (uuidMatches.size > 0) {
    patterns.push({
      pattern: 'UUID',
      regex: uuidPattern,
      matches: Array.from(uuidMatches),
      frequency: uuidMatches.size,
      examples: Array.from(uuidMatches).slice(0, 5)
    });
  }

  // File paths
  const filePathPattern = /(?:\/[a-zA-Z0-9_.-]+)+|(?:[A-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*)/g;
  const filePathMatches = new Set<string>();
  texts.forEach(text => {
    const matches = text.match(filePathPattern);
    if (matches) {
      matches.forEach(m => {
        if (m.length > 5) { // Filter out very short matches
          filePathMatches.add(m);
        }
      });
    }
  });
  if (filePathMatches.size > 0) {
    patterns.push({
      pattern: 'File Path',
      regex: filePathPattern,
      matches: Array.from(filePathMatches),
      frequency: filePathMatches.size,
      examples: Array.from(filePathMatches).slice(0, 5)
    });
  }

  // HTTP status codes
  const httpStatusPattern = /\b(?:HTTP|status|code)[:\s]+([1-5]\d{2})\b/gi;
  const httpMatches = new Set<string>();
  texts.forEach(text => {
    const matches = text.match(httpStatusPattern);
    if (matches) {
      matches.forEach(m => httpMatches.add(m));
    }
  });
  if (httpMatches.size > 0) {
    patterns.push({
      pattern: 'HTTP Status Code',
      regex: httpStatusPattern,
      matches: Array.from(httpMatches),
      frequency: httpMatches.size,
      examples: Array.from(httpMatches).slice(0, 5)
    });
  }

  return patterns;
}

/**
 * Analyze unstructured text column
 */
export function analyzeUnstructuredData(
  texts: string[],
  sampleSize = 100
): UnstructuredAnalysis {
  // Sample texts for efficiency
  const sample = texts.slice(0, sampleSize);

  // Extract entities from sample
  const allEntities: NamedEntity[] = [];
  const entityCounts: Record<string, number> = {};

  sample.forEach(text => {
    const entities = extractNamedEntities(text);
    allEntities.push(...entities);

    entities.forEach(entity => {
      entityCounts[entity.type] = (entityCounts[entity.type] || 0) + 1;
    });
  });

  // Check if data appears to be logs
  const logLikeCount = sample.filter(text => isLogFormat(text)).length;
  const isLogData = logLikeCount > sample.length * 0.5; // >50% look like logs

  // Parse logs if detected
  let logEntries: LogEntry[] | undefined;
  if (isLogData) {
    logEntries = sample
      .map(text => parseLogEntry(text))
      .filter((entry): entry is LogEntry => entry !== null);
  }

  // Extract patterns
  const patterns = extractPatterns(sample);

  // Generate structured features
  const structuredFeatures: Record<string, any> = {
    has_emails: entityCounts['EMAIL'] > 0,
    has_urls: entityCounts['URL'] > 0,
    has_phone_numbers: entityCounts['PHONE'] > 0,
    has_dates: entityCounts['DATE'] > 0,
    has_money_amounts: entityCounts['MONEY'] > 0,
    has_percentages: entityCounts['PERCENT'] > 0,
    is_log_format: isLogData,
    avg_text_length: sample.reduce((sum, text) => sum + text.length, 0) / sample.length,
    contains_ip_addresses: patterns.some(p => p.pattern === 'IP Address'),
    contains_uuids: patterns.some(p => p.pattern === 'UUID'),
    contains_file_paths: patterns.some(p => p.pattern === 'File Path'),
  };

  // If logs, add log-specific features
  if (isLogData && logEntries && logEntries.length > 0) {
    const levelCounts: Record<string, number> = {};
    logEntries.forEach(entry => {
      if (entry.level) {
        levelCounts[entry.level] = (levelCounts[entry.level] || 0) + 1;
      }
    });

    structuredFeatures.log_level_distribution = levelCounts;
    structuredFeatures.has_timestamps = logEntries.filter(e => e.timestamp).length / logEntries.length;
    structuredFeatures.has_sources = logEntries.filter(e => e.source).length / logEntries.length;
    structuredFeatures.avg_metadata_fields = logEntries.reduce((sum, e) =>
      sum + Object.keys(e.metadata || {}).length, 0) / logEntries.length;
  }

  return {
    entities: allEntities,
    logEntries,
    patterns,
    structuredFeatures,
    isLogData,
    entityCounts
  };
}

/**
 * Generate insights from unstructured data analysis
 */
export function generateUnstructuredInsights(analysis: UnstructuredAnalysis): string[] {
  const insights: string[] = [];

  if (analysis.isLogData) {
    insights.push('This column contains log data with structured timestamps and log levels');

    if (analysis.logEntries && analysis.logEntries.length > 0) {
      const errorLogs = analysis.logEntries.filter(e => e.level === 'ERROR' || e.level === 'FATAL').length;
      const errorRate = errorLogs / analysis.logEntries.length;

      if (errorRate > 0.1) {
        insights.push(`High error rate detected: ${(errorRate * 100).toFixed(1)}% of log entries are errors`);
      }
    }
  }

  const { entityCounts } = analysis;

  if (entityCounts['EMAIL'] > 0) {
    insights.push(`Contains ${entityCounts['EMAIL']} email addresses - consider privacy/PII concerns`);
  }

  if (entityCounts['PHONE'] > 0) {
    insights.push(`Contains ${entityCounts['PHONE']} phone numbers - PII data detected`);
  }

  if (entityCounts['MONEY'] > 0) {
    insights.push(`Financial data detected: ${entityCounts['MONEY']} monetary amounts found`);
  }

  if (analysis.patterns.some(p => p.pattern === 'IP Address')) {
    const ipPattern = analysis.patterns.find(p => p.pattern === 'IP Address');
    insights.push(`Contains ${ipPattern?.frequency || 0} IP addresses - may be useful for geolocation analysis`);
  }

  if (analysis.patterns.some(p => p.pattern === 'UUID')) {
    insights.push('UUIDs detected - likely contains system-generated identifiers');
  }

  if (entityCounts['DATE'] > 0) {
    insights.push('Temporal information available for time-series analysis');
  }

  if (Object.keys(entityCounts).length === 0 && analysis.patterns.length === 0) {
    insights.push('Unstructured free text with no clear patterns - consider topic modeling or sentiment analysis');
  }

  return insights;
}
