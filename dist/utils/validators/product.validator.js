"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validateDeleteImages = exports.validateAddImages = exports.validateUpdateImages = exports.listProductsRules = exports.deleteProductRules = exports.updateProductRules = exports.createProductRules = void 0;
const express_validator_1 = require("express-validator");
const auth_validator_1 = require("./auth.validator");
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return auth_validator_1.validate; } });
const AppError_1 = __importDefault(require("../../utils/AppError"));
const validation_utils_1 = require("./validation.utils");
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
    (0, express_validator_1.body)('name').notEmpty().withMessage('O nome do produto é obrigatório.').trim(),
    (0, express_validator_1.body)('description').notEmpty().withMessage('A descrição é obrigatória.'),
    (0, express_validator_1.body)('price').isFloat({ gt: 0 }).withMessage('O preço deve ser um número maior que zero.'),
    (0, express_validator_1.body)('stockQuantity')
        .isInt({ min: 0 })
        .withMessage('O estoque deve ser um número inteiro igual ou maior que zero.'),
];
exports.createProductRules = createProductRules;
const updateProductRules = () => [
    (0, validation_utils_1.mongoIdRule)('productId', 'ID do produto inválido.').bail(),
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('O nome do produto é obrigatório.').trim(),
    (0, express_validator_1.body)('price')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('O preço deve ser um número maior que zero.'),
    (0, express_validator_1.body)('stockQuantity')
        .optional()
        .isInt({ min: 0 })
        .toInt()
        .withMessage('O estoque deve ser um número inteiro igual ou maior que zero.'),
    (0, express_validator_1.body)('isPromotionActive')
        .optional()
        .isBoolean()
        .toBoolean()
        .withMessage('O status da promoção deve ser um booleano.'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('O status de ativação deve ser um booleano.'),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.PRODUCT),
];
exports.updateProductRules = updateProductRules;
const deleteProductRules = () => [
    (0, validation_utils_1.mongoIdRule)('productId', 'ID do produto inválido.').bail(),
];
exports.deleteProductRules = deleteProductRules;
const listProductsRules = () => [
    (0, express_validator_1.query)().custom((_, { req }) => {
        const invalidKeys = Object.keys(req.query || {}).filter((k) => !allowedQueryParams.includes(k));
        if (invalidKeys.length > 0) {
            throw new AppError_1.default(`Parâmetros não permitidos: ${invalidKeys.join(', ')}`, 400);
        }
        return true;
    }),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('O parâmetro "page" deve ser um número inteiro maior ou igual a 1.'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 25 })
        .withMessage('limit deve ser um número inteiro entre 1 e 25.'),
    (0, express_validator_1.query)('search')
        .optional()
        .isString()
        .trim()
        .withMessage('O parâmetro "search" deve ser uma string.'),
    (0, express_validator_1.query)('sortBy')
        .optional()
        .isIn(['name', 'price', 'rating'])
        .withMessage('O parâmetro "sortBy" deve ser um dos campos permitidos: name, price, rating.'),
    (0, express_validator_1.query)('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('O parâmetro "order" deve ser "asc" ou "desc".'),
    (0, express_validator_1.query)('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('O parâmetro "minPrice" deve ser um número maior ou igual a zero.'),
    (0, express_validator_1.query)('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('O parâmetro "maxPrice" deve ser um número maior ou igual a zero.'),
    (0, express_validator_1.query)('inPromotion')
        .optional()
        .isBoolean()
        .withMessage('O parâmetro "inPromotion" deve ser um booleano (true ou false).'),
];
exports.listProductsRules = listProductsRules;
const validateUpdateImages = () => [
    (0, express_validator_1.param)('productId').isMongoId().withMessage('ID do produto inválido.'),
    (0, express_validator_1.body)('ids').isArray({ min: 1 }).withMessage('O campo "ids" deve ser um array de _ids'),
    (0, express_validator_1.body)('ids.*').isMongoId().withMessage('Cada _id no ids deve ser válido'),
];
exports.validateUpdateImages = validateUpdateImages;
const validateAddImages = () => [
    (0, express_validator_1.param)('productId').isMongoId().withMessage('ID do produto inválido.'),
    (req, res, next) => {
        if ((!req.files || req.files.length === 0) &&
            (!req.body.images || req.body.images.length === 0)) {
            return next(new AppError_1.default('Nenhum arquivo ou URL enviado', 400));
        }
        next();
    },
];
exports.validateAddImages = validateAddImages;
const validateDeleteImages = () => [
    (0, express_validator_1.param)('productId').isMongoId().withMessage('ID do produto inválido.'),
    (0, express_validator_1.body)('ids').isArray({ min: 1 }).withMessage('O campo "ids" deve ser um array de _ids'),
    (0, express_validator_1.body)('ids.*').isMongoId().withMessage('Cada _id no "ids" deve ser válido'),
];
exports.validateDeleteImages = validateDeleteImages;
