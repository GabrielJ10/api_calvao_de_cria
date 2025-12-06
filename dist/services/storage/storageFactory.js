"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinaryStorage_1 = __importDefault(require("./cloudinaryStorage"));
const PROVIDER = process.env.STORAGE_PROVIDER || 'cloudinary';
function getStorageProvider() {
    switch (PROVIDER) {
        case 'cloudinary':
            return cloudinaryStorage_1.default;
        default:
            throw new Error(`Provedor de storage desconhecido: ${PROVIDER}`);
    }
}
exports.default = getStorageProvider();
