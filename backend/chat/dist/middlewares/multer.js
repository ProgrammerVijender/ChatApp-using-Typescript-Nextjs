import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chat-images',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }],
        quality: 'auto',
        fetch_format: 'auto',
    },
});
const multerMiddleware = multer({ storage: storage });
export default multerMiddleware;
//# sourceMappingURL=multer.js.map