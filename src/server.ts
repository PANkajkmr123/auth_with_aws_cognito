import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';
import apiRouter from './routes/app';
import logger from 'jet-logger';
import { CustomError } from '@utils/errors';
import adminRoutesFE from './routes/admin-panel';
import { connect, disconnect } from '@utils/database';
import '@models/index';
import cors from 'cors';

// Constants
const app = express();

//Connect DB
connect();

/***********************************************************************************
 *                                  Middlewares
 **********************************************************************************/

// Common middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enable CORS
app.use(cors());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security (helmet recommended in express docs)
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

// CORS handling
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});

/***********************************************************************************
 *                         API routes and error handling
 **********************************************************************************/

// Add api router
app.use('/api/v1', apiRouter);

app.get('/api/v1/pankaj', (req, res) => {
    res.send({ Name: 'pankaj', email: 'Pankaj@gmail.com' });
});

// Error handling
app.use((err: Error | CustomError, _: Request, res: Response, __: NextFunction) => {
    logger.err(err, true);
    const status = err instanceof CustomError ? err.HttpStatus : StatusCodes.BAD_REQUEST;
    return res.status(status).json({
        error: err.message,
        message: err.message,
        code: status,
    });
});

/***********************************************************************************
 *                                  Front-end content
 **********************************************************************************/

// Set views dir
const adminViewsDir = path.join(__dirname, 'public/admin/');

app.set('views', [adminViewsDir]);

// Set static dir
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Serve admin panel files
app.use('/admin', adminRoutesFE);

// Export here and start in a different file (for testing).
export default app;

