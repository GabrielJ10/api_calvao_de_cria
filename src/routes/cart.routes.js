const express = require('express');
const cartController = require('../controllers/cart.controller');
const { validate } = require('../utils/validators/auth.validator');
const {
  addItemRules,
  updateItemRules,
  removeItemRules,
  mergeCartRules,
} = require('../utils/validators/cart.validator');
const { cartIdentifierMiddleware } = require('../middlewares/cart.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

// Middleware híbrido para todas as rotas de carrinho, exceto o merge
router.use(cartIdentifierMiddleware);

router.get('/', cartController.getCart);

router.post('/items', addItemRules(), validate, cartController.addItemToCart);

router.put('/items/:productId', updateItemRules(), validate, cartController.updateItemQuantity);

router.delete('/items/:productId', removeItemRules(), validate, cartController.removeItemFromCart);

// A rota de merge requer autenticação estrita
router.post('/merge', authMiddleware, mergeCartRules(), validate, cartController.mergeCarts);


module.exports = router;