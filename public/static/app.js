// Data Intelligence Platform - Frontend JavaScript

let currentDatasetId = null;
let allAnalyses = []; // Store all analyses for filtering
let allVisualizations = []; // Store all visualizations for filtering
let currentVizPage = 1; // Pagination for visualizations
const VIZ_PAGE_SIZE = 24; // Number of charts to render per page
const visualizationConfigStore = new Map(); // canvasId -> chart config
let vizObserver = null; // IntersectionObserver for lazy rendering
let bookmarkedInsights = new Set(); // Store bookmarked insight IDs
let insightFeedback = new Map(); // Store feedback state: analysisId -> { thumbs_up: boolean, thumbs_down: boolean }
let searchDebounceTimer = null; // Debounce timer for search
let currentSessionId = null;
let currentSessionSummary = null;
let activeJoinPreviewModal = null;
const sessionGridState = {
    pageSize: 200,
    offsets: new Map(),
    totals: new Map(),
    columns: new Map(),
    specs: new Map(),
    loading: false,
};

let currentForensicsOverview = null;
let forensicsRequestToken = 0;
let forensicsLoaded = false;

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
const joinSuggestionsList = document.getElementById('session-join-suggestions');
const sessionGridStatusEl = document.getElementById('session-grid-status');
const sessionGridPrevBtn = document.getElementById('session-grid-prev');
const sessionGridNextBtn = document.getElementById('session-grid-next');
const sessionGridToolbar = document.getElementById('session-grid-toolbar');
const sessionGridFilterColumn = document.getElementById('session-grid-filter-column');
const sessionGridFilterOperator = document.getElementById('session-grid-filter-operator');
const sessionGridFilterValue = document.getElementById('session-grid-filter-value');
const sessionGridFilterApply = document.getElementById('session-grid-filter-apply');
const sessionGridFilterClear = document.getElementById('session-grid-filter-clear');
const sessionGridSortColumn = document.getElementById('session-grid-sort-column');
const sessionGridSortDirection = document.getElementById('session-grid-sort-direction');
const sessionGridSortApply = document.getElementById('session-grid-sort-apply');
const sessionGridSortClear = document.getElementById('session-grid-sort-clear');
const sessionGridDeriveAdd = document.getElementById('session-grid-derive-add');
const sessionGridDeriveClear = document.getElementById('session-grid-derive-clear');
const forensicsSummaryEl = document.getElementById('forensics-summary');
const forensicsStatusEl = document.getElementById('forensics-status');
const forensicsCaseListEl = document.getElementById('forensics-case-list');
const forensicsSignalListEl = document.getElementById('forensics-signal-list');
const forensicsLastUpdatedEl = document.getElementById('forensics-last-updated');
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

if (joinSuggestionsList) {
    joinSuggestionsList.addEventListener('click', (event) => {
        const button = event.target.closest('[data-join-action]');
        if (!button) return;
        const suggestionId = Number(button.dataset.suggestionId);
        const action = button.dataset.joinAction;
        if (!Number.isFinite(suggestionId) || !action) return;
        handleJoinSuggestionAction(action, suggestionId);
    });
}

if (forensicsCaseListEl) {
    forensicsCaseListEl.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-forensics-action]');
        if (!actionButton) return;
        const type = actionButton.dataset.forensicsAction;
        if (!type) return;
        const column = actionButton.dataset.column || null;
        const caseIdRaw = actionButton.dataset.caseId;
        const caseId = caseIdRaw !== undefined ? Number(caseIdRaw) : null;
        handleForensicsAction({ type, column, caseId: Number.isFinite(caseId) ? caseId : null });
    });
}

if (forensicsSignalListEl) {
    forensicsSignalListEl.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-forensics-action]');
        if (!actionButton) return;
        const type = actionButton.dataset.forensicsAction;
        if (!type) return;
        const column = actionButton.dataset.column || null;
        handleForensicsAction({ type, column });
    });
}

// Navigation
document.getElementById('view-datasets').addEventListener('click', loadDatasets);
document.getElementById('back-to-upload').addEventListener('click', () => {
    showSection('upload');
});

if (sessionGridPrevBtn) {
    sessionGridPrevBtn.addEventListener('click', () => {
        const datasetId = Number(sessionGridPrevBtn.dataset.datasetId ?? currentDatasetId);
        changeSessionGridPage(datasetId, -1);
    });
}

if (sessionGridNextBtn) {
    sessionGridNextBtn.addEventListener('click', () => {
        const datasetId = Number(sessionGridNextBtn.dataset.datasetId ?? currentDatasetId);
        changeSessionGridPage(datasetId, 1);
    });
}

if (sessionGridFilterApply) {
    sessionGridFilterApply.addEventListener('click', () => {
        const datasetId = Number(sessionGridFilterApply.dataset.datasetId ?? currentDatasetId);
        applySessionGridFilter(datasetId);
    });
}

if (sessionGridFilterClear) {
    sessionGridFilterClear.addEventListener('click', () => {
        const datasetId = Number(sessionGridFilterClear.dataset.datasetId ?? currentDatasetId);
        clearSessionGridFilter(datasetId);
    });
}

if (sessionGridSortApply) {
    sessionGridSortApply.addEventListener('click', () => {
        const datasetId = Number(sessionGridSortApply.dataset.datasetId ?? currentDatasetId);
        applySessionGridSort(datasetId);
    });
}

if (sessionGridSortClear) {
    sessionGridSortClear.addEventListener('click', () => {
        const datasetId = Number(sessionGridSortClear.dataset.datasetId ?? currentDatasetId);
        clearSessionGridSort(datasetId);
    });
}

if (sessionGridDeriveAdd) {
    sessionGridDeriveAdd.addEventListener('click', () => {
        const datasetId = Number(sessionGridDeriveAdd.dataset.datasetId ?? currentDatasetId);
        createDerivedSessionColumn(datasetId);
    });
}

if (sessionGridDeriveClear) {
    sessionGridDeriveClear.addEventListener('click', () => {
        const datasetId = Number(sessionGridDeriveClear.dataset.datasetId ?? currentDatasetId);
        clearDerivedSessionColumns(datasetId);
    });
}

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
    resetForensicsView();
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
        displaySampleData();

        if (typeof loadTopics === 'function') {
            loadTopics(datasetId);
        }

        showSection('results');

        if (forensicsSummaryEl) {
            loadForensicsOverview(datasetId);
        }

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

// Lazy create a single Chart.js chart when its canvas enters viewport
function observeVisualization(canvasId) {
    if (!vizObserver) {
        vizObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const id = el.getAttribute('id');
                    const cfg = visualizationConfigStore.get(id);
                    if (cfg && !el.dataset.rendered) {
                        try {
                            // mark as rendered to avoid duplicate charts
                            el.dataset.rendered = '1';
                            new Chart(el, cfg);
                        } catch (e) {
                            console.error('Chart render failed for', id, e);
                        }
                    }
                    vizObserver.unobserve(el);
                }
            });
        }, { rootMargin: '200px 0px' });
    }
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        vizObserver.observe(canvas);
    }
}

// Display visualizations grouped by type with collapsible sections
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

    // Reset state and ensure container uses vertical layout
    container.innerHTML = '';
    container.className = 'w-full flex flex-col gap-0'; // Vertical stacking with no gap (sections handle their own spacing)
    currentVizPage = 1;
    visualizationConfigStore.clear();

    // Group visualizations by chart_type
    const groupedViz = {};
    const typeOrder = ['line', 'scatter', 'bar', 'pie']; // Priority order for chart types
    const typeLabels = {
        'line': 'Time Series & Trends',
        'scatter': 'Correlations & Outliers',
        'bar': 'Distributions & Comparisons',
        'pie': 'Patterns & Breakdowns'
    };
    const typeIcons = {
        'line': 'fa-chart-line',
        'scatter': 'fa-chart-scatter',
        'bar': 'fa-chart-bar',
        'pie': 'fa-chart-pie'
    };

    visualizations.forEach((viz, index) => {
        const chartType = viz.chart_type || 'bar';
        if (!groupedViz[chartType]) {
            groupedViz[chartType] = [];
        }
        groupedViz[chartType].push({ ...viz, originalIndex: index });
    });

    // Sort groups by priority (typeOrder), then by count (most first for important types)
    const sortedGroups = Object.entries(groupedViz).sort((a, b) => {
        const aOrder = typeOrder.indexOf(a[0]) !== -1 ? typeOrder.indexOf(a[0]) : 999;
        const bOrder = typeOrder.indexOf(b[0]) !== -1 ? typeOrder.indexOf(b[0]) : 999;
        if (aOrder !== bOrder) return aOrder - bOrder;
        // For same priority, show larger groups first
        return b[1].length - a[1].length;
    });

    // Track global chart index for unique IDs
    let globalChartIndex = 0;
    const sectionPages = {}; // Track pagination per section

    sortedGroups.forEach(([chartType, vizList], groupIndex) => {
        const sectionId = `viz-section-${chartType}`;
        const sectionDiv = document.createElement('div');
        // Add more spacing between sections, with extra space after first section
        const spacing = groupIndex === 0 ? 'mt-0 mb-10' : 'mb-10';
        sectionDiv.className = `w-full ${spacing}`;
        sectionDiv.id = sectionId;

        const label = typeLabels[chartType] || chartType.charAt(0).toUpperCase() + chartType.slice(1);
        const icon = typeIcons[chartType] || 'fa-chart-bar';
        const count = vizList.length;

        // Create collapsible section header
        const headerId = `${sectionId}-header`;
        sectionDiv.innerHTML = `
            <details class="neu-card" ${count <= 20 ? 'open' : ''}>
                <summary class="p-5 cursor-pointer flex items-center justify-between hover:opacity-90 transition-all" style="list-style: none; border-bottom: 2px solid var(--bg-secondary);">
                    <div class="flex items-center gap-4">
                        <i class="fas ${icon} text-2xl" style="color: var(--accent);"></i>
                        <div>
                            <h3 class="font-bold text-xl m-0" style="color: var(--text-primary);">${label}</h3>
                            <p class="text-xs mt-1 m-0" style="color: var(--text-secondary);">${count} visualization${count !== 1 ? 's' : ''}</p>
                        </div>
                        <span class="text-sm font-semibold px-3 py-1 rounded-full neu-card-inset" style="color: var(--accent); background: rgba(var(--accent-rgb), 0.1);">${count}</span>
                    </div>
                    <i class="fas fa-chevron-down transition-transform duration-200" style="color: var(--text-secondary); font-size: 1.2rem;"></i>
                </summary>
                <div class="p-5 pt-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="${sectionId}-content">
                    </div>
                </div>
            </details>
        `;

        container.appendChild(sectionDiv);

        const sectionContent = sectionDiv.querySelector(`#${sectionId}-content`);
        sectionPages[chartType] = 1;
        const VIZ_PER_PAGE = 20; // Charts per section per page

        // Render function for this section
        function renderSectionPage(chartType) {
            const start = (sectionPages[chartType] - 1) * VIZ_PER_PAGE;
            const end = Math.min(vizList.length, sectionPages[chartType] * VIZ_PER_PAGE);

            // Clear existing content if resetting
            if (sectionPages[chartType] === 1) {
                sectionContent.innerHTML = '';
            }

            for (let i = start; i < end; i++) {
                const viz = vizList[i];
                const canvasId = `chart-${globalChartIndex++}`;
                const cardDiv = document.createElement('div');
                cardDiv.className = 'neu-card p-4 relative';
                cardDiv.innerHTML = `
                    <div class="mb-3 flex justify-between items-start">
                        <div class="flex-1">
                            <h3 class="font-semibold" style="color: var(--text-primary);">${viz.title}</h3>
                            <p class="text-sm mt-1" style="color: var(--text-secondary);">${viz.explanation}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="drillDownChart('${viz.title.replace(/'/g, "\\'").replace(/\"/g, '&quot;')}', '${viz.explanation.replace(/'/g, "\\'").replace(/\"/g, '&quot;')}', '${viz.column_name || ''}', '${viz.chart_type || ''}')"
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
                sectionContent.appendChild(cardDiv);

                // Store config and observe for lazy rendering
                visualizationConfigStore.set(canvasId, viz.config);
                requestAnimationFrame(() => observeVisualization(canvasId));
            }

            // Add "Load More" button if there are more charts
            const existingLoadMore = sectionContent.querySelector(`#load-more-${chartType}`);
            if (existingLoadMore) existingLoadMore.remove();

            if (end < vizList.length) {
                const loadMoreDiv = document.createElement('div');
                loadMoreDiv.className = 'col-span-2 flex justify-center items-center mt-2';
                loadMoreDiv.id = `load-more-${chartType}`;
                loadMoreDiv.innerHTML = `
                    <button class="neu-button px-6 py-3">
                        <i class="fas fa-plus mr-2"></i>Load more ${label} (${vizList.length - end} more)
                    </button>
                `;
                sectionContent.appendChild(loadMoreDiv);
                const btn = loadMoreDiv.querySelector('button');
                btn.addEventListener('click', () => {
                    sectionPages[chartType] += 1;
                    renderSectionPage(chartType);
                });
            }
        }

        // Initial render for this section
        renderSectionPage(chartType);

        // Add chevron rotation animation
        const details = sectionDiv.querySelector('details');
        const chevron = sectionDiv.querySelector('.fa-chevron-down');
        if (details && chevron) {
            details.addEventListener('toggle', () => {
                if (details.open) {
                    chevron.style.transform = 'rotate(180deg)';
                } else {
                    chevron.style.transform = 'rotate(0deg)';
                }
            });
            // Set initial state
            if (details.open) {
                chevron.style.transform = 'rotate(180deg)';
            }
        }
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

// Toggle insight feedback (thumbs up/down)
async function toggleInsightFeedback(analysisId, feedbackType) {
    try {
        const currentFeedback = insightFeedback.get(analysisId) || {};
        const isCurrentlyActive = currentFeedback[feedbackType];

        if (isCurrentlyActive) {
            // Remove feedback
            await axios.delete(`/api/datasets/analyses/${analysisId}/feedback/${feedbackType}`);
            currentFeedback[feedbackType] = false;
        } else {
            // Add feedback (remove opposite if exists)
            const oppositeType = feedbackType === 'thumbs_up' ? 'thumbs_down' : 'thumbs_up';
            if (currentFeedback[oppositeType]) {
                await axios.delete(`/api/datasets/analyses/${analysisId}/feedback/${oppositeType}`);
                currentFeedback[oppositeType] = false;
            }

            await axios.post(`/api/datasets/analyses/${analysisId}/feedback`, {
                feedback_type: feedbackType
            });
            currentFeedback[feedbackType] = true;
        }

        insightFeedback.set(analysisId, currentFeedback);

        // Update UI
        const upButton = document.getElementById(`thumbs-up-${analysisId}`);
        const downButton = document.getElementById(`thumbs-down-${analysisId}`);

        if (upButton) {
            const icon = upButton.querySelector('i');
            if (icon) {
                icon.style.color = currentFeedback.thumbs_up ? '#10b981' : 'var(--text-secondary)';
            }
            upButton.classList.toggle('active', currentFeedback.thumbs_up);
        }

        if (downButton) {
            const icon = downButton.querySelector('i');
            if (icon) {
                icon.style.color = currentFeedback.thumbs_down ? '#ef4444' : 'var(--text-secondary)';
            }
            downButton.classList.toggle('active', currentFeedback.thumbs_down);
        }

        // Reload insights to get updated counts and reordering
        if (currentDatasetId) {
            const response = await axios.get(`/api/datasets/${currentDatasetId}/analyses`);
            allAnalyses = response.data.analyses;
            displayInsights(allAnalyses);
        }
    } catch (error) {
        console.error('Failed to toggle feedback:', error);
        alert('Failed to record feedback. Please try again.');
    }
}

window.toggleInsightFeedback = toggleInsightFeedback;

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
                    <div class="flex items-center gap-1">
                        <button onclick="toggleInsightFeedback(${analysis.id}, 'thumbs_up')"
                                class="neu-button p-2 ${insightFeedback.get(analysis.id)?.thumbs_up ? 'active' : ''}"
                                title="This insight is helpful"
                                id="thumbs-up-${analysis.id}">
                            <i class="fas fa-thumbs-up" style="color: ${insightFeedback.get(analysis.id)?.thumbs_up ? '#10b981' : 'var(--text-secondary)'};"></i>
                        </button>
                        ${analysis.thumbs_up_count > 0 ? `<span class="text-xs" style="color: var(--text-secondary);">${analysis.thumbs_up_count}</span>` : ''}
                    </div>
                    <div class="flex items-center gap-1">
                        <button onclick="toggleInsightFeedback(${analysis.id}, 'thumbs_down')"
                                class="neu-button p-2 ${insightFeedback.get(analysis.id)?.thumbs_down ? 'active' : ''}"
                                title="This insight is not helpful"
                                id="thumbs-down-${analysis.id}">
                            <i class="fas fa-thumbs-down" style="color: ${insightFeedback.get(analysis.id)?.thumbs_down ? '#ef4444' : 'var(--text-secondary)'};"></i>
                        </button>
                        ${analysis.thumbs_down_count > 0 ? `<span class="text-xs" style="color: var(--text-secondary);">${analysis.thumbs_down_count}</span>` : ''}
                    </div>
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
function displaySampleData() {
    setSessionGridStatus('Preparing data canvas…');
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

async function previewJoinSuggestionRequest(sessionId, suggestionId) {
    const response = await axios.post(`/api/sessions/${sessionId}/join-suggestions/${suggestionId}/preview`);
    return response.data;
}

async function applyJoinSuggestionRequest(sessionId, suggestionId) {
    const response = await axios.post(`/api/sessions/${sessionId}/join-suggestions/${suggestionId}/apply`);
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
    previewJoinSuggestion: previewJoinSuggestionRequest,
    applyJoinSuggestion: applyJoinSuggestionRequest,
};

function setSessionGridStatus(message, isError = false) {
    const statusEl = sessionGridStatusEl || document.getElementById('session-grid-status');
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.style.color = isError ? '#ef4444' : 'var(--text-secondary)';
}

function collectColumnNames(columnInfo, spec) {
    const names = new Set();
    const base = columnInfo?.baseDefinitions || columnInfo?.definitions || [];
    (base || []).forEach((col) => {
        if (col && col.name) {
            names.add(col.name);
        }
    });
    if (spec && Array.isArray(spec.computed)) {
        spec.computed.forEach((entry) => {
            if (entry && entry.alias) {
                names.add(entry.alias);
            }
        });
    }
    return names;
}

function refreshDerivedColumnDefinitions(datasetId, columnInfo, spec) {
    if (!columnInfo) return columnInfo;
    const baseDefinitions = columnInfo.baseDefinitions || columnInfo.definitions || [];
    const allDefinitions = [...baseDefinitions];

    if (spec && Array.isArray(spec.computed)) {
        for (const entry of spec.computed) {
            if (!entry || !entry.alias) continue;
            const exists = allDefinitions.some((col) => col?.name === entry.alias);
            if (!exists) {
                allDefinitions.push({
                    name: entry.alias,
                    type: 'number',
                    nullable: true,
                    semantic_type: 'derived',
                });
            }
        }
    }

    const updated = {
        ...columnInfo,
        baseDefinitions,
        definitions: allDefinitions,
    };
    sessionGridState.columns.set(datasetId, updated);
    return updated;
}

function buildComputedColumnSpec(datasetId, columnInfo, spec, alias, expression) {
    const baseDefs = columnInfo?.baseDefinitions || columnInfo?.definitions || [];
    const allowed = new Set();
    (baseDefs || []).forEach((col) => {
        if (col && col.name) {
            allowed.add(col.name);
        }
    });
    if (spec && Array.isArray(spec.computed)) {
        spec.computed.forEach((entry) => {
            if (entry && entry.alias) {
                allowed.add(entry.alias);
            }
        });
    }
    if (allowed.has(alias)) {
        throw new Error(`A column named "${alias}" already exists.`);
    }

    const compiled = compileDerivedExpression(expression, allowed);
    return {
        alias,
        expression,
        rpn: compiled.rpn,
        usedColumns: Array.from(compiled.usedColumns),
        type: 'number',
    };
}

function ensureComputedSpecsPrepared(datasetId, spec, columnInfo) {
    if (!spec) return [];
    if (!Array.isArray(spec.computed)) {
        spec.computed = [];
    }

    const prepared = [];
    const baseDefs = columnInfo?.baseDefinitions || columnInfo?.definitions || [];
    const baseAllowed = new Set();
    (baseDefs || []).forEach((col) => {
        if (col && col.name) {
            baseAllowed.add(col.name);
        }
    });

    for (const entry of spec.computed) {
        if (!entry || !entry.alias || !entry.expression) {
            continue;
        }

        const allowed = new Set(baseAllowed);
        for (const existing of prepared) {
            allowed.add(existing.alias);
        }

        if (!entry.rpn) {
            const compiled = compileDerivedExpression(entry.expression, allowed);
            entry.rpn = compiled.rpn;
            entry.usedColumns = Array.from(compiled.usedColumns);
        }

        prepared.push(entry);
        baseAllowed.add(entry.alias);
    }

    spec.computed = prepared;
    sessionGridState.specs.set(datasetId, spec);
    return prepared;
}

function compileDerivedExpression(expression, allowedColumns) {
    if (typeof expression !== 'string') {
        throw new Error('Expression must be a string.');
    }
    const trimmed = expression.trim();
    if (!trimmed.length) {
        throw new Error('Expression cannot be empty.');
    }

    const tokenPattern = /\s*({{[^}]+}}|\d*\.?\d+|[()+\-*/])\s*/g;
    const rawTokens = [];
    let lastIndex = 0;
    let match;
    while ((match = tokenPattern.exec(trimmed)) !== null) {
        rawTokens.push(match[1]);
        lastIndex = tokenPattern.lastIndex;
    }

    if (lastIndex !== trimmed.length) {
        throw new Error('Only numbers, arithmetic operators, parentheses, and column placeholders like {{column}} are supported.');
    }

    const processed = [];
    const usedColumns = new Set();

    for (const token of rawTokens) {
        if (token.startsWith('{{') && token.endsWith('}}')) {
            const columnName = token.slice(2, -2).trim();
            if (!columnName) {
                throw new Error('Column placeholder cannot be empty.');
            }
            if (!allowedColumns.has(columnName)) {
                throw new Error(`Unknown column reference: ${columnName}`);
            }
            processed.push({ kind: 'column', name: columnName });
            usedColumns.add(columnName);
            continue;
        }

        if (/^\d*\.?\d+$/.test(token)) {
            processed.push({ kind: 'number', value: Number(token) });
            continue;
        }

        if (token === '+' || token === '-' || token === '*' || token === '/') {
            processed.push({ kind: 'operator', op: token });
            continue;
        }

        if (token === '(' || token === ')') {
            processed.push({ kind: 'paren', value: token });
            continue;
        }

        throw new Error(`Unsupported token: ${token}`);
    }

    if (processed.length === 0) {
        throw new Error('Expression must include at least one term.');
    }

    const normalized = [];
    for (let i = 0; i < processed.length; i++) {
        const token = processed[i];
        if (token.kind === 'operator' && (token.op === '+' || token.op === '-')) {
            const prev = normalized[normalized.length - 1];
            if (!prev || prev.kind === 'operator' || (prev.kind === 'paren' && prev.value === '(')) {
                normalized.push({ kind: 'number', value: 0 });
            }
        }
        normalized.push(token);
    }

    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const output = [];
    const stack = [];

    for (const token of normalized) {
        if (token.kind === 'number' || token.kind === 'column') {
            output.push(token);
            continue;
        }

        if (token.kind === 'operator') {
            while (stack.length) {
                const top = stack[stack.length - 1];
                if (top.kind === 'operator' && precedence[top.op] >= precedence[token.op]) {
                    output.push(stack.pop());
                } else {
                    break;
                }
            }
            stack.push(token);
            continue;
        }

        if (token.kind === 'paren') {
            if (token.value === '(') {
                stack.push(token);
            } else {
                let matched = false;
                while (stack.length) {
                    const popped = stack.pop();
                    if (popped.kind === 'paren' && popped.value === '(') {
                        matched = true;
                        break;
                    }
                    output.push(popped);
                }
                if (!matched) {
                    throw new Error('Mismatched parentheses in expression.');
                }
            }
        }
    }

    while (stack.length) {
        const popped = stack.pop();
        if (popped.kind === 'paren') {
            throw new Error('Mismatched parentheses in expression.');
        }
        output.push(popped);
    }

    if (usedColumns.size === 0) {
        throw new Error('Expression must reference at least one column.');
    }

    return { rpn: output, usedColumns };
}

function evaluateDerivedExpression(rpnTokens, rowData) {
    const stack = [];
    for (const token of rpnTokens) {
        if (token.kind === 'number') {
            stack.push(token.value);
            continue;
        }

        if (token.kind === 'column') {
            const raw = rowData ? rowData[token.name] : undefined;
            if (raw === null || raw === undefined || raw === '') {
                stack.push(null);
                continue;
            }
            const numeric = Number(raw);
            stack.push(Number.isFinite(numeric) ? numeric : null);
            continue;
        }

        if (token.kind === 'operator') {
            if (stack.length < 2) {
                return null;
            }
            const right = stack.pop();
            const left = stack.pop();
            if (left === null || right === null) {
                stack.push(null);
                continue;
            }
            let result = null;
            switch (token.op) {
                case '+':
                    result = left + right;
                    break;
                case '-':
                    result = left - right;
                    break;
                case '*':
                    result = left * right;
                    break;
                case '/':
                    result = right === 0 ? null : left / right;
                    break;
                default:
                    return null;
            }
            stack.push(Number.isFinite(result) ? result : (result === 0 ? 0 : null));
        }
    }

    if (stack.length !== 1) {
        return null;
    }

    const finalValue = stack[0];
    if (finalValue === null) {
        return null;
    }
    return Number.isFinite(finalValue) ? finalValue : (finalValue === 0 ? 0 : null);
}

function applyComputedColumnsToRows(rows, computedSpecs) {
    if (!Array.isArray(rows) || rows.length === 0) return rows;
    for (const row of rows) {
        if (!row || typeof row !== 'object') continue;
        const data = row.data && typeof row.data === 'object' ? row.data : {};
        for (const spec of computedSpecs) {
            if (!spec || !spec.alias || !Array.isArray(spec.rpn)) continue;
            const value = evaluateDerivedExpression(spec.rpn, data);
            data[spec.alias] = value === undefined ? null : value;
        }
        row.data = data;
    }
    return rows;
}

function changeSessionGridPage(datasetId, direction) {
    if (!Number.isFinite(datasetId) || !datasetId || sessionGridState.loading) return;
    const currentOffset = sessionGridState.offsets.get(datasetId) ?? 0;
    const newOffset = Math.max(0, currentOffset + direction * sessionGridState.pageSize);
    if (newOffset === currentOffset) return;
    loadSessionDatasetGrid(datasetId, { offset: newOffset });
}

async function loadSessionDatasetGrid(datasetId, options = {}) {
    if (!window.sessionAPI || !currentSessionId || !Number.isFinite(datasetId)) {
        setSessionGridStatus('Data canvas becomes available once the workspace session is ready.');
        return;
    }

    const offset = Math.max(0, Math.floor(options.offset ?? sessionGridState.offsets.get(datasetId) ?? 0));
    const pageSize = sessionGridState.pageSize;

    try {
        sessionGridState.loading = true;
        setSessionGridStatus('Loading data…');

        let columnInfo = sessionGridState.columns.get(datasetId);
        if (!columnInfo) {
            const columnResponse = await window.sessionAPI.getSessionDatasetColumns(currentSessionId, datasetId);
            const columnDefs = Array.isArray(columnResponse.columns) ? columnResponse.columns : [];
            const columnNames = columnDefs.map((col) => col.name).filter(Boolean);
            columnInfo = {
                baseDefinitions: columnDefs,
                definitions: columnDefs,
                baseNames: columnNames,
                names: columnNames,
                rowCount: Number(columnResponse.row_count ?? 0),
            };
            sessionGridState.columns.set(datasetId, columnInfo);
            sessionGridState.totals.set(datasetId, columnInfo.rowCount);
            populateSessionGridToolbar(datasetId, columnDefs);
        }

        const spec = ensureDatasetSpec(datasetId);
        columnInfo = refreshDerivedColumnDefinitions(datasetId, columnInfo, spec);
        const computedSpecs = ensureComputedSpecsPrepared(datasetId, spec, columnInfo);

        const selectColumns = (columnInfo.baseNames && columnInfo.baseNames.length
            ? columnInfo.baseNames
            : (columnInfo.names || []));

        const querySpec = {
            dataset_id: datasetId,
            columns: selectColumns,
            limit: pageSize,
            offset,
            filters: spec.filters ?? [],
            order_by: spec.order_by ?? [],
        };

        const queryResult = await window.sessionAPI.runSessionQuery(currentSessionId, querySpec);
        const rows = Array.isArray(queryResult?.rows) ? queryResult.rows : [];
        const totalRows = Number(queryResult?.meta?.total_rows ?? sessionGridState.totals.get(datasetId) ?? columnInfo.rowCount ?? 0);

        if (computedSpecs.length > 0 && rows.length > 0) {
            applyComputedColumnsToRows(rows, computedSpecs);
        }

        sessionGridState.offsets.set(datasetId, offset);
        sessionGridState.totals.set(datasetId, totalRows);

        renderSessionGrid(datasetId, columnInfo.definitions, rows, offset, totalRows);
        updateSessionGridPagination(datasetId, offset, totalRows, rows.length);

        if (totalRows > 0) {
            const start = offset + 1;
            const end = Math.min(totalRows, offset + rows.length);
            setSessionGridStatus(`Displaying ${start.toLocaleString()} – ${end.toLocaleString()} of ${totalRows.toLocaleString()} rows`);
        } else {
            setSessionGridStatus('No rows available for this dataset.');
        }
    } catch (error) {
        console.error('Session grid load error:', error);
        const message = error?.response?.data?.error || error.message || 'Failed to load grid data';
        setSessionGridStatus(message, true);
    } finally {
        sessionGridState.loading = false;
    }
}

function renderSessionGrid(datasetId, columnDefs, rows, offset, totalRows) {
    const container = document.getElementById('session-grid-container');
    if (!container) return;

    if (!columnDefs || !columnDefs.length) {
        if (sessionGridToolbar) sessionGridToolbar.classList.add('hidden');
        container.innerHTML = '<p class="text-sm" style="color: var(--text-secondary);">No columns detected for this dataset.</p>';
        updateSessionGridPagination(datasetId, offset, totalRows, rows.length);
        return;
    }

    populateSessionGridToolbar(datasetId, columnDefs);

    const columnNames = columnDefs.map((col) => col.name);
    const headerHtml = ['<th class="px-3 py-2 text-xs uppercase tracking-wide" style="color: var(--text-secondary);">Row</th>']
        .concat(columnDefs.map((col) => `<th class="px-3 py-2 text-xs uppercase tracking-wide" style="color: var(--text-secondary);">${escapeHtml(col.name || '')}</th>`))
        .join('');

    const bodyHtml = rows
        .map((row) => {
            const cells = columnNames
                .map((name) => `<td class="px-3 py-2 text-sm" style="color: var(--text-primary);">${formatCellValue(row.data?.[name])}</td>`)
                .join('');
            return `<tr class="border-b border-gray-200/40"><td class="px-3 py-2 text-sm" style="color: var(--text-secondary);">#${(Number(row.row_number ?? 0) + 1).toLocaleString()}</td>${cells}</tr>`;
        })
        .join('');

    container.innerHTML = `
        <table class="min-w-full border-collapse">
            <thead>
                <tr>${headerHtml}</tr>
            </thead>
            <tbody>${bodyHtml || '<tr><td colspan="' + (columnNames.length + 1) + '" class="px-3 py-6 text-sm text-center" style="color: var(--text-secondary);">No rows in this page.</td></tr>'}</tbody>
        </table>
    `;

    updateSessionGridPagination(datasetId, offset, totalRows, rows.length);
}

function updateSessionGridPagination(datasetId, offset, totalRows, rowCount) {
    const pagination = document.getElementById('session-grid-pagination');
    if (!pagination) return;

    const pageInfo = document.getElementById('session-grid-pageinfo');
    const prevBtn = sessionGridPrevBtn || document.getElementById('session-grid-prev');
    const nextBtn = sessionGridNextBtn || document.getElementById('session-grid-next');
    const pageSize = sessionGridState.pageSize;

    if (!totalRows || totalRows <= pageSize) {
        pagination.classList.add('hidden');
        if (pageInfo) pageInfo.textContent = '';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    pagination.classList.remove('hidden');
    const start = offset + 1;
    const end = Math.min(totalRows, offset + rowCount);
    if (pageInfo) {
        pageInfo.textContent = `${start.toLocaleString()} – ${end.toLocaleString()} of ${totalRows.toLocaleString()}`;
    }
    if (prevBtn) {
        prevBtn.disabled = offset <= 0;
        prevBtn.dataset.datasetId = String(datasetId);
    }
    if (nextBtn) {
        nextBtn.disabled = offset + pageSize >= totalRows;
        nextBtn.dataset.datasetId = String(datasetId);
    }
}

window.loadSessionDatasetGrid = loadSessionDatasetGrid;

function populateSessionGridToolbar(datasetId, columnDefs) {
    if (!sessionGridToolbar) return;
    sessionGridToolbar.classList.remove('hidden');

    let sourceColumns = columnDefs;
    if (!sourceColumns || !sourceColumns.length) {
        const info = sessionGridState.columns.get(datasetId);
        if (info) {
            sourceColumns = info.baseDefinitions || info.definitions || [];
        }
    }

    const columnNames = (sourceColumns || []).map((col) => col.name).filter(Boolean);
    const encodedNames = columnNames.map((name) => ({ raw: name, encoded: encodeURIComponent(name) }));

    const buildOptions = (selectEl, selectedName) => {
        if (!selectEl) return;
        const currentValue = selectedName ? encodeURIComponent(selectedName) : selectEl.value;
        selectEl.innerHTML = encodedNames
            .map(({ raw, encoded }) => `<option value="${encoded}">${escapeHtml(raw)}</option>`)
            .join('');
        if (currentValue && encodedNames.some(({ encoded }) => encoded === currentValue)) {
            selectEl.value = currentValue;
        }
    };

    const spec = ensureDatasetSpec(datasetId);
    const currentFilterColumn = spec.filters && spec.filters[0]?.column;
    const currentSortColumn = spec.order_by && spec.order_by[0]?.column;

    buildOptions(sessionGridFilterColumn, currentFilterColumn);
    buildOptions(sessionGridSortColumn, currentSortColumn);

    const toolbarElements = [
        sessionGridFilterApply,
        sessionGridFilterClear,
        sessionGridSortApply,
        sessionGridSortClear,
        sessionGridDeriveAdd,
        sessionGridDeriveClear,
    ];
    toolbarElements.forEach((el) => {
        if (el) {
            el.dataset.datasetId = String(datasetId);
        }
    });
    if (sessionGridFilterColumn) sessionGridFilterColumn.dataset.datasetId = String(datasetId);
    if (sessionGridFilterOperator) sessionGridFilterOperator.dataset.datasetId = String(datasetId);
    if (sessionGridFilterValue) sessionGridFilterValue.dataset.datasetId = String(datasetId);
    if (sessionGridSortColumn) sessionGridSortColumn.dataset.datasetId = String(datasetId);
    if (sessionGridSortDirection) sessionGridSortDirection.dataset.datasetId = String(datasetId);
}

function ensureDatasetSpec(datasetId) {
    if (!sessionGridState.specs.has(datasetId)) {
        sessionGridState.specs.set(datasetId, { filters: [], order_by: [], computed: [] });
    }
    const spec = sessionGridState.specs.get(datasetId);
    if (!spec.computed) {
        spec.computed = [];
    }
    return spec;
}

function applySessionGridFilter(datasetId) {
    if (!Number.isFinite(datasetId) || !datasetId) return;
    const column = sessionGridFilterColumn ? decodeURIComponent(sessionGridFilterColumn.value || '') : '';
    const operator = sessionGridFilterOperator ? sessionGridFilterOperator.value || '=' : '=';
    const value = sessionGridFilterValue ? sessionGridFilterValue.value : '';

    const spec = ensureDatasetSpec(datasetId);
    const filters = spec.filters ? [...spec.filters] : [];

    if (!column || !operator || value === undefined || value === null || value === '') {
        spec.filters = [];
    } else {
        spec.filters = [
            {
                column,
                operator,
                value,
            },
        ];
    }

    sessionGridState.specs.set(datasetId, spec);
    loadSessionDatasetGrid(datasetId, { offset: 0 });
}

function clearSessionGridFilter(datasetId) {
    if (!Number.isFinite(datasetId) || !datasetId) return;
    if (sessionGridFilterValue) sessionGridFilterValue.value = '';
    const spec = ensureDatasetSpec(datasetId);
    spec.filters = [];
    sessionGridState.specs.set(datasetId, spec);
    loadSessionDatasetGrid(datasetId, { offset: 0 });
}

function applySessionGridSort(datasetId) {
    if (!Number.isFinite(datasetId) || !datasetId) return;
    const column = sessionGridSortColumn ? decodeURIComponent(sessionGridSortColumn.value || '') : '';
    const direction = sessionGridSortDirection ? sessionGridSortDirection.value || 'asc' : 'asc';

    const spec = ensureDatasetSpec(datasetId);
    if (!column) {
        spec.order_by = [];
    } else {
        spec.order_by = [
            {
                column,
                direction,
            },
        ];
    }

    sessionGridState.specs.set(datasetId, spec);
    loadSessionDatasetGrid(datasetId, { offset: 0 });
}

function clearSessionGridSort(datasetId) {
    if (!Number.isFinite(datasetId) || !datasetId) return;
    const spec = ensureDatasetSpec(datasetId);
    spec.order_by = [];
    sessionGridState.specs.set(datasetId, spec);
    loadSessionDatasetGrid(datasetId, { offset: 0 });
}

function createDerivedSessionColumn(datasetId) {
    if (!Number.isFinite(datasetId) || !datasetId) return;
    const columnInfo = sessionGridState.columns.get(datasetId);
    if (!columnInfo) {
        setSessionGridStatus('Load the dataset before deriving new columns.', false);
        return;
    }

    const spec = ensureDatasetSpec(datasetId);
    const existingNames = collectColumnNames(columnInfo, spec);

    const rawAlias = prompt('Name for the derived column (e.g. revenue_margin):');
    if (rawAlias === null) return;
    const alias = rawAlias.trim();
    if (!alias) {
        alert('Derived column name is required.');
        return;
    }
    if (existingNames.has(alias)) {
        alert(`A column named "${alias}" already exists.`);
        return;
    }
    if (alias.length > 80) {
        alert('Please choose a shorter name (80 characters max).');
        return;
    }

    const rawExpression = prompt('Expression using +, -, *, / and column references like {{sales_revenue}}:', '({{sales_revenue}} - {{sales_gross_margin}})');
    if (rawExpression === null) return;
    const expression = rawExpression.trim();
    if (!expression) {
        alert('Expression is required to derive a column.');
        return;
    }

    try {
        const computedSpec = buildComputedColumnSpec(datasetId, columnInfo, spec, alias, expression);
        spec.computed.push(computedSpec);
        sessionGridState.specs.set(datasetId, spec);
        refreshDerivedColumnDefinitions(datasetId, columnInfo, spec);
        loadSessionDatasetGrid(datasetId, { offset: 0 });
    } catch (error) {
        console.error('Failed to create derived column:', error);
        const message = error?.message ? String(error.message) : 'Unable to create derived column.';
        alert(message);
    }
}

function clearDerivedSessionColumns(datasetId) {
    if (!Number.isFinite(datasetId) || !datasetId) return;
    const spec = ensureDatasetSpec(datasetId);
    if (!spec.computed || spec.computed.length === 0) return;

    spec.computed = [];
    sessionGridState.specs.set(datasetId, spec);

    const columnInfo = sessionGridState.columns.get(datasetId);
    if (columnInfo) {
        const baseDefinitions = columnInfo.baseDefinitions || columnInfo.definitions || [];
        sessionGridState.columns.set(datasetId, {
            ...columnInfo,
            definitions: [...baseDefinitions],
        });
    }

    loadSessionDatasetGrid(datasetId, { offset: 0 });
}

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

        if (dataset?.id) {
            loadSessionDatasetGrid(dataset.id);
        }

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
        if (currentDatasetId) {
            loadSessionDatasetGrid(currentDatasetId);
        }
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
                <div class="flex flex-col gap-3">
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
                    <div class="flex flex-wrap items-center gap-2">
                        <button class="neu-button px-3 py-2 text-xs" data-join-action="preview" data-suggestion-id="${suggestion.id}">
                            <i class="fas fa-eye mr-1"></i>Preview
                        </button>
                        <button class="neu-button px-3 py-2 text-xs" data-join-action="apply" data-suggestion-id="${suggestion.id}">
                            <i class="fas fa-link mr-1"></i>Apply
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).filter(Boolean).join('');
}

window.refreshSessionPanel = refreshSessionPanel;

async function handleJoinSuggestionAction(action, suggestionId) {
    if (action === 'preview') {
        await previewJoinSuggestionModal(suggestionId);
        return;
    }
    if (action === 'apply') {
        await applyJoinSuggestionToSession(suggestionId);
    }
}

async function previewJoinSuggestionModal(suggestionId) {
    if (!window.sessionAPI || !currentSessionId) return;
    try {
        setSessionGridStatus('Building join preview…');
        const response = await window.sessionAPI.previewJoinSuggestion(currentSessionId, suggestionId);
        if (response && response.preview) {
            showJoinPreviewModal(response);
            setSessionGridStatus('Join preview ready.');
        } else {
            alert('No preview available for this suggestion.');
            setSessionGridStatus('Join preview unavailable.', true);
        }
    } catch (error) {
        console.error('Join preview failed:', error);
        const message = error?.response?.data?.error || error.message || 'Failed to build join preview.';
        setSessionGridStatus(message, true);
        alert(message);
    }
}

function showJoinPreviewModal(payload) {
    if (activeJoinPreviewModal) {
        activeJoinPreviewModal.remove();
        activeJoinPreviewModal = null;
    }

    const suggestion = payload?.suggestion || {};
    const preview = payload?.preview || {};
    const columns = Array.isArray(preview.columns) ? preview.columns : [];
    const rows = Array.isArray(preview.rows) ? preview.rows : [];
    const totalRows = Number(preview.total_rows ?? rows.length);
    const leftLabel = suggestion.left_label || `Dataset ${suggestion.left_dataset_id}`;
    const rightLabel = suggestion.right_label || `Dataset ${suggestion.right_dataset_id}`;
    const title = `${escapeHtml(leftLabel)} ⋈ ${escapeHtml(rightLabel)}`;

    const headerCells = columns
        .map((col) => `<th class="px-3 py-2 text-xs uppercase tracking-wide" style="color: var(--text-secondary);">${escapeHtml(col?.name || '')}</th>`)
        .join('');

    const bodyRows = rows.length
        ? rows.map((row, index) => {
            const cells = columns
                .map((col) => `<td class="px-3 py-2 text-sm" style="color: var(--text-primary);">${formatCellValue(row?.[col?.name])}</td>`)
                .join('');
            return `<tr class="border-b border-gray-200/40"><td class="px-3 py-2 text-sm" style="color: var(--text-secondary);">#${(index + 1).toLocaleString()}</td>${cells}</tr>`;
        }).join('')
        : `<tr><td colspan="${columns.length + 1}" class="px-3 py-6 text-sm text-center" style="color: var(--text-secondary);">No matching rows found for this join.</td></tr>`;

    const overlay = document.createElement('div');
    overlay.className = 'insight-modal-overlay';
    overlay.innerHTML = `
        <div class="neu-card" style="position: relative; max-width: 960px; width: 100%; max-height: 80vh; overflow: hidden; padding: 1.75rem;">
            <button type="button" class="join-preview-close neu-button" style="position: absolute; top: 1rem; right: 1rem;">
                <i class="fas fa-times"></i>
            </button>
            <h3 class="text-lg font-semibold mb-2" style="color: var(--text-primary);">${title}</h3>
            <p class="text-sm mb-3" style="color: var(--text-secondary);">
                Joining <strong>${escapeHtml(leftLabel)}</strong> (${escapeHtml(suggestion.left_column || '')}) with <strong>${escapeHtml(rightLabel)}</strong> (${escapeHtml(suggestion.right_column || '')}).
            </p>
            <p class="text-xs mb-4" style="color: var(--text-secondary);">Previewing up to ${preview.row_limit || 25} rows • Matches: ${totalRows.toLocaleString()}</p>
            <div style="max-height: 60vh; overflow: auto;">
                <table class="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="px-3 py-2 text-xs uppercase tracking-wide" style="color: var(--text-secondary);">Row</th>
                            ${headerCells}
                        </tr>
                    </thead>
                    <tbody>${bodyRows}</tbody>
                </table>
            </div>
        </div>
    `;

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target.closest('.join-preview-close')) {
            overlay.remove();
            activeJoinPreviewModal = null;
        }
    });

    document.body.appendChild(overlay);
    activeJoinPreviewModal = overlay;
}

async function applyJoinSuggestionToSession(suggestionId) {
    if (!window.sessionAPI || !currentSessionId) return;
    try {
        setSessionGridStatus('Creating joined dataset…');
        const response = await window.sessionAPI.applyJoinSuggestion(currentSessionId, suggestionId);
        if (response?.summary) {
            currentSessionSummary = response.summary;
            window.currentSessionSummary = response.summary;
            renderSessionPanel(response.summary);
        } else {
            await refreshSessionPanel();
        }

        if (response?.dataset_id) {
            currentDatasetId = response.dataset_id;
            await loadSessionDatasetGrid(response.dataset_id, { offset: 0 });
        }

        setSessionGridStatus('Join dataset created.');
    } catch (error) {
        console.error('Join apply failed:', error);
        const message = error?.response?.data?.error || error.message || 'Failed to create joined dataset.';
        setSessionGridStatus(message, true);
        alert(message);
    }
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

function resetUpload() {
    uploadPrompt.classList.remove('hidden');
    uploadProgress.classList.add('hidden');
    fileInput.value = '';
}

const FORENSICS_SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info'];
const FORENSICS_SEVERITY_LABELS = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    info: 'Info',
};
const FORENSICS_SEVERITY_STYLES = {
    critical: { accent: '#ef4444', background: 'rgba(239, 68, 68, 0.12)', pillText: '#ffffff' },
    high: { accent: '#f97316', background: 'rgba(249, 115, 22, 0.12)', pillText: '#ffffff' },
    medium: { accent: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', pillText: '#1f2937' },
    low: { accent: '#0ea5e9', background: 'rgba(14, 165, 233, 0.12)', pillText: '#0f172a' },
    info: { accent: '#64748b', background: 'rgba(100, 116, 139, 0.12)', pillText: '#f8fafc' },
};

function resetForensicsView() {
    currentForensicsOverview = null;
    forensicsLoaded = false;
    forensicsRequestToken += 1;
    if (forensicsSummaryEl) {
        forensicsSummaryEl.innerHTML = '';
    }
    if (forensicsCaseListEl) {
        forensicsCaseListEl.innerHTML = '';
    }
    if (forensicsSignalListEl) {
        forensicsSignalListEl.innerHTML = '';
    }
    if (forensicsStatusEl) {
        forensicsStatusEl.innerHTML = '';
        forensicsStatusEl.classList.add('hidden');
    }
    if (forensicsLastUpdatedEl) {
        forensicsLastUpdatedEl.textContent = '';
        forensicsLastUpdatedEl.classList.add('hidden');
    }
}

function getForensicsSeverityStyle(severity) {
    return FORENSICS_SEVERITY_STYLES[severity] || FORENSICS_SEVERITY_STYLES.info;
}

async function loadForensicsOverview(datasetId) {
    if (!forensicsSummaryEl || !forensicsStatusEl) return;
    forensicsLoaded = false;
    currentForensicsOverview = null;
    const requestId = ++forensicsRequestToken;
    forensicsStatusEl.classList.remove('hidden');
    forensicsStatusEl.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Scanning for data quality signals...';

    try {
        const response = await axios.get(`/api/forensics/datasets/${datasetId}`);
        if (requestId !== forensicsRequestToken) return;
        currentForensicsOverview = response.data;
        renderForensicsOverview(response.data);
        forensicsLoaded = true;
    } catch (error) {
        if (requestId !== forensicsRequestToken) return;
        console.error('Failed to load forensics overview:', error);
        const message = error.response?.data?.error || error.message || 'Unable to fetch forensic insights.';
        forensicsStatusEl.classList.remove('hidden');
        forensicsStatusEl.innerHTML = `<span style="color: #ef4444;">${escapeHtml(message)}</span>`;
    }
}

function renderForensicsOverview(data) {
    if (!forensicsSummaryEl) return;
    renderForensicsSummary(data);
    renderForensicsCases(data?.cases || {});
    renderForensicsSignals(Array.isArray(data?.groups) ? data.groups : []);
    if (forensicsStatusEl) {
        forensicsStatusEl.innerHTML = '';
        forensicsStatusEl.classList.add('hidden');
    }
    if (forensicsLastUpdatedEl) {
        const relative = formatForensicsRelativeTime(data?.summary?.lastUpdated);
        if (relative) {
            forensicsLastUpdatedEl.textContent = `Last signal ${escapeHtml(relative)}`;
            forensicsLastUpdatedEl.classList.remove('hidden');
        } else {
            forensicsLastUpdatedEl.textContent = '';
            forensicsLastUpdatedEl.classList.add('hidden');
        }
    }
}

function renderForensicsSummary(data) {
    if (!forensicsSummaryEl) return;
    const summary = data?.summary || {};
    const groups = Array.isArray(data?.groups) ? data.groups : [];
    const highestSeverity = typeof summary.highestSeverity === 'string' ? summary.highestSeverity : 'info';
    const style = getForensicsSeverityStyle(highestSeverity);
    const counts = summary.severityCounts || {};
    const totalEvents = Number(summary.totalEvents ?? 0);
    const focusGroup = summary.focusGroupId ? groups.find((group) => group.id === summary.focusGroupId) : null;

    const countsList = FORENSICS_SEVERITY_ORDER
        .map((level) => {
            const label = FORENSICS_SEVERITY_LABELS[level];
            const value = Number(counts[level] ?? 0).toLocaleString();
            const chip = getForensicsSeverityStyle(level).accent;
            return `<li class="flex items-center gap-2"><span style="display:inline-block;width:8px;height:8px;border-radius:9999px;background:${chip};"></span>${label}: ${value}</li>`;
        })
        .join('');

    forensicsSummaryEl.innerHTML = `
        <div class="neu-card-inset p-4 rounded-lg" style="border-left: 4px solid ${style.accent}; background: ${style.background};">
            <span class="text-xs font-semibold uppercase" style="color: ${style.accent};">Overall status</span>
            <div class="mt-2 text-xl font-semibold" style="color: var(--text-primary);">${escapeHtml(summary.highestSeverityLabel || FORENSICS_SEVERITY_LABELS[highestSeverity])}</div>
            <p class="mt-2 text-sm" style="color: var(--text-secondary);">${escapeHtml(summary.message || 'We will highlight anything unusual here.')}</p>
        </div>
        <div class="neu-card-inset p-4 rounded-lg">
            <span class="text-xs font-semibold uppercase" style="color: var(--text-secondary);">Alerts spotted</span>
            <div class="mt-2 text-2xl font-bold" style="color: var(--text-primary);">${totalEvents.toLocaleString()}</div>
            <ul class="mt-3 text-sm space-y-1" style="color: var(--text-secondary);">
                ${countsList}
            </ul>
        </div>
        <div class="neu-card-inset p-4 rounded-lg">
            <span class="text-xs font-semibold uppercase" style="color: var(--text-secondary);">Suggested focus</span>
            <p class="mt-2 text-sm" style="color: var(--text-secondary);">
                ${focusGroup
                    ? `Start with <strong>${escapeHtml(focusGroup.title)}</strong> (${escapeHtml(focusGroup.severityLabel)} priority).`
                    : 'As we detect new signals, we will highlight where to start.'}
            </p>
        </div>
    `;
}

function renderForensicsCases(cases) {
    if (!forensicsCaseListEl) return;
    const active = Array.isArray(cases?.active) ? cases.active : [];
    const history = Array.isArray(cases?.history) ? cases.history : [];

    if (active.length === 0 && history.length === 0) {
        forensicsCaseListEl.innerHTML = `
            <div class="neu-card p-6 flex items-start gap-3">
                <i class="fas fa-check-circle text-xl" style="color: #10b981;"></i>
                <div>
                    <h3 class="text-lg font-semibold" style="color: var(--text-primary);">No active investigations yet</h3>
                    <p class="text-sm mt-1" style="color: var(--text-secondary);">When we detect high-impact signals, we'll open a case here automatically.</p>
                </div>
            </div>
        `;
        return;
    }

    let html = '';

    if (active.length > 0) {
        html += active.map((caseItem) => renderCaseCard(caseItem, false)).join('');
    } else {
        html += `
            <div class="neu-card p-6 flex items-start gap-3">
                <i class="fas fa-shield-alt text-xl" style="color: #0ea5e9;"></i>
                <div>
                    <h3 class="text-lg font-semibold" style="color: var(--text-primary);">No open cases</h3>
                    <p class="text-sm mt-1" style="color: var(--text-secondary);">We'll promote new forensic signals into cases for you.</p>
                </div>
            </div>
        `;
    }

    if (history.length > 0) {
        const historyCards = history.map((caseItem) => renderCaseCard(caseItem, true)).join('');
        html += `
            <details class="neu-card p-5 collapsible-card">
                <summary class="flex items-center justify-between cursor-pointer select-none">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-clipboard-check" style="color: var(--text-secondary);"></i>
                        <span class="text-sm font-semibold uppercase tracking-wide" style="color: var(--text-secondary);">
                            Completed investigations (${history.length})
                        </span>
                    </div>
                    <i class="fas fa-chevron-down summary-icon"></i>
                </summary>
                <div class="mt-4 flex flex-col gap-4">
                    ${historyCards}
                </div>
            </details>
        `;
    }

    forensicsCaseListEl.innerHTML = html;
}

function renderCaseCard(caseItem, isHistory) {
    const style = getForensicsSeverityStyle(caseItem?.severity || 'info');
    const title = caseItem?.title || caseItem?.caseType || 'Forensic case';
    const hypothesis = caseItem?.hypothesis || '';
    const eventCountValue = Number(caseItem?.eventCount ?? 0);
    const eventCountLabel = Number.isFinite(eventCountValue) ? eventCountValue.toLocaleString() : '0';
    const relative = formatForensicsRelativeTime(caseItem?.lastEventAt || caseItem?.updatedAt);

    const chipParts = [
        `<span class="px-2 py-1 text-xs font-semibold rounded-full" style="background: ${style.accent}; color: ${style.pillText};">${escapeHtml(caseItem?.severityLabel || 'Info')} priority</span>`,
        `<span class="px-2 py-1 text-xs font-semibold rounded-full" style="background: rgba(15, 23, 42, 0.08); color: var(--text-secondary);">${escapeHtml(caseItem?.statusLabel || 'Open')}</span>`,
    ];
    if (caseItem?.column) {
        chipParts.push(`<span class="text-xs" style="color: var(--text-secondary);">Column: ${escapeHtml(caseItem.column)}</span>`);
    }
    chipParts.push(`<span class="text-xs" style="color: var(--text-secondary);">Signals linked: ${escapeHtml(eventCountLabel)}</span>`);

    const actionButtons = [];
    if (!isHistory) {
        if (caseItem?.action && caseItem.action.label) {
            actionButtons.push(
                `<button class="neu-button px-3 py-2 text-xs" data-forensics-action="${escapeHtml(caseItem.action.type)}"${caseItem.action.column ? ` data-column="${escapeHtml(caseItem.action.column)}"` : ''}>${escapeHtml(caseItem.action.label)}</button>`,
            );
        }
        actionButtons.push(
            `<button class="neu-button px-3 py-2 text-xs" data-forensics-action="resolve-case" data-case-id="${escapeHtml(String(caseItem.id))}"><i class="fas fa-check mr-1"></i>Mark resolved</button>`,
        );
        actionButtons.push(
            `<button class="neu-button px-3 py-2 text-xs" data-forensics-action="dismiss-case" data-case-id="${escapeHtml(String(caseItem.id))}"><i class="fas fa-ban mr-1"></i>Dismiss</button>`,
        );
    } else if (caseItem?.action && caseItem.action.label) {
        actionButtons.push(
            `<button class="neu-button px-3 py-2 text-xs" data-forensics-action="${escapeHtml(caseItem.action.type)}"${caseItem.action.column ? ` data-column="${escapeHtml(caseItem.action.column)}"` : ''}>${escapeHtml(caseItem.action.label)}</button>`,
        );
    }

    const actionsMarkup = actionButtons.length ? `<div class="flex flex-wrap gap-2 mt-3">${actionButtons.join('')}</div>` : '';
    const hypothesisMarkup = hypothesis
        ? `<p class="text-sm" style="color: var(--text-secondary);">${escapeHtml(hypothesis)}</p>`
        : '';

    return `
        <div class="neu-card p-5" style="border-left: 4px solid ${style.accent};">
            <div class="flex flex-col gap-3">
                <div class="flex items-start justify-between gap-3 flex-wrap">
                    <div class="flex flex-wrap items-center gap-2">
                        ${chipParts.join('')}
                    </div>
                    ${relative ? `<span class="text-xs" style="color: var(--text-secondary);">Updated ${escapeHtml(relative)}</span>` : ''}
                </div>
                <h3 class="text-xl font-semibold" style="color: var(--text-primary);">${escapeHtml(title)}</h3>
                ${hypothesisMarkup}
                ${actionsMarkup}
            </div>
        </div>
    `;
}

function renderForensicsSignals(groups) {
    if (!forensicsSignalListEl) return;
    if (!Array.isArray(groups) || groups.length === 0) {
        forensicsSignalListEl.innerHTML = `
            <div class="neu-card p-6 flex items-start gap-3">
                <i class="fas fa-wave-square text-xl" style="color: #94a3b8;"></i>
                <div>
                    <h3 class="text-lg font-semibold" style="color: var(--text-primary);">No raw signals pending</h3>
                    <p class="text-sm mt-1" style="color: var(--text-secondary);">All current findings are already tracked in the investigations above.</p>
                </div>
            </div>
        `;
        return;
    }
    const cards = groups.map((group) => renderSignalCard(group)).join('');
    forensicsSignalListEl.innerHTML = cards;
}

function renderSignalCard(group) {
    const style = getForensicsSeverityStyle(group?.severity || 'info');
    const relative = formatForensicsRelativeTime(group?.lastOccurredAt);
    const nextSteps = Array.isArray(group?.nextSteps)
        ? group.nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')
        : '';
    const actionButton = group?.action && group.action.label
        ? `<button class="neu-button px-3 py-2 text-xs" data-forensics-action="${escapeHtml(group.action.type)}"${group.action.column ? ` data-column="${escapeHtml(group.action.column)}"` : ''}>${escapeHtml(group.action.label)}</button>`
        : '';
    const eventsCount = Number(group?.count ?? 0);
    const eventsLabel = Number.isFinite(eventsCount) ? eventsCount.toLocaleString() : '0';

    return `
        <div class="neu-card p-5" style="border-left: 4px solid ${style.accent};">
            <div class="flex flex-col gap-3">
                <div class="flex items-start justify-between gap-3 flex-wrap">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full" style="background: ${style.accent}; color: ${style.pillText};">${escapeHtml(group?.severityLabel || 'Info')} priority</span>
                        ${group?.column ? `<span class="text-xs" style="color: var(--text-secondary);">Column: ${escapeHtml(group.column)}</span>` : ''}
                        <span class="text-xs" style="color: var(--text-secondary);">Signals: ${escapeHtml(eventsLabel)}</span>
                    </div>
                    ${relative ? `<span class="text-xs" style="color: var(--text-secondary);">Last flagged ${escapeHtml(relative)}</span>` : ''}
                </div>
                <h3 class="text-xl font-semibold" style="color: var(--text-primary);">${escapeHtml(group?.title || group?.eventType || 'Forensic signal')}</h3>
                <p class="text-sm" style="color: var(--text-secondary);">${escapeHtml(group?.headline || '')}</p>
                <p class="text-sm" style="color: var(--text-secondary);">${escapeHtml(group?.whatItMeans || '')}</p>
                ${nextSteps ? `<div><p class="text-xs uppercase font-semibold" style="color: var(--text-secondary); letter-spacing: 0.08em;">Suggested next steps</p><ul class="mt-1 text-sm space-y-1" style="color: var(--text-secondary);">${nextSteps}</ul></div>` : ''}
                ${actionButton ? `<div class="flex flex-wrap gap-2">${actionButton}</div>` : ''}
            </div>
        </div>
    `;
}

function formatForensicsRelativeTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    const diff = Date.now() - date.getTime();
    if (diff < 45 * 1000) return 'just now';
    if (diff < 90 * 1000) return 'about a minute ago';
    const minutes = Math.round(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(diff / 3600000);
    if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(diff / 86400000);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

async function performForensicsCaseStatus(caseId, status) {
    if (!Number.isFinite(caseId) || !status) return;
    try {
        if (forensicsStatusEl) {
            forensicsStatusEl.classList.remove('hidden');
            forensicsStatusEl.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating case...';
        }
        await axios.post(`/api/forensics/cases/${caseId}/status`, { status });
        if (typeof currentDatasetId === 'number' && Number.isFinite(currentDatasetId)) {
            loadForensicsOverview(currentDatasetId);
        }
    } catch (error) {
        console.error('Failed to update case status:', error);
        if (forensicsStatusEl) {
            const message = error.response?.data?.error || error.message || 'Failed to update case status.';
            forensicsStatusEl.classList.remove('hidden');
            forensicsStatusEl.innerHTML = `<span style="color: #ef4444;">${escapeHtml(message)}</span>`;
        }
    }
}

function handleForensicsAction(action) {
    if (!action || !action.type) return;
    if (action.type === 'open-cleaner-column') {
        if (action.column) {
            window.pendingCleanerColumn = action.column;
        }
        openCleaningModal(currentDatasetId);
        return;
    }
    if (action.type === 'focus-insights-column') {
        switchTab('insights');
        if (action.column) {
            const searchInput = document.getElementById('insight-search');
            if (searchInput) {
                searchInput.value = action.column;
            }
            filterInsights(action.column);
        }
        return;
    }
    if (action.type === 'resolve-case') {
        if (Number.isFinite(action.caseId)) {
            performForensicsCaseStatus(action.caseId, 'resolved');
        } else {
            console.warn('Resolve-case action missing caseId', action);
        }
        return;
    }
    if (action.type === 'dismiss-case') {
        if (Number.isFinite(action.caseId)) {
            performForensicsCaseStatus(action.caseId, 'dismissed');
        } else {
            console.warn('Dismiss-case action missing caseId', action);
        }
        return;
    }
    console.warn('Unknown forensics action:', action);
}
