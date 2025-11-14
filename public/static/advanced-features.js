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
                    ${theory.suggested_actions.map(action => {
                        const priorityBg = action.priority === 'high' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)';
                        const priorityColor = action.priority === 'high' ? '#d97706' : '#2563eb';
                        return `
                            <div class="p-3 rounded-lg" style="background: var(--bg-secondary);">
                                <div class="flex items-start gap-2 mb-1">
                                    <span class="px-2 py-1 rounded text-xs font-semibold flex-shrink-0"
                                          style="background: ${priorityBg}; color: ${priorityColor};">
                                        ${action.priority.toUpperCase()}
                                    </span>
                                    <span class="font-semibold text-sm" style="color: var(--text-primary);">${action.action}</span>
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
