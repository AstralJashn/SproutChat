SproutChat

## Offline LLM Runtime

SproutChat includes optional offline LLM inference powered by llama.cpp as a headless runtime. This feature is disabled by default and requires native binary dependencies.

### Enabling Offline Mode

1. Set the environment flag in `.env`:

```bash
VITE_OFFLINE_LLM=1
```

2. Set environment variables for prebuilt llama.cpp binaries:

```bash
export LLAMA_SO_URL="https://your-release-url/libllama.so"
export LLAMA_A_URL="https://your-release-url/libllama.a"
```

3. Install dependencies and sync to native platforms:

```bash
npm install
npm run cap:sync:android  # For Android
npm run cap:sync:ios      # For iOS
```

The `postinstall` script will automatically download the native binaries to the correct locations in `node_modules/@yourorg/capacitor-offline-llm/`.

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

Native binaries are automatically downloaded during `npm install` via the `postinstall` script (`scripts/fetch-llama.sh`).

**Android (arm64-v8a)**:
- Downloaded to `node_modules/@yourorg/capacitor-offline-llm/android/src/main/jniLibs/arm64-v8a/libllama.so`
- Build uses CMake with ABI filter for arm64-v8a

**iOS (arm64)**:
- Downloaded to `node_modules/@yourorg/capacitor-offline-llm/ios/llama/lib/arm64/libllama.a`
- Podspec links Accelerate framework and optionally Metal/MetalKit

### Scripts

```bash
npm install              # Installs deps + runs postinstall to fetch binaries
npm run cap:sync:android # Sync to Android platform
npm run cap:sync:ios     # Sync to iOS platform
npm run android          # Build + sync + open Android Studio
npm run ios              # Build + sync + open Xcode
```

### Architecture

- **Plugin**: `@yourorg/capacitor-offline-llm` (npm package) - Capacitor plugin with TypeScript bridge + Android/iOS native code
- **Service**: `src/offlineRuntime.ts` - Headless facade with model management and generation API
- **Flag**: `src/runtimeMode.ts` - Feature flag gated by `VITE_OFFLINE_LLM`
- **Fetch Script**: `scripts/fetch-llama.sh` - Downloads prebuilt llama.cpp binaries on install

No UI components are modified. The runtime is available purely as a programmatic API for internal use or testing.
