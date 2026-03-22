import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
console.log('--- SERVER STARTING / FORCE RELOAD ---');
import config from './app/config/index.js';
import { connectRedis } from './app/lib/redis.js';

import { initSocket } from './app/lib/socket.js';

let server: Server;

async function bootstrap() {
  try {
    server = app.listen(config.port, () => {
      console.log(`EchoNet server is listening on port ${config.port}`);
    });

    // Initialize Socket.IO immediately
    await initSocket(server);
    console.log('Socket.IO initialized via module');

    // Attempt Redis connection in the background
    connectRedis().catch(error => {
      console.error('Initial Redis connection attempt failed:', error);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

bootstrap();
