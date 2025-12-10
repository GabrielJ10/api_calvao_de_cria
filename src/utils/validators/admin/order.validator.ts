import { body, ValidationChain, Meta } from 'express-validator';
import { mongoIdRule, fieldWhitelistRule } from '../validation.utils';

const ALLOWLISTS = {
  UPDATE_ORDER: ['status', 'shippingInfo'],
  SHIPPING_INFO: ['carrier', 'trackingCode'],
};

export const updateOrderRules = (): ValidationChain[] => [
  mongoIdRule('orderId', 'ID do pedido inválido.').bail(),

  body('status')
    .optional()
    .isIn(['PAID', 'PREPARING_SHIPMENT', 'SHIPPED', 'DELIVERED', 'CANCELED'])
    .withMessage('O status fornecido é inválido.'),

  body('shippingInfo').optional().isObject().withMessage('shippingInfo deve ser um objeto.'),

  body('shippingInfo.carrier')
    .if(body('shippingInfo').exists())
    .notEmpty()
    .withMessage('O nome da transportadora é obrigatório.')
    .isString()
    .withMessage('O nome da transportadora deve ser um texto.'),

  body('shippingInfo.trackingCode')
    .if(body('shippingInfo').exists())
    .notEmpty()
    .withMessage('O código de rastreio é obrigatório.')
    .isString()
    .withMessage('O código de rastreio deve ser um texto.'),

  // Whitelist para o objeto shippingInfo
  body().custom((value: any, { req }: Meta) => {
    if (req.body.shippingInfo) {
      const receivedFields = Object.keys(req.body.shippingInfo);
      const unknownFields = receivedFields.filter(
        (field) => !ALLOWLISTS.SHIPPING_INFO.includes(field)
      );
      if (unknownFields.length > 0) {
        throw new Error(
          `Campos não permitidos dentro de shippingInfo: ${unknownFields.join(', ')}`
        );
      }
    }
    return true;
  }),

  fieldWhitelistRule(ALLOWLISTS.UPDATE_ORDER),
];
