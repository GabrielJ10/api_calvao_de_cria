"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentMethodRules = exports.createPaymentMethodRules = void 0;
const express_validator_1 = require("express-validator");
const validation_utils_1 = require("../validation.utils");
const paymentMethod_repository_1 = __importDefault(require("../../../repositories/paymentMethod.repository"));
const ALLOWLISTS = {
    PAYMENT_METHOD: ['name', 'identifier', 'description', 'isEnabled', 'iconUrl'],
};
const paymentMethodRules = (isUpdate = false) => [
    (0, express_validator_1.body)('name').optional(isUpdate).notEmpty().withMessage('O nome é obrigatório.').trim(),
    (0, express_validator_1.body)('identifier')
        .optional(isUpdate)
        .notEmpty()
        .withMessage('O identificador é obrigatório.')
        .trim()
        .custom(async (identifier) => {
        if (await paymentMethod_repository_1.default.findByIdentifier(identifier)) {
            return Promise.reject('Este identificador já está em uso.');
        }
    }),
    (0, express_validator_1.body)('description').optional(isUpdate).notEmpty().withMessage('A descrição é obrigatória.'),
    (0, express_validator_1.body)('isEnabled')
        .optional()
        .isBoolean()
        .withMessage('O status de ativação deve ser um booleano (true/false).'),
    (0, express_validator_1.body)('iconUrl').optional().isURL().withMessage('A URL do ícone é inválida.'),
    (0, validation_utils_1.fieldWhitelistRule)(ALLOWLISTS.PAYMENT_METHOD),
];
const createPaymentMethodRules = () => paymentMethodRules();
exports.createPaymentMethodRules = createPaymentMethodRules;
const updatePaymentMethodRules = () => [
    (0, validation_utils_1.mongoIdRule)('methodId', 'ID do método de pagamento inválido.'),
    ...paymentMethodRules(true),
];
exports.updatePaymentMethodRules = updatePaymentMethodRules;
