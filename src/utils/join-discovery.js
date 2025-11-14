const MIN_CONFIDENCE = 0.55;
function parseColumns(raw) {
    if (!raw)
        return [];
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (error) {
            return [];
        }
    }
    if (Array.isArray(raw))
        return raw;
    return [];
}
function getUniqueRatio(column, rowCount) {
    const unique = typeof column.unique_count === 'number'
        ? column.unique_count
        : column.profile?.unique_count ?? null;
    if (unique === null)
        return column.profile?.unique_ratio ?? 0;
    if (rowCount <= 0)
        return column.profile?.unique_ratio ?? 0;
    return unique / rowCount;
}
function isCandidateKey(column, rowCount) {
    const ratio = getUniqueRatio(column, rowCount);
    if (ratio < 0.2)
        return false;
    if (column.type === 'number' || column.type === 'string' || column.type === 'boolean') {
        return true;
    }
    return false;
}
function sanitizeColumns(column) {
    return column.reduce((acc, col) => {
        if (col?.name) {
            acc[col.name] = col;
        }
        return acc;
    }, {});
}
function computeConfidence(ratioA, ratioB) {
    const diff = Math.abs(ratioA - ratioB);
    const base = 0.6 - diff * 0.4;
    return Math.max(0, Math.min(1, 0.5 + base));
}
async function upsertJoinSuggestion(db, sessionId, leftDatasetId, rightDatasetId, leftColumn, rightColumn, confidence) {
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
            .bind(confidence, existing.id)
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
/**
 * Lightweight join discovery: matches columns with identical names and compatible stats across session datasets.
 */
export async function queueJoinDiscovery(db, sessionId) {
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
        const datasets = datasetRows.results.map((row) => ({
            dataset_id: Number(row.dataset_id),
            columns: parseColumns(row.columns),
            row_count: Number(row.row_count ?? 0),
        }));
        for (let i = 0; i < datasets.length; i++) {
            for (let j = i + 1; j < datasets.length; j++) {
                const left = datasets[i];
                const right = datasets[j];
                if (!left.columns.length || !right.columns.length)
                    continue;
                const leftMap = sanitizeColumns(left.columns);
                const rightMap = sanitizeColumns(right.columns);
                for (const columnName of Object.keys(leftMap)) {
                    const leftCol = leftMap[columnName];
                    const rightCol = rightMap[columnName];
                    if (!rightCol)
                        continue;
                    if (!isCandidateKey(leftCol, left.row_count) || !isCandidateKey(rightCol, right.row_count)) {
                        continue;
                    }
                    const ratioA = getUniqueRatio(leftCol, left.row_count);
                    const ratioB = getUniqueRatio(rightCol, right.row_count);
                    const confidence = computeConfidence(ratioA, ratioB);
                    if (confidence < MIN_CONFIDENCE)
                        continue;
                    await upsertJoinSuggestion(db, sessionId, left.dataset_id, right.dataset_id, leftCol.name, rightCol.name, confidence);
                }
            }
        }
    }
    catch (error) {
        console.error('Join discovery failed:', error);
    }
}
