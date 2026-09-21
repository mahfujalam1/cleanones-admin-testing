import { io, Socket } from "socket.io-client";
import { apiHost } from "@/utils/baseUrl";
import { tokenStore } from "@/lib/auth/tokenStore";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { hasSessionMarker } from "@/lib/auth/session";
import type { ChatMessage, ChatAttachment } from "@/redux/api/endpoints/chat.api";

let socketInstance: Socket | null = null;
let currentToken: string | null = null;


export type SocketTarget = {
  url: string;
  transports: ("websocket" | "polling")[];
  
  proxied: boolean;
};



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


export function socketIsProxied(): boolean {
  return resolveSocketTarget().proxied;
}



export async function getChatSocket(): Promise<Socket | null> {
  if (typeof window === "undefined") return null;

  
  if (tokenStore.needsRefresh() && hasSessionMarker()) {
    await refreshAccessToken();
  }

  const token = tokenStore.get();
  if (!token) {
    console.warn("Socket.IO: No access token available for connection.");
    return null;
  }

  
  if (socketInstance && currentToken === token && (socketInstance.connected || socketInstance.active)) {
    return socketInstance;
  }

  
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
    
  });

  socket.on("connect_error", (error) => {
    console.warn("Socket.IO connect_error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      
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



export function joinChatGroup(socket: Socket | null, groupId: string) {
  if (!socket || !groupId) return;
  socket.emit("group:join", { groupId });
}



export function leaveChatGroup(socket: Socket | null, groupId: string) {
  if (!socket || !groupId) return;
  socket.emit("group:leave", { groupId });
}



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



export function sendTypingIndicator(socket: Socket | null, groupId: string, name: string) {
  if (!socket || !groupId) return;
  socket.emit("group:typing", { groupId, name });
}



export function sendStopTypingIndicator(socket: Socket | null, groupId: string) {
  if (!socket || !groupId) return;
  socket.emit("group:stop-typing", { groupId });
}
