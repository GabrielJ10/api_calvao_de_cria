"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const user_repository_1 = __importDefault(require("../repositories/user.repository"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.authMiddleware = (0, asyncHandler_1.default)(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError_1.default('Você não está logado. Por favor, faça o login para obter acesso.', 401));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // const currentUser = await userRepository.findById(decoded.userId);
        // if (!currentUser) {
        //   return next(new AppError('O usuário pertencente a este token não existe mais.', 401));
        // }
        // req.user = currentUser;
        req.user = { id: decoded.userId, role: decoded.role };
        next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError_1.default('Sua sessão expirou. Por favor, faça login novamente.', 401));
        }
        // Para outros erros de JWT (assinatura inválida, etc.)
        return next(new AppError_1.default('Token inválido ou corrompido.', 401));
    }
});
const restrictTo = (...roles) => {
    return (0, asyncHandler_1.default)(async (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError_1.default('Você não tem permissão para realizar esta ação.', 403));
        }
        const freshUser = await user_repository_1.default.findByIdWithRole(req.user.id);
        if (!freshUser || !roles.includes(freshUser.role)) {
            return next(new AppError_1.default('Sessão inválida ou permissões alteradas. Por favor, faça login novamente.', 401));
        }
        req.user = freshUser;
        next();
    });
};
exports.restrictTo = restrictTo;
