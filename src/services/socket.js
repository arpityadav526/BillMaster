import { io } from 'socket.io-client';

// Use the Vite proxy by connecting to the same origin (no explicit URL needed).
// In production, VITE_WS_URL should be set to the actual server URL.
const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5001';

class SocketService {
  socket = null;
  _token = null;

  connect(token) {
    // Store the token for potential reconnection
    this._token = token;

    // If already connected with a live socket, skip
    if (this.socket?.connected) {
      return;
    }

    // If there's a stale/disconnected socket instance, clean it up first
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      // If the server forcefully disconnected, don't auto-reconnect
      // For other reasons (transport close, ping timeout), socket.io auto-reconnects
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this._token = null;
  }

  // Check if socket is currently connected
  isConnected() {
    return this.socket?.connected ?? false;
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('NOTIFICATION_RECEIVED', callback);
    }
  }

  offNotification(callback) {
    if (this.socket) {
      this.socket.off('NOTIFICATION_RECEIVED', callback);
    }
  }

  // Generic event listener
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit event
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const socketService = new SocketService();
