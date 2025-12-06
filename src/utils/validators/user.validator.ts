import userRepository from '../../repositories/user.repository';
import { body, ValidationChain, Meta } from 'express-validator';
import {
  nameRule,
  phoneRule,
  birthDateRule,
  passwordRule,
  passwordConfirmRule,
  fieldWhitelistRule,
  ERROR_MESSAGES,
  ALLOWLISTS,
} from './validation.utils';
import AppError from '../../utils/AppError';
import bcrypt from 'bcryptjs';

export const updateProfileRules = (): ValidationChain[] => [
  // As regras são aplicadas opcionalmente, pois a atualização é parcial
  nameRule().optional(),
  birthDateRule().optional(),
  phoneRule().optional(),

  // Impede que campos de senha sejam enviados junto com os de perfil
  body('password').custom((value: string, { req }: Meta) => {
    const passwordFields = ['currentPassword', 'password', 'passwordConfirm'];
    const receivedFields = Object.keys(req.body);
    const hasPasswordFields = receivedFields.some((field) => passwordFields.includes(field));
    if (hasPasswordFields) {
      throw new AppError('Para atualização de senha use a rota /users/me/password', 400);
    }
    return true;
  }),

  fieldWhitelistRule(ALLOWLISTS.UPDATE_PROFILE),
];

export const changePasswordRules = (): ValidationChain[] => [
  body('currentPassword')
    .notEmpty()
    .withMessage(ERROR_MESSAGES.user.password.required)
    .bail()
    .custom(async (value: string, { req }: Meta) => {
      const userWithPassword = await userRepository.findByIdWithPassword(req.user.id);

      if (!userWithPassword) {
        // Apenas uma verificação de segurança adicional
        throw new AppError('Usuário não encontrado.', 401);
      }

      const isPasswordValid = await bcrypt.compare(value, userWithPassword.passwordHash);
      if (!isPasswordValid) {
        return Promise.reject('A senha atual está incorreta.');
      }
    }),

  passwordRule(),
  passwordConfirmRule(),

  fieldWhitelistRule(ALLOWLISTS.CHANGE_PASSWORD),
];
