/**
 * NLP Client - Communicates with Python NLP service for state-of-the-art
 * sentiment and intent analysis using transformer models
 */
// Get NLP service URL from environment, with fallback for local development
function getNlpServiceUrl() {
    // Check both process.env (Node.js) and global env
    if (typeof process !== 'undefined' && process.env?.NLP_SERVICE_URL) {
        return process.env.NLP_SERVICE_URL;
    }
    // Default to localhost for development
    return 'http://localhost:8001';
}
/**
 * Retry helper with exponential backoff
 */
async function retryFetch(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            // Don't retry on non-network errors (4xx, etc.)
            if (error?.response?.status && error.response.status < 500) {
                throw error;
            }
            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError || new Error('Retry failed');
}
/**
 * Analyze sentiment for multiple texts using transformer model
 */
export async function analyzeSentiment(texts) {
    if (texts.length === 0) {
        return [];
    }
    try {
        const serviceUrl = getNlpServiceUrl();
        return await retryFetch(async () => {
            // Use AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
            try {
                const response = await fetch(`${serviceUrl}/sentiment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ texts }),
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error(`NLP service error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                return data.results || [];
            }
            catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('NLP service request timeout');
                }
                throw error;
            }
        });
    }
    catch (error) {
        console.error('Failed to analyze sentiment after retries:', error);
        // Fallback to neutral if service unavailable
        return texts.map(() => ({ label: 'neutral', confidence: 0.5 }));
    }
}
/**
 * Classify intent for multiple texts using zero-shot classification
 */
export async function classifyIntent(texts, candidateLabels) {
    if (texts.length === 0) {
        return [];
    }
    try {
        const serviceUrl = getNlpServiceUrl();
        return await retryFetch(async () => {
            // Use AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
            try {
                const response = await fetch(`${serviceUrl}/intent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        texts,
                        candidate_labels: candidateLabels,
                    }),
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error(`NLP service error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                return data.results || [];
            }
            catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('NLP service request timeout');
                }
                throw error;
            }
        });
    }
    catch (error) {
        console.error('Failed to classify intent after retries:', error);
        // Fallback to other if service unavailable
        return texts.map(() => ({ label: 'other', confidence: 0.5 }));
    }
}
/**
 * Get aggregated sentiment for a collection of texts
 */
export async function getAggregatedSentiment(texts) {
    if (texts.length === 0) {
        return { label: 'neutral', confidence: 0.5 };
    }
    const results = await analyzeSentiment(texts);
    // Aggregate results
    const positiveCount = results.filter(r => r.label === 'positive').length;
    const negativeCount = results.filter(r => r.label === 'negative').length;
    const neutralCount = results.filter(r => r.label === 'neutral').length;
    const total = results.length;
    const positiveRatio = positiveCount / total;
    const negativeRatio = negativeCount / total;
    const neutralRatio = neutralCount / total;
    // Determine dominant sentiment
    if (positiveRatio > negativeRatio && positiveRatio > neutralRatio) {
        return {
            label: 'positive',
            confidence: positiveRatio,
        };
    }
    else if (negativeRatio > positiveRatio && negativeRatio > neutralRatio) {
        return {
            label: 'negative',
            confidence: negativeRatio,
        };
    }
    else {
        return {
            label: 'neutral',
            confidence: neutralRatio,
        };
    }
}
/**
 * Get aggregated intent for a collection of texts
 */
export async function getAggregatedIntent(texts) {
    if (texts.length === 0) {
        return { label: 'other', confidence: 0.5 };
    }
    const results = await classifyIntent(texts);
    // Aggregate results - find most common intent
    const intentCounts = new Map();
    let totalConfidence = 0;
    for (const result of results) {
        const count = intentCounts.get(result.label) || 0;
        intentCounts.set(result.label, count + 1);
        totalConfidence += result.confidence;
    }
    // Find most common intent
    let maxCount = 0;
    let dominantIntent = 'other';
    for (const [intent, count] of intentCounts.entries()) {
        if (count > maxCount) {
            maxCount = count;
            dominantIntent = intent;
        }
    }
    const avgConfidence = totalConfidence / results.length;
    const frequencyConfidence = maxCount / results.length;
    return {
        label: dominantIntent,
        confidence: (avgConfidence + frequencyConfidence) / 2,
    };
}
