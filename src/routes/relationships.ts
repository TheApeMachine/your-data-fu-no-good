// Relationship graph API

import { Hono } from 'hono';
import type { Bindings } from '../types';
import { resolveDatabase } from '../storage';
import { computeTextTopics } from '../utils/topic-analysis';

const relationships = new Hono<{ Bindings: Bindings }>();

const MAX_RELATIONSHIP_ROWS = 2000;

function getUniqueCount(column: any): number {
  if (typeof column.unique_count === 'number') return column.unique_count;
  if (typeof column.unique_count === 'string') {
    const parsed = Number(column.unique_count);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (column.profile && typeof column.profile.unique_count === 'number') {
    return column.profile.unique_count;
  }
  return 0;
}

function isCategoricalColumn(column: any, totalRows: number): boolean {
  const baseType = (column.type || '').toLowerCase();
  const uniqueCount = getUniqueCount(column);
  if (uniqueCount <= 1) return false;
  if (uniqueCount > Math.max(200, totalRows * 0.5)) {
    return false;
  }
  if (baseType === 'number') {
    return uniqueCount <= 25;
  }
  if (baseType === 'date' || baseType === 'datetime' || baseType === 'timestamp') {
    return false;
  }
  return true;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'column' | 'value' | 'topic';
  size: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'correlation' | 'association' | 'pattern' | 'contains' | 'topic' | 'topic_similarity';
  strength: number;
  label: string;
}

function safeParseJson(value: unknown): any {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }
  return value;
}

function normalizeCategoricalValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.length > 80 ? `${trimmed.slice(0, 77)}...` : trimmed;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function extractCorrelationMetrics(result: any) {
  const pearson = typeof result?.pearson === 'number'
    ? result.pearson
    : typeof result?.correlation === 'number'
      ? result.correlation
      : null;
  const spearman = typeof result?.spearman === 'number' ? result.spearman : null;
  const normalizedMI = typeof result?.normalized_mutual_information === 'number'
    ? result.normalized_mutual_information
    : null;
  const bestStrength = typeof result?.best_strength === 'number'
    ? result.best_strength
    : Math.max(
        Math.abs(pearson ?? 0),
        Math.abs(spearman ?? 0),
        normalizedMI ?? 0,
      );
  const bestMetric = typeof result?.best_metric === 'string' ? result.best_metric : null;

  return {
    pearson,
    spearman,
    normalizedMI,
    bestStrength,
    bestMetric,
  };
}

relationships.get('/:id', async (c) => {
  try {
    const datasetId = c.req.param('id');

    // Get dataset info
    const db = resolveDatabase(c.env);

    const dataset = await db.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(datasetId).first<any>();

    if (!dataset) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    const columns = JSON.parse(dataset.columns as string);
    const totalRows = typeof dataset.row_count === 'number'
      ? dataset.row_count
      : Number(dataset.row_count ?? 0);

    const rawDataRows = await db
      .prepare(`SELECT row_number, data FROM data_rows WHERE dataset_id = ? LIMIT ?`)
      .bind(datasetId, MAX_RELATIONSHIP_ROWS)
      .all();

    const parsedDataRows: Array<{ row_number: number; data: Record<string, unknown> }> = rawDataRows.results
      .map((row: any) => {
        const parsed = safeParseJson(row.data);
        const dataObject = typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null;
        if (!dataObject) return null;
        return {
          row_number: Number(row.row_number ?? 0),
          data: dataObject,
        };
      })
      .filter((entry): entry is { row_number: number; data: Record<string, unknown> } => entry !== null);

    const datasetIdNumber = Number(datasetId);
    const topicAnalysis = Number.isFinite(datasetIdNumber)
      ? await computeTextTopics(datasetIdNumber, db, { rowLimit: 1500 })
      : { topics: [], similarities: [], clusters: [] };

    // Get all analyses
    const analysesResult = await db.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(datasetId).all();

    const analyses = analysesResult.results.map((a: any) => ({
      ...a,
      result: JSON.parse(a.result as string)
    }));

    // Build graph
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const edgeKey = new Set<string>();
    const pushEdge = (edge: GraphEdge) => {
      const undirectedKey = [edge.source, edge.target].sort().join('|');
      const key = edge.type === 'contains'
        ? `${edge.type}:${edge.source}->${edge.target}`
        : `${edge.type}:${undirectedKey}`;
      if (edgeKey.has(key)) return;
      edgeKey.add(key);
      edges.push(edge);
    };
    const nodeMap = new Map<string, boolean>();

    // Add column nodes
    for (const col of columns) {
      const nodeId = `col_${col.name}`;
      if (!nodeMap.has(nodeId)) {
        // Size based on uniqueness (more unique = larger node)
        const uniqueCount = typeof col.unique_count === 'number'
          ? col.unique_count
          : (col.profile?.unique_count ?? 0);
        const uniqueRatio = totalRows > 0
          ? uniqueCount / totalRows
          : 0;
        const size = 10 + (uniqueRatio * 30);

        nodes.push({
          id: nodeId,
          label: col.name,
          type: 'column',
          size
        });
        nodeMap.set(nodeId, true);
      }
    }

    // Topic nodes
    for (const topic of topicAnalysis.topics) {
      const topicId = `topic_${topic.column}`;
      if (!nodeMap.has(topicId)) {
        nodes.push({
          id: topicId,
          label: `Topic: ${topic.column}`,
          type: 'topic',
          size: 6,
        });
        nodeMap.set(topicId, true);
      }

      const topTerms = (topic.keywords ?? [])
        .slice(0, 3)
        .map((kw) => String(kw.term ?? '').trim())
        .filter((term) => term.length > 0);

      const columnNodeId = `col_${topic.column}`;
      if (nodeMap.has(columnNodeId)) {
        pushEdge({
          source: columnNodeId,
          target: topicId,
          type: 'topic',
          strength: 0.7,
          label: topTerms.join(', '),
        });
      }
    }

    // Topic similarity edges based on shared keywords
    for (const similarity of topicAnalysis.similarities) {
      const sourceId = `topic_${similarity.source}`;
      const targetId = `topic_${similarity.target}`;
      if (!nodeMap.has(sourceId) || !nodeMap.has(targetId)) continue;
      pushEdge({
        source: sourceId,
        target: targetId,
        type: 'topic_similarity',
        strength: similarity.similarity,
        label: `${Math.round(similarity.similarity * 100)}% · ${similarity.shared_terms.slice(0, 3).join(', ')}`,
      });
    }

    topicAnalysis.clusters.forEach((cluster) => {
      const clusterId = cluster.id;
      if (!nodeMap.has(clusterId)) {
        const headline = cluster.keywords.slice(0, 3).map((kw) => kw.term).join(', ') || 'Topic cluster';
        nodes.push({
          id: clusterId,
          label: `Cluster: ${headline}`,
          type: 'topic_cluster',
          size: 26 + cluster.columns.length * 2,
        });
        nodeMap.set(clusterId, true);
      }

      cluster.columns.forEach((columnName) => {
        const topicNodeId = `topic_${columnName}`;
        if (!nodeMap.has(topicNodeId)) return;
        pushEdge({
          source: clusterId,
          target: topicNodeId,
          type: 'topic_cluster',
          strength: Math.max(0.4, cluster.strength),
          label: cluster.keywords.slice(0, 2).map((kw) => kw.term).join(', '),
        });
      });
    });

    // Add correlation edges (only strong correlations for dense datasets)
    const correlations = analyses.filter(a => a.analysis_type === 'correlation');

    const sortedCorrelations = correlations
      .sort((a, b) => {
        const metricsA = extractCorrelationMetrics(a.result);
        const metricsB = extractCorrelationMetrics(b.result);
        return (metricsB.bestStrength ?? 0) - (metricsA.bestStrength ?? 0);
      })
      .slice(0, Math.min(60, correlations.length));

    for (const corr of sortedCorrelations) {
      const { column1, column2 } = corr.result;
      const source = `col_${column1}`;
      const target = `col_${column2}`;

      const { pearson, spearman, normalizedMI, bestStrength } = extractCorrelationMetrics(corr.result);
      if (!Number.isFinite(bestStrength) || bestStrength < 0.45) continue;
      if (columns.length > 50 && bestStrength < 0.6) continue;

      const labelParts: string[] = [];
      if (typeof pearson === 'number') {
        labelParts.push(`ρ=${pearson >= 0 ? '+' : ''}${pearson.toFixed(2)}`);
      }
      if (typeof spearman === 'number') {
        labelParts.push(`ρs=${spearman >= 0 ? '+' : ''}${spearman.toFixed(2)}`);
      }
      if (typeof normalizedMI === 'number' && normalizedMI > 0) {
        labelParts.push(`NMI=${normalizedMI.toFixed(2)}`);
      }

      pushEdge({
        source,
        target,
        type: 'correlation',
        strength: bestStrength,
        label: labelParts.slice(0, 3).join(' · ')
      });
    }

    // Add categorical association edges via Cramér's V
    const categoricalColumns = columns.filter((col: any) => isCategoricalColumn(col, totalRows));
    const associationCandidates: GraphEdge[] = [];

    for (let i = 0; i < categoricalColumns.length; i++) {
      const colA = categoricalColumns[i];
      for (let j = i + 1; j < categoricalColumns.length; j++) {
        const colB = categoricalColumns[j];

        const counts = new Map<string, Map<string, number>>();
        let valid = 0;

        for (const row of parsedDataRows) {
          const valueA = normalizeCategoricalValue(row.data[colA.name]);
          const valueB = normalizeCategoricalValue(row.data[colB.name]);
          if (valueA === null || valueB === null) continue;

          valid += 1;
          let rowMap = counts.get(valueA);
          if (!rowMap) {
            rowMap = new Map<string, number>();
            counts.set(valueA, rowMap);
          }
          rowMap.set(valueB, (rowMap.get(valueB) ?? 0) + 1);
        }

        if (valid < 30) continue;

        const rowTotals = new Map<string, number>();
        const colTotals = new Map<string, number>();

        counts.forEach((map, keyA) => {
          map.forEach((count, keyB) => {
            rowTotals.set(keyA, (rowTotals.get(keyA) ?? 0) + count);
            colTotals.set(keyB, (colTotals.get(keyB) ?? 0) + count);
          });
        });

        const rowCardinality = rowTotals.size;
        const colCardinality = colTotals.size;
        if (rowCardinality < 2 || colCardinality < 2) continue;

        const minDim = Math.min(rowCardinality - 1, colCardinality - 1);
        if (minDim <= 0) continue;

        let chiSquared = 0;
        counts.forEach((map, keyA) => {
          const rowTotal = rowTotals.get(keyA)!;
          map.forEach((count, keyB) => {
            const colTotal = colTotals.get(keyB)!;
            const expected = (rowTotal * colTotal) / valid;
            if (expected > 0) {
              const diff = count - expected;
              chiSquared += (diff * diff) / expected;
            }
          });
        });

        const cramersV = Math.sqrt(chiSquared / (valid * minDim));
        if (!Number.isFinite(cramersV) || cramersV < 0.25) continue;

        associationCandidates.push({
          source: `col_${colA.name}`,
          target: `col_${colB.name}`,
          type: 'association',
          strength: cramersV,
          label: `V=${cramersV.toFixed(2)}`,
        });
      }
    }

    associationCandidates
      .sort((a, b) => b.strength - a.strength)
      .slice(0, Math.min(40, associationCandidates.length))
      .forEach((edge) => pushEdge(edge));

    // Add pattern value nodes (for categorical columns with clear patterns)
    const patterns = analyses.filter(a => a.analysis_type === 'pattern' && (a.quality_score || 0) > 50);
    for (const pattern of patterns) {
      const colName = pattern.column_name;
      if (!colName) continue;

      const { topPatterns } = pattern.result;
      if (!topPatterns || topPatterns.length === 0) continue;

      // Add top 3 values as nodes
      const topValues = topPatterns.slice(0, 3).map((entry: any) => {
        if (Array.isArray(entry)) {
          return { value: entry[0], count: entry[1] ?? 0 };
        }
        return {
          value: entry.value ?? entry.label ?? '',
          count: entry.count ?? 0,
        };
      });

      for (const patternEntry of topValues) {
        const patternCount = Number(patternEntry.count ?? 0);
        const valueNodeId = `val_${colName}_${patternEntry.value}`;
        if (!nodeMap.has(valueNodeId)) {
          nodes.push({
            id: valueNodeId,
            label: String(patternEntry.value),
            type: 'value',
            size: 5 + (patternCount / Math.max(totalRows, 1)) * 20
          });
          nodeMap.set(valueNodeId, true);
        }

        // Edge from column to value
        pushEdge({
          source: `col_${colName}`,
          target: valueNodeId,
          type: 'contains',
          strength: patternCount / Math.max(totalRows, 1),
          label: `${patternCount}x`
        });
      }
    }

    return c.json({
      nodes,
      edges,
      dataset_name: dataset.name
    });

  } catch (error) {
    console.error('Relationship graph error:', error);
    return c.json({ error: 'Failed to generate relationship graph' }, 500);
  }
});

export default relationships;
