import { body, param, ValidationChain } from 'express-validator';
import { mongoIdRuleBody, fieldWhitelistRule, ALLOWLISTS } from './validation.utils';

export const addItemRules = (): ValidationChain[] => [
  mongoIdRuleBody('productId', 'O ID do produto é inválido.'),

  body('quantity')
    .notEmpty()
    .withMessage('A quantidade é obrigatória.')
    .isInt({ min: 1 })
    .withMessage('A quantidade deve ser um número inteiro maior ou igual a 1.'),
  fieldWhitelistRule(ALLOWLISTS.ADD_ITEM),
];

export const updateItemRules = (): ValidationChain[] => [
  param('productId').isMongoId().withMessage('O ID do produto na URL é inválido.'),
  body('quantity')
    .notEmpty()
    .withMessage('A quantidade é obrigatória.')
    .isInt({ min: 1 })
    .withMessage('A quantidade deve ser no mínimo 1. Para remover, utilize a rota DELETE.'),
  fieldWhitelistRule(ALLOWLISTS.UPDATE_ITEM),
];

export const removeItemRules = (): ValidationChain[] => [
  param('productId').isMongoId().withMessage('O ID do produto na URL é inválido.'),
];

export const mergeCartRules = (): ValidationChain[] => [
  body('guestCartId')
    .notEmpty()
    .withMessage('O guestCartId é obrigatório.')
    .isUUID()
    .withMessage('O ID do carrinho de convidado é inválido.'),
  fieldWhitelistRule(ALLOWLISTS.MERGE_CART),
];

export const applyCouponRules = (): ValidationChain[] => [
  body('couponCode')
    .notEmpty()
    .withMessage('O código do cupom é obrigatório.')
    .isString()
    .withMessage('O código do cupom deve ser um texto.')
    .trim()
    .toUpperCase(),
  fieldWhitelistRule(ALLOWLISTS.APPLY_COUPON),
];
