"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutRules = exports.previewCouponRules = void 0;
const express_validator_1 = require("express-validator");
const validation_utils_1 = require("./validation.utils");
const previewCouponRules = () => [
    (0, express_validator_1.body)('couponCode')
        .notEmpty()
        .withMessage('O código do cupom é obrigatório.')
        .isString()
        .withMessage('O código do cupom deve ser um texto.')
        .trim()
        .toUpperCase(),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.PREVIEW_COUPON),
];
exports.previewCouponRules = previewCouponRules;
const checkoutRules = () => [
    (0, validation_utils_1.mongoIdRuleBody)('addressId', 'O ID do endereço é inválido.'),
    (0, express_validator_1.body)('paymentMethodIdentifier')
        .notEmpty()
        .withMessage('O identificador do método de pagamento é obrigatório.')
        .isString()
        .withMessage('O identificador do método de pagamento deve ser um texto.'),
    (0, express_validator_1.body)('couponCode')
        .optional()
        .isString()
        .withMessage('O código do cupom deve ser um texto.')
        .trim()
        .toUpperCase(),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.CHECKOUT),
];
exports.checkoutRules = checkoutRules;
