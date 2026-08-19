type EventCallback = (data: any) => void;

class SocketService {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  connect() {
    // In real mode: this.socket = io(VITE_WS_URL)
    // In mock mode: simulated broadcast bus
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((cb) => cb(data));
    }
  }

  disconnect() {
    this.listeners.clear();
  }
}

export const socketService = new SocketService();
