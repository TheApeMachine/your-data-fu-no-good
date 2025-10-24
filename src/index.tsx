import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import type { Bindings } from './types';

// Import routes
import upload from './routes/upload';
import datasets from './routes/datasets';
import analyze from './routes/analyze';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for API routes
app.use('/api/*', cors());

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// API routes
app.route('/api/upload', upload);
app.route('/api/datasets', datasets);
app.route('/api/analyze', analyze);

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
        <style>
          .upload-area {
            border: 2px dashed #cbd5e1;
            transition: all 0.3s;
          }
          .upload-area.drag-over {
            border-color: #3b82f6;
            background-color: #eff6ff;
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
          .importance-high { border-left: 4px solid #ef4444; }
          .importance-medium { border-left: 4px solid #f59e0b; }
          .importance-low { border-left: 4px solid #10b981; }

          /* Print styles for PDF export */
          @media print {
            body { background: white; }
            header { display: none !important; }
            #upload-section { display: none !important; }
            #datasets-section { display: none !important; }
            .no-print { display: none !important; }
            
            #results-section {
              display: block !important;
              margin: 0;
              padding: 20px;
            }

            .bg-white {
              box-shadow: none;
              page-break-inside: avoid;
            }

            h1, h2, h3 {
              color: black !important;
              page-break-after: avoid;
            }

            .insight-card {
              page-break-inside: avoid;
              margin-bottom: 10px;
            }

            /* Ensure charts print properly */
            canvas {
              max-width: 100% !important;
              height: auto !important;
              page-break-inside: avoid;
            }

            /* Add page header */
            @page {
              margin: 1cm;
            }

            #results-section::before {
              content: "Data Intelligence Report";
              display: block;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
              color: #1f2937;
            }

            /* Add timestamp */
            .print-meta {
              display: block !important;
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 20px;
            }
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 py-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">
                                <i class="fas fa-brain text-blue-600 mr-3"></i>
                                Data Intelligence Platform
                            </h1>
                            <p class="text-gray-600 mt-1">Upload → Analyze → Understand. Automated insights from your data.</p>
                        </div>
                        <button id="view-datasets" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                            <i class="fas fa-database mr-2"></i>My Datasets
                        </button>
                    </div>
                </div>
            </header>

            <!-- Main Content -->
            <main class="max-w-7xl mx-auto px-4 py-8">
                <!-- Upload Section -->
                <div id="upload-section" class="mb-8">
                    <div class="bg-white rounded-xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-upload mr-2 text-blue-600"></i>
                            Upload Your Data
                        </h2>
                        <p class="text-gray-600 mb-6">
                            Drop a CSV or JSON file below and we'll automatically analyze it, find patterns, 
                            and explain what matters in plain English.
                        </p>

                        <div id="upload-area" class="upload-area rounded-lg p-12 text-center cursor-pointer">
                            <input type="file" id="file-input" accept=".csv,.json" class="hidden">
                            <div id="upload-prompt">
                                <i class="fas fa-cloud-upload-alt text-6xl text-gray-400 mb-4"></i>
                                <p class="text-xl text-gray-700 mb-2">Drop your file here or click to browse</p>
                                <p class="text-sm text-gray-500">Supports CSV and JSON files</p>
                            </div>
                            <div id="upload-progress" class="hidden">
                                <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                                <p id="status-message" class="text-lg text-gray-700 font-semibold">Uploading...</p>
                                <p id="status-detail" class="text-sm text-gray-500 mt-2"></p>
                                <div class="mt-4 w-64 mx-auto bg-gray-200 rounded-full h-2">
                                    <div id="progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Results Section -->
                <div id="results-section" class="hidden">
                    <!-- Print Metadata (hidden on screen, visible in print) -->
                    <div class="print-meta hidden">
                        <p id="print-dataset-name"></p>
                        <p id="print-timestamp"></p>
                    </div>

                    <!-- Export Actions -->
                    <div class="mb-6 flex justify-end gap-3 no-print">
                        <button onclick="window.print()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                            <i class="fas fa-file-pdf"></i>
                            Export to PDF
                        </button>
                        <button onclick="showSection('upload')" class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                            <i class="fas fa-plus"></i>
                            New Analysis
                        </button>
                    </div>

                    <!-- Dataset Info -->
                    <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-info-circle mr-2 text-blue-600"></i>
                            Dataset Overview
                        </h2>
                        <div id="dataset-info" class="grid grid-cols-1 md:grid-cols-4 gap-4"></div>
                    </div>

                    <!-- Visualizations -->
                    <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-chart-line mr-2 text-purple-600"></i>
                            Visual Insights
                        </h2>
                        <div id="visualizations-container" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
                    </div>

                    <!-- Key Insights -->
                    <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-lightbulb mr-2 text-yellow-500"></i>
                            Key Insights
                        </h2>
                        <div id="insights-container" class="space-y-4"></div>
                    </div>

                    <!-- Sample Data -->
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-table mr-2 text-green-600"></i>
                            Sample Data
                        </h2>
                        <div id="sample-data" class="overflow-x-auto"></div>
                    </div>
                </div>

                <!-- Datasets List -->
                <div id="datasets-section" class="hidden">
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-database mr-2 text-blue-600"></i>
                                Your Datasets
                            </h2>
                            <button id="back-to-upload" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                <i class="fas fa-plus mr-2"></i>New Upload
                            </button>
                        </div>
                        <div id="datasets-list"></div>
                    </div>
                </div>
            </main>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `);
});

export default app;
