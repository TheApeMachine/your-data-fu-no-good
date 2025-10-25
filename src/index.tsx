import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import type { Bindings } from './types';

// Import routes
import upload from './routes/upload';
import mongodbUpload from './routes/mongodb-upload';
import datasets from './routes/datasets';
import analyze from './routes/analyze';
import relationships from './routes/relationships';
import mappings from './routes/mappings';
import chat from './routes/chat';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for API routes
app.use('/api/*', cors());

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// MongoDB query generation endpoint (standalone, no dataset needed)
app.post('/api/chat/generate-query', async (c) => {
  try {
    const { description, query_type } = await c.req.json();
    
    const apiKey = c.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('your-openai-api-key')) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    const model = c.env.OPENAI_MODEL || 'gpt-4o-mini';
    const mongoPrompt = `You are a MongoDB query expert. Generate a valid MongoDB ${query_type === 'aggregate' ? 'aggregation pipeline' : 'query'} based on this description:

"${description}"

Guidelines:
1. For 'find' queries: Return a valid MongoDB query object (JSON)
2. For 'aggregate' pipelines: Return a valid MongoDB aggregation pipeline array (JSON)
3. Use common MongoDB operators: $match, $group, $project, $sort, $limit, $lookup, $unwind, etc.
4. Make realistic assumptions about field names if not specified
5. Return ONLY valid JSON - no markdown, no extra text

Examples:
Find query: {"status": "active", "createdAt": {"$gte": "2024-01-01"}}
Aggregate pipeline: [{"$match": {"status": "active"}}, {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}}]

Now generate the ${query_type === 'aggregate' ? 'pipeline' : 'query'}:`;

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
        temperature: 0.3
      })
    });

    if (!openaiResponse.ok) {
      return c.json({ error: 'Failed to generate MongoDB query' }, 500);
    }

    const data = await openaiResponse.json();
    const generatedText = data.choices?.[0]?.message?.content || '';
    
    let queryJson = generatedText.trim();
    queryJson = queryJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(queryJson);
      return c.json({ 
        generated_query: parsed,
        query_type,
        description 
      });
    } catch (e) {
      return c.json({ 
        error: 'Generated query is not valid JSON',
        raw_output: generatedText 
      }, 400);
    }

  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to generate query' }, 500);
  }
});

// API routes
app.route('/api/upload', upload);
app.route('/api/upload/mongodb', mongodbUpload);
app.route('/api/datasets', datasets);
app.route('/api/analyze', analyze);
app.route('/api/relationships', relationships);
app.route('/api/mappings', mappings);
app.route('/api/chat', chat);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Data Intelligence Platform</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script src="https://unpkg.com/cytoscape@3.28.1/dist/cytoscape.min.js"></script>
        <style>
          :root {
            --bg-primary: #e0e5ec;
            --bg-secondary: #ffffff;
            --text-primary: #2c3e50;
            --text-secondary: #6b7280;
            --accent: #3b82f6;
            --shadow-light: #ffffff;
            --shadow-dark: #a3b1c6;
          }

          [data-theme="dark"] {
            --bg-primary: #1e293b;
            --bg-secondary: #0f172a;
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --accent: #60a5fa;
            --shadow-light: #2d3e54;
            --shadow-dark: #0a1120;
          }

          * {
            transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
          }

          body {
            background: var(--bg-primary);
            color: var(--text-primary);
          }

          /* Neumorphism Styles */
          .neu-card {
            background: var(--bg-primary);
            border-radius: 20px;
            box-shadow: 8px 8px 16px var(--shadow-dark),
                        -8px -8px 16px var(--shadow-light);
          }

          .neu-card-inset {
            background: var(--bg-primary);
            border-radius: 20px;
            box-shadow: inset 8px 8px 16px var(--shadow-dark),
                        inset -8px -8px 16px var(--shadow-light);
          }

          .neu-button {
            background: var(--bg-primary);
            border-radius: 12px;
            box-shadow: 4px 4px 8px var(--shadow-dark),
                        -4px -4px 8px var(--shadow-light);
            border: none;
            padding: 12px 24px;
            cursor: pointer;
            font-weight: 600;
            color: var(--text-primary);
          }

          .neu-button:hover {
            box-shadow: 2px 2px 4px var(--shadow-dark),
                        -2px -2px 4px var(--shadow-light);
          }

          .neu-button:active {
            box-shadow: inset 4px 4px 8px var(--shadow-dark),
                        inset -4px -4px 8px var(--shadow-light);
          }

          .neu-button-accent {
            background: linear-gradient(145deg, var(--accent), #2563eb);
            color: white;
            box-shadow: 4px 4px 8px var(--shadow-dark),
                        -4px -4px 8px var(--shadow-light);
          }

          .upload-area {
            border: 2px dashed var(--text-secondary);
            transition: all 0.3s;
          }

          .upload-area.drag-over {
            border-color: var(--accent);
            background-color: var(--bg-secondary);
          }

          .insight-card {
            animation: slideIn 0.5s ease-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Tab Styles */
          .tab-btn {
            background: var(--bg-primary);
            border-radius: 12px;
            padding: 12px 24px;
            cursor: pointer;
            font-weight: 600;
            color: var(--text-primary);
            box-shadow: 4px 4px 8px var(--shadow-dark),
                        -4px -4px 8px var(--shadow-light);
          }

          .tab-btn.active {
            background: linear-gradient(145deg, var(--accent), #2563eb);
            color: white;
            box-shadow: inset 4px 4px 8px rgba(0,0,0,0.2),
                        inset -4px -4px 8px rgba(255,255,255,0.1);
          }

          /* Dark mode toggle */
          .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
          }

          /* Print styles */
          @media print {
            body { background: white; }
            .no-print { display: none !important; }
            .neu-card { box-shadow: none; border: 1px solid #e5e7eb; }
          }
        </style>
    </head>
    <body>
        <!-- Theme Toggle -->
        <button onclick="toggleTheme()" class="theme-toggle neu-button">
            <i id="theme-icon" class="fas fa-moon"></i>
        </button>

        <div class="min-h-screen p-8">
            <!-- Header -->
            <header class="neu-card p-6 mb-8 no-print">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold">
                            <i class="fas fa-brain mr-3" style="color: var(--accent);"></i>
                            Data Intelligence Platform
                        </h1>
                        <p class="text-sm mt-2" style="color: var(--text-secondary);">
                            Upload → Analyze → Understand. Automated insights from your data.
                        </p>
                    </div>
                    <button id="view-datasets" class="neu-button">
                        <i class="fas fa-database mr-2"></i>My Datasets
                    </button>
                </div>
            </header>

            <!-- Main Content -->
            <main>
                <!-- Upload Section -->
                <div id="upload-section" class="mb-8">
                    <div class="neu-card p-8">
                        <h2 class="text-2xl font-bold mb-4">
                            <i class="fas fa-upload mr-2" style="color: var(--accent);"></i>
                            Upload Your Data
                        </h2>
                        <p class="mb-6" style="color: var(--text-secondary);">
                            Choose your data source: upload a file or import from MongoDB Atlas.
                        </p>

                        <!-- Upload Method Tabs -->
                        <div class="flex gap-3 mb-6">
                            <button onclick="switchUploadMethod('file')" id="tab-upload-file" class="neu-button flex-1" style="background: var(--accent); color: white;">
                                <i class="fas fa-file-upload mr-2"></i>File Upload
                            </button>
                            <button onclick="switchUploadMethod('mongodb')" id="tab-upload-mongodb" class="neu-button flex-1">
                                <i class="fas fa-database mr-2"></i>MongoDB Import
                            </button>
                        </div>

                        <!-- File Upload UI -->
                        <div id="file-upload-area" class="upload-method-area">
                            <div id="upload-area" class="upload-area neu-card-inset rounded-lg p-12 text-center cursor-pointer">
                                <input type="file" id="file-input" accept=".csv,.json" class="hidden">
                                <div id="upload-prompt">
                                    <i class="fas fa-cloud-upload-alt text-6xl mb-4" style="color: var(--text-secondary);"></i>
                                    <p class="text-xl mb-2">Drop your file here or click to browse</p>
                                    <p class="text-sm" style="color: var(--text-secondary);">Supports CSV and JSON files</p>
                                </div>
                                <div id="upload-progress" class="hidden">
                                    <i class="fas fa-spinner fa-spin text-4xl mb-4" style="color: var(--accent);"></i>
                                    <p id="status-message" class="text-lg font-semibold">Uploading...</p>
                                    <p id="status-detail" class="text-sm mt-2" style="color: var(--text-secondary);"></p>
                                    <div class="mt-4 w-64 mx-auto neu-card-inset rounded-full h-3">
                                        <div id="progress-bar" class="h-3 rounded-full transition-all duration-300" 
                                             style="width: 0%; background: linear-gradient(90deg, var(--accent), #2563eb);"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- MongoDB Import UI -->
                        <div id="mongodb-import-area" class="upload-method-area hidden">
                            <div class="neu-card-inset p-6 rounded-lg">
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">
                                            <i class="fas fa-link mr-1"></i>Connection String
                                        </label>
                                        <input type="text" id="mongodb-connection-string" 
                                               placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
                                               class="w-full p-3 rounded-lg neu-card-inset" 
                                               style="background: var(--bg-primary); color: var(--text-primary); border: none;">
                                        <p class="text-xs mt-1" style="color: var(--text-secondary);">
                                            Your MongoDB Atlas connection string (stored securely, not persisted)
                                        </p>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">
                                                <i class="fas fa-database mr-1"></i>Database
                                            </label>
                                            <input type="text" id="mongodb-database" placeholder="myDatabase"
                                                   class="w-full p-3 rounded-lg neu-card-inset" 
                                                   style="background: var(--bg-primary); color: var(--text-primary); border: none;">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">
                                                <i class="fas fa-table mr-1"></i>Collection
                                            </label>
                                            <input type="text" id="mongodb-collection" placeholder="myCollection"
                                                   class="w-full p-3 rounded-lg neu-card-inset" 
                                                   style="background: var(--bg-primary); color: var(--text-primary); border: none;">
                                        </div>
                                    </div>

                                    <!-- AI Query Generator -->
                                    <div class="neu-card p-4 rounded-lg" style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2);">
                                        <div class="flex items-start gap-3 mb-3">
                                            <i class="fas fa-robot text-2xl" style="color: var(--accent);"></i>
                                            <div class="flex-1">
                                                <h4 class="font-semibold mb-1" style="color: var(--text-primary);">AI Query Helper</h4>
                                                <p class="text-xs mb-2" style="color: var(--text-secondary);">
                                                    Describe what you want to query in plain English, and AI will generate the MongoDB syntax for you!
                                                </p>
                                                <input type="text" id="mongodb-ai-prompt" 
                                                       placeholder='e.g., "Find all active users from last month" or "Group sales by category and sum totals"'
                                                       class="w-full p-2 rounded-lg neu-card-inset text-sm mb-2" 
                                                       style="background: var(--bg-primary); color: var(--text-primary); border: none;">
                                                <div class="flex gap-2">
                                                    <button onclick="generateMongoDBQuery('find')" class="neu-button text-xs px-3 py-1">
                                                        <i class="fas fa-magic mr-1"></i>Generate Query
                                                    </button>
                                                    <button onclick="generateMongoDBQuery('aggregate')" class="neu-button text-xs px-3 py-1">
                                                        <i class="fas fa-code-branch mr-1"></i>Generate Pipeline
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">
                                            <i class="fas fa-filter mr-1"></i>Query (optional)
                                        </label>
                                        <textarea id="mongodb-query" rows="3" placeholder='{"status": "active"}'
                                                  class="w-full p-3 rounded-lg neu-card-inset font-mono text-sm" 
                                                  style="background: var(--bg-primary); color: var(--text-primary); border: none;"></textarea>
                                        <p class="text-xs mt-1" style="color: var(--text-secondary);">
                                            MongoDB query object (JSON format)
                                        </p>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">
                                            <i class="fas fa-code-branch mr-1"></i>Aggregation Pipeline (optional)
                                        </label>
                                        <textarea id="mongodb-pipeline" rows="5" placeholder='[{"$match": {"status": "active"}}, {"$group": {"_id": "$category", "count": {"$sum": 1}}}]'
                                                  class="w-full p-3 rounded-lg neu-card-inset font-mono text-sm" 
                                                  style="background: var(--bg-primary); color: var(--text-primary); border: none;"></textarea>
                                        <p class="text-xs mt-1" style="color: var(--text-secondary);">
                                            MongoDB aggregation pipeline (JSON array format)
                                        </p>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">
                                            <i class="fas fa-list-ol mr-1"></i>Limit
                                        </label>
                                        <input type="number" id="mongodb-limit" value="10000" min="1" max="10000"
                                               class="w-full p-3 rounded-lg neu-card-inset" 
                                               style="background: var(--bg-primary); color: var(--text-primary); border: none;">
                                        <p class="text-xs mt-1" style="color: var(--text-secondary);">
                                            Maximum number of documents to import (max: 10,000)
                                        </p>
                                    </div>

                                    <div class="flex gap-3 pt-4">
                                        <button onclick="testMongoDBConnection()" class="neu-button flex-1">
                                            <i class="fas fa-plug mr-2"></i>Test Connection
                                        </button>
                                        <button onclick="importFromMongoDB()" class="neu-button-accent flex-1">
                                            <i class="fas fa-download mr-2"></i>Import Data
                                        </button>
                                    </div>

                                    <div id="mongodb-status" class="hidden mt-4 p-4 rounded-lg neu-card-inset">
                                        <p id="mongodb-status-message" class="text-sm"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Results Section -->
                <div id="results-section" class="hidden">
                    <!-- Export Actions -->
                    <div class="mb-6 flex justify-between items-center no-print">
                        <div class="flex gap-3">
                            <button id="tab-insights" onclick="switchTab('insights')" class="tab-btn active">
                                <i class="fas fa-lightbulb mr-2"></i>Insights
                            </button>
                            <button id="tab-relationships" onclick="switchTab('relationships')" class="tab-btn">
                                <i class="fas fa-project-diagram mr-2"></i>Relationships
                            </button>
                            <button id="tab-mappings" onclick="switchTab('mappings')" class="tab-btn">
                                <i class="fas fa-link mr-2"></i>Column Mappings
                            </button>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="window.print()" class="neu-button-accent">
                                <i class="fas fa-file-pdf mr-2"></i>Export PDF
                            </button>
                            <button onclick="showSection('upload')" class="neu-button">
                                <i class="fas fa-plus mr-2"></i>New Analysis
                            </button>
                        </div>
                    </div>

                    <!-- Dataset Info -->
                    <div class="neu-card p-6 mb-6">
                        <h2 class="text-2xl font-bold mb-4">
                            <i class="fas fa-info-circle mr-2" style="color: var(--accent);"></i>
                            Dataset Overview
                        </h2>
                        <div id="dataset-info" class="grid grid-cols-1 md:grid-cols-4 gap-4"></div>
                    </div>

                    <!-- Insights Tab -->
                    <div id="tab-content-insights">
                        <!-- Search and Filter Bar -->
                        <div class="neu-card p-4 mb-6 no-print">
                            <div class="flex gap-3 items-center">
                                <div class="flex-1 neu-card-inset rounded-lg p-2 flex items-center">
                                    <i class="fas fa-search mx-3" style="color: var(--text-secondary);"></i>
                                    <input type="text" id="insight-search" 
                                           placeholder="Search insights, columns, patterns..." 
                                           onkeyup="debouncedSearch(this.value)"
                                           class="flex-1 bg-transparent border-none outline-none"
                                           style="color: var(--text-primary);">
                                </div>
                                <button onclick="showBookmarked()" class="neu-button" title="Show Bookmarked">
                                    <i class="fas fa-star mr-2" style="color: #f59e0b;"></i>Bookmarked
                                </button>
                                <button onclick="filterInsights('')" class="neu-button" title="Clear Filters">
                                    <i class="fas fa-redo mr-2"></i>Reset
                                </button>
                            </div>
                            <p id="search-result-count" class="text-sm mt-2" style="color: var(--text-secondary);"></p>
                        </div>

                        <!-- Visualizations -->
                        <div class="neu-card p-6 mb-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-chart-line mr-2" style="color: #a855f7;"></i>
                                Visual Insights
                            </h2>
                            <div id="visualizations-container" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
                        </div>

                        <!-- Key Insights -->
                        <div class="neu-card p-6 mb-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-lightbulb mr-2" style="color: #f59e0b;"></i>
                                Key Insights
                            </h2>
                            <div id="insights-container" class="space-y-4"></div>
                        </div>

                        <!-- Sample Data -->
                        <div class="neu-card p-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-table mr-2" style="color: #10b981;"></i>
                                Sample Data
                            </h2>
                            <div id="sample-data" class="overflow-x-auto"></div>
                        </div>
                    </div>

                    <!-- Relationships Tab -->
                    <div id="tab-content-relationships" class="hidden">
                        <div class="neu-card p-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-project-diagram mr-2" style="color: #a855f7;"></i>
                                Interactive Relationship Graph
                            </h2>
                            <p class="mb-4" style="color: var(--text-secondary);">
                                This graph shows how columns relate to each other. Click and drag to explore. 
                                Thicker lines mean stronger relationships.
                            </p>
                            <div id="graph-container" class="neu-card-inset rounded-lg p-4" style="height: 600px;"></div>
                        </div>
                    </div>

                    <!-- Mappings Tab -->
                    <div id="tab-content-mappings" class="hidden">
                        <div class="neu-card p-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-link mr-2" style="color: #3b82f6;"></i>
                                Column Mappings
                            </h2>
                            <p class="mb-4" style="color: var(--text-secondary);">
                                These mappings tell the system how to replace ID columns with human-readable names in visualizations.
                                Auto-detected mappings are marked with a green badge.
                            </p>
                            <div id="mappings-container"></div>
                        </div>
                    </div>
                </div>

                <!-- Datasets List -->
                <div id="datasets-section" class="hidden">
                    <div class="neu-card p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">
                                <i class="fas fa-database mr-2" style="color: var(--accent);"></i>
                                Your Datasets
                            </h2>
                            <button id="back-to-upload" class="neu-button-accent">
                                <i class="fas fa-plus mr-2"></i>New Upload
                            </button>
                        </div>
                        <div id="datasets-list"></div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Chat Widget -->
        <div id="chat-widget" class="hidden fixed bottom-20 right-8 w-96 h-[32rem] neu-card flex flex-col no-print" style="z-index: 1000;">
            <div class="p-4 border-b flex items-center justify-between" style="border-color: var(--shadow-dark);">
                <div class="flex items-center gap-2">
                    <i class="fas fa-brain" style="color: var(--accent);"></i>
                    <h3 class="font-semibold" style="color: var(--text-primary);">Data Assistant</h3>
                </div>
                <button onclick="clearChat()" class="neu-button p-2" title="Clear Chat">
                    <i class="fas fa-redo text-sm"></i>
                </button>
            </div>
            <div id="chat-messages" class="flex-1 overflow-y-auto p-4" style="background: var(--bg-primary);">
                <div class="flex items-start gap-3 mb-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--accent); color: white;">
                        <i class="fas fa-brain text-sm"></i>
                    </div>
                    <div class="neu-card px-4 py-2 max-w-[80%]" style="color: var(--text-primary);">
                        <p class="mb-3">👋 Hi! I'm your data analysis assistant. I can help you understand patterns, correlations, and insights in your data.</p>
                        <p class="text-sm" style="color: var(--text-secondary);">💡 <strong>Tip:</strong> To enable AI-powered responses, add your OpenAI API key to <code>.dev.vars</code> file. See <a href="https://github.com/yourusername/webapp/blob/main/OPENAI_SETUP.md" target="_blank" class="underline" style="color: var(--accent);">OPENAI_SETUP.md</a> for instructions.</p>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t flex gap-2" style="border-color: var(--shadow-dark);">
                <input type="text" id="chat-input" 
                       placeholder="Ask about your data..." 
                       class="flex-1 neu-card-inset rounded-lg px-4 py-2 bg-transparent border-none outline-none"
                       style="color: var(--text-primary);">
                <button onclick="sendChatMessage()" class="neu-button-accent px-4 py-2">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>

        <!-- Chat Toggle Button -->
        <button id="chat-toggle-btn" onclick="toggleChat()" 
                class="fixed bottom-8 right-8 w-14 h-14 neu-button-accent rounded-full flex items-center justify-center no-print"
                style="z-index: 999;">
            <i class="fas fa-comments text-xl"></i>
        </button>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          // Theme management
          function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = document.getElementById('theme-icon');
            icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
          }

          // Load saved theme
          window.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            const icon = document.getElementById('theme-icon');
            icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
          });
        </script>
        <script src="/static/app.js"></script>
        <script src="/static/graph.js"></script>
        <script src="/static/chat.js"></script>
        <script src="/static/mongodb.js"></script>
    </body>
    </html>
  `);
});

export default app;
