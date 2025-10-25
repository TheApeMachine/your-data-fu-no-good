// LLM Chat Interface with OpenAI API and Function Calling

import { Hono } from 'hono';
import type { Bindings } from '../types';

const chat = new Hono<{ Bindings: Bindings }>();

// Define tools that the LLM can use
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_outlier_columns',
      description: 'Get a list of all columns that have outliers detected, with counts and percentages',
      parameters: {
        type: 'object',
        properties: {
          min_outlier_count: {
            type: 'number',
            description: 'Minimum number of outliers to include (optional, default: 1)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_correlation_analysis',
      description: 'Get correlation analysis between columns, optionally filtered by minimum correlation strength',
      parameters: {
        type: 'object',
        properties: {
          min_correlation: {
            type: 'number',
            description: 'Minimum absolute correlation value to include (0-1, optional, default: 0.5)'
          },
          column_name: {
            type: 'string',
            description: 'Specific column to get correlations for (optional)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_column_statistics',
      description: 'Get detailed statistics for a specific column including mean, median, mode, outliers, etc.',
      parameters: {
        type: 'object',
        properties: {
          column_name: {
            type: 'string',
            description: 'Name of the column to analyze'
          }
        },
        required: ['column_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_analyses',
      description: 'Search all analyses by type or keyword',
      parameters: {
        type: 'object',
        properties: {
          analysis_type: {
            type: 'string',
            description: 'Type of analysis to filter (outlier, correlation, pattern, summary, etc.)',
            enum: ['outlier', 'correlation', 'pattern', 'summary', 'missing', 'distribution']
          },
          keyword: {
            type: 'string',
            description: 'Keyword to search in explanations (optional)'
          }
        }
      }
    }
  }
];

// Tool execution functions
async function executeGetOutlierColumns(db: any, datasetId: string, args: any) {
  const minCount = args.min_outlier_count || 1;
  
  const result = await db.prepare(`
    SELECT column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'outlier'
    ORDER BY quality_score DESC
  `).bind(datasetId).all();
  
  const outliers = result.results
    .map((r: any) => {
      const res = JSON.parse(r.result);
      return {
        column: r.column_name,
        count: res.count || 0,
        percentage: res.percentage || 0,
        explanation: r.explanation,
        quality_score: r.quality_score
      };
    })
    .filter((o: any) => o.count >= minCount);
  
  return {
    total_columns_with_outliers: outliers.length,
    outliers: outliers
  };
}

async function executeGetCorrelationAnalysis(db: any, datasetId: string, args: any) {
  const minCorr = args.min_correlation || 0.5;
  const columnName = args.column_name;
  
  let query = `
    SELECT column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'correlation'
  `;
  
  if (columnName) {
    query += ` AND column_name LIKE '%${columnName}%'`;
  }
  
  query += ` ORDER BY quality_score DESC`;
  
  const result = await db.prepare(query).bind(datasetId).all();
  
  const correlations = result.results
    .map((r: any) => {
      const res = JSON.parse(r.result);
      return {
        column: r.column_name,
        correlation: res.correlation || 0,
        target_column: res.target_column || 'unknown',
        explanation: r.explanation,
        quality_score: r.quality_score
      };
    })
    .filter((c: any) => Math.abs(c.correlation) >= minCorr);
  
  return {
    total_correlations: correlations.length,
    correlations: correlations
  };
}

async function executeGetColumnStatistics(db: any, datasetId: string, args: any) {
  const columnName = args.column_name;
  
  const result = await db.prepare(`
    SELECT analysis_type, column_name, result, explanation, importance, confidence, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND column_name = ?
    ORDER BY quality_score DESC
  `).bind(datasetId, columnName).all();
  
  if (result.results.length === 0) {
    return { error: `No analysis found for column: ${columnName}` };
  }
  
  const stats: any = {
    column: columnName,
    analyses: []
  };
  
  result.results.forEach((r: any) => {
    stats.analyses.push({
      type: r.analysis_type,
      result: JSON.parse(r.result),
      explanation: r.explanation,
      importance: r.importance,
      confidence: r.confidence,
      quality_score: r.quality_score
    });
  });
  
  return stats;
}

async function executeSearchAnalyses(db: any, datasetId: string, args: any) {
  const analysisType = args.analysis_type;
  const keyword = args.keyword;
  
  let query = `
    SELECT analysis_type, column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ?
  `;
  
  const params = [datasetId];
  
  if (analysisType) {
    query += ` AND analysis_type = ?`;
    params.push(analysisType);
  }
  
  if (keyword) {
    query += ` AND explanation LIKE ?`;
    params.push(`%${keyword}%`);
  }
  
  query += ` ORDER BY quality_score DESC LIMIT 50`;
  
  const result = await db.prepare(query).bind(...params).all();
  
  return {
    total_found: result.results.length,
    analyses: result.results.map((r: any) => ({
      type: r.analysis_type,
      column: r.column_name,
      result: JSON.parse(r.result),
      explanation: r.explanation,
      quality_score: r.quality_score
    }))
  };
}

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

    // Build lightweight system prompt (since we have tools now)
    const columns = JSON.parse(dataset.columns as string);
    const systemPrompt = `You are a data analysis assistant helping users understand their dataset.

Dataset: ${dataset.name}
Rows: ${dataset.row_count}
Columns: ${dataset.column_count}

Available columns: ${columns.slice(0, 50).map((c: any) => c.name).join(', ')}${columns.length > 50 ? `, ... and ${columns.length - 50} more` : ''}

You have access to tools to query specific analyses:
- get_outlier_columns: Find columns with outliers
- get_correlation_analysis: Find correlations between columns
- get_column_statistics: Get detailed stats for a specific column
- search_analyses: Search all analyses by type or keyword

Your role:
- Use tools to get specific data when asked
- Provide concrete answers with actual numbers from the tools
- Be concise but thorough (max 3-4 paragraphs)
- Use bullet points for lists
- Always cite specific results from tool calls

When users ask questions like "which columns have outliers?", use the get_outlier_columns tool to get the actual data.`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call OpenAI API with tools
    const model = c.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    console.log(`Calling OpenAI API with model: ${model} and tools`);
    
    let assistantMessage = '';
    let toolCalls: any[] = [];
    let currentMessages = [...messages];
    
    // Tool calling loop (max 5 iterations to prevent infinite loops)
    for (let iteration = 0; iteration < 5; iteration++) {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: currentMessages,
          tools,
          tool_choice: 'auto',
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      const responseText = await openaiResponse.text();
      
      if (!openaiResponse.ok) {
        console.error('OpenAI API error status:', openaiResponse.status);
        console.error('OpenAI API error response:', responseText);
        return c.json({ 
          error: 'Failed to get response from OpenAI',
          message: getFallbackResponse(message)
        }, 500);
      }

      const data = JSON.parse(responseText);
      const choice = data.choices?.[0];
      
      if (!choice) {
        console.error('No choice in OpenAI response:', data);
        return c.json({ 
          error: 'Empty response from OpenAI',
          message: getFallbackResponse(message)
        }, 500);
      }

      const responseMessage = choice.message;
      
      // Check if there are tool calls
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        console.log(`Tool calls requested: ${responseMessage.tool_calls.length}`);
        
        // Add assistant message with tool calls to conversation
        currentMessages.push(responseMessage);
        
        // Execute each tool call
        for (const toolCall of responseMessage.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);
          
          console.log(`Executing tool: ${functionName}`, functionArgs);
          
          let toolResult;
          try {
            switch (functionName) {
              case 'get_outlier_columns':
                toolResult = await executeGetOutlierColumns(c.env.DB, datasetId, functionArgs);
                break;
              case 'get_correlation_analysis':
                toolResult = await executeGetCorrelationAnalysis(c.env.DB, datasetId, functionArgs);
                break;
              case 'get_column_statistics':
                toolResult = await executeGetColumnStatistics(c.env.DB, datasetId, functionArgs);
                break;
              case 'search_analyses':
                toolResult = await executeSearchAnalyses(c.env.DB, datasetId, functionArgs);
                break;
              default:
                toolResult = { error: `Unknown function: ${functionName}` };
            }
          } catch (error) {
            console.error(`Tool execution error for ${functionName}:`, error);
            toolResult = { error: `Failed to execute ${functionName}: ${error}` };
          }
          
          // Add tool result to conversation
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult)
          });
        }
        
        // Continue loop to get final response
        continue;
      }
      
      // No more tool calls, we have the final response
      assistantMessage = responseMessage.content || '';
      break;
    }

    if (!assistantMessage) {
      return c.json({ 
        error: 'No final response from OpenAI',
        message: getFallbackResponse(message)
      }, 500);
    }

    // Generate smart suggestions
    const suggestions = generateSuggestions(message, []);

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

function generateSuggestions(userMessage: string, analyses: any[]): string[] {
  const messageLower = userMessage.toLowerCase();
  const suggestions: string[] = [];

  if (messageLower.includes('outlier')) {
    suggestions.push("Show me correlations between outlier columns");
    suggestions.push("What patterns exist in the outliers?");
  } else if (messageLower.includes('correlat')) {
    suggestions.push("Which columns have the most outliers?");
    suggestions.push("Are there patterns in categorical data?");
  } else {
    suggestions.push("Which columns have outliers?");
    suggestions.push("Show me the strongest correlations");
    suggestions.push("What are the key patterns?");
  }

  return suggestions.slice(0, 3);
}

function getFallbackResponse(message: string): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('outlier')) {
    return "To see outliers, go to the 'Insights' tab and search for 'outlier'.";
  }
  
  if (messageLower.includes('correlat')) {
    return "Check the 'Insights' tab and search for 'correlation'.";
  }

  return "I'm currently operating in fallback mode. Please configure your OpenAI API key.";
}

export default chat;
