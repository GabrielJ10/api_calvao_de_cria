"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderRules = void 0;
const express_validator_1 = require("express-validator");
const validation_utils_1 = require("../validation.utils");
const ALLOWLISTS = {
    UPDATE_ORDER: ['status', 'shippingInfo'],
    SHIPPING_INFO: ['carrier', 'trackingCode'],
};
const updateOrderRules = () => [
    (0, validation_utils_1.mongoIdRule)('orderId', 'ID do pedido inválido.').bail(),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['PAID', 'PREPARING_SHIPMENT', 'SHIPPED', 'DELIVERED', 'CANCELED'])
        .withMessage('O status fornecido é inválido.'),
    (0, express_validator_1.body)('shippingInfo').optional().isObject().withMessage('shippingInfo deve ser um objeto.'),
    (0, express_validator_1.body)('shippingInfo.carrier')
        .if((0, express_validator_1.body)('shippingInfo').exists())
        .notEmpty()
        .withMessage('O nome da transportadora é obrigatório.')
        .isString()
        .withMessage('O nome da transportadora deve ser um texto.'),
    (0, express_validator_1.body)('shippingInfo.trackingCode')
        .if((0, express_validator_1.body)('shippingInfo').exists())
        .notEmpty()
        .withMessage('O código de rastreio é obrigatório.')
        .isString()
        .withMessage('O código de rastreio deve ser um texto.'),
    // Whitelist para o objeto shippingInfo
    (0, express_validator_1.body)().custom((value, { req }) => {
        if (req.body.shippingInfo) {
            const receivedFields = Object.keys(req.body.shippingInfo);
            const unknownFields = receivedFields.filter((field) => !ALLOWLISTS.SHIPPING_INFO.includes(field));
            if (unknownFields.length > 0) {
                throw new Error(`Campos não permitidos dentro de shippingInfo: ${unknownFields.join(', ')}`);
            }
        }
        return true;
    }),
    (0, validation_utils_1.fieldWhitelistRule)(ALLOWLISTS.UPDATE_ORDER),
];
exports.updateOrderRules = updateOrderRules;
