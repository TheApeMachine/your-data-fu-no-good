// Tests for the streaming upload endpoint (POST /api/upload/stream).
// The duckdb module is mocked (native binding unavailable in some
// environments); the route runs against an in-memory database stub.

import { test, expect, mock } from 'bun:test';
import { Readable } from 'node:stream';

mock.module('duckdb', () => ({
  default: class MockDuckDB {
    constructor() {
      throw new Error('real duckdb should not be constructed in tests');
    }
  },
}));

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
      return { success: true, meta: {} };
    }
    if (/UPDATE datasets/.test(this.sql)) {
      this.db.datasetUpdates.push(this.params);
      return { success: true, meta: {} };
    }
    if (/DELETE FROM data_rows/.test(this.sql)) {
      this.db.deletedRows++;
    }
    if (/DELETE FROM datasets/.test(this.sql)) {
      this.db.deletedDatasets++;
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
  datasetUpdates: any[][] = [];
  rowInserts: any[][] = [];
  mappingInserts: any[][] = [];
  deletedRows = 0;
  deletedDatasets = 0;
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

async function postStream(filename: string, pieces: string[], headers: Record<string, string> = {}) {
  const { default: upload } = await import('../src/routes/upload');
  const db = new FakeDb();
  const req = new Request(`http://localhost/stream?filename=${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/octet-stream', ...headers },
    body: Readable.toWeb(Readable.from(pieces)) as any,
    // @ts-expect-error duplex is required for stream bodies but missing from older DOM libs
    duplex: 'half',
  });
  const res = await upload.request(req, undefined, { DB: db as any });
  return { res, db };
}

test('streams a CSV larger than one insert batch', async () => {
  const lines = ['id,val'];
  for (let i = 0; i < 2500; i++) lines.push(`${i},${i * 2}`);
  const { res, db } = await postStream('big.csv', [lines.join('\n')]);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.row_count).toBe(2500);
  expect(db.rowInserts).toHaveLength(2500);
  // placeholder insert then final update
  expect(db.datasetInserts[0][2]).toBe('csv');
  expect(db.datasetUpdates[0][0]).toBe(2500); // final row_count
  expect(db.datasetUpdates[0][1]).toBe(2);    // column_count
});

test('streams JSONL across chunk boundaries with CRLF and blank lines', async () => {
  const { res, db } = await postStream('events.jsonl', [
    '{"id": 1, "n',
    'ame": "alice"}\r\n\r\n{"id": 2, "name": "bo',
    'b"}\r\n{"id": 3, "name": "carol"}\r\n',
  ]);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.row_count).toBe(3);
  expect(db.datasetInserts[0][2]).toBe('jsonl');
  expect(JSON.parse(db.rowInserts[1][2])).toEqual({ id: 2, name: 'bob' });
});

test('streams a JSON array split across awkward chunk boundaries', async () => {
  const pieces = [
    '[\n  {"id": 1, "tags": ["a", "]b"], "note": "has \\" brace } char"},\n',
    '  {"id": 2, "nested": {"deep": "[not the end]"}},\n',
    '  {"id": 3}\n]\n',
  ];
  const { res, db } = await postStream('array.json', pieces);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.row_count).toBe(3);
  expect(JSON.parse(db.rowInserts[0][2]).tags).toEqual(['a', ']b']);
  expect(JSON.parse(db.rowInserts[1][2]).nested).toEqual({ deep: '[not the end]' });
});

test('streams a single root JSON object', async () => {
  const { res, db } = await postStream('one.json', ['{"id": 1, "name": "solo"}']);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.row_count).toBe(1);
  expect(db.datasetInserts[0][2]).toBe('json');
});

test('rejects a truncated JSON array and cleans up', async () => {
  const { res, db } = await postStream('truncated.json', ['[{"id": 1}, {"id": 2}']);
  expect(res.status).toBe(400);
  expect((await res.json()).error).toContain('not closed');
  expect(db.deletedRows).toBe(1);
  expect(db.deletedDatasets).toBe(1);
});

test('rejects invalid JSONL with line number and cleans up', async () => {
  const { res, db } = await postStream('bad.jsonl', ['{"a": 1}\nbroken\n']);
  expect(res.status).toBe(400);
  expect((await res.json()).error).toContain('line 2');
  expect(db.deletedDatasets).toBe(1);
});

test('rejects an empty stream and cleans up', async () => {
  const { res, db } = await postStream('empty.csv', ['\n\n']);
  expect(res.status).toBe(400);
  expect((await res.json()).error).toBe('File contains no data');
  expect(db.deletedDatasets).toBe(1);
});

test('requires a filename', async () => {
  const { default: upload } = await import('../src/routes/upload');
  const req = new Request('http://localhost/stream', {
    method: 'POST',
    body: '{"a":1}',
  });
  const res = await upload.request(req, undefined, { DB: new FakeDb() as any });
  expect(res.status).toBe(400);
  expect((await res.json()).error).toContain('filename');
});

test('rejects an oversized Content-Length up front', async () => {
  const { res } = await postStream('huge.csv', ['id\n1\n'], { 'content-length': String(3 * 1024 ** 3) });
  expect(res.status).toBe(413);
  expect((await res.json()).error).toContain('too large');
});
