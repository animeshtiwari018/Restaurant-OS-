import { Server } from 'socket.io';

/**
 * Socket.IO Initialization and Event Management
 * Real-time layer for Waiter Dispatch, Kitchen KDS, and Order Status Tracking
 *
 * Room Architecture:
 * - room:waiters       - All on-duty waiters
 * - room:kitchen       - Kitchen display (KDS) screens
 * - room:session_<id>  - Active customer dining at a specific table session
 */

let ioInstance = null;

export const initSocket = (httpServer) => {
    ioInstance = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    ioInstance.on('connection', (socket) => {
        // Direct event-based room join
        socket.on('join_room', (room) => {
            if (room) {
                socket.join(room);
            }
        });

        socket.on('join', (room) => {
            if (room) {
                socket.join(room);
            }
        });

        socket.on('leave_room', (room) => {
            if (room) {
                socket.leave(room);
            }
        });

        // Dedicated helper events for waiters, kitchen, and customer sessions
        socket.on('join_waiters', () => {
            socket.join('room:waiters');
        });

        socket.on('join_kitchen', () => {
            socket.join('room:kitchen');
        });

        socket.on('join_session', (sessionId) => {
            if (sessionId) {
                const room = sessionId.startsWith('room:session_') ? sessionId : `room:session_${sessionId}`;
                socket.join(room);
            }
        });

        // Query or Auth based auto-join on connection handshake
        const handshakeRoom = socket.handshake.query?.room || socket.handshake.auth?.room;
        const sessionId = socket.handshake.query?.sessionId || socket.handshake.auth?.sessionId;
        const role = socket.handshake.query?.role || socket.handshake.auth?.role;

        if (handshakeRoom) {
            socket.join(handshakeRoom);
        }
        if (sessionId) {
            socket.join(`room:session_${sessionId}`);
        }
        if (role && (role.toUpperCase() === 'WAITER' || role.toUpperCase() === 'STAFF')) {
            socket.join('room:waiters');
        }
        if (role && (role.toUpperCase() === 'KITCHEN' || role.toUpperCase() === 'CHEF')) {
            socket.join('room:kitchen');
        }

        socket.on('disconnect', () => {
            // Socket disconnected
        });
    });

    return ioInstance;
};

export const getIO = () => {
    if (!ioInstance) {
        console.warn('⚠️ Socket.IO has not been initialized yet.');
    }
    return ioInstance;
};

export default { initSocket, getIO };
