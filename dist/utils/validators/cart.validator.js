"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCouponRules = exports.mergeCartRules = exports.removeItemRules = exports.updateItemRules = exports.addItemRules = void 0;
const express_validator_1 = require("express-validator");
const validation_utils_1 = require("./validation.utils");
const addItemRules = () => [
    (0, validation_utils_1.mongoIdRuleBody)('productId', 'O ID do produto é inválido.'),
    (0, express_validator_1.body)('quantity')
        .notEmpty()
        .withMessage('A quantidade é obrigatória.')
        .isInt({ min: 1 })
        .withMessage('A quantidade deve ser um número inteiro maior ou igual a 1.'),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.ADD_ITEM),
];
exports.addItemRules = addItemRules;
const updateItemRules = () => [
    (0, express_validator_1.param)('productId').isMongoId().withMessage('O ID do produto na URL é inválido.'),
    (0, express_validator_1.body)('quantity')
        .notEmpty()
        .withMessage('A quantidade é obrigatória.')
        .isInt({ min: 1 })
        .withMessage('A quantidade deve ser no mínimo 1. Para remover, utilize a rota DELETE.'),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.UPDATE_ITEM),
];
exports.updateItemRules = updateItemRules;
const removeItemRules = () => [
    (0, express_validator_1.param)('productId').isMongoId().withMessage('O ID do produto na URL é inválido.'),
];
exports.removeItemRules = removeItemRules;
const mergeCartRules = () => [
    (0, express_validator_1.body)('guestCartId')
        .notEmpty()
        .withMessage('O guestCartId é obrigatório.')
        .isUUID()
        .withMessage('O ID do carrinho de convidado é inválido.'),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.MERGE_CART),
];
exports.mergeCartRules = mergeCartRules;
const applyCouponRules = () => [
    (0, express_validator_1.body)('couponCode')
        .notEmpty()
        .withMessage('O código do cupom é obrigatório.')
        .isString()
        .withMessage('O código do cupom deve ser um texto.')
        .trim()
        .toUpperCase(),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.APPLY_COUPON),
];
exports.applyCouponRules = applyCouponRules;
