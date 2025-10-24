// Data Intelligence Platform - Frontend JavaScript

let currentDatasetId = null;
let allAnalyses = []; // Store all analyses for filtering
let allVisualizations = []; // Store all visualizations for filtering
let bookmarkedInsights = new Set(); // Store bookmarked insight IDs

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

        showSection('results');
    } catch (error) {
        console.error('Error loading results:', error);
        // If analysis is still running, retry
        if (error.response?.data?.analyses?.length === 0) {
            setTimeout(() => loadDatasetResults(datasetId), 3000);
        } else {
            alert('Failed to load results');
            resetUpload();
        }
    }
}

// Search and filter insights
function filterInsights(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        displayInsights(allAnalyses);
        displayVisualizations(allVisualizations);
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
                <button onclick="downloadChart('${canvasId}', '${viz.title.replace(/'/g, "\\'")}')" 
                        class="ml-3 neu-button p-2" title="Download as PNG">
                    <i class="fas fa-download"></i>
                </button>
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

// Display dataset information
function displayDatasetInfo(dataset) {
    const info = document.getElementById('dataset-info');
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
        pattern: '<i class="fas fa-puzzle-piece" style="color: #10b981;"></i>',
        trend: '<i class="fas fa-chart-line" style="color: #ef4444;"></i>',
        clustering: '<i class="fas fa-layer-group" style="color: #6366f1;"></i>'
    };
    return icons[type] || '<i class="fas fa-info-circle" style="color: var(--text-secondary);"></i>';
}

function formatAnalysisType(type) {
    const names = {
        statistics: 'Statistical Summary',
        correlation: 'Relationship Found',
        outlier: 'Unusual Values Detected',
        pattern: 'Pattern Discovery',
        trend: 'Trend Analysis',
        clustering: 'Group Detection'
    };
    return names[type] || type;
}

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
