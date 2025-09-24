const { body } = require('express-validator');
const { mongoIdRuleBody, fieldWhitelistRule } = require('./validation.utils');

const ALLOWLISTS = {
    PREVIEW_COUPON: ['couponCode'],
    CHECKOUT: ['addressId', 'paymentMethodIdentifier', 'couponCode'],
};

const previewCouponRules = () => [
    body('couponCode')
    .notEmpty().withMessage('O código do cupom é obrigatório.')
    .isString().withMessage('O código do cupom deve ser um texto.')
    .trim()
    .toUpperCase(),
    fieldWhitelistRule(ALLOWLISTS.PREVIEW_COUPON),
];

const checkoutRules = () => [
    mongoIdRuleBody('addressId', 'O ID do endereço é inválido.'),
    body('paymentMethodIdentifier')
    .notEmpty().withMessage('O identificador do método de pagamento é obrigatório.')
    .isString().withMessage('O identificador do método de pagamento deve ser um texto.'),
    body('couponCode')
    .optional()
    .isString().withMessage('O código do cupom deve ser um texto.')
    .trim()
    .toUpperCase(),
    fieldWhitelistRule(ALLOWLISTS.CHECKOUT),
];

module.exports = {
    previewCouponRules,
    checkoutRules,
};