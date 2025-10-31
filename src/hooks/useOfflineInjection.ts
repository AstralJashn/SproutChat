import { OFFLINE_ENABLED } from '../runtimeMode';
import * as offline from '../offlineRuntime';

export function maybeUseOfflineLLM(
  sendFn: (
    prompt: string,
    onToken: (token: string) => void,
    onDone: (stats: any) => void
  ) => Promise<void>
) {
  if (!OFFLINE_ENABLED) {
    return sendFn;
  }

  return async (
    prompt: string,
    onToken: (token: string) => void,
    onDone: (stats: any) => void
  ) => {
    await offline.generate({ prompt }, onToken, onDone);
  };
}
