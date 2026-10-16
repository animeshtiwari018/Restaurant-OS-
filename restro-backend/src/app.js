import express from 'express';
import cors from 'cors';
import tableRouter from './routes/tableRoutes.js';

const app = express();

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Restro backend server is healthy'
    });
});

// Routes
app.use('/api/v1/tables', tableRouter);

export default app;