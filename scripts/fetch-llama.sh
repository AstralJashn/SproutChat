#!/usr/bin/env bash
set -e

PLUGIN_DIR="plugins/capacitor-offline-llm"

if [ ! -d "$PLUGIN_DIR" ]; then
  echo "Plugin not installed yet, skipping native binary fetch"
  exit 0
fi

if [ -z "$LLAMA_SO_URL" ] && [ -z "$LLAMA_A_URL" ]; then
  echo "LLAMA_SO_URL and LLAMA_A_URL not set, skipping native binary fetch"
  exit 0
fi

echo "Fetching llama.cpp native binaries..."

if [ -n "$LLAMA_SO_URL" ]; then
  ANDROID_DIR="$PLUGIN_DIR/android/src/main/jniLibs/arm64-v8a"
  mkdir -p "$ANDROID_DIR"
  echo "Downloading Android libllama.so from $LLAMA_SO_URL..."
  curl -L -o "$ANDROID_DIR/libllama.so" "$LLAMA_SO_URL"

  if [ -n "$LLAMA_SO_SHA256" ]; then
    echo "Verifying SHA256 checksum..."
    if command -v sha256sum &> /dev/null; then
      echo "$LLAMA_SO_SHA256  $ANDROID_DIR/libllama.so" | sha256sum -c -
    elif command -v shasum &> /dev/null; then
      echo "$LLAMA_SO_SHA256  $ANDROID_DIR/libllama.so" | shasum -a 256 -c -
    else
      echo "Warning: No SHA256 tool found, skipping checksum verification"
    fi
  fi

  echo "Android native binary downloaded to $ANDROID_DIR/libllama.so"
fi

if [ -n "$LLAMA_A_URL" ]; then
  IOS_DIR="$PLUGIN_DIR/ios/llama/lib/arm64"
  mkdir -p "$IOS_DIR"
  echo "Downloading iOS libllama.a from $LLAMA_A_URL..."
  curl -L -o "$IOS_DIR/libllama.a" "$LLAMA_A_URL"

  if [ -n "$LLAMA_A_SHA256" ]; then
    echo "Verifying SHA256 checksum..."
    if command -v sha256sum &> /dev/null; then
      echo "$LLAMA_A_SHA256  $IOS_DIR/libllama.a" | sha256sum -c -
    elif command -v shasum &> /dev/null; then
      echo "$LLAMA_A_SHA256  $IOS_DIR/libllama.a" | shasum -a 256 -c -
    else
      echo "Warning: No SHA256 tool found, skipping checksum verification"
    fi
  fi

  echo "iOS native binary downloaded to $IOS_DIR/libllama.a"
fi

echo "Native binaries fetched successfully"
