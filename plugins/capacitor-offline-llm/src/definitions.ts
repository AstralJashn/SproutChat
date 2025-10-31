export interface OfflineLLMRuntimePlugin {
  ensureModel(options: {
    url: string;
    filename: string;
    sha256?: string;
  }): Promise<{ path: string }>;

  loadModel(options: {
    path: string;
    nCtx?: number;
    nThreads?: number;
    useMetal?: boolean;
  }): Promise<void>;

  generate(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
  }): Promise<void>;

  stop(): Promise<void>;

  unload(): Promise<void>;

  addListener(
    eventName: 'generationProgress',
    listenerFunc: (event: { token: string }) => void,
  ): Promise<any>;

  addListener(
    eventName: 'generationComplete',
    listenerFunc: (event: { tokens: number; ms: number; tps: number }) => void,
  ): Promise<any>;

  removeAllListeners(): Promise<void>;
}
