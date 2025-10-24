// Auto-detect ID -> Name column mappings

export interface ColumnMapping {
  id_column: string;
  name_column: string;
  confidence: number;
}

export function detectColumnMappings(
  columns: { name: string, type: string, unique_count: number }[],
  rowCount: number
): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];

  for (const col of columns) {
    const colLower = col.name.toLowerCase();
    
    // Is this an ID column?
    const isIdColumn = (
      colLower.endsWith('id') || 
      colLower.endsWith('_id') ||
      colLower === 'id'
    ) && col.type === 'number';

    if (!isIdColumn) continue;

    // Look for corresponding Name column
    const baseName = col.name.replace(/[_-]?id$/i, '');
    
    // Possible name column patterns
    const patterns = [
      `${baseName}Name`,
      `${baseName}_name`,
      `${baseName}name`,
      `${baseName.toLowerCase()}name`,
      `${baseName}`,
    ];

    for (const pattern of patterns) {
      const nameCol = columns.find(c => 
        c.name.toLowerCase() === pattern.toLowerCase() &&
        c.type === 'string'
      );

      if (nameCol) {
        // Check if they have similar cardinality (both mostly unique or both low)
        const idUniqueness = col.unique_count / rowCount;
        const nameUniqueness = nameCol.unique_count / rowCount;
        
        // High confidence if both are similarly unique
        let confidence = 0.5;
        if (Math.abs(idUniqueness - nameUniqueness) < 0.2) {
          confidence = 0.9;
        } else if (Math.abs(idUniqueness - nameUniqueness) < 0.4) {
          confidence = 0.7;
        }

        mappings.push({
          id_column: col.name,
          name_column: nameCol.name,
          confidence
        });
        break; // Found a match, move to next ID column
      }
    }
  }

  return mappings.filter(m => m.confidence >= 0.5);
}

export function applyColumnMappings(
  data: Record<string, any>[],
  mappings: ColumnMapping[]
): Record<string, any>[] {
  if (mappings.length === 0) return data;

  // Build lookup maps for each ID->Name relationship
  const lookupMaps = new Map<string, Map<any, any>>();
  
  for (const mapping of mappings) {
    const idToName = new Map<any, any>();
    for (const row of data) {
      const id = row[mapping.id_column];
      const name = row[mapping.name_column];
      if (id !== null && id !== undefined && name) {
        idToName.set(id, name);
      }
    }
    lookupMaps.set(mapping.id_column, idToName);
  }

  // Replace IDs with names in the data
  return data.map(row => {
    const newRow = { ...row };
    for (const mapping of mappings) {
      const idValue = newRow[mapping.id_column];
      const nameMap = lookupMaps.get(mapping.id_column);
      if (nameMap && nameMap.has(idValue)) {
        // Store original ID as separate field
        newRow[`${mapping.id_column}_original`] = idValue;
        // Replace ID with human-readable name
        newRow[mapping.id_column] = nameMap.get(idValue);
      }
    }
    return newRow;
  });
}
