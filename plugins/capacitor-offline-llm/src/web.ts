import { WebPlugin } from '@capacitor/core';

import type { OfflineLLMRuntimePlugin } from './definitions';

export class OfflineLLMRuntimeWeb extends WebPlugin implements OfflineLLMRuntimePlugin {
  async ensureModel(options: { url: string; filename: string; sha256?: string }): Promise<{ path: string }> {
    console.log('ensureModel', options);
    throw this.unimplemented('Not implemented on web.');
  }

  async loadModel(options: { path: string; nCtx?: number; nThreads?: number; useMetal?: boolean }): Promise<void> {
    console.log('loadModel', options);
    throw this.unimplemented('Not implemented on web.');
  }

  async generate(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
  }): Promise<void> {
    console.log('generate', options);
    throw this.unimplemented('Not implemented on web.');
  }

  async stop(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }

  async unload(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }
}
