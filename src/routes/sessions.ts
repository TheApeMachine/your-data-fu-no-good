import { Hono } from 'hono';
import type {
  Bindings,
  SessionSummary,
  SessionStateSnapshot,
  JoinSuggestionRecord,
  ColumnDefinition,
  SessionQuerySpec,
  SessionQueryFilter,
  SessionQueryOrder,
  SessionQueryResult,
} from '../types';
import { resolveDatabase } from '../storage';
import { queueJoinDiscovery } from '../utils/join-discovery';

const sessions = new Hono<{ Bindings: Bindings }>();

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      return fallback;
    }
  }
  return fallback;
}

function parseStringArray(value: unknown): string[] {
  const parsed = parseJson<string[] | unknown>(value, []);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => String(item));
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

async function fetchSessionSummary(db: any, sessionId: number): Promise<SessionSummary | null> {
  const sessionRow = await db
    .prepare(`SELECT id, name, created_at, updated_at FROM workspace_sessions WHERE id = ?`)
    .bind(sessionId)
    .first();

  if (!sessionRow) {
    return null;
  }

  const datasetRows = await db
    .prepare(
      `SELECT sd.session_id, sd.dataset_id, sd.alias, sd.position, sd.attached_at,
              d.name AS dataset_name, d.row_count, d.column_count, d.file_type
       FROM session_datasets sd
       JOIN datasets d ON d.id = sd.dataset_id
       WHERE sd.session_id = ?
       ORDER BY sd.position ASC, sd.dataset_id ASC`
    )
    .bind(sessionId)
    .all();

  const datasets = datasetRows.results.map((row: any) => ({
    session_id: Number(row.session_id),
    dataset_id: Number(row.dataset_id),
    alias: row.alias ?? null,
    position: Number(row.position ?? 0),
    attached_at: row.attached_at,
    dataset: {
      id: Number(row.dataset_id),
      name: row.dataset_name,
      row_count: Number(row.row_count ?? 0),
      column_count: Number(row.column_count ?? 0),
      file_type: row.file_type,
    },
  }));

  const suggestionRows = await db
    .prepare(
      `SELECT id, session_id, left_dataset_id, right_dataset_id, left_columns, right_columns,
              confidence, sample, status, created_at
       FROM join_suggestions
       WHERE session_id = ?
       ORDER BY confidence DESC, id DESC`
    )
    .bind(sessionId)
    .all();

  const joinSuggestions: JoinSuggestionRecord[] = suggestionRows.results.map((row: any) => ({
    id: Number(row.id),
    session_id: Number(row.session_id),
    left_dataset_id: Number(row.left_dataset_id),
    right_dataset_id: Number(row.right_dataset_id),
    left_columns: parseStringArray(row.left_columns),
    right_columns: parseStringArray(row.right_columns),
    confidence: Number(row.confidence ?? 0),
    sample: parseJson(row.sample, undefined),
    status: (row.status ?? 'suggested') as JoinSuggestionRecord['status'],
    created_at: row.created_at,
  }));

  const latestStateRow = await db
    .prepare(
      `SELECT session_id, version, payload, created_at
       FROM session_state_snapshots
       WHERE session_id = ?
       ORDER BY version DESC
       LIMIT 1`
    )
    .bind(sessionId)
    .first();

  const latestState: SessionStateSnapshot | null = latestStateRow
    ? {
        session_id: Number(latestStateRow.session_id ?? sessionId),
        version: Number(latestStateRow.version ?? 0),
        payload: parseJson(latestStateRow.payload, null),
        created_at: latestStateRow.created_at,
      }
    : null;

  const summary: SessionSummary = {
    session: {
      id: Number(sessionRow.id),
      name: sessionRow.name ?? null,
      created_at: sessionRow.created_at,
      updated_at: sessionRow.updated_at,
    },
    datasets,
    join_suggestions: joinSuggestions,
    latest_state: latestState,
  };

  return summary;
}

async function ensureSessionExists(db: any, sessionId: number) {
  const session = await db
    .prepare(`SELECT id FROM workspace_sessions WHERE id = ?`)
    .bind(sessionId)
    .first();
  if (!session) {
    const error: any = new Error('Session not found');
    error.status = 404;
    throw error;
  }
}

async function ensureDatasetAttached(db: any, sessionId: number, datasetId: number) {
  const attached = await db
    .prepare(`SELECT 1 FROM session_datasets WHERE session_id = ? AND dataset_id = ?`)
    .bind(sessionId, datasetId)
    .first();
  if (!attached) {
    const error: any = new Error('Dataset not attached to session');
    error.status = 404;
    throw error;
  }
}

const ALLOWED_OPERATORS = new Set(['=', '!=', '>', '>=', '<', '<=', 'contains', 'in']);

function sanitizeJsonPath(column: string): string {
  const escaped = column.replace(/"/g, '\\"');
  return `$."${escaped}"`;
}

function isNumericType(column: ColumnDefinition | undefined): boolean {
  return column?.type === 'number';
}

function buildTextExtract(column: ColumnDefinition): string {
  const path = sanitizeJsonPath(column.name);
  return `json_extract_text(data, '${path}')`;
}

function buildNumericExtract(column: ColumnDefinition): string {
  const path = sanitizeJsonPath(column.name);
  return `CAST(json_extract(data, '${path}') AS DOUBLE)`;
}

function getColumnMap(columns: ColumnDefinition[]): Record<string, ColumnDefinition> {
  return columns.reduce<Record<string, ColumnDefinition>>((acc, column) => {
    if (column?.name) {
      acc[column.name] = column;
    }
    return acc;
  }, {});
}

function buildFilterClause(
  filter: SessionQueryFilter,
  column: ColumnDefinition,
  params: unknown[],
): string | null {
  if (!ALLOWED_OPERATORS.has(filter.operator)) {
    return null;
  }

  const operator = filter.operator;

  if (operator === 'contains') {
    const textExpr = buildTextExtract(column);
    const value = filter.value == null ? '' : String(filter.value);
    params.push(`%${value.toLowerCase()}%`);
    return `LOWER(${textExpr}) LIKE ?`;
  }

  if (operator === 'in') {
    const values = Array.isArray(filter.value)
      ? filter.value
      : typeof filter.value === 'string'
        ? filter.value.split(',').map((item) => item.trim()).filter(Boolean)
        : [];
    if (!values.length) {
      return null;
    }
    const textExpr = isNumericType(column) ? buildNumericExtract(column) : buildTextExtract(column);
    const placeholders = values.map(() => '?').join(', ');
    if (isNumericType(column)) {
      for (const value of values) {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          return null;
        }
        params.push(numericValue);
      }
    } else {
      values.forEach((value) => params.push(String(value)));
    }
    return `${textExpr} IN (${placeholders})`;
  }

  const comparisonValue = filter.value;
  if (comparisonValue === undefined) {
    return null;
  }

  const numeric = isNumericType(column);
  const expr = numeric ? buildNumericExtract(column) : buildTextExtract(column);

  if (numeric) {
    if (['=', '!=', '>', '>=', '<', '<='].includes(operator)) {
      const numericValue = Number(comparisonValue);
      if (!Number.isFinite(numericValue)) {
        return null;
      }
      params.push(numericValue);
      return `${expr} ${operator} ?`;
    }
    return null;
  }

  if (!['=', '!=', '>', '>=', '<', '<='].includes(operator)) {
    return null;
  }

  const value = String(comparisonValue);
  params.push(value);
  return `${expr} ${operator} ?`;
}

function buildOrderClause(order: SessionQueryOrder, column: ColumnDefinition): string | null {
  const direction = order.direction && order.direction.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const expr = isNumericType(column) ? buildNumericExtract(column) : buildTextExtract(column);
  if (isNumericType(column)) {
    return `${expr} ${direction}`;
  }
  return `${expr} COLLATE NOCASE ${direction}`;
}
sessions.post('/', async (c) => {
  try {
    const db = resolveDatabase(c.env);
    const body = await c.req.json().catch(() => ({}));
    const rawName = typeof body.name === 'string' ? body.name.trim() : '';
    const name = rawName.length > 0 ? rawName : null;

    const sessionRow = await db
      .prepare(`INSERT INTO workspace_sessions (name) VALUES (?) RETURNING id, name, created_at, updated_at`)
      .bind(name)
      .first();

    if (!sessionRow) {
      return c.json({ error: 'Failed to create session' }, 500);
    }

    const sessionId = Number(sessionRow.id);

    const datasetIds: number[] = Array.isArray(body.dataset_ids)
      ? body.dataset_ids.map(Number).filter((id) => Number.isFinite(id))
      : [];

    if (datasetIds.length > 0) {
      for (const datasetId of datasetIds) {
        const dataset = await db
          .prepare(`SELECT id, name FROM datasets WHERE id = ?`)
          .bind(datasetId)
          .first();
        if (!dataset) {
          continue;
        }

        const posRow = await db
          .prepare(`SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM session_datasets WHERE session_id = ?`)
          .bind(sessionId)
          .first();
        const nextPos = Number(posRow?.next_pos ?? 1);

        await db
          .prepare(`INSERT INTO session_datasets (session_id, dataset_id, alias, position) VALUES (?, ?, ?, ?)`)
          .bind(sessionId, datasetId, dataset.name, nextPos)
          .run();
      }

      await db
        .prepare(`UPDATE workspace_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .bind(sessionId)
        .run();
    }

    const summary = await fetchSessionSummary(db, sessionId);
    if (summary && summary.datasets.length >= 2) {
      void queueJoinDiscovery(db, summary.session.id);
    }
    return c.json(summary, 201);
  } catch (error: any) {
    console.error('Create session error:', error);
    return c.json({ error: error.message || 'Failed to create session' }, error.status || 500);
  }
});

sessions.get('/:id', async (c) => {
  try {
    const sessionId = Number(c.req.param('id'));
    if (!Number.isFinite(sessionId)) {
      return c.json({ error: 'Invalid session id' }, 400);
    }

    const db = resolveDatabase(c.env);
    const summary = await fetchSessionSummary(db, sessionId);
    if (!summary) {
      return c.json({ error: 'Session not found' }, 404);
    }
    return c.json(summary);
  } catch (error: any) {
    console.error('Fetch session error:', error);
    return c.json({ error: error.message || 'Failed to fetch session' }, error.status || 500);
  }
});

sessions.post('/:id/datasets', async (c) => {
  try {
    const sessionId = Number(c.req.param('id'));
    if (!Number.isFinite(sessionId)) {
      return c.json({ error: 'Invalid session id' }, 400);
    }

    const db = resolveDatabase(c.env);
    await ensureSessionExists(db, sessionId);

    const body = await c.req.json().catch(() => ({}));
    const datasetId = Number(body.dataset_id);
    if (!Number.isFinite(datasetId)) {
      return c.json({ error: 'dataset_id is required' }, 400);
    }

    const datasetRow = await db
      .prepare(`SELECT id, name FROM datasets WHERE id = ?`)
      .bind(datasetId)
      .first();
    if (!datasetRow) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    const exists = await db
      .prepare(`SELECT 1 FROM session_datasets WHERE session_id = ? AND dataset_id = ?`)
      .bind(sessionId, datasetId)
      .first();
    if (exists) {
      return c.json({ error: 'Dataset already attached to session' }, 409);
    }

    const posRow = await db
      .prepare(`SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM session_datasets WHERE session_id = ?`)
      .bind(sessionId)
      .first();
    const nextPos = Number(posRow?.next_pos ?? 1);

    const alias = typeof body.alias === 'string' && body.alias.trim().length > 0 ? body.alias.trim() : datasetRow.name;

    await db
      .prepare(`INSERT INTO session_datasets (session_id, dataset_id, alias, position) VALUES (?, ?, ?, ?)`)
      .bind(sessionId, datasetId, alias, nextPos)
      .run();

    await db
      .prepare(`UPDATE workspace_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(sessionId)
      .run();

    const summary = await fetchSessionSummary(db, sessionId);
    if (summary && summary.datasets.length >= 2) {
      void queueJoinDiscovery(db, summary.session.id);
    }
    return c.json(summary);
  } catch (error: any) {
    console.error('Attach dataset error:', error);
    return c.json({ error: error.message || 'Failed to attach dataset' }, error.status || 500);
  }
});

sessions.delete('/:id/datasets/:datasetId', async (c) => {
  try {
    const sessionId = Number(c.req.param('id'));
    const datasetId = Number(c.req.param('datasetId'));
    if (!Number.isFinite(sessionId) || !Number.isFinite(datasetId)) {
      return c.json({ error: 'Invalid session or dataset id' }, 400);
    }

    const db = resolveDatabase(c.env);
    await ensureSessionExists(db, sessionId);

    await db
      .prepare(`DELETE FROM session_datasets WHERE session_id = ? AND dataset_id = ?`)
      .bind(sessionId, datasetId)
      .run();

    await db
      .prepare(`UPDATE workspace_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(sessionId)
      .run();

    const summary = await fetchSessionSummary(db, sessionId);
    if (summary && summary.datasets.length >= 2) {
      void queueJoinDiscovery(db, summary.session.id);
    }
    return c.json(summary);
  } catch (error: any) {
    console.error('Detach dataset error:', error);
    return c.json({ error: error.message || 'Failed to detach dataset' }, error.status || 500);
  }
});

sessions.get('/:id/datasets/:datasetId/columns', async (c) => {
  try {
    const sessionId = Number(c.req.param('id'));
    const datasetId = Number(c.req.param('datasetId'));
    if (!Number.isFinite(sessionId) || !Number.isFinite(datasetId)) {
      return c.json({ error: 'Invalid session or dataset id' }, 400);
    }

    const db = resolveDatabase(c.env);
    await ensureSessionExists(db, sessionId);

    const datasetRow = await db
      .prepare(`SELECT id, columns, row_count, column_count FROM datasets WHERE id = ?`)
      .bind(datasetId)
      .first();
    if (!datasetRow) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    await ensureDatasetAttached(db, sessionId, datasetId);

    const columns = parseJson(datasetRow.columns, []);
    return c.json({
      dataset_id: Number(datasetRow.id),
      row_count: Number(datasetRow.row_count ?? 0),
      column_count: Number(datasetRow.column_count ?? columns.length),
      columns,
    });
  } catch (error: any) {
    console.error('Fetch dataset columns error:', error);
    return c.json({ error: error.message || 'Failed to fetch dataset columns' }, error.status || 500);
  }
});

sessions.get('/:id/datasets/:datasetId/rows', async (c) => {
  try {
    const sessionId = Number(c.req.param('id'));
    const datasetId = Number(c.req.param('datasetId'));
    if (!Number.isFinite(sessionId) || !Number.isFinite(datasetId)) {
      return c.json({ error: 'Invalid session or dataset id' }, 400);
    }

    const rawLimit = c.req.query('limit');
    const rawOffset = c.req.query('offset');
    const selectQuery = c.req.query('columns');

    let limit = Number(rawLimit ?? 100);
    if (!Number.isFinite(limit) || limit <= 0) limit = 100;
    limit = Math.min(Math.max(Math.floor(limit), 1), 500);

    let offset = Number(rawOffset ?? 0);
    if (!Number.isFinite(offset) || offset < 0) offset = 0;
    offset = Math.max(Math.floor(offset), 0);

    const selectColumns = parseStringArray(selectQuery ?? []);

    const db = resolveDatabase(c.env);
    await ensureSessionExists(db, sessionId);
    await ensureDatasetAttached(db, sessionId, datasetId);

    const datasetRow = await db
      .prepare(`SELECT id, row_count FROM datasets WHERE id = ?`)
      .bind(datasetId)
      .first();
    if (!datasetRow) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    const totalRows = Number(datasetRow.row_count ?? 0);

    const rowResult = await db
      .prepare(`
        SELECT row_number, data
        FROM data_rows
        WHERE dataset_id = ?
        ORDER BY row_number
        LIMIT ? OFFSET ?
      `)
      .bind(datasetId, limit, offset)
      .all();

    const rows = rowResult.results.map((row: any) => {
      const parsed = parseJson<Record<string, unknown>>(row.data, {});
      let data = parsed;
      if (selectColumns.length > 0) {
        data = selectColumns.reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = parsed?.[key];
          return acc;
        }, {});
      }
      return {
        row_number: Number(row.row_number ?? 0),
        data,
      };
    });

    return c.json({
      session_id: sessionId,
      dataset_id: datasetId,
      offset,
      limit,
      total_rows: totalRows,
      rows,
      has_more: offset + rows.length < totalRows,
    });
  } catch (error: any) {
    console.error('Fetch dataset rows error:', error);
    return c.json({ error: error.message || 'Failed to fetch dataset rows' }, error.status || 500);
  }
});

sessions.post('/:id/query', async (c) => {
  try {
    const sessionId = Number(c.req.param('id'));
    if (!Number.isFinite(sessionId)) {
      return c.json({ error: 'Invalid session id' }, 400);
    }

    const spec = await c.req.json<SessionQuerySpec>().catch(() => null);
    if (!spec || !Number.isFinite(spec.dataset_id)) {
      return c.json({ error: 'dataset_id is required' }, 400);
    }

    const datasetId = Number(spec.dataset_id);

    const db = resolveDatabase(c.env);
    await ensureSessionExists(db, sessionId);
    await ensureDatasetAttached(db, sessionId, datasetId);

    const datasetRow = await db
      .prepare(`SELECT id, columns, row_count FROM datasets WHERE id = ?`)
      .bind(datasetId)
      .first();
    if (!datasetRow) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    const parsedColumns = parseJson<ColumnDefinition[]>(datasetRow.columns, []);
    const columnMap = getColumnMap(parsedColumns);

    const selectedColumns = Array.isArray(spec.columns)
      ? spec.columns.filter((column) => columnMap[column])
      : [];

    const limitRaw = Number(spec.limit ?? 200);
    let limit = Number.isFinite(limitRaw) ? limitRaw : 200;
    limit = Math.min(Math.max(Math.floor(limit), 1), 1000);

    const offsetRaw = Number(spec.offset ?? 0);
    let offset = Number.isFinite(offsetRaw) ? offsetRaw : 0;
    offset = Math.max(Math.floor(offset), 0);

    const filterParams: unknown[] = [];
    const filterClauses: string[] = [];
    if (Array.isArray(spec.filters)) {
      for (const filter of spec.filters as SessionQueryFilter[]) {
        if (!filter?.column) continue;
        const column = columnMap[filter.column];
        if (!column) continue;
        const clause = buildFilterClause(filter, column, filterParams);
        if (clause) {
          filterClauses.push(clause);
        }
      }
    }

    const whereSql = filterClauses.length ? ` AND ${filterClauses.join(' AND ')}` : '';

    const orderParts: string[] = [];
    if (Array.isArray(spec.order_by) && spec.order_by.length > 0) {
      for (const order of spec.order_by as SessionQueryOrder[]) {
        if (!order?.column) continue;
        const column = columnMap[order.column];
        if (!column) continue;
        const clause = buildOrderClause(order, column);
        if (clause) {
          orderParts.push(clause);
        }
      }
    }

    const orderSql = orderParts.length ? ` ORDER BY ${orderParts.join(', ')}` : ' ORDER BY row_number';

    const rowsSql = `
      SELECT row_number, data
      FROM data_rows
      WHERE dataset_id = ?${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const rowsParams = [datasetId, ...filterParams, limit, offset];
    const rowResult = await db.prepare(rowsSql).bind(...rowsParams).all();

    const countSql = `
      SELECT COUNT(*) AS count
      FROM data_rows
      WHERE dataset_id = ?${whereSql}
    `;

    const countParams = [datasetId, ...filterParams];
    const countRow = await db.prepare(countSql).bind(...countParams).first();
    const total = Number(countRow?.count ?? datasetRow.row_count ?? 0);

    const rows = rowResult.results.map((row: any) => {
      const parsed = parseJson<Record<string, unknown>>(row.data, {});
      let data = parsed;
      if (selectedColumns.length > 0) {
        data = selectedColumns.reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = parsed?.[key];
          return acc;
        }, {});
      }
      return {
        row_number: Number(row.row_number ?? 0),
        data,
      };
    });

    const response: SessionQueryResult = {
      rows,
      meta: {
        limit,
        offset,
        total_rows: total,
        query: rowsSql.replace(/\s+/g, ' ').trim(),
        params: rowsParams,
      },
    };

    return c.json(response);
  } catch (error: any) {
    console.error('Session query error:', error);
    return c.json({ error: error.message || 'Failed to execute query' }, error.status || 500);
  }
});

sessions.get('/:id/join-suggestions', async (c) => {
  try {
    const sessionId = Number(c.req.param('id'));
    if (!Number.isFinite(sessionId)) {
      return c.json({ error: 'Invalid session id' }, 400);
    }

    const db = resolveDatabase(c.env);
    await ensureSessionExists(db, sessionId);

    const suggestionRows = await db
      .prepare(
        `SELECT id, session_id, left_dataset_id, right_dataset_id, left_columns, right_columns,
                confidence, sample, status, created_at
         FROM join_suggestions
         WHERE session_id = ?
         ORDER BY confidence DESC, id DESC`
      )
      .bind(sessionId)
      .all();

    const joinSuggestions: JoinSuggestionRecord[] = suggestionRows.results.map((row: any) => ({
      id: Number(row.id),
      session_id: Number(row.session_id),
      left_dataset_id: Number(row.left_dataset_id),
      right_dataset_id: Number(row.right_dataset_id),
      left_columns: parseStringArray(row.left_columns),
      right_columns: parseStringArray(row.right_columns),
      confidence: Number(row.confidence ?? 0),
      sample: parseJson(row.sample, undefined),
      status: (row.status ?? 'suggested') as JoinSuggestionRecord['status'],
      created_at: row.created_at,
    }));

    return c.json({ session_id: sessionId, join_suggestions: joinSuggestions });
  } catch (error: any) {
    console.error('List join suggestions error:', error);
    return c.json({ error: error.message || 'Failed to fetch join suggestions' }, error.status || 500);
  }
});

sessions.post('/:id/state', async (c) => {
  try {
    const sessionId = Number(c.req.param('id'));
    if (!Number.isFinite(sessionId)) {
      return c.json({ error: 'Invalid session id' }, 400);
    }

    const db = resolveDatabase(c.env);
    await ensureSessionExists(db, sessionId);

    const body = await c.req.json().catch(() => ({}));
    const payload = body?.payload ?? {};

    const versionRow = await db
      .prepare(`SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM session_state_snapshots WHERE session_id = ?`)
      .bind(sessionId)
      .first();
    const nextVersion = Number(versionRow?.next_version ?? 1);

    await db
      .prepare(`INSERT INTO session_state_snapshots (session_id, version, payload) VALUES (?, ?, ?)`)
      .bind(sessionId, nextVersion, JSON.stringify(payload))
      .run();

    await db
      .prepare(`UPDATE workspace_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(sessionId)
      .run();

    return c.json({ session_id: sessionId, version: nextVersion });
  } catch (error: any) {
    console.error('Save session state error:', error);
    return c.json({ error: error.message || 'Failed to save session state' }, error.status || 500);
  }
});

sessions.get('/:id/state', async (c) => {
  try {
    const sessionId = Number(c.req.param('id'));
    if (!Number.isFinite(sessionId)) {
      return c.json({ error: 'Invalid session id' }, 400);
    }

    const db = resolveDatabase(c.env);
    await ensureSessionExists(db, sessionId);

    const stateRow = await db
      .prepare(`SELECT session_id, version, payload, created_at FROM session_state_snapshots WHERE session_id = ? ORDER BY version DESC LIMIT 1`)
      .bind(sessionId)
      .first();

    if (!stateRow) {
      return c.json({ session_id: sessionId, latest_state: null });
    }

    const snapshot: SessionStateSnapshot = {
      session_id: Number(stateRow.session_id ?? sessionId),
      version: Number(stateRow.version ?? 0),
      payload: parseJson(stateRow.payload, null),
      created_at: stateRow.created_at,
    };

    return c.json({ session_id: sessionId, latest_state: snapshot });
  } catch (error: any) {
    console.error('Fetch session state error:', error);
    return c.json({ error: error.message || 'Failed to fetch session state' }, error.status || 500);
  }
});

export default sessions;
