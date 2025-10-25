# 🤖 OpenAI Chat Setup Guide

## Overview

The Data Intelligence Platform includes an AI-powered chat assistant that uses OpenAI's GPT models to answer questions about your data conversationally.

---

## 🔑 Getting Your OpenAI API Key

### Step 1: Create an OpenAI Account
1. Go to https://platform.openai.com/signup
2. Sign up (or log in if you already have an account)
3. Your work may provide access - check with your organization

### Step 2: Generate API Key
1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Give it a name (e.g., "Data Intelligence Platform")
4. **Copy the key immediately** - you won't see it again!
5. Format: `sk-proj-...` or `sk-...`

---

## ⚙️ Configuration

### For Local Development

1. **Create `.dev.vars` file** in the project root:
   ```bash
   cd /home/user/webapp
   touch .dev.vars
   ```

2. **Add your API key**:
   ```bash
   # .dev.vars
   OPENAI_API_KEY=sk-your-actual-api-key-here
   OPENAI_MODEL=gpt-4o-mini
   ```

3. **Restart the service**:
   ```bash
   pm2 restart webapp
   ```

4. **Test the chat**:
   - Upload a dataset
   - Click the chat bubble (bottom-right)
   - Ask a question like "What are the strongest correlations?"

### For Production (Cloudflare Pages)

1. **Add secret via Wrangler**:
   ```bash
   cd /home/user/webapp
   wrangler pages secret put OPENAI_API_KEY --project-name webapp
   # Paste your key when prompted
   ```

2. **Optional: Set model**:
   ```bash
   wrangler pages secret put OPENAI_MODEL --project-name webapp
   # Enter: gpt-4o-mini
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

---

## 🎛️ Model Options

| Model | Cost | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `gpt-4o-mini` | ✅ Low | ⚡ Fast | ⭐⭐⭐ Good | Most datasets |
| `gpt-4o` | 💰 Medium | 🐢 Medium | ⭐⭐⭐⭐⭐ Excellent | Complex analysis |
| `gpt-4-turbo` | 💰 Medium | 🚀 Fast | ⭐⭐⭐⭐ Very Good | Production use |
| `gpt-3.5-turbo` | ✅ Very Low | ⚡ Very Fast | ⭐⭐ Okay | Budget option |

**Recommended:** `gpt-4o-mini` (default) - Best balance of cost, speed, and quality

---

## 💬 Chat Features

### What You Can Ask:

**Correlations:**
- "What are the strongest correlations?"
- "Show me relationships between columns"
- "Which columns are correlated with salary?"

**Outliers:**
- "Are there any unusual values?"
- "Which columns have outliers?"
- "Explain the outliers in revenue"

**Patterns:**
- "What patterns exist in the data?"
- "Show me common values"
- "What are the top categories?"

**Trends:**
- "Are there any trends over time?"
- "Is revenue increasing or decreasing?"
- "Show me temporal patterns"

**General:**
- "What's the most important finding?"
- "Summarize the key insights"
- "What should I investigate next?"

### Smart Features:

1. **Context-Aware** - The AI knows about all your insights (top 20 by quality)
2. **Data-Specific** - Responses include actual numbers from your dataset
3. **Follow-Up Suggestions** - Click suggested questions to dive deeper
4. **Conversation Memory** - Maintains context across messages
5. **Explainable** - Answers reference specific insights with confidence scores

---

## 🔒 Security

### Best Practices:

✅ **DO:**
- Store API keys in `.dev.vars` (local) or Wrangler secrets (production)
- Use environment variables (never hardcode)
- Restrict API key permissions on OpenAI dashboard
- Monitor usage on https://platform.openai.com/usage

❌ **DON'T:**
- Commit `.dev.vars` to git (it's in `.gitignore`)
- Share your API key publicly
- Use the same key for multiple projects
- Store keys in frontend code

### File Safety:

The `.dev.vars` file is **automatically ignored** by git:
```bash
# .gitignore
.dev.vars
```

---

## 💰 Cost Estimation

### Pricing (as of 2024):

**gpt-4o-mini:**
- Input: $0.15 per 1M tokens (~750k words)
- Output: $0.60 per 1M tokens (~750k words)

**Typical Chat Session (10 messages):**
- Context: ~2,000 tokens (dataset + insights)
- User messages: ~500 tokens
- AI responses: ~1,500 tokens
- **Total:** ~4,000 tokens = **$0.003** (less than a cent!)

**Monthly Estimate (100 datasets, 1000 chats):**
- ~$3-5 per month for typical usage
- Free tier: $5 credit for first 3 months

---

## 🚨 Troubleshooting

### "OpenAI API key not configured"

**Problem:** API key not found or invalid

**Solutions:**
1. Check `.dev.vars` exists in project root
2. Verify key starts with `sk-`
3. Restart PM2: `pm2 restart webapp`
4. Check logs: `pm2 logs webapp --nostream`

### "Failed to get response from OpenAI"

**Problem:** API request failed

**Solutions:**
1. Verify API key is valid on https://platform.openai.com/api-keys
2. Check you have credits: https://platform.openai.com/usage
3. Check rate limits (free tier: 3 requests/min)
4. Try a different model (gpt-3.5-turbo is more lenient)

### Chat shows fallback responses

**Problem:** API key not configured, using mock responses

**Solutions:**
1. Add `OPENAI_API_KEY` to `.dev.vars`
2. Restart service
3. Fallback responses still work, just not AI-powered

---

## 📊 Monitoring Usage

### Check Your Usage:

1. Go to https://platform.openai.com/usage
2. View requests, tokens, and costs
3. Set spending limits if needed

### Optimize Costs:

- Use `gpt-4o-mini` instead of `gpt-4o` (10x cheaper)
- Limit conversation history (currently keeps full history)
- Set max_tokens lower (currently 1000)
- Cache frequently asked questions

---

## 🎯 Example Conversation

**User:** "What are the strongest correlations?"

**AI:** "Based on your dataset with 456 columns and 5,000 rows, I found 3 strong correlations:

1. **experience vs salary** (r = 0.87, 95% confident)
   - As experience increases, salary increases proportionally
   
2. **education vs promotions** (r = 0.72, 88% confident)
   - Higher education correlates with more promotions
   
3. **hours_worked vs burnout_score** (r = 0.68, 82% confident)
   - More hours worked correlates with higher burnout

Would you like me to explain any of these in more detail?"

**Suggestions:**
- "Are there any unusual outliers?"
- "Tell me more about experience vs salary"
- "What patterns exist in categorical data?"

---

## 🔮 Future Enhancements

Planned improvements:
- **Streaming responses** - See AI typing in real-time
- **Tool calling** - AI can generate new visualizations
- **Vector memory** - Remember past conversations across sessions
- **Custom prompts** - Tailor AI personality for your domain
- **Multi-model support** - Anthropic Claude, Google Gemini

---

## 📞 Support

**Issues?**
- Check logs: `pm2 logs webapp --nostream`
- Verify API key: https://platform.openai.com/api-keys
- Test key: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

**Questions?**
- OpenAI Docs: https://platform.openai.com/docs
- OpenAI Community: https://community.openai.com

---

**Remember:** The chat assistant is optional! The platform works perfectly fine without it, using the fallback response system. But with OpenAI integration, you get a powerful conversational interface to explore your data.

🚀 **Happy Chatting!**
