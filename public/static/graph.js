// Cytoscape.js relationship graph visualization

let cy = null;
let currentLayoutName = 'random';
let currentViewMode = 'all';
let previousPositions = null;
let pendingFocus = null;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function switchTab(tabName) {
    const tabs = ['insights', 'relationships', 'topics', 'mappings'];
    tabs.forEach((name) => {
        const button = document.getElementById(`tab-${name}`);
        const content = document.getElementById(`tab-content-${name}`);
        if (button) {
            button.classList.toggle('active', tabName === name);
        }
        if (content) {
            content.classList.toggle('hidden', tabName !== name);
        }
    });

    if (tabName === 'relationships' && currentDatasetId) {
        loadRelationshipGraph(currentDatasetId);
    }

    if (tabName === 'topics' && currentDatasetId) {
        loadTopics(currentDatasetId);
    }

    if (tabName === 'mappings' && currentDatasetId) {
        loadColumnMappings(currentDatasetId);
    }
}

async function loadRelationshipGraph(datasetId) {
    try {
        const response = await axios.get(`/api/relationships/${datasetId}`);
        const { nodes, edges } = response.data;

        renderGraph(nodes, edges);
    } catch (error) {
        console.error('Error loading relationship graph:', error);
        document.getElementById('graph-container').innerHTML = '<p class="text-red-600">Failed to load relationship graph</p>';
    }
}

function renderGraph(nodes, edges) {
    const container = document.getElementById('graph-container');
    
    // Clear container
    container.innerHTML = '<div id="cy" style="width: 100%; height: 100%;"></div>';

    // Find nodes that have at least one connection
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
    });

    // Filter to only connected nodes
    const connectedNodes = nodes.filter(node => connectedNodeIds.has(node.id));

    console.log(`Graph: ${nodes.length} total nodes, ${connectedNodes.length} connected nodes, ${edges.length} edges`);

    const hasTopicNodes = connectedNodes.some((node) => node.type === 'topic' || node.type === 'topic_cluster');
    if (!hasTopicNodes && currentViewMode === 'topics') {
        currentViewMode = 'all';
    }

    // Convert to Cytoscape format
    const elements = [];
    
    // Add only connected nodes
    connectedNodes.forEach(node => {
        elements.push({
            data: {
                id: node.id,
                label: node.label,
                type: node.type,
                nodeSize: node.size
            }
        });
    });
    
    // Add edges
    edges.forEach(edge => {
        elements.push({
            data: {
                id: `${edge.source}-${edge.target}`,
                source: edge.source,
                target: edge.target,
                type: edge.type,
                strength: edge.strength,
                label: edge.label
            }
        });
    });

    // Initialize Cytoscape
    cy = cytoscape({
        container: document.getElementById('cy'),
        
        elements: elements,
        
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': function(ele) {
                        const type = ele.data('type');
                        if (type === 'column') return '#3b82f6';
                        if (type === 'topic') return '#14b8a6';
                        if (type === 'topic_cluster') return '#0ea5e9';
                        return '#10b981';
                    },
                    'label': 'data(label)',
                    'width': function(ele) { return ele.data('nodeSize') * 2; },
                    'height': function(ele) { return ele.data('nodeSize') * 2; },
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '10px',
                    'color': '#1f2937',
                    'text-outline-width': 2,
                    'text-outline-color': '#ffffff',
                    'overlay-padding': 6,
                    'border-width': 0,
                    'z-index': 10
                }
            },
            {
                selector: 'node.highlighted',
                style: {
                    'background-color': '#f97316',
                    'border-color': '#fb923c',
                    'border-width': 3,
                    'opacity': 1
                }
            },
            {
                selector: 'node.faded',
                style: {
                    'opacity': 0.15
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'border-width': 3,
                    'border-color': '#f59e0b'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': function(ele) { return 1 + ele.data('strength') * 5; },
                    'line-color': function(ele) {
                        const type = ele.data('type');
                        if (type === 'correlation') return '#a855f7';
                        if (type === 'association') return '#f97316';
                        if (type === 'topic') return '#14b8a6';
                        if (type === 'topic_similarity') return '#0ea5e9';
                        if (type === 'topic_cluster') return '#0284c7';
                        return '#94a3b8';
                    },
                    'target-arrow-color': function(ele) {
                        const type = ele.data('type');
                        if (type === 'correlation') return '#a855f7';
                        if (type === 'association') return '#f97316';
                        if (type === 'topic') return '#14b8a6';
                        if (type === 'topic_similarity') return '#0ea5e9';
                        if (type === 'topic_cluster') return '#0284c7';
                        return '#94a3b8';
                    },
                    'target-arrow-shape': 'none',
                    'curve-style': 'bezier',
                    'opacity': 0.6,
                    'label': function(ele) {
                        const type = ele.data('type');
                        if (type === 'correlation' || type === 'association' || type === 'topic' || type === 'topic_similarity' || type === 'topic_cluster') {
                            return ele.data('label');
                        }
                        return '';
                    },
                    'font-size': '9px',
                    'text-rotation': 'autorotate',
                    'text-margin-y': -10
                }
            },
            {
                selector: 'edge.highlighted',
                style: {
                    'line-color': '#fb923c',
                    'width': 4,
                    'opacity': 0.95
                }
            },
            {
                selector: 'edge.faded',
                style: {
                    'opacity': 0.1
                }
            },
            {
                selector: 'edge:selected',
                style: {
                    'line-color': '#f59e0b',
                    'width': 4,
                    'opacity': 1
                }
            }
        ],
        
        layout: {
            name: 'preset'
        }
    });

    initialiseGraphInteractions();
    applyGlobalLayout(currentLayoutName);
    applyPendingFocus();
}

function getLayoutOptions(name) {
    switch (name) {
        case 'cose':
            return {
                name: 'cose',
                animate: 'end',
                animationDuration: 700,
                fit: true,
                padding: 40,
                nodeRepulsion: 400000,
                idealEdgeLength: 120,
                gravity: 80
            };
        case 'concentric':
            return {
                name: 'concentric',
                animate: true,
                animationDuration: 600,
                fit: true,
                padding: 50,
                minNodeSpacing: 40,
                concentric: function (node) {
                    return node.degree();
                },
                levelWidth: function (nodes) {
                    return nodes.maxDegree() / 4;
                }
            };
        case 'grid':
            return {
                name: 'grid',
                animate: true,
                animationDuration: 600,
                fit: true,
                padding: 40,
                avoidOverlap: true,
                spacingFactor: 1.2
            };
        case 'circle':
            return {
                name: 'circle',
                animate: true,
                animationDuration: 600,
                fit: true,
                padding: 40,
                avoidOverlap: true
            };
        case 'breadthfirst':
            return {
                name: 'breadthfirst',
                animate: true,
                animationDuration: 600,
                fit: true,
                padding: 60,
                spacingFactor: 1.4,
                directed: true
            };
        case 'random':
        default:
            return {
                name: 'random',
                animate: true,
                animationDuration: 600,
                fit: true,
                padding: 40
            };
    }
}

function applyGlobalLayout(name) {
    if (!cy) return;
    currentLayoutName = name;
    const options = getLayoutOptions(name);
    previousPositions = null;
    const layout = cy.layout(options);
    layout.run();
    applyViewMode(currentViewMode);
}

function applyViewMode(mode) {
    if (!cy) return;
    currentViewMode = mode;

    const viewSelect = document.getElementById('view-select');
    if (viewSelect && viewSelect.value !== mode) {
        viewSelect.value = mode;
    }

    cy.batch(() => {
        cy.nodes().forEach((node) => {
            node.style('display', 'element');
        });
        cy.edges().forEach((edge) => {
            edge.style('display', 'element');
        });

        if (mode === 'topics') {
            cy.nodes().forEach((node) => {
                const type = node.data('type');
                if (type !== 'topic' && type !== 'topic_cluster') {
                    node.style('display', 'none');
                }
            });
            cy.edges().forEach((edge) => {
                const type = edge.data('type');
                if (type !== 'topic_similarity' && type !== 'topic_cluster') {
                    edge.style('display', 'none');
                }
            });
        }
    });

    if (mode === 'topics') {
        const visibleNodes = cy.nodes(':visible');
        if (visibleNodes.length > 0) {
            cy.animate({ fit: { eles: visibleNodes, padding: 60 } }, { duration: 500, easing: 'ease-in-out' });
        }
    }
}

function requestGraphFocus(nodeId, options = {}) {
    pendingFocus = { nodeId, options };
    applyPendingFocus();
}

function applyPendingFocus() {
    if (!cy || !pendingFocus) return;
    const { nodeId, options = {} } = pendingFocus;
    pendingFocus = null;

    if (options.viewMode) {
        applyViewMode(options.viewMode);
    }

    const target = cy.$id(nodeId);
    if (target.empty()) return;

    if (previousPositions) {
        restorePositions(false, false);
    } else {
        previousPositions = capturePositions();
    }

    highlightNeighborhood(target);

    const zoomTarget = Math.min(2.2, Math.max(1.1, cy.zoom() * 1.2));
    cy.animate(
        {
            center: { eles: target },
            zoom: zoomTarget
        },
        { duration: 600, easing: 'ease-in-out' }
    );
}

function focusRelationshipNode(nodeId, options = {}) {
    if (!cy) {
        requestGraphFocus(nodeId, options);
        return;
    }

    const node = cy.$id(nodeId);
    if (node.empty()) {
        requestGraphFocus(nodeId, options);
        return;
    }

    if (options.viewMode) {
        applyViewMode(options.viewMode);
    }

    if (previousPositions) {
        restorePositions(false, false);
    } else {
        previousPositions = capturePositions();
    }

    highlightNeighborhood(node);

    const zoomTarget = Math.min(2.2, Math.max(1.1, cy.zoom() * 1.2));
    cy.animate(
        {
            center: { eles: node },
            zoom: zoomTarget
        },
        { duration: 600, easing: 'ease-in-out' }
    );
}

function focusTopicInGraph(columnName) {
    const nodeId = `topic_${columnName}`;
    requestGraphFocus(nodeId, { viewMode: 'topics' });
    switchTab('relationships');
}

function capturePositions() {
    if (!cy) return null;
    const positions = {};
    cy.nodes().forEach((node) => {
        positions[node.id()] = { x: node.position('x'), y: node.position('y') };
    });
    return positions;
}

function restorePositions(reset = true, animate = true) {
    if (!cy || !previousPositions) return;
    const layout = cy.layout({
        name: 'preset',
        positions: previousPositions,
        animate,
        animationDuration: animate ? 500 : undefined,
        fit: true,
        padding: 40
    });
    layout.run();
    if (reset) {
        previousPositions = null;
    }
}

function clearHighlights() {
    if (!cy) return;
    cy.batch(() => {
        cy.elements().removeClass('highlighted');
        cy.elements().removeClass('faded');
    });
}

function highlightNeighborhood(node) {
    if (!cy) return;
    const neighborhood = node.closedNeighborhood();
    const visibleNeighborhood = neighborhood.filter(':visible');
    cy.batch(() => {
        cy.elements().removeClass('highlighted');
        cy.elements().addClass('faded');
        visibleNeighborhood.removeClass('faded');
        visibleNeighborhood.addClass('highlighted');
    });

    const visibleNodes = visibleNeighborhood.nodes(':visible');
    if (visibleNodes.length > 0) {
        const layout = visibleNodes.layout({
            name: 'concentric',
            animate: true,
            animationDuration: 500,
            fit: false,
            padding: 50,
            minNodeSpacing: 30
        });

        layout.on('layoutstop', () => {
            cy.animate(
                {
                    fit: { eles: visibleNodes, padding: 80 },
                },
                { duration: 550, easing: 'ease-in-out' }
            );
        });

        layout.run();
    }
}

function initialiseGraphInteractions() {
    if (!cy) return;

    previousPositions = null;
    clearHighlights();

    const layoutSelect = document.getElementById('layout-select');
    if (layoutSelect) {
        layoutSelect.value = currentLayoutName;
        layoutSelect.onchange = (event) => {
            const selected = event.target.value;
            clearHighlights();
            previousPositions = null;
            currentLayoutName = selected;
            applyGlobalLayout(selected);
        };
    }

    const viewSelect = document.getElementById('view-select');
    if (viewSelect) {
        viewSelect.value = currentViewMode;
        viewSelect.onchange = (event) => {
            const selected = event.target.value;
            pendingFocus = null;
            if (previousPositions) {
                restorePositions(true, false);
            }
            clearHighlights();
            applyViewMode(selected);
        };
    }

    cy.on('tap', 'node', function (evt) {
        const node = evt.target;

        if (previousPositions) {
            restorePositions(false, false);
        } else {
            previousPositions = capturePositions();
        }

        highlightNeighborhood(node);
    });

    cy.on('tap', function (evt) {
        if (evt.target === cy) {
            const hadPositions = !!previousPositions;
            if (hadPositions) {
                restorePositions(true, true);
            }
            clearHighlights();
            if (!hadPositions) {
                applyGlobalLayout(currentLayoutName);
            }
        }
    });
}

window.focusTopicInGraph = focusTopicInGraph;
window.focusRelationshipNode = focusRelationshipNode;

async function loadTopics(datasetId) {
    const container = document.getElementById('topics-container');
    if (!container) return;

    container.innerHTML = '<p class="text-sm" style="color: var(--text-secondary);">Analyzing text columns...</p>';

    try {
        const response = await axios.get(`/api/topics/${datasetId}`);
        const topics = response.data?.topics ?? [];
        const clusters = response.data?.clusters ?? [];

        if (!topics.length) {
            container.innerHTML = '<p class="text-sm" style="color: var(--text-secondary);">No long-form text columns detected in this dataset.</p>';
            return;
        }

        const topicCards = topics.map((topic) => {
            const keywords = (topic.keywords || [])
                .slice(0, 10)
                .map((kw) => {
                    const term = String(kw.term ?? '').trim();
                    if (!term) return '';
                    const score = typeof kw.score === 'number' ? kw.score : 0;
                    return `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs" style="background: rgba(249, 115, 22, 0.12); color: #f97316;">${escapeHtml(term)}<span class="ml-1" style="color: var(--text-secondary);">${score.toFixed(2)}</span></span>`;
                })
                .filter(Boolean)
                .join(' ');

            const columnSlug = String(topic.column ?? '').replace(/'/g, "\\'");

            const samples = (topic.samples || [])
                .map((sample) => `<li class="border-l-2 pl-3 text-sm" style="border-color: rgba(148, 163, 184, 0.4); color: var(--text-secondary);"><strong style="color: var(--text-primary);">Row ${sample.row_number + 1}:</strong> ${escapeHtml(sample.excerpt)}</li>`)
                .join('');

            return `
                <div class="neu-card p-5 flex flex-col gap-4">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <h3 class="text-lg font-semibold" style="color: var(--text-primary);">${escapeHtml(topic.column)}</h3>
                            <p class="text-xs" style="color: var(--text-secondary);">${topic.document_count.toLocaleString()} records • Avg length ${topic.average_length} chars</p>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-full" style="background: rgba(59,130,246,0.12); color: #2563eb;">Text Column</span>
                    </div>
                    <div class="flex flex-wrap gap-2">${keywords}</div>
                    <div class="flex items-center justify-between gap-3">
                        <p class="text-xs mb-0" style="color: var(--text-secondary);">Explore how this topic links with other signals.</p>
                        <button class="neu-button px-3 py-2 text-sm" onclick="focusTopicInGraph('${columnSlug}')">
                            <i class="fas fa-project-diagram mr-2"></i>View in graph
                        </button>
                    </div>
                    ${samples ? `<ul class="space-y-2">${samples}</ul>` : ''}
                </div>
            `;
        }).join('');

        const clusterCards = clusters.length ? clusters.map((cluster) => {
            const keywords = (cluster.keywords || [])
                .slice(0, 8)
                .map((kw) => `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs" style="background: rgba(14, 165, 233, 0.12); color: #0ea5e9;">${escapeHtml(kw.term)}<span class="ml-1" style="color: var(--text-secondary);">${kw.weight.toFixed(2)}</span></span>`)
                .join(' ');

            const columnList = cluster.columns
                .map((col) => `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs" style="background: rgba(20,184,166,0.12); color: #0f766e;">${escapeHtml(col)}</span>`)
                .join(' ');

            const slug = String(cluster.id).replace(/'/g, "\\'");

            return `
                <div class="neu-card p-5 flex flex-col gap-4">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <h3 class="text-lg font-semibold" style="color: var(--text-primary);">Cluster: ${escapeHtml(cluster.keywords.slice(0, 3).map((kw) => kw.term).join(', ') || 'Related topics')}</h3>
                            <p class="text-xs" style="color: var(--text-secondary);">${cluster.columns.length} columns • Strength ${(cluster.strength * 100).toFixed(0)}%</p>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-full" style="background: rgba(14,165,233,0.12); color: #0ea5e9;">Topic Cluster</span>
                    </div>
                    <div class="flex flex-wrap gap-2">${keywords}</div>
                    <div class="flex flex-wrap gap-2">${columnList}</div>
                    <div class="flex items-center justify-end">
                        <button class="neu-button px-3 py-2 text-sm" onclick="focusRelationshipNode('${slug}', { viewMode: 'topics' })">
                            <i class="fas fa-project-diagram mr-2"></i>View cluster in graph
                        </button>
                    </div>
                </div>
            `;
        }).join('') : '';

        const sections = [];
        sections.push(`
            <div class="space-y-4">
                <h3 class="text-lg font-semibold" style="color: var(--text-primary);">Column Topics</h3>
                <div class="grid grid-cols-1 gap-4">${topicCards}</div>
            </div>
        `);

        if (clusters.length) {
            sections.push(`
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold" style="color: var(--text-primary);">Clustered Themes</h3>
                    <p class="text-sm" style="color: var(--text-secondary);">Columns grouped by shared vocabulary and context. Click a cluster to explore its network.</p>
                    <div class="grid grid-cols-1 gap-4">${clusterCards}</div>
                </div>
            `);
        }

        container.innerHTML = sections.join('');
    } catch (error) {
        console.error('Failed to load topics:', error);
        container.innerHTML = '<p class="text-red-500">Failed to generate text topics.</p>';
    }
}

async function loadColumnMappings(datasetId) {
    try {
        const response = await axios.get(`/api/mappings/${datasetId}`);
        const mappings = response.data.mappings;
        
        renderMappingsTable(mappings);
    } catch (error) {
        console.error('Error loading mappings:', error);
        document.getElementById('mappings-container').innerHTML = '<p class="text-red-600">Failed to load column mappings</p>';
    }
}

function renderMappingsTable(mappings) {
    const container = document.getElementById('mappings-container');
    
    if (mappings.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No column mappings detected for this dataset.</p>';
        return;
    }
    
    let html = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Column</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name Column</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto-Detected</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    mappings.forEach(mapping => {
        html += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${mapping.id_column}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${mapping.name_column}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${mapping.auto_detected ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Auto</span>' : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Manual</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onclick="deleteMapping(${mapping.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div class="mt-4">
            <button onclick="showAddMappingForm()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                <i class="fas fa-plus mr-2"></i>Add Manual Mapping
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

async function deleteMapping(mappingId) {
    if (!confirm('Are you sure you want to delete this mapping?')) return;
    
    try {
        await axios.delete(`/api/mappings/${mappingId}`);
        loadColumnMappings(currentDatasetId);
    } catch (error) {
        console.error('Error deleting mapping:', error);
        alert('Failed to delete mapping');
    }
}

function showAddMappingForm() {
    // TODO: Implement add mapping form
    alert('Add mapping form coming soon!');
}
