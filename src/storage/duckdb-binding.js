import duckdb from 'duckdb';
import fs from 'node:fs';
import path from 'node:path';
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
        for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
            await this.execScript(sql);
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
                    console.error('DuckDB execute error:', sql, values, err);
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
