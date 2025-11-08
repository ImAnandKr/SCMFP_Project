import { io } from 'socket.io-client';

// Derive the backend base URL from VITE_API_BASE_URL (remove trailing /api if present)
const BACKEND = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

// Create a single socket instance for the app. Keep the type inference simple to avoid
// TypeScript issues when @types/socket.io-client isn't installed.
const socket = io(BACKEND, {
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;
