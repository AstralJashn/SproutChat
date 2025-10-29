# Ollama Integration Guide

## What is Ollama?

Ollama allows you to run powerful AI models locally on your computer. This gives your survival AI the ability to answer **ANY question** - even those outside the pre-defined knowledge base.

## Why Use Ollama?

✅ **Universal Coverage** - Answer questions about anything
✅ **Offline Capability** - Works without internet
✅ **Privacy** - All processing happens on your machine
✅ **Free** - No API costs
✅ **Fast** - Local inference is quick

## Installation

### Step 1: Install Ollama

**macOS & Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from: https://ollama.com/download/windows

### Step 2: Start Ollama Service

```bash
ollama serve
```

This starts the Ollama API server on `http://localhost:11434`

### Step 3: Download a Model

**Recommended for this project:**
```bash
ollama pull llama3.2
```

**Other excellent options:**
```bash
# Faster, smaller model
ollama pull llama3.2:1b

# More capable, larger model
ollama pull llama3.1:8b

# Best quality (requires more RAM)
ollama pull llama3.1:70b

# Specialized for conversation
ollama pull mistral
```

### Step 4: Configure Environment Variables

The system uses these defaults, but you can customize them:

```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

**To use a different model:**
```env
OLLAMA_MODEL=mistral
```

**To use a remote Ollama instance:**
```env
OLLAMA_URL=http://your-server-ip:11434
```

## How It Works

The AI uses a multi-tier fallback system:

```
User Question
    ↓
1. Pre-defined Knowledge Base
    ↓ (if no match)
2. Configured External AI (OpenAI, Groq, Mistral)
    ↓ (if not configured)
3. Ollama Local AI ✨
    ↓ (if Ollama unavailable)
4. Friendly Error Message
```

### Tier 3: Ollama Fallback

When the knowledge base doesn't have an answer, Ollama automatically:
- Receives the question with survival context
- Generates a thoughtful, relevant response
- Returns the answer to the user

## Testing Ollama

### 1. Check if Ollama is Running
```bash
curl http://localhost:11434/api/version
```

Should return: `{"version":"..."}`

### 2. Test Direct Generation
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "What are the best survival priorities?",
  "stream": false
}'
```

### 3. Ask a Question in the App

Try asking something outside the knowledge base:
- "What's the capital of France?"
- "How do I make sourdough bread?"
- "Tell me about quantum physics"

If Ollama is running, you'll get intelligent responses!

## Performance Tuning

### Model Selection Guide

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| llama3.2:1b | 1.3GB | ⚡⚡⚡ | ⭐⭐ | Low-end hardware, speed |
| llama3.2 (3b) | 2GB | ⚡⚡ | ⭐⭐⭐ | Balanced (recommended) |
| mistral | 4.1GB | ⚡⚡ | ⭐⭐⭐⭐ | Better reasoning |
| llama3.1:8b | 4.7GB | ⚡ | ⭐⭐⭐⭐⭐ | High quality |
| llama3.1:70b | 40GB | 💤 | ⭐⭐⭐⭐⭐⭐ | Best quality |

### Optimization Options

Edit the edge function parameters (optional):

```typescript
options: {
  temperature: 0.7,    // Lower = more focused (0.1-1.0)
  top_p: 0.9,         // Nucleus sampling (0.1-1.0)
  max_tokens: 500     // Response length (100-2000)
}
```

## Troubleshooting

### Error: "Ollama unavailable"

**Check if Ollama is running:**
```bash
ps aux | grep ollama
```

**Start Ollama:**
```bash
ollama serve
```

### Error: "Model not found"

**List installed models:**
```bash
ollama list
```

**Install the model:**
```bash
ollama pull llama3.2
```

### Slow Responses

**Try a smaller model:**
```bash
ollama pull llama3.2:1b
```

**Or adjust max_tokens:**
```env
# In edge function - reduce from 500 to 300
max_tokens: 300
```

### High Memory Usage

**Unload models when not in use:**
```bash
ollama stop llama3.2
```

**Use smaller models:**
```bash
ollama pull llama3.2:1b
```

## Advanced Configuration

### Use Multiple Models

You can switch models based on question type by modifying the edge function:

```typescript
// Example: Use different models for different topics
const ollamaModel = userContent.includes("emergency")
  ? "llama3.1:8b"  // Better for critical questions
  : "llama3.2:1b"; // Faster for general questions
```

### Remote Ollama Server

Run Ollama on a powerful server and connect from anywhere:

**On server:**
```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

**In your .env:**
```env
OLLAMA_URL=http://your-server-ip:11434
```

### GPU Acceleration

Ollama automatically uses GPU if available:
- NVIDIA (CUDA)
- AMD (ROCm)
- Apple Silicon (Metal)

No configuration needed!

## Resource Requirements

### Minimum:
- **RAM**: 4GB
- **Disk**: 5GB free
- **Model**: llama3.2:1b

### Recommended:
- **RAM**: 8GB
- **Disk**: 10GB free
- **Model**: llama3.2 (3b)

### Optimal:
- **RAM**: 16GB+
- **Disk**: 20GB+ free
- **Model**: llama3.1:8b
- **GPU**: NVIDIA/AMD/Apple Silicon

## Benefits Over Cloud APIs

| Feature | Ollama | Cloud APIs |
|---------|--------|------------|
| **Cost** | Free | Pay per use |
| **Privacy** | 100% local | Data sent to servers |
| **Offline** | ✅ Yes | ❌ No |
| **Speed** | Fast (local) | Network dependent |
| **Setup** | One-time | API keys required |
| **Limits** | None | Rate limits |

## Summary

With Ollama integrated, your survival AI can now:
✅ Answer ANY question intelligently
✅ Work completely offline
✅ Maintain privacy
✅ Scale without cost
✅ Provide instant responses

Just install Ollama, pull a model, and you're ready to handle unlimited questions!
