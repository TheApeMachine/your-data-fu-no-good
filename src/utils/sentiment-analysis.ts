// Sentiment Analysis and Intent Classification
// Lexicon-based approach with pattern matching

export interface SentimentResult {
  score: number; // -1 (very negative) to +1 (very positive)
  magnitude: number; // 0 to 1, strength of sentiment
  label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  confidence: number;
}

export interface IntentResult {
  intent: 'informational' | 'transactional' | 'navigational' | 'question' | 'complaint' | 'praise' | 'request' | 'unknown';
  confidence: number;
  signals: string[];
}

export interface EmotionResult {
  primary: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';
  scores: Record<string, number>;
  confidence: number;
}

// Sentiment lexicons (simplified - for production, use comprehensive lexicons like AFINN or VADER)
const POSITIVE_WORDS = new Set([
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best',
  'awesome', 'perfect', 'outstanding', 'brilliant', 'superb', 'magnificent', 'happy',
  'beautiful', 'incredible', 'enjoy', 'nice', 'pleased', 'delighted', 'satisfied',
  'successful', 'effective', 'impressive', 'remarkable', 'valuable', 'helpful'
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'disappointing',
  'disappointed', 'useless', 'waste', 'broken', 'failed', 'failure', 'problem',
  'issue', 'wrong', 'error', 'difficult', 'hard', 'frustrated', 'frustrating',
  'angry', 'upset', 'annoying', 'annoyed', 'unhappy', 'sad', 'unfortunately'
]);

const VERY_POSITIVE_WORDS = new Set([
  'exceptional', 'phenomenal', 'extraordinary', 'outstanding', 'spectacular',
  'flawless', 'impeccable', 'marvelous', 'stellar', 'supreme'
]);

const VERY_NEGATIVE_WORDS = new Set([
  'atrocious', 'abysmal', 'disastrous', 'catastrophic', 'nightmare', 'horrendous',
  'appalling', 'dreadful', 'abominable', 'deplorable'
]);

const INTENSIFIERS = new Set([
  'very', 'extremely', 'absolutely', 'completely', 'totally', 'really', 'incredibly',
  'exceptionally', 'particularly', 'highly', 'quite', 'rather'
]);

const NEGATORS = new Set([
  'not', 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere', 'hardly', 'scarcely',
  'barely', 'doesn\'t', 'isn\'t', 'wasn\'t', 'shouldn\'t', 'wouldn\'t', 'couldn\'t', 'won\'t', 'can\'t', 'don\'t'
]);

// Intent patterns
const INTENT_PATTERNS = {
  question: [/\?$/, /^(what|where|when|why|how|who|which|whose|whom)/i, /\b(can you|could you|would you|will you)\b/i],
  complaint: [/\b(complaint|complain|problem|issue|broken|not working|doesn't work|failed)\b/i],
  praise: [/\b(thank|thanks|appreciate|grateful|excellent service|great job)\b/i],
  request: [/\b(please|kindly|could you|would you|I need|I want|I would like)\b/i],
  transactional: [/\b(buy|purchase|order|pay|payment|price|cost|checkout|cart|subscribe)\b/i],
  navigational: [/\b(where is|how do I get to|directions to|locate|find the)\b/i],
  informational: [/\b(learn|information|about|details|explain|tell me|what is|how does)\b/i]
};

// Emotion keywords
const EMOTION_KEYWORDS = {
  joy: ['happy', 'joy', 'delighted', 'cheerful', 'pleased', 'glad', 'excited', 'thrilled'],
  sadness: ['sad', 'unhappy', 'depressed', 'miserable', 'disappointed', 'heartbroken', 'upset'],
  anger: ['angry', 'furious', 'mad', 'irritated', 'annoyed', 'outraged', 'frustrated'],
  fear: ['afraid', 'scared', 'fearful', 'terrified', 'anxious', 'worried', 'nervous'],
  surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'unexpected'],
  disgust: ['disgusted', 'revolted', 'repulsed', 'appalled', 'horrified', 'sick']
};

/**
 * Tokenize and clean text
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Analyze sentiment of text using lexicon-based approach
 */
export function analyzeSentiment(text: string): SentimentResult {
  const tokens = tokenize(text);

  let score = 0;
  let magnitude = 0;
  let wordCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const prevToken = i > 0 ? tokens[i - 1] : null;

    let wordScore = 0;
    let isNegated = false;

    // Check for negation in previous token
    if (prevToken && NEGATORS.has(prevToken)) {
      isNegated = true;
    }

    // Check sentiment
    if (VERY_POSITIVE_WORDS.has(token)) {
      wordScore = 2;
    } else if (POSITIVE_WORDS.has(token)) {
      wordScore = 1;
    } else if (VERY_NEGATIVE_WORDS.has(token)) {
      wordScore = -2;
    } else if (NEGATIVE_WORDS.has(token)) {
      wordScore = -1;
    }

    // Apply intensifier
    if (prevToken && INTENSIFIERS.has(prevToken) && wordScore !== 0) {
      wordScore *= 1.5;
    }

    // Apply negation
    if (isNegated) {
      wordScore *= -0.5;
    }

    if (wordScore !== 0) {
      score += wordScore;
      magnitude += Math.abs(wordScore);
      wordCount++;
    }
  }

  // Normalize score
  const normalizedScore = wordCount > 0 ? score / wordCount : 0;
  const clampedScore = Math.max(-1, Math.min(1, normalizedScore));

  // Normalize magnitude
  const normalizedMagnitude = wordCount > 0 ? magnitude / wordCount / 2 : 0; // Divide by 2 because max word score is 2

  // Determine label
  let label: SentimentResult['label'];
  if (clampedScore >= 0.5) label = 'very_positive';
  else if (clampedScore >= 0.1) label = 'positive';
  else if (clampedScore <= -0.5) label = 'very_negative';
  else if (clampedScore <= -0.1) label = 'negative';
  else label = 'neutral';

  // Calculate confidence based on magnitude
  const confidence = Math.min(normalizedMagnitude, 1.0);

  return {
    score: clampedScore,
    magnitude: normalizedMagnitude,
    label,
    confidence
  };
}

/**
 * Classify intent of text
 */
export function classifyIntent(text: string): IntentResult {
  const signals: string[] = [];
  const scores: Record<string, number> = {};

  // Test each intent pattern
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    let matchCount = 0;
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        matchCount++;
        signals.push(`${intent}: ${pattern.source.substring(0, 30)}...`);
      }
    }
    if (matchCount > 0) {
      scores[intent] = matchCount;
    }
  }

  // Determine primary intent
  const sortedIntents = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  if (sortedIntents.length === 0) {
    return {
      intent: 'unknown',
      confidence: 0.5,
      signals: ['No clear intent patterns detected']
    };
  }

  const [primaryIntent, primaryScore] = sortedIntents[0];
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const confidence = primaryScore / totalScore;

  return {
    intent: primaryIntent as IntentResult['intent'],
    confidence: Math.min(confidence, 1.0),
    signals
  };
}

/**
 * Detect primary emotion in text
 */
export function detectEmotion(text: string): EmotionResult {
  const tokens = tokenize(text);
  const emotionScores: Record<string, number> = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    disgust: 0,
    neutral: 0
  };

  // Count emotion keywords
  for (const token of tokens) {
    let foundEmotion = false;
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      if (keywords.includes(token)) {
        emotionScores[emotion]++;
        foundEmotion = true;
      }
    }
    if (!foundEmotion) {
      emotionScores.neutral++;
    }
  }

  // Normalize scores
  const total = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
  const normalizedScores: Record<string, number> = {};

  for (const [emotion, score] of Object.entries(emotionScores)) {
    normalizedScores[emotion] = total > 0 ? score / total : 0;
  }

  // Find primary emotion
  const sortedEmotions = Object.entries(normalizedScores).sort((a, b) => b[1] - a[1]);
  const [primaryEmotion, primaryScore] = sortedEmotions[0];

  return {
    primary: primaryEmotion as EmotionResult['primary'],
    scores: normalizedScores,
    confidence: primaryScore
  };
}

/**
 * Comprehensive text analysis combining sentiment, intent, and emotion
 */
export function analyzeText(text: string): {
  sentiment: SentimentResult;
  intent: IntentResult;
  emotion: EmotionResult;
} {
  return {
    sentiment: analyzeSentiment(text),
    intent: classifyIntent(text),
    emotion: detectEmotion(text)
  };
}

/**
 * Aggregate sentiment for a collection of texts
 */
export function aggregateSentiment(texts: string[]): {
  averageScore: number;
  averageMagnitude: number;
  distribution: Record<SentimentResult['label'], number>;
  positive: number;
  negative: number;
  neutral: number;
} {
  if (texts.length === 0) {
    return {
      averageScore: 0,
      averageMagnitude: 0,
      distribution: {
        very_positive: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        very_negative: 0
      },
      positive: 0,
      negative: 0,
      neutral: 0
    };
  }

  const results = texts.map(text => analyzeSentiment(text));

  const distribution: Record<SentimentResult['label'], number> = {
    very_positive: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    very_negative: 0
  };

  let totalScore = 0;
  let totalMagnitude = 0;

  for (const result of results) {
    totalScore += result.score;
    totalMagnitude += result.magnitude;
    distribution[result.label]++;
  }

  const positive = distribution.very_positive + distribution.positive;
  const negative = distribution.very_negative + distribution.negative;
  const neutral = distribution.neutral;

  return {
    averageScore: totalScore / texts.length,
    averageMagnitude: totalMagnitude / texts.length,
    distribution,
    positive,
    negative,
    neutral
  };
}

/**
 * Aggregate intent classification for a collection of texts
 */
export function aggregateIntent(texts: string[]): {
  distribution: Record<string, number>;
  primaryIntent: string;
  confidence: number;
} {
  if (texts.length === 0) {
    return {
      distribution: {},
      primaryIntent: 'unknown',
      confidence: 0
    };
  }

  const results = texts.map(text => classifyIntent(text));
  const distribution: Record<string, number> = {};

  for (const result of results) {
    distribution[result.intent] = (distribution[result.intent] || 0) + 1;
  }

  // Find primary intent
  const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const [primaryIntent, count] = sorted[0];
  const confidence = count / texts.length;

  return {
    distribution,
    primaryIntent,
    confidence
  };
}
