import { v2 as cloudinary } from 'cloudinary';
import config from '../config/index.js';

cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_api_secret,
});

export const uploadMedia = async (file: string, folder: string = 'echonet') => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'auto',
        });
        return result.secure_url;
    } catch (error) {
        throw error;
    }
};

export default cloudinary;
