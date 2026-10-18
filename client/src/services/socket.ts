import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const RAW_SOCKET_URL = (import.meta.env.VITE_API_URL as string) || '';
const SOCKET_ENDPOINT = RAW_SOCKET_URL ? RAW_SOCKET_URL.replace(/\/$/, '') : '/';

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_ENDPOINT, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
  }
}
