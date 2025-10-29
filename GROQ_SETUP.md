# Groq API Setup - Free Llama 3.2 (No Installation!)

## What is Groq?

Groq provides **FREE** access to powerful AI models including Llama 3.2 with **blazing fast inference**. No installation required - just get an API key!

## Why Groq Instead of Local Installation?

✅ **No installation** - Works immediately
✅ **FREE tier** - Generous free usage
✅ **Super fast** - Fastest inference in the industry
✅ **Latest models** - Llama 3.2 90B (90 billion parameters!)
✅ **Cloud-based** - No local resources needed
✅ **Cross-platform** - Works everywhere

## Setup (2 Minutes)

### Step 1: Get Free API Key

1. Go to https://console.groq.com
2. Sign up (free account)
3. Click "API Keys" in the left sidebar
4. Click "Create API Key"
5. Copy your API key

### Step 2: Configure Environment Variable

You have two options:

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add a new secret:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Your Groq API key from Step 1
4. Click **Save**

**Option B: Local Development (.env file)**

Add to your `.env` file:
```env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

### Step 3: Done!

That's it! Your AI can now answer ANY question!

## How It Works

```
User asks ANY question
     ↓
System checks knowledge base first
     ↓ (no match)
System uses Groq's Llama 3.2 90B model
     ↓
Returns intelligent answer! ✨
```

## What You Get

### With Knowledge Base Only:
✅ Fast survival responses
❌ Can't answer non-survival questions

### With Groq API Added:
✅ Fast survival responses (still instant!)
✅ **Answers ANYTHING** (history, science, coding, etc.)
✅ Powered by Llama 3.2 90B (state-of-the-art model)
✅ Fastest inference speed in the industry

## Testing

Try these questions:

**Survival (uses knowledge base - instant):**
- "How do I start a fire?"
- "What do I do in an earthquake?"

**Non-survival (uses Groq Llama 3.2):**
- "What's the capital of France?"
- "Explain quantum physics"
- "How do I make sourdough bread?"
- "Write a haiku about mountains"

## Groq Free Tier Limits

- **Rate Limits**: 30 requests per minute
- **Token Limits**: Generous daily quota
- **Models Available**: Llama 3.2, Llama 3.1, Mixtral, and more
- **Cost**: FREE!

For most users, the free tier is more than enough!

## Alternative Models

You can switch models by updating the edge function. Available models:

| Model | Size | Speed | Best For |
|-------|------|-------|----------|
| llama-3.2-90b-text-preview | 90B | ⚡⚡ | **Best quality** (current) |
| llama-3.2-11b-text-preview | 11B | ⚡⚡⚡ | Fast & accurate |
| llama-3.1-70b-versatile | 70B | ⚡⚡ | Versatile tasks |
| mixtral-8x7b-32768 | 8x7B | ⚡⚡⚡ | Long context |

## Troubleshooting

### Error: "GROQ_API_KEY not configured"

**Solution**: Make sure you added the API key to Supabase secrets or .env file

**Check in Supabase:**
1. Go to Project Settings → Edge Functions → Secrets
2. Verify `GROQ_API_KEY` is listed
3. If not, add it

### Error: "401 Unauthorized"

**Solution**: Your API key is invalid or expired

1. Go to https://console.groq.com/keys
2. Generate a new API key
3. Update your environment variable

### Error: "Rate limit exceeded"

**Solution**: You've hit the free tier limit

- Wait a few minutes for the rate limit to reset
- Or upgrade to Groq Pro for higher limits

### Questions Still Not Working

1. Check browser console for errors
2. Check Supabase Edge Function logs
3. Verify survival questions work (knowledge base)
4. Verify non-survival questions trigger Groq

## Cost Comparison

| Solution | Setup Time | Cost/Month | Quality | Offline |
|----------|------------|------------|---------|---------|
| **Groq API** | 2 min | **FREE** | ⭐⭐⭐⭐⭐ | ❌ |
| OpenAI | 5 min | $20-100 | ⭐⭐⭐⭐⭐ | ❌ |
| Local Ollama | 15 min | FREE | ⭐⭐⭐⭐ | ✅ |

## Privacy Considerations

- Groq processes queries on their servers
- Data is encrypted in transit (HTTPS)
- Groq doesn't train on your data
- For complete privacy, use local Ollama instead

## Support

- **Groq Docs**: https://console.groq.com/docs
- **Groq Discord**: https://discord.gg/groq
- **Rate Limits**: https://console.groq.com/docs/rate-limits

---

## Summary

With Groq configured, your survival AI can now:

✅ **Answer survival questions** instantly (knowledge base)
✅ **Answer ANY other question** intelligently (Groq Llama 3.2)
✅ **Work without installation** (cloud-based)
✅ **Stay free** (generous free tier)
✅ **Run super fast** (fastest inference)

Just get your free API key and you're done! 🚀
