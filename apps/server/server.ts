import app from "./src/index";
import { PORT } from "./src/config/env";

export default {
  port: PORT,
  fetch: app.fetch,
};
