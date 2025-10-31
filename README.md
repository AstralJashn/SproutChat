SproutChat

## Offline LLM Runtime

SproutChat includes optional offline LLM inference powered by llama.cpp as a headless runtime. This feature is disabled by default and requires native binary dependencies.

### Enabling Offline Mode

**Prerequisites:**
- Prebuilt llama.cpp binaries for Android (`.so`) and iOS (`.a`)
- Hosted at accessible URLs

**Setup Steps:**

1. Set the environment flag in `.env`:

```bash
VITE_OFFLINE_LLM=1
```

2. **REQUIRED:** Set environment variables for prebuilt llama.cpp binaries before running `npm install`:

```bash
export LLAMA_SO_URL="https://your-release-url/libllama.so"
export LLAMA_A_URL="https://your-release-url/libllama.a"

# Optional: SHA256 checksums for integrity verification
export LLAMA_SO_SHA256="abc123..."
export LLAMA_A_SHA256="def456..."
```

3. Install dependencies (this automatically downloads binaries via postinstall hook):

```bash
npm install
```

4. Sync to native platforms:

```bash
npm run cap:sync:android  # For Android
npm run cap:sync:ios      # For iOS
```

5. Build and run on device:

```bash
npm run android  # Opens Android Studio
npm run ios      # Opens Xcode
```

The `postinstall` script (`scripts/fetch-llama.sh`) automatically downloads the native binaries to:
- Android: `plugins/capacitor-offline-llm/android/src/main/jniLibs/arm64-v8a/libllama.so`
- iOS: `plugins/capacitor-offline-llm/ios/llama/lib/arm64/libllama.a`

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

### Testing Offline Runtime

A headless test script is provided at `scripts/dev-offline.ts` to verify offline functionality:

```bash
# Note: This script is for reference only
# Actual testing must be done on a physical Android/iOS device
# The script demonstrates the API usage pattern
```

**On-Device Testing:**

1. Build and deploy to a physical device (not emulator)
2. Enable airplane mode
3. Run the app and trigger offline inference
4. Verify:
   - Tokens stream via `generationProgress` event
   - No network requests occur during generation
   - Inference completes successfully offline

**Expected Behavior:**
- Model loads from local storage
- Token generation streams in real-time
- Works completely offline (airplane mode)
- Performance varies by device (typical: 5-20 tokens/sec on mobile)

### Native Dependencies

Native binaries are automatically downloaded during `npm install` via the `postinstall` script (`scripts/fetch-llama.sh`).

**Android (arm64-v8a)**:
- Downloaded to `plugins/capacitor-offline-llm/android/src/main/jniLibs/arm64-v8a/libllama.so`
- Build uses CMake with ABI filter for arm64-v8a

**iOS (arm64)**:
- Downloaded to `plugins/capacitor-offline-llm/ios/llama/lib/arm64/libllama.a`
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

- **Plugin**: `capacitor-offline-llm` (local file plugin) - Capacitor plugin with TypeScript bridge + Android/iOS native code
- **Service**: `src/offlineRuntime.ts` - Headless facade with model management and generation API
- **Flag**: `src/runtimeMode.ts` - Feature flag gated by `VITE_OFFLINE_LLM`
- **Fetch Script**: `scripts/fetch-llama.sh` - Downloads prebuilt llama.cpp binaries on install

No UI components are modified. The runtime is available purely as a programmatic API for internal use or testing.
