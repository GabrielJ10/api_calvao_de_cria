import { body, ValidationChain } from 'express-validator';
import { mongoIdRuleBody, fieldWhitelistRule, ALLOWLISTS } from './validation.utils';

export const previewCouponRules = (): ValidationChain[] => [
  body('couponCode')
    .notEmpty()
    .withMessage('O código do cupom é obrigatório.')
    .isString()
    .withMessage('O código do cupom deve ser um texto.')
    .trim()
    .toUpperCase(),
  fieldWhitelistRule(ALLOWLISTS.PREVIEW_COUPON),
];

export const checkoutRules = (): ValidationChain[] => [
  mongoIdRuleBody('addressId', 'O ID do endereço é inválido.'),
  body('paymentMethodIdentifier')
    .notEmpty()
    .withMessage('O identificador do método de pagamento é obrigatório.')
    .isString()
    .withMessage('O identificador do método de pagamento deve ser um texto.'),
  body('couponCode')
    .optional()
    .isString()
    .withMessage('O código do cupom deve ser um texto.')
    .trim()
    .toUpperCase(),
  fieldWhitelistRule(ALLOWLISTS.CHECKOUT),
];
