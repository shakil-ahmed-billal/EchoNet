import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middleware/globalErrorHandler.js';
import notFound from './app/middleware/notFound.js';
import router from './app/routes/index.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { sanitizeRequest } from './app/middleware/sanitizeRequest.js';
import { auth } from './app/lib/auth.js';
import { toNodeHandler } from 'better-auth/node';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security Middlewares
app.use(helmet());
app.use(cors({ 
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

app.use(cookieParser());

// Mount Better-Auth BEFORE body parsers (required by better-auth docs)
app.all("/api/auth/{*splat}", toNodeHandler(auth));

// Rate Limiting
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 1000,
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
    message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use('/api/v1/auth', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeRequest);
app.use(morgan("dev"))

app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Welcome to EchoNet API',
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
