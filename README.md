# Data Intelligence Platform

## Project Overview
**Name**: Data Intelligence Platform  
**Goal**: Enable anyone - even without data science knowledge - to extract meaningful insights from their data through fully automated analysis  
**Philosophy**: "Just works" - upload data, get explanations in plain English

## Live URLs
- **Development**: https://3000-iq8kyowo8xnxngo6s4fj9-dfc00ec5.sandbox.novita.ai
- **Health Check**: https://3000-iq8kyowo8xnxngo6s4fj9-dfc00ec5.sandbox.novita.ai/api/health

## Core Features ✅

### 1. Zero-Configuration Upload
- **CSV Support**: Drag & drop or click to upload CSV files
- **JSON Support**: Upload JSON files with automatic structure detection
- **Automatic Parsing**: Smart detection of column types, nullability, and sample values
- **Real-time Feedback**: Upload progress and analysis status tracking

### 2. Automated Data Analysis
The system automatically performs multiple types of analysis:

#### Statistical Analysis
- Mean, median, mode for numeric columns
- Min/max ranges, quartiles, standard deviation
- Null counts and unique value tracking
- Plain English summaries: "Sales ranges from $1,200 to $45,000 with an average of $8,500"

#### Outlier Detection
- IQR-based anomaly detection for numeric data
- Identifies unusual values that need attention
- Explains significance: "Found 12 unusual values (5% of data) significantly different from the rest"

#### Trend Analysis
- Linear regression for numeric columns
- Direction detection (rising/falling/stable)
- Strength scoring (0-100%)
- Explains trends: "Revenue shows a rising trend with 85% strength"

#### Correlation Discovery
- Pearson correlation between numeric columns
- Automatic relationship detection (r > 0.5)
- Explains causation: "When Temperature increases, Ice Cream Sales tends to increase too"

#### Pattern Recognition
- Frequency analysis for categorical data
- Most common values detection
- Distribution analysis: "80% of customers are in 3 cities"

### 3. Explainability Engine
Every finding includes:
- **Plain English explanation**: No jargon, clear language
- **Confidence score**: 0-100% certainty level
- **Importance rating**: High/Medium/Low priority
- **Context**: Why this matters for your data

### 4. Automatic Visualizations ✅
Every analysis gets a custom-generated chart:
- **Histograms** for numeric distributions
- **Bar Charts** for categorical data and top values
- **Line Charts** for trends over time
- **Scatter Plots** for correlations and outliers
- **Pie Charts** for pattern distributions
- Smart chart type selection based on data characteristics
- Explanations for why each visualization was chosen

### 5. Interactive Results Display
- **Dataset Overview**: Row count, column count, upload date
- **Visual Insights**: Auto-generated charts displayed first
- **Key Insights**: Sorted by importance and confidence
- **Sample Data**: First 10 rows in readable table format
- **Visual Indicators**: Color-coded importance levels

### 6. PDF Export ✅
- **One-Click Export**: Generate professional PDF reports
- **Print-Optimized**: Clean layout without UI elements
- **Includes Everything**: Dataset info, charts, insights, sample data
- **Timestamped**: Auto-adds generation date and dataset metadata
- **Uses Browser Print**: Works on all OS (Chrome/Firefox/Safari/Edge)

### 7. Dataset Management
- **My Datasets**: View all uploaded datasets
- **Quick Access**: Click any dataset to view results
- **Delete Option**: Remove datasets when no longer needed
- **Persistent Storage**: D1 database keeps your data safe

## Data Architecture

### Storage Services
- **Cloudflare D1 (SQLite)**: Primary database for all data storage
- **Local Development**: Uses `.wrangler/state/v3/d1` for local SQLite

### Data Models

#### Datasets Table
```sql
- id: Primary key
- name: Dataset name (filename without extension)
- original_filename: Original uploaded filename
- file_type: 'csv' or 'json'
- row_count: Number of data rows
- column_count: Number of columns
- columns: JSON array of column definitions
- upload_date: Timestamp of upload
- analysis_status: 'pending' | 'analyzing' | 'complete' | 'error'
```

#### Data Rows Table
```sql
- id: Primary key
- dataset_id: Foreign key to datasets
- row_number: Sequential row number
- data: JSON object with column:value pairs
- is_cleaned: 0 = original, 1 = cleaned
```

#### Analyses Table
```sql
- id: Primary key
- dataset_id: Foreign key to datasets
- analysis_type: 'statistics' | 'correlation' | 'outlier' | 'pattern' | 'trend'
- column_name: Column being analyzed (null for dataset-wide)
- result: JSON with detailed findings
- confidence: 0.0 to 1.0 confidence score
- explanation: Plain English explanation
- importance: 'low' | 'medium' | 'high'
- created_at: Timestamp
```

### Data Flow
1. **Upload** → CSV/JSON parser → Type inference → D1 storage
2. **Analysis** → Statistical engine → Finding generator → Explanation engine → D1 storage
3. **Display** → Fetch from D1 → Sort by importance → Render with explanations

## Current Functional URIs

### API Endpoints

**Upload**
- `POST /api/upload`
  - Body: FormData with 'file' field (CSV or JSON)
  - Returns: `{ success, dataset_id, row_count, column_count, columns }`

**Datasets**
- `GET /api/datasets` - List all datasets
- `GET /api/datasets/:id` - Get dataset details + sample data
- `GET /api/datasets/:id/analyses` - Get all analyses for dataset
- `GET /api/datasets/:id/visualizations` - Get visualizations (planned)
- `DELETE /api/datasets/:id` - Delete dataset

**Health**
- `GET /api/health` - Health check endpoint

### Frontend Routes
- `/` - Main application interface with upload + results

## Technologies Used

**Backend**
- **Hono**: Lightweight web framework for Cloudflare Workers
- **Cloudflare D1**: SQLite-based global database
- **Wrangler**: Cloudflare development CLI
- **TypeScript**: Type-safe development

**Frontend**
- **TailwindCSS**: Utility-first styling (via CDN)
- **Font Awesome**: Icons library
- **Axios**: HTTP client for API calls
- **Chart.js**: Charting library (loaded, ready for viz feature)

**Development**
- **Vite**: Build tool for Cloudflare Pages
- **PM2**: Process manager for development server
- **Git**: Version control

## Features Completed ✅

All core MVP features are now complete:
1. ✅ CSV/JSON Upload with validation
2. ✅ Automated analysis (statistics, correlations, patterns, trends, outliers)
3. ✅ Plain-English explanations
4. ✅ Automatic visualizations (5 chart types)
5. ✅ Granular status updates during processing
6. ✅ PDF export for professional reports
7. ✅ Dataset management and history

## What's NOT Implemented Yet

### 1. Data Cleaning Pipeline ⏳
- Automated null value filling
- Outlier removal options
- Type conversion suggestions
- Normalization/standardization

### 2. Advanced Analysis ⏳
- **Clustering**: Group similar data points automatically
- **Time Series**: Seasonal patterns, forecasting
- **Distribution Analysis**: Histogram generation, normality tests
- **Text Analysis**: For string columns with natural language

### 3. Export Features ⏳
- Download cleaned dataset as CSV/JSON
- Export analysis report as PDF
- Share insights via URL

### 4. User Preferences ⏳
- Save analysis preferences
- Custom insight importance thresholds
- Column ignore/focus settings

## Recommended Next Steps

### Immediate (High Priority)
1. **Enhance Analysis Engine**
   - Add clustering (k-means for numeric data)
   - Implement time series detection
   - Add distribution analysis (histograms)

2. **Testing**
   - Create sample CSV/JSON test files
   - Test with various data types
   - Stress test with large datasets (10k+ rows)

### Short Term (Medium Priority)
3. **Data Cleaning UI**
   - Display cleaning suggestions
   - Allow user to accept/reject cleanings
   - Apply cleanings and store cleaned rows

4. **Export Functionality**
   - CSV export of cleaned data
   - JSON export of analysis results
   - Printable HTML reports

5. **Performance Optimization**
   - Batch insert for large datasets
   - Lazy loading for large result sets
   - Analysis caching

### Long Term (Lower Priority)
6. **Collaboration Features**
   - Share datasets via URL
   - Public/private dataset toggle
   - Comments on insights

7. **Interactive Visualizations**
   - Click-to-zoom on charts
   - Hover tooltips with detailed info
   - Export charts as images

8. **AI-Powered Insights**
   - Natural language query: "What drives my sales?"
   - Automated narrative generation
   - Prediction models

## User Guide

### Getting Started
1. **Open the platform** in your browser
2. **Upload your data**:
   - Click the upload area or drag & drop
   - Supports CSV and JSON files
   - Wait for automatic analysis (usually 2-5 seconds)

### Understanding Results

**Dataset Overview**
- See total rows, columns, and upload status at a glance

**Key Insights**
- **High Importance** (red bar): Critical findings, potential data issues
- **Medium Importance** (yellow bar): Interesting patterns worth noting
- **Low Importance** (green bar): General information

**Confidence Scores**
- 90-100%: Very certain, strong evidence
- 70-89%: Confident, solid finding
- 50-69%: Moderate confidence, worth investigating
- Below 50%: Weak signal, may not be significant

**Analysis Types**
- 📊 **Statistical Summary**: Basic stats about each column
- 🔗 **Relationship Found**: Two columns that move together
- ⚠️ **Unusual Values**: Outliers that stand out
- 🧩 **Pattern Discovery**: Most common values
- 📈 **Trend Analysis**: Rising or falling patterns

### Example Use Cases

**Sales Data**
Upload sales.csv → Get insights about:
- Which products sell most
- Revenue trends over time
- Unusual transactions (potential errors)
- Correlations between price and volume

**Customer Data**
Upload customers.json → Discover:
- Most common customer locations
- Age distribution patterns
- Spending behavior groups
- Outlier customers (VIPs or anomalies)

**Sensor Data**
Upload readings.csv → Find:
- Sensor value ranges and averages
- Unusual readings (malfunctions?)
- Correlations between sensors
- Trends over time

## Deployment

**Platform**: Cloudflare Pages  
**Status**: ✅ Running (Development)  
**Database**: Cloudflare D1 (Local)  

### Local Development
```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate:local

# Build the project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# Test
curl http://localhost:3000/api/health
```

### Production Deployment (Future)
```bash
# Setup Cloudflare API key
setup_cloudflare_api_key

# Create production D1 database
npx wrangler d1 create webapp-production

# Update wrangler.jsonc with database_id

# Run migrations on production
npm run db:migrate:prod

# Deploy to Cloudflare Pages
npm run deploy
```

## Technical Notes

**Why Cloudflare Workers/D1?**
- Global edge deployment (fast worldwide)
- Built-in SQLite database (no external DB needed)
- Serverless (no server management)
- Free tier is generous (10M requests/month)

**Analysis Performance**
- Small datasets (<1000 rows): 1-2 seconds
- Medium datasets (1000-10000 rows): 2-5 seconds
- Large datasets (>10000 rows): May take longer, consider optimization

**Limitations**
- D1 has 100MB database size limit (free tier)
- Analysis runs synchronously for now (blocking)
- No real-time streaming of analysis progress yet

**Security Considerations**
- All data stored in user's Cloudflare account
- No external API calls (runs entirely on Cloudflare)
- No authentication yet (add for production)

## Project Structure
```
webapp/
├── src/
│   ├── index.tsx              # Main Hono app
│   ├── types.ts               # TypeScript types
│   ├── routes/
│   │   ├── upload.ts          # Upload API
│   │   └── datasets.ts        # Dataset CRUD
│   └── utils/
│       ├── csv-parser.ts      # CSV/JSON parsing
│       ├── statistics.ts      # Math functions
│       └── analyzer.ts        # Analysis engine
├── public/static/
│   └── app.js                 # Frontend JavaScript
├── migrations/
│   └── 0001_initial_schema.sql # Database schema
├── dist/                      # Build output
├── ecosystem.config.cjs       # PM2 configuration
├── wrangler.jsonc            # Cloudflare config
└── package.json              # Dependencies

```

## Contributing Ideas

Want to enhance this platform? Here are some ideas:

1. **Add Python/R integration** for advanced stats
2. **Implement ML models** for predictions
3. **Add data transformation** UI (filter, sort, aggregate)
4. **Create dashboards** for ongoing data monitoring
5. **Support more formats** (Excel, Parquet, SQL dumps)

---

**Last Updated**: 2025-10-24  
**Version**: 1.0.0 (MVP)  
**License**: MIT
