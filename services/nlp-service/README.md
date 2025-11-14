# NLP Service

State-of-the-art sentiment and intent analysis using transformer models from Hugging Face.

## Models Used

### Sentiment Analysis
- **Model**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Type**: DistilBERT (lightweight, fast transformer)
- **Accuracy**: ~92% on general text (vs ~95% for RoBERTa, but 10x faster)
- **Speed**: Processes batches of 32 texts efficiently
- **Output**: positive, negative, neutral with confidence scores

### Intent Classification
- **Model**: `facebook/bart-large-mnli`
- **Type**: Zero-shot classification using BART
- **Accuracy**: High accuracy for intent detection
- **Output**: question, complaint, request, information, feedback, other

## Where to See Results

**Sentiment and Intent badges appear in the Topics tab:**

1. Upload a dataset with text columns
2. Click the **"Topics"** tab in the results view
3. Each topic card shows:
   - **Sentiment badge** (top-right): 😊 positive, 😞 negative, or 😐 neutral
   - **Intent badge** (next to sentiment): question, complaint, request, information, feedback, or other
   - Confidence scores shown when > 60%

The badges are color-coded:
- **Sentiment**: Green (positive), Red (negative), Gray (neutral)
- **Intent**: Blue (question), Red (complaint), Purple (request), Cyan (information), Orange (feedback), Gray (other)

## Running Locally

```bash
cd services/nlp-service
pip install -r requirements.txt
python app.py
```

The service will be available at `http://localhost:8001`

## Docker

```bash
docker build -t nlp-service .
docker run -p 8001:8001 nlp-service
```

## API Endpoints

### POST /sentiment
Analyze sentiment for multiple texts (batch processing).

**Request:**
```json
{
  "texts": ["I love this product!", "This is terrible", "It's okay"]
}
```

**Response:**
```json
{
  "results": [
    {"label": "positive", "confidence": 0.95},
    {"label": "negative", "confidence": 0.92},
    {"label": "neutral", "confidence": 0.65}
  ]
}
```

### POST /intent
Classify intent for multiple texts.

**Request:**
```json
{
  "texts": ["How do I reset my password?", "I need help with billing"],
  "candidate_labels": ["question", "complaint", "request", "information", "feedback", "other"]
}
```

**Response:**
```json
{
  "results": [
    {"label": "question", "confidence": 0.89},
    {"label": "request", "confidence": 0.85}
  ]
}
```

## Performance

- **Batch Processing**: All texts are processed in batches of 32 for maximum efficiency
- **Speed**: ~100-200ms per batch of 32 texts (vs ~500ms per text individually)
- **First request**: ~3-5s (model loading - DistilBERT is smaller than RoBERTa)
- **Subsequent requests**: Much faster due to batching
- **GPU acceleration**: ~10x faster (if available)

## Model Caching

Models are cached in `/app/models` volume to avoid re-downloading on restart.
