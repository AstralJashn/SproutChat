import { WebPlugin } from '@capacitor/core';

import type { OfflineLLMRuntimePlugin, ModelInfo, LoadedModelInfo } from './definitions';

export class OfflineLLMRuntimeWeb extends WebPlugin implements OfflineLLMRuntimePlugin {
  async ensureModel(): Promise<{ path: string }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async listDownloadedModels(): Promise<{ models: ModelInfo[] }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async deleteModel(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }

  async loadModel(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }

  async unloadModel(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }

  async clearContext(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }

  async generate(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }

  async stopInference(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }

  async getModelInfo(): Promise<LoadedModelInfo> {
    throw this.unimplemented('Not implemented on web.');
  }
}
