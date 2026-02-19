type LogListener = (msg: string) => void;

class LogService {
  private listeners: LogListener[] = [];

  // 1. Components subscribe here
  subscribe(listener: LogListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // 2. Any file can call this to emit a log
  log(msg: string) {
    // Broadcast to all listeners
    this.listeners.forEach((listener) => listener(msg));

    // Optional: Also print to browser console for debugging
    console.log(`[SystemLog] ${msg}`);
  }

  clear() {
    // We can emit a special clear signal or handle it in the UI
    // For simplicity, let's just use a special string or separate event
    // But clearing local state in the component is usually enough.
  }
}

export const logger = new LogService();
