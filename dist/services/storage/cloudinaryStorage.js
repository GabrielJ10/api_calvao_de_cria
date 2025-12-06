"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class CloudinaryStorage {
    uploadFromBuffer(buffer, filename) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({ folder: 'products', public_id: filename }, (err, result) => {
                if (err)
                    reject(err);
                else if (result)
                    resolve({ url: result.secure_url, public_id: result.public_id });
                else
                    reject(new Error('Upload failed, no result returned'));
            });
            stream.end(buffer); // envia o buffer
        });
    }
    async uploadFromUrl(url) {
        const result = await cloudinary_1.v2.uploader.upload(url, { folder: 'products' });
        return { url: result.secure_url, public_id: result.public_id };
    }
    async delete(publicId) {
        return cloudinary_1.v2.uploader.destroy(publicId);
    }
}
exports.default = new CloudinaryStorage();
