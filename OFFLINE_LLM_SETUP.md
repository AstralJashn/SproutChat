# Offline LLM Runtime Setup

This document describes the offline LLM infrastructure added to SproutChat.

## What Was Added

### 1. Capacitor Plugin (`plugins/capacitor-offline-llm/`)

A full Capacitor plugin with:
- TypeScript definitions and web shim
- Android native implementation (Java + JNI/C++)
- iOS native implementation (Swift + Objective-C bridge)
- CMake build system for Android
- Podspec for iOS with Accelerate/Metal frameworks

### 2. Headless Runtime Service (`src/offlineRuntime.ts`)

A pure TypeScript facade providing:
- `ensureModel()` - Download and cache models
- `loadModel()` - Load model into memory with parameters
- `generate()` - Generate text with token callbacks
- `stop()` - Stop generation
- `unload()` - Clean up resources

### 3. Feature Flag (`src/runtimeMode.ts` + `.env`)

- Environment variable `VITE_OFFLINE_LLM=0|1`
- Disabled by default
- No UI changes when disabled

### 4. Optional Injection Hook (`src/hooks/useOfflineInjection.ts`)

Wrapper function `maybeUseOfflineLLM()` that can redirect network calls to offline runtime. Not imported anywhere in the UI.

### 5. Documentation

- Main README updated with offline LLM section
- Plugin README with API documentation
- This setup guide

## File Structure

```
SproutChat/
├── plugins/
│   └── capacitor-offline-llm/
│       ├── android/
│       │   ├── build.gradle
│       │   └── src/main/
│       │       ├── cpp/
│       │       │   ├── CMakeLists.txt
│       │       │   ├── offlinellm-jni.cpp
│       │       │   └── llama/include/llama.h
│       │       ├── java/com/sproutchat/offlinellm/
│       │       │   └── OfflineLLMRuntimePlugin.java
│       │       └── jniLibs/arm64-v8a/
│       │           └── .gitkeep (place libllama.so here)
│       ├── ios/
│       │   ├── Plugin/
│       │   │   ├── OfflineLLMRuntimePlugin.swift
│       │   │   └── OfflineLLMRuntimePlugin.m
│       │   └── llama/
│       │       ├── include/llama.h
│       │       └── lib/arm64/
│       │           └── .gitkeep (place libllama.a here)
│       ├── src/
│       │   ├── definitions.ts
│       │   ├── index.ts
│       │   └── web.ts
│       ├── CapacitorOfflineLlm.podspec
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
├── src/
│   ├── hooks/
│   │   └── useOfflineInjection.ts
│   ├── offlineRuntime.ts
│   └── runtimeMode.ts
├── .env (VITE_OFFLINE_LLM=0)
└── README.md (updated)
```

## Usage Example

```typescript
// From dev console or internal scripts
import { ensureModel, loadModel, generate } from './src/offlineRuntime';

const modelPath = await ensureModel(
  'https://huggingface.co/example/model.gguf',
  'model.gguf'
);

await loadModel({
  path: modelPath,
  nCtx: 2048,
  nThreads: 4,
  useMetal: true
});

await generate(
  { prompt: 'Hello!' },
  (token) => console.log(token),
  (stats) => console.log('Done:', stats)
);
```

## Building Native Binaries

### Prerequisites
- Android: NDK r25c+ installed
- iOS: Xcode 14+ with command line tools

### Steps

1. Clone llama.cpp:
```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
```

2. Build for Android (arm64-v8a):
```bash
mkdir build-android && cd build-android
cmake .. \
  -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake \
  -DANDROID_ABI=arm64-v8a \
  -DANDROID_PLATFORM=android-24 \
  -DBUILD_SHARED_LIBS=ON
make -j8

cp libllama.so ../../SproutChat/plugins/capacitor-offline-llm/android/src/main/jniLibs/arm64-v8a/
```

3. Build for iOS (arm64):
```bash
mkdir build-ios && cd build-ios
cmake .. \
  -DCMAKE_SYSTEM_NAME=iOS \
  -DCMAKE_OSX_ARCHITECTURES=arm64 \
  -DCMAKE_OSX_DEPLOYMENT_TARGET=13.0 \
  -DGGML_METAL=ON
make -j8

cp libllama.a ../../SproutChat/plugins/capacitor-offline-llm/ios/llama/lib/arm64/
```

4. Sync Capacitor:
```bash
cd ../../SproutChat
npm run sync
```

## Enabling Offline Mode

1. Add native binaries as described above
2. Set in `.env`:
```bash
VITE_OFFLINE_LLM=1
```
3. Rebuild and sync:
```bash
npm run sync
```

## Important Notes

- **No UI Changes**: The offline runtime is purely headless. No UI components import or reference it.
- **Feature Gated**: Only active when `VITE_OFFLINE_LLM=1`
- **Native Only**: Requires native binaries, doesn't work in web browser
- **Stub Implementation**: Current native code logs actions but doesn't actually run llama.cpp yet
- **For Integration**: Full llama.cpp integration requires implementing the actual inference logic in the native JNI/Swift code

## Architecture Constraints Met

✅ Plugin is local dependency (`file:./plugins/...`)
✅ No UI imports in headless service
✅ Feature gated by env flag
✅ Router-free injection hook (not imported anywhere)
✅ Android expects JNI + CMake
✅ iOS expects static lib + Podspec
✅ Documentation in README (no new screens)
✅ Build verified (no UI breakage)
