import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { FRONTEND_URL } from "./config/env";

// Combines everything - Hono instance, middlewares, and routes.

// Create Hono app
const app = new Hono();

//Allow frontend to access server
app.use(
  "*",
  cors({
    origin: `${FRONTEND_URL}`,
  })
);

// Set up logger
app.use("*", logger());

// Routes
app.route("/", authRoutes);

// Basic route for testing
app.get("/", (c) => c.text("Hello from Hono + Bun!"));

export default app;
