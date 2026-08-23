// JSONL (JSON Lines) parser: one JSON object per line

/**
 * Parse JSONL content into rows.
 * Blank lines are skipped; any invalid line throws with its line number.
 */
export function parseJSONL(content: string): Record<string, any>[] {
  const rows: Record<string, any>[] = [];
  // Strip UTF-8 BOM so the first line parses like any other line
  const lines = content.replace(/^\ufeff/, '').split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;

    let parsed: any;
    try {
      parsed = JSON.parse(line);
    } catch (e) {
      throw new Error(`Invalid JSON on line ${i + 1}: ${(e as Error).message}`);
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error(`Line ${i + 1} is not a JSON object`);
    }

    rows.push(parsed);
  }

  return rows;
}

/**
 * Quick validation: check if content looks like valid JSONL
 */
export function validateJSONL(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'File is empty' };
  }

  try {
    parseJSONL(content);
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }

  return { valid: true };
}
