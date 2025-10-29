# ⚠️ SETUP REQUIRED: Groq API Key

## Current Status

✅ **Survival questions work** (built-in knowledge)
❌ **Other questions fail** (need Groq API key)

## The Error You're Getting

When asking "Explain quantum physics" or similar non-survival questions:
```
"Sorry, there was an error processing your request"
```

**Why?** The Groq API key isn't configured yet.

## Quick Fix (2 Minutes)

### Step 1: Get Free API Key

1. Visit: https://console.groq.com
2. Sign up (free - no credit card)
3. Click "API Keys" → "Create API Key"
4. Copy the key (starts with `gsk_...`)

### Step 2: Add to Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** (⚙️) → **Edge Functions**
4. Scroll to **Secrets**
5. Click **Add Secret**:
   - Name: `GROQ_API_KEY`
   - Value: Your API key
6. Click **Save**

### Step 3: Refresh & Test

1. Refresh your app
2. Ask: "Explain quantum physics"
3. ✅ Should work now!

## What This Enables

### Before Setup:
- ✅ "How to start a fire?" - Works
- ❌ "What is quantum physics?" - Error

### After Setup:
- ✅ "How to start a fire?" - Works (instant)
- ✅ "What is quantum physics?" - Works (Llama 3.2)
- ✅ "Capital of France?" - Works
- ✅ "How to make bread?" - Works
- ✅ **ANY question** - Works!

## Why Groq?

✅ **Free** - Generous free tier
✅ **Fast** - Fastest AI inference
✅ **Powerful** - Llama 3.2 90B model
✅ **No installation** - Cloud API

## Still Want to Test Without Setup?

Try these survival questions (work immediately):
- "How do I start a fire?"
- "What to do in earthquake?"
- "How to purify water?"
- "First aid for cuts?"
- "Build emergency shelter"

These use built-in knowledge and need no API key!

## Troubleshooting

**Still getting errors after adding key?**

1. Verify secret name is exactly: `GROQ_API_KEY`
2. Check key starts with `gsk_`
3. Wait 30 seconds after adding
4. Refresh the app page
5. Try again

**Want detailed instructions?**
- See `GROQ_SETUP.md` for full guide
- See `QUICK_START.md` for setup walkthrough

---

The system is working correctly - it just needs the free API key to answer non-survival questions! 🚀
