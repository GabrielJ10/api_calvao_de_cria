import { body, ValidationChain } from 'express-validator';
import { mongoIdRule, fieldWhitelistRule } from '../validation.utils';
import paymentMethodRepository from '../../../repositories/paymentMethod.repository';

const ALLOWLISTS = {
  PAYMENT_METHOD: ['name', 'identifier', 'description', 'isEnabled', 'iconUrl'],
};

const paymentMethodRules = (isUpdate = false): ValidationChain[] => [
  body('name').optional(isUpdate).notEmpty().withMessage('O nome é obrigatório.').trim(),

  body('identifier')
    .optional(isUpdate)
    .notEmpty()
    .withMessage('O identificador é obrigatório.')
    .trim()
    .custom(async (identifier: string) => {
      if (await paymentMethodRepository.findByIdentifier(identifier)) {
        return Promise.reject('Este identificador já está em uso.');
      }
    }),

  body('description').optional(isUpdate).notEmpty().withMessage('A descrição é obrigatória.'),

  body('isEnabled')
    .optional()
    .isBoolean()
    .withMessage('O status de ativação deve ser um booleano (true/false).'),

  body('iconUrl').optional().isURL().withMessage('A URL do ícone é inválida.'),

  fieldWhitelistRule(ALLOWLISTS.PAYMENT_METHOD),
];

export const createPaymentMethodRules = (): ValidationChain[] => paymentMethodRules();
export const updatePaymentMethodRules = (): ValidationChain[] => [
  mongoIdRule('methodId', 'ID do método de pagamento inválido.'),
  ...paymentMethodRules(true),
];
