import { io } from 'socket.io-client';

// Updated: socket connects to port 5001 (was 5000)
const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5001';

class SocketService {
  socket = null;

  connect(token) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('✓ BillMaster real-time connected');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      this.socket.on('connect_error', (err) => {
        console.warn('WebSocket connection error (non-fatal):', err.message);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
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
}

export const socketService = new SocketService();
