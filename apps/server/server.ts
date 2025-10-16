import app from "./src/index";
import { PORT } from "./src/config/env";
import { serve } from "@hono/node-server";

// The entry point that starts the server

// Create the server
const server = serve({
  fetch: app.fetch,
  port: Number(PORT),
});

console.log(`Server is running on http://localhost:${PORT}`);

export default server;
