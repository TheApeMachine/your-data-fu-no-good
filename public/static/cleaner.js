// Data Cleaning UI

let cleaningModalOpen = false;
let currentCleaningDatasetId = null;
let suggestedKeyColumns = [];
let allColumnsForCleaning = [];

/**
 * Open cleaning modal for a dataset
 */
async function openCleaningModal(datasetId) {
    currentCleaningDatasetId = datasetId;
    
    // Fetch suggestions
    try {
        const response = await axios.get(`/api/clean/${datasetId}/suggestions`);
        if (response.data.success) {
            suggestedKeyColumns = response.data.suggestedKeyColumns;
            allColumnsForCleaning = response.data.allColumns;
        }
    } catch (error) {
        console.error('Failed to fetch cleaning suggestions:', error);
    }
    
    // Show modal
    document.getElementById('cleaning-modal').classList.remove('hidden');
    cleaningModalOpen = true;
    
    // Set default level
    selectCleaningLevel('light');
    
    // Render key columns selector
    renderKeyColumnsSelector();
}

/**
 * Close cleaning modal
 */
function closeCleaningModal() {
    document.getElementById('cleaning-modal').classList.add('hidden');
    cleaningModalOpen = false;
    currentCleaningDatasetId = null;
}

/**
 * Select cleaning level
 */
function selectCleaningLevel(level) {
    // Update button states
    ['light', 'standard', 'aggressive'].forEach(l => {
        const btn = document.getElementById(`clean-level-${l}`);
        if (l === level) {
            btn.classList.add('active');
            btn.style.background = 'linear-gradient(145deg, var(--accent), #2563eb)';
            btn.style.color = 'white';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'var(--bg-primary)';
            btn.style.color = 'var(--text-primary)';
        }
    });
    
    // Show/hide relevant options
    document.getElementById('standard-options').classList.toggle('hidden', level === 'light');
    document.getElementById('aggressive-options').classList.toggle('hidden', level !== 'aggressive');
    
    // Update description
    const descriptions = {
        light: 'Removes duplicate rows and rows with >50% empty values. Trims whitespace. Safe for all datasets.',
        standard: 'Light clean + removes rows with empty key columns, standardizes text, fills small numeric gaps. Recommended for most datasets.',
        aggressive: 'Standard clean + removes statistical outliers and rare category values. Use with caution on important data.'
    };
    
    document.getElementById('clean-level-description').textContent = descriptions[level];
}

/**
 * Render key columns selector
 */
function renderKeyColumnsSelector() {
    const container = document.getElementById('key-columns-selector');
    
    if (allColumnsForCleaning.length === 0) {
        container.innerHTML = '<p class="text-sm" style="color: var(--text-secondary);">Loading columns...</p>';
        return;
    }
    
    container.innerHTML = `
        <p class="text-sm mb-2" style="color: var(--text-secondary);">
            Select columns that must have values (rows with empty key columns will be removed):
        </p>
        <div class="grid grid-cols-2 gap-2">
            ${allColumnsForCleaning.map(col => {
                const isSuggested = suggestedKeyColumns.includes(col);
                return `
                    <label class="flex items-center gap-2 p-2 rounded neu-card-inset cursor-pointer hover:bg-opacity-50">
                        <input type="checkbox" 
                               class="key-column-checkbox" 
                               value="${col}"
                               ${isSuggested ? 'checked' : ''}>
                        <span class="text-sm" style="color: var(--text-primary);">
                            ${col}
                            ${isSuggested ? '<span style="color: var(--accent);">★</span>' : ''}
                        </span>
                    </label>
                `;
            }).join('')}
        </div>
        <p class="text-xs mt-2" style="color: var(--text-secondary);">
            <i class="fas fa-star" style="color: var(--accent);"></i> = Suggested based on low null rate
        </p>
    `;

    const targetColumn = window.pendingCleanerColumn;
    if (targetColumn) {
        const checkbox = container.querySelector(`input[value="${targetColumn}"]`);
        if (checkbox) {
            checkbox.checked = true;
            const label = checkbox.closest('label');
            if (label) {
                label.style.boxShadow = '0 0 0 2px var(--accent)';
                label.style.transition = 'box-shadow 0.3s ease';
                setTimeout(() => {
                    label.style.boxShadow = '';
                }, 2500);
                label.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        window.pendingCleanerColumn = null;
    }
}

/**
 * Execute cleaning
 */
async function executeCleaningData() {
    if (!currentCleaningDatasetId) return;
    
    // Determine selected level
    let level = 'light';
    if (document.getElementById('clean-level-standard').classList.contains('active')) {
        level = 'standard';
    } else if (document.getElementById('clean-level-aggressive').classList.contains('active')) {
        level = 'aggressive';
    }
    
    // Get selected key columns (for standard+)
    let keyColumns = [];
    if (level !== 'light') {
        const checkboxes = document.querySelectorAll('.key-column-checkbox:checked');
        keyColumns = Array.from(checkboxes).map(cb => cb.value);
    }
    
    // Get aggressive options
    const removeOutliers = document.getElementById('remove-outliers')?.checked ?? true;
    const removeRareCategories = document.getElementById('remove-rare-categories')?.checked ?? true;
    
    // Build cleaning options
    const options = {
        level,
        keyColumns,
        removeOutliers,
        removeRareCategories,
        rareCategoryThreshold: 0.01 // 1%
    };
    
    console.log('Cleaning options:', options);
    
    // Show loading state
    const executeBtn = document.getElementById('execute-clean-btn');
    const originalText = executeBtn.innerHTML;
    executeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Cleaning...';
    executeBtn.disabled = true;
    
    try {
        const response = await axios.post(`/api/clean/${currentCleaningDatasetId}`, options);
        
        if (response.data.success) {
            // Close modal
            closeCleaningModal();
            
            // Show success message
            const message = `
                <div class="neu-card p-4 rounded-lg mb-4" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);">
                    <h3 class="font-semibold mb-2" style="color: var(--text-primary);">
                        <i class="fas fa-check-circle mr-2" style="color: #10b981;"></i>
                        Data Cleaned Successfully!
                    </h3>
                    <p class="text-sm mb-2" style="color: var(--text-secondary);">
                        ${response.data.message}
                    </p>
                    <ul class="text-sm space-y-1 mb-3" style="color: var(--text-secondary);">
                        <li><strong>Original rows:</strong> ${response.data.originalRowCount.toLocaleString()}</li>
                        <li><strong>Cleaned rows:</strong> ${response.data.cleanedRowCount.toLocaleString()}</li>
                        <li><strong>Removed rows:</strong> ${response.data.removedRowCount.toLocaleString()} (${((response.data.removedRowCount / response.data.originalRowCount) * 100).toFixed(1)}%)</li>
                    </ul>
                    <div class="text-sm mb-3" style="color: var(--text-secondary);">
                        <strong>Cleaning actions:</strong>
                        <ul class="list-disc list-inside mt-1">
                            ${response.data.cleaningActions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                    <button onclick="loadDatasetResults(${response.data.cleanedDatasetId})" class="neu-button-accent">
                        <i class="fas fa-eye mr-2"></i>View Cleaned Dataset
                    </button>
                </div>
            `;
            
            // Insert message at top of results section
            const resultsSection = document.getElementById('results-section');
            resultsSection.insertAdjacentHTML('afterbegin', message);
            
            // Reload datasets list if visible
            if (!document.getElementById('datasets-section').classList.contains('hidden')) {
                loadDatasets();
            }
        } else {
            alert('Cleaning failed: ' + response.data.error);
        }
        
    } catch (error) {
        console.error('Cleaning error:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Cleaning failed';
        alert('Error: ' + errorMsg);
    } finally {
        executeBtn.innerHTML = originalText;
        executeBtn.disabled = false;
    }
}
