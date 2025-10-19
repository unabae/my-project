import { Hono } from "hono";
import { corsMiddleware } from "./middleware/corsMiddleware";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { sessionMiddleware } from "./middleware/sessionMiddleware";
import { authRoutes } from "./routes/auth";
import { n8nRoutes } from "./routes/n8n";
import type { AppType } from "./types/appTypes";

/* 
Combines everything - Hono instance, middlewares, and routes.
*/

// Create Hono app with typed variables for session and user
const app = new Hono<AppType>();

// Middlewares
app.use("*", corsMiddleware); //Allow frontend to access server
app.use("*", loggerMiddleware); // Set up logger
app.use("*", sessionMiddleware); // Session middleware - retrieves and sets session in context (needed for better-auth)

// Routes
app.route("/", authRoutes);
app.route("/", n8nRoutes);
// Note: WebSocket handling is done in server.ts at the Bun server level

// Basic route for testing
app.get("/", (c) => c.text("Hello from Hono + Bun!"));
app.get("/api/error-test", (c) => {
  return c.json({ message: "Simulated server error for testing" }, 201);
});

export default app;
