import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import config from '../config/index.js';
import logger from '../utils/logger.js';

let io: SocketIOServer;

export const initSocket = async (server: HTTPServer) => {
    logger.info('Initializing Socket.IO...');
    io = new SocketIOServer(server, {
        cors: {
            origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
            credentials: true,
        },
    });

    if (config.redis_url) {
        try {
            const pubClient = createClient({ url: config.redis_url });
            const subClient = pubClient.duplicate();
            await Promise.all([pubClient.connect(), subClient.connect()]);
            io.adapter(createAdapter(pubClient, subClient));
            logger.info('Socket.IO Redis adapter connected');
        } catch (error) {
            logger.error('Failed to connect Redis for Socket.IO:', error);
        }
    }

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId as string;
        if (userId) {
            socket.join(userId);
            logger.info(`User ${userId} joined their private room`);
            socket.broadcast.emit('user-status', { userId, status: 'online' });
        }

        // WebRTC Signalling
        socket.on('call-user', (data: { to: string; offer: any; from: string; fromName: string; isVideo?: boolean }) => {
            console.log(`Backend: call-user from ${data.from} to ${data.to}`);
            io.to(data.to).emit('incoming-call', { 
                offer: data.offer, 
                from: data.from, 
                fromName: data.fromName, 
                isVideo: data.isVideo 
            });
        });

        socket.on('answer-call', (data: { to: string; answer: any }) => {
            io.to(data.to).emit('call-answered', { answer: data.answer });
        });

        socket.on('ice-candidate', (data: { to: string; candidate: any }) => {
            io.to(data.to).emit('ice-candidate', { candidate: data.candidate });
        });

        socket.on('end-call', (data: { to: string }) => {
            io.to(data.to).emit('end-call');
        });

        // Messaging
        socket.on('send-message', (data: { to: string; message: any }) => {
            io.to(data.to).emit('new-message', data.message);
        });

        // Typing Indicators
        socket.on('typing', (data: { to: string }) => {
            if (userId) {
                io.to(data.to).emit('typing', { from: userId });
            }
        });

        socket.on('stop-typing', (data: { to: string }) => {
            if (userId) {
                io.to(data.to).emit('stop-typing', { from: userId });
            }
        });

        // Online Status Checking
        socket.on('check-online', async (data: { userId: string }, callback: any) => {
            try {
                const sockets = await io.in(data.userId).fetchSockets();
                if (typeof callback === 'function') callback({ online: sockets.length > 0 });
            } catch (error) {
                if (typeof callback === 'function') callback({ online: false });
            }
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
            if (userId) {
                io.in(userId).fetchSockets().then(sockets => {
                    if (sockets.length === 0) {
                        socket.broadcast.emit('user-status', { userId, status: 'offline' });
                    }
                }).catch(err => logger.error(err));
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
