import { io } from "socket.io-client";

let socket = null;

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "";

/**
 * Derive the Socket.io server URL from the REST API endpoint.
 * VITE_API_ENDPOINT is typically "http://host:port/api" — the WS server
 * runs on the same host:port, so we strip the path.
 */
const getSocketUrl = () => {
  try {
    const url = new URL(API_ENDPOINT);
    return url.origin; // e.g. "http://localhost:8000"
  } catch {
    // Fallback: if API_ENDPOINT is a relative path like "/api", connect
    // to the current page origin.
    return window.location.origin;
  }
};

/**
 * Open a Socket.io connection authenticated with the given JWT.
 * Safe to call multiple times — returns the existing socket if already connected.
 */
export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  // Disconnect stale socket if it exists but is not connected
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(getSocketUrl(), {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
  });

  socket.on("connect", () => {
    console.log("[WS] Connected");
  });
  socket.on("disconnect", (reason) => {
    console.log("[WS] Disconnected:", reason);
  });
  socket.on("connect_error", (err) => {
    console.error("[WS] Error:", err.message);
  });

  return socket;
};

/**
 * Tear down the Socket.io connection (e.g. on logout).
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Return the current socket instance (may be null).
 */
export const getSocket = () => socket;
