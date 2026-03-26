const multer = require('multer');

const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7 max upload image size

const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed.'));
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

const uploadLoanDocuments = upload.fields([
    { name: 'documentPhoto', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]);

module.exports = { uploadLoanDocuments };
