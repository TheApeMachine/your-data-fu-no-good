// Data Intelligence Platform - Frontend JavaScript

let currentDatasetId = null;

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

        // Fetch visualizations
        const visualizationsResponse = await axios.get(`/api/datasets/${datasetId}/visualizations`);
        const { visualizations } = visualizationsResponse.data;

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

// Display visualizations
function displayVisualizations(visualizations) {
    const container = document.getElementById('visualizations-container');
    
    if (visualizations.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-8 text-gray-500">
                <i class="fas fa-chart-bar text-3xl mb-3"></i>
                <p>No visualizations generated yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    visualizations.forEach((viz, index) => {
        const canvasId = `chart-${index}`;
        const cardDiv = document.createElement('div');
        cardDiv.className = 'bg-gray-50 rounded-lg p-4';
        cardDiv.innerHTML = `
            <div class="mb-3">
                <h3 class="font-semibold text-gray-900">${viz.title}</h3>
                <p class="text-sm text-gray-600 mt-1">${viz.explanation}</p>
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

// Display dataset information
function displayDatasetInfo(dataset) {
    const info = document.getElementById('dataset-info');
    info.innerHTML = `
        <div class="bg-blue-50 rounded-lg p-4">
            <div class="text-sm text-blue-600 font-semibold">Dataset Name</div>
            <div class="text-xl font-bold text-blue-900">${dataset.name}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
            <div class="text-sm text-green-600 font-semibold">Total Rows</div>
            <div class="text-xl font-bold text-green-900">${dataset.row_count.toLocaleString()}</div>
        </div>
        <div class="bg-purple-50 rounded-lg p-4">
            <div class="text-sm text-purple-600 font-semibold">Columns</div>
            <div class="text-xl font-bold text-purple-900">${dataset.column_count}</div>
        </div>
        <div class="bg-yellow-50 rounded-lg p-4">
            <div class="text-sm text-yellow-600 font-semibold">Status</div>
            <div class="text-xl font-bold text-yellow-900">
                <i class="fas fa-check-circle text-green-600"></i> Analyzed
            </div>
        </div>
    `;

    // Update print metadata
    const printName = document.getElementById('print-dataset-name');
    const printTimestamp = document.getElementById('print-timestamp');
    if (printName) printName.textContent = `Dataset: ${dataset.name} (${dataset.row_count} rows, ${dataset.column_count} columns)`;
    if (printTimestamp) printTimestamp.textContent = `Generated: ${new Date().toLocaleString()}`;
}

// Display insights
function displayInsights(analyses) {
    const container = document.getElementById('insights-container');
    
    if (analyses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-spinner fa-spin text-3xl mb-3"></i>
                <p>Analyzing your data... This may take a moment.</p>
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
        <div class="insight-card bg-gray-50 rounded-lg p-5 importance-${analysis.importance}">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        ${getAnalysisIcon(analysis.analysis_type)}
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900">${formatAnalysisType(analysis.analysis_type)}</h3>
                        ${analysis.column_name ? `<p class="text-sm text-gray-600">${analysis.column_name}</p>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-${getImportanceColor(analysis.importance)}-100 text-${getImportanceColor(analysis.importance)}-700">
                        ${analysis.importance.toUpperCase()}
                    </span>
                    <span class="text-sm text-gray-500">${Math.round(analysis.confidence * 100)}% sure</span>
                </div>
            </div>
            <p class="text-gray-700 leading-relaxed">${analysis.explanation}</p>
        </div>
    `).join('');
}

// Display sample data
function displaySampleData(sample, columns) {
    const container = document.getElementById('sample-data');
    
    if (sample.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No data to display</p>';
        return;
    }

    const headers = columns.map(col => col.name);
    
    container.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    ${headers.map(h => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${h}</th>`).join('')}
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${sample.map(row => `
                    <tr>
                        ${headers.map(h => `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${row[h] ?? 'null'}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
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
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-folder-open text-5xl mb-4"></i>
                    <p class="text-lg">No datasets yet. Upload one to get started!</p>
                </div>
            `;
        } else {
            list.innerHTML = datasets.map(ds => `
                <div class="border rounded-lg p-4 mb-4 hover:bg-gray-50 cursor-pointer transition" onclick="loadDatasetResults(${ds.id})">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="font-semibold text-lg text-gray-900">${ds.name}</h3>
                            <p class="text-sm text-gray-600">${ds.row_count.toLocaleString()} rows × ${ds.column_count} columns</p>
                            <p class="text-xs text-gray-500 mt-1">Uploaded ${new Date(ds.upload_date).toLocaleDateString()}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="event.stopPropagation(); deleteDataset(${ds.id})" class="px-3 py-1 text-red-600 hover:bg-red-50 rounded">
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
        statistics: '<i class="fas fa-chart-bar text-blue-600"></i>',
        correlation: '<i class="fas fa-project-diagram text-purple-600"></i>',
        outlier: '<i class="fas fa-exclamation-triangle text-orange-600"></i>',
        pattern: '<i class="fas fa-puzzle-piece text-green-600"></i>',
        trend: '<i class="fas fa-chart-line text-red-600"></i>',
        clustering: '<i class="fas fa-layer-group text-indigo-600"></i>'
    };
    return icons[type] || '<i class="fas fa-info-circle text-gray-600"></i>';
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

function getImportanceColor(importance) {
    const colors = {
        high: 'red',
        medium: 'yellow',
        low: 'green'
    };
    return colors[importance] || 'gray';
}
