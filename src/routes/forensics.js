import { Hono } from 'hono';
import { resolveDatabase } from '../storage';
import { createForensicCase, linkEventsToCase, updateForensicCaseStatus } from '../utils/forensics';
import { generateAllTheories } from '../utils/theory-generator';
const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info'];
const SEVERITY_LABEL = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    info: 'Info',
};
const CASE_STATUS_LABEL = {
    open: 'Open',
    investigating: 'Investigating',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
};
const CASE_ACTIVE_STATUSES = new Set(['open', 'investigating']);
const CASE_ELIGIBLE_SEVERITIES = new Set(['critical', 'high', 'medium']);
const CASE_STATUS_VALUES = ['open', 'investigating', 'resolved', 'dismissed'];
const toNumber = (value) => {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'bigint')
        return Number(value);
    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    if (value == null)
        return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
};
const severityRank = (severity) => {
    const idx = SEVERITY_ORDER.indexOf(severity);
    return idx === -1 ? SEVERITY_ORDER.length : idx;
};
const normalizeSeverity = (value) => {
    if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (SEVERITY_ORDER.includes(lower)) {
            return lower;
        }
    }
    return 'info';
};
const normalizeCaseStatus = (value) => {
    if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (CASE_STATUS_VALUES.includes(lower)) {
            return lower;
        }
    }
    return 'open';
};
const formatPercent = (value, fractionDigits = 1) => {
    if (typeof value !== 'number' || Number.isNaN(value))
        return null;
    return `${(value * 100).toFixed(fractionDigits)}%`;
};
const formatNumber = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value))
        return null;
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};
const PLAYBOOK = {
    missing_spike: (ctx) => {
        const column = ctx.column ?? undefined;
        const missingPercentage = ctx.latestDetails?.missingPercentage;
        const shareLabel = typeof missingPercentage === 'number' ? `${missingPercentage.toFixed(1)}%` : 'a large share of';
        const headline = column
            ? `${shareLabel} values missing in ${column}`
            : `${shareLabel} values missing`;
        const whatItMeans = column
            ? `${ctx.datasetName} has ${shareLabel === 'a large share of' ? 'a significant portion of' : shareLabel} empty cells in ${column}. That can break averages, totals, and any downstream joins or models that rely on this column.`
            : 'We detected a spike in missing values. Large gaps can introduce biased results or break dashboards and joins.';
        const nextSteps = [
            column
                ? `Open “Clean Data” and mark ${column} as required so rows with blanks are removed or reviewed.`
                : 'Use “Clean Data” to mark your critical columns as required so rows with blanks are removed or highlighted.',
            'Consider filling in missing values with a sensible default (mean, median, or a category) before sharing insights or training models.',
        ];
        return {
            title: column ? `Missing data spike · ${column}` : 'Missing data spike',
            headline,
            whatItMeans,
            nextSteps,
            action: column
                ? {
                    type: 'open-cleaner-column',
                    label: `Clean ${column}`,
                    column,
                }
                : undefined,
        };
    },
    outlier_cluster: (ctx) => {
        const column = ctx.column ?? undefined;
        const ratio = ctx.latestDetails?.ratio;
        const ratioLabel = formatPercent(ratio) ?? 'multiple';
        const sampleValues = Array.isArray(ctx.latestDetails?.sampleValues)
            ? ctx.latestDetails?.sampleValues
            : [];
        const samplePreview = sampleValues.slice(0, 3).map((value) => `${value}`).join(', ');
        const headline = column
            ? `${ratioLabel} of ${column} looks extreme`
            : `${ratioLabel} of values look extreme`;
        const whatItMeans = column
            ? `There are ${ctx.latestDetails?.outlierCount ?? 'several'} rows in ${column} that sit far away from the rest. Extreme values can pull averages in the wrong direction and often hint at data-entry issues or exciting anomalies worth a closer look.`
            : 'We found unusually large or small values compared to the rest of the dataset. They can distort summaries and may need to be trimmed or verified.';
        const nextSteps = [
            column
                ? `Review the raw rows for ${column}. Do the numbers (${samplePreview || '...'}) look plausible?`
                : 'Skim the raw rows to confirm whether the extreme values make sense or should be excluded.',
            'If the values are legitimate, consider keeping them but highlight the range in your narrative. If not, remove or Winsorize them before sharing results.',
        ];
        return {
            title: column ? `Outliers detected · ${column}` : 'Outliers detected',
            headline,
            whatItMeans,
            nextSteps,
            action: column
                ? {
                    type: 'open-cleaner-column',
                    label: `Inspect ${column} in cleaner`,
                    column,
                }
                : undefined,
        };
    },
    trend_shift: (ctx) => {
        const column = ctx.column ?? undefined;
        const direction = typeof ctx.latestDetails?.direction === 'string' ? ctx.latestDetails.direction : 'changing';
        const strength = ctx.latestDetails?.strength;
        const strengthLabel = typeof strength === 'number' ? `${Math.round(strength * 100)}% confidence` : 'Detected trend';
        const headline = column
            ? `${column} is ${direction === 'increasing' ? 'trending up' : direction === 'decreasing' ? 'trending down' : 'shifting'}`
            : 'We noticed a trend shift';
        const whatItMeans = column
            ? `${direction === 'increasing' ? 'Values are climbing.' : direction === 'decreasing' ? 'Values are falling.' : 'The pattern is moving.'} This can signal a seasonality change, a process change, or a data quality issue. The detection has ${strengthLabel}.`
            : `We found a trend shift that might signal a process change, seasonality, or data quality issue. The detection has ${strengthLabel}.`;
        const nextSteps = [
            column
                ? `Switch to the “Insights” tab and search for ${column} to see the trend narrative and supporting charts.`
                : 'Review the Insights tab to see which column has the trend and whether it matches your expectations.',
            'If the change is real, annotate your report so stakeholders understand what changed. If not, investigate for data-entry issues or missing context.',
        ];
        return {
            title: column ? `Trend shift · ${column}` : 'Trend shift detected',
            headline,
            whatItMeans,
            nextSteps,
            action: column
                ? {
                    type: 'focus-insights-column',
                    label: `Review ${column} insights`,
                    column,
                }
                : undefined,
        };
    },
};
const buildPlaybook = (ctx) => {
    const builder = PLAYBOOK[ctx.eventType];
    if (builder) {
        return builder(ctx);
    }
    const summary = ctx.latestSummary ?? 'We noticed a pattern worth a closer look.';
    return {
        title: ctx.eventType,
        headline: summary,
        whatItMeans: 'Data Forensics surfaced an event that does not yet have a guided playbook. Review the event details in the insights tab and decide whether it needs action.',
        nextSteps: ['Check related insights or raw data to understand the root cause.', 'Document your decision so future runs can skip or focus on similar signals.'],
    };
};
let forensicCaseEventsIndexEnsured = false;
const ensureForensicCaseEventsIndex = async (db) => {
    if (forensicCaseEventsIndexEnsured)
        return;
    try {
        await db
            .prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_forensic_case_events_unique ON forensic_case_events(case_id, event_id)')
            .run();
    }
    catch (error) {
        // Ignore error if index already exists (DuckDB sometimes reports this even with IF NOT EXISTS)
        const errorMsg = error?.message || '';
        if (errorMsg.includes('already exists') ||
            errorMsg.includes('idx_forensic_case_events_unique') ||
            error?.errorType === 'Catalog' ||
            error?.code === 'DUCKDB_NODEJS_ERROR') {
            // Index already exists, which is fine
            return;
        }
        console.error('Failed to ensure forensic_case_events unique index:', error);
    }
    finally {
        forensicCaseEventsIndexEnsured = true;
    }
};
const syncForensicCases = async (db, datasetId, datasetName, groups) => {
    if (!groups.length)
        return;
    await ensureForensicCaseEventsIndex(db);
    const eligibleGroups = groups.filter((group) => CASE_ELIGIBLE_SEVERITIES.has(group.highestSeverity));
    if (!eligibleGroups.length)
        return;
    const caseRows = await db
        .prepare(`
      SELECT id, case_type, status, severity, title, hypothesis, evidence
      FROM forensic_cases
      WHERE primary_dataset_id = ?
    `)
        .bind(datasetId)
        .all();
    const caseKeyMap = new Map();
    for (const row of caseRows.results) {
        let parsedEvidence = null;
        if (row.evidence) {
            try {
                parsedEvidence = JSON.parse(row.evidence);
            }
            catch (error) {
                console.warn('Failed to parse forensic case evidence', row.id, error);
            }
        }
        const column = typeof parsedEvidence?.column === 'string' ? parsedEvidence.column : null;
        const entry = {
            id: toNumber(row.id),
            caseType: row.case_type,
            status: normalizeCaseStatus(row.status),
            severity: normalizeSeverity(row.severity),
            column,
            title: row.title,
            hypothesis: row.hypothesis,
            evidence: parsedEvidence,
            evidenceString: JSON.stringify(parsedEvidence ?? null),
        };
        const key = `${row.case_type}::${column ?? 'all'}`;
        if (!caseKeyMap.has(key)) {
            caseKeyMap.set(key, entry);
        }
        else {
            // Prefer active cases over closed ones for a given key
            const existing = caseKeyMap.get(key);
            if (!CASE_ACTIVE_STATUSES.has(existing.status) && CASE_ACTIVE_STATUSES.has(entry.status)) {
                caseKeyMap.set(key, entry);
            }
        }
    }
    const linkRows = await db
        .prepare(`
      SELECT fce.case_id, fce.event_id
      FROM forensic_case_events fce
      JOIN forensic_cases fc ON fc.id = fce.case_id
      WHERE fc.primary_dataset_id = ?
    `)
        .bind(datasetId)
        .all();
    const linkMap = new Map();
    for (const row of linkRows.results) {
        const caseId = toNumber(row.case_id);
        const eventId = toNumber(row.event_id);
        const set = linkMap.get(caseId) ?? new Set();
        set.add(eventId);
        linkMap.set(caseId, set);
    }
    for (const group of eligibleGroups) {
        const playbook = group.playbook ?? buildPlaybook({ ...group, datasetName });
        const evidencePayload = {
            column: group.column,
            eventType: group.eventType,
            eventCount: group.count,
            lastSummary: group.latestSummary ?? null,
            lastOccurredAt: group.latestOccurredAt,
            action: playbook.action ?? null,
        };
        const newEvidenceString = JSON.stringify(evidencePayload);
        const key = group.id;
        let entry = caseKeyMap.get(key);
        if (!entry) {
            const caseId = await createForensicCase(db, {
                sessionId: null,
                primaryDatasetId: datasetId,
                caseType: group.eventType,
                status: 'open',
                severity: group.highestSeverity,
                title: playbook.title,
                hypothesis: playbook.whatItMeans,
                evidence: evidencePayload,
            });
            entry = {
                id: caseId,
                caseType: group.eventType,
                status: 'open',
                severity: group.highestSeverity,
                column: group.column,
                title: playbook.title,
                hypothesis: playbook.whatItMeans,
                evidence: evidencePayload,
                evidenceString: newEvidenceString,
            };
            caseKeyMap.set(key, entry);
            linkMap.set(caseId, new Set());
        }
        else {
            const desiredStatus = CASE_ACTIVE_STATUSES.has(entry.status) ? entry.status : 'open';
            const shouldUpdate = desiredStatus !== entry.status ||
                entry.severity !== group.highestSeverity ||
                (entry.title ?? '') !== (playbook.title ?? '') ||
                (entry.hypothesis ?? '') !== (playbook.whatItMeans ?? '') ||
                entry.evidenceString !== newEvidenceString;
            if (shouldUpdate) {
                await updateForensicCaseStatus(db, entry.id, desiredStatus, {
                    severity: group.highestSeverity,
                    title: playbook.title,
                    hypothesis: playbook.whatItMeans,
                    evidence: evidencePayload,
                });
                entry.status = desiredStatus;
                entry.severity = group.highestSeverity;
                entry.title = playbook.title;
                entry.hypothesis = playbook.whatItMeans;
                entry.evidence = evidencePayload;
                entry.evidenceString = newEvidenceString;
            }
        }
        const linkSet = linkMap.get(entry.id) ?? new Set();
        const newEventIds = group.eventIds.filter((id) => !linkSet.has(id));
        if (newEventIds.length > 0) {
            await linkEventsToCase(db, entry.id, newEventIds);
            for (const eventId of newEventIds) {
                linkSet.add(eventId);
            }
            linkMap.set(entry.id, linkSet);
        }
    }
};
const fetchForensicCasesForDataset = async (db, datasetId) => {
    const caseRows = await db
        .prepare(`
      SELECT
        fc.id,
        fc.case_type,
        fc.status,
        fc.severity,
        fc.title,
        fc.hypothesis,
        fc.created_at,
        fc.updated_at,
        fc.evidence,
        COUNT(fce.event_id) AS event_count,
        MAX(fe.occurred_at) AS last_event_at
      FROM forensic_cases fc
      LEFT JOIN forensic_case_events fce ON fce.case_id = fc.id
      LEFT JOIN forensic_events fe ON fe.id = fce.event_id
      WHERE fc.primary_dataset_id = ?
      GROUP BY
        fc.id,
        fc.case_type,
        fc.status,
        fc.severity,
        fc.title,
        fc.hypothesis,
        fc.created_at,
        fc.updated_at,
        fc.evidence
      ORDER BY fc.updated_at DESC
    `)
        .bind(datasetId)
        .all();
    const active = [];
    const history = [];
    for (const row of caseRows.results) {
        let parsedEvidence = null;
        if (row.evidence) {
            try {
                parsedEvidence = JSON.parse(row.evidence);
            }
            catch (error) {
                console.warn('Failed to parse forensic case evidence', row.id, error);
            }
        }
        const severity = normalizeSeverity(row.severity);
        const status = normalizeCaseStatus(row.status);
        const column = typeof parsedEvidence?.column === 'string' ? parsedEvidence.column : null;
        const action = parsedEvidence?.action && typeof parsedEvidence.action === 'object' ? parsedEvidence.action : null;
        const eventCount = toNumber(row.event_count ?? 0);
        const summary = {
            id: toNumber(row.id),
            caseType: row.case_type,
            status,
            statusLabel: CASE_STATUS_LABEL[status],
            severity,
            severityLabel: SEVERITY_LABEL[severity],
            title: row.title ?? (column ? `${row.case_type} · ${column}` : row.case_type),
            hypothesis: row.hypothesis,
            eventCount,
            column,
            lastEventAt: row.last_event_at,
            updatedAt: row.updated_at,
            action,
        };
        if (CASE_ACTIVE_STATUSES.has(status)) {
            active.push(summary);
        }
        else {
            history.push(summary);
        }
    }
    const sortCases = (list) => list.sort((a, b) => {
        const severityDiff = severityRank(a.severity) - severityRank(b.severity);
        if (severityDiff !== 0)
            return severityDiff;
        const timeA = Date.parse(a.lastEventAt ?? a.updatedAt ?? '');
        const timeB = Date.parse(b.lastEventAt ?? b.updatedAt ?? '');
        if (Number.isNaN(timeA) || Number.isNaN(timeB))
            return 0;
        return timeB - timeA;
    });
    return {
        active: sortCases(active),
        history: sortCases(history),
    };
};
const forensics = new Hono();
forensics.get('/datasets/:datasetId', async (c) => {
    const datasetIdParam = c.req.param('datasetId');
    const datasetId = Number(datasetIdParam);
    if (!Number.isFinite(datasetId)) {
        return c.json({ success: false, error: 'Invalid dataset id' }, 400);
    }
    const db = resolveDatabase(c.env);
    const datasetRow = await db
        .prepare(`SELECT id, name FROM datasets WHERE id = ?`)
        .bind(datasetId)
        .first();
    if (!datasetRow) {
        return c.json({ success: false, error: 'Dataset not found' }, 404);
    }
    const dataset = {
        id: toNumber(datasetRow.id),
        name: datasetRow.name ?? `Dataset ${datasetId}`,
    };
    const eventRows = await db
        .prepare(`
      SELECT id, event_type, severity, summary, occurred_at, details
      FROM forensic_events
      WHERE dataset_id = ?
      ORDER BY occurred_at DESC
      LIMIT 200
    `)
        .bind(datasetId)
        .all();
    const events = eventRows.results.map((row) => {
        let details = null;
        if (row.details) {
            try {
                details = JSON.parse(row.details);
            }
            catch (error) {
                console.warn('Failed to parse forensic event details', row.id, error);
            }
        }
        return {
            id: toNumber(row.id),
            eventType: row.event_type,
            severity: normalizeSeverity(row.severity),
            summary: row.summary,
            occurredAt: row.occurred_at,
            details,
        };
    });
    const severityCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
    };
    const groupsMap = new Map();
    for (const event of events) {
        severityCounts[event.severity] += 1;
        const column = typeof event.details?.column === 'string' ? event.details.column : null;
        const groupKey = `${event.eventType}::${column ?? 'all'}`;
        if (!groupsMap.has(groupKey)) {
            groupsMap.set(groupKey, {
                id: groupKey,
                eventType: event.eventType,
                column,
                count: 0,
                highestSeverity: event.severity,
                highestSeverityRank: severityRank(event.severity),
                latestOccurredAt: event.occurredAt,
                latestSummary: event.summary ?? null,
                latestDetails: event.details ?? null,
                eventIds: [],
            });
        }
        const group = groupsMap.get(groupKey);
        group.count += 1;
        group.eventIds.push(event.id);
        const rank = severityRank(event.severity);
        if (rank < group.highestSeverityRank) {
            group.highestSeverityRank = rank;
            group.highestSeverity = event.severity;
        }
        if (event.occurredAt > group.latestOccurredAt) {
            group.latestOccurredAt = event.occurredAt;
            group.latestSummary = event.summary ?? group.latestSummary;
            group.latestDetails = event.details ?? group.latestDetails;
        }
    }
    const groupsArray = Array.from(groupsMap.values());
    for (const group of groupsArray) {
        group.playbook = buildPlaybook({ ...group, datasetName: dataset.name });
    }
    await syncForensicCases(db, dataset.id, dataset.name, groupsArray);
    const cases = await fetchForensicCasesForDataset(db, dataset.id);
    const groups = groupsArray
        .map((group) => {
        const playbook = group.playbook ?? buildPlaybook({ ...group, datasetName: dataset.name });
        return {
            id: group.id,
            eventType: group.eventType,
            column: group.column,
            severity: group.highestSeverity,
            severityLabel: SEVERITY_LABEL[group.highestSeverity],
            count: group.count,
            lastOccurredAt: group.latestOccurredAt,
            title: playbook.title,
            headline: playbook.headline,
            whatItMeans: playbook.whatItMeans,
            nextSteps: playbook.nextSteps,
            action: playbook.action ?? null,
        };
    })
        .sort((a, b) => {
        const severityDiff = severityRank(a.severity) - severityRank(b.severity);
        if (severityDiff !== 0)
            return severityDiff;
        return a.lastOccurredAt > b.lastOccurredAt ? -1 : a.lastOccurredAt < b.lastOccurredAt ? 1 : 0;
    });
    const totalEvents = events.length;
    const lastUpdated = events.length > 0 ? events[0].occurredAt : null;
    let summaryMessage;
    if (totalEvents === 0) {
        summaryMessage = 'No forensic alerts yet. Upload or analyze more data and we will flag anything unusual here.';
    }
    else if (severityCounts.critical + severityCounts.high > 0) {
        summaryMessage = 'We spotted some high-priority issues that could skew your analysis. Start with the findings marked High.';
    }
    else if (severityCounts.medium > 0) {
        summaryMessage = 'A few medium-level findings need attention. Review them to keep your data reliable.';
    }
    else {
        summaryMessage = 'Only low-signal findings so far. Review when convenient to keep your data tidy.';
    }
    const summary = {
        totalEvents,
        severityCounts,
        highestSeverity: (() => {
            for (const level of SEVERITY_ORDER) {
                if (severityCounts[level] > 0) {
                    return level;
                }
            }
            return 'info';
        })(),
        highestSeverityLabel: (() => {
            for (const level of SEVERITY_ORDER) {
                if (severityCounts[level] > 0) {
                    return SEVERITY_LABEL[level];
                }
            }
            return SEVERITY_LABEL.info;
        })(),
        lastUpdated,
        message: summaryMessage,
        focusGroupId: groups.length > 0 ? groups[0].id : null,
    };
    return c.json({
        success: true,
        dataset,
        summary,
        cases,
        groups,
        events,
    });
});
forensics.post('/cases/:caseId/status', async (c) => {
    const caseIdParam = c.req.param('caseId');
    const caseId = Number(caseIdParam);
    if (!Number.isFinite(caseId)) {
        return c.json({ success: false, error: 'Invalid case id' }, 400);
    }
    let payload = {};
    try {
        payload = await c.req.json();
    }
    catch (error) {
        return c.json({ success: false, error: 'Invalid request body' }, 400);
    }
    if (!payload.status) {
        return c.json({ success: false, error: 'Missing status value' }, 400);
    }
    const requestedStatus = normalizeCaseStatus(payload.status);
    if (!CASE_STATUS_VALUES.includes(requestedStatus)) {
        return c.json({ success: false, error: 'Unsupported case status' }, 400);
    }
    const db = resolveDatabase(c.env);
    const existing = await db
        .prepare('SELECT id FROM forensic_cases WHERE id = ?')
        .bind(caseId)
        .first();
    if (!existing) {
        return c.json({ success: false, error: 'Case not found' }, 404);
    }
    await updateForensicCaseStatus(db, caseId, requestedStatus);
    return c.json({ success: true });
});
// Generate data theories for forensic investigation
forensics.get('/datasets/:datasetId/theories', async (c) => {
    const datasetId = parseInt(c.req.param('datasetId'), 10);
    if (Number.isNaN(datasetId)) {
        return c.json({ error: 'Invalid dataset ID' }, 400);
    }
    const db = resolveDatabase(c.env);
    try {
        const theories = await generateAllTheories(db, datasetId);
        return c.json({
            dataset_id: datasetId,
            theory_count: theories.length,
            theories: theories.map(theory => ({
                id: theory.id,
                hypothesis: theory.hypothesis,
                alternative_hypothesis: theory.alternativeHypothesis,
                confidence_score: theory.confidenceScore,
                evidence_strength: theory.evidenceStrength,
                case_type: theory.caseType,
                severity: theory.severity,
                priority: theory.priority,
                statistical_tests: theory.statisticalTests,
                supporting_evidence_count: theory.supportingEvidence.length,
                contradicting_evidence_count: theory.contradictingEvidence.length,
                open_questions: theory.openQuestions,
                suggested_actions: theory.suggestedActions.map(action => ({
                    action: action.action,
                    rationale: action.rationale,
                    expected_outcome: action.expectedOutcome,
                    priority: action.priority,
                    tools_required: action.toolsRequired
                }))
            }))
        });
    }
    catch (error) {
        console.error('Error generating theories:', error);
        return c.json({ error: 'Failed to generate theories' }, 500);
    }
});
export default forensics;
