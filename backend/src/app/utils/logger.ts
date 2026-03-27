import winston from 'winston';
import path from 'path';
import config from '../config/index.js';

const { combine, timestamp, json, colorize, printf } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const isProduction = config.env === 'production';

const transports: winston.transport[] = [
    new winston.transports.Console(),
];

// Only write to files in development — Vercel Lambda is read-only
if (!isProduction) {
    transports.push(
        new winston.transports.File({ 
            filename: path.join(process.cwd(), 'logs', 'error.log'), 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: path.join(process.cwd(), 'logs', 'combined.log') 
        }),
    );
}

const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        isProduction ? json() : colorize(),
        isProduction ? json() : customFormat
    ),
    transports,
});

export default logger;
