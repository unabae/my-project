import app from "./src/index";
import { PORT } from "./src/config/env";
import { auth } from "./src/lib/auth"; // your Better Auth instance
import { createWebSocketSystem } from "./src/websocket";
import type { WebSocketData } from "./src/websocket";

// The entry point that starts the server

// Create WebSocket system with manager and message handlers
const { manager: wsManager, processMessage } = createWebSocketSystem({
  verboseLogging: true,
  maxConnectionsPerUser: 0, // 0 = unlimited
  echoToSender: true,
});

const server = Bun.serve<WebSocketData>({
  port: Number(PORT) || 3000,

  async fetch(req, server) {
    const url = new URL(req.url);

    // 1️⃣ Handle WebSocket upgrade request
    if (url.pathname === "/ws") {
      // Get cookies from client
      const cookie = req.headers.get("cookie") || "";

      // Verify session using Better Auth
      const session = await auth.api.getSession({ headers: { cookie } });

      if (!session) {
        console.log("❌ Unauthorized WebSocket connection");
        return new Response("Unauthorized", { status: 401 });
      }

      // Authenticated → upgrade the connection
      const success = server.upgrade(req, {
        data: {
          userId: session.user.id,
          email: session.user.email,
        },
      });

      if (success) return;
      return new Response("Upgrade failed", { status: 400 });
    }

    // 2️⃣ Handle normal API requests through Hono
    return app.fetch(req);
  },

  websocket: {
    open(ws) {
      wsManager.handleOpen(ws);
    },
    message(ws, message) {
      processMessage(ws, message);
    },
    close(ws) {
      wsManager.handleClose(ws);
    },
  },
});

console.log(`🚀 Server running on http://localhost:${server.port}`);
