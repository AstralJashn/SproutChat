import { Capacitor } from '@capacitor/core';
import { OfflineLLMRuntime } from 'capacitor-offline-llm';

let progressListener: any = null;
let completeListener: any = null;

export async function ensureModel(
  url: string,
  filename: string,
  sha256?: string
): Promise<string> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Offline LLM is only available on native platforms');
  }

  const result = await OfflineLLMRuntime.ensureModel({ url, filename, sha256 });
  return result.path;
}

export async function loadModel(opts: {
  path: string;
  nCtx?: number;
  nThreads?: number;
  useMetal?: boolean;
}): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Offline LLM is only available on native platforms');
  }

  await OfflineLLMRuntime.loadModel(opts);
}

export async function generate(
  opts: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
  },
  onToken: (token: string) => void,
  onDone: (stats: { tokens: number; ms: number; tps: number }) => void
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Offline LLM is only available on native platforms');
  }

  if (progressListener) {
    await progressListener.remove();
  }
  if (completeListener) {
    await completeListener.remove();
  }

  progressListener = await OfflineLLMRuntime.addListener(
    'generationProgress',
    (event: { token: string }) => {
      onToken(event.token);
    }
  );

  completeListener = await OfflineLLMRuntime.addListener(
    'generationComplete',
    (event: { tokens: number; ms: number; tps: number }) => {
      onDone(event);
    }
  );

  await OfflineLLMRuntime.generate(opts);
}

export async function stop(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  await OfflineLLMRuntime.stop();
}

export async function unload(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  if (progressListener) {
    await progressListener.remove();
    progressListener = null;
  }
  if (completeListener) {
    await completeListener.remove();
    completeListener = null;
  }

  await OfflineLLMRuntime.unload();
}
