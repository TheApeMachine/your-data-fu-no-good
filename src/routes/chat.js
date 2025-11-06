// LLM Chat Interface with OpenAI API and Function Calling
import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { resolveDatabase } from '../storage';
const chat = new Hono();
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
    },
    {
        type: 'function',
        function: {
            name: 'get_data_sample',
            description: 'Get a sample of actual data rows from the dataset',
            parameters: {
                type: 'object',
                properties: {
                    limit: {
                        type: 'number',
                        description: 'Number of rows to return (default: 5, max: 20)'
                    },
                    columns: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Specific columns to include (optional)'
                    }
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_missing_values',
            description: 'Get information about missing values in the dataset',
            parameters: {
                type: 'object',
                properties: {
                    min_missing_percentage: {
                        type: 'number',
                        description: 'Minimum percentage of missing values to include (optional, default: 0)'
                    }
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'suggest_data_cleaning',
            description: 'Get data cleaning suggestions for a specific column or the entire dataset',
            parameters: {
                type: 'object',
                properties: {
                    column_name: {
                        type: 'string',
                        description: 'Specific column to analyze (optional, analyzes entire dataset if not provided)'
                    }
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'generate_mongodb_query',
            description: 'Generate MongoDB query or aggregation pipeline based on natural language description. Use this when user wants to query MongoDB data or create aggregation pipelines.',
            parameters: {
                type: 'object',
                properties: {
                    description: {
                        type: 'string',
                        description: 'Natural language description of what the user wants to query (e.g., "Get all active users from last month" or "Group sales by category and sum totals")'
                    },
                    query_type: {
                        type: 'string',
                        description: 'Type of MongoDB operation',
                        enum: ['find', 'aggregate']
                    }
                },
                required: ['description', 'query_type']
            }
        }
    }
];
// Tool execution functions
async function executeGetOutlierColumns(db, datasetId, args) {
    const minCount = args.min_outlier_count || 1;
    const result = await db.prepare(`
    SELECT column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'outlier'
    ORDER BY quality_score DESC
  `).bind(datasetId).all();
    const outliers = result.results
        .map((r) => {
        const res = JSON.parse(r.result);
        return {
            column: r.column_name,
            count: res.count || 0,
            percentage: res.percentage || 0,
            explanation: r.explanation,
            quality_score: r.quality_score
        };
    })
        .filter((o) => o.count >= minCount);
    return {
        total_columns_with_outliers: outliers.length,
        outliers: outliers
    };
}
async function executeGetCorrelationAnalysis(db, datasetId, args) {
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
        .map((r) => {
        const res = JSON.parse(r.result);
        return {
            column: r.column_name,
            correlation: res.correlation || 0,
            target_column: res.target_column || 'unknown',
            explanation: r.explanation,
            quality_score: r.quality_score
        };
    })
        .filter((c) => Math.abs(c.correlation) >= minCorr);
    return {
        total_correlations: correlations.length,
        correlations: correlations
    };
}
async function executeGetColumnStatistics(db, datasetId, args) {
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
    const stats = {
        column: columnName,
        analyses: []
    };
    result.results.forEach((r) => {
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
async function executeSearchAnalyses(db, datasetId, args) {
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
        analyses: result.results.map((r) => ({
            type: r.analysis_type,
            column: r.column_name,
            result: JSON.parse(r.result),
            explanation: r.explanation,
            quality_score: r.quality_score
        }))
    };
}
async function executeGetDataSample(db, datasetId, args) {
    const limit = Math.min(args.limit || 5, 20);
    const columns = args.columns;
    const result = await db.prepare(`
    SELECT data FROM data_rows 
    WHERE dataset_id = ? 
    ORDER BY row_number 
    LIMIT ?
  `).bind(datasetId, limit).all();
    const rows = result.results.map((r) => JSON.parse(r.data));
    // Filter columns if specified
    if (columns && columns.length > 0) {
        return {
            rows: rows.map((row) => {
                const filtered = {};
                columns.forEach((col) => {
                    if (row.hasOwnProperty(col)) {
                        filtered[col] = row[col];
                    }
                });
                return filtered;
            }),
            row_count: rows.length
        };
    }
    return {
        rows: rows,
        row_count: rows.length
    };
}
async function executeGetMissingValues(db, datasetId, args) {
    const minPercentage = args.min_missing_percentage || 0;
    const result = await db.prepare(`
    SELECT analysis_type, column_name, result, explanation
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'missing'
  `).bind(datasetId).all();
    const missingData = result.results
        .map((r) => {
        const res = JSON.parse(r.result);
        return {
            column: r.column_name,
            count: res.count || 0,
            percentage: res.percentage || 0,
            explanation: r.explanation
        };
    })
        .filter((m) => m.percentage >= minPercentage);
    return {
        total_columns_with_missing: missingData.length,
        missing_values: missingData
    };
}
async function executeSuggestDataCleaning(db, datasetId, args) {
    const columnName = args.column_name;
    let query = `
    SELECT analysis_type, column_name, result, explanation
    FROM analyses 
    WHERE dataset_id = ?
  `;
    const params = [datasetId];
    if (columnName) {
        query += ` AND column_name = ?`;
        params.push(columnName);
    }
    const result = await db.prepare(query).bind(...params).all();
    const suggestions = [];
    result.results.forEach((r) => {
        const res = JSON.parse(r.result);
        const type = r.analysis_type;
        if (type === 'outlier' && res.count > 0) {
            suggestions.push({
                column: r.column_name,
                issue: 'outliers',
                severity: res.percentage > 10 ? 'high' : 'medium',
                suggestion: `Remove or cap ${res.count} outlier values (${res.percentage}% of data)`,
                details: r.explanation
            });
        }
        if (type === 'missing' && res.count > 0) {
            suggestions.push({
                column: r.column_name,
                issue: 'missing_values',
                severity: res.percentage > 20 ? 'high' : res.percentage > 5 ? 'medium' : 'low',
                suggestion: `Handle ${res.count} missing values (${res.percentage}%). Consider imputation or removal.`,
                details: r.explanation
            });
        }
        const modePercentage = res.modePercentage ?? res.mode_frequency;
        if (type === 'pattern' && modePercentage > 80) {
            suggestions.push({
                column: r.column_name,
                issue: 'low_variance',
                severity: 'low',
                suggestion: `Column has very low variance (${modePercentage}% same value). Consider removing if not meaningful.`,
                details: r.explanation
            });
        }
    });
    return {
        total_suggestions: suggestions.length,
        suggestions: suggestions.sort((a, b) => {
            const severityOrder = { high: 3, medium: 2, low: 1 };
            return (severityOrder[b.severity] || 0) -
                (severityOrder[a.severity] || 0);
        })
    };
}
async function executeGenerateMongoDBQuery(db, datasetId, args, apiKey, model) {
    const { description, query_type } = args;
    // Build a specialized prompt for MongoDB query generation
    const mongoPrompt = `You are a MongoDB query expert. Generate a valid MongoDB ${query_type === 'aggregate' ? 'aggregation pipeline' : 'query'} based on this description:

"${description}"

Guidelines:
1. For 'find' queries: Return a valid MongoDB query object (JSON)
2. For 'aggregate' pipelines: Return a valid MongoDB aggregation pipeline array (JSON)
3. Use common MongoDB operators: $match, $group, $project, $sort, $limit, $lookup, $unwind, etc.
4. Include helpful comments explaining each stage
5. Make realistic assumptions about field names if not specified
6. Return ONLY valid JSON - no markdown, no extra text

Examples:
Find query: {"status": "active", "createdAt": {"$gte": "2024-01-01"}}
Aggregate pipeline: [{"$match": {"status": "active"}}, {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}}]

Now generate the ${query_type === 'aggregate' ? 'pipeline' : 'query'}:`;
    try {
        // Call OpenAI to generate the query
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: 'You are a MongoDB query expert. Generate valid MongoDB queries and pipelines.' },
                    { role: 'user', content: mongoPrompt }
                ],
                max_tokens: 1000,
                temperature: 0.3 // Lower temperature for more precise code generation
            })
        });
        if (!openaiResponse.ok) {
            return {
                error: 'Failed to generate MongoDB query',
                description
            };
        }
        const data = await openaiResponse.json();
        const generatedText = data.choices?.[0]?.message?.content || '';
        // Try to extract JSON from the response
        let queryJson = generatedText.trim();
        // Remove markdown code blocks if present
        queryJson = queryJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        // Validate JSON
        let parsed;
        try {
            parsed = JSON.parse(queryJson);
        }
        catch (e) {
            return {
                error: 'Generated query is not valid JSON',
                raw_output: generatedText,
                description
            };
        }
        return {
            query_type,
            description,
            generated_query: parsed,
            explanation: `Generated MongoDB ${query_type === 'aggregate' ? 'aggregation pipeline' : 'query'} based on: "${description}"`,
            raw_json: queryJson,
            usage_example: query_type === 'aggregate'
                ? 'Use this in MongoDB import: paste into "Aggregation Pipeline" field'
                : 'Use this in MongoDB import: paste into "Query" field'
        };
    }
    catch (error) {
        return {
            error: error.message || 'Failed to generate MongoDB query',
            description
        };
    }
}
// Streaming chat endpoint
chat.post('/:datasetId/stream', async (c) => {
    const datasetId = c.req.param('datasetId');
    const { message, conversationHistory = [] } = await c.req.json();
    // Check if OpenAI API key is configured
    const apiKey = c.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('your-openai-api-key')) {
        return c.json({
            error: 'OpenAI API key not configured',
            message: 'Please configure your OpenAI API key'
        }, 500);
    }
    // Fetch dataset context
    const db = resolveDatabase(c.env);
    const dataset = await db.prepare(`SELECT * FROM datasets WHERE id = ?`).bind(datasetId).first();
    if (!dataset) {
        return c.json({ error: 'Dataset not found' }, 404);
    }
    const columns = JSON.parse(dataset.columns);
    const systemPrompt = `You are a friendly insight assistant for business users with limited data-science background.

Dataset name: ${dataset.name}
Rows: ${dataset.row_count}
Columns: ${dataset.column_count}

Available tools let you fetch precise facts (statistics, correlations, samples, data quality issues, cleaning tips, MongoDB queries). Use them when you need evidence, then translate the meaning into plain language.

Guidelines:
- Lead with the story, not the stats. Start every answer with 2–3 bullet points titled "What this means" that explain the impact or pattern in everyday words.
- Mention numbers only when they change the decision (round them sensibly, e.g. “about 84% missing”).
- Highlight data quality risks, but immediately suggest what the user could do about them (cleaning option, extra column to create, question to ask the data owner).
- Finish with a short "Suggested next steps" list (max 3 bullets) that keeps the user moving forward.
- Never dump raw tables or long lists of metrics. The user wants actionable intelligence, not diagnostics.
- If the user asks for a query or deeper dive, call the appropriate tool and summarise the result in the same approachable tone.

Keep answers concise (under 4 short paragraphs total) and make sure every piece of evidence is tied to why it matters.`;
    const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
    ];
    return stream(c, async (stream) => {
        const toolCallsUsed = [];
        let currentMessages = [...messages];
        const model = c.env.OPENAI_MODEL || 'gpt-4o-mini';
        // Tool calling loop
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
                    max_tokens: 1500,
                    temperature: 0.7,
                    stream: true
                })
            });
            if (!openaiResponse.ok) {
                await stream.write(`data: ${JSON.stringify({ error: 'OpenAI API error' })}\n\n`);
                return;
            }
            const reader = openaiResponse.body?.getReader();
            if (!reader) {
                await stream.write(`data: ${JSON.stringify({ error: 'No response body' })}\n\n`);
                return;
            }
            const decoder = new TextDecoder();
            let buffer = '';
            let toolCalls = [];
            let contentBuffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]')
                            continue;
                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices?.[0]?.delta;
                            if (delta?.tool_calls) {
                                // Accumulate tool calls
                                for (const tc of delta.tool_calls) {
                                    if (!toolCalls[tc.index]) {
                                        toolCalls[tc.index] = { id: tc.id, type: 'function', function: { name: '', arguments: '' } };
                                    }
                                    if (tc.function?.name)
                                        toolCalls[tc.index].function.name += tc.function.name;
                                    if (tc.function?.arguments)
                                        toolCalls[tc.index].function.arguments += tc.function.arguments;
                                }
                            }
                            else if (delta?.content) {
                                contentBuffer += delta.content;
                                await stream.write(`data: ${JSON.stringify({ type: 'content', content: delta.content })}\n\n`);
                            }
                        }
                        catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
            // Check if we have tool calls to execute
            if (toolCalls.length > 0) {
                await stream.write(`data: ${JSON.stringify({ type: 'tool_calls_start', count: toolCalls.length })}\n\n`);
                currentMessages.push({
                    role: 'assistant',
                    content: contentBuffer || null,
                    tool_calls: toolCalls
                });
                // Execute tools
                for (const toolCall of toolCalls) {
                    const functionName = toolCall.function.name;
                    const functionArgs = JSON.parse(toolCall.function.arguments);
                    toolCallsUsed.push({ name: functionName, args: functionArgs });
                    await stream.write(`data: ${JSON.stringify({ type: 'tool_call', name: functionName })}\n\n`);
                    let toolResult;
                    try {
                        switch (functionName) {
                            case 'get_outlier_columns':
                                toolResult = await executeGetOutlierColumns(db, datasetId, functionArgs);
                                break;
                            case 'get_correlation_analysis':
                                toolResult = await executeGetCorrelationAnalysis(db, datasetId, functionArgs);
                                break;
                            case 'get_column_statistics':
                                toolResult = await executeGetColumnStatistics(db, datasetId, functionArgs);
                                break;
                            case 'search_analyses':
                                toolResult = await executeSearchAnalyses(db, datasetId, functionArgs);
                                break;
                            case 'get_data_sample':
                                toolResult = await executeGetDataSample(db, datasetId, functionArgs);
                                break;
                            case 'get_missing_values':
                                toolResult = await executeGetMissingValues(db, datasetId, functionArgs);
                                break;
                            case 'suggest_data_cleaning':
                                toolResult = await executeSuggestDataCleaning(db, datasetId, functionArgs);
                                break;
                            case 'generate_mongodb_query':
                                toolResult = await executeGenerateMongoDBQuery(db, datasetId, functionArgs, apiKey, model);
                                break;
                            default:
                                toolResult = { error: `Unknown function: ${functionName}` };
                        }
                    }
                    catch (error) {
                        toolResult = { error: `Failed to execute ${functionName}` };
                    }
                    currentMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult)
                    });
                }
                contentBuffer = '';
                continue; // Next iteration with tool results
            }
            // No more tool calls, we're done
            break;
        }
        // Send tool calls used
        await stream.write(`data: ${JSON.stringify({ type: 'tool_calls_complete', tools: toolCallsUsed })}\n\n`);
        // Generate suggestions
        const suggestions = generateSuggestions(message, []);
        await stream.write(`data: ${JSON.stringify({ type: 'suggestions', suggestions })}\n\n`);
        await stream.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    });
});
// Main chat endpoint (non-streaming for compatibility)
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
        const db = resolveDatabase(c.env);
        const dataset = await db.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(datasetId).first();
        if (!dataset) {
            return c.json({ error: 'Dataset not found' }, 404);
        }
        // Build lightweight system prompt (since we have tools now)
        const columns = JSON.parse(dataset.columns);
        const systemPrompt = `You are a friendly insight assistant for business users with limited data-science background.

Dataset name: ${dataset.name}
Rows: ${dataset.row_count}
Columns: ${dataset.column_count}

Available tools let you fetch precise facts (statistics, correlations, samples, data quality issues, cleaning tips, MongoDB queries). Use them when you need evidence, then translate the meaning into plain language.

Guidelines:
- Lead with the story, not the stats. Start every answer with 2–3 bullet points titled "What this means" that explain the impact or pattern in everyday words.
- Mention numbers only when they change the decision (round them sensibly, e.g. “about 84% missing”).
- Highlight data quality risks, but immediately suggest what the user could do about them (cleaning option, extra column to create, question to ask the data owner).
- Finish with a short "Suggested next steps" list (max 3 bullets) that keeps the user moving forward.
- Never dump raw tables or long lists of metrics. The user wants actionable intelligence, not diagnostics.
- If the user asks for a query or deeper dive, call the appropriate tool and summarise the result in the same approachable tone.

Keep answers concise (under 4 short paragraphs total) and make sure every piece of evidence is tied to why it matters.`;
        // Build messages array
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message }
        ];
        // Call OpenAI API with tools
        const model = c.env.OPENAI_MODEL || 'gpt-4o-mini';
        console.log(`Calling OpenAI API with model: ${model} and ${tools.length} tools`);
        let assistantMessage = '';
        let currentMessages = [...messages];
        const toolCallsUsed = [];
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
                    max_tokens: 1500,
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
                    // Track tool calls for frontend display
                    toolCallsUsed.push({ name: functionName, args: functionArgs });
                    console.log(`Executing tool: ${functionName}`, functionArgs);
                    let toolResult;
                    try {
                        switch (functionName) {
                            case 'get_outlier_columns':
                                toolResult = await executeGetOutlierColumns(db, datasetId, functionArgs);
                                break;
                            case 'get_correlation_analysis':
                                toolResult = await executeGetCorrelationAnalysis(db, datasetId, functionArgs);
                                break;
                            case 'get_column_statistics':
                                toolResult = await executeGetColumnStatistics(db, datasetId, functionArgs);
                                break;
                            case 'search_analyses':
                                toolResult = await executeSearchAnalyses(db, datasetId, functionArgs);
                                break;
                            case 'get_data_sample':
                                toolResult = await executeGetDataSample(db, datasetId, functionArgs);
                                break;
                            case 'get_missing_values':
                                toolResult = await executeGetMissingValues(db, datasetId, functionArgs);
                                break;
                            case 'suggest_data_cleaning':
                                toolResult = await executeSuggestDataCleaning(db, datasetId, functionArgs);
                                break;
                            case 'generate_mongodb_query':
                                toolResult = await executeGenerateMongoDBQuery(db, datasetId, functionArgs, apiKey, model);
                                break;
                            default:
                                toolResult = { error: `Unknown function: ${functionName}` };
                        }
                    }
                    catch (error) {
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
            suggestions,
            tool_calls: toolCallsUsed
        });
    }
    catch (error) {
        console.error('Chat error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return c.json({
            error: 'Chat failed: ' + errorMessage,
            message: getFallbackResponse('error')
        }, 500);
    }
});
function generateSuggestions(userMessage, analyses) {
    const messageLower = userMessage.toLowerCase();
    const suggestions = [];
    if (messageLower.includes('outlier')) {
        suggestions.push("How should I clean the outliers?");
        suggestions.push("Show me correlations between outlier columns");
    }
    else if (messageLower.includes('correlat')) {
        suggestions.push("Which columns have the most outliers?");
        suggestions.push("Show me a data sample");
    }
    else if (messageLower.includes('clean')) {
        suggestions.push("Show me missing values");
        suggestions.push("What are the biggest data quality issues?");
    }
    else {
        suggestions.push("Which columns have outliers?");
        suggestions.push("Suggest data cleaning steps");
        suggestions.push("Show me the strongest correlations");
    }
    return suggestions.slice(0, 3);
}
function getFallbackResponse(message) {
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
