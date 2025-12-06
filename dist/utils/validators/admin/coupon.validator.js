"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCouponRules = exports.createCouponRules = void 0;
const express_validator_1 = require("express-validator");
const validation_utils_1 = require("../validation.utils");
const coupon_repository_1 = __importDefault(require("../../../repositories/coupon.repository"));
const ALLOWLISTS = {
    COUPON: ['code', 'description', 'type', 'value', 'minPurchaseValue', 'expiresAt', 'isActive'],
};
const couponRules = (isUpdate = false) => [
    (0, express_validator_1.body)('code')
        .optional(isUpdate)
        .notEmpty()
        .withMessage('O código é obrigatório.')
        .trim()
        .toUpperCase()
        .isString()
        .withMessage('O código deve ser um texto.')
        .custom(async (code, { req }) => {
        const coupon = await coupon_repository_1.default.findByCodeAdmin(code);
        // Se estiver atualizando e o código encontrado for o do próprio cupom, permite.
        if (isUpdate && coupon && coupon._id.toString() === req.params?.couponId) {
            return true;
        }
        if (coupon) {
            return Promise.reject('Este cupom já existe.');
        }
    }),
    (0, express_validator_1.body)('description').optional(isUpdate).notEmpty().withMessage('A descrição é obrigatória.'),
    (0, express_validator_1.body)('type')
        .optional(isUpdate)
        .notEmpty()
        .withMessage('O tipo é obrigatório.')
        .isIn(['percentage', 'fixed'])
        .withMessage('O tipo deve ser "percentage" ou "fixed".'),
    (0, express_validator_1.body)('value')
        .optional(isUpdate)
        .notEmpty()
        .withMessage('O valor é obrigatório.')
        .isFloat({ min: 0.01 })
        .withMessage('O valor do desconto deve ser maior que zero.'),
    (0, express_validator_1.body)('minPurchaseValue')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('O valor mínimo da compra deve ser um número positivo.'),
    (0, express_validator_1.body)('expiresAt')
        .optional(isUpdate)
        .notEmpty()
        .withMessage('A data de expiração é obrigatória.')
        .isISO8601()
        .withMessage('Formato de data inválido. Use YYYY-MM-DD.'),
    (0, express_validator_1.body)('isActive')
        .optional()
        .isBoolean()
        .withMessage('O status de ativação deve ser um booleano (true/false).'),
    (0, validation_utils_1.fieldWhitelistRule)(ALLOWLISTS.COUPON),
];
const createCouponRules = () => couponRules();
exports.createCouponRules = createCouponRules;
const updateCouponRules = () => [
    (0, validation_utils_1.mongoIdRule)('couponId', 'ID de cupom inválido.'),
    ...couponRules(true),
];
exports.updateCouponRules = updateCouponRules;
