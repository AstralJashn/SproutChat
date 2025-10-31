SproutChat

## Offline LLM Runtime

SproutChat includes optional offline LLM inference powered by llama.cpp as a headless runtime. This feature is disabled by default and requires native binary dependencies.

### Enabling Offline Mode

Set the environment flag in `.env`:

```bash
VITE_OFFLINE_LLM=1
```

### Headless API

The offline runtime is available as a headless service without any UI integration. Import and use from dev tools or internal scripts:

```typescript
import { ensureModel, loadModel, generate, stop, unload } from './src/offlineRuntime';

const modelPath = await ensureModel(
  'https://example.com/model.gguf',
  'model.gguf',
  'sha256-optional'
);

await loadModel({
  path: modelPath,
  nCtx: 2048,
  nThreads: 4,
  useMetal: true
});

await generate(
  {
    prompt: 'Hello, world!',
    maxTokens: 512,
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    repeatPenalty: 1.1
  },
  (token) => console.log('Token:', token),
  (stats) => console.log('Stats:', stats)
);

await stop();
await unload();
```

### Native Dependencies

**Android (arm64-v8a)**:
- Place `libllama.so` in `plugins/capacitor-offline-llm/android/src/main/jniLibs/arm64-v8a/`
- Headers expected at `plugins/capacitor-offline-llm/android/src/main/cpp/llama/include/llama.h`
- Build uses CMake with ABI filter for arm64-v8a

**iOS (arm64)**:
- Place `libllama.a` in `plugins/capacitor-offline-llm/ios/llama/lib/arm64/`
- Headers expected at `plugins/capacitor-offline-llm/ios/llama/include/llama.h`
- Podspec links Accelerate framework and optionally Metal/MetalKit

### Capacitor Sync

After adding native binaries:

```bash
npm run sync
```

This will:
1. Build the web app
2. Copy assets to native platforms
3. Update native project files with the plugin

For development:

```bash
npm run android  # Open Android Studio
npm run ios      # Open Xcode
```

### Architecture

- **Plugin**: `plugins/capacitor-offline-llm/` - Capacitor plugin with TypeScript bridge + Android/iOS native code
- **Service**: `src/offlineRuntime.ts` - Headless facade with model management and generation API
- **Flag**: `src/runtimeMode.ts` - Feature flag gated by `VITE_OFFLINE_LLM`
- **Injection**: `src/hooks/useOfflineInjection.ts` - Optional wrapper to redirect network calls to offline runtime (not imported in UI)

No UI components are modified. The runtime is available purely as a programmatic API for internal use or testing.
