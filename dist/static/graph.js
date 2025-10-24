// Cytoscape.js relationship graph visualization

let cy = null;

function switchTab(tabName) {
    // Update tab buttons
    document.getElementById('tab-insights').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('tab-insights').classList.add('bg-gray-100', 'text-gray-700');
    document.getElementById('tab-relationships').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('tab-relationships').classList.add('bg-gray-100', 'text-gray-700');
    document.getElementById('tab-mappings').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('tab-mappings').classList.add('bg-gray-100', 'text-gray-700');

    document.getElementById(`tab-${tabName}`).classList.remove('bg-gray-100', 'text-gray-700');
    document.getElementById(`tab-${tabName}`).classList.add('bg-blue-600', 'text-white');

    // Show/hide content
    document.getElementById('tab-content-insights').classList.toggle('hidden', tabName !== 'insights');
    document.getElementById('tab-content-relationships').classList.toggle('hidden', tabName !== 'relationships');
    document.getElementById('tab-content-mappings').classList.toggle('hidden', tabName !== 'mappings');

    // Load relationship graph if switching to it
    if (tabName === 'relationships' && currentDatasetId) {
        loadRelationshipGraph(currentDatasetId);
    }
    
    // Load mappings if switching to it
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

    // Convert to Cytoscape format
    const elements = [];
    
    // Add nodes
    nodes.forEach(node => {
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
                        return ele.data('type') === 'column' ? '#3b82f6' : '#10b981';
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
                    'z-index': 10
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
                        return ele.data('type') === 'correlation' ? '#a855f7' : '#94a3b8';
                    },
                    'target-arrow-color': function(ele) {
                        return ele.data('type') === 'correlation' ? '#a855f7' : '#94a3b8';
                    },
                    'target-arrow-shape': 'none',
                    'curve-style': 'bezier',
                    'opacity': 0.6,
                    'label': function(ele) {
                        return ele.data('type') === 'correlation' ? ele.data('label') : '';
                    },
                    'font-size': '9px',
                    'text-rotation': 'autorotate',
                    'text-margin-y': -10
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
            name: 'cose',
            idealEdgeLength: 100,
            nodeOverlap: 20,
            refresh: 20,
            fit: true,
            padding: 30,
            randomize: false,
            componentSpacing: 100,
            nodeRepulsion: 400000,
            edgeElasticity: 100,
            nestingFactor: 5,
            gravity: 80,
            numIter: 1000,
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0
        }
    });

    // Add tooltips
    cy.on('tap', 'node', function(evt) {
        const node = evt.target;
        console.log('Node clicked:', node.data());
    });

    cy.on('tap', 'edge', function(evt) {
        const edge = evt.target;
        console.log('Edge clicked:', edge.data());
    });
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
