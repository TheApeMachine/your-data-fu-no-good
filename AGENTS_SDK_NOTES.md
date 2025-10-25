# OpenAI Agents SDK - Cloudflare Workers Compatibility Notes

## Summary

The **OpenAI Agents SDK** (`@openai/agents`) is an excellent tool for building agent-based AI applications, but it is **NOT compatible with Cloudflare Workers/Pages** environment due to runtime restrictions.

## Why It Doesn't Work

### 1. **Zod Version Conflicts**
- The Agents SDK requires `zod@^3.25.40 || ^4.0`
- Cloudflare's Wrangler uses `zod@3.22.3` (older version)
- Forcing installation with `--legacy-peer-deps` causes runtime errors

### 2. **Node.js-Specific Dependencies**
- The SDK is designed for Node.js runtime
- Uses discriminated unions and complex Zod schemas that fail in Workers runtime
- Error: `A discriminator value for key 'type' could not be extracted from all schema options`

### 3. **Runtime Environment Mismatch**
- Cloudflare Workers use V8 isolates (not full Node.js)
- Many Node.js APIs are unavailable or limited
- The SDK's dependency tree includes packages that assume Node.js APIs

## Error Messages Encountered

```
service core:user:webapp: Uncaught Error: A discriminator value for key `type` 
could not be extracted from all schema options
    at null.<anonymous> (6v8oc2wsote.js:5416:21) in create
    at null.<anonymous> (6v8oc2wsote.js:7912:12)

The Workers runtime failed to start. There is likely additional logging output above.
```

## Current Solution

We use the **raw OpenAI Chat Completions API** directly via `fetch()`:

```typescript
const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ],
    max_tokens: 1000,
    temperature: 0.7
  })
});
```

### Advantages of Raw API:
- ✅ **100% Compatible** with Cloudflare Workers
- ✅ **No Dependencies** - just native fetch
- ✅ **Full Control** over request/response
- ✅ **Lightweight** - minimal bundle size
- ✅ **Edge Runtime** - runs on Cloudflare's edge network

### What We Lose:
- ❌ Agent abstractions (tools, handoffs, guardrails)
- ❌ Built-in conversation management
- ❌ Lifecycle hooks and event system
- ❌ TypeScript type safety for agent configs

## When to Use Agents SDK

The OpenAI Agents SDK is excellent for:
- **Node.js applications** (Express, Hono on Node, etc.)
- **Complex multi-agent systems** with handoffs
- **Tool-based agents** that call external APIs
- **Long-running conversations** with state management

## When to Use Raw API (Our Case)

Use the raw OpenAI API when:
- **Deploying to Cloudflare Workers/Pages** ✅
- **Simple conversational AI** without complex agent logic ✅
- **Edge runtime requirements** for global performance ✅
- **Minimal bundle size** is important ✅

## Alternative Solutions

If you need agent-like features in Cloudflare Workers:

1. **Implement Tools Manually**
   ```typescript
   // Define tool schemas
   const tools = [{
     type: 'function',
     function: {
       name: 'get_weather',
       description: 'Get weather for a city',
       parameters: {
         type: 'object',
         properties: {
           city: { type: 'string' }
         }
       }
     }
   }];
   
   // Include in API call
   body: JSON.stringify({
     model: 'gpt-4o-mini',
     messages,
     tools
   })
   ```

2. **Use Cloudflare Durable Objects**
   - For persistent conversation state
   - Agent coordination across requests

3. **External Agent Service**
   - Run Agents SDK in Node.js backend
   - Call from Cloudflare Workers via API

## Recommendation

For this data intelligence platform:
- ✅ **Current approach is optimal** - raw API + edge runtime
- ✅ Performance is excellent (3-4 seconds for responses)
- ✅ Simple conversational interface is sufficient
- ✅ Can add tool calling later if needed (using OpenAI's tool schema)

## Future Considerations

If we need advanced agent features:
1. **Hybrid Architecture**: Agents SDK on Node.js backend + Cloudflare Workers frontend
2. **Migrate to Node.js**: Use Hono with `@hono/node-server` instead of Workers
3. **Wait for SDK Updates**: OpenAI may release Workers-compatible version

---

**Last Updated:** 2025-10-25  
**Status:** Raw OpenAI API working perfectly in production
