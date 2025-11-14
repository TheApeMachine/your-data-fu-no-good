"""
NLP Service - State-of-the-art sentiment and intent analysis
Uses transformer models from Hugging Face for high-quality analysis
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="NLP Analysis Service")

# Initialize models (lazy loading)
sentiment_analyzer = None
intent_classifier = None

def get_sentiment_analyzer():
    """Lazy load sentiment analysis model"""
    global sentiment_analyzer
    if sentiment_analyzer is None:
        logger.info("Loading sentiment analysis model...")
        # Using distilbert-base-uncased-finetuned-sst-2-english for speed
        # Much faster than RoBERTa while maintaining good accuracy (~92% vs ~95%)
        # Processes ~10x faster, perfect for batch processing
        sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            device=0 if torch.cuda.is_available() else -1,
            top_k=None  # Return all scores (positive/negative)
        )
        logger.info("Sentiment model loaded")
    return sentiment_analyzer

def get_intent_classifier():
    """Lazy load intent classification model"""
    global intent_classifier
    if intent_classifier is None:
        logger.info("Loading intent classification model...")
        # Using facebook/bart-large-mnli for zero-shot classification
        # This is the best balance of speed and accuracy for zero-shot tasks
        # For even faster processing, could use microsoft/deberta-v3-base, but BART is better for zero-shot
        intent_classifier = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli",
            device=0 if torch.cuda.is_available() else -1
        )
        logger.info("Intent model loaded")
    return intent_classifier

class SentimentRequest(BaseModel):
    texts: List[str]

class IntentRequest(BaseModel):
    texts: List[str]
    candidate_labels: Optional[List[str]] = None

class SentimentResponse(BaseModel):
    results: List[dict]

class IntentResponse(BaseModel):
    results: List[dict]

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/sentiment", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """
    Analyze sentiment for a list of texts using DistilBERT model.
    Returns: positive, negative, or neutral with confidence scores.
    Processes texts in batches for efficiency.
    """
    try:
        analyzer = get_sentiment_analyzer()
        results = []

        # Filter out empty texts and prepare for batch processing
        valid_texts = []
        text_indices = []
        for idx, text in enumerate(request.texts):
            if text and len(text.strip()) > 0:
                valid_texts.append(text[:512])  # Limit to 512 tokens
                text_indices.append(idx)
            else:
                results.append({
                    "label": "neutral",
                    "confidence": 0.5
                })

        if not valid_texts:
            return SentimentResponse(results=results)

        # Process in batches for efficiency (model can handle ~32 at once)
        batch_size = 32
        batch_results = []

        for i in range(0, len(valid_texts), batch_size):
            batch = valid_texts[i:i + batch_size]
            try:
                # Batch processing - much faster than individual calls
                batch_scores = analyzer(batch)

                # Handle both single and batch responses
                if not isinstance(batch_scores[0], list):
                    batch_scores = [batch_scores]

                for scores in batch_scores:
                    # DistilBERT returns POSITIVE/NEGATIVE labels
                    # Map to our format (positive, negative, neutral)
                    positive_score = None
                    negative_score = None

                    for score in scores:
                        label = score['label'].upper()
                        if 'POSITIVE' in label:
                            positive_score = score['score']
                        elif 'NEGATIVE' in label:
                            negative_score = score['score']

                    if positive_score is not None and negative_score is not None:
                        # Determine sentiment based on scores
                        diff = positive_score - negative_score
                        if diff > 0.1:
                            label = "positive"
                            confidence = positive_score
                        elif diff < -0.1:
                            label = "negative"
                            confidence = negative_score
                        else:
                            label = "neutral"
                            confidence = 0.5 + abs(diff) * 0.5

                        batch_results.append({
                            "label": label,
                            "confidence": float(confidence)
                        })
                    else:
                        batch_results.append({
                            "label": "neutral",
                            "confidence": 0.5
                        })
            except Exception as e:
                logger.warning(f"Error processing batch: {e}")
                # Add neutral results for failed batch
                batch_results.extend([{
                    "label": "neutral",
                    "confidence": 0.5
                }] * len(batch))

        # Insert results at correct indices
        result_idx = 0
        for idx in range(len(request.texts)):
            if idx in text_indices:
                results.insert(idx, batch_results[result_idx])
                result_idx += 1

        return SentimentResponse(results=results)

    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/intent", response_model=IntentResponse)
async def classify_intent(request: IntentRequest):
    """
    Classify intent for a list of texts using zero-shot classification.
    Default labels: question, complaint, request, information, feedback, other
    Processes texts individually (zero-shot doesn't support true batching, but we optimize)
    """
    try:
        classifier = get_intent_classifier()

        # Default intent categories
        candidate_labels = request.candidate_labels or [
            "question",
            "complaint",
            "request",
            "information",
            "feedback",
            "other"
        ]

        results = []

        # Filter out empty texts
        valid_texts = []
        text_indices = []
        for idx, text in enumerate(request.texts):
            if text and len(text.strip()) > 0:
                valid_texts.append(text[:512])  # Limit to 512 tokens
                text_indices.append(idx)
            else:
                results.append({
                    "label": "other",
                    "confidence": 0.5
                })

        # Process texts (zero-shot classification processes one at a time, but we optimize)
        for text in valid_texts:
            try:
                # Zero-shot classification
                classification = classifier(text, candidate_labels)

                # Get top label
                top_label = classification['labels'][0]
                top_score = classification['scores'][0]

                results.append({
                    "label": top_label,
                    "confidence": float(top_score)
                })
            except Exception as e:
                logger.warning(f"Error processing text: {e}")
                results.append({
                    "label": "other",
                    "confidence": 0.5
                })

        # Insert results at correct indices
        result_idx = 0
        final_results = []
        for idx in range(len(request.texts)):
            if idx in text_indices:
                final_results.append(results[result_idx])
                result_idx += 1
            else:
                final_results.append({
                    "label": "other",
                    "confidence": 0.5
                })

        return IntentResponse(results=final_results)

    except Exception as e:
        logger.error(f"Intent classification error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
