import { io, Socket } from "socket.io-client";
import { apiHost } from "@/utils/baseUrl";
import { tokenStore } from "@/lib/auth/tokenStore";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { hasSessionMarker } from "@/lib/auth/session";
import type { ChatMessage, ChatAttachment } from "@/redux/api/endpoints/chat.api";

let socketInstance: Socket | null = null;
let currentToken: string | null = null;

export function getSocketBaseUrl(): string {
  if (apiHost) return apiHost;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://10.10.28.196:5000";
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
  const baseUrl = getSocketBaseUrl();

  const socket = io(baseUrl, {
    path: "/socket.io",
    auth: { token },
    query: { token },
    transports: ["websocket", "polling"],
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
