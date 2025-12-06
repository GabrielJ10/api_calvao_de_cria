"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.refreshTokenRules = exports.resetPasswordRules = exports.forgotPasswordRules = exports.loginRules = exports.registerRules = void 0;
const express_validator_1 = require("express-validator");
const cpf_cnpj_validator_1 = require("cpf-cnpj-validator");
const user_repository_1 = __importDefault(require("../../repositories/user.repository"));
const validation_utils_1 = require("./validation.utils");
const registerRules = () => [
    (0, validation_utils_1.nameRule)(),
    (0, express_validator_1.body)('email')
        .notEmpty()
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.email.required)
        .bail()
        .isEmail()
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.email.invalid)
        .isLength({ max: 80 })
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.email.max)
        .normalizeEmail()
        .bail()
        .custom(async (email) => {
        if (await user_repository_1.default.emailExists(email)) {
            return Promise.reject(validation_utils_1.ERROR_MESSAGES.user.email.taken);
        }
    }),
    (0, express_validator_1.body)('cpf')
        .trim()
        .notEmpty()
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.cpf.required)
        .bail()
        .isString()
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.cpf.format)
        .customSanitizer((value) => value.replace(/\D/g, ''))
        .isLength({ min: 11, max: 11 })
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.cpf.length)
        .isNumeric()
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.cpf.numeric)
        .bail()
        .custom((value) => {
        if (!cpf_cnpj_validator_1.cpf.isValid(value))
            throw new Error(validation_utils_1.ERROR_MESSAGES.user.cpf.invalid);
        return true;
    })
        .bail()
        .custom(async (value) => {
        if (await user_repository_1.default.cpfExists(value)) {
            return Promise.reject(validation_utils_1.ERROR_MESSAGES.user.cpf.taken);
        }
    }),
    (0, validation_utils_1.birthDateRule)(),
    (0, validation_utils_1.phoneRule)(),
    (0, validation_utils_1.passwordRule)(),
    (0, validation_utils_1.passwordConfirmRule)(),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.REGISTER),
];
exports.registerRules = registerRules;
const loginRules = () => [
    (0, express_validator_1.body)('email').isEmail().withMessage(validation_utils_1.ERROR_MESSAGES.user.email.invalid).normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty().withMessage(validation_utils_1.ERROR_MESSAGES.user.password.required).bail(),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.LOGIN),
];
exports.loginRules = loginRules;
const forgotPasswordRules = () => [
    (0, express_validator_1.body)('email')
        .notEmpty()
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.email.required)
        .bail()
        .isEmail()
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.email.invalid)
        .normalizeEmail(),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.FORGOT_PASSWORD),
];
exports.forgotPasswordRules = forgotPasswordRules;
const resetPasswordRules = () => [
    (0, express_validator_1.param)('resetToken')
        .trim()
        .notEmpty()
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.resetToken.required)
        .bail()
        .isHexadecimal()
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.resetToken.invalid)
        .isLength({ min: 64, max: 64 })
        .withMessage(validation_utils_1.ERROR_MESSAGES.user.resetToken.length),
    (0, validation_utils_1.passwordRule)(),
    (0, validation_utils_1.passwordConfirmRule)(),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.RESET_PASSWORD),
];
exports.resetPasswordRules = resetPasswordRules;
const refreshTokenRules = () => [
    (0, express_validator_1.body)('refreshToken')
        .notEmpty()
        .withMessage(validation_utils_1.ERROR_MESSAGES.auth.refreshToken.required)
        .bail()
        .isJWT()
        .withMessage(validation_utils_1.ERROR_MESSAGES.auth.refreshToken.invalid)
        .matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
        .withMessage(validation_utils_1.ERROR_MESSAGES.auth.refreshToken.format),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.REFRESH_TOKEN),
];
exports.refreshTokenRules = refreshTokenRules;
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = errors.array().map((err) => ({ [err.path]: err.msg }));
    return res.status(422).json({
        status: 'fail',
        message: 'Dados inválidos.',
        errors: extractedErrors,
    });
};
exports.validate = validate;
