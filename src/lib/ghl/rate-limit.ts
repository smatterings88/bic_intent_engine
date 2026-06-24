import { GHLApiError } from "./errors";

/** v2 documented limits per location: 100 req / 10s burst, 200k / day. */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(err: unknown): boolean {
  if (err instanceof TypeError) {
    return true;
  }
  if (!(err instanceof GHLApiError)) {
    return false;
  }
  if (err.statusCode === 401) {
    return false;
  }
  if (err.statusCode === 429) {
    return true;
  }
  if (err.statusCode >= 500) {
    return true;
  }
  return false;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    baseDelayMs?: number;
  },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 400;
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (e) {
      lastError = e;
      if (!shouldRetry(e) || attempt === maxRetries) {
        throw e;
      }
      const backoff = baseDelayMs * 2 ** attempt;
      const jitter = Math.floor(Math.random() * 150);
      await sleep(backoff + jitter);
    }
  }
  throw lastError;
}
