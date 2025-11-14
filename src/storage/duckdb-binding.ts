import duckdb from 'duckdb';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import type { DatabaseBinding, PreparedStatement, QueryOptions, RunMeta } from './types';

class DuckDBStatement implements PreparedStatement {
  public params: any[] = [];

  constructor(private readonly binding: DuckDBBinding, public readonly sql: string) {}

  bind(...params: any[]): PreparedStatement {
    this.params = params;
    return this;
  }

  async all<T = any>(): Promise<{ results: T[] }> {
    const rows = await this.binding.query<T>(this.sql, this.params);
    return { results: rows };
  }

  async first<T = any>(): Promise<T | null> {
    const rows = await this.binding.query<T>(this.sql, this.params, { limit: 1 });
    return rows.length > 0 ? rows[0] : null;
  }

  async run(): Promise<{ success: boolean; meta: RunMeta }> {
    const meta = await this.binding.execute(this.sql, this.params);
    return { success: true, meta };
  }
}

export class DuckDBBinding implements DatabaseBinding {
  private readonly db: duckdb.Database;
  private readonly ready: Promise<void>;

  constructor(dbPath?: string) {
    const resolvedPath = dbPath ?? process.env.DUCKDB_PATH ?? path.join(process.cwd(), 'data', 'analysis.duckdb');
    const dir = path.dirname(resolvedPath);
    fs.mkdirSync(dir, { recursive: true });
    this.db = new duckdb.Database(resolvedPath);
    this.ready = this.applyMigrations();
  }

  prepare(sql: string): PreparedStatement {
    return new DuckDBStatement(this, sql);
  }

  async batch(statements: PreparedStatement[]): Promise<void> {
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
    } catch (error) {
      await this.execute('ROLLBACK', [], { skipLastId: true });
      throw error;
    }
  }

  private async applyMigrations(): Promise<void> {
    const migrationsDir = path.join(process.cwd(), 'migrations');
    if (!fs.existsSync(migrationsDir)) return;

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    // Ensure migrations ledger exists
    await this.execScript(
      `CREATE TABLE IF NOT EXISTS _migrations (
        filename TEXT PRIMARY KEY,
        checksum TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    // Helpers to interact directly with the underlying DB during bootstrap
    const run = (sql: string, ...params: any[]) =>
      new Promise<void>((resolve, reject) => {
        // Use raw connection since ready gate depends on migrations
        (this.db as any).run(sql, ...params, (err: Error | null) => {
          if (err) return reject(err);
          resolve();
        });
      });
    const all = <T = any>(sql: string, ...params: any[]) =>
      new Promise<T[]>((resolve, reject) => {
        (this.db as any).all(sql, ...params, (err: Error | null, rows?: T[]) => {
          if (err) return reject(err);
          resolve(rows ?? []);
        });
      });

    // Preflight: ensure legacy tables have a primary key/unique on id for FK references
    try {
      const tableExists = async (name: string) => {
        const rows = await all<{ x: number }>(
          `SELECT 1 AS x FROM information_schema.tables WHERE lower(table_name) = lower(?) LIMIT 1`,
          name,
        );
        return rows.length > 0;
      };

      const hasPkOnId = async (name: string) => {
        // DuckDB accepts: PRAGMA table_info(table_name)
        const cols = await all<{ name: string; pk: number }>(`PRAGMA table_info(${name})`);
        return cols.some((c) => c.name === 'id' && Number(c.pk) > 0);
      };

      const ensureUniqueOnId = async (name: string) => {
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
    } catch (preflightErr) {
      console.warn('DuckDB migration preflight check failed (continuing):', preflightErr);
    }

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');

      // Check if already applied
      const existing = await all<{ checksum: string }>(
        'SELECT checksum FROM _migrations WHERE filename = ?',
        file,
      );
      if (existing.length > 0) {
        if (existing[0].checksum !== checksum) {
          console.warn(
            `Migration ${file} has changed since it was applied. Skipping re-apply. (stored=${existing[0].checksum.slice(
              0,
              8,
            )} current=${checksum.slice(0, 8)})`,
          );
        }
        continue;
      }

      // Apply in a transaction
      try {
        await run('BEGIN TRANSACTION');
        await this.execScript(sql);
        await run('INSERT INTO _migrations (filename, checksum) VALUES (?, ?)', file, checksum);
        await run('COMMIT');
      } catch (err) {
        try {
          await run('ROLLBACK');
        } catch (rollbackErr) {
          console.warn('Rollback failed after migration error:', rollbackErr);
        }
        console.error('Failed to apply migration:', file, err);
        throw err;
      }
    }
  }

  private execScript(sql: string): Promise<void> {
    const sanitized = sql
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n');

    const statements = sanitized
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    return statements.reduce<Promise<void>>((promise, statement) => {
      return promise.then(
        () =>
          new Promise<void>((resolve, reject) => {
            this.db.run(statement, (err: Error | null) => {
              if (err) {
                console.error('DuckDB migration statement failed:', statement, err);
                reject(err);
              } else {
                resolve();
              }
            });
          }),
      );
    }, Promise.resolve());
  }

  async query<T = any>(sql: string, params: any[] = [], options: QueryOptions = {}): Promise<T[]> {
    await this.ready;
    const finalSql = options.limit ? `${sql} LIMIT ${options.limit}` : sql;
    return new Promise<T[]>((resolve, reject) => {
      const values = params ?? [];
      const handler = (err: Error | null, rows?: T[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows ?? []);
        }
      };

      if (values.length > 0) {
        this.db.all(finalSql, ...values, (err: Error | null, rows?: T[]) => {
          if (err) {
            console.error('DuckDB query error:', finalSql, values, err);
          }
          handler(err, rows);
        });
      } else {
        this.db.all(finalSql, (err: Error | null, rows?: T[]) => {
          if (err) {
            console.error('DuckDB query error:', finalSql, [], err);
          }
          handler(err, rows);
        });
      }
    });
  }

  async execute(sql: string, params: any[] = [], options: QueryOptions = {}): Promise<RunMeta> {
    await this.ready;
    const connection = this.db;
    return new Promise<RunMeta>((resolve, reject) => {
      const values = params ?? [];
      const runCallback = function (this: any, err: Error | null) {
        if (err) {
          // Suppress logging for index already exists errors (handled gracefully elsewhere)
          const errorMsg = (err as any)?.message || '';
          const isIndexExistsError = errorMsg.includes('already exists') &&
                                     errorMsg.includes('idx_forensic_case_events_unique');
          if (!isIndexExistsError) {
            console.error('DuckDB execute error:', sql, values, err);
          }
          reject(err);
        } else if (options.skipLastId) {
          resolve({});
        } else {
          const lastId = typeof this?.lastID === 'number' ? this.lastID : undefined;
          if (lastId !== undefined) {
            resolve({ last_row_id: Number(lastId) });
          } else {
            const tableMatch = /^\s*insert\s+into\s+["`]?([A-Za-z0-9_]+)["`]?/i.exec(sql);
            if (!tableMatch) {
              resolve({});
              return;
            }
            const tableName = tableMatch[1];
            connection.all(`SELECT id FROM ${tableName} ORDER BY id DESC LIMIT 1`, (err2: Error | null, rows?: { id: number }[]) => {
              if (err2 || !rows || rows.length === 0) {
                resolve({});
              } else {
                resolve({ last_row_id: Number(rows[0].id) });
              }
            });
          }
        }
      };

      if (values.length > 0) {
        this.db.run(sql, ...values, runCallback);
      } else {
        this.db.run(sql, runCallback);
      }
    });
  }
}

let bindingInstance: DuckDBBinding | null = null;

export function getDuckDBBinding(): DuckDBBinding {
  if (!bindingInstance) {
    bindingInstance = new DuckDBBinding();
  }
  return bindingInstance;
}
