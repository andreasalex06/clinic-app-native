import { io, Socket } from "socket.io-client";

import { API_URL } from "@/api/client";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || API_URL.replace(/\/api\/?$/, "");

let dashboardSocket: Socket | null = null;
let dashboardSocketToken: string | null = null;

export function getDashboardSocket(token: string) {
  if (dashboardSocket && dashboardSocketToken === token) {
    return dashboardSocket;
  }

  dashboardSocket?.disconnect();
  dashboardSocketToken = token;
  dashboardSocket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  return dashboardSocket;
}

export function disconnectDashboardSocket() {
  dashboardSocket?.disconnect();
  dashboardSocket = null;
  dashboardSocketToken = null;
}
