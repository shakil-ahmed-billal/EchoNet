import { createServer } from "http";
import app from "./app.js";
import config from "./app/config/index.js";
import { connectRedis } from "./app/lib/redis.js";

import { initSocket } from "./app/lib/socket.js";

async function bootstrap() {
  try {
    const httpServer = createServer(app);

    // Initialize Socket.IO immediately WITH the explicit http server
    await initSocket(httpServer);
    console.log("Socket.IO initialized via module");

    const port = Number(config.port);
    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`EchoNet server is listening on port ${port} and address 0.0.0.0`);
    });

    // Attempt Redis connection in the background
    connectRedis().catch((error) => {
      console.error("Initial Redis connection attempt failed:", error);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

bootstrap();
