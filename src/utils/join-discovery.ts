import type { DatabaseBinding } from '../storage/types';
import type { ColumnDefinition } from '../types';
import { MinHash } from './minhash';

const MIN_CONFIDENCE = 0.55;

function parseColumns(raw: unknown): ColumnDefinition[] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as ColumnDefinition[]) : [];
    } catch (error) {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw as ColumnDefinition[];
  return [];
}

function getUniqueRatio(column: ColumnDefinition, rowCount: number): number {
  const unique = typeof column.unique_count === 'number'
    ? column.unique_count
    : column.profile?.unique_count ?? null;
  if (unique === null) return column.profile?.unique_ratio ?? 0;
  if (rowCount <= 0) return column.profile?.unique_ratio ?? 0;
  return unique / rowCount;
}

function isCandidateKey(column: ColumnDefinition, rowCount: number): boolean {
  const ratio = getUniqueRatio(column, rowCount);
  if (ratio < 0.2) return false;
  if (column.type === 'number' || column.type === 'string' || column.type === 'boolean') {
    return true;
  }
  return false;
}

function sanitizeColumns(column: ColumnDefinition[]): Record<string, ColumnDefinition> {
  return column.reduce<Record<string, ColumnDefinition>>((acc, col) => {
    if (col?.name) {
      acc[col.name] = col;
    }
    return acc;
  }, {});
}

// Fallback for non-MinHashed columns
function computeStatConfidence(ratioA: number, ratioB: number): number {
  const diff = Math.abs(ratioA - ratioB);
  const base = 0.6 - diff * 0.4;
  return Math.max(0, Math.min(1, 0.5 + base));
}

// Levenshtein distance for name similarity
function levenshtein(s1: string, s2: string): number {
    s1 = s1.toLowerCase().replace(/_/g, '').replace(/ /g, '');
    s2 = s2.toLowerCase().replace(/_/g, '').replace(/ /g, '');

    const len1 = s1.length;
    const len2 = s2.length;
    if (len1 === 0 || len2 === 0) return 0;

    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
        for (let i = 1; i <= len1; i++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + cost
            );
        }
    }
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
}


async function upsertJoinSuggestion(
  db: DatabaseBinding,
  sessionId: number,
  leftDatasetId: number,
  rightDatasetId: number,
  leftColumn: string,
  rightColumn: string,
  confidence: number,
): Promise<void> {
  const leftColumnsJson = JSON.stringify([leftColumn]);
  const rightColumnsJson = JSON.stringify([rightColumn]);

  const existing = await db
    .prepare(`
      SELECT id
      FROM join_suggestions
      WHERE session_id = ?
        AND left_dataset_id = ?
        AND right_dataset_id = ?
        AND left_columns = ?
        AND right_columns = ?
    `)
    .bind(sessionId, leftDatasetId, rightDatasetId, leftColumnsJson, rightColumnsJson)
    .first();

  if (existing) {
    await db
      .prepare(`UPDATE join_suggestions SET confidence = ?, status = 'suggested', created_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(confidence, (existing as any).id)
      .run();
    return;
  }

  await db
    .prepare(`
      INSERT INTO join_suggestions (
        session_id,
        left_dataset_id,
        right_dataset_id,
        left_columns,
        right_columns,
        confidence,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, 'suggested')
    `)
    .bind(sessionId, leftDatasetId, rightDatasetId, leftColumnsJson, rightColumnsJson, confidence)
    .run();
}

export async function queueJoinDiscovery(db: DatabaseBinding, sessionId: number): Promise<void> {
  try {
    const datasetRows = await db
      .prepare(`
        SELECT sd.dataset_id, d.columns, d.row_count
        FROM session_datasets sd
        JOIN datasets d ON d.id = sd.dataset_id
        WHERE sd.session_id = ?
        ORDER BY sd.position ASC, sd.dataset_id ASC
      `)
      .bind(sessionId)
      .all();

    const datasets = datasetRows.results.map((row: any) => ({
      dataset_id: Number(row.dataset_id),
      columns: parseColumns(row.columns),
      row_count: Number(row.row_count ?? 0),
    }));

    for (let i = 0; i < datasets.length; i++) {
      for (let j = i + 1; j < datasets.length; j++) {
        const left = datasets[i];
        const right = datasets[j];
        if (!left.columns.length || !right.columns.length) continue;

        for (const leftCol of left.columns) {
            for (const rightCol of right.columns) {
                // Rule 1: Compatible types
                if (leftCol.type !== rightCol.type) continue;

                // Rule 2: At least one should be a potential key
                if (!isCandidateKey(leftCol, left.row_count) && !isCandidateKey(rightCol, right.row_count)) continue;

                let confidence = 0;
                let valueSimilarity = 0;

                if (leftCol.type === 'string' && leftCol.profile?.minhash && rightCol.profile?.minhash) {
                    try {
                        const leftMinHash = MinHash.deserialize(leftCol.profile.minhash);
                        const rightMinHash = MinHash.deserialize(rightCol.profile.minhash);
                        valueSimilarity = leftMinHash.jaccard(rightMinHash);
                    } catch (e) {
                        console.error("Failed to deserialize MinHash", e);
                        continue;
                    }
                } else {
                    // Fallback for non-string or non-minhashed columns
                    valueSimilarity = computeStatConfidence(
                        getUniqueRatio(leftCol, left.row_count),
                        getUniqueRatio(rightCol, right.row_count)
                    );
                }

                if (valueSimilarity < 0.2) continue; // Prune early

                const nameSimilarity = levenshtein(leftCol.name, rightCol.name);

                // Weighted confidence score
                confidence = (valueSimilarity * 0.7) + (nameSimilarity * 0.3);

                if (confidence > MIN_CONFIDENCE) {
                    await upsertJoinSuggestion(db, sessionId, left.dataset_id, right.dataset_id, leftCol.name, rightCol.name, confidence);
                }
            }
        }
      }
    }
  } catch (error) {
    console.error('Join discovery failed:', error);
  }
}
