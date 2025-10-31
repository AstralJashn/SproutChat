import { Capacitor } from '@capacitor/core';
import { OfflineLLMRuntime } from 'capacitor-offline-llm';
import type { ModelInfo, LoadedModelInfo } from 'capacitor-offline-llm';

let progressListener: any = null;
let completeListener: any = null;
let downloadListener: any = null;

export async function ensureModel(
  url: string,
  filename: string,
  sha256?: string,
  onProgress?: (progress: number, downloaded: number, total: number) => void
): Promise<string> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Offline LLM is only available on native platforms');
  }

  if (onProgress) {
    if (downloadListener) {
      await downloadListener.remove();
    }
    downloadListener = await OfflineLLMRuntime.addListener(
      'modelDownload',
      (event: { filename: string; progress: number; downloaded: number; total: number }) => {
        onProgress(event.progress, event.downloaded, event.total);
      }
    );
  }

  const result = await OfflineLLMRuntime.ensureModel({ url, filename, sha256 });

  if (downloadListener) {
    await downloadListener.remove();
    downloadListener = null;
  }

  return result.path;
}

export async function listDownloadedModels(): Promise<ModelInfo[]> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Offline LLM is only available on native platforms');
  }

  const result = await OfflineLLMRuntime.listDownloadedModels();
  return result.models;
}

export async function deleteModel(filename: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Offline LLM is only available on native platforms');
  }

  await OfflineLLMRuntime.deleteModel({ filename });
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

export async function unloadModel(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  await OfflineLLMRuntime.unloadModel();
}

export async function clearContext(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  await OfflineLLMRuntime.clearContext();
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

export async function stopInference(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  await OfflineLLMRuntime.stopInference();
}

export async function getModelInfo(): Promise<LoadedModelInfo> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Offline LLM is only available on native platforms');
  }

  return await OfflineLLMRuntime.getModelInfo();
}

export const stop = stopInference;
