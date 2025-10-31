export interface ModelInfo {
  filename: string;
  path: string;
  size: number;
}

export interface LoadedModelInfo {
  loaded: boolean;
  modelPath?: string;
  nCtx: number;
  nThreads: number;
}

export interface OfflineLLMRuntimePlugin {
  ensureModel(options: {
    url: string;
    filename: string;
    sha256?: string;
  }): Promise<{ path: string }>;

  listDownloadedModels(): Promise<{ models: ModelInfo[] }>;

  deleteModel(options: { filename: string }): Promise<void>;

  loadModel(options: {
    path: string;
    nCtx?: number;
    nThreads?: number;
    useMetal?: boolean;
  }): Promise<void>;

  unloadModel(): Promise<void>;

  clearContext(): Promise<void>;

  generate(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
  }): Promise<void>;

  stopInference(): Promise<void>;

  getModelInfo(): Promise<LoadedModelInfo>;

  addListener(
    eventName: 'generationProgress',
    listenerFunc: (event: { token: string }) => void,
  ): Promise<any>;

  addListener(
    eventName: 'generationComplete',
    listenerFunc: (event: { tokens: number; ms: number; tps: number }) => void,
  ): Promise<any>;

  addListener(
    eventName: 'modelDownload',
    listenerFunc: (event: { filename: string; progress: number; downloaded: number; total: number }) => void,
  ): Promise<any>;

  removeAllListeners(): Promise<void>;
}
