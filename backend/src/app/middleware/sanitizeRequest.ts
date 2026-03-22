import { Request, Response, NextFunction } from 'express';
import { sanitize } from '../utils/sanitizer.js';

/**
 * Middleware to sanitize the request body, query, and params.
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        sanitize(req.body);
    }
    if (req.query) {
        sanitize(req.query);
    }
    if (req.params) {
        sanitize(req.params);
    }
    next();
};
