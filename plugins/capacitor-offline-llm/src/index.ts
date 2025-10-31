import { registerPlugin } from '@capacitor/core';

import type { OfflineLLMRuntimePlugin } from './definitions';

const OfflineLLMRuntime = registerPlugin<OfflineLLMRuntimePlugin>('OfflineLLMRuntime', {
  web: () => import('./web').then(m => new m.OfflineLLMRuntimeWeb()),
});

export * from './definitions';
export { OfflineLLMRuntime };
