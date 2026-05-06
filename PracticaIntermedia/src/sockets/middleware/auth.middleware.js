import User from '../../models/user.model.js';
import { verifyToken } from '../../utils/handleJwt.js';

/**
 * Socket.IO Middleware for JWT authentication
 * Verifies token, fetches user, and joins the company room.
 */
export const authMiddleware = async (socket, next) => {
    try {
        // Get token from auth object or headers
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ').pop();

        if (!token) {
            return next(new Error('Authentication error: Token not provided'));
        }

        // Verify JWT
        const dataToken = verifyToken(token);
        if (!dataToken || !dataToken.userId) {
            return next(new Error('Authentication error: Invalid token'));
        }

        // Fetch user to ensure they exist and get company ID
        const user = await User.findById(dataToken.userId);
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        if (user.deleted) {
            return next(new Error('Authentication error: User account is inactive'));
        }

        // Attach user info to socket for later use
        socket.user = {
            _id: user._id,
            name: user.name,
            company: user.company
        };

        // Join the company room to receive specific notifications
        if (user.company) {
            const roomName = user.company.toString();
            socket.join(roomName);
            console.log(`[WS] User ${user.name} joined room: ${roomName}`);
        }

        next();
    } catch (error) {
        console.error('[WS Auth Error]', error);
        next(new Error('Authentication error'));
    }
};
