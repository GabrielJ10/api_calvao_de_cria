const userRepository = require('../repositories/user.repository');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');

const getUserProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  return user;
};

const updateUserProfile = async (userId, updateData) => {
  const updatedUser = await userRepository.updateById(userId, updateData);
  if (!updatedUser) {
    throw new AppError('Não foi possível atualizar o perfil.', 500);
  }
  return updatedUser;
};

const changePassword = async (userId, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await userRepository.updateById(userId, { passwordHash });
  await userRepository.updateById(userId, { currentRefreshTokenHash: null });

  return { message: 'Senha alterada com sucesso.' };
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
};
