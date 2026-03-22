import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { uploadMedia } from '../../lib/cloudinary.js';
import fs from 'fs';

const uploadFile = catchAsync(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
        throw new Error('No file uploaded');
    }

    try {
        const result = await uploadMedia(file.path);
        // Clean up temp file
        fs.unlinkSync(file.path);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'File uploaded successfully',
            data: { url: result.url },
        });
    } catch (error) {
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        throw error;
    }
});

export const UploadControllers = {
    uploadFile,
};
