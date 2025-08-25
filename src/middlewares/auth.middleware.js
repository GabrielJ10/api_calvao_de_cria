const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const userRepository = require('../repositories/user.repository');
require('dotenv').config();

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Você não está logado. Por favor, faça o login para obter acesso.', 401)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // const currentUser = await userRepository.findById(decoded.userId);
    // if (!currentUser) {
    //   return next(new AppError('O usuário pertencente a este token não existe mais.', 401));
    // }
    // req.user = currentUser;

    req.user = { id: decoded.userId, role: decoded.role };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Sua sessão expirou. Por favor, faça login novamente.', 401));
    }
    // Para outros erros de JWT (assinatura inválida, etc.)
    return next(new AppError('Token inválido ou corrompido.', 401));
  }
});

const restrictTo = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Você não tem permissão para realizar esta ação.', 403));
    }

    const freshUser = await userRepository.findByIdWithRole(req.user.id);

    if (!freshUser || !roles.includes(freshUser.role)) {
      return next(
        new AppError(
          'Sessão inválida ou permissões alteradas. Por favor, faça login novamente.',
          401
        )
      );
    }

    req.user = freshUser;
    next();
  });
};

module.exports = {
  authMiddleware,
  restrictTo,
};
