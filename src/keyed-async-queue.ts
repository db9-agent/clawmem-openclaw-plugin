/**
 * A simple keyed async queue that serializes async tasks per key.
 * Inlined to avoid dependency on openclaw plugin-sdk internals that
 * may not be available in older OpenClaw versions.
 */
export class KeyedAsyncQueue {
  private queues = new Map<string, Promise<unknown>>();

  async enqueue<T>(key: string, task: () => Promise<T>): Promise<T> {
    const prev = this.queues.get(key) ?? Promise.resolve();
    const next = prev.then(() => task(), () => task());
    this.queues.set(key, next);
    try {
      return await next;
    } finally {
      if (this.queues.get(key) === next) {
        this.queues.delete(key);
      }
    }
  }
}
