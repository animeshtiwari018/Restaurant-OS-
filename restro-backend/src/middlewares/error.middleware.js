import { ApiError } from '../utils/apiError.js';

export const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    };

    return res.status(error.statusCode).json(response);
};

export default errorHandler;
