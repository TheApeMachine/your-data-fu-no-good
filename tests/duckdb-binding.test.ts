// Tests that DuckDBBinding serializes statements on its shared connection.
// The mocked duckdb module reproduces the real single-connection transaction
// semantics: a BEGIN inside an open transaction fails, and once a statement
// fails inside a transaction every statement fails until ROLLBACK.

import { test, expect, mock } from 'bun:test';

const MockDatabase = class MockDatabase {
    inTransaction = false;
    aborted = false;
    statements: string[] = [];
    failures: string[] = [];
    failWhen: ((sql: string) => boolean) | null = null;

    constructor(_path?: string) {}

    private guard(sql: string) {
      const s = sql.trim().toUpperCase();
      if (this.aborted) {
        if (s.startsWith('ROLLBACK')) {
          this.aborted = false;
          this.inTransaction = false;
          return;
        }
        throw new Error('TransactionContext Error: Current transaction is aborted (please ROLLBACK)');
      }
      if (s.startsWith('BEGIN')) {
        if (this.inTransaction) {
          throw new Error('TransactionContext Error: cannot start a transaction within a transaction');
        }
        this.inTransaction = true;
        return;
      }
      if (s.startsWith('COMMIT') || s.startsWith('ROLLBACK')) {
        this.inTransaction = false;
      }
    }

    run(sql: string, ...args: any[]) {
      const cb = args[args.length - 1];
      queueMicrotask(() => {
        try {
          this.guard(sql);
          if (this.failWhen?.(sql)) throw new Error('injected failure');
          this.statements.push(sql.trim());
          cb(null);
        } catch (e) {
          if (this.inTransaction) this.aborted = true;
          this.failures.push(sql.trim().slice(0, 50));
          cb(e);
        }
      });
    }

    all(sql: string, ...args: any[]) {
      const cb = args[args.length - 1];
      queueMicrotask(() => {
        try {
          this.guard(sql);
          this.statements.push(sql.trim());
          cb(null, []);
        } catch (e) {
          if (this.inTransaction) this.aborted = true;
          this.failures.push(sql.trim().slice(0, 50));
          cb(e);
        }
      });
    }
};

// Cover both CJS/ESM interop shapes for `import duckdb from 'duckdb'`
mock.module('duckdb', () => ({
  default: { Database: MockDatabase },
  Database: MockDatabase,
}));

async function makeBinding() {
  const { DuckDBBinding } = await import('../src/storage/duckdb-binding');
  return new DuckDBBinding(':memory:');
}

test('concurrent batches serialize on the shared connection', async () => {
  const binding = await makeBinding();
  const mk = (tag: number) =>
    Array.from({ length: 3 }, (_, i) => binding.prepare(`INSERT INTO data_rows VALUES (${tag}${i})`).bind(tag, i));

  await Promise.all([binding.batch(mk(1)), binding.batch(mk(2))]);

  const db = (binding as any).db;
  expect(db.failures).toEqual([]);

  // Each batch's inserts must be contiguous: no statement of one transaction
  // may interleave with another's (the cause of the original crash).
  const inserts = db.statements
    .filter((s: string) => s.startsWith('INSERT INTO data_rows'))
    .map((s: string) => s.match(/\((\d+)\)/)![1]);
  expect(inserts).toEqual(['10', '11', '12', '20', '21', '22']);

  const begins = db.statements.filter((s: string) => s.startsWith('BEGIN')).length;
  const commits = db.statements.filter((s: string) => s.startsWith('COMMIT')).length;
  expect(begins).toBe(commits);
});

test('a failed statement in a batch rolls back and leaves the connection usable', async () => {
  const binding = await makeBinding();
  const db = (binding as any).db;
  db.failWhen = (sql: string) => sql.includes('POISON');

  const stmts = [
    binding.prepare('INSERT INTO t VALUES (1)').bind(1),
    binding.prepare('INSERT INTO t VALUES (POISON)').bind(2),
  ];
  await expect(binding.batch(stmts)).rejects.toThrow('injected failure');
  expect(db.statements.some((s: string) => s.startsWith('ROLLBACK'))).toBe(true);

  // Before the fix, everything after an aborted transaction failed forever.
  await binding.execute('SELECT 1');
  await binding.batch([binding.prepare('INSERT INTO t VALUES (3)').bind(3)]);
  expect(db.aborted).toBe(false);
});

test('concurrent execute() calls do not interleave into an open transaction', async () => {
  const binding = await makeBinding();
  const db = (binding as any).db;

  const batchOp = binding.batch([
    binding.prepare('INSERT INTO data_rows VALUES (100)').bind(100),
  ]);
  const execOp = binding.execute('UPDATE datasets SET row_count = 1');
  await Promise.all([batchOp, execOp]);

  expect(db.failures).toEqual([]);
  // The UPDATE must land after the batch's transaction, not inside it
  const seq = db.statements.filter((s: string) =>
    /^(BEGIN TRANSACTION|COMMIT|INSERT INTO data_rows|UPDATE datasets)/.test(s),
  );
  const insertIdx = seq.indexOf('INSERT INTO data_rows VALUES (100)');
  const updateIdx = seq.indexOf('UPDATE datasets SET row_count = 1');
  expect(insertIdx).toBeGreaterThan(-1);
  expect(updateIdx).toBeGreaterThan(insertIdx);
});
