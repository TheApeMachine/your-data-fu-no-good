// Tests for JSONL upload support: parser unit tests plus upload route tests.
// The duckdb module is mocked because its native binding is unavailable in some
// environments; the upload route is exercised with an in-memory database stub.

import { test, expect, mock } from 'bun:test';
import { parseJSONL, validateJSONL } from '../src/utils/jsonl-parser';

mock.module('duckdb', () => ({
  default: class MockDuckDB {
    constructor() {
      throw new Error('real duckdb should not be constructed in tests');
    }
  },
}));

// --- parseJSONL unit tests ---

test('parses basic JSONL content', () => {
  const rows = parseJSONL('{"a": 1}\n{"a": 2}\n{"a": 3}\n');
  expect(rows).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
});

test('skips blank lines and handles CRLF line endings', () => {
  const rows = parseJSONL('{"a": 1}\r\n\r\n{"a": 2}\r\n');
  expect(rows).toEqual([{ a: 1 }, { a: 2 }]);
});

test('strips a UTF-8 BOM from the first line', () => {
  const rows = parseJSONL('\ufeff{"a": 1}\n{"a": 2}\n');
  expect(rows).toEqual([{ a: 1 }, { a: 2 }]);
});

test('preserves nested values and arrays', () => {
  const rows = parseJSONL('{"id": 1, "tags": ["x", "y"], "meta": {"k": true}}\n');
  expect(rows[0].tags).toEqual(['x', 'y']);
  expect(rows[0].meta).toEqual({ k: true });
});

test('reports the line number of invalid JSON', () => {
  expect(() => parseJSONL('{"a": 1}\n{"a": }\n')).toThrow('line 2');
});

test('rejects lines that are not JSON objects', () => {
  expect(() => parseJSONL('[1, 2]\n')).toThrow('not a JSON object');
  expect(() => parseJSONL('"just a string"\n')).toThrow('not a JSON object');
});

test('validateJSONL flags empty content and bad lines', () => {
  expect(validateJSONL('')).toEqual({ valid: false, error: 'File is empty' });
  expect(validateJSONL('{"a": 1}\nnope\n').valid).toBe(false);
  expect(validateJSONL('{"a": 1}\n').valid).toBe(true);
});

// --- upload route tests ---

class FakeStatement {
  public params: any[] = [];
  constructor(public sql: string, private db: FakeDb) {}
  bind(...params: any[]) {
    this.params = params;
    return this;
  }
  async run() {
    if (/INSERT INTO datasets/.test(this.sql)) {
      this.db.datasetInserts.push(this.params);
      return { success: true, meta: { last_row_id: this.db.datasetInserts.length } };
    }
    if (/INSERT INTO column_mappings/.test(this.sql)) {
      this.db.mappingInserts.push(this.params);
    }
    return { success: true, meta: {} };
  }
  async first() {
    return null;
  }
  async all() {
    return { results: [] };
  }
}

class FakeDb {
  datasetInserts: any[][] = [];
  rowInserts: any[][] = [];
  mappingInserts: any[][] = [];
  prepare(sql: string) {
    return new FakeStatement(sql, this);
  }
  async batch(statements: FakeStatement[]) {
    for (const s of statements) {
      if (/INSERT INTO data_rows/.test(s.sql)) {
        this.rowInserts.push(s.params);
      }
    }
  }
}

async function postUpload(filename: string, content: string) {
  const { default: upload } = await import('../src/routes/upload');
  const db = new FakeDb();
  const formData = new FormData();
  formData.append('file', new File([content], filename));
  const res = await upload.request(
    '/',
    { method: 'POST', body: formData },
    { DB: db as any },
  );
  return { res, db };
}

test('uploads a valid .jsonl file', async () => {
  const { res, db } = await postUpload(
    'events.jsonl',
    '{"id": 1, "name": "alice", "score": 10}\n{"id": 2, "name": "bob", "score": 20}\n',
  );
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.row_count).toBe(2);
  expect(body.columns.map((c: any) => c.name)).toEqual(['id', 'name', 'score']);
  // dataset stored with jsonl file_type
  expect(db.datasetInserts[0][2]).toBe('jsonl');
  // one data row insert per parsed line
  expect(db.rowInserts).toHaveLength(2);
  expect(JSON.parse(db.rowInserts[0][2])).toEqual({ id: 1, name: 'alice', score: 10 });
});

test('rejects a .jsonl file with an invalid line, naming the line', async () => {
  const { res } = await postUpload('bad.jsonl', '{"a": 1}\nnot json\n');
  expect(res.status).toBe(400);
  const body = await res.json();
  expect(body.error).toContain('line 2');
});

test('rejects an empty .jsonl file', async () => {
  const { res } = await postUpload('empty.jsonl', '\n\n');
  expect(res.status).toBe(400);
  expect((await res.json()).error).toBe('File contains no data');
});

test('still accepts .csv uploads', async () => {
  const { res, db } = await postUpload('data.csv', 'id,name\n1,alice\n2,bob\n');
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.row_count).toBe(2);
  expect(db.datasetInserts[0][2]).toBe('csv');
});

test('still accepts .json uploads', async () => {
  const { res, db } = await postUpload('data.json', '[{"id": 1}, {"id": 2}]');
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.row_count).toBe(2);
  expect(db.datasetInserts[0][2]).toBe('json');
});

test('rejects unsupported file extensions', async () => {
  const { res } = await postUpload('data.xlsx', 'whatever');
  expect(res.status).toBe(400);
  const body = await res.json();
  expect(body.error).toContain('Unsupported file type');
});
