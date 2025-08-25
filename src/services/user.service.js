const userRepository = require('../repositories/user.repository');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const userTransformer = require('../utils/transformers/user.transformer');

const getUserProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  return {
    user: userTransformer.detailed(user),
    tokens: null,
    message: null,
    details: null,
  };
};

const updateUserProfile = async (userId, updateData) => {
  const updatedUser = await userRepository.updateById(userId, updateData);
  if (!updatedUser) {
    throw new AppError('Não foi possível atualizar o perfil.', 500);
  }
  return {
    data: userTransformer.detailed(updatedUser),
    tokens: null,
    message: 'Perfil atualizado com sucesso.',
    details: null,
  };
};

const changePassword = async (userId, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await userRepository.updateById(userId, { passwordHash });
  await userRepository.updateById(userId, { currentRefreshTokenHash: null });

  return {
    user: null,
    tokens: null,
    message: 'Senha alterada com sucesso.',
    details: null,
  };
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
};
