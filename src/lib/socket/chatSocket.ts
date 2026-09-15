import { io, Socket } from "socket.io-client";
import { apiHost } from "@/utils/baseUrl";
import { tokenStore } from "@/lib/auth/tokenStore";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { hasSessionMarker } from "@/lib/auth/session";
import type { ChatMessage, ChatAttachment } from "@/redux/api/endpoints/chat.api";

let socketInstance: Socket | null = null;
let currentToken: string | null = null;

/** What the browser should dial, and how. */
export type SocketTarget = {
  url: string;
  transports: ("websocket" | "polling")[];
  /** True when the connection is being relayed through this origin instead of dialled direct. */
  proxied: boolean;
};

/**
 * Picking the socket endpoint comes down to one constraint: a page served over HTTPS may not
 * open an insecure socket. The browser kills it as mixed content before any handshake, which
 * is why chat works on http://localhost but goes silent on a deployed HTTPS build while the
 * REST API keeps working — REST already travels through the same-origin `/api/proxy` rewrite.
 *
 * So when the page is secure and the backend is not, the socket takes the same escape route:
 * it dials this origin, and the `/socket.io/*` rewrite relays to the backend server-side. That
 * relay cannot carry a WebSocket upgrade on Vercel, so the transport is pinned to long-polling,
 * which is plain HTTP requests and proxies fine. Socket.IO behaves identically over polling —
 * it is chattier and adds some latency, nothing more.
 *
 * Set `NEXT_PUBLIC_SOCKET_URL` to an https:// host once the backend has a certificate and this
 * whole detour is skipped: real WebSockets, dialled directly.
 */
export function resolveSocketTarget(): SocketTarget {
  const direct = (process.env.NEXT_PUBLIC_SOCKET_URL ?? "").replace(/\/$/, "") || apiHost;

  if (typeof window === "undefined") {
    return { url: direct, transports: ["websocket", "polling"], proxied: false };
  }

  const pageIsSecure = window.location.protocol === "https:";
  const targetIsInsecure = direct.startsWith("http://");

  if (pageIsSecure && targetIsInsecure) {
    return { url: window.location.origin, transports: ["polling"], proxied: true };
  }

  return {
    url: direct || window.location.origin,
    transports: ["websocket", "polling"],
    proxied: false,
  };
}

export function getSocketBaseUrl(): string {
  return resolveSocketTarget().url;
}

/** True while realtime chat is running through the same-origin relay rather than a direct socket. */
export function socketIsProxied(): boolean {
  return resolveSocketTarget().proxied;
}

/**
 * Ensures access token is available and connects to Socket.IO server.
 */
export async function getChatSocket(): Promise<Socket | null> {
  if (typeof window === "undefined") return null;

  // Refresh token if needed
  if (tokenStore.needsRefresh() && hasSessionMarker()) {
    await refreshAccessToken();
  }

  const token = tokenStore.get();
  if (!token) {
    console.warn("Socket.IO: No access token available for connection.");
    return null;
  }

  // If socket exists and token has not changed and connected/connecting, reuse it
  if (socketInstance && currentToken === token && (socketInstance.connected || socketInstance.active)) {
    return socketInstance;
  }

  // If token changed, disconnect existing socket
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  currentToken = token;
  const target = resolveSocketTarget();

  const socket = io(target.url, {
    path: "/socket.io",
    auth: { token },
    query: { token },
    transports: target.transports,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    // Successfully connected
  });

  socket.on("connect_error", (error) => {
    console.warn("Socket.IO connect_error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      // Server disconnected, might need to reconnect with fresh token
      void refreshAccessToken().then(() => {
        const freshToken = tokenStore.get();
        if (freshToken) {
          socket.auth = { token: freshToken };
          socket.connect();
        }
      });
    }
  });

  socketInstance = socket;
  return socket;
}

export function disconnectChatSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    currentToken = null;
  }
}

/**
 * Join a chat room to receive typing indicators and live updates for this chat.
 */
export function joinChatGroup(socket: Socket | null, groupId: string) {
  if (!socket || !groupId) return;
  socket.emit("group:join", { groupId });
}

/**
 * Leave a chat room.
 */
export function leaveChatGroup(socket: Socket | null, groupId: string) {
  if (!socket || !groupId) return;
  socket.emit("group:leave", { groupId });
}

/**
 * Send a message via Socket.IO ack callback.
 */
export function sendGroupMessage(
  socket: Socket | null,
  payload: {
    groupId: string;
    text?: string;
    attachments?: ChatAttachment[];
  }
): Promise<{ success: boolean; data?: ChatMessage; message?: string }> {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      resolve({ success: false, message: "Socket is not connected. Please try again." });
      return;
    }

    socket.emit(
      "group:send-message",
      payload,
      (response: { success: boolean; data?: ChatMessage; message?: string }) => {
        if (response && typeof response === "object") {
          resolve(response);
        } else {
          resolve({ success: false, message: "Unknown response from server." });
        }
      }
    );
  });
}

/**
 * Soft-delete a message via Socket.IO.
 */
export function deleteGroupMessage(
  socket: Socket | null,
  messageId: string
): Promise<{ success: boolean; data?: ChatMessage; message?: string }> {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      resolve({ success: false, message: "Socket is not connected." });
      return;
    }

    socket.emit(
      "group:delete-message",
      { messageId },
      (response: { success: boolean; data?: ChatMessage; message?: string }) => {
        if (response && typeof response === "object") {
          resolve(response);
        } else {
          resolve({ success: false, message: "Failed to delete message." });
        }
      }
    );
  });
}

/**
 * Send typing indicator.
 */
export function sendTypingIndicator(socket: Socket | null, groupId: string, name: string) {
  if (!socket || !groupId) return;
  socket.emit("group:typing", { groupId, name });
}

/**
 * Send stop typing indicator.
 */
export function sendStopTypingIndicator(socket: Socket | null, groupId: string) {
  if (!socket || !groupId) return;
  socket.emit("group:stop-typing", { groupId });
}
