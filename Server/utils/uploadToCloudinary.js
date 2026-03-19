const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

const uploadBufferToCloudinary = (fileBuffer, folder = 'loan-documents') =>
    new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                use_filename: true,
                unique_filename: true,
                overwrite: false,
                fetch_format: 'auto',
                quality: 'auto'
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });

module.exports = { uploadBufferToCloudinary };
