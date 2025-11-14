// Advanced Features UI - Storyboards, Theories, PCA, etc.

// Generate and display storyboard
async function generateStoryboard() {
    if (!currentDatasetId) return;

    const button = document.getElementById('generate-storyboard-btn');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
    }

    try {
        const response = await axios.get(`/api/datasets/${currentDatasetId}/storyboard`);
        displayStoryboard(response.data);
    } catch (error) {
        console.error('Failed to generate storyboard:', error);
        alert('Failed to generate storyboard. Please try again.');
    } finally {
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-book mr-2"></i>Generate Storyboard';
        }
    }
}

// Display storyboard in modal
function displayStoryboard(storyboard) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.style.overflow = 'auto';

    const sectionsHtml = storyboard.sections.map(section => {
        const importanceBg = getImportanceBg(section.importance);
        const importanceText = getImportanceText(section.importance);

        return `
            <div class="neu-card p-6 mb-4">
                <div class="flex items-center gap-3 mb-3">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold"
                          style="background: ${importanceBg}; color: ${importanceText};">
                        ${section.importance.toUpperCase()}
                    </span>
                    <h4 class="text-lg font-bold" style="color: var(--text-primary);">${section.title}</h4>
                </div>
                <p class="mb-4 leading-relaxed" style="color: var(--text-primary);">${section.narrative}</p>
                ${section.insights.length > 0 ? `
                    <details class="mt-4">
                        <summary class="cursor-pointer font-semibold mb-2" style="color: var(--accent);">
                            View ${section.insights.length} insights
                        </summary>
                        <ul class="space-y-2 ml-4">
                            ${section.insights.slice(0, 5).map(insight => `
                                <li class="text-sm" style="color: var(--text-secondary);">
                                    <span class="font-semibold">${formatAnalysisType(insight.type)}</span>
                                    ${insight.column ? `(${insight.column})` : ''}: ${insight.summary}
                                </li>
                            `).join('')}
                        </ul>
                    </details>
                ` : ''}
            </div>
        `;
    }).join('');

    const actionsHtml = storyboard.recommendedActions.map(action => {
        const priorityBg = action.priority === 'critical' ? 'rgba(239, 68, 68, 0.15)' :
                          action.priority === 'high' ? 'rgba(245, 158, 11, 0.15)' :
                          'rgba(59, 130, 246, 0.15)';
        const priorityColor = action.priority === 'critical' ? '#dc2626' :
                             action.priority === 'high' ? '#d97706' :
                             '#2563eb';

        return `
            <div class="neu-card p-6 mb-4">
                <div class="flex items-start gap-3 mb-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                          style="background: ${priorityBg}; color: ${priorityColor};">
                        ${action.priority.toUpperCase()}
                    </span>
                    <h4 class="font-bold" style="color: var(--text-primary);">${action.action}</h4>
                </div>
                <p class="mb-2 text-sm" style="color: var(--text-primary);"><strong>Rationale:</strong> ${action.rationale}</p>
                <p class="text-sm" style="color: var(--text-primary);"><strong>Expected Impact:</strong> ${action.expectedImpact}</p>
            </div>
        `;
    }).join('');

    modal.innerHTML = `
        <div class="neu-card p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">${storyboard.title}</h2>
                    <p class="text-sm" style="color: var(--text-secondary);">
                        Generated: ${new Date(storyboard.generatedAt).toLocaleString()} |
                        ${storyboard.metadata.insightCount} insights, ${storyboard.metadata.visualizationCount} visualizations
                    </p>
                </div>
                <div class="flex gap-2">
                    <button onclick="downloadStoryboardMarkdown()" class="neu-button px-4 py-2">
                        <i class="fas fa-download mr-2"></i>Download MD
                    </button>
                    <button onclick="closeStoryboardModal()" class="neu-button px-4 py-2">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <div class="mb-8 p-6 rounded-lg" style="background: var(--bg-secondary);">
                <h3 class="text-xl font-bold mb-3" style="color: var(--text-primary);">Executive Summary</h3>
                <p style="color: var(--text-primary);">${storyboard.executiveSummary}</p>
            </div>

            <div class="mb-8">
                <h3 class="text-xl font-bold mb-3" style="color: var(--text-primary);">Key Takeaways</h3>
                <ul class="space-y-2">
                    ${storyboard.keyTakeaways.map(takeaway => `
                        <li class="flex items-start gap-2">
                            <i class="fas fa-check-circle mt-1" style="color: var(--accent);"></i>
                            <span style="color: var(--text-primary);">${takeaway}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="mb-8">
                <h3 class="text-xl font-bold mb-4" style="color: var(--text-primary);">Detailed Findings</h3>
                ${sectionsHtml}
            </div>

            <div>
                <h3 class="text-xl font-bold mb-4" style="color: var(--text-primary);">Recommended Actions</h3>
                ${actionsHtml}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    window.currentStoryboard = storyboard;

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeStoryboardModal();
        }
    });
}

function closeStoryboardModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black');
    if (modal) {
        modal.remove();
    }
}

async function downloadStoryboardMarkdown() {
    if (!currentDatasetId) return;

    try {
        const response = await axios.get(`/api/datasets/${currentDatasetId}/storyboard/markdown`, {
            responseType: 'blob'
        });

        const blob = new Blob([response.data], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `storyboard-${currentDatasetId}-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download storyboard:', error);
        alert('Failed to download storyboard. Please try again.');
    }
}

// Get actionable button for theory suggested action
function getActionButton(action, theory) {
    const actionText = action.action.toLowerCase();

    // Dimensionality reduction / PCA
    if (actionText.includes('pca') || actionText.includes('dimensionality reduction') || actionText.includes('principal component')) {
        return `<button onclick="executeTheoryAction('run_pca', ${JSON.stringify(action).replace(/"/g, '&quot;')})" class="neu-button px-3 py-1 text-xs">
            <i class="fas fa-chart-line mr-1"></i>Run PCA
        </button>`;
    }

    // Data cleaning
    if (actionText.includes('missing data') || actionText.includes('clean') || actionText.includes('handle outliers')) {
        return `<button onclick="executeTheoryAction('open_cleaner', ${JSON.stringify(action).replace(/"/g, '&quot;')})" class="neu-button px-3 py-1 text-xs">
            <i class="fas fa-broom mr-1"></i>Open Cleaner
        </button>`;
    }

    // Feature engineering
    if (actionText.includes('feature engineering') || actionText.includes('transformation')) {
        return `<button onclick="executeTheoryAction('view_features', ${JSON.stringify(action).replace(/"/g, '&quot;')})" class="neu-button px-3 py-1 text-xs">
            <i class="fas fa-magic mr-1"></i>View Features
        </button>`;
    }

    // Correlation / relationship analysis
    if (actionText.includes('correlation') || actionText.includes('relationship') || actionText.includes('join')) {
        return `<button onclick="executeTheoryAction('view_correlations', ${JSON.stringify(action).replace(/"/g, '&quot;')})" class="neu-button px-3 py-1 text-xs">
            <i class="fas fa-project-diagram mr-1"></i>View Graph
        </button>`;
    }

    // Temporal/time series analysis
    if (actionText.includes('time') || actionText.includes('temporal') || actionText.includes('forecast') || actionText.includes('trend')) {
        return `<button onclick="executeTheoryAction('view_trends', ${JSON.stringify(action).replace(/"/g, '&quot;')})" class="neu-button px-3 py-1 text-xs">
            <i class="fas fa-chart-area mr-1"></i>View Trends
        </button>`;
    }

    // Statistical tests
    if (actionText.includes('test') || actionText.includes('statistical') || actionText.includes('hypothesis')) {
        return `<button onclick="executeTheoryAction('view_statistics', ${JSON.stringify(action).replace(/"/g, '&quot;')})" class="neu-button px-3 py-1 text-xs">
            <i class="fas fa-calculator mr-1"></i>View Stats
        </button>`;
    }

    // Investigation / data quality
    if (actionText.includes('investigate') || actionText.includes('inspect') || actionText.includes('validate')) {
        return `<button onclick="executeTheoryAction('investigate', ${JSON.stringify(action).replace(/"/g, '&quot;')})" class="neu-button px-3 py-1 text-xs">
            <i class="fas fa-search mr-1"></i>Investigate
        </button>`;
    }

    // Default: open insights filtered by related terms
    return `<button onclick="executeTheoryAction('search_insights', ${JSON.stringify(action).replace(/"/g, '&quot;')})" class="neu-button px-3 py-1 text-xs">
        <i class="fas fa-lightbulb mr-1"></i>Find Insights
    </button>`;
}

// Execute theory action
async function executeTheoryAction(actionType, action) {
    console.log('Executing theory action:', actionType, action);

    // Close the theories modal first
    closeTheoriesModal();

    // Small delay to let modal close
    await new Promise(resolve => setTimeout(resolve, 200));

    switch (actionType) {
        case 'run_pca':
            // Search for PCA in insights
            const searchInput = document.querySelector('input[placeholder*="Search"]');
            if (searchInput) {
                searchInput.value = 'pca';
                searchInput.dispatchEvent(new Event('input'));
            }
            // Show a guide
            showActionGuide('PCA Analysis',
                'Look for "PCA" or "Principal Component" insights in the list below. ' +
                'If PCA hasn\'t run yet, it will appear after re-analyzing the dataset with 3+ numeric columns.');
            break;

        case 'open_cleaner':
            // Try to open the cleaner panel
            if (typeof window.openCleanerPanel === 'function') {
                window.openCleanerPanel();
            } else {
                showActionGuide('Data Cleaning',
                    'Navigate to the Data Cleaner section to address missing values and outliers. ' +
                    'Use the cleaning suggestions to improve data quality.');
            }
            break;

        case 'view_features':
            // Search for feature suggestions
            const featureSearch = document.querySelector('input[placeholder*="Search"]');
            if (featureSearch) {
                featureSearch.value = 'feature';
                featureSearch.dispatchEvent(new Event('input'));
            }
            showActionGuide('Feature Engineering',
                'Review the "Feature Engineering" insights below for transformation suggestions. ' +
                'Click the action buttons to apply transformations to your data.');
            break;

        case 'view_correlations':
            // Switch to graph tab if available
            const graphTab = document.querySelector('[data-tab="graph"]');
            if (graphTab) {
                graphTab.click();
                showActionGuide('Correlation Network',
                    'The network graph visualizes relationships between variables. ' +
                    'Strongly connected nodes indicate high correlation.');
            } else {
                const corrSearch = document.querySelector('input[placeholder*="Search"]');
                if (corrSearch) {
                    corrSearch.value = 'correlation';
                    corrSearch.dispatchEvent(new Event('input'));
                }
            }
            break;

        case 'view_trends':
            // Search for trend/time series insights
            const trendSearch = document.querySelector('input[placeholder*="Search"]');
            if (trendSearch) {
                trendSearch.value = 'trend';
                trendSearch.dispatchEvent(new Event('input'));
            }
            showActionGuide('Temporal Analysis',
                'Review trend and time-series insights below. ' +
                'Look for patterns, seasonality, and forecasting opportunities.');
            break;

        case 'view_statistics':
            // Search for statistics
            const statsSearch = document.querySelector('input[placeholder*="Search"]');
            if (statsSearch) {
                statsSearch.value = 'statistics';
                statsSearch.dispatchEvent(new Event('input'));
            }
            showActionGuide('Statistical Analysis',
                'Review statistical summaries and distribution insights below. ' +
                'Look for skewness, outliers, and data quality indicators.');
            break;

        case 'investigate':
            showActionGuide('Data Investigation',
                `Action: ${action.action}\n\n` +
                `Rationale: ${action.rationale}\n\n` +
                `Next Steps:\n` +
                `1. Review related insights in the list below\n` +
                `2. Check the Data Canvas for sample data\n` +
                `3. Use the network graph to explore relationships\n` +
                `4. Consider generating a storyboard for comprehensive analysis`);
            break;

        case 'search_insights':
            // Extract key terms from action and search
            const keywords = extractKeywords(action.action);
            const insightSearch = document.querySelector('input[placeholder*="Search"]');
            if (insightSearch && keywords) {
                insightSearch.value = keywords;
                insightSearch.dispatchEvent(new Event('input'));
            }
            showActionGuide('Related Insights',
                `Searching for insights related to: "${keywords || action.action}"\n\n` +
                `Review the filtered insights below for relevant analysis.`);
            break;
    }
}

// Extract keywords from action text
function extractKeywords(text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));
    return words.length > 0 ? words[0] : null;
}

// Show action guide popup
function showActionGuide(title, message) {
    const guide = document.createElement('div');
    guide.className = 'fixed top-20 right-4 neu-card p-4 max-w-md z-50 animate-slide-in';
    guide.style.animation = 'slideInRight 0.3s ease-out';

    guide.innerHTML = `
        <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
                <i class="fas fa-info-circle" style="color: var(--accent);"></i>
                <h3 class="font-bold" style="color: var(--text-primary);">${title}</h3>
            </div>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <p class="text-sm whitespace-pre-line" style="color: var(--text-primary);">${message}</p>
    `;

    document.body.appendChild(guide);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (guide.parentNode) {
            guide.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => guide.remove(), 300);
        }
    }, 10000);
}

// Generate and display theories
async function generateTheories() {
    if (!currentDatasetId) return;

    const button = document.getElementById('generate-theories-btn');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
    }

    try {
        const response = await axios.get(`/api/forensics/datasets/${currentDatasetId}/theories`);
        displayTheories(response.data);
    } catch (error) {
        console.error('Failed to generate theories:', error);
        alert('Failed to generate theories. Please try again.');
    } finally {
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-flask mr-2"></i>Generate Theories';
        }
    }
}

// Display theories in modal
function displayTheories(data) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.style.overflow = 'auto';

    const theoriesHtml = data.theories.map((theory, idx) => {
        const testHtml = theory.statistical_tests && theory.statistical_tests.length > 0 ? `
            <div class="mb-4">
                <h4 class="font-semibold mb-2" style="color: var(--text-primary);">Statistical Tests</h4>
                ${theory.statistical_tests.map(test => {
                    const resultBg = test.result === 'reject_null' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)';
                    const resultColor = test.result === 'reject_null' ? '#059669' : '#64748b';
                    return `
                        <div class="mb-2">
                            <div class="flex items-center gap-4 text-sm">
                                <span class="font-mono" style="color: var(--accent);">${test.testName}</span>
                                <span style="color: var(--text-secondary);">Statistic: ${test.testStatistic.toFixed(2)}</span>
                                <span class="px-2 py-1 rounded text-xs" style="background: ${resultBg}; color: ${resultColor};">
                                    ${test.result.replace(/_/g, ' ').toUpperCase()}
                                </span>
                            </div>
                            <p class="text-xs ml-4 mt-1" style="color: var(--text-secondary);">${test.interpretation}</p>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : '';

        const questionsHtml = theory.open_questions && theory.open_questions.length > 0 ? `
            <details class="mb-4">
                <summary class="cursor-pointer font-semibold mb-2" style="color: var(--accent);">
                    Open Questions (${theory.open_questions.length})
                </summary>
                <ul class="space-y-1 ml-4">
                    ${theory.open_questions.map(q => `
                        <li class="text-sm flex items-start gap-2">
                            <i class="fas fa-question-circle mt-1" style="color: var(--accent);"></i>
                            <span style="color: var(--text-primary);">${q}</span>
                        </li>
                    `).join('')}
                </ul>
            </details>
        ` : '';

        const actionsHtml = theory.suggested_actions && theory.suggested_actions.length > 0 ? `
            <div>
                <h4 class="font-semibold mb-2" style="color: var(--text-primary);">Suggested Actions</h4>
                <div class="space-y-3">
                    ${theory.suggested_actions.map((action, actionIdx) => {
                        const priorityBg = action.priority === 'high' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)';
                        const priorityColor = action.priority === 'high' ? '#d97706' : '#2563eb';
                        const actionButton = getActionButton(action, theory);
                        return `
                            <div class="p-3 rounded-lg" style="background: var(--bg-secondary);">
                                <div class="flex items-start justify-between gap-2 mb-1">
                                    <div class="flex items-start gap-2 flex-1">
                                        <span class="px-2 py-1 rounded text-xs font-semibold flex-shrink-0"
                                              style="background: ${priorityBg}; color: ${priorityColor};">
                                            ${action.priority.toUpperCase()}
                                        </span>
                                        <span class="font-semibold text-sm" style="color: var(--text-primary);">${action.action}</span>
                                    </div>
                                    ${actionButton}
                                </div>
                                <p class="text-xs ml-2 mb-1" style="color: var(--text-secondary);"><strong>Rationale:</strong> ${action.rationale}</p>
                                <p class="text-xs ml-2" style="color: var(--text-secondary);"><strong>Expected:</strong> ${action.expected_outcome}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : '';

        const importanceBg = getImportanceBg(theory.severity);
        const importanceText = getImportanceText(theory.severity);
        const evidenceBg = getEvidenceStrengthBg(theory.evidence_strength);
        const evidenceColor = getEvidenceStrengthColor(theory.evidence_strength);

        return `
            <div class="neu-card p-6">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl font-bold" style="color: var(--accent);">#${idx + 1}</span>
                        <span class="px-3 py-1 rounded-full text-xs font-semibold"
                              style="background: ${importanceBg}; color: ${importanceText};">
                            ${theory.severity.toUpperCase()}
                        </span>
                    </div>
                    <div class="text-sm font-semibold" style="color: var(--text-secondary);">
                        Confidence: ${(theory.confidence_score * 100).toFixed(0)}%
                    </div>
                </div>

                <div class="mb-4">
                    <h3 class="text-lg font-bold mb-2" style="color: var(--text-primary);">Hypothesis</h3>
                    <p class="leading-relaxed" style="color: var(--text-primary);">${theory.hypothesis}</p>
                </div>

                <div class="mb-4 p-4 rounded-lg" style="background: var(--bg-secondary);">
                    <h4 class="font-semibold mb-2" style="color: var(--text-secondary);">Alternative Hypothesis</h4>
                    <p class="text-sm" style="color: var(--text-primary);">${theory.alternative_hypothesis}</p>
                </div>

                ${testHtml}

                <div class="mb-4">
                    <h4 class="font-semibold mb-2" style="color: var(--text-primary);">Evidence</h4>
                    <div class="flex items-center gap-4 mb-2">
                        <span class="text-sm" style="color: var(--text-secondary);">
                            <i class="fas fa-check-circle text-green-500 mr-1"></i>
                            Supporting: ${theory.supporting_evidence_count}
                        </span>
                        <span class="text-sm" style="color: var(--text-secondary);">
                            <i class="fas fa-times-circle text-red-500 mr-1"></i>
                            Contradicting: ${theory.contradicting_evidence_count}
                        </span>
                        <span class="px-2 py-1 rounded-full text-xs" style="background: ${evidenceBg}; color: ${evidenceColor};">
                            ${theory.evidence_strength.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                ${questionsHtml}
                ${actionsHtml}
            </div>
        `;
    }).join('');

    const contentHtml = data.theories.length === 0 ? `
        <div class="text-center py-12" style="color: var(--text-secondary);">
            <i class="fas fa-flask text-5xl mb-4"></i>
            <p>No theories generated yet. More data analysis needed.</p>
        </div>
    ` : `<div class="space-y-6">${theoriesHtml}</div>`;

    modal.innerHTML = `
        <div class="neu-card p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">Data Theories & Hypotheses</h2>
                    <p class="text-sm" style="color: var(--text-secondary);">${data.theory_count} theories generated</p>
                </div>
                <button onclick="closeTheoriesModal()" class="neu-button px-4 py-2">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ${contentHtml}
        </div>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeTheoriesModal();
        }
    });
}

function closeTheoriesModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black');
    if (modal) {
        modal.remove();
    }
}

function getEvidenceStrengthBg(strength) {
    switch (strength) {
        case 'very_strong': return 'rgba(16, 185, 129, 0.15)';
        case 'strong': return 'rgba(34, 197, 94, 0.15)';
        case 'moderate': return 'rgba(59, 130, 246, 0.15)';
        default: return 'rgba(148, 163, 184, 0.15)';
    }
}

function getEvidenceStrengthColor(strength) {
    switch (strength) {
        case 'very_strong': return '#059669';
        case 'strong': return '#16a34a';
        case 'moderate': return '#2563eb';
        default: return '#64748b';
    }
}

// Add action buttons to dataset info
function addAdvancedFeatureButtons() {
    const container = document.getElementById('dataset-info');
    if (!container || !currentDatasetId) return;

    // Check if buttons already exist
    if (document.getElementById('advanced-features-container')) return;

    const buttonsHtml = `
        <div id="advanced-features-container" class="neu-card p-4 col-span-2">
            <div class="text-sm font-semibold mb-3" style="color: var(--accent);">Advanced Analysis</div>
            <div class="flex gap-3 flex-wrap">
                <button id="generate-storyboard-btn" onclick="generateStoryboard()" class="neu-button px-4 py-2">
                    <i class="fas fa-book mr-2"></i>Generate Storyboard
                </button>
                <button id="generate-theories-btn" onclick="generateTheories()" class="neu-button px-4 py-2">
                    <i class="fas fa-flask mr-2"></i>Generate Theories
                </button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', buttonsHtml);
}

// Make functions globally accessible
window.generateStoryboard = generateStoryboard;
window.generateTheories = generateTheories;
window.closeStoryboardModal = closeStoryboardModal;
window.closeTheoriesModal = closeTheoriesModal;
window.downloadStoryboardMarkdown = downloadStoryboardMarkdown;
window.addAdvancedFeatureButtons = addAdvancedFeatureButtons;
window.executeTheoryAction = executeTheoryAction;
