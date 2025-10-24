// Relationship graph visualization

function switchTab(tabName) {
    // Update tab buttons
    document.getElementById('tab-insights').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('tab-insights').classList.add('bg-gray-100', 'text-gray-700');
    document.getElementById('tab-relationships').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('tab-relationships').classList.add('bg-gray-100', 'text-gray-700');

    document.getElementById(`tab-${tabName}`).classList.remove('bg-gray-100', 'text-gray-700');
    document.getElementById(`tab-${tabName}`).classList.add('bg-blue-600', 'text-white');

    // Show/hide content
    document.getElementById('tab-content-insights').classList.toggle('hidden', tabName !== 'insights');
    document.getElementById('tab-content-relationships').classList.toggle('hidden', tabName !== 'relationships');

    // Load relationship graph if switching to it
    if (tabName === 'relationships' && currentDatasetId) {
        loadRelationshipGraph(currentDatasetId);
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
    const svg = document.getElementById('relationship-graph');
    const container = document.getElementById('graph-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear existing content
    svg.innerHTML = '';

    // Simple force-directed layout simulation
    const nodePositions = new Map();
    
    // Initialize positions in a circle
    nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI;
        const radius = Math.min(width, height) * 0.35;
        nodePositions.set(node.id, {
            x: width / 2 + radius * Math.cos(angle),
            y: height / 2 + radius * Math.sin(angle)
        });
    });

    // Simple physics simulation (5 iterations)
    for (let iteration = 0; iteration < 50; iteration++) {
        // Repulsion between all nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const pos1 = nodePositions.get(nodes[i].id);
                const pos2 = nodePositions.get(nodes[j].id);
                const dx = pos2.x - pos1.x;
                const dy = pos2.y - pos1.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = 1000 / (dist * dist);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                pos1.x -= fx;
                pos1.y -= fy;
                pos2.x += fx;
                pos2.y += fy;
            }
        }

        // Attraction along edges
        edges.forEach(edge => {
            const pos1 = nodePositions.get(edge.source);
            const pos2 = nodePositions.get(edge.target);
            if (!pos1 || !pos2) return;
            const dx = pos2.x - pos1.x;
            const dy = pos2.y - pos1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - 100) * 0.1 * edge.strength;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            pos1.x += fx;
            pos1.y += fy;
            pos2.x -= fx;
            pos2.y -= fy;
        });

        // Keep nodes in bounds
        nodePositions.forEach(pos => {
            pos.x = Math.max(50, Math.min(width - 50, pos.x));
            pos.y = Math.max(50, Math.min(height - 50, pos.y));
        });
    }

    // Draw edges
    edges.forEach(edge => {
        const pos1 = nodePositions.get(edge.source);
        const pos2 = nodePositions.get(edge.target);
        if (!pos1 || !pos2) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pos1.x);
        line.setAttribute('y1', pos1.y);
        line.setAttribute('x2', pos2.x);
        line.setAttribute('y2', pos2.y);
        line.setAttribute('stroke', edge.type === 'correlation' ? '#a855f7' : '#94a3b8');
        line.setAttribute('stroke-width', 1 + edge.strength * 3);
        line.setAttribute('stroke-opacity', 0.6);
        svg.appendChild(line);

        // Add label for correlations
        if (edge.type === 'correlation') {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', (pos1.x + pos2.x) / 2);
            text.setAttribute('y', (pos1.y + pos2.y) / 2);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#6b7280');
            text.setAttribute('font-size', '11');
            text.textContent = edge.label;
            svg.appendChild(text);
        }
    });

    // Draw nodes
    nodes.forEach(node => {
        const pos = nodePositions.get(node.id);
        if (!pos) return;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', node.size);
        circle.setAttribute('fill', node.type === 'column' ? '#3b82f6' : '#10b981');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', 2);
        circle.style.cursor = 'pointer';
        svg.appendChild(circle);

        // Add label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y + node.size + 15);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#1f2937');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.textContent = node.label;
        svg.appendChild(text);

        // Tooltip on hover
        circle.addEventListener('mouseenter', () => {
            circle.setAttribute('r', node.size * 1.3);
        });
        circle.addEventListener('mouseleave', () => {
            circle.setAttribute('r', node.size);
        });
    });
}
