import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import config from './app/config/index.js';

let server: Server;
let io: SocketIOServer;

async function bootstrap() {
  try {
    server = app.listen(config.port, () => {
      console.log(`EchoNet server is listening on port ${config.port}`);
    });

    io = new SocketIOServer(server, {
      cors: { origin: true, credentials: true },
    });

    console.log('Socket.IO initialized');

    // Future socket attachment logic here
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

bootstrap();
