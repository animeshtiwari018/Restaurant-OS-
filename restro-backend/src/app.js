import express from 'express';
import cors from 'cors';

// Routers
import authRouter from './routes/auth.routes.js';
import tableRouter from './routes/tableRoutes.js';
import menuRouter from './routes/menu.routes.js';
import orderRouter from './routes/order.routes.js';
import kitchenRouter from './routes/kitchen.routes.js';
import reservationRouter from './routes/reservation.routes.js';
import billingRouter from './routes/billing.routes.js';
import sessionRouter from './routes/session.routes.js';

// Middlewares
import errorHandler from './middlewares/error.middleware.js';

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

// Mount Domain API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tables', tableRouter);
app.use('/api/v1/sessions', sessionRouter);
app.use('/api/v1/menu', menuRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/kitchen', kitchenRouter);
app.use('/api/v1/reservations', reservationRouter);
app.use('/api/v1/billing', billingRouter);

// Global Centralized Error Handler
app.use(errorHandler);

export default app;