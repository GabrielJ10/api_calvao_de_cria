const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
require('dotenv').config();

const cartIdentifierMiddleware = (req, res, next) => {
  const guestCartId = req.headers['x-guest-cart-id'];
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.cartIdentifier = { userId: decoded.userId };
      req.user = { id: decoded.userId, role: decoded.role }; // Adiciona para uso no merge
    } catch (err) {
      // Se o token for inválido ou expirado, trata como convidado se houver guestCartId
      if (guestCartId) {
        req.cartIdentifier = { guestCartId };
      } else {
        // Se não houver token nem guestCartId, cria um identificador vazio para ser tratado no serviço
        req.cartIdentifier = {};
      }
    }
  } else if (guestCartId) {
    req.cartIdentifier = { guestCartId };
  } else {
    req.cartIdentifier = {};
  }

  next();
};

module.exports = { cartIdentifierMiddleware };