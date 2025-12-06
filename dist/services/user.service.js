"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = __importDefault(require("../repositories/user.repository"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const user_transformer_1 = __importDefault(require("../utils/transformers/user.transformer"));
const getUserProfile = async (userId) => {
    const user = await user_repository_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default('Usuário não encontrado.', 404);
    }
    return {
        user: user_transformer_1.default.detailed(user),
        tokens: null,
        message: null,
        details: null,
    };
};
const updateUserProfile = async (userId, updateData) => {
    const updatedUser = await user_repository_1.default.updateById(userId, updateData);
    if (!updatedUser) {
        throw new AppError_1.default('Não foi possível atualizar o perfil.', 500);
    }
    return {
        data: user_transformer_1.default.detailed(updatedUser),
        tokens: null,
        message: 'Perfil atualizado com sucesso.',
        details: null,
    };
};
const changePassword = async (userId, newPassword) => {
    const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
    await user_repository_1.default.updateById(userId, { passwordHash });
    await user_repository_1.default.updateById(userId, { currentRefreshTokenHash: undefined }); // Changed null to undefined or empty string based on types. Mongoose usually handles null if schema allows.
    return {
        user: null,
        tokens: null,
        message: 'Senha alterada com sucesso.',
        details: null,
    };
};
exports.default = {
    getUserProfile,
    updateUserProfile,
    changePassword,
};
