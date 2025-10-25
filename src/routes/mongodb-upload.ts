// MongoDB Import API route

import { Hono } from 'hono';
import { MongoClient } from 'mongodb';
import { inferColumnTypes } from '../utils/papa-parser';
import type { Bindings } from '../types';

const mongodbUpload = new Hono<{ Bindings: Bindings }>();

// Test MongoDB connection
mongodbUpload.post('/test-connection', async (c) => {
  try {
    const { connectionString } = await c.req.json();
    
    if (!connectionString) {
      return c.json({ error: 'Connection string required' }, 400);
    }

    // Test connection with timeout
    const client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    await client.connect();
    
    // List databases to verify connection
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();
    
    await client.close();

    return c.json({ 
      success: true,
      databases: databases.map((db: any) => db.name)
    });

  } catch (error: any) {
    console.error('MongoDB connection test failed:', error);
    return c.json({ 
      success: false,
      error: error.message || 'Failed to connect to MongoDB'
    }, 400);
  }
});

// List collections in a database
mongodbUpload.post('/list-collections', async (c) => {
  try {
    const { connectionString, database } = await c.req.json();
    
    if (!connectionString || !database) {
      return c.json({ error: 'Connection string and database required' }, 400);
    }

    const client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 5000
    });

    await client.connect();
    const db = client.db(database);
    const collections = await db.listCollections().toArray();
    await client.close();

    return c.json({ 
      success: true,
      collections: collections.map((col: any) => col.name)
    });

  } catch (error: any) {
    console.error('Failed to list collections:', error);
    return c.json({ 
      success: false,
      error: error.message || 'Failed to list collections'
    }, 400);
  }
});

// Import data from MongoDB
mongodbUpload.post('/', async (c) => {
  try {
    const { 
      connectionString, 
      database, 
      collection, 
      query,
      pipeline,
      limit 
    } = await c.req.json();
    
    // Validate inputs
    if (!connectionString || !database || !collection) {
      return c.json({ 
        error: 'Connection string, database, and collection are required' 
      }, 400);
    }

    // Use environment variable if connectionString is not provided in request
    const finalConnectionString = connectionString || c.env.MONGODB_CONNECTION_STRING;
    
    if (!finalConnectionString) {
      return c.json({ 
        error: 'MongoDB connection string not configured' 
      }, 500);
    }

    // Connect to MongoDB
    const client = new MongoClient(finalConnectionString, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10
    });

    await client.connect();
    const db = client.db(database);
    const col = db.collection(collection);

    // Execute query or aggregation pipeline with cursor streaming
    const maxRows = Math.min(limit || 10000, 10000); // Cap at 10K rows
    let cursor;

    if (pipeline && pipeline.length > 0) {
      // Aggregation pipeline with cursor
      const parsedPipeline = typeof pipeline === 'string' 
        ? JSON.parse(pipeline) 
        : pipeline;
      
      cursor = col.aggregate([...parsedPipeline, { $limit: maxRows }]);
        
    } else if (query) {
      // Simple query with cursor
      const parsedQuery = typeof query === 'string' 
        ? JSON.parse(query) 
        : query;
      
      cursor = col.find(parsedQuery).limit(maxRows);
        
    } else {
      // No filter - get all documents with cursor
      cursor = col.find({}).limit(maxRows);
    }

    // Stream documents using cursor with inline flattening (memory efficient)
    const rows: Record<string, any>[] = [];
    let processedCount = 0;

    // Helper function to flatten and convert document
    const flattenDocument = (doc: any): Record<string, any> => {
      const flattened: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(doc)) {
        if (key === '_id') {
          // Convert ObjectId to string
          flattened[key] = value.toString();
        } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          // Flatten nested objects (one level)
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            flattened[`${key}.${nestedKey}`] = nestedValue;
          }
        } else {
          flattened[key] = value;
        }
      }
      
      return flattened;
    };

    try {
      while (await cursor.hasNext() && processedCount < maxRows) {
        const doc = await cursor.next();
        if (doc) {
          // Flatten immediately to reduce memory footprint
          rows.push(flattenDocument(doc));
          processedCount++;
          
          // Log progress for large imports
          if (processedCount % 1000 === 0) {
            console.log(`Processed ${processedCount} documents from ${database}.${collection}`);
          }
        }
      }
    } finally {
      await cursor.close();
      await client.close();
    }

    console.log(`MongoDB import completed: ${processedCount} documents from ${database}.${collection}`);

    if (rows.length === 0) {
      return c.json({ error: 'No documents found matching the query' }, 400);
    }

    // Infer column types
    const columnTypes = inferColumnTypes(rows);
    const columns = Object.keys(rows[0]).map(name => ({
      name,
      type: columnTypes[name] || 'string',
      nullable: rows.some(r => r[name] === null || r[name] === undefined || r[name] === ''),
      unique_count: new Set(rows.map(r => r[name])).size,
      sample_values: rows.slice(0, 3).map(r => r[name])
    }));

    // Create dataset record with MongoDB metadata
    const datasetName = `${database}.${collection}`;
    const mongoConfig = {
      database,
      collection,
      query: query ? (typeof query === 'string' ? query : JSON.stringify(query)) : undefined,
      pipeline: pipeline ? (typeof pipeline === 'string' ? pipeline : JSON.stringify(pipeline)) : undefined
    };

    const datasetResult = await c.env.DB.prepare(`
      INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      datasetName,
      `${database}.${collection}`,
      'mongodb',
      rows.length,
      columns.length,
      JSON.stringify(columns),
      'analyzing'
    ).run();

    const datasetId = datasetResult.meta.last_row_id as number;

    // Store MongoDB config separately (we'll need to add this column to datasets table)
    // For now, we'll store it in a JSON column in the dataset metadata
    // TODO: Add mongodb_config column to datasets table in migration

    // Insert data rows in batches (memory efficient)
    console.log(`Inserting ${rows.length} rows into D1 database...`);
    const d1BatchSize = 100;
    
    for (let i = 0; i < rows.length; i += d1BatchSize) {
      const batch = rows.slice(i, i + d1BatchSize);
      const statements = batch.map((row, idx) => 
        c.env.DB.prepare(`
          INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
          VALUES (?, ?, ?, ?)
        `).bind(datasetId, i + idx, JSON.stringify(row), 0)
      );
      
      await c.env.DB.batch(statements);
      
      // Log progress for large imports
      if ((i + d1BatchSize) % 1000 === 0 || (i + d1BatchSize) >= rows.length) {
        console.log(`Inserted ${Math.min(i + d1BatchSize, rows.length)}/${rows.length} rows into D1`);
      }
    }
    
    console.log(`D1 insert completed: ${rows.length} rows`);

    return c.json({
      success: true,
      dataset_id: datasetId,
      message: `Successfully imported ${rows.length} documents from ${database}.${collection}`,
      stats: {
        database,
        collection,
        rows: rows.length,
        columns: columns.length
      }
    });

  } catch (error: any) {
    console.error('MongoDB import failed:', error);
    return c.json({ 
      error: error.message || 'Failed to import from MongoDB'
    }, 500);
  }
});

export default mongodbUpload;
