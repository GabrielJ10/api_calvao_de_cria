const userRepository = require('../../repositories/user.repository');
const { body } = require('express-validator');
const {
  nameRule,
  phoneRule,
  birthDateRule,
  passwordRule,
  passwordConfirmRule,
  fieldWhitelistRule,
  ERROR_MESSAGES,
  ALLOWLISTS,
} = require('./validation.utils');
const AppError = require('../AppError');
const bcrypt = require('bcryptjs');

const updateProfileRules = () => [
  // As regras são aplicadas opcionalmente, pois a atualização é parcial
  nameRule().optional(),
  birthDateRule().optional(),
  phoneRule().optional(),

  // Impede que campos de senha sejam enviados junto com os de perfil
  body('password').custom((value, { req }) => {
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

const changePasswordRules = () => [
  body('currentPassword')
    .notEmpty()
    .withMessage(ERROR_MESSAGES.user.password.required)
    .bail()
    .custom(async (value, { req }) => {
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

module.exports = {
  updateProfileRules,
  changePasswordRules,
};
