// LLM Chat Interface for Conversational Insights

import { Hono } from 'hono';
import type { Bindings } from '../types';

const chat = new Hono<{ Bindings: Bindings }>();

chat.post('/:datasetId', async (c) => {
  try {
    const datasetId = c.req.param('datasetId');
    const { message, conversationHistory } = await c.req.json();

    // Fetch dataset context
    const dataset = await c.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(datasetId).first();

    if (!dataset) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    // Fetch analyses for context
    const analysesResult = await c.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ? ORDER BY quality_score DESC LIMIT 20
    `).bind(datasetId).all();

    const analyses = analysesResult.results.map(a => ({
      type: a.analysis_type,
      column: a.column_name,
      importance: a.importance,
      confidence: a.confidence,
      quality_score: a.quality_score,
      explanation: a.explanation,
      result: JSON.parse(a.result as string)
    }));

    // Build context for LLM
    const columns = JSON.parse(dataset.columns as string);
    const context = buildAnalysisContext(dataset, columns, analyses);

    // Prepare system prompt
    const systemPrompt = `You are a data analysis assistant helping users understand their dataset.

Dataset: ${dataset.name}
Rows: ${dataset.row_count}
Columns: ${dataset.column_count}

${context}

Your role:
- Explain findings in plain English
- Answer questions about patterns, correlations, outliers
- Suggest what to investigate next
- Provide statistical context when relevant
- Be concise but thorough

If asked about specific insights not in the context, politely explain what data you have access to.`;

    // Call OpenAI-compatible API (you'll need to provide an API endpoint)
    // For now, return a mock response structure
    const response = {
      message: `I understand you're asking: "${message}". Let me analyze the data...
      
Based on the ${analyses.length} insights I've found in your dataset with ${dataset.row_count} rows:

${generateInsightSummary(analyses, message)}

Would you like me to dive deeper into any specific finding?`,
      suggestions: [
        "What are the strongest correlations?",
        "Show me unusual patterns",
        "Which columns have the most outliers?",
        "Explain the most important finding"
      ]
    };

    return c.json(response);

  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ error: 'Chat failed: ' + (error as Error).message }, 500);
  }
});

function buildAnalysisContext(dataset: any, columns: any[], analyses: any[]): string {
  let context = `\nColumns:\n`;
  columns.slice(0, 20).forEach(col => {
    context += `- ${col.name} (${col.type}, ${col.unique_count} unique values)\n`;
  });
  
  if (columns.length > 20) {
    context += `... and ${columns.length - 20} more columns\n`;
  }

  context += `\nTop Insights:\n`;
  analyses.forEach((a, i) => {
    context += `${i + 1}. ${a.type.toUpperCase()}`;
    if (a.column) context += ` on "${a.column}"`;
    context += `: ${a.explanation}\n`;
    context += `   (${a.importance} importance, ${Math.round(a.confidence * 100)}% confidence, quality: ${a.quality_score?.toFixed(0) || 'N/A'})\n`;
  });

  return context;
}

function generateInsightSummary(analyses: any[], userQuestion: string): string {
  const questionLower = userQuestion.toLowerCase();
  
  // Check for correlation questions
  if (questionLower.includes('correlat') || questionLower.includes('relation')) {
    const correlations = analyses.filter(a => a.type === 'correlation');
    if (correlations.length > 0) {
      const strongest = correlations[0];
      return `The strongest correlation is between ${strongest.result.column1} and ${strongest.result.column2} with a coefficient of ${strongest.result.correlation.toFixed(2)}. ${strongest.explanation}`;
    }
  }
  
  // Check for outlier questions
  if (questionLower.includes('outlier') || questionLower.includes('unusual') || questionLower.includes('anomal')) {
    const outliers = analyses.filter(a => a.type === 'outlier');
    if (outliers.length > 0) {
      return `I found outliers in ${outliers.length} columns. The most significant is in "${outliers[0].column}": ${outliers[0].explanation}`;
    }
  }

  // Check for pattern questions
  if (questionLower.includes('pattern') || questionLower.includes('common')) {
    const patterns = analyses.filter(a => a.type === 'pattern');
    if (patterns.length > 0) {
      return `I discovered ${patterns.length} significant patterns. The strongest is in "${patterns[0].column}": ${patterns[0].explanation}`;
    }
  }

  // Check for trend questions
  if (questionLower.includes('trend') || questionLower.includes('chang') || questionLower.includes('over time')) {
    const trends = analyses.filter(a => a.type === 'trend');
    if (trends.length > 0) {
      return `I detected ${trends.length} trends. The most notable is in "${trends[0].column}": ${trends[0].explanation}`;
    }
  }

  // Check for "most important" questions
  if (questionLower.includes('important') || questionLower.includes('key') || questionLower.includes('main')) {
    const highImportance = analyses.filter(a => a.importance === 'high');
    if (highImportance.length > 0) {
      return `The most important finding is: ${highImportance[0].explanation} (${Math.round(highImportance[0].confidence * 100)}% confident)`;
    }
  }

  // Default response
  return `I have access to ${analyses.length} insights across your dataset. The highest quality finding is: ${analyses[0].explanation}`;
}

export default chat;
