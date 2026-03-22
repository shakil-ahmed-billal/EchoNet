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
        return {
            url: result.secure_url,
            public_id: result.public_id,
        };
    } catch (error) {
        throw error;
    }
};

export const deleteMedia = async (public_id: string) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
    }
};

export default cloudinary;
