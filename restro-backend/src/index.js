import http from 'http';
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';
import { initSocket } from './sockets/index.js';

// Load environment variables from .env
dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initSocket(server);

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`⚙️  Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Database connection error, Server failed to start:", error);
    });

export { server, io };