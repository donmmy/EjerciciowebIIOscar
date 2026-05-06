// src/sockets/index.js
import { Server } from 'socket.io';
import { chatHandler } from './handlers/chat.handler.js';
import { notificationHandler } from './handlers/notification.handler.js';
import { authMiddleware } from './middleware/auth.middleware.js';

/**
 * Initializes and configures Socket.IO
 * @param {import('node:http').Server} httpServer 
 * @returns {Server}
 */
export function setupSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST']
        }
    });

    // Authentication Middleware (JWT & Room Join)
    io.use(authMiddleware);

    // Main Namespace connection
    io.on('connection', (socket) => {
        console.log(`[WS] Connected: ${socket.id} (User: ${socket.user?.name})`);

        // Register event handlers
        chatHandler(io, socket);
        notificationHandler(io, socket);

        socket.on('disconnect', (reason) => {
            console.log(`[WS] Disconnected: ${socket.id} (${reason})`);
        });
    });

    return io;
}