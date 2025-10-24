// CSV Parser utility

export function parseCSV(content: string): Record<string, any>[] {
  const lines = content.trim().split('\n');
  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, any>[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`Row ${i} has ${values.length} columns, expected ${headers.length}`);
    }

    const row: Record<string, any> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] !== undefined ? values[idx] : null;
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

export function inferColumnTypes(rows: Record<string, any>[]): Record<string, string> {
  if (rows.length === 0) return {};

  const columns = Object.keys(rows[0]);
  const types: Record<string, string> = {};

  for (const col of columns) {
    const samples = rows.slice(0, Math.min(100, rows.length)).map(r => r[col]);
    types[col] = inferType(samples);
  }

  return types;
}

function inferType(values: any[]): string {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'string';

  // Check if all are numbers
  const numberCount = nonNullValues.filter(v => !isNaN(Number(v))).length;
  if (numberCount === nonNullValues.length) return 'number';

  // Check if all are dates
  const dateCount = nonNullValues.filter(v => !isNaN(Date.parse(v))).length;
  if (dateCount === nonNullValues.length) return 'date';

  // Check if all are booleans
  const boolCount = nonNullValues.filter(v => 
    v.toString().toLowerCase() === 'true' || v.toString().toLowerCase() === 'false'
  ).length;
  if (boolCount === nonNullValues.length) return 'boolean';

  return 'string';
}
