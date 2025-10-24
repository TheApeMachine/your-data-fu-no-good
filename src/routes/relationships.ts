// Relationship graph API

import { Hono } from 'hono';
import type { Bindings } from '../types';

const relationships = new Hono<{ Bindings: Bindings }>();

interface GraphNode {
  id: string;
  label: string;
  type: 'column' | 'value';
  size: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'correlation' | 'pattern' | 'contains';
  strength: number;
  label: string;
}

relationships.get('/:id', async (c) => {
  try {
    const datasetId = c.req.param('id');

    // Get dataset info
    const dataset = await c.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(datasetId).first();

    if (!dataset) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    const columns = JSON.parse(dataset.columns as string);

    // Get all analyses
    const analysesResult = await c.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(datasetId).all();

    const analyses = analysesResult.results.map(a => ({
      ...a,
      result: JSON.parse(a.result as string)
    }));

    // Build graph
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeMap = new Map<string, boolean>();

    // Add column nodes
    for (const col of columns) {
      const nodeId = `col_${col.name}`;
      if (!nodeMap.has(nodeId)) {
        // Size based on uniqueness (more unique = larger node)
        const uniqueRatio = col.unique_count / (dataset.row_count as number);
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

    // Add correlation edges (only strong correlations for dense datasets)
    const correlations = analyses.filter(a => a.analysis_type === 'correlation');
    
    // If too many correlations, only show the strongest ones
    const sortedCorrelations = correlations
      .sort((a, b) => Math.abs(b.result.correlation) - Math.abs(a.result.correlation))
      .slice(0, Math.min(50, correlations.length)); // Limit to top 50

    for (const corr of sortedCorrelations) {
      const { column1, column2, correlation } = corr.result;
      const source = `col_${column1}`;
      const target = `col_${column2}`;

      // Only show correlations > 0.6 for very dense datasets
      if (columns.length > 50 && Math.abs(correlation) < 0.7) continue;

      edges.push({
        source,
        target,
        type: 'correlation',
        strength: Math.abs(correlation),
        label: `${correlation > 0 ? '+' : ''}${correlation.toFixed(2)}`
      });
    }

    // Add pattern value nodes (for categorical columns with clear patterns)
    const patterns = analyses.filter(a => a.analysis_type === 'pattern' && (a.quality_score || 0) > 50);
    for (const pattern of patterns) {
      const colName = pattern.column_name;
      if (!colName) continue;

      const { topPatterns } = pattern.result;
      if (!topPatterns || topPatterns.length === 0) continue;

      // Add top 3 values as nodes
      const topValues = topPatterns.slice(0, 3);
      for (const [value, count] of topValues) {
        const valueNodeId = `val_${colName}_${value}`;
        if (!nodeMap.has(valueNodeId)) {
          nodes.push({
            id: valueNodeId,
            label: String(value),
            type: 'value',
            size: 5 + (count / (dataset.row_count as number)) * 20
          });
          nodeMap.set(valueNodeId, true);
        }

        // Edge from column to value
        edges.push({
          source: `col_${colName}`,
          target: valueNodeId,
          type: 'contains',
          strength: count / (dataset.row_count as number),
          label: `${count}x`
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
