/**
 * Server Bootstrap
 * Wraps Express app with HTTP server and initializes Socket.IO gateway
 */
import http from 'http';
import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/db/index.js';
import { initSocket, getIO } from './src/sockets/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initSocket(server);

// Start server if executed directly
if (process.argv[1]?.endsWith('server.js')) {
    connectDB()
        .then(() => {
            server.listen(PORT, () => {
                console.log(`⚙️  Server is running at http://localhost:${PORT}`);
            });
        })
        .catch((error) => {
            console.error('❌ Database connection error, Server failed to start:', error);
        });
}

export { server, io, getIO };
export default server;
