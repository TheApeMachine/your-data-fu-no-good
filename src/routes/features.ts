import { createHash } from 'crypto';
import { Hono } from 'hono';
import type { Bindings, ColumnDefinition } from '../types';
import { resolveDatabase } from '../storage';

interface ApplyFeatureRequest {
  transformation: string;
  columns: string[];
}

function isMissingValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return true;
    return trimmed === 'null' || trimmed === 'undefined' || trimmed === 'n/a' || trimmed === 'na';
  }
  return false;
}

const BATCH_SIZE = 50;

interface ParsedDataRow {
  id: number;
  data: Record<string, unknown>;
}

interface ColumnAccumulator {
  samples: any[];
  uniqueValues: Set<string>;
  nullCount: number;
}

interface TransformationResult {
  success: true;
  message: string;
  dataset_id: number;
  new_columns: string[];
  new_column?: string;
  rows_updated: number;
  details?: Record<string, unknown>;
}

function safeParseJson(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
    } catch (error) {
      return null;
    }
  }
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === 'bigint') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
}

function parseDateValue(value: unknown): Date | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value as any);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
}

function sanitizeValueForColumnName(value: string): string {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return sanitized || 'value';
}

function makeUniqueColumnName(baseName: string, existingNames: Set<string>): string {
  let candidate = baseName;
  let suffix = 2;
  while (existingNames.has(candidate)) {
    candidate = `${baseName}_${suffix}`;
    suffix += 1;
  }
  existingNames.add(candidate);
  return candidate;
}

async function fetchDatasetMeta(db: Awaited<ReturnType<typeof resolveDatabase>>, datasetId: number) {
  const dataset = await db
    .prepare(`SELECT columns, column_count, row_count FROM datasets WHERE id = ?`)
    .bind(datasetId)
    .first();

  if (!dataset) {
    throw new Error('Dataset not found');
  }

  let columns: ColumnDefinition[] = [];
  try {
    columns = JSON.parse(dataset.columns as string);
  } catch (error) {
    throw new Error('Failed to parse dataset column metadata');
  }

  const columnCount = Number(dataset.column_count ?? columns.length) || columns.length;
  const rowCount = Number(dataset.row_count ?? 0) || 0;

  return { columns, columnCount, rowCount };
}

async function fetchDatasetRows(db: Awaited<ReturnType<typeof resolveDatabase>>, datasetId: number): Promise<ParsedDataRow[]> {
  const rowsResult = await db
    .prepare(`SELECT id, data FROM data_rows WHERE dataset_id = ?`)
    .bind(datasetId)
    .all();

  const parsedRows: ParsedDataRow[] = [];
  for (const row of rowsResult.results as Array<{ id: number | string; data: string }>) {
    const parsed = safeParseJson(row.data);
    if (!parsed) continue;
    const id = typeof row.id === 'number' ? row.id : Number(row.id);
    parsedRows.push({ id, data: { ...parsed } });
  }

  if (parsedRows.length === 0) {
    throw new Error('Dataset contains no rows to transform');
  }

  return parsedRows;
}

async function persistRows(
  db: Awaited<ReturnType<typeof resolveDatabase>>,
  rows: ParsedDataRow[]
) {
  const statements: any[] = [];
  for (const row of rows) {
    statements.push(
      db
        .prepare(`UPDATE data_rows SET data = ? WHERE id = ?`)
        .bind(JSON.stringify(row.data), row.id)
    );
    if (statements.length >= BATCH_SIZE) {
      await db.batch(statements.splice(0));
    }
  }
  if (statements.length > 0) {
    await db.batch(statements);
  }
}

async function saveColumnDefinitions(
  db: Awaited<ReturnType<typeof resolveDatabase>>,
  datasetId: number,
  columns: ColumnDefinition[]
) {
  await db
    .prepare(`UPDATE datasets SET columns = ?, column_count = ? WHERE id = ?`)
    .bind(JSON.stringify(columns), columns.length, datasetId)
    .run();
}

function getAccumulator(
  map: Map<string, ColumnAccumulator>,
  columnName: string
): ColumnAccumulator {
  let accumulator = map.get(columnName);
  if (!accumulator) {
    accumulator = { samples: [], uniqueValues: new Set<string>(), nullCount: 0 };
    map.set(columnName, accumulator);
  }
  return accumulator;
}

function recordColumnValue(
  map: Map<string, ColumnAccumulator>,
  columnName: string,
  value: unknown
) {
  const accumulator = getAccumulator(map, columnName);
  if (value === null || value === undefined) {
    accumulator.nullCount += 1;
    return;
  }
  const key = typeof value === 'string' ? value : JSON.stringify(value);
  accumulator.uniqueValues.add(key);
  if (accumulator.samples.length < 5) {
    accumulator.samples.push(value);
  }
}

function buildColumnDefinition(
  name: string,
  type: ColumnDefinition['type'],
  totalRows: number,
  accumulator: ColumnAccumulator | undefined,
  options: { semanticType?: string; sampleValues?: any[]; nullable?: boolean } = {}
): ColumnDefinition {
  const samples = options.sampleValues ?? accumulator?.samples ?? [];
  const sampleValues = samples.length > 0 ? samples : undefined;
  const nullCount = accumulator?.nullCount ?? 0;
  const uniqueCount = accumulator
    ? accumulator.uniqueValues.size
    : sampleValues
    ? new Set(sampleValues.map((value) => JSON.stringify(value))).size
    : 0;
  const nullable = options.nullable !== undefined ? options.nullable : nullCount > 0;

  return {
    name,
    type,
    nullable,
    unique_count: uniqueCount,
    sample_values: sampleValues,
    semantic_type: options.semanticType,
    profile: {
      base_type: type,
      confidence: 0.45,
      unique_count: uniqueCount,
      unique_ratio: totalRows > 0 ? uniqueCount / totalRows : 0,
      null_count: nullCount,
      non_null_count: totalRows - nullCount,
      total_count: totalRows,
      sample_values: sampleValues,
    },
  };
}

function requireColumn(columns: ColumnDefinition[], columnName: string): ColumnDefinition {
  const column = columns.find((col) => col.name === columnName);
  if (!column) {
    throw new Error(`Column "${columnName}" not found in dataset`);
  }
  return column;
}

async function applyMissingIndicator(
  datasetId: number,
  column: string,
  db: Awaited<ReturnType<typeof resolveDatabase>>
): Promise<TransformationResult> {
  const { columns } = await fetchDatasetMeta(db, datasetId);
  requireColumn(columns, column);
  const existingNames = new Set(columns.map((col) => col.name));
  const newColumnName = makeUniqueColumnName(`${column}_missing`, existingNames);

  const rows = await fetchDatasetRows(db, datasetId);
  const totalRows = rows.length;

  const statsMap = new Map<string, ColumnAccumulator>();
  let missingCount = 0;

  for (const row of rows) {
    const rawValue = row.data[column];
    const isMissing = isMissingValue(rawValue);
    if (isMissing) {
      missingCount += 1;
    }
    row.data[newColumnName] = isMissing;
    recordColumnValue(statsMap, newColumnName, isMissing);
  }

  await persistRows(db, rows);

  const newColumn = buildColumnDefinition(newColumnName, 'boolean', totalRows, statsMap.get(newColumnName), {
    semanticType: 'missing_indicator',
    nullable: false,
  });
  newColumn.unique_count = 2;
  newColumn.sample_values = [true, false];
  if (newColumn.profile) {
    newColumn.profile.unique_count = 2;
    newColumn.profile.sample_values = [true, false];
    newColumn.profile.null_count = 0;
    newColumn.profile.non_null_count = totalRows;
  }

  const updatedColumns = [...columns, newColumn];
  await saveColumnDefinitions(db, datasetId, updatedColumns);

  return {
    success: true,
    message: `Added missing flag "${newColumnName}" (${missingCount} rows marked missing)`,
    dataset_id: datasetId,
    new_columns: [newColumnName],
    new_column: newColumnName,
    rows_updated: totalRows,
    details: { missing_rows: missingCount, total_rows: totalRows },
  };
}

async function applyLogHelper(
  datasetId: number,
  column: string,
  db: Awaited<ReturnType<typeof resolveDatabase>>
): Promise<TransformationResult> {
  const { columns } = await fetchDatasetMeta(db, datasetId);
  requireColumn(columns, column);
  const existingNames = new Set(columns.map((col) => col.name));
  const newColumnName = makeUniqueColumnName(`${column}_log`, existingNames);

  const rows = await fetchDatasetRows(db, datasetId);
  const totalRows = rows.length;

  const statsMap = new Map<string, ColumnAccumulator>();
  let nonNull = 0;

  for (const row of rows) {
    const numericValue = toNumber(row.data[column]);
    let transformed: number | null = null;
    if (numericValue !== null && numericValue > -1) {
      const result = Math.log1p(numericValue);
      if (Number.isFinite(result)) {
        transformed = result;
        nonNull += 1;
      }
    }
    row.data[newColumnName] = transformed;
    recordColumnValue(statsMap, newColumnName, transformed);
  }

  if (nonNull === 0) {
    throw new Error('No valid numeric values available to create a log helper');
  }

  await persistRows(db, rows);

  const newColumn = buildColumnDefinition(newColumnName, 'number', totalRows, statsMap.get(newColumnName), {
    semanticType: 'log_helper',
  });

  const updatedColumns = [...columns, newColumn];
  await saveColumnDefinitions(db, datasetId, updatedColumns);

  return {
    success: true,
    message: `Added log-scale helper "${newColumnName}"`,
    dataset_id: datasetId,
    new_columns: [newColumnName],
    new_column: newColumnName,
    rows_updated: totalRows,
    details: { rows_with_values: nonNull, total_rows: totalRows },
  };
}

async function applyStandardizeHelper(
  datasetId: number,
  column: string,
  db: Awaited<ReturnType<typeof resolveDatabase>>
): Promise<TransformationResult> {
  const { columns } = await fetchDatasetMeta(db, datasetId);
  requireColumn(columns, column);
  const existingNames = new Set(columns.map((col) => col.name));
  const newColumnName = makeUniqueColumnName(`${column}_zscore`, existingNames);

  const rows = await fetchDatasetRows(db, datasetId);
  const totalRows = rows.length;

  const numericValues: number[] = [];
  for (const row of rows) {
    const numericValue = toNumber(row.data[column]);
    if (numericValue !== null) {
      numericValues.push(numericValue);
    }
  }

  if (numericValues.length < 2) {
    throw new Error('Not enough numeric values available to create a z-score helper');
  }

  const mean = numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
  const variance = numericValues.reduce((sum, value) => sum + (value - mean) ** 2, 0) / numericValues.length;
  const stdDev = Math.sqrt(variance);

  if (!Number.isFinite(stdDev) || stdDev === 0) {
    throw new Error('Standard deviation is zero; cannot create a z-score helper');
  }

  const statsMap = new Map<string, ColumnAccumulator>();

  for (const row of rows) {
    const numericValue = toNumber(row.data[column]);
    const zScore = numericValue !== null ? (numericValue - mean) / stdDev : null;
    row.data[newColumnName] = Number.isFinite(zScore as number) ? zScore : null;
    recordColumnValue(statsMap, newColumnName, row.data[newColumnName]);
  }

  await persistRows(db, rows);

  const newColumn = buildColumnDefinition(newColumnName, 'number', totalRows, statsMap.get(newColumnName), {
    semanticType: 'standardized_metric',
  });

  const updatedColumns = [...columns, newColumn];
  await saveColumnDefinitions(db, datasetId, updatedColumns);

  return {
    success: true,
    message: `Added z-score helper "${newColumnName}"`,
    dataset_id: datasetId,
    new_columns: [newColumnName],
    new_column: newColumnName,
    rows_updated: totalRows,
    details: { mean, std_dev: stdDev, total_rows: totalRows },
  };
}

async function applyOneHotEncoding(
  datasetId: number,
  column: string,
  db: Awaited<ReturnType<typeof resolveDatabase>>
): Promise<TransformationResult> {
  const { columns } = await fetchDatasetMeta(db, datasetId);
  requireColumn(columns, column);
  const existingNames = new Set(columns.map((col) => col.name));

  const rows = await fetchDatasetRows(db, datasetId);
  const totalRows = rows.length;

  const valueCounts = new Map<string, number>();

  for (const row of rows) {
    const rawValue = row.data[column];
    if (rawValue === null || rawValue === undefined) continue;
    const key = String(rawValue);
    valueCounts.set(key, (valueCounts.get(key) ?? 0) + 1);
  }

  if (valueCounts.size === 0) {
    throw new Error('No categorical values available to create one-hot helpers');
  }

  if (valueCounts.size > 25) {
    throw new Error(`One-hot encoding limited to 25 categories (found ${valueCounts.size})`);
  }

  const categoryColumns = Array.from(valueCounts.keys()).map((value) => {
    const sanitized = sanitizeValueForColumnName(value).slice(0, 40);
    const baseName = `${column}_${sanitized}`;
    const columnName = makeUniqueColumnName(baseName, existingNames);
    return { value, columnName };
  });

  const statsMap = new Map<string, ColumnAccumulator>();

  for (const row of rows) {
    const key = row.data[column] === null || row.data[column] === undefined ? null : String(row.data[column]);
    for (const category of categoryColumns) {
      const match = key !== null && key === category.value;
      row.data[category.columnName] = match;
      recordColumnValue(statsMap, category.columnName, match);
    }
  }

  await persistRows(db, rows);

  const newColumns: ColumnDefinition[] = categoryColumns.map((category) => {
    const definition = buildColumnDefinition(category.columnName, 'boolean', totalRows, statsMap.get(category.columnName), {
      semanticType: 'one_hot_flag',
      nullable: false,
    });
    definition.unique_count = 2;
    definition.sample_values = [true, false];
    if (definition.profile) {
      definition.profile.unique_count = 2;
      definition.profile.sample_values = [true, false];
      definition.profile.null_count = 0;
      definition.profile.non_null_count = totalRows;
    }
    return definition;
  });

  const updatedColumns = [...columns, ...newColumns];
  await saveColumnDefinitions(db, datasetId, updatedColumns);

  const newColumnNames = newColumns.map((col) => col.name);

  return {
    success: true,
    message: `Added ${describeHelperColumns(newColumnNames)} for ${column}`,
    dataset_id: datasetId,
    new_columns: newColumnNames,
    new_column: newColumnNames[0],
    rows_updated: totalRows,
    details: { categories: valueCounts.size, total_rows: totalRows },
  };
}

function describeHelperColumns(columnNames: string[]): string {
  if (columnNames.length === 1) return `helper column "${columnNames[0]}"`;
  if (columnNames.length === 2) return `helper columns "${columnNames[0]}" and "${columnNames[1]}"`;
  if (columnNames.length === 3) return `helper columns "${columnNames[0]}", "${columnNames[1]}" and "${columnNames[2]}"`;
  return `${columnNames.length} helper columns`;
}

async function applyDatetimeComponents(
  datasetId: number,
  column: string,
  db: Awaited<ReturnType<typeof resolveDatabase>>
): Promise<TransformationResult> {
  const { columns } = await fetchDatasetMeta(db, datasetId);
  requireColumn(columns, column);
  const existingNames = new Set(columns.map((col) => col.name));

  const rows = await fetchDatasetRows(db, datasetId);
  const totalRows = rows.length;

  const componentDefs = [
    { key: 'year', getter: (date: Date) => date.getFullYear(), semantic: 'date_year' },
    { key: 'quarter', getter: (date: Date) => Math.floor(date.getMonth() / 3) + 1, semantic: 'date_quarter' },
    { key: 'month', getter: (date: Date) => date.getMonth() + 1, semantic: 'date_month' },
    { key: 'day', getter: (date: Date) => date.getDate(), semantic: 'date_day' },
    { key: 'weekday', getter: (date: Date) => date.getDay(), semantic: 'date_weekday' },
  ];

  const columnMappings = componentDefs.map((component) => ({
    component,
    columnName: makeUniqueColumnName(`${column}_${component.key}`, existingNames),
  }));

  const statsMap = new Map<string, ColumnAccumulator>();
  let validDates = 0;

  for (const row of rows) {
    const date = parseDateValue(row.data[column]);
    if (date) {
      validDates += 1;
    }
    for (const mapping of columnMappings) {
      const value = date ? mapping.component.getter(date) : null;
      row.data[mapping.columnName] = value;
      recordColumnValue(statsMap, mapping.columnName, value);
    }
  }

  if (validDates === 0) {
    throw new Error('No valid date or datetime values to create calendar helpers');
  }

  await persistRows(db, rows);

  const newColumns = columnMappings.map((mapping) =>
    buildColumnDefinition(mapping.columnName, 'number', totalRows, statsMap.get(mapping.columnName), {
      semanticType: mapping.component.semantic,
    })
  );

  const updatedColumns = [...columns, ...newColumns];
  await saveColumnDefinitions(db, datasetId, updatedColumns);

  const newColumnNames = newColumns.map((col) => col.name);

  return {
    success: true,
    message: `Added calendar helpers for "${column}"`,
    dataset_id: datasetId,
    new_columns: newColumnNames,
    new_column: newColumnNames[0],
    rows_updated: totalRows,
    details: { valid_dates: validDates, total_rows: totalRows },
  };
}

function extractEmailDomain(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.includes('@')) return null;
  const parts = trimmed.split('@');
  const domainPart = parts[parts.length - 1].split(/[\s<>]/)[0].toLowerCase();
  return domainPart || null;
}

async function applyExtractDomain(
  datasetId: number,
  column: string,
  db: Awaited<ReturnType<typeof resolveDatabase>>
): Promise<TransformationResult> {
  const { columns } = await fetchDatasetMeta(db, datasetId);
  requireColumn(columns, column);
  const existingNames = new Set(columns.map((col) => col.name));
  const newColumnName = makeUniqueColumnName(`${column}_domain`, existingNames);

  const rows = await fetchDatasetRows(db, datasetId);
  const totalRows = rows.length;

  const statsMap = new Map<string, ColumnAccumulator>();
  let extracted = 0;

  for (const row of rows) {
    const value = typeof row.data[column] === 'string' ? (row.data[column] as string) : null;
    const domain = value ? extractEmailDomain(value) : null;
    if (domain) {
      extracted += 1;
    }
    row.data[newColumnName] = domain;
    recordColumnValue(statsMap, newColumnName, domain);
  }

  if (extracted === 0) {
    throw new Error('No email domains detected to extract');
  }

  await persistRows(db, rows);

  const newColumn = buildColumnDefinition(newColumnName, 'string', totalRows, statsMap.get(newColumnName), {
    semanticType: 'email_domain',
  });

  const updatedColumns = [...columns, newColumn];
  await saveColumnDefinitions(db, datasetId, updatedColumns);

  return {
    success: true,
    message: `Added email domain helper "${newColumnName}"`,
    dataset_id: datasetId,
    new_columns: [newColumnName],
    new_column: newColumnName,
    rows_updated: totalRows,
    details: { domains_extracted: extracted, total_rows: totalRows },
  };
}

function extractHost(value: string): string | null {
  let candidate = value.trim();
  if (!candidate) return null;
  if (!/^[a-z]+:\/\//i.test(candidate)) {
    candidate = `http://${candidate}`;
  }
  try {
    const url = new URL(candidate);
    return url.hostname.toLowerCase() || null;
  } catch (error) {
    return null;
  }
}

async function applyExtractHost(
  datasetId: number,
  column: string,
  db: Awaited<ReturnType<typeof resolveDatabase>>
): Promise<TransformationResult> {
  const { columns } = await fetchDatasetMeta(db, datasetId);
  requireColumn(columns, column);
  const existingNames = new Set(columns.map((col) => col.name));
  const newColumnName = makeUniqueColumnName(`${column}_host`, existingNames);

  const rows = await fetchDatasetRows(db, datasetId);
  const totalRows = rows.length;

  const statsMap = new Map<string, ColumnAccumulator>();
  let extracted = 0;

  for (const row of rows) {
    const value = typeof row.data[column] === 'string' ? (row.data[column] as string) : null;
    const host = value ? extractHost(value) : null;
    if (host) {
      extracted += 1;
    }
    row.data[newColumnName] = host;
    recordColumnValue(statsMap, newColumnName, host);
  }

  if (extracted === 0) {
    throw new Error('No valid hosts detected to extract');
  }

  await persistRows(db, rows);

  const newColumn = buildColumnDefinition(newColumnName, 'string', totalRows, statsMap.get(newColumnName), {
    semanticType: 'url_host',
  });

  const updatedColumns = [...columns, newColumn];
  await saveColumnDefinitions(db, datasetId, updatedColumns);

  return {
    success: true,
    message: `Added URL host helper "${newColumnName}"`,
    dataset_id: datasetId,
    new_columns: [newColumnName],
    new_column: newColumnName,
    rows_updated: totalRows,
    details: { hosts_extracted: extracted, total_rows: totalRows },
  };
}

async function applyIdentifierEncoding(
  datasetId: number,
  column: string,
  db: Awaited<ReturnType<typeof resolveDatabase>>
): Promise<TransformationResult> {
  const { columns } = await fetchDatasetMeta(db, datasetId);
  requireColumn(columns, column);
  const existingNames = new Set(columns.map((col) => col.name));
  const lengthColumn = makeUniqueColumnName(`${column}_length`, existingNames);
  const hashColumn = makeUniqueColumnName(`${column}_hash8`, existingNames);

  const rows = await fetchDatasetRows(db, datasetId);
  const totalRows = rows.length;

  const statsMap = new Map<string, ColumnAccumulator>();
  let encoded = 0;

  for (const row of rows) {
    const value = row.data[column];
    if (value === null || value === undefined) {
      row.data[lengthColumn] = null;
      row.data[hashColumn] = null;
      recordColumnValue(statsMap, lengthColumn, null);
      recordColumnValue(statsMap, hashColumn, null);
      continue;
    }

    const text = String(value);
    row.data[lengthColumn] = text.length;
    const hash = createHash('sha256').update(text).digest('hex').slice(0, 8);
    row.data[hashColumn] = text.length > 0 ? hash : null;
    recordColumnValue(statsMap, lengthColumn, row.data[lengthColumn]);
    recordColumnValue(statsMap, hashColumn, row.data[hashColumn]);
    if (text.length > 0) {
      encoded += 1;
    }
  }

  if (encoded === 0) {
    throw new Error('No identifier values available to encode');
  }

  await persistRows(db, rows);

  const lengthDefinition = buildColumnDefinition(lengthColumn, 'number', totalRows, statsMap.get(lengthColumn), {
    semanticType: 'identifier_length',
  });
  const hashDefinition = buildColumnDefinition(hashColumn, 'string', totalRows, statsMap.get(hashColumn), {
    semanticType: 'identifier_hash',
  });

  const updatedColumns = [...columns, lengthDefinition, hashDefinition];
  await saveColumnDefinitions(db, datasetId, updatedColumns);

  return {
    success: true,
    message: `Added identifier helpers "${lengthColumn}" and "${hashColumn}"`,
    dataset_id: datasetId,
    new_columns: [lengthColumn, hashColumn],
    new_column: lengthColumn,
    rows_updated: totalRows,
    details: { encoded_rows: encoded, total_rows: totalRows },
  };
}

const features = new Hono<{ Bindings: Bindings }>();

features.post('/:id/apply', async (c) => {
  try {
    const datasetId = Number(c.req.param('id'));
    if (!Number.isFinite(datasetId)) {
      return c.json({ error: 'Invalid dataset id' }, 400);
    }

    let payload: ApplyFeatureRequest;
    try {
      payload = await c.req.json();
    } catch (error) {
      return c.json({ error: 'Invalid request payload' }, 400);
    }

    const { transformation, columns } = payload;
    if (!transformation) {
      return c.json({ error: 'Transformation is required' }, 400);
    }

    if (!Array.isArray(columns) || columns.length === 0) {
      return c.json({ error: 'At least one column is required' }, 400);
    }

    const targetColumn = columns[0];
    const db = resolveDatabase(c.env);

    switch (transformation) {
      case 'missing_indicator':
        return c.json(await applyMissingIndicator(datasetId, targetColumn, db));
      case 'log1p':
        return c.json(await applyLogHelper(datasetId, targetColumn, db));
      case 'standardize':
        return c.json(await applyStandardizeHelper(datasetId, targetColumn, db));
      case 'one_hot_encoding':
        return c.json(await applyOneHotEncoding(datasetId, targetColumn, db));
      case 'datetime_components':
        return c.json(await applyDatetimeComponents(datasetId, targetColumn, db));
      case 'extract_domain':
        return c.json(await applyExtractDomain(datasetId, targetColumn, db));
      case 'extract_host':
        return c.json(await applyExtractHost(datasetId, targetColumn, db));
      case 'identifier_encoding':
        return c.json(await applyIdentifierEncoding(datasetId, targetColumn, db));
      default:
        return c.json({ error: `Transformation "${transformation}" is not supported yet` }, 400);
    }
  } catch (error: any) {
    console.error('Feature generation failed:', error);
    return c.json({ error: error.message || 'Failed to generate feature' }, 500);
  }
});

export default features;
