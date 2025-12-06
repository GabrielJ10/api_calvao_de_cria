"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../utils/AppError"));
const errorHandler = (err, req, res, next) => {
    // Se o erro já é um AppError que nós criamos, usamos o status e msg dele
    if (err instanceof AppError_1.default) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    console.error('ERRO INESPERADO 💥', err);
    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
};
exports.default = errorHandler;
