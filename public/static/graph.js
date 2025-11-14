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
    const tabs = ['insights', 'forensics', 'relationships', 'topics', 'mappings'];
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

    if (tabName === 'forensics' && currentDatasetId) {
        if (!forensicsLoaded) {
            loadForensicsOverview(currentDatasetId);
        }
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

// Graph filter state
let graphNodeFilters = {
    column: true,
    topic: true,
    topic_cluster: true,
    value: true
};
let graphEdgeFilters = {
    correlation: true,
    association: true,
    topic: true,
    topic_similarity: true,
    topic_cluster: true,
    contains: true
};
let graphSearchTerm = '';
let allGraphNodes = [];
let allGraphEdges = [];

function renderGraph(nodes, edges) {
    const container = document.getElementById('graph-container');

    // Store nodes and edges for filtering
    allGraphNodes = nodes;
    allGraphEdges = edges;

    // Clear container and add controls
    container.innerHTML = `
        <div class="absolute top-4 right-4 z-10 flex flex-col gap-3" style="max-width: 280px;">
            <!-- Search and Legend Panel -->
            <div class="neu-card p-4">
                <div class="mb-3">
                    <label class="text-xs font-semibold mb-1 block" style="color: var(--text-secondary);">Search Nodes</label>
                    <input type="text"
                           id="graph-search-input"
                           placeholder="Type to search..."
                           class="w-full px-3 py-2 rounded neu-card-inset text-sm"
                           style="color: var(--text-primary); background: var(--bg-secondary); border: none; outline: none;">
                </div>

                <!-- Node Type Filters -->
                <div class="mb-3">
                    <label class="text-xs font-semibold mb-2 block" style="color: var(--text-secondary);">Node Types</label>
                    <div class="space-y-1">
                        <label class="flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" class="node-filter" data-type="column" checked>
                            <div class="w-3 h-3 rounded-full" style="background: #3b82f6;"></div>
                            <span style="color: var(--text-primary);">Columns</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" class="node-filter" data-type="topic" checked>
                            <div class="w-3 h-3 rounded-full" style="background: #14b8a6;"></div>
                            <span style="color: var(--text-primary);">Topics</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" class="node-filter" data-type="topic_cluster" checked>
                            <div class="w-3 h-3 rounded-full" style="background: #0ea5e9;"></div>
                            <span style="color: var(--text-primary);">Topic Clusters</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" class="node-filter" data-type="value" checked>
                            <div class="w-3 h-3 rounded-full" style="background: #10b981;"></div>
                            <span style="color: var(--text-primary);">Values</span>
                        </label>
                    </div>
                </div>

                <!-- Edge Type Filters -->
                <div>
                    <label class="text-xs font-semibold mb-2 block" style="color: var(--text-secondary);">Edge Types</label>
                    <div class="space-y-1">
                        <label class="flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" class="edge-filter" data-type="correlation" checked>
                            <div class="w-8 h-0.5" style="background: #a855f7;"></div>
                            <span style="color: var(--text-primary);">Correlations</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" class="edge-filter" data-type="association" checked>
                            <div class="w-8 h-0.5" style="background: #f97316;"></div>
                            <span style="color: var(--text-primary);">Associations</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" class="edge-filter" data-type="topic" checked>
                            <div class="w-8 h-0.5" style="background: #14b8a6;"></div>
                            <span style="color: var(--text-primary);">Topic Links</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" class="edge-filter" data-type="topic_similarity" checked>
                            <div class="w-8 h-0.5" style="background: #0ea5e9;"></div>
                            <span style="color: var(--text-primary);">Topic Similarity</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" class="edge-filter" data-type="contains" checked>
                            <div class="w-8 h-0.5" style="background: #94a3b8;"></div>
                            <span style="color: var(--text-primary);">Contains</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <div id="cy" style="width: 100%; height: 100%;"></div>
    `;

    // Setup search and filter handlers
    setupGraphFilters();

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

    // Apply initial filters after graph is ready
    setTimeout(() => applyGraphFilters(), 100);
}

function applyGraphFilters() {
    if (!cy || allGraphNodes.length === 0) return;

    // Filter nodes based on type filters and search
    const filteredNodes = allGraphNodes.filter(node => {
        // Check node type filter
        if (!graphNodeFilters[node.type]) return false;

        // Check search term
        if (graphSearchTerm) {
            const searchLower = graphSearchTerm.toLowerCase();
            const labelLower = (node.label || '').toLowerCase();
            if (!labelLower.includes(searchLower)) return false;
        }

        return true;
    });

    // Filter edges based on edge type filters and whether their nodes are visible
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = allGraphEdges.filter(edge => {
        // Check edge type filter
        if (!graphEdgeFilters[edge.type]) return false;

        // Check if both source and target nodes are visible
        if (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target)) return false;

        return true;
    });

    // Update connected nodes based on filtered edges
    const connectedNodeIds = new Set();
    filteredEdges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
    });

    // Only show nodes that are in filtered set AND have connections
    const connectedNodes = filteredNodes.filter(node => connectedNodeIds.has(node.id));

    // Hide/show nodes and edges in the graph
    cy.nodes().forEach(node => {
        const nodeId = node.data('id');
        const shouldShow = connectedNodes.some(n => n.id === nodeId);
        if (shouldShow) {
            node.removeClass('faded');
            node.style('display', 'element');
        } else {
            node.addClass('faded');
            node.style('display', 'none');
        }
    });

    cy.edges().forEach(edge => {
        const edgeType = edge.data('type');
        const sourceId = edge.data('source');
        const targetId = edge.data('target');
        const shouldShow = graphEdgeFilters[edgeType] &&
                          connectedNodeIds.has(sourceId) &&
                          connectedNodeIds.has(targetId);
        if (shouldShow) {
            edge.removeClass('faded');
            edge.style('display', 'element');
        } else {
            edge.addClass('faded');
            edge.style('display', 'none');
        }
    });

    // Highlight search matches
    if (graphSearchTerm) {
        highlightSearchMatches();
    } else {
        cy.nodes().removeClass('highlighted');
    }
}

function setupGraphFilters() {
    // Search input handler
    const searchInput = document.getElementById('graph-search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            graphSearchTerm = e.target.value.trim();
            searchTimeout = setTimeout(() => {
                applyGraphFilters();
            }, 300);
        });
    }

    // Node filter checkboxes
    document.querySelectorAll('.node-filter').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const type = e.target.dataset.type;
            graphNodeFilters[type] = e.target.checked;
            applyGraphFilters();
        });
    });

    // Edge filter checkboxes
    document.querySelectorAll('.edge-filter').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const type = e.target.dataset.type;
            graphEdgeFilters[type] = e.target.checked;
            applyGraphFilters();
        });
    });
}

function highlightSearchMatches() {
    if (!cy || !graphSearchTerm) return;

    const searchLower = graphSearchTerm.toLowerCase();
    let firstMatch = null;

    cy.nodes().forEach(node => {
        const label = (node.data('label') || '').toLowerCase();
        if (label.includes(searchLower) && node.style('display') === 'element') {
            node.addClass('highlighted');
            if (!firstMatch) {
                firstMatch = node;
            }
        } else {
            node.removeClass('highlighted');
        }
    });

    // Zoom to first match if found
    if (firstMatch) {
        cy.animate({
            center: { eles: firstMatch },
            zoom: Math.min(2.5, Math.max(1.2, cy.zoom() * 1.3))
        }, { duration: 500 });
    }
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
        const nodeId = node.data('id');
        const nodeType = node.data('type');

        if (previousPositions) {
            restorePositions(false, false);
        } else {
            previousPositions = capturePositions();
        }

        highlightNeighborhood(node);

        // Show node detail panel
        showNodeDetailPanel(nodeId, nodeType);
    });

    cy.on('tap', function (evt) {
        if (evt.target === cy) {
            const hadPositions = !!previousPositions;
            if (hadPositions) {
                restorePositions(true, true);
            }
            clearHighlights();
            closeNodeDetailPanel(); // Close panel when clicking background
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
                .map((sample) => `<li class="border-l-2 pl-3 text-sm" style="border-color: rgba(148, 163, 184, 0.4); color: var(--text-secondary);"><span style="color: var(--text-primary); font-weight: bold;">Row ${sample.row_number + 1}:</span> ${escapeHtml(sample.excerpt)}</li>`)
                .join('');

            // Sentiment badge
            const sentimentBadge = topic.sentiment ? (() => {
                const colors = {
                    positive: { bg: 'rgba(16,185,129,0.12)', text: '#10b981', icon: 'fa-smile' },
                    negative: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', icon: 'fa-frown' },
                    neutral: { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', icon: 'fa-meh' }
                };
                const color = colors[topic.sentiment.label] || colors.neutral;
                const confidence = Math.round((topic.sentiment.confidence || 0) * 100);
                return `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style="background: ${color.bg}; color: ${color.text};">
                    <i class="fas ${color.icon}"></i>
                    <span>${topic.sentiment.label}</span>
                    ${confidence > 60 ? `<span style="opacity: 0.7;">${confidence}%</span>` : ''}
                </span>`;
            })() : '';

            // Intent badge
            const intentBadge = topic.intent ? (() => {
                const colors = {
                    question: { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6', icon: 'fa-question-circle' },
                    complaint: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', icon: 'fa-exclamation-triangle' },
                    request: { bg: 'rgba(139,92,246,0.12)', text: '#8b5cf6', icon: 'fa-hand-paper' },
                    information: { bg: 'rgba(14,165,233,0.12)', text: '#0ea5e9', icon: 'fa-info-circle' },
                    feedback: { bg: 'rgba(249,115,22,0.12)', text: '#f97316', icon: 'fa-comment' },
                    other: { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', icon: 'fa-circle' }
                };
                const color = colors[topic.intent.label] || colors.other;
                const confidence = Math.round((topic.intent.confidence || 0) * 100);
                return `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style="background: ${color.bg}; color: ${color.text};">
                    <i class="fas ${color.icon}"></i>
                    <span>${topic.intent.label}</span>
                    ${confidence > 60 ? `<span style="opacity: 0.7;">${confidence}%</span>` : ''}
                </span>`;
            })() : '';

            return `
                <div class="neu-card p-5 flex flex-col gap-4">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <h3 class="text-lg font-semibold" style="color: var(--text-primary);">${escapeHtml(topic.column)}</h3>
                            <p class="text-xs" style="color: var(--text-secondary);">${topic.document_count.toLocaleString()} records • Avg length ${topic.average_length} chars</p>
                        </div>
                        <div class="flex items-center gap-2">
                            ${sentimentBadge}
                            ${intentBadge}
                            <span class="text-xs px-2 py-1 rounded-full" style="background: rgba(59,130,246,0.12); color: #2563eb;">Text Column</span>
                        </div>
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

// Node Detail Panel - Shows everything the system knows about a node
let currentNodeDetailPanel = null;

async function showNodeDetailPanel(nodeId, nodeType) {
    if (!currentDatasetId) return;

    // Remove existing panel if any
    if (currentNodeDetailPanel) {
        currentNodeDetailPanel.remove();
        currentNodeDetailPanel = null;
    }

    // Create panel container
    const panel = document.createElement('div');
    panel.id = 'node-detail-panel';
    panel.className = 'fixed left-0 top-0 h-full w-full md:w-96 bg-opacity-95 z-50 overflow-y-auto';
    panel.style.cssText = 'background: var(--bg-primary); box-shadow: 4px 0 12px rgba(0,0,0,0.15);';

    panel.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold" style="color: var(--text-primary);">Node Details</h2>
                <button onclick="closeNodeDetailPanel()" class="neu-button p-2" title="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="node-detail-content" class="space-y-4">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-2xl" style="color: var(--accent);"></i>
                    <p class="text-sm mt-2" style="color: var(--text-secondary);">Loading node details...</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(panel);
    currentNodeDetailPanel = panel;

    // Load node details
    try {
        const response = await axios.get(`/api/relationships/${currentDatasetId}/node/${nodeId}`);
        const data = response.data;

        renderNodeDetails(data, panel.querySelector('#node-detail-content'));
    } catch (error) {
        console.error('Error loading node details:', error);
        panel.querySelector('#node-detail-content').innerHTML = `
            <div class="neu-card p-4 text-center">
                <i class="fas fa-exclamation-triangle text-2xl mb-2" style="color: #ef4444;"></i>
                <p class="text-sm" style="color: var(--text-secondary);">Failed to load node details</p>
            </div>
        `;
    }
}

function renderNodeDetails(data, container) {
    const { nodeId, nodeType, column, statistics, analyses, visualizations, sampleRows, connections, topicInfo, totalRows } = data;

    let html = '';

    // Header with node info
    html += `
        <div class="neu-card p-4 mb-4">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-3 h-3 rounded-full" style="background: ${getNodeColor(nodeType)};"></div>
                <h3 class="font-bold text-lg m-0" style="color: var(--text-primary);">${escapeHtml(column?.name || nodeId)}</h3>
            </div>
            <div class="flex gap-2 flex-wrap">
                <span class="text-xs px-2 py-1 rounded" style="background: rgba(59,130,246,0.12); color: #2563eb;">${nodeType}</span>
                ${column?.type ? `<span class="text-xs px-2 py-1 rounded" style="background: rgba(16,185,129,0.12); color: #10b981;">${column.type}</span>` : ''}
            </div>
        </div>
    `;

    // Statistics section
    if (statistics) {
        html += `
            <div class="neu-card p-4">
                <h4 class="font-semibold mb-3" style="color: var(--text-primary);">
                    <i class="fas fa-chart-bar mr-2" style="color: var(--accent);"></i>Statistics
                </h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                    ${statistics.count !== undefined ? `<div><span style="color: var(--text-secondary);">Count:</span> <span style="color: var(--text-primary); font-weight: bold;">${statistics.count.toLocaleString()}</span></div>` : ''}
                    ${statistics.unique_count !== undefined ? `<div><span style="color: var(--text-secondary);">Unique:</span> <span style="color: var(--text-primary); font-weight: bold;">${statistics.unique_count.toLocaleString()}</span></div>` : ''}
                    ${statistics.null_count !== undefined ? `<div><span style="color: var(--text-secondary);">Null:</span> <span style="color: var(--text-primary); font-weight: bold;">${statistics.null_count.toLocaleString()}</span></div>` : ''}
                    ${statistics.mean !== undefined ? `<div><span style="color: var(--text-secondary);">Mean:</span> <span style="color: var(--text-primary); font-weight: bold;">${statistics.mean.toFixed(2)}</span></div>` : ''}
                    ${statistics.median !== undefined ? `<div><span style="color: var(--text-secondary);">Median:</span> <span style="color: var(--text-primary); font-weight: bold;">${statistics.median.toFixed(2)}</span></div>` : ''}
                    ${statistics.stdDev !== undefined ? `<div><span style="color: var(--text-secondary);">Std Dev:</span> <span style="color: var(--text-primary); font-weight: bold;">${statistics.stdDev.toFixed(2)}</span></div>` : ''}
                    ${statistics.min !== undefined ? `<div><span style="color: var(--text-secondary);">Min:</span> <span style="color: var(--text-primary); font-weight: bold;">${statistics.min}</span></div>` : ''}
                    ${statistics.max !== undefined ? `<div><span style="color: var(--text-secondary);">Max:</span> <span style="color: var(--text-primary); font-weight: bold;">${statistics.max}</span></div>` : ''}
                </div>
            </div>
        `;
    }

    // Topic info section
    if (topicInfo) {
        html += `
            <div class="neu-card p-4">
                <h4 class="font-semibold mb-3" style="color: var(--text-primary);">
                    <i class="fas fa-tags mr-2" style="color: var(--accent);"></i>Topic Analysis
                </h4>
                <p class="text-xs mb-2" style="color: var(--text-secondary);">
                    ${topicInfo.document_count.toLocaleString()} documents • Avg length: ${topicInfo.average_length} chars
                </p>
                <div class="flex flex-wrap gap-2 mb-3">
                    ${topicInfo.keywords.slice(0, 8).map(kw =>
                        `<span class="text-xs px-2 py-1 rounded" style="background: rgba(249,115,22,0.12); color: #f97316;">${escapeHtml(kw.term)}</span>`
                    ).join('')}
                </div>
                ${topicInfo.samples && topicInfo.samples.length > 0 ? `
                    <div class="mt-3">
                        <p class="text-xs font-semibold mb-2" style="color: var(--text-secondary);">Sample excerpts:</p>
                        <ul class="space-y-1 text-xs" style="color: var(--text-secondary);">
                            ${topicInfo.samples.map(s =>
                                `<li class="border-l-2 pl-2" style="border-color: rgba(148,163,184,0.4);">${escapeHtml(s.excerpt.length > 100 ? s.excerpt.slice(0, 97) + '...' : s.excerpt)}</li>`
                            ).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Connections section
    if (connections && connections.length > 0) {
        html += `
            <div class="neu-card p-4">
                <h4 class="font-semibold mb-3" style="color: var(--text-primary);">
                    <i class="fas fa-project-diagram mr-2" style="color: var(--accent);"></i>Connections (${connections.length})
                </h4>
                <div class="space-y-2">
                    ${connections.slice(0, 10).map(conn => `
                        <div class="flex items-center justify-between p-2 rounded neu-card-inset">
                            <span class="text-sm" style="color: var(--text-primary);">${escapeHtml(conn.target.replace('col_', ''))}</span>
                            <div class="flex items-center gap-2">
                                <span class="text-xs px-2 py-1 rounded" style="background: rgba(139,92,246,0.12); color: #8b5cf6;">${conn.type}</span>
                                <span class="text-xs" style="color: var(--text-secondary);">${conn.strength.toFixed(2)}</span>
                            </div>
                        </div>
                    `).join('')}
                    ${connections.length > 10 ? `<p class="text-xs text-center mt-2" style="color: var(--text-secondary);">+ ${connections.length - 10} more</p>` : ''}
                </div>
            </div>
        `;
    }

    // Analyses section
    if (analyses && analyses.length > 0) {
        html += `
            <div class="neu-card p-4">
                <h4 class="font-semibold mb-3" style="color: var(--text-primary);">
                    <i class="fas fa-lightbulb mr-2" style="color: var(--accent);"></i>Insights (${analyses.length})
                </h4>
                <div class="space-y-2">
                    ${analyses.slice(0, 5).map(analysis => `
                        <div class="p-3 rounded neu-card-inset">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-xs font-semibold px-2 py-1 rounded" style="background: rgba(59,130,246,0.12); color: #2563eb;">${analysis.analysis_type}</span>
                                <span class="text-xs" style="color: var(--text-secondary);">Score: ${(analysis.quality_score || 0).toFixed(0)}</span>
                            </div>
                            <p class="text-xs mt-2" style="color: var(--text-secondary);">${escapeHtml(analysis.explanation || 'No explanation available')}</p>
                        </div>
                    `).join('')}
                    ${analyses.length > 5 ? `<p class="text-xs text-center mt-2" style="color: var(--text-secondary);">+ ${analyses.length - 5} more insights</p>` : ''}
                </div>
            </div>
        `;
    }

    // Visualizations section
    if (visualizations && visualizations.length > 0) {
        html += `
            <div class="neu-card p-4">
                <h4 class="font-semibold mb-3" style="color: var(--text-primary);">
                    <i class="fas fa-chart-line mr-2" style="color: var(--accent);"></i>Visualizations (${visualizations.length})
                </h4>
                <div class="space-y-2">
                    ${visualizations.slice(0, 5).map(viz => `
                        <div class="p-2 rounded neu-card-inset cursor-pointer hover:opacity-90 transition" onclick="focusVisualization('${escapeHtml(viz.title)}')">
                            <p class="text-sm font-semibold mb-1" style="color: var(--text-primary);">${escapeHtml(viz.title)}</p>
                            <p class="text-xs" style="color: var(--text-secondary);">${escapeHtml(viz.explanation || '')}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Sample data section
    if (sampleRows && sampleRows.length > 0) {
        html += `
            <div class="neu-card p-4">
                <h4 class="font-semibold mb-3" style="color: var(--text-primary);">
                    <i class="fas fa-table mr-2" style="color: var(--accent);"></i>Sample Values
                </h4>
                <div class="space-y-1 text-sm">
                    ${sampleRows.slice(0, 10).map(row => `
                        <div class="flex items-center justify-between p-2 rounded neu-card-inset">
                            <span class="text-xs" style="color: var(--text-secondary);">Row ${row.row_number}</span>
                            <span class="text-xs font-mono" style="color: var(--text-primary);">${escapeHtml(String(row.value).slice(0, 50))}${String(row.value).length > 50 ? '...' : ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function getNodeColor(nodeType) {
    switch (nodeType) {
        case 'column': return '#3b82f6';
        case 'topic': return '#14b8a6';
        case 'topic_cluster': return '#0ea5e9';
        case 'value': return '#10b981';
        default: return '#6b7280';
    }
}

function closeNodeDetailPanel() {
    if (currentNodeDetailPanel) {
        currentNodeDetailPanel.remove();
        currentNodeDetailPanel = null;
    }
}

function focusVisualization(title) {
    // Switch to insights tab and scroll to visualization
    switchTab('insights');
    setTimeout(() => {
        const searchInput = document.getElementById('insight-search');
        if (searchInput) {
            searchInput.value = title.split(':')[0] || title;
            filterInsights(searchInput.value);
        }
    }, 100);
}

window.closeNodeDetailPanel = closeNodeDetailPanel;
window.focusVisualization = focusVisualization;
