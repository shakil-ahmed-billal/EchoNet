import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    env: process.env.NODE_ENV,
    port: process.env.PORT || 8000,
    database_url: process.env.DATABASE_URL,
    jwt_secret: process.env.JWT_SECRET,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '2h',
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    redis_url: process.env.REDIS_URL,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
    },
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',
    backend_url: process.env.BACKEND_URL || 'http://localhost:8000',
};

