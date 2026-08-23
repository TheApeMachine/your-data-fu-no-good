// Streaming parsers for large file uploads.
// Each parser consumes a Node Readable chunk-by-chunk and hands batches of
// parsed rows to onRows, keeping memory bounded regardless of file size.

import { Readable, Transform } from 'node:stream';
import readline from 'node:readline';
import Papa from 'papaparse';

export type RowBatchHandler = (rows: Record<string, any>[]) => Promise<void>;

/**
 * Wrap a web ReadableStream (e.g. a Hono request body) as a Node Readable,
 * rejecting the stream if it exceeds maxBytes.
 */
export function toCountedNodeStream(body: ReadableStream<any>, maxBytes: number): Readable {
  let total = 0;
  const counter = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      total += chunk.length;
      if (total > maxBytes) {
        cb(new Error(`File too large. Maximum size is ${formatBytes(maxBytes)}.`));
        return;
      }
      cb(null, chunk);
    },
  });
  return Readable.fromWeb(body as any).pipe(counter);
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)}GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(0)}MB`;
  return `${Math.round(bytes / 1024)}KB`;
}

/**
 * Stream-parse CSV via PapaParse, invoking onRows per chunk.
 */
export function parseCSVStream(stream: Readable, onRows: RowBatchHandler): Promise<void> {
  return new Promise((resolve, reject) => {
    Papa.parse(stream, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      chunk: async (results: any, parser: { pause(): void; resume(): void; abort(): void }) => {
        try {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors.slice(0, 5));
          }
          parser.pause();
          await onRows(results.data as Record<string, any>[]);
          parser.resume();
        } catch (error) {
          parser.abort();
          reject(error);
        }
      },
      complete: () => resolve(),
      error: (error: Error) => reject(error),
    });
  });
}

/**
 * Stream-parse JSONL: one JSON object per line, invoking onRows per batch.
 */
export async function parseJSONLStream(stream: Readable, onRows: RowBatchHandler, batchSize = 1000): Promise<void> {
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let batch: Record<string, any>[] = [];
  let lineNumber = 0;

  try {
    for await (const rawLine of rl) {
      lineNumber++;
      const line = rawLine.trim();
      if (line.length === 0) continue;

      let parsed: any;
      try {
        parsed = JSON.parse(line);
      } catch (e) {
        throw new Error(`Invalid JSON on line ${lineNumber}: ${(e as Error).message}`);
      }
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error(`Line ${lineNumber} is not a JSON object`);
      }

      batch.push(parsed);
      if (batch.length >= batchSize) {
        await onRows(batch);
        batch = [];
      }
    }
    if (batch.length > 0) {
      await onRows(batch);
    }
  } finally {
    rl.close();
  }
}

// Max buffered size of a single root-level JSON value (e.g. one huge object)
const MAX_SINGLE_VALUE_BYTES = 256 * 1024 * 1024;

/**
 * Stream-parse a JSON document: either an array of objects (parsed one
 * top-level element at a time) or a single root object.
 */
export async function parseJSONStream(stream: Readable, onRows: RowBatchHandler, batchSize = 1000): Promise<void> {
  const decoder = new TextDecoder('utf-8');
  let buf = '';
  let pos = 0;

  let started = false;      // saw the first non-whitespace character
  let rootIsArray = false;
  let arrayClosed = false;
  let rootDone = false;     // completed a non-array root object
  let rootCount = 0;

  let depth = 0;            // nesting depth inside the current top-level value
  let valueStart = -1;
  let inString = false;
  let escaped = false;

  let batch: Record<string, any>[] = [];

  const handleValue = async (text: string) => {
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON: ${(e as Error).message}`);
    }
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Top-level JSON values must be objects');
    }
    if (Array.isArray(parsed)) {
      throw new Error('Nested arrays are not supported as rows; upload a flat array of objects');
    }
    rootCount++;
    batch.push(parsed);
    if (batch.length >= batchSize) {
      await onRows(batch);
      batch = [];
    }
  };

  const scan = async () => {
    while (pos < buf.length) {
      const ch = buf[pos];

      if (depth === 0 && !inString) {
        if (/\s/.test(ch)) { pos++; continue; }
        if (!started) {
          started = true;
          if (ch === '[') { rootIsArray = true; pos++; continue; }
          if (ch === '{') { /* fall through to value scanning */ }
          else { throw new Error('Invalid JSON: expected an array or an object'); }
        } else if (rootIsArray) {
          if (arrayClosed) { throw new Error('Invalid JSON: trailing content after array'); }
          if (ch === ',') { pos++; continue; }
          if (ch === ']') { arrayClosed = true; pos++; continue; }
          if (ch !== '{') { throw new Error('Invalid JSON: array elements must be objects'); }
        } else {
          // Single-object root: nothing may follow it
          if (rootDone) { throw new Error('Invalid JSON: multiple objects without an enclosing array (use JSONL format)'); }
          if (ch !== '{') { throw new Error('Invalid JSON: expected an object'); }
        }
        if (ch === '{') {
          valueStart = pos;
          depth = 1;
          pos++;
          continue;
        }
      }

      // Inside a top-level value
      if (inString) {
        if (escaped) { escaped = false; }
        else if (ch === '\\') { escaped = true; }
        else if (ch === '"') { inString = false; }
        pos++;
      } else if (ch === '"') {
        inString = true;
        pos++;
      } else if (ch === '{' || ch === '[') {
        depth++;
        pos++;
      } else if (ch === '}' || ch === ']') {
        depth--;
        pos++;
        if (depth === 0) {
          if (pos - valueStart > MAX_SINGLE_VALUE_BYTES) {
            throw new Error('A single JSON object exceeds 256MB; split the file into JSONL');
          }
          const text = buf.slice(valueStart, pos);
          if (!rootIsArray) { rootDone = true; }
          valueStart = -1;
          await handleValue(text);
        }
      } else {
        pos++;
      }
    }
  };

  for await (const chunk of stream) {
    buf = (pos > 0 && valueStart === -1) ? buf.slice(pos) + decoder.decode(chunk as Buffer, { stream: true })
                                         : buf + decoder.decode(chunk as Buffer, { stream: true });
    pos = valueStart === -1 && pos > 0 ? 0 : pos;
    await scan();
  }
  buf += decoder.decode(); // flush decoder
  await scan();

  if (!started) {
    throw new Error('Invalid JSON: document is empty');
  }
  if (valueStart !== -1 || depth > 0) {
    throw new Error('Invalid JSON: truncated document');
  }
  if (rootIsArray && !arrayClosed) {
    throw new Error('Invalid JSON: array is not closed');
  }
  if (batch.length > 0) {
    await onRows(batch);
  }
  if (rootCount === 0 && rootIsArray) {
    throw new Error('File contains no data');
  }
}
