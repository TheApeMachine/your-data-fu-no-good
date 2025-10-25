#!/bin/bash
# Test all 7 LLM function calling tools

BASE_URL="http://localhost:3000/api/chat/23"
DATASET_ID=23

echo "🧪 Testing all 7 LLM function calling tools..."
echo ""

# Test 1: get_outlier_columns
echo "1️⃣ Testing get_outlier_columns..."
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"message": "Which columns have outliers?", "conversationHistory": []}' \
  | jq -r '.message' | head -10
echo ""
echo "---"
echo ""

# Test 2: get_correlation_analysis
echo "2️⃣ Testing get_correlation_analysis..."
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the strongest correlations?", "conversationHistory": []}' \
  | jq -r '.message' | head -10
echo ""
echo "---"
echo ""

# Test 3: get_column_statistics
echo "3️⃣ Testing get_column_statistics..."
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about sales_volume", "conversationHistory": []}' \
  | jq -r '.message' | head -10
echo ""
echo "---"
echo ""

# Test 4: search_analyses
echo "4️⃣ Testing search_analyses..."
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"message": "Search for pattern analyses", "conversationHistory": []}' \
  | jq -r '.message' | head -10
echo ""
echo "---"
echo ""

# Test 5: get_data_sample
echo "5️⃣ Testing get_data_sample..."
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me 2 rows of data", "conversationHistory": []}' \
  | jq -r '.message' | head -15
echo ""
echo "---"
echo ""

# Test 6: get_missing_values
echo "6️⃣ Testing get_missing_values..."
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"message": "Are there any missing values?", "conversationHistory": []}' \
  | jq -r '.message' | head -10
echo ""
echo "---"
echo ""

# Test 7: suggest_data_cleaning
echo "7️⃣ Testing suggest_data_cleaning..."
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"message": "Suggest data cleaning steps", "conversationHistory": []}' \
  | jq -r '.message' | head -15
echo ""
echo "---"
echo ""

echo "✅ All 7 tools tested!"
echo ""
echo "Check PM2 logs to see which tools were called:"
echo "  pm2 logs webapp --nostream --lines 50 | grep 'Tool calls\\|Executing tool'"
