import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Returns the singleton Socket.IO connection to the /activity namespace.
 * Call with token on first use; subsequent calls return the same socket.
 */
export function getSocket(token?: string): Socket {
  if (!socket) {
    socket = io('/activity', {
      auth: { token },
      transports: ['websocket'],
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
