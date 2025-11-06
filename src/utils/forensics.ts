import type { DatabaseBinding } from '../storage/types';
import type {
  ForensicCase,
  ForensicCaseStatus,
  ForensicEvent,
  ForensicSeverity,
} from '../types';

export interface ForensicEventInput {
  datasetId: number;
  sessionId?: number | null;
  eventType: string;
  severity?: ForensicSeverity;
  signalScore?: number | null;
  summary?: string | null;
  details?: unknown;
}

export interface ForensicCaseInput {
  sessionId?: number | null;
  primaryDatasetId?: number | null;
  caseType: string;
  status?: ForensicCaseStatus;
  severity?: ForensicSeverity;
  title?: string | null;
  hypothesis?: string | null;
  evidence?: unknown;
}

async function nextTableId(db: DatabaseBinding, table: string): Promise<number> {
  const row = await db
    .prepare(`SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM ${table}`)
    .first<{ next_id: number }>();
  const next = row?.next_id ?? 1;
  return Number(next);
}

export async function recordForensicEvent(db: DatabaseBinding, input: ForensicEventInput): Promise<number> {
  const severity = input.severity ?? 'medium';
  const signalScore = input.signalScore ?? null;
  const summary = input.summary ?? null;
  const details = input.details ?? null;
  const id = await nextTableId(db, 'forensic_events');

  await db
    .prepare(
      `INSERT INTO forensic_events (id, dataset_id, session_id, event_type, severity, signal_score, summary, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.datasetId,
      input.sessionId ?? null,
      input.eventType,
      severity,
      signalScore,
      summary,
      details ? JSON.stringify(details) : null,
    )
    .run();

  return id;
}

export async function recordForensicEvents(db: DatabaseBinding, events: ForensicEventInput[]): Promise<number[]> {
  const ids: number[] = [];
  for (const evt of events) {
    try {
      const id = await recordForensicEvent(db, evt);
      ids.push(id);
    } catch (error) {
      console.error('Failed to record forensic event:', error, evt);
    }
  }
  return ids;
}

export async function createForensicCase(db: DatabaseBinding, input: ForensicCaseInput): Promise<number> {
  const severity = input.severity ?? 'medium';
  const status = input.status ?? 'open';
  const title = input.title ?? null;
  const hypothesis = input.hypothesis ?? null;
  const evidence = input.evidence ?? null;
  const id = await nextTableId(db, 'forensic_cases');

  await db
    .prepare(
      `INSERT INTO forensic_cases (id, session_id, primary_dataset_id, case_type, status, severity, title, hypothesis, evidence)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.sessionId ?? null,
      input.primaryDatasetId ?? null,
      input.caseType,
      status,
      severity,
      title,
      hypothesis,
      evidence ? JSON.stringify(evidence) : null,
    )
    .run();

  return id;
}

export async function linkEventsToCase(db: DatabaseBinding, caseId: number, eventIds: number[]): Promise<void> {
  const statements = eventIds.map((eventId) =>
    db
      .prepare(`INSERT OR IGNORE INTO forensic_case_events (case_id, event_id) VALUES (?, ?)`)
      .bind(caseId, eventId),
  );
  if (!statements.length) return;
  try {
    await db.batch(statements);
  } catch (error) {
    console.error('Failed to link events to case:', error);
  }
}

export async function updateForensicCaseStatus(
  db: DatabaseBinding,
  caseId: number,
  status: ForensicCaseStatus,
  updates: Partial<Pick<ForensicCase, 'severity' | 'title' | 'hypothesis' | 'evidence'>> = {},
): Promise<void> {
  const fields: string[] = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
  const params: any[] = [status];

  if (updates.severity) {
    fields.push('severity = ?');
    params.push(updates.severity);
  }
  if (updates.title !== undefined) {
    fields.push('title = ?');
    params.push(updates.title ?? null);
  }
  if (updates.hypothesis !== undefined) {
    fields.push('hypothesis = ?');
    params.push(updates.hypothesis ?? null);
  }
  if (updates.evidence !== undefined) {
    fields.push('evidence = ?');
    params.push(updates.evidence ? JSON.stringify(updates.evidence) : null);
  }

  params.push(caseId);

  await db
    .prepare(`UPDATE forensic_cases SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...params)
    .run();
}

export async function fetchActiveForensicCases(db: DatabaseBinding, sessionId: number): Promise<ForensicCase[]> {
  const caseRows = await db
    .prepare(`
      SELECT id, session_id, primary_dataset_id, case_type, status, severity, title, hypothesis, created_at, updated_at, evidence
      FROM forensic_cases
      WHERE session_id = ? AND status IN ('open', 'investigating')
      ORDER BY severity DESC, created_at DESC
    `)
    .bind(sessionId)
    .all<ForensicCase>();

  const cases = caseRows.results.map((row) => ({
    ...row,
    evidence: row.evidence ? JSON.parse(row.evidence as unknown as string) : null,
  }));

  if (!cases.length) {
    return [];
  }

  const caseIds = cases.map((c) => c.id);
  const placeholders = caseIds.map(() => '?').join(', ');
  const links = await db
    .prepare(
      `SELECT fce.case_id, fe.* FROM forensic_case_events fce JOIN forensic_events fe ON fe.id = fce.event_id WHERE fce.case_id IN (${placeholders})`
    )
    .bind(...caseIds)
    .all<{ case_id: number } & ForensicEvent>();

  const grouped = new Map<number, ForensicEvent[]>();
  for (const link of links.results) {
    const list = grouped.get(link.case_id) ?? [];
    const event: ForensicEvent = {
      id: link.id,
      dataset_id: link.dataset_id,
      session_id: link.session_id,
      event_type: link.event_type,
      severity: link.severity as ForensicSeverity,
      signal_score: link.signal_score,
      occurred_at: link.occurred_at,
      summary: link.summary,
      details: link.details ? JSON.parse(link.details as unknown as string) : null,
    };
    list.push(event);
    grouped.set(link.case_id, list);
  }

  return cases.map((item) => ({
    ...item,
    events: grouped.get(item.id) ?? [],
  }));
}
