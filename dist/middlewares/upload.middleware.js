"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(new AppError_1.default('Apenas imagens são permitidas.', 400));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
});
exports.default = upload;
