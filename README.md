# 🧠 Data Intelligence Platform

> **"Just Works" Data Science for Non-Experts**

A next-generation automated data analysis platform that transforms raw CSV/JSON uploads into actionable insights with full explainability. Built with Hono on a lightweight Node.js runtime and powered by embedded DuckDB for blazing-fast analytics without external infrastructure.

## 🌐 Live Demo

**Production URL:** https://3000-iq8kyowo8xnxngo6s4fj9-dfc00ec5.sandbox.novita.ai

---

## ✨ Key Features

### 🚀 Core Functionality

- **Multi-Source Upload** - CSV/JSON files + MongoDB Atlas direct import ✨ NEW
- **One-Click Upload & Analysis** - Drop files and get instant insights
- **MongoDB Integration** - Import directly from Atlas using official driver ✨ NEW
- **Auto-Type Detection** - Smart column type inference (numeric, categorical, datetime)
- **Statistical Analysis** - Mean, median, mode, std dev, quartiles, outliers (IQR method)
- **Correlation Detection** - Pearson correlation coefficient for relationships
- **Trend Analysis** - Linear regression for time-series patterns
- **Pattern Recognition** - Frequency analysis for categorical data
- **Quality Scoring** - Heuristic algorithm ranks insights 0-100 (surfaces best findings first)

### 🎨 User Experience

- **Neumorphism Design** - Modern soft-UI aesthetic with depth and elegance
- **Dark/Light Mode** - Persistent theme preference (localStorage)
- **Responsive Layout** - Works beautifully on desktop and tablet
- **Print-Optimized** - Professional PDF export with clean layout
- **Progressive Status** - Granular progress updates (Upload → Analyze → Visualize)

### 🔍 Advanced Features

#### 1. **Smart Search & Filter**
- Real-time search across insights, columns, patterns, and explanations
- Filters both visualizations and text insights simultaneously
- Result counter shows matches
- One-click reset to clear filters

#### 2. **Bookmark System**
- Star important insights for quick access
- Persists across sessions (localStorage)
- Filter view to show only bookmarked insights
- Visual indicator (gold star) on bookmarked items

#### 3. **Chart Export**
- Download individual visualizations as PNG
- One-click download button on each chart
- Preserves chart quality and formatting
- Automatic filename generation from chart title

#### 4. **Column Mapping** (ID → Name)
- **Auto-Detection** - Identifies patterns like `skillId` → `skillName`
- **Human-Readable Charts** - Replaces numeric IDs with names in visualizations
- **Confidence Scoring** - Based on cardinality similarity
- **Management UI** - View, edit, delete mappings via dedicated tab
- **Enrichment Indicators** - Charts show "(via skillName)" suffix

#### 5. **Network Visualization** (Cytoscape.js)
- **Interactive Graph** - Drag, zoom, pan nodes
- **COSE Layout** - Optimized for dense datasets (handles 456+ columns)
- **Smart Filtering** - Top 50 correlations, filters weak edges (< 0.7 for large datasets)
- **Color-Coded** - Blue (columns), Green (values), Purple (correlations)
- **Weighted Edges** - Thickness represents correlation strength

#### 6. **AI Chat Assistant** (🔥 UPGRADED! 🎉)
- **OpenAI GPT-4o-mini** - Conversational data analysis
- **Streaming Responses** - Token-by-token display with real-time feedback
- **Tool Call Badges** - Visual transparency showing which database tools AI queries
- **Drill-Down Analysis** - Interactive chart buttons for deeper exploration
- **Function Calling** - 8 tools for database queries:
  1. `get_outlier_columns` - Find outliers with counts/percentages
  2. `get_correlation_analysis` - Query correlations with filtering
  3. `get_column_statistics` - Detailed column statistics
  4. `search_analyses` - Search by type or keyword
  5. `get_data_sample` - View actual data rows (max 20)
  6. `get_missing_values` - Missing data detection
  7. `suggest_data_cleaning` - AI-powered cleaning suggestions
  8. `generate_mongodb_query` - Generate MongoDB queries/pipelines from natural language ✨ NEW
- **Specific Answers** - Returns actual database values, not generic advice
- **Smart Suggestions** - Follow-up questions after each response
- **Conversation History** - Maintains context across messages
- **50% Token Savings** - Tools query on-demand vs large context
- **Automatic Fallback** - Seamlessly switches to non-streaming if SSE fails

**Example Queries:**
```
"Which columns have outliers?" 
→ "sales_volume has 625 outliers (16.4%), sales_total_credits has 679..."

"Tell me about sales_volume"
→ "Mean: 118,855.76, Median: 5,000, Outliers: 625 (16.4%)..."

"Suggest data cleaning steps"
→ "1. Sales Volume: Remove/cap 625 outliers (16.4%)..."

"Show me 5 rows"
→ [Displays actual data with all columns]

"Generate a MongoDB query to find active users from last month"
→ [Returns valid MongoDB query with explanation]
```

#### 7. **MongoDB Atlas Integration** (✨ NEW! 🎉)
- **Direct MongoDB Import** - Connect to Atlas and import collections
- **Official MongoDB Driver** - Uses native Node.js driver (not deprecated Data API)
- **Connection Testing** - Verify credentials before import
- **Query Support** - Filter documents with MongoDB query syntax
- **Aggregation Pipelines** - Full support for complex $match, $group, $project operations
- **AI Query Generation** - Ask AI to write queries/pipelines for you
- **Automatic Conversion** - ObjectId → string, nested objects flattened
- **10K Document Limit** - Performance-optimized with configurable limits

**How to Use:**
1. Click "MongoDB Import" tab in upload section
2. Enter your Atlas connection string: `mongodb+srv://user:pass@cluster.mongodb.net/db`
3. Select database and collection
4. (Optional) Add query filter or aggregation pipeline
5. Test connection, then import
6. Or ask AI: "Generate a query to find sales over $1000 from Q1 2024"

**Example AI-Generated Queries:**
```javascript
// Simple query
{"status": "active", "createdAt": {"$gte": "2024-01-01"}}

// Aggregation pipeline
[
  {"$match": {"status": "active"}},
  {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
  {"$sort": {"total": -1}},
  {"$limit": 10}
]
```

---

## 📊 Data Architecture

### Storage & Database (DuckDB Embedded)

**Tables:**
1. `datasets` - Metadata (name, row_count, column_count, analysis_status)
2. `data_rows` - Raw rows stored as JSON (staged for analysis)
3. `analyses` - Insight payloads with type, confidence, explanation, importance, quality_score
4. `visualizations` - Chart.js configurations generated from insights
5. `cleaning_operations` - Logs of automated cleaning actions
6. `column_mappings` - ID→Name relationships (auto_detected flag)

**Indexes:**
- `quality_score DESC` for surfacing high-value insights first
- Foreign keys on `dataset_id` for cross-table consistency
- UNIQUE constraint on `(dataset_id, id_column)` for mappings

---

## 🎯 How It Works

### Upload Flow
```
1. User drops CSV/JSON file
2. PapaParse parses + auto-types columns
3. Data streamed into DuckDB (in-memory or single-file)
4. Column mappings detected and stored
5. Returns dataset_id immediately
```

### Analysis Pipeline
```
1. POST /api/analyze/:id triggered
2. Fetch data rows from database
3. Apply column mappings (enrich IDs with names)
4. Run statistical analysis
5. Detect outliers, correlations, trends, patterns
6. Calculate quality scores for each insight
7. Generate Chart.js visualizations
8. Skip low-quality charts (score < 30)
9. Store results in database
```

### Visualization Rendering
```
1. Fetch analyses sorted by quality_score DESC
2. Fetch visualizations sorted by display_order
3. Render charts with Chart.js
4. Add download buttons for PNG export
5. Show enrichment indicators for mapped columns
```

---

## 🛠️ Technology Stack

### Backend
- **Hono** - Lightweight web framework
- **Node.js** - Primary runtime (Docker/Kubernetes friendly)
- **DuckDB** - Embedded OLAP database (in-process)
- **MongoDB Driver** - Optional Atlas ingestion

### Frontend
- **Tailwind CSS** - Utility-first styling (via CDN)
- **Chart.js** - Data visualization library
- **Cytoscape.js** - Network graph visualization
- **PapaParse** - Robust CSV parsing
- **Axios** - HTTP client
- **FontAwesome** - Icon library

### Infrastructure
- **TypeScript** - End-to-end type safety
- **tsx** - Zero-config TypeScript runner for development
- **Docker** - Recommended container packaging (optional)

---

## 📁 Project Structure

```
webapp/
├── src/
│   ├── app.ts                 # Hono app factory
│   ├── index.tsx              # Cloudflare worker wrapper (optional)
│   ├── server.ts              # Node.js entrypoint
│   ├── types.ts               # TypeScript interfaces
│   ├── routes/
│   │   ├── upload.ts          # File upload + initial processing
│   │   ├── analyze.ts         # Analysis orchestration
│   │   ├── datasets.ts        # Dataset CRUD
│   │   ├── relationships.ts   # Network graph data
│   │   └── mappings.ts        # Column mapping CRUD
│   └── utils/
│       ├── statistics.ts      # Math functions (stats, correlation, outliers)
│       ├── analyzer.ts        # Main analysis logic
│       ├── quality-scorer.ts  # Insight ranking algorithm
│       ├── visualizer.ts      # Chart.js config generation
│       ├── papa-parser.ts     # CSV parsing wrapper
│       └── column-mapper.ts   # ID→Name auto-detection
├── src/storage/               # DuckDB bindings and adapters
├── public/static/
│   ├── app.js                 # Frontend logic
│   └── graph.js               # Cytoscape.js graph
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_quality_score.sql
│   └── 0003_add_column_mappings.sql
├── package.json               # Dependencies + scripts
└── README.md                  # This file
```

---

## 🚀 Development

### Prerequisites
- Node.js 18+
- Wrangler CLI

### Setup
```bash
# Install dependencies
npm install

# (Optional) set environment variables
export OPENAI_API_KEY=sk-your-api-key
export OPENAI_MODEL=gpt-4o-mini

# Run the development server with auto-reload
npm run dev

# Or run in production mode
npm run build
npm run start
```

Environment variables can also be provided via `.env` files, Docker secrets, or your process manager.

### Key Scripts
```bash
npm run dev      # tsx watch src/server.ts
npm run start    # tsx src/server.ts (production)
npm run build    # Type-check using tsc
npm run clean    # Remove build artifacts
```

---

## 🌟 Feature Highlights

### Quality Scoring Algorithm

**Negative Signals (lower score):**
- Column name contains "id" → -30 points
- Column name contains "name" + 80%+ unique → -25 points
- All unique values (no patterns) → -35 points

**Positive Signals (higher score):**
- Clear patterns (< 10% uniqueness) → +20 points
- Strong correlation (> 0.8) → +30 points
- Significant outliers (> 5%) → +25 points

**Visualization Threshold:** Charts with score < 30 are skipped

---

### Column Mapping Auto-Detection

**Detection Patterns:**
```typescript
// Detects:
skillId → skillName
departmentId → departmentName
employeeId → employee_name

// Confidence calculation:
if (Math.abs(idUniqueness - nameUniqueness) < 0.2) confidence = 0.9;
else if (Math.abs(idUniqueness - nameUniqueness) < 0.4) confidence = 0.7;
else confidence = 0.5;
```

**Data Enrichment:**
```typescript
// Before mapping:
{ skillId: 42, departmentId: 5 }

// After mapping:
{ 
  skillId: "JavaScript",  // replaced with name
  skillId_original: 42,   // preserved
  departmentId: "Engineering",
  departmentId_original: 5
}
```

---

## 📈 Performance

- **Handles 456+ columns** without performance degradation
- **10,000 row limit** for MVP (prevents server overload)
- **5MB file size limit** for uploads
- **Top 50 correlations** shown in network graph for dense datasets
- **Correlation threshold** of 0.7 for datasets > 50 columns

---

## 🎨 Design System

### Color Palette

**Light Mode:**
- Background: `#e0e5ec` (soft gray-blue)
- Cards: White with neumorphic shadows
- Text: `#2c3e50` (dark blue-gray)
- Accent: `#3b82f6` (blue)

**Dark Mode:**
- Background: `#1e293b` (slate)
- Cards: `#0f172a` (darker slate)
- Text: `#f1f5f9` (light gray)
- Accent: `#60a5fa` (lighter blue)

### Neumorphism Formula
```css
box-shadow: 
  8px 8px 16px var(--shadow-dark),   /* Bottom-right shadow */
  -8px -8px 16px var(--shadow-light); /* Top-left highlight */
```

---

## 🔐 Security

- **No API keys in frontend** - All sensitive operations server-side
- **Input validation** - File type, size, row count limits
- **SQL injection protection** - Prepared statements only
- **CORS enabled** - For API routes only
- **.gitignore** - Comprehensive (node_modules, .env, logs, etc.)

---

## 📝 API Endpoints

### Upload
- `POST /api/upload` - Upload CSV/JSON file

### Datasets
- `GET /api/datasets` - List all datasets
- `GET /api/datasets/:id` - Get dataset details
- `GET /api/datasets/:id/analyses` - Get analyses
- `GET /api/datasets/:id/visualizations` - Get visualizations
- `DELETE /api/datasets/:id` - Delete dataset

### Analysis
- `POST /api/analyze/:id` - Trigger analysis

### Relationships
- `GET /api/relationships/:id` - Get network graph data

### Mappings
- `GET /api/mappings/:datasetId` - Get column mappings
- `POST /api/mappings` - Create manual mapping
- `DELETE /api/mappings/:id` - Delete mapping

### AI Chat (NEW! 🎉)
- `POST /api/chat/:datasetId` - Chat with AI assistant (non-streaming)
  - Body: `{ message: string, conversationHistory: array }`
  - Returns: `{ message: string, suggestions: string[], tool_calls: array }`
  - Uses OpenAI function calling with 7 database query tools
  - Response time: 2-7 seconds (depending on tool complexity)
- `POST /api/chat/:datasetId/stream` - Chat with streaming responses (recommended)
  - Body: `{ message: string, conversationHistory: array }`
  - Returns: Server-Sent Events (SSE) stream
  - Events: `content`, `tool_calls_start`, `tool_call`, `tool_calls_complete`, `suggestions`, `done`
  - Real-time token-by-token display with tool execution feedback

---

## 🎯 Roadmap / Future Enhancements

### Completed Recently ✅
1. ~~**AI Chat Assistant**~~ - Conversational data analysis with OpenAI (DONE!)
2. ~~**Function Calling**~~ - 8 tools for database queries (DONE!)
3. ~~**Data Cleaning Suggestions**~~ - AI-powered recommendations (DONE!)
4. ~~**Data Sample Viewing**~~ - See actual rows via chat (DONE!)
5. ~~**Tool Call Badges**~~ - Visual transparency showing AI database queries (DONE!)
6. ~~**Streaming Responses**~~ - Real-time token-by-token chat display (DONE!)
7. ~~**Drill-Down Analysis**~~ - Interactive chart buttons for deeper exploration (DONE!)
8. ~~**MongoDB Connector**~~ - Import from Atlas using official driver (DONE!)
9. ~~**MongoDB AI Integration**~~ - AI generates queries/pipelines via chat (DONE!)

### In Progress ⏳
1. **Data Cleaning Execution** - Apply suggested cleaning operations

### Planned Features 📋
4. **Data Cleaning Execution** - Apply suggested cleaning operations
5. **Natural Language → Visualization** - "Show me sales by region" generates chart
6. **Data Cleaning Toggle** - Preview + apply/revert functionality
6. **Custom Calculated Columns** - Config interface with suggestions
7. **Multi-file Merging** - Auto-detect join relationships
8. **Time Series Analysis** - Seasonality, forecasting, trends
9. **Advanced Clustering** - Community detection in network graphs
10. **Export Formats** - Excel, JSON, CSV for results

---

## 🐛 Known Issues

1. **"Add Manual Mapping" form** - Not yet implemented (shows alert)
2. **Cytoscape tooltips** - Currently console.log only (needs visual tooltip)
3. **Graph legend** - Not styled in neumorphism design
4. **Mobile responsiveness** - Network graph needs touch optimization

---

## 📄 License

MIT License - Feel free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- **PapaParse** - For rock-solid CSV parsing
- **Cytoscape.js** - For beautiful network visualizations
- **Chart.js** - For flexible charting
- **DuckDB** - For an incredible in-process analytics engine
- **Hono** - For a tiny, fast web framework

---

## 👨‍💻 Developer

Built with passion by the Data Intelligence Platform team.

**Tech Stack Philosophy:**
- Lightweight over heavy frameworks
- Edge-first architecture
- User experience above all
- Explainability is non-negotiable

---

**Remember:** The goal isn't just to show WHAT the data says, but to explain WHY it matters. Every insight comes with confidence scores and plain-English explanations because data science should be accessible to everyone.

🚀 **Happy Analyzing!**
