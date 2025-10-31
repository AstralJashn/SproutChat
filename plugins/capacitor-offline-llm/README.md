# capacitor-offline-llm

Capacitor plugin for offline LLM inference using llama.cpp

## Install

```bash
npm install capacitor-offline-llm
npx cap sync
```

## API

<docgen-index>

* [`ensureModel(...)`](#ensuremodel)
* [`loadModel(...)`](#loadmodel)
* [`generate(...)`](#generate)
* [`stop()`](#stop)
* [`unload()`](#unload)
* [`addListener('generationProgress', ...)`](#addlistenergenerationprogress)
* [`addListener('generationComplete', ...)`](#addlistenergenerationcomplete)

</docgen-index>

<docgen-api>

### ensureModel(...)

```typescript
ensureModel(options: { url: string; filename: string; sha256?: string; }) => Promise<{ path: string; }>
```

Download and cache a model file if it doesn't already exist.

| Param         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code>{ url: string; filename: string; sha256?: string; }</code> |

**Returns:** <code>Promise&lt;{ path: string; }&gt;</code>

--------------------

### loadModel(...)

```typescript
loadModel(options: { path: string; nCtx?: number; nThreads?: number; useMetal?: boolean; }) => Promise<void>
```

Load a model into memory with specified parameters.

| Param         | Type                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------- |
| **`options`** | <code>{ path: string; nCtx?: number; nThreads?: number; useMetal?: boolean; }</code> |

--------------------

### generate(...)

```typescript
generate(options: { prompt: string; maxTokens?: number; temperature?: number; topP?: number; topK?: number; repeatPenalty?: number; }) => Promise<void>
```

Start text generation. Use listeners to receive tokens and completion events.

| Param         | Type                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ prompt: string; maxTokens?: number; temperature?: number; topP?: number; topK?: number; repeatPenalty?: number; }</code> |

--------------------

### stop()

```typescript
stop() => Promise<void>
```

Stop ongoing generation.

--------------------

### unload()

```typescript
unload() => Promise<void>
```

Unload the model from memory and clean up resources.

--------------------

### addListener('generationProgress', ...)

```typescript
addListener(eventName: 'generationProgress', listenerFunc: (event: { token: string; }) => void) => Promise<PluginListenerHandle>
```

Listen for generation progress (token by token).

| Param              | Type                                                   |
| ------------------ | ------------------------------------------------------ |
| **`eventName`**    | <code>'generationProgress'</code>                      |
| **`listenerFunc`** | <code>(event: { token: string; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;PluginListenerHandle&gt;</code>

--------------------

### addListener('generationComplete', ...)

```typescript
addListener(eventName: 'generationComplete', listenerFunc: (event: { tokens: number; ms: number; tps: number; }) => void) => Promise<PluginListenerHandle>
```

Listen for generation completion with statistics.

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'generationComplete'</code>                                                |
| **`listenerFunc`** | <code>(event: { tokens: number; ms: number; tps: number; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;PluginListenerHandle&gt;</code>

--------------------

</docgen-api>

## Native Binary Requirements

### Android

Place compiled `libllama.so` for arm64-v8a in:
```
android/src/main/jniLibs/arm64-v8a/libllama.so
```

Headers expected at:
```
android/src/main/cpp/llama/include/llama.h
```

### iOS

Place compiled `libllama.a` for arm64 in:
```
ios/llama/lib/arm64/libllama.a
```

Headers expected at:
```
ios/llama/include/llama.h
```

## Building llama.cpp

This plugin expects llama.cpp binaries. Build instructions:

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp

# Android (requires NDK)
mkdir build-android && cd build-android
cmake .. \
  -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake \
  -DANDROID_ABI=arm64-v8a \
  -DANDROID_PLATFORM=android-24 \
  -DBUILD_SHARED_LIBS=ON
make -j8

# iOS (requires Xcode)
mkdir build-ios && cd build-ios
cmake .. \
  -DCMAKE_SYSTEM_NAME=iOS \
  -DCMAKE_OSX_ARCHITECTURES=arm64 \
  -DCMAKE_OSX_DEPLOYMENT_TARGET=13.0 \
  -DGGML_METAL=ON
make -j8
```

Copy the resulting binaries to the plugin's native directories as specified above.
