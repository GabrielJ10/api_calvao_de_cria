const { body, param } = require('express-validator');

const addItemRules = () => [
  body('productId').isMongoId().withMessage('O ID do produto é inválido.'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('A quantidade deve ser um número inteiro maior ou igual a 1.'),
];

const updateItemRules = () => [
  param('productId').isMongoId().withMessage('O ID do produto é inválido.'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('A quantidade deve ser no mínimo 1. Para remover, utilize a rota DELETE.'),
];

const removeItemRules = () => [
  param('productId').isMongoId().withMessage('O ID do produto é inválido.'),
];

const mergeCartRules = () => [
    body('guestCartId').isUUID().withMessage('O ID do carrinho de convidado é inválido.'),
  ];

module.exports = {
  addItemRules,
  updateItemRules,
  removeItemRules,
  mergeCartRules
};