import duckdb from 'duckdb';
import fs from 'node:fs';
import path from 'node:path';

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

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await this.execScript(sql);
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
        this.db.all(finalSql, ...values, handler);
      } else {
        this.db.all(finalSql, handler);
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
