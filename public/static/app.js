// Data Intelligence Platform - Frontend JavaScript

let currentDatasetId = null;
let allAnalyses = []; // Store all analyses for filtering
let allVisualizations = []; // Store all visualizations for filtering
let bookmarkedInsights = new Set(); // Store bookmarked insight IDs
let searchDebounceTimer = null; // Debounce timer for search
let currentSessionId = null;
let currentSessionSummary = null;

// Load bookmarks from localStorage
function loadBookmarks() {
    const saved = localStorage.getItem('bookmarked_insights');
    if (saved) {
        bookmarkedInsights = new Set(JSON.parse(saved));
    }
}

function saveBookmarks() {
    localStorage.setItem('bookmarked_insights', JSON.stringify([...bookmarkedInsights]));
}

loadBookmarks();

// DOM elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const uploadPrompt = document.getElementById('upload-prompt');
const uploadProgress = document.getElementById('upload-progress');
const uploadSection = document.getElementById('upload-section');
const resultsSection = document.getElementById('results-section');
const datasetsSection = document.getElementById('datasets-section');
const insightsContainer = document.getElementById('insights-container');
window.pendingCleanerColumn = window.pendingCleanerColumn ?? null;

if (insightsContainer) {
    insightsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.insight-action-button');
        if (!button) return;
        const encoded = button.dataset.action;
        if (!encoded) return;
        try {
            const action = JSON.parse(decodeURIComponent(encoded));
            const analysisId = Number(button.dataset.analysisId);
            const analysisObj = allAnalyses.find(a => a.id === analysisId);
            if (analysisObj) {
                handleInsightAction(analysisObj, action);
            }
        } catch (error) {
            console.error('Failed to execute insight action:', error);
        }
    });
}

// Navigation
document.getElementById('view-datasets').addEventListener('click', loadDatasets);
document.getElementById('back-to-upload').addEventListener('click', () => {
    showSection('upload');
});

// File upload handlers
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
});

// Handle file upload
async function handleFile(file) {
    if (!file) return;

    // Validate file type
    const validTypes = ['.csv', '.json'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(fileExt)) {
        alert('Please upload a CSV or JSON file');
        return;
    }

    // Show progress
    uploadPrompt.classList.add('hidden');
    uploadProgress.classList.remove('hidden');
    updateStatus('Uploading file...', `${file.name} (${formatFileSize(file.size)})`, 10);

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
            currentDatasetId = response.data.dataset_id;
            updateStatus('Upload complete!', `${response.data.row_count} rows, ${response.data.column_count} columns`, 30);
            // Trigger analysis
            setTimeout(() => triggerAnalysis(currentDatasetId), 500);
        } else {
            alert('Upload failed: ' + response.data.error);
            resetUpload();
        }
    } catch (error) {
        console.error('Upload error:', error);
        const errorMsg = error.response?.data?.error || 'Upload failed. Please try again.';
        alert(errorMsg);
        resetUpload();
    }
}

// Trigger analysis for a dataset
async function triggerAnalysis(datasetId) {
    updateStatus('Analyzing data...', 'Calculating statistics and finding patterns', 50);
    
    try {
        await axios.post(`/api/analyze/${datasetId}`);
        
        updateStatus('Generating visualizations...', 'Creating charts and graphs', 80);
        setTimeout(() => loadDatasetResults(datasetId), 800);
    } catch (error) {
        console.error('Analysis error:', error);
        alert('Analysis failed: ' + (error.response?.data?.error || error.message));
        resetUpload();
    }
}

// Update status message
function updateStatus(message, detail, progress) {
    const statusMessage = document.getElementById('status-message');
    const statusDetail = document.getElementById('status-detail');
    const progressBar = document.getElementById('progress-bar');
    
    if (statusMessage) statusMessage.textContent = message;
    if (statusDetail) statusDetail.textContent = detail;
    if (progressBar) progressBar.style.width = progress + '%';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Load dataset results
async function loadDatasetResults(datasetId) {
    try {
        // Fetch dataset info
        const datasetResponse = await axios.get(`/api/datasets/${datasetId}`);
        const { dataset, sample } = datasetResponse.data;

        currentDatasetId = dataset?.id ?? datasetId;

        // Fetch analyses
        const analysesResponse = await axios.get(`/api/datasets/${datasetId}/analyses`);
        const { analyses } = analysesResponse.data;
        allAnalyses = analyses; // Store for filtering

        // Fetch visualizations
        const visualizationsResponse = await axios.get(`/api/datasets/${datasetId}/visualizations`);
        const { visualizations } = visualizationsResponse.data;
        allVisualizations = visualizations; // Store for filtering

        // Display results
        displayDatasetInfo(dataset);
        displayVisualizations(visualizations);
        displayInsights(analyses);
        displaySampleData(sample, dataset.columns);

        if (typeof loadTopics === 'function') {
            loadTopics(datasetId);
        }

        showSection('results');

        if (window.sessionAPI) {
            try {
                await ensureSessionForDataset(dataset);
            } catch (sessionError) {
                console.error('Failed to ensure session:', sessionError);
            }
        }
    } catch (error) {
        console.error('Error loading results:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Failed to load results';
        // If analysis is still running, retry
        if (error.response?.data?.analyses?.length === 0) {
            setTimeout(() => loadDatasetResults(datasetId), 3000);
        } else {
            updateStatus('Failed to load results', errorMessage, 0);
            resetUpload();
        }
    }
}

// Debounced search function
function debouncedSearch(searchTerm) {
    // Clear existing timer
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
    
    // Set new timer (300ms delay)
    searchDebounceTimer = setTimeout(() => {
        filterInsights(searchTerm);
    }, 300);
}

// Search and filter insights
function filterInsights(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        displayInsights(allAnalyses);
        displayVisualizations(allVisualizations);
        const resultCount = document.getElementById('search-result-count');
        if (resultCount) resultCount.textContent = '';
        return;
    }

    // Filter analyses
    const filteredAnalyses = allAnalyses.filter(analysis => {
        return (
            (analysis.column_name && analysis.column_name.toLowerCase().includes(term)) ||
            (analysis.explanation && analysis.explanation.toLowerCase().includes(term)) ||
            (analysis.analysis_type && analysis.analysis_type.toLowerCase().includes(term)) ||
            (analysis.importance && analysis.importance.toLowerCase().includes(term))
        );
    });

    // Filter visualizations
    const filteredViz = allVisualizations.filter(viz => {
        return (
            (viz.title && viz.title.toLowerCase().includes(term)) ||
            (viz.explanation && viz.explanation.toLowerCase().includes(term))
        );
    });

    displayInsights(filteredAnalyses);
    displayVisualizations(filteredViz);

    // Show result count
    const resultCount = document.getElementById('search-result-count');
    if (resultCount) {
        resultCount.textContent = `Found ${filteredAnalyses.length} insights and ${filteredViz.length} visualizations`;
    }
}

// Display visualizations
function displayVisualizations(visualizations) {
    const container = document.getElementById('visualizations-container');
    
    if (visualizations.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-8 text-gray-500">
                <i class="fas fa-chart-bar text-3xl mb-3"></i>
                <p>No visualizations match your search.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    visualizations.forEach((viz, index) => {
        const canvasId = `chart-${index}`;
        const cardDiv = document.createElement('div');
        cardDiv.className = 'neu-card p-4 relative';
        cardDiv.innerHTML = `
            <div class="mb-3 flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-semibold" style="color: var(--text-primary);">${viz.title}</h3>
                    <p class="text-sm mt-1" style="color: var(--text-secondary);">${viz.explanation}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="drillDownChart('${viz.title.replace(/'/g, "\\'").replace(/"/g, "&quot;")}', '${viz.explanation.replace(/'/g, "\\'").replace(/"/g, "&quot;")}', '${viz.column_name || ""}', '${viz.type || ""}')" 
                            class="neu-button p-2" title="Drill down for deeper analysis" style="color: var(--accent);">
                        <i class="fas fa-search-plus"></i>
                    </button>
                    <button onclick="downloadChart('${canvasId}', '${viz.title.replace(/'/g, "\\'")}')" 
                            class="neu-button p-2" title="Download as PNG">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
            <div style="position: relative; height: 300px;">
                <canvas id="${canvasId}"></canvas>
            </div>
        `;
        container.appendChild(cardDiv);

        // Render chart after DOM update
        setTimeout(() => {
            const ctx = document.getElementById(canvasId);
            if (ctx) {
                new Chart(ctx, viz.config);
            }
        }, 100);
    });
}

// Download chart as PNG
function downloadChart(canvasId, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Drill down into chart for deeper analysis
function drillDownChart(title, explanation, columnName, chartType) {
    // Open chat widget if closed
    if (!chatOpen) {
        toggleChat();
    }
    
    // Generate context-aware query based on chart type and content
    let query = '';
    
    // Parse chart type from title or explanation
    const titleLower = title.toLowerCase();
    const explanationLower = explanation.toLowerCase();
    
    if (titleLower.includes('outlier') || explanationLower.includes('outlier')) {
        query = columnName 
            ? `Tell me more about the outliers in ${columnName}. What are the specific values and why are they considered outliers?`
            : `Analyze the outliers shown in this chart: "${title}". What patterns do you see?`;
            
    } else if (titleLower.includes('correlation') || explanationLower.includes('correlation')) {
        query = columnName 
            ? `Explain the correlation involving ${columnName}. What does this relationship mean for the data?`
            : `Analyze this correlation: "${title}". What insights can we derive from this relationship?`;
            
    } else if (titleLower.includes('distribution') || explanationLower.includes('distribution')) {
        query = columnName 
            ? `Analyze the distribution pattern of ${columnName}. What does this tell us about the data?`
            : `What can you tell me about this distribution: "${title}"?`;
            
    } else if (titleLower.includes('trend') || explanationLower.includes('trend')) {
        query = columnName 
            ? `Explain the trend in ${columnName}. Is this trend significant? What might be causing it?`
            : `Analyze this trend: "${title}". What predictions or insights can we make?`;
            
    } else if (titleLower.includes('pattern') || titleLower.includes('frequency')) {
        query = columnName 
            ? `What patterns do you see in ${columnName}? Are there any notable observations?`
            : `Analyze the patterns shown in: "${title}". What do they reveal?`;
            
    } else {
        // Generic drill-down query
        query = columnName 
            ? `Provide a detailed analysis of ${columnName} based on this chart: "${title}"`
            : `Give me deeper insights about: "${title}"`;
    }
    
    // Set the query in the chat input and focus
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = query;
        chatInput.focus();
        
        // Optionally auto-send (uncomment if desired)
        // sendChatMessage();
    }
}

// Display dataset information
function displayDatasetInfo(dataset) {
    const info = document.getElementById('dataset-info');
    const columns = Array.isArray(dataset.columns) ? dataset.columns : [];
    const totalRows = Number(dataset.row_count ?? 0);
    const highlightCount = Math.min(columns.length, 6);
    const scoredColumns = columns.map(col => {
        const profile = col.profile || {};
        const semantic = col.semantic_type || profile.semantic_type;
        const uniqueCount = col.unique_count ?? profile.unique_count ?? 0;
        const uniqueRatio = profile.unique_ratio ?? (totalRows > 0 ? uniqueCount / totalRows : 0);
        let score = 0;
        if (semantic) score += 3;
        if (profile.is_categorical) score += 2;
        if (semantic === 'status' || semantic === 'category') score += 2;
        if (semantic === 'currency' || semantic === 'percentage') score += 2;
        if (uniqueCount > 1 && uniqueCount <= 25) score += 1;
        if (profile.notes && profile.notes.length > 0) score += 1;
        if (profile.is_identifier || semantic === 'identifier') score -= 3;
        if (uniqueRatio >= 0.8) score -= 1;
        return { col, profile, semantic, uniqueCount, score };
    }).sort((a, b) => b.score - a.score);

    const highlightColumns = scoredColumns.slice(0, highlightCount).map(({ col, profile, semantic, uniqueCount }) => {
        const semanticLabel = semantic ? formatSemanticLabel(semantic) : '';
        const badges = [];
        if (semanticLabel) {
            badges.push(`<span class="text-xs px-2 py-1 rounded-full" style="background: rgba(59, 130, 246, 0.12); color: #2563eb;">${semanticLabel}</span>`);
        }
        if (profile?.is_categorical) {
            badges.push('<span class="text-xs px-2 py-1 rounded-full" style="background: rgba(16, 185, 129, 0.12); color: #0f766e;">categorical</span>');
        }
        if (profile?.is_identifier || semantic === 'identifier') {
            badges.push('<span class="text-xs px-2 py-1 rounded-full" style="background: rgba(148, 163, 184, 0.2); color: #475569;">identifier</span>');
        }
        const badgeRow = badges.length ? `<div class="flex flex-wrap gap-2">${badges.join('')}</div>` : '';
        const typeLabel = formatColumnType(col.type);
        const reason = profile?.notes && profile.notes.length ? profile.notes[0] : '';
        return `
            <div class="flex flex-col gap-1">
                <span class="font-semibold" style="color: var(--text-primary);">${col.name}</span>
                ${badgeRow}
                <div class="text-xs" style="color: var(--text-secondary);">
                    ${typeLabel} • Unique: ${formatNumber(uniqueCount)}
                    ${reason ? `• ${reason}` : ''}
                </div>
            </div>
        `;
    }).join('<div class="h-px bg-gray-200 my-2 opacity-50"></div>');

    info.innerHTML = `
        <div class="neu-card p-4">
            <div class="text-sm font-semibold" style="color: var(--accent);">Dataset Name</div>
            <div class="text-xl font-bold" style="color: var(--text-primary);">${dataset.name}</div>
        </div>
        <div class="neu-card p-4">
            <div class="text-sm font-semibold" style="color: var(--accent);">Total Rows</div>
            <div class="text-xl font-bold" style="color: var(--text-primary);">${dataset.row_count.toLocaleString()}</div>
        </div>
        <div class="neu-card p-4">
            <div class="text-sm font-semibold" style="color: var(--accent);">Columns</div>
            <div class="text-xl font-bold" style="color: var(--text-primary);">${dataset.column_count}</div>
        </div>
        <div class="neu-card p-4">
            <div class="text-sm font-semibold" style="color: var(--accent);">Status</div>
            <div class="text-xl font-bold" style="color: var(--text-primary);">
                <i class="fas fa-check-circle" style="color: #10b981;"></i> Analyzed
            </div>
        </div>
        ${highlightColumns
            ? `<div class="neu-card p-4 col-span-1 md:col-span-2">
                    <div class="text-sm font-semibold mb-3" style="color: var(--accent);">Column Highlights</div>
                    <div class="flex flex-col gap-3">${highlightColumns}</div>
               </div>`
            : ''}
    `;
}

// Toggle bookmark
function toggleBookmark(analysisId) {
    if (bookmarkedInsights.has(analysisId)) {
        bookmarkedInsights.delete(analysisId);
    } else {
        bookmarkedInsights.add(analysisId);
    }
    saveBookmarks();
    
    // Update UI
    const icon = document.getElementById(`bookmark-icon-${analysisId}`);
    if (icon) {
        icon.className = bookmarkedInsights.has(analysisId) ? 'fas fa-star' : 'far fa-star';
        icon.style.color = bookmarkedInsights.has(analysisId) ? '#f59e0b' : '';
    }
}

// Filter bookmarked insights
function showBookmarked() {
    const bookmarked = allAnalyses.filter(a => bookmarkedInsights.has(a.id));
    displayInsights(bookmarked);
    
    const resultCount = document.getElementById('search-result-count');
    if (resultCount) {
        resultCount.textContent = `Showing ${bookmarked.length} bookmarked insights`;
    }
}

// Display insights
function displayInsights(analyses) {
    const container = document.getElementById('insights-container');
    
    if (analyses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8" style="color: var(--text-secondary);">
                <i class="fas fa-search text-3xl mb-3"></i>
                <p>No insights match your search.</p>
            </div>
        `;
        return;
    }

    // Sort by importance and confidence
    analyses.sort((a, b) => {
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        return (importanceOrder[b.importance] * b.confidence) - (importanceOrder[a.importance] * a.confidence);
    });

    container.innerHTML = analyses.map(analysis => `
        <div class="neu-card p-5 insight-card" data-analysis-id="${analysis.id}">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: var(--bg-secondary);">
                        ${getAnalysisIcon(analysis.analysis_type)}
                    </div>
                    <div>
                        <h3 class="font-semibold" style="color: var(--text-primary);">${formatAnalysisType(analysis.analysis_type)}</h3>
                        ${analysis.column_name ? `<p class="text-sm" style="color: var(--text-secondary);">${analysis.column_name}</p>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="toggleBookmark(${analysis.id})" class="neu-button p-2" title="Bookmark">
                        <i id="bookmark-icon-${analysis.id}" class="${bookmarkedInsights.has(analysis.id) ? 'fas' : 'far'} fa-star" 
                           style="color: ${bookmarkedInsights.has(analysis.id) ? '#f59e0b' : ''}"></i>
                    </button>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background: ${getImportanceBg(analysis.importance)}; color: ${getImportanceText(analysis.importance)};">
                        ${analysis.importance.toUpperCase()}
                    </span>
                    <span class="text-sm" style="color: var(--text-secondary);">${Math.round(analysis.confidence * 100)}% sure</span>
                </div>
            </div>
            <p class="leading-relaxed" style="color: var(--text-primary);">${analysis.explanation}</p>
            ${renderAnalysisDetails(analysis)}
        </div>
    `).join('');
}

// Display sample data
function displaySampleData(sample, columns) {
    const container = document.getElementById('sample-data');
    
    if (sample.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No data to display</p>';
        return;
    }

    const headers = columns.map(col => col.name);
    
    container.innerHTML = `
        <div class="neu-card-inset rounded-lg p-4 overflow-x-auto">
            <table class="min-w-full">
                <thead>
                    <tr>
                        ${headers.map(h => `<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-secondary);">${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${sample.map((row, i) => `
                        <tr class="${i % 2 === 0 ? '' : 'bg-opacity-50'}" style="background: ${i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)'};">
                            ${headers.map(h => `<td class="px-6 py-4 whitespace-nowrap text-sm" style="color: var(--text-primary);">${row[h] ?? 'null'}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Load datasets list
async function loadDatasets() {
    try {
        const response = await axios.get('/api/datasets');
        const { datasets } = response.data;

        const list = document.getElementById('datasets-list');
        
        if (datasets.length === 0) {
            list.innerHTML = `
                <div class="text-center py-12" style="color: var(--text-secondary);">
                    <i class="fas fa-folder-open text-5xl mb-4"></i>
                    <p class="text-lg">No datasets yet. Upload one to get started!</p>
                </div>
            `;
        } else {
            list.innerHTML = datasets.map(ds => `
                <div class="neu-card p-4 mb-4 cursor-pointer hover:opacity-90 transition" onclick="loadDatasetResults(${ds.id})">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="font-semibold text-lg" style="color: var(--text-primary);">${ds.name}</h3>
                            <p class="text-sm" style="color: var(--text-secondary);">${ds.row_count.toLocaleString()} rows × ${ds.column_count} columns</p>
                            <p class="text-xs mt-1" style="color: var(--text-secondary);">Uploaded ${new Date(ds.upload_date).toLocaleDateString()}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="event.stopPropagation(); deleteDataset(${ds.id})" class="neu-button p-2" style="color: #ef4444;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        showSection('datasets');
    } catch (error) {
        console.error('Error loading datasets:', error);
        alert('Failed to load datasets');
    }
}

// Delete dataset
async function deleteDataset(id) {
    if (!confirm('Are you sure you want to delete this dataset?')) return;

    try {
        await axios.delete(`/api/datasets/${id}`);
        loadDatasets();
    } catch (error) {
        console.error('Error deleting dataset:', error);
        alert('Failed to delete dataset');
    }
}

// Helper functions
function showSection(section) {
    uploadSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    datasetsSection.classList.add('hidden');

    if (section === 'upload') {
        uploadSection.classList.remove('hidden');
        resetUpload();
    } else if (section === 'results') {
        resultsSection.classList.remove('hidden');
    } else if (section === 'datasets') {
        datasetsSection.classList.remove('hidden');
    }
}

function resetUpload() {
    uploadPrompt.classList.remove('hidden');
    uploadProgress.classList.add('hidden');
    fileInput.value = '';
}

function getAnalysisIcon(type) {
    const icons = {
        statistics: '<i class="fas fa-chart-bar" style="color: #3b82f6;"></i>',
        correlation: '<i class="fas fa-project-diagram" style="color: #a855f7;"></i>',
        outlier: '<i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>',
        anomaly: '<i class="fas fa-bullseye" style="color: #ef4444;"></i>',
        pattern: '<i class="fas fa-puzzle-piece" style="color: #10b981;"></i>',
        trend: '<i class="fas fa-chart-line" style="color: #ef4444;"></i>',
        timeseries: '<i class="fas fa-wave-square" style="color: #8b5cf6;"></i>',
        missing: '<i class="fas fa-question-circle" style="color: #f97316;"></i>',
        feature: '<i class="fas fa-magic" style="color: #22d3ee;"></i>',
        clustering: '<i class="fas fa-layer-group" style="color: #6366f1;"></i>'
    };
    return icons[type] || '<i class="fas fa-info-circle" style="color: var(--text-secondary);"></i>';
}

function formatAnalysisType(type) {
    const names = {
        statistics: 'Statistical Summary',
        correlation: 'Relationship Found',
        outlier: 'Unusual Values Detected',
        anomaly: 'Anomaly Spotlight',
        pattern: 'Pattern Discovery',
        trend: 'Trend Analysis',
        timeseries: 'Time-Series Insight',
        missing: 'Missing Data Alert',
        feature: 'Feature Engineering Suggestion',
        clustering: 'Group Detection'
    };
    return names[type] || type;
}

function renderAnalysisDetails(analysis) {
    if (!analysis?.analysis_type) return '';
    let details = '';

    if (analysis.analysis_type === 'feature' && analysis.result) {
        const transformationName = analysis.result.transformation ? formatTransformationName(analysis.result.transformation) : '';
        const transformation = transformationName ? `<li><strong>Suggested helper:</strong> ${transformationName}</li>` : '';
        const benefit = analysis.result.expected_benefit ? `<li><strong>Why it helps:</strong> ${analysis.result.expected_benefit}</li>` : '';
        const columns = Array.isArray(analysis.result.columns)
            ? `<li><strong>Based on columns:</strong> ${analysis.result.columns.join(', ')}</li>`
            : '';
        details += `
            <ul class="mt-3 text-sm leading-relaxed" style="color: var(--text-secondary); list-style-type: disc; padding-left: 1.25rem;">
                ${columns}
                ${transformation}
                ${benefit}
            </ul>
        `;
    } else if (analysis.analysis_type === 'anomaly' && Array.isArray(analysis.result?.anomalies)) {
        const items = analysis.result.anomalies.slice(0, 3).map((a) => {
            const directionLabel = a.direction === 'high' ? 'High spike' : 'Low dip';
            return `<li>${directionLabel} at row ${a.row} (~${formatNumber(a.value)}), score ${a.score}</li>`;
        }).join('');
        details += `
            <ul class="mt-3 text-sm leading-relaxed" style="color: var(--text-secondary); list-style-type: disc; padding-left: 1.25rem;">
                ${items}
            </ul>
        `;
    }

    const actionsMarkup = renderInsightActions(analysis);
    if (actionsMarkup) {
        details += actionsMarkup;
    }

    return details;
}

function formatSemanticLabel(label) {
    if (!label) return '';
    const friendlyMap = {
        postal_code: 'postal code',
        binary_metric: 'binary metric',
        timestamp: 'timestamp',
        identifier: 'identifier',
    };
    const value = friendlyMap[label] || label.replace(/_/g, ' ');
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatColumnType(type) {
    if (!type) return 'STRING';
    const map = {
        string: 'STRING',
        number: 'NUMBER',
        boolean: 'BOOLEAN',
        date: 'DATE',
        datetime: 'DATETIME'
    };
    return map[type] || type.toUpperCase();
}

function formatNumber(value) {
    if (value === undefined || value === null) return 'n/a';
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value.toLocaleString();
    }
    return String(value);
}

function formatTransformationName(transform) {
    const map = {
        log1p: 'log-scaled helper column (log1p)',
        standardize: 'normalised (z-score) helper column',
        one_hot_encoding: 'yes/no columns for each value',
        datetime_components: 'calendar breakdown (day / month / quarter)',
        extract_domain: 'email domain helper',
        extract_host: 'website host helper',
        missing_indicator: 'missing-data flag',
        identifier_encoding: 'ID length / hashed helper'
    };
    return map[transform] || transform.replace(/_/g, ' ');
}

function buildFeatureAction(transformation, columns) {
    if (!transformation) return null;
    const columnLabel = Array.isArray(columns) && columns.length
        ? (columns.length === 1 ? columns[0] : columns.join(', '))
        : 'selected column';
    let label;
    switch (transformation) {
        case 'log1p':
            label = `Create log helper for ${columnLabel}`;
            break;
        case 'standardize':
            label = `Create z-score for ${columnLabel}`;
            break;
        case 'one_hot_encoding':
            label = `Create yes/no columns for ${columnLabel}`;
            break;
        case 'datetime_components':
            label = `Add calendar helpers for ${columnLabel}`;
            break;
        case 'extract_domain':
            label = `Extract domain from ${columnLabel}`;
            break;
        case 'extract_host':
            label = `Extract host from ${columnLabel}`;
            break;
        case 'missing_indicator':
            label = `Create ${columnLabel} missing flag`;
            break;
        case 'identifier_encoding':
            label = `Summarise ID ${columnLabel}`;
            break;
        default:
            label = `Apply ${formatTransformationName(transformation)}`;
    }

    return {
        id: 'apply_feature',
        label,
        payload: {
            transformation,
            columns: Array.isArray(columns) ? columns : [],
        },
    };
}

function renderInsightActions(analysis) {
    let actions = Array.isArray(analysis?.result?.insight_actions) ? analysis.result.insight_actions : [];
    if ((!actions || !actions.length) && analysis.analysis_type === 'feature') {
        const transformation = analysis.result?.transformation;
        const columns = Array.isArray(analysis.result?.columns) ? analysis.result.columns : [];
        const fallback = buildFeatureAction(transformation, columns);
        if (fallback) {
            actions = [fallback];
        }
    }
    if (!actions || !actions.length) return '';
    const buttons = actions.map((action) => {
        const payload = encodeURIComponent(JSON.stringify(action));
        return `
            <button type="button"
                    class="neu-button insight-action-button"
                    data-analysis-id="${analysis.id}"
                    data-action="${payload}">
                <i class="fas fa-bolt mr-2"></i>${action.label}
            </button>
        `;
    }).join('');
    return `<div class="mt-3 flex flex-wrap gap-2">${buttons}</div>`;
}

let activeInsightModal = null;

async function handleInsightAction(analysis, action) {
    if (!analysis || !action || !action.id) return;
    const payload = action.payload || {};

    switch (action.id) {
        case 'open_cleaner': {
            const column = payload.column || analysis.column_name || null;
            const datasetId = analysis.dataset_id || currentDatasetId;
            window.pendingCleanerColumn = column;
            if (datasetId && typeof openCleaningModal === 'function') {
                openCleaningModal(datasetId);
            } else {
                updateStatus('Cleaning assistant unavailable', 'Unable to open cleaning tools right now.', 0);
            }
            break;
        }
        case 'view_segment': {
            await previewInsightSegment(analysis, payload);
            break;
        }
        case 'apply_feature': {
            await applyFeatureSuggestion(analysis, payload);
            break;
        }
        default:
            console.warn('Unknown insight action requested:', action);
    }
}

async function previewInsightSegment(analysis, payload = {}) {
    const datasetId = analysis.dataset_id || currentDatasetId;
    if (!datasetId) {
        updateStatus('Segment preview unavailable', 'Dataset identifier missing for this insight.', 0);
        return;
    }

    const column = payload.column || analysis.column_name;
    if (!column) {
        updateStatus('Segment preview unavailable', 'Column not specified for this insight.', 0);
        return;
    }

    const params = new URLSearchParams();
    params.set('column', column);
    if (payload.direction) params.set('direction', payload.direction);
    if (payload.percentile !== undefined) params.set('percentile', payload.percentile);
    if (payload.limit !== undefined) params.set('limit', payload.limit);
    if (payload.equals !== undefined) params.set('value', payload.equals);
    if (Array.isArray(payload.rows) && payload.rows.length > 0) {
        params.set('rows', payload.rows.join(','));
    }

    try {
        const response = await axios.get(`/api/datasets/${datasetId}/segments?${params.toString()}`);
        const segment = response.data;
        if (!segment || !Array.isArray(segment.rows) || segment.rows.length === 0) {
            updateStatus('No rows found for this insight', '', 0);
            return;
        }

    const title =
        payload.title ||
        (payload.equals !== undefined
            ? `Rows where ${column} = ${payload.equals}`
            : payload.direction === 'bottom'
                ? `Lowest ${payload.percentile || 10}% of ${column}`
                : `Top ${payload.percentile || 10}% of ${column}`);

        showInsightSegmentModal({
            title,
            column,
            direction: segment.direction,
            percentile: segment.percentile,
            totalRows: segment.total_rows,
            rows: segment.rows,
            payload,
        });
    } catch (error) {
        console.error('Failed to load segment preview:', error);
        const message = error.response?.data?.error || error.message || 'Failed to load segment';
        updateStatus('Segment preview failed', message, 0);
    }
}

function showInsightSegmentModal({ title, column, direction, percentile, totalRows, rows, payload = {} }) {
    if (activeInsightModal) {
        activeInsightModal.remove();
        activeInsightModal = null;
    }

    const overlay = document.createElement('div');
    overlay.className = 'insight-modal-overlay';
    overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; padding: 2rem; z-index: 2000;';

    const summaryParts = [
        `Showing ${rows.length.toLocaleString()} of ${totalRows.toLocaleString()} rows`,
    ];
    if (payload.equals !== undefined) {
        summaryParts.push(`Filter: ${column} = ${payload.equals}`);
    } else {
        if (direction) {
            summaryParts.push(direction === 'bottom' ? 'Lowest values' : 'Highest values');
        }
        if (percentile) {
            summaryParts.push(`Percentile: ${percentile}%`);
        }
    }

    const summary = summaryParts.join(' · ');

    const firstRowData = rows.length > 0 && rows[0].data && typeof rows[0].data === 'object'
        ? rows[0].data
        : {};
    const baseColumns = Object.keys(firstRowData);
    if (!baseColumns.includes(column)) {
        baseColumns.unshift(column);
    }
    const limitedColumns = [...new Set(baseColumns)].slice(0, 8);

    const headerCells = limitedColumns
        .map((key) => `<th class="px-4 py-2 text-left text-xs uppercase tracking-wide" style="color: var(--text-secondary);">${escapeHtml(key)}</th>`)
        .join('');

    const bodyRows = rows
        .map((row) => {
            const cells = limitedColumns
                .map((key) => {
                    const cellValue = key === column ? row.value ?? row.data?.[key] : row.data?.[key];
                    const highlighted = key === column ? 'font-semibold' : '';
                    return `<td class="px-4 py-2 text-sm ${highlighted}" style="color: var(--text-primary);">${formatCellValue(cellValue)}</td>`;
                })
                .join('');
            return `<tr class="border-b border-gray-200/40"><td class="px-4 py-2 text-sm" style="color: var(--text-secondary);">#${(row.row_number + 1).toLocaleString()}</td>${cells}</tr>`;
        })
        .join('');

    const tableMarkup = rows.length
        ? `
            <div class="mt-4 overflow-auto" style="max-height: 55vh;">
                <table class="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="px-4 py-2 text-left text-xs uppercase tracking-wide" style="color: var(--text-secondary);">Row</th>
                            ${headerCells}
                        </tr>
                    </thead>
                    <tbody>${bodyRows}</tbody>
                </table>
            </div>
        `
        : `<p class="mt-4 text-sm" style="color: var(--text-secondary);">No rows available for this insight.</p>`;

    overlay.innerHTML = `
        <div class="neu-card" style="position: relative; max-width: 900px; width: 100%; max-height: 80vh; overflow: hidden; padding: 1.75rem;">
            <button type="button" class="insight-modal-close neu-button" style="position: absolute; top: 1rem; right: 1rem;">
                <i class="fas fa-times"></i>
            </button>
            <h3 class="text-lg font-semibold mb-2" style="color: var(--text-primary);">${escapeHtml(title || `Rows for ${column}`)}</h3>
            <p class="text-sm" style="color: var(--text-secondary);">${escapeHtml(summary)}</p>
            ${tableMarkup}
        </div>
    `;

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target.closest('.insight-modal-close')) {
            overlay.remove();
            activeInsightModal = null;
        }
    });

    document.body.appendChild(overlay);
    activeInsightModal = overlay;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatCellValue(value) {
    if (value === null || value === undefined) {
        return '<span style="color: var(--text-secondary);">null</span>';
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }
    if (typeof value === 'object') {
        try {
            return `<code style="font-size: 0.85em;">${escapeHtml(JSON.stringify(value))}</code>`;
        } catch {
            return '<code>[object]</code>';
        }
    }
    return escapeHtml(value);
}

async function applyFeatureSuggestion(analysis, payload = {}) {
    const datasetId = analysis.dataset_id || currentDatasetId;
    if (!datasetId) {
        updateStatus('Feature generation unavailable', 'Dataset identifier missing for this insight.', 0);
        return;
    }

    const transformation = payload.transformation || analysis.result?.transformation;
    const columns = Array.isArray(payload.columns) && payload.columns.length
        ? payload.columns
        : Array.isArray(analysis.result?.columns) ? analysis.result.columns : [];

    if (!transformation || columns.length === 0) {
        updateStatus('Feature generation unavailable', 'Transformation details missing for this insight.', 0);
        return;
    }

    updateStatus('Applying feature...', `Generating ${transformation.replace(/_/g, ' ')} helper`, 85);

    try {
        const response = await axios.post(`/api/features/${datasetId}/apply`, {
            transformation,
            columns,
        });

        const data = response.data || {};
        updateStatus('Feature created', data.message || 'New helper column added to the dataset', 90);
        await loadDatasetResults(datasetId);
    } catch (error) {
        console.error('Feature generation failed:', error);
        const message = error.response?.data?.error || error.message || 'Unable to generate feature';
        updateStatus('Feature generation failed', message, 0);
    }
}

// Session API helpers for the forthcoming data canvas
async function createSession(datasetIds = [], name = null) {
    const payload = { dataset_ids: datasetIds };
    if (name) payload.name = name;
    const response = await axios.post('/api/sessions', payload);
    return response.data;
}

async function getSession(sessionId) {
    const response = await axios.get(`/api/sessions/${sessionId}`);
    return response.data;
}

async function attachDatasetToSession(sessionId, datasetId, alias) {
    const payload = { dataset_id: datasetId };
    if (alias) payload.alias = alias;
    const response = await axios.post(`/api/sessions/${sessionId}/datasets`, payload);
    return response.data;
}

async function detachDatasetFromSession(sessionId, datasetId) {
    const response = await axios.delete(`/api/sessions/${sessionId}/datasets/${datasetId}`);
    return response.data;
}

async function getSessionDatasetColumns(sessionId, datasetId) {
    const response = await axios.get(`/api/sessions/${sessionId}/datasets/${datasetId}/columns`);
    return response.data;
}

async function getSessionDatasetRows(sessionId, datasetId, params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', params.limit);
    if (params.offset) query.set('offset', params.offset);
    if (Array.isArray(params.columns) && params.columns.length) {
        query.set('columns', params.columns.join(','));
    }
    const qs = query.toString();
    const response = await axios.get(`/api/sessions/${sessionId}/datasets/${datasetId}/rows${qs ? `?${qs}` : ''}`);
    return response.data;
}

async function runSessionQuery(sessionId, spec) {
    const response = await axios.post(`/api/sessions/${sessionId}/query`, spec);
    return response.data;
}

window.sessionAPI = {
    createSession,
    getSession,
    attachDatasetToSession,
    detachDatasetFromSession,
    getSessionDatasetColumns,
    getSessionDatasetRows,
    runSessionQuery,
};

async function ensureSessionForDataset(dataset) {
    if (!window.sessionAPI || !dataset || !dataset.id) return;

    try {
        let summary = null;

        if (!currentSessionId) {
            summary = await window.sessionAPI.createSession([dataset.id], dataset.name);
            currentSessionId = summary?.session?.id ?? null;
            window.currentSessionId = currentSessionId;
        } else {
            try {
                summary = await window.sessionAPI.attachDatasetToSession(currentSessionId, dataset.id, dataset.name);
            } catch (error) {
                const status = error?.response?.status;
                if (status === 409) {
                    summary = await window.sessionAPI.getSession(currentSessionId);
                } else if (status === 404) {
                    summary = await window.sessionAPI.createSession([dataset.id], dataset.name);
                    currentSessionId = summary?.session?.id ?? null;
                    window.currentSessionId = currentSessionId;
                } else {
                    throw error;
                }
            }
        }

        if (!summary) return;

        currentSessionId = summary?.session?.id ?? currentSessionId;
        window.currentSessionId = currentSessionId;
        currentSessionSummary = summary;
        window.currentSessionSummary = summary;
        renderSessionPanel(summary);

        setTimeout(() => {
            refreshSessionPanel().catch((err) => console.error('Session refresh failed:', err));
        }, 600);
    } catch (error) {
        console.error('Failed to ensure session:', error);
    }
}

async function refreshSessionPanel() {
    if (!window.sessionAPI || !currentSessionId) return;
    try {
        const summary = await window.sessionAPI.getSession(currentSessionId);
        currentSessionId = summary?.session?.id ?? currentSessionId;
        window.currentSessionId = currentSessionId;
        currentSessionSummary = summary;
        window.currentSessionSummary = summary;
        renderSessionPanel(summary);
    } catch (error) {
        console.error('Failed to refresh session panel:', error);
    }
}

function renderSessionPanel(summary) {
    const panel = document.getElementById('session-panel');
    if (!panel) return;

    const emptyState = document.getElementById('session-panel-empty');
    const datasetList = document.getElementById('session-datasets-list');
    const joinContainer = document.getElementById('session-join-container');
    const joinList = document.getElementById('session-join-suggestions');
    const joinCount = document.getElementById('session-join-count');

    if (!summary || !summary.session) {
        panel.classList.add('hidden');
        return;
    }

    panel.classList.remove('hidden');

    const datasets = Array.isArray(summary.datasets) ? summary.datasets : [];
    if (datasets.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (datasetList) {
            datasetList.classList.add('hidden');
            datasetList.innerHTML = '';
        }
    } else if (datasetList) {
        if (emptyState) emptyState.classList.add('hidden');
        datasetList.classList.remove('hidden');
        datasetList.innerHTML = datasets.map((entry) => {
            const info = entry?.dataset || {};
            const alias = entry.alias && entry.alias.trim().length ? entry.alias : info.name || `Dataset ${entry.dataset_id}`;
            const rowCount = Number(info.row_count ?? 0).toLocaleString();
            const columnCount = Number(info.column_count ?? 0).toLocaleString();
            const isCurrent = entry.dataset_id === currentDatasetId;
            const highlightClass = isCurrent ? 'outline outline-2 outline-offset-2 outline-[#f59e0b]' : '';
            const datasetType = info.file_type ? info.file_type.toUpperCase() : 'DATASET';
            return `
                <div class="p-3 neu-card-inset rounded-lg ${highlightClass}" style="background: var(--bg-primary);">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <div class="flex items-center gap-2">
                                <p class="font-semibold" style="color: var(--text-primary);">${escapeHtml(alias)}</p>
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs" style="background: rgba(59,130,246,0.12); color: #2563eb;">${escapeHtml(datasetType)}</span>
                            </div>
                            <p class="text-xs mt-1" style="color: var(--text-secondary);">${rowCount} rows • ${columnCount} columns</p>
                        </div>
                        <button class="neu-button px-3 py-2 text-xs" onclick="loadDatasetResults(${entry.dataset_id})">
                            <i class="fas fa-table mr-1"></i>Open
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (!joinContainer || !joinList || !joinCount) return;

    const suggestions = Array.isArray(summary.join_suggestions) ? summary.join_suggestions : [];
    if (!suggestions.length) {
        joinContainer.classList.add('hidden');
        joinList.innerHTML = '';
        joinCount.textContent = '';
        return;
    }

    const datasetLookup = new Map();
    datasets.forEach((entry) => {
        datasetLookup.set(entry.dataset_id, entry);
    });

    joinContainer.classList.remove('hidden');
    joinCount.textContent = `${suggestions.length} suggestion${suggestions.length === 1 ? '' : 's'}`;
    joinList.innerHTML = suggestions.slice(0, 8).map((suggestion) => {
        const left = datasetLookup.get(suggestion.left_dataset_id);
        const right = datasetLookup.get(suggestion.right_dataset_id);
        if (!left || !right) return '';
        const leftAlias = left.alias && left.alias.trim().length ? left.alias : left.dataset?.name || `Dataset ${left.dataset_id}`;
        const rightAlias = right.alias && right.alias.trim().length ? right.alias : right.dataset?.name || `Dataset ${right.dataset_id}`;
        const leftCol = Array.isArray(suggestion.left_columns) ? suggestion.left_columns[0] : suggestion.left_columns;
        const rightCol = Array.isArray(suggestion.right_columns) ? suggestion.right_columns[0] : suggestion.right_columns;
        const confidence = Math.round((suggestion.confidence ?? 0) * 100);
        return `
            <div class="p-3 neu-card-inset rounded-lg" style="background: var(--bg-primary);">
                <div class="flex items-center justify-between gap-2">
                    <div class="text-sm" style="color: var(--text-primary);">
                        <span class="font-semibold">${escapeHtml(leftAlias)}</span>
                        <span class="text-xs" style="color: var(--text-secondary);">.${escapeHtml(leftCol || '')}</span>
                        <span style="color: var(--text-secondary);"> ↔ </span>
                        <span class="font-semibold">${escapeHtml(rightAlias)}</span>
                        <span class="text-xs" style="color: var(--text-secondary);">.${escapeHtml(rightCol || '')}</span>
                    </div>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs" style="background: rgba(245, 158, 11, 0.15); color: #b45309;">${confidence}% match</span>
                </div>
            </div>
        `;
    }).filter(Boolean).join('');
}

window.refreshSessionPanel = refreshSessionPanel;

function getImportanceBg(importance) {
    const colors = {
        high: 'rgba(239, 68, 68, 0.1)',
        medium: 'rgba(245, 158, 11, 0.1)',
        low: 'rgba(16, 185, 129, 0.1)'
    };
    return colors[importance] || 'rgba(156, 163, 175, 0.1)';
}

function getImportanceText(importance) {
    const colors = {
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#10b981'
    };
    return colors[importance] || '#9ca3af';
}
