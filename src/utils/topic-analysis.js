const MAX_ROWS = 1500;
const MIN_AVG_LENGTH = 25;
const MAX_KEYWORDS = 40;
const SIMILARITY_THRESHOLD = 0.25;
const CLUSTER_THRESHOLD = 0.35;
const MAX_SHARED_TERMS = 6;
const STOPWORDS = new Set([
    // English stopwords
    'the', 'and', 'for', 'with', 'that', 'from', 'this', 'have', 'been', 'were', 'will', 'shall', 'would', 'should', 'about', 'there', 'their', 'which', 'into', 'onto', 'near', 'over', 'under', 'within', 'without', 'between', 'among', 'after', 'before', 'because', 'while', 'where', 'when', 'what', 'whose', 'like', 'just', 'such', 'than', 'then', 'they', 'them', 'these', 'those', 'your', 'ours', 'ourselves', 'hers', 'herself', 'him', 'himself', 'hers', 'its', 'itself', 'it', 'our', 'you', 'yourself', 'yourselves', 'are', 'was', 'is', 'be', 'being', 'been', 'can', 'could', 'may', 'might', 'must', 'do', 'does', 'did', 'done', 'doing', 'not', 'but', 'also', 'only', 'other', 'all', 'any', 'each', 'few', 'more', 'most', 'some', 'many', 'much', 'very', 'per', 'via', 'amp', 'http', 'https', 'www', 'com', 'org', 'net', 'inc', 'ltd', 'co', 'project', 'company', 'team', 'data', 'info', 'information',
    // Dutch stopwords - articles, pronouns, prepositions, common verbs
    'de', 'het', 'een', 'en', 'van', 'in', 'is', 'op', 'te', 'dat', 'voor', 'met', 'die', 'aan', 'zijn', 'er', 'als', 'bij', 'ook', 'naar', 'om', 'over', 'kan', 'zou', 'deze', 'dit', 'zo', 'maar', 'meer', 'dan', 'wel', 'niet', 'geen', 'was', 'wat', 'wie', 'waar', 'hoe', 'waarom', 'welke', 'welk', 'welken', 'mijn', 'jouw', 'haar', 'ons', 'jullie', 'hun', 'mij', 'jou', 'hem', 'hen', 'ik', 'jij', 'hij', 'zij', 'wij', 'me', 'je', 'ben', 'bent', 'waren', 'geweest', 'worden', 'wordt', 'word', 'werd', 'werden', 'hebben', 'heeft', 'heb', 'had', 'hadden', 'kunnen', 'kon', 'konden', 'moeten', 'moest', 'moesten', 'zullen', 'zal', 'zouden', 'willen', 'wil', 'wilt', 'wilde', 'wilden', 'mogen', 'mocht', 'mochten', 'doen', 'doet', 'deed', 'deden', 'gaan', 'gaat', 'ging', 'gingen', 'komen', 'komt', 'kwam', 'kwamen', 'zien', 'ziet', 'zag', 'zagen', 'zeggen', 'zegt', 'zei', 'zeiden', 'weten', 'weet', 'wist', 'wisten', 'denken', 'denkt', 'dacht', 'dachten', 'vinden', 'vindt', 'vond', 'vonden', 'geven', 'geeft', 'gaf', 'gaven', 'nemen', 'neemt', 'nam', 'namen', 'krijgen', 'krijgt', 'kreeg', 'kregen', 'maken', 'maakt', 'maakte', 'maakten', 'blijven', 'blijft', 'bleef', 'bleven', 'staan', 'staat', 'stond', 'stonden', 'liggen', 'ligt', 'lag', 'lagen', 'zitten', 'zit', 'zat', 'zaten', 'lopen', 'loopt', 'liep', 'liepen', 'onder', 'tussen', 'door', 'tijdens', 'gedurende', 'sinds', 'tot', 'tegen', 'tegenover', 'naast', 'achter', 'boven', 'binnen', 'buiten', 'zonder'
]);
function safeParseJson(value) {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            return null;
        }
    }
    if (value && typeof value === 'object') {
        return value;
    }
    return null;
}
// Sentiment and intent analysis now handled by Python NLP service
// See src/utils/nlp-client.ts for the client implementation
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}
function cosineSimilarity(mapA, mapB) {
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
    if (magA === 0 || magB === 0)
        return 0;
    return dot / Math.sqrt(magA * magB);
}
function aggregateVectorKeywords(columns, vectors) {
    const totals = new Map();
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
function buildRepresentativeSamples(docs, keywords, maxSamples = 5) {
    const representativeRows = [];
    const usedDocs = new Set();
    for (const keyword of keywords.slice(0, 6)) {
        const term = keyword.term;
        if (!term)
            continue;
        for (const doc of docs) {
            if (usedDocs.has(doc.row_number) && representativeRows.length >= maxSamples)
                break;
            if (doc.tokens.includes(term)) {
                usedDocs.add(doc.row_number);
                representativeRows.push({
                    row_number: doc.row_number,
                    excerpt: doc.text.length > 160 ? `${doc.text.slice(0, 157)}...` : doc.text,
                });
                break;
            }
        }
        if (representativeRows.length >= maxSamples)
            break;
    }
    return representativeRows;
}
export async function computeTextTopics(datasetId, db, options = {}) {
    const rowLimit = options.rowLimit ?? MAX_ROWS;
    const dataset = await db.prepare(`SELECT columns FROM datasets WHERE id = ?`).bind(datasetId).first();
    if (!dataset) {
        return { topics: [], similarities: [], clusters: [] };
    }
    const columnDefinitions = JSON.parse(dataset.columns);
    const rowsResult = await db
        .prepare(`SELECT row_number, data FROM data_rows WHERE dataset_id = ? LIMIT ?`)
        .bind(datasetId, rowLimit)
        .all();
    const parsedRows = rowsResult.results
        .map((row) => {
        const parsed = safeParseJson(row.data);
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }
        return { row_number: Number(row.row_number), data: parsed };
    })
        .filter((entry) => entry !== null);
    const topics = [];
    const columnVectors = new Map();
    // Collect all sample texts for batch NLP processing
    const allSampleTexts = [];
    for (const column of columnDefinitions) {
        if (String(column.type || '').toLowerCase() !== 'string')
            continue;
        const docs = [];
        let totalLength = 0;
        for (const row of parsedRows) {
            const raw = row.data[column.name];
            if (typeof raw !== 'string')
                continue;
            const trimmed = raw.trim();
            if (!trimmed)
                continue;
            totalLength += trimmed.length;
            const tokens = tokenize(trimmed);
            if (tokens.length === 0)
                continue;
            docs.push({ tokens, text: trimmed, row_number: row.row_number });
        }
        if (docs.length < 10)
            continue;
        const avgLength = totalLength / docs.length;
        if (avgLength < MIN_AVG_LENGTH)
            continue;
        const termFrequency = new Map();
        const docFrequency = new Map();
        docs.forEach(({ tokens }) => {
            const seen = new Set();
            tokens.forEach((token) => {
                termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1);
                if (!seen.has(token)) {
                    docFrequency.set(token, (docFrequency.get(token) ?? 0) + 1);
                    seen.add(token);
                }
            });
        });
        const docCount = docs.length;
        const keywordScores = [];
        termFrequency.forEach((tf, term) => {
            const df = docFrequency.get(term) ?? 1;
            const idf = Math.log((docCount + 1) / (df + 1)) + 1;
            keywordScores.push({ term, score: tf * idf });
        });
        keywordScores.sort((a, b) => b.score - a.score);
        const topKeywords = keywordScores.slice(0, MAX_KEYWORDS);
        const vector = new Map();
        topKeywords.forEach(({ term, score }) => {
            vector.set(term, score);
        });
        columnVectors.set(column.name, vector);
        const samples = buildRepresentativeSamples(docs, topKeywords);
        const uniqueTermCount = termFrequency.size;
        // Use 5% of unique terms, but clamp between 8 and 20 keywords for display
        const finalKeywordCount = Math.max(8, Math.min(20, Math.round(uniqueTermCount * 0.10)));
        // Store sample texts for batch processing later
        const sampleTexts = samples.map(s => s.excerpt);
        allSampleTexts.push({ column: column.name, texts: sampleTexts });
        topics.push({
            column: column.name,
            document_count: docCount,
            average_length: Math.round(avgLength),
            keywords: topKeywords.slice(0, finalKeywordCount),
            samples,
            vector: topKeywords.map(({ term, score }) => ({ term, weight: score })),
            // sentiment and intent will be added after batch processing
        });
    }
    // Batch process all sentiment and intent analysis
    if (allSampleTexts.length > 0) {
        try {
            const { analyzeSentiment, classifyIntent } = await import('./nlp-client');
            // Collect all texts for batch processing
            const allTexts = [];
            const textToColumn = new Map();
            let textIndex = 0;
            for (const { column, texts } of allSampleTexts) {
                for (const text of texts) {
                    allTexts.push(text);
                    textToColumn.set(textIndex, column);
                    textIndex++;
                }
            }
            // Batch analyze all texts at once (much more efficient)
            const sentimentResults = await analyzeSentiment(allTexts);
            const intentResults = await classifyIntent(allTexts);
            // Map results back to topics
            const topicSentiments = new Map();
            const topicIntents = new Map();
            let currentIndex = 0;
            for (const { column, texts } of allSampleTexts) {
                const columnSentiments = [];
                const columnIntents = [];
                for (let i = 0; i < texts.length; i++) {
                    if (sentimentResults[currentIndex]) {
                        columnSentiments.push(sentimentResults[currentIndex]);
                    }
                    if (intentResults[currentIndex]) {
                        columnIntents.push(intentResults[currentIndex]);
                    }
                    currentIndex++;
                }
                topicSentiments.set(column, columnSentiments);
                topicIntents.set(column, columnIntents);
            }
            // Aggregate and assign to topics
            for (const topic of topics) {
                const sentiments = topicSentiments.get(topic.column) || [];
                const intents = topicIntents.get(topic.column) || [];
                if (sentiments.length > 0) {
                    // Aggregate sentiment
                    const positiveCount = sentiments.filter(s => s.label === 'positive').length;
                    const negativeCount = sentiments.filter(s => s.label === 'negative').length;
                    const neutralCount = sentiments.filter(s => s.label === 'neutral').length;
                    const total = sentiments.length;
                    const positiveRatio = positiveCount / total;
                    const negativeRatio = negativeCount / total;
                    const diff = positiveRatio - negativeRatio;
                    if (diff > 0.1) {
                        topic.sentiment = { label: 'positive', confidence: positiveRatio };
                    }
                    else if (diff < -0.1) {
                        topic.sentiment = { label: 'negative', confidence: negativeRatio };
                    }
                    else {
                        topic.sentiment = { label: 'neutral', confidence: neutralCount / total };
                    }
                }
                if (intents.length > 0) {
                    // Aggregate intent - find most common
                    const intentCounts = new Map();
                    let totalConfidence = 0;
                    for (const intent of intents) {
                        intentCounts.set(intent.label, (intentCounts.get(intent.label) || 0) + 1);
                        totalConfidence += intent.confidence;
                    }
                    let maxCount = 0;
                    let dominantIntent = 'other';
                    for (const [intent, count] of intentCounts.entries()) {
                        if (count > maxCount) {
                            maxCount = count;
                            dominantIntent = intent;
                        }
                    }
                    const avgConfidence = totalConfidence / intents.length;
                    const frequencyConfidence = maxCount / intents.length;
                    topic.intent = {
                        label: dominantIntent,
                        confidence: (avgConfidence + frequencyConfidence) / 2,
                    };
                }
            }
        }
        catch (error) {
            console.warn('NLP service unavailable, skipping sentiment/intent analysis:', error);
            // Topics will have undefined sentiment/intent
        }
    }
    // Compute similarities between columns
    const similarities = [];
    const topicMap = new Map(topics.map((topic) => [topic.column, topic]));
    const vectorsArray = Array.from(columnVectors.entries());
    for (let i = 0; i < vectorsArray.length; i++) {
        const [colA, vecA] = vectorsArray[i];
        for (let j = i + 1; j < vectorsArray.length; j++) {
            const [colB, vecB] = vectorsArray[j];
            const similarity = cosineSimilarity(vecA, vecB);
            if (!Number.isFinite(similarity) || similarity < SIMILARITY_THRESHOLD)
                continue;
            // Determine shared terms
            const shared = [];
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
    const parent = new Map();
    function find(x) {
        if (!parent.has(x))
            parent.set(x, x);
        else if (parent.get(x) !== x)
            parent.set(x, find(parent.get(x)));
        return parent.get(x);
    }
    function union(a, b) {
        const rootA = find(a);
        const rootB = find(b);
        if (rootA === rootB)
            return;
        parent.set(rootB, rootA);
    }
    similarities
        .filter((entry) => entry.similarity >= CLUSTER_THRESHOLD)
        .forEach((entry) => {
        union(entry.source, entry.target);
    });
    const clusterMembers = new Map();
    Array.from(topicMap.keys()).forEach((column) => {
        const root = find(column);
        if (!clusterMembers.has(root)) {
            clusterMembers.set(root, []);
        }
        clusterMembers.get(root).push(column);
    });
    const clusters = [];
    let clusterIndex = 1;
    clusterMembers.forEach((members, root) => {
        if (members.length < 2)
            return;
        const vectors = members
            .map((column) => columnVectors.get(column))
            .filter((vector) => vector !== undefined);
        if (!vectors.length)
            return;
        const aggregatedKeywords = aggregateVectorKeywords(members, vectors);
        // Average strength of edges inside cluster
        const edges = similarities.filter((entry) => members.includes(entry.source) && members.includes(entry.target));
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
