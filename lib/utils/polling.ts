interface PollingConfig {
  interval: number;      // Time between polls in ms
  maxAttempts: number;   // Maximum number of polling attempts
  timeout?: number;      // Optional overall timeout in ms
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMaxAttemptsReached?: () => void;
}

interface PollingState {
  attempts: number;
  startTime: number;
  timeoutId?: NodeJS.Timeout;
}

export function createPoller(
  checkFn: () => Promise<boolean>,
  config: PollingConfig
) {
  const state: PollingState = {
    attempts: 0,
    startTime: Date.now(),
  };

  const cleanup = () => {
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }
  };

  const poll = async () => {
    try {
      // Check if we've exceeded max attempts
      if (state.attempts >= config.maxAttempts) {
        cleanup();
        config.onMaxAttemptsReached?.();
        return;
      }

      // Check if we've exceeded timeout
      if (config.timeout && Date.now() - state.startTime > config.timeout) {
        cleanup();
        config.onError?.(new Error('Polling timeout exceeded'));
        return;
      }

      state.attempts++;
      const result = await checkFn();

      if (result) {
        cleanup();
        config.onSuccess?.();
        return;
      }

      // Schedule next poll
      state.timeoutId = setTimeout(poll, config.interval);

    } catch (error) {
      cleanup();
      config.onError?.(error instanceof Error ? error : new Error('Polling failed'));
    }
  };

  // Start polling
  poll();

  // Return cleanup function
  return cleanup;
} 