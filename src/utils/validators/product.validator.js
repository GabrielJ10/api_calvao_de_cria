const { body, param, query } = require('express-validator');
const { validate,  } = require('./auth.validator');
const {
  ERROR_MESSAGES,
  mongoIdRule,
} = require('./validation.utils');

const allowedQueryParams = [
  'search',
  'inPromotion',
  'minPrice',
  'maxPrice',
  'page',
  'limit',
  'sortBy',
  'order',
];

const createProductRules = () => [
  body('name').notEmpty().withMessage('O nome do produto é obrigatório.').trim(),
  body('description').notEmpty().withMessage('A descrição é obrigatória.'),
  body('price').isFloat({ gt: 0 }).withMessage('O preço deve ser um número maior que zero.'),
  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('O estoque deve ser um número inteiro igual ou maior que zero.'),
];

const updateProductRules = () => [
 mongoIdRule('productId', 'ID do produto inválido.')
 .bail(),
  body('name').optional().notEmpty().withMessage('O nome do produto é obrigatório.').trim(),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('O preço deve ser um número maior que zero.'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .toInt()
    .withMessage('O estoque deve ser um número inteiro igual ou maior que zero.'),
  body('isPromotionActive')
    .optional()
    .isBoolean()
    .toBoolean()
    .withMessage('O status da promoção deve ser um booleano.'),
  body('isActive').optional().isBoolean().withMessage('O status de ativação deve ser um booleano.'),
];

const productIdRule = () => [
  param('productId').isMongoId().withMessage('ID do produto inválido.'),
  //      mongoIdRule('addressId', ERROR_MESSAGES.address.id.invalid).bail(),
];

const listProductsRules = () => [
    query("param").custom((_, { req }) => {
    const keys = Object.keys(req.query);
    const invalidKeys = keys.filter((k) => !allowedQueryParams.includes(k));
    if (invalidKeys.length > 0) {
      throw new Error(`Parâmetros não permitidos: ${invalidKeys.join(', ')}`);
    }
    return true;
  }),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('O parâmetro "page" deve ser um número inteiro maior ou igual a 1.'),
query('limit')
  .optional()
  .isInt({ min: 1, max: 25 })
  .withMessage('limit deve ser um número inteiro entre 1 e 25.'),
  query('search')
    .optional()
    .isString()
    .withMessage('O parâmetro "search" deve ser uma string.')
    .trim(),
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'rating'])
    .withMessage('O parâmetro "sortBy" deve ser um dos campos permitidos: name, price, rating.'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('O parâmetro "order" deve ser "asc" ou "desc".'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('O parâmetro "minPrice" deve ser um número maior ou igual a zero.'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('O parâmetro "maxPrice" deve ser um número maior ou igual a zero.'),
  query('inPromotion')
    .optional()
    .isBoolean()
    .withMessage('O parâmetro "inPromotion" deve ser um booleano (true ou false).'),
];



module.exports = {
  listProductsRules,
  createProductRules,
  updateProductRules,
  productIdRule,
  validate,
};
