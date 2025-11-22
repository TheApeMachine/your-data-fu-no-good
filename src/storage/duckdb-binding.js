import duckdb from 'duckdb';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
class DuckDBStatement {
    binding;
    sql;
    params = [];
    constructor(binding, sql) {
        this.binding = binding;
        this.sql = sql;
    }
    bind(...params) {
        this.params = params;
        return this;
    }
    async all() {
        const rows = await this.binding.query(this.sql, this.params);
        return { results: rows };
    }
    async first() {
        const rows = await this.binding.query(this.sql, this.params, { limit: 1 });
        return rows.length > 0 ? rows[0] : null;
    }
    async run() {
        const meta = await this.binding.execute(this.sql, this.params);
        return { success: true, meta };
    }
}
export class DuckDBBinding {
    db;
    ready;
    constructor(dbPath) {
        const resolvedPath = dbPath ?? process.env.DUCKDB_PATH ?? path.join(process.cwd(), 'data', 'analysis.duckdb');
        const dir = path.dirname(resolvedPath);
        fs.mkdirSync(dir, { recursive: true });
        this.db = new duckdb.Database(resolvedPath);
        this.ready = this.applyMigrations();
    }
    prepare(sql) {
        return new DuckDBStatement(this, sql);
    }
    async batch(statements) {
        await this.ready;
        await this.execute('BEGIN TRANSACTION', [], { skipLastId: true });
        try {
            for (const statement of statements) {
                if (statement.sql == null) {
                    throw new Error('DuckDB batch requires prepared statements created via DuckDBBinding.prepare');
                }
                const params = Array.isArray(statement.params) ? statement.params : [];
                await this.execute(statement.sql, params, { skipLastId: true });
            }
            await this.execute('COMMIT', [], { skipLastId: true });
        }
        catch (error) {
            await this.execute('ROLLBACK', [], { skipLastId: true });
            throw error;
        }
    }
    async applyMigrations() {
        const migrationsDir = path.join(process.cwd(), 'migrations');
        if (!fs.existsSync(migrationsDir))
            return;
        const files = fs
            .readdirSync(migrationsDir)
            .filter((file) => file.endsWith('.sql'))
            .sort();
        // Ensure migrations ledger exists
        await this.execScript(`CREATE TABLE IF NOT EXISTS _migrations (
        filename TEXT PRIMARY KEY,
        checksum TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
        // Helpers to interact directly with the underlying DB during bootstrap
        const run = (sql, ...params) => new Promise((resolve, reject) => {
            // Use raw connection since ready gate depends on migrations
            this.db.run(sql, ...params, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
        const all = (sql, ...params) => new Promise((resolve, reject) => {
            this.db.all(sql, ...params, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows ?? []);
            });
        });
        // Preflight: ensure legacy tables have a primary key/unique on id for FK references
        try {
            const tableExists = async (name) => {
                const rows = await all(`SELECT 1 AS x FROM information_schema.tables WHERE lower(table_name) = lower(?) LIMIT 1`, name);
                return rows.length > 0;
            };
            const hasPkOnId = async (name) => {
                // DuckDB accepts: PRAGMA table_info(table_name)
                const cols = await all(`PRAGMA table_info(${name})`);
                return cols.some((c) => c.name === 'id' && Number(c.pk) > 0);
            };
            const ensureUniqueOnId = async (name) => {
                // Create a unique index to satisfy FK requirement if PK is missing
                await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_${name}_id_unique ON ${name}(id)`);
            };
            // forensic_cases
            if (await tableExists('forensic_cases')) {
                if (!(await hasPkOnId('forensic_cases'))) {
                    await ensureUniqueOnId('forensic_cases');
                }
            }
            // forensic_events
            if (await tableExists('forensic_events')) {
                if (!(await hasPkOnId('forensic_events'))) {
                    await ensureUniqueOnId('forensic_events');
                }
            }
        }
        catch (preflightErr) {
            console.warn('DuckDB migration preflight check failed (continuing):', preflightErr);
        }
        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf-8');
            const checksum = crypto.createHash('sha256').update(sql).digest('hex');
            // Check if already applied
            const existing = await all('SELECT checksum FROM _migrations WHERE filename = ?', file);
            if (existing.length > 0) {
                if (existing[0].checksum !== checksum) {
                    console.warn(`Migration ${file} has changed since it was applied. Skipping re-apply. (stored=${existing[0].checksum.slice(0, 8)} current=${checksum.slice(0, 8)})`);
                }
                continue;
            }
            // Apply in a transaction
            try {
                await run('BEGIN TRANSACTION');
                await this.execScript(sql);
                await run('INSERT INTO _migrations (filename, checksum) VALUES (?, ?)', file, checksum);
                await run('COMMIT');
            }
            catch (err) {
                try {
                    await run('ROLLBACK');
                }
                catch (rollbackErr) {
                    console.warn('Rollback failed after migration error:', rollbackErr);
                }
                console.error('Failed to apply migration:', file, err);
                throw err;
            }
        }
    }
    execScript(sql) {
        const sanitized = sql
            .split('\n')
            .filter((line) => !line.trim().startsWith('--'))
            .join('\n');
        const statements = sanitized
            .split(';')
            .map((statement) => statement.trim())
            .filter((statement) => statement.length > 0);
        return statements.reduce((promise, statement) => {
            return promise.then(() => new Promise((resolve, reject) => {
                this.db.run(statement, (err) => {
                    if (err) {
                        console.error('DuckDB migration statement failed:', statement, err);
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }));
        }, Promise.resolve());
    }
    async query(sql, params = [], options = {}) {
        await this.ready;
        const finalSql = options.limit ? `${sql} LIMIT ${options.limit}` : sql;
        return new Promise((resolve, reject) => {
            const values = params ?? [];
            const handler = (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows ?? []);
                }
            };
            if (values.length > 0) {
                this.db.all(finalSql, ...values, (err, rows) => {
                    if (err) {
                        console.error('DuckDB query error:', finalSql, values, err);
                    }
                    handler(err, rows);
                });
            }
            else {
                this.db.all(finalSql, (err, rows) => {
                    if (err) {
                        console.error('DuckDB query error:', finalSql, [], err);
                    }
                    handler(err, rows);
                });
            }
        });
    }
    async execute(sql, params = [], options = {}) {
        await this.ready;
        const connection = this.db;
        return new Promise((resolve, reject) => {
            const values = params ?? [];
            const runCallback = function (err) {
                if (err) {
                    // Suppress logging for index already exists errors (handled gracefully elsewhere)
                    const errorMsg = err?.message || '';
                    const isIndexExistsError = errorMsg.includes('already exists') &&
                        errorMsg.includes('idx_forensic_case_events_unique');
                    if (!isIndexExistsError) {
                        console.error('DuckDB execute error:', sql, values, err);
                    }
                    reject(err);
                }
                else if (options.skipLastId) {
                    resolve({});
                }
                else {
                    const lastId = typeof this?.lastID === 'number' ? this.lastID : undefined;
                    if (lastId !== undefined) {
                        resolve({ last_row_id: Number(lastId) });
                    }
                    else {
                        const tableMatch = /^\s*insert\s+into\s+["`]?([A-Za-z0-9_]+)["`]?/i.exec(sql);
                        if (!tableMatch) {
                            resolve({});
                            return;
                        }
                        const tableName = tableMatch[1];
                        connection.all(`SELECT id FROM ${tableName} ORDER BY id DESC LIMIT 1`, (err2, rows) => {
                            if (err2 || !rows || rows.length === 0) {
                                resolve({});
                            }
                            else {
                                resolve({ last_row_id: Number(rows[0].id) });
                            }
                        });
                    }
                }
            };
            if (values.length > 0) {
                this.db.run(sql, ...values, runCallback);
            }
            else {
                this.db.run(sql, runCallback);
            }
        });
    }
}
let bindingInstance = null;
export function getDuckDBBinding() {
    if (!bindingInstance) {
        bindingInstance = new DuckDBBinding();
    }
    return bindingInstance;
}
