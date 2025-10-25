// MongoDB Import Functionality

function switchUploadMethod(method) {
    const fileArea = document.getElementById('file-upload-area');
    const mongoArea = document.getElementById('mongodb-import-area');
    const fileTab = document.getElementById('tab-upload-file');
    const mongoTab = document.getElementById('tab-upload-mongodb');

    if (method === 'file') {
        fileArea.classList.remove('hidden');
        mongoArea.classList.add('hidden');
        fileTab.style.background = 'var(--accent)';
        fileTab.style.color = 'white';
        mongoTab.style.background = '';
        mongoTab.style.color = '';
    } else {
        fileArea.classList.add('hidden');
        mongoArea.classList.remove('hidden');
        mongoTab.style.background = 'var(--accent)';
        mongoTab.style.color = 'white';
        fileTab.style.background = '';
        fileTab.style.color = '';
    }
}

async function testMongoDBConnection() {
    const connectionString = document.getElementById('mongodb-connection-string').value.trim();
    const statusDiv = document.getElementById('mongodb-status');
    const statusMessage = document.getElementById('mongodb-status-message');

    if (!connectionString) {
        showMongoDBStatus('error', 'Please enter a connection string');
        return;
    }

    showMongoDBStatus('loading', 'Testing connection...');

    try {
        const response = await axios.post('/api/upload/mongodb/test-connection', {
            connectionString
        });

        if (response.data.success) {
            const databases = response.data.databases.join(', ');
            showMongoDBStatus('success', `✓ Connection successful! Found databases: ${databases}`);
        } else {
            showMongoDBStatus('error', `✗ Connection failed: ${response.data.error}`);
        }
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || 'Connection test failed';
        showMongoDBStatus('error', `✗ ${errorMessage}`);
    }
}

async function importFromMongoDB() {
    const connectionString = document.getElementById('mongodb-connection-string').value.trim();
    const database = document.getElementById('mongodb-database').value.trim();
    const collection = document.getElementById('mongodb-collection').value.trim();
    const queryText = document.getElementById('mongodb-query').value.trim();
    const pipelineText = document.getElementById('mongodb-pipeline').value.trim();
    const limit = parseInt(document.getElementById('mongodb-limit').value) || 10000;

    // Validate inputs
    if (!connectionString || !database || !collection) {
        showMongoDBStatus('error', 'Please fill in connection string, database, and collection');
        return;
    }

    // Parse JSON inputs
    let query = null;
    let pipeline = null;

    if (queryText) {
        try {
            query = JSON.parse(queryText);
        } catch (e) {
            showMongoDBStatus('error', 'Invalid query JSON format');
            return;
        }
    }

    if (pipelineText) {
        try {
            pipeline = JSON.parse(pipelineText);
            if (!Array.isArray(pipeline)) {
                showMongoDBStatus('error', 'Pipeline must be a JSON array');
                return;
            }
        } catch (e) {
            showMongoDBStatus('error', 'Invalid pipeline JSON format');
            return;
        }
    }

    showMongoDBStatus('loading', 'Importing data from MongoDB...');

    try {
        const response = await axios.post('/api/upload/mongodb', {
            connectionString,
            database,
            collection,
            query,
            pipeline,
            limit
        });

        if (response.data.success) {
            showMongoDBStatus('success', 
                `✓ Successfully imported ${response.data.stats.rows} documents! Analyzing...`);
            
            // Start analysis
            const datasetId = response.data.dataset_id;
            
            // Hide upload section, show results
            setTimeout(async () => {
                document.getElementById('upload-section').classList.add('hidden');
                document.getElementById('results-section').classList.remove('hidden');
                
                // Trigger analysis
                await analyzeDataset(datasetId);
            }, 1500);
        } else {
            showMongoDBStatus('error', `✗ Import failed: ${response.data.error}`);
        }
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || 'Import failed';
        showMongoDBStatus('error', `✗ ${errorMessage}`);
    }
}

function showMongoDBStatus(type, message) {
    const statusDiv = document.getElementById('mongodb-status');
    const statusMessage = document.getElementById('mongodb-status-message');
    
    statusDiv.classList.remove('hidden');
    statusMessage.textContent = message;
    
    if (type === 'success') {
        statusDiv.style.background = 'rgba(16, 185, 129, 0.1)';
        statusMessage.style.color = '#10b981';
    } else if (type === 'error') {
        statusDiv.style.background = 'rgba(239, 68, 68, 0.1)';
        statusMessage.style.color = '#ef4444';
    } else if (type === 'loading') {
        statusDiv.style.background = 'rgba(59, 130, 246, 0.1)';
        statusMessage.style.color = '#3b82f6';
    }
}
