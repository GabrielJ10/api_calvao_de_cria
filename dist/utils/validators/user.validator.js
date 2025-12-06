"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordRules = exports.updateProfileRules = void 0;
const user_repository_1 = __importDefault(require("../../repositories/user.repository"));
const express_validator_1 = require("express-validator");
const validation_utils_1 = require("./validation.utils");
const AppError_1 = __importDefault(require("../../utils/AppError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const updateProfileRules = () => [
    // As regras são aplicadas opcionalmente, pois a atualização é parcial
    (0, validation_utils_1.nameRule)().optional(),
    (0, validation_utils_1.birthDateRule)().optional(),
    (0, validation_utils_1.phoneRule)().optional(),
    // Impede que campos de senha sejam enviados junto com os de perfil
    (0, express_validator_1.body)('password').custom((value, { req }) => {
        const passwordFields = ['currentPassword', 'password', 'passwordConfirm'];
        const receivedFields = Object.keys(req.body);
        const hasPasswordFields = receivedFields.some((field) => passwordFields.includes(field));
        if (hasPasswordFields) {
            throw new AppError_1.default('Para atualização de senha use a rota /users/me/password', 400);
        }
        return true;
    }),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.UPDATE_PROFILE),
];
exports.updateProfileRules = updateProfileRules;
const changePasswordRules = () => [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.password.required)
        .bail()
        .custom(async (value, { req }) => {
        const userWithPassword = await user_repository_1.default.findByIdWithPassword(req.user.id);
        if (!userWithPassword) {
            // Apenas uma verificação de segurança adicional
            throw new AppError_1.default('Usuário não encontrado.', 401);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(value, userWithPassword.passwordHash);
        if (!isPasswordValid) {
            return Promise.reject('A senha atual está incorreta.');
        }
    }),
    (0, validation_utils_1.passwordRule)(),
    (0, validation_utils_1.passwordConfirmRule)(),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.CHANGE_PASSWORD),
];
exports.changePasswordRules = changePasswordRules;
