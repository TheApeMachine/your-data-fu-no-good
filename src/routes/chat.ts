// LLM Chat Interface with OpenAI API

import { Hono } from 'hono';
import type { Bindings } from '../types';

const chat = new Hono<{ Bindings: Bindings }>();

chat.post('/:datasetId', async (c) => {
  try {
    const datasetId = c.req.param('datasetId');
    const { message, conversationHistory = [] } = await c.req.json();

    // Check if OpenAI API key is configured
    const apiKey = c.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('your-openai-api-key')) {
      return c.json({ 
        error: 'OpenAI API key not configured',
        message: getFallbackResponse(message)
      }, 500);
    }

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
- Explain findings in plain, conversational English
- Answer questions about patterns, correlations, outliers
- Provide specific numbers and examples from the data
- Suggest what to investigate next
- Be concise but thorough (max 3-4 paragraphs)
- Use bullet points for lists

If asked about specific insights not in the context, politely explain what data you have access to.`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call OpenAI API with proper error handling
    const model = c.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    console.log(`Calling OpenAI API with model: ${model}`);
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    // Get response text first for better error handling
    const responseText = await openaiResponse.text();
    
    if (!openaiResponse.ok) {
      console.error('OpenAI API error status:', openaiResponse.status);
      console.error('OpenAI API error response:', responseText);
      
      // Parse error if possible
      let errorMessage = 'Failed to get response from OpenAI';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // Keep default message
      }
      
      return c.json({ 
        error: errorMessage,
        message: getFallbackResponse(message)
      }, 500);
    }

    // Parse successful response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      return c.json({ 
        error: 'Invalid response from OpenAI',
        message: getFallbackResponse(message)
      }, 500);
    }

    const assistantMessage = data.choices?.[0]?.message?.content;
    
    if (!assistantMessage) {
      console.error('No message in OpenAI response:', data);
      return c.json({ 
        error: 'Empty response from OpenAI',
        message: getFallbackResponse(message)
      }, 500);
    }

    // Generate smart suggestions based on question and response
    const suggestions = generateSuggestions(message, analyses);

    return c.json({
      message: assistantMessage,
      suggestions
    });

  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ 
      error: 'Chat failed: ' + errorMessage,
      message: getFallbackResponse('error')
    }, 500);
  }
});

function buildAnalysisContext(dataset: any, columns: any[], analyses: any[]): string {
  let context = `\nColumns (showing first 30):\n`;
  columns.slice(0, 30).forEach(col => {
    context += `- ${col.name} (${col.type}, ${col.unique_count} unique values)\n`;
  });
  
  if (columns.length > 30) {
    context += `... and ${columns.length - 30} more columns\n`;
  }

  context += `\nTop ${Math.min(20, analyses.length)} Insights (sorted by quality):\n`;
  analyses.forEach((a, i) => {
    context += `\n${i + 1}. ${a.type.toUpperCase()}`;
    if (a.column) context += ` on "${a.column}"`;
    context += `:\n`;
    context += `   ${a.explanation}\n`;
    context += `   Importance: ${a.importance}, Confidence: ${Math.round(a.confidence * 100)}%, Quality: ${a.quality_score?.toFixed(0) || 'N/A'}\n`;
    
    // Add specific details for different types
    if (a.type === 'correlation' && a.result.correlation) {
      context += `   Correlation coefficient: ${a.result.correlation.toFixed(3)}\n`;
    }
    if (a.type === 'outlier' && a.result.count) {
      context += `   Outliers found: ${a.result.count} rows\n`;
    }
  });

  return context;
}

function generateSuggestions(userMessage: string, analyses: any[]): string[] {
  const messageLower = userMessage.toLowerCase();
  const suggestions: string[] = [];

  // If they asked about correlations, suggest other analysis types
  if (messageLower.includes('correlat') || messageLower.includes('relation')) {
    suggestions.push("Are there any unusual outliers?");
    suggestions.push("What patterns exist in categorical data?");
  } 
  // If they asked about outliers, suggest correlations
  else if (messageLower.includes('outlier') || messageLower.includes('unusual')) {
    suggestions.push("What are the strongest correlations?");
    suggestions.push("Show me trends over time");
  }
  // If they asked about patterns, suggest trends
  else if (messageLower.includes('pattern')) {
    suggestions.push("Are there any trends in the data?");
    suggestions.push("Which columns are most correlated?");
  }
  // Default suggestions
  else {
    suggestions.push("What's the most important finding?");
    suggestions.push("Which columns have outliers?");
    suggestions.push("Show me strong correlations");
  }

  // Add a "dive deeper" suggestion if we have high-quality insights
  const highQuality = analyses.filter(a => (a.quality_score || 0) > 70);
  if (highQuality.length > 0 && suggestions.length < 4) {
    suggestions.push(`Tell me more about ${highQuality[0].column || 'the top finding'}`);
  }

  return suggestions.slice(0, 3); // Return max 3 suggestions
}

function getFallbackResponse(message: string): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('correlat') || messageLower.includes('relation')) {
    return "I found several correlations in your data. Check the 'Insights' tab and search for 'correlation' to see the strongest relationships between columns.";
  }
  
  if (messageLower.includes('outlier') || messageLower.includes('unusual')) {
    return "To see outliers, go to the 'Insights' tab and search for 'outlier'. I've highlighted unusual values in several columns.";
  }

  if (messageLower.includes('pattern')) {
    return "Patterns have been detected in your categorical columns. Search for 'pattern' in the Insights tab to see frequency distributions.";
  }

  return "I'm currently operating in fallback mode. To enable full AI chat, please configure your OpenAI API key in the .dev.vars file (for local) or as an environment variable (for production).";
}

export default chat;
