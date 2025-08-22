const User = require('../models/user.model');

const findByEmail = async (email) => {
  // Adicionamos .select('+passwordHash') para explicitamente buscar a senha
  // que por padrão está oculta em nosso model (select: false)
  return User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
};

const findById = async (id) => {
  return User.findById(id);
};

const createUser = async (userData) => {
  const user = await User.create(userData);
  return user;
};

module.exports = {
    findByEmail,
    findById,
    createUser,
};