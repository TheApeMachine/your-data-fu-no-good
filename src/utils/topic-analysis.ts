const MAX_ROWS = 1500;
const MIN_AVG_LENGTH = 25;
const MAX_KEYWORDS = 40;
const SIMILARITY_THRESHOLD = 0.25;
const CLUSTER_THRESHOLD = 0.35;
const MAX_SHARED_TERMS = 6;

const STOPWORDS = new Set([
  'the','and','for','with','that','from','this','have','been','were','will','shall','would','should','about','there','their','which','into','onto','near','over','under','within','without','between','among','after','before','because','while','where','when','what','whose','like','just','such','than','then','they','them','these','those','your','ours','ourselves','hers','herself','him','himself','hers','its','itself','it','our','you','yourself','yourselves','are','was','is','be','being','been','can','could','may','might','must','do','does','did','done','doing','not','but','also','only','other','all','any','each','few','more','most','some','many','much','very','per','via','amp','http','https','www','com','org','net','inc','ltd','co','project','company','team','data','info','information'
]);

export interface TextTopic {
  column: string;
  document_count: number;
  average_length: number;
  keywords: Array<{ term: string; score: number }>;
  samples: Array<{ row_number: number; excerpt: string }>;
  vector: Array<{ term: string; weight: number }>;
}

export interface TopicCluster {
  id: string;
  columns: string[];
  strength: number;
  keywords: Array<{ term: string; weight: number }>;
}

export interface TopicsAnalysisResult {
  topics: TextTopic[];
  similarities: Array<{ source: string; target: string; similarity: number; shared_terms: string[] }>;
  clusters: TopicCluster[];
}

function safeParseJson(value: unknown) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }
  if (value && typeof value === 'object') {
    return value;
  }
  return null;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function cosineSimilarity(mapA: Map<string, number>, mapB: Map<string, number>): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  mapA.forEach((weight, term) => {
    magA += weight * weight;
    const weightB = mapB.get(term);
    if (weightB !== undefined) {
      dot += weight * weightB;
    }
  });

  mapB.forEach((weight) => {
    magB += weight * weight;
  });

  if (magA === 0 || magB === 0) return 0;
  return dot / Math.sqrt(magA * magB);
}

function aggregateVectorKeywords(columns: string[], vectors: Map<string, number>[]): Array<{ term: string; weight: number }> {
  const totals = new Map<string, number>();
  vectors.forEach((vector) => {
    vector.forEach((weight, term) => {
      totals.set(term, (totals.get(term) ?? 0) + weight);
    });
  });
  const entries = Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([term, weight]) => ({ term, weight }));
  return entries;
}

function buildRepresentativeSamples(
  docs: { tokens: string[]; text: string; row_number: number }[],
  keywords: Array<{ term: string; score: number }>,
  maxSamples = 5
): Array<{ row_number: number; excerpt: string }> {
  const representativeRows: Array<{ row_number: number; excerpt: string }> = [];
  const usedDocs = new Set<number>();

  for (const keyword of keywords.slice(0, 6)) {
    const term = keyword.term;
    if (!term) continue;
    for (const doc of docs) {
      if (usedDocs.has(doc.row_number) && representativeRows.length >= maxSamples) break;
      if (doc.tokens.includes(term)) {
        usedDocs.add(doc.row_number);
        representativeRows.push({
          row_number: doc.row_number,
          excerpt: doc.text.length > 160 ? `${doc.text.slice(0, 157)}...` : doc.text,
        });
        break;
      }
    }
    if (representativeRows.length >= maxSamples) break;
  }

  return representativeRows;
}

export async function computeTextTopics(
  datasetId: number,
  db: any,
  options: { rowLimit?: number } = {},
): Promise<TopicsAnalysisResult> {
  const rowLimit = options.rowLimit ?? MAX_ROWS;

  const dataset = await db.prepare(`SELECT columns FROM datasets WHERE id = ?`).bind(datasetId).first();
  if (!dataset) {
    return [];
  }

  const columnDefinitions: any[] = JSON.parse(dataset.columns as string);

  const rowsResult = await db
    .prepare(`SELECT row_number, data FROM data_rows WHERE dataset_id = ? LIMIT ?`)
    .bind(datasetId, rowLimit)
    .all();

  const parsedRows = rowsResult.results
    .map((row: any) => {
      const parsed = safeParseJson(row.data);
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }
      return { row_number: Number(row.row_number), data: parsed as Record<string, unknown> };
    })
    .filter((entry): entry is { row_number: number; data: Record<string, unknown> } => entry !== null);

  const topics: TextTopic[] = [];
  const columnVectors = new Map<string, Map<string, number>>();

  for (const column of columnDefinitions) {
    if (String(column.type || '').toLowerCase() !== 'string') continue;

    const docs: { tokens: string[]; text: string; row_number: number }[] = [];
    let totalLength = 0;

    for (const row of parsedRows) {
      const raw = row.data[column.name];
      if (typeof raw !== 'string') continue;
      const trimmed = raw.trim();
      if (!trimmed) continue;
      totalLength += trimmed.length;
      const tokens = tokenize(trimmed);
      if (tokens.length === 0) continue;
      docs.push({ tokens, text: trimmed, row_number: row.row_number });
    }

    if (docs.length < 10) continue;
    const avgLength = totalLength / docs.length;
    if (avgLength < MIN_AVG_LENGTH) continue;

    const termFrequency = new Map<string, number>();
    const docFrequency = new Map<string, number>();

    docs.forEach(({ tokens }) => {
      const seen = new Set<string>();
      tokens.forEach((token) => {
        termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1);
        if (!seen.has(token)) {
          docFrequency.set(token, (docFrequency.get(token) ?? 0) + 1);
          seen.add(token);
        }
      });
    });

    const docCount = docs.length;
    const keywordScores: Array<{ term: string; score: number }> = [];

    termFrequency.forEach((tf, term) => {
      const df = docFrequency.get(term) ?? 1;
      const idf = Math.log((docCount + 1) / (df + 1)) + 1;
      keywordScores.push({ term, score: tf * idf });
    });

    keywordScores.sort((a, b) => b.score - a.score);
    const topKeywords = keywordScores.slice(0, MAX_KEYWORDS);

    const vector = new Map<string, number>();
    topKeywords.forEach(({ term, score }) => {
      vector.set(term, score);
    });

    columnVectors.set(column.name, vector);

    const samples = buildRepresentativeSamples(docs, topKeywords);

    topics.push({
      column: column.name,
      document_count: docCount,
      average_length: Math.round(avgLength),
      keywords: topKeywords.slice(0, 12),
      samples,
      vector: topKeywords.map(({ term, score }) => ({ term, weight: score })),
    });
  }

  // Compute similarities between columns
  const similarities: Array<{ source: string; target: string; similarity: number; shared_terms: string[] }> = [];
  const topicMap = new Map(topics.map((topic) => [topic.column, topic]));
  const vectorsArray = Array.from(columnVectors.entries());

  for (let i = 0; i < vectorsArray.length; i++) {
    const [colA, vecA] = vectorsArray[i];
    for (let j = i + 1; j < vectorsArray.length; j++) {
      const [colB, vecB] = vectorsArray[j];
      const similarity = cosineSimilarity(vecA, vecB);
      if (!Number.isFinite(similarity) || similarity < SIMILARITY_THRESHOLD) continue;

      // Determine shared terms
      const shared: Array<{ term: string; weight: number }> = [];
      vecA.forEach((weight, term) => {
        if (vecB.has(term)) {
          shared.push({ term, weight: weight + (vecB.get(term) ?? 0) });
        }
      });

      shared.sort((a, b) => b.weight - a.weight);
      const sharedTerms = shared.slice(0, MAX_SHARED_TERMS).map((entry) => entry.term);

      similarities.push({
        source: colA,
        target: colB,
        similarity,
        shared_terms: sharedTerms,
      });
    }
  }

  // Build clusters using union-find on similarities above cluster threshold
  const parent = new Map<string, string>();
  function find(x: string): string {
    if (!parent.has(x)) parent.set(x, x);
    else if (parent.get(x) !== x) parent.set(x, find(parent.get(x)!));
    return parent.get(x)!;
  }
  function union(a: string, b: string) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return;
    parent.set(rootB, rootA);
  }

  similarities
    .filter((entry) => entry.similarity >= CLUSTER_THRESHOLD)
    .forEach((entry) => {
      union(entry.source, entry.target);
    });

  const clusterMembers = new Map<string, string[]>();
  Array.from(topicMap.keys()).forEach((column) => {
    const root = find(column);
    if (!clusterMembers.has(root)) {
      clusterMembers.set(root, []);
    }
    clusterMembers.get(root)!.push(column);
  });

  const clusters: TopicCluster[] = [];
  let clusterIndex = 1;
  clusterMembers.forEach((members, root) => {
    if (members.length < 2) return;
    const vectors = members
      .map((column) => columnVectors.get(column))
      .filter((vector): vector is Map<string, number> => vector !== undefined);
    if (!vectors.length) return;

    const aggregatedKeywords = aggregateVectorKeywords(members, vectors);

    // Average strength of edges inside cluster
    const edges = similarities.filter(
      (entry) => members.includes(entry.source) && members.includes(entry.target)
    );
    const averageStrength = edges.length
      ? edges.reduce((sum, entry) => sum + entry.similarity, 0) / edges.length
      : CLUSTER_THRESHOLD;

    clusters.push({
      id: `topic_cluster_${clusterIndex++}`,
      columns: members,
      strength: Number(averageStrength.toFixed(3)),
      keywords: aggregatedKeywords,
    });
  });

  return {
    topics,
    similarities,
    clusters,
  };
}
