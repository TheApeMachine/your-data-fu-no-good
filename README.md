# 🧠 Data Intelligence Platform

> **"Just Works" Data Science for Non-Experts**

A next-generation automated data analysis platform that transforms raw CSV/JSON uploads into actionable insights with full explainability. Built with Hono, Cloudflare Workers, and modern edge technologies.

## 🌐 Live Demo

**Production URL:** https://3000-iq8kyowo8xnxngo6s4fj9-dfc00ec5.sandbox.novita.ai

---

## ✨ Key Features

### 🚀 Core Functionality

- **One-Click Upload & Analysis** - Drop CSV/JSON files and get instant insights
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

#### 6. **AI Chat Assistant** (NEW! 🎉)
- **OpenAI GPT-4o-mini** - Conversational data analysis
- **Function Calling** - 7 tools for database queries:
  1. `get_outlier_columns` - Find outliers with counts/percentages
  2. `get_correlation_analysis` - Query correlations with filtering
  3. `get_column_statistics` - Detailed column statistics
  4. `search_analyses` - Search by type or keyword
  5. `get_data_sample` - View actual data rows (max 20)
  6. `get_missing_values` - Missing data detection
  7. `suggest_data_cleaning` - AI-powered cleaning suggestions
- **Specific Answers** - Returns actual database values, not generic advice
- **Smart Suggestions** - Follow-up questions after each response
- **Conversation History** - Maintains context across messages
- **50% Token Savings** - Tools query on-demand vs large context

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
```

---

## 📊 Data Architecture

### Database Schema (Cloudflare D1 - SQLite)

**Tables:**
1. `datasets` - Metadata (name, row_count, column_count, analysis_status)
2. `data_rows` - Actual data in JSON format
3. `analyses` - Insights with type, confidence, explanation, importance, quality_score
4. `visualizations` - Chart.js configurations
5. `cleaning_operations` - Logs of automated cleaning actions
6. `column_mappings` - ID→Name relationships (auto_detected flag)

**Indexes:**
- `quality_score DESC` for fast sorting
- Foreign keys on `dataset_id` for all tables
- UNIQUE constraint on `(dataset_id, id_column)` for mappings

---

## 🎯 How It Works

### Upload Flow
```
1. User drops CSV/JSON file
2. PapaParse parses + auto-types columns
3. Data inserted into D1 database
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
- **Hono** - Lightweight web framework for Cloudflare Workers
- **Cloudflare Workers** - Edge runtime deployment
- **Cloudflare D1** - SQLite-based distributed database
- **Wrangler** - CLI for development and deployment

### Frontend
- **Tailwind CSS** - Utility-first styling (via CDN)
- **Chart.js** - Data visualization library
- **Cytoscape.js** - Network graph visualization
- **PapaParse** - Robust CSV parsing
- **Axios** - HTTP client
- **FontAwesome** - Icon library

### Infrastructure
- **PM2** - Process manager for development
- **Vite** - Build tool
- **TypeScript** - Type safety

---

## 📁 Project Structure

```
webapp/
├── src/
│   ├── index.tsx              # Main app + HTML
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
├── public/static/
│   ├── app.js                 # Frontend logic
│   └── graph.js               # Cytoscape.js graph
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_quality_score.sql
│   └── 0003_add_column_mappings.sql
├── ecosystem.config.cjs       # PM2 configuration
├── wrangler.jsonc             # Cloudflare config
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
cd /home/user/webapp

# Install dependencies
npm install

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Run migrations (local D1)
npx wrangler d1 migrations apply webapp-production --local

# Configure OpenAI API Key (for LLM Chat feature)
# Create .dev.vars file with your API key:
echo "OPENAI_API_KEY=sk-your-api-key-here" > .dev.vars
echo "OPENAI_MODEL=gpt-4o-mini" >> .dev.vars

# Get your API key from: https://platform.openai.com/api-keys
```

**Important:** The `.dev.vars` file is in `.gitignore` and will NOT be committed.

### Development Server
```bash
# Build first
npm run build

# Start with PM2 (recommended for sandbox)
pm2 start ecosystem.config.cjs

# Check logs
pm2 logs webapp --nostream

# Stop service
pm2 delete webapp
```

### Key Scripts
```bash
npm run build                 # Vite build
npm run dev                   # Local Vite dev server
npm run dev:sandbox           # Wrangler dev server (D1 local)
npm run deploy                # Deploy to Cloudflare Pages
npm run db:migrate:local      # Apply migrations locally
npm run db:migrate:prod       # Apply migrations to production
npm run db:reset              # Reset local DB + reseed
npm run clean-port            # Kill port 3000 processes
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
- `POST /api/chat/:datasetId` - Chat with AI assistant
  - Body: `{ message: string, conversationHistory: array }`
  - Returns: `{ message: string, suggestions: string[] }`
  - Uses OpenAI function calling with 7 database query tools
  - Response time: 2-7 seconds (depending on tool complexity)

---

## 🎯 Roadmap / Future Enhancements

### Completed Recently ✅
1. ~~**AI Chat Assistant**~~ - Conversational data analysis with OpenAI (DONE!)
2. ~~**Function Calling**~~ - 7 tools for database queries (DONE!)
3. ~~**Data Cleaning Suggestions**~~ - AI-powered recommendations (DONE!)
4. ~~**Data Sample Viewing**~~ - See actual rows via chat (DONE!)

### In Progress ⏳
1. **Streaming Responses** - Real-time token-by-token chat
2. **Data Cleaning Execution** - Apply suggested cleaning operations
3. **Tool Result Caching** - Cache frequent queries for speed

### Planned Features 📋
4. **Natural Language → Visualization** - "Show me sales by region" generates chart
5. **Data Cleaning Toggle** - Preview + apply/revert functionality
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
- **Cloudflare** - For edge computing infrastructure
- **Hono** - For blazing-fast edge framework

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
