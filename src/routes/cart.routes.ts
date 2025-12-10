import express from 'express';
import cartController from '../controllers/cart.controller';
import { validate } from '../utils/validators/auth.validator';
import {
  addItemRules,
  updateItemRules,
  removeItemRules,
  mergeCartRules,
  applyCouponRules,
} from '../utils/validators/cart.validator';
import { cartIdentifierMiddleware } from '../middlewares/cart.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// --- Rotas de Cupom ---
// A aplicação de cupom exige um carrinho (logado ou guest), por isso usa o middleware híbrido.
router.post(
  '/coupon',
  cartIdentifierMiddleware,
  applyCouponRules(),
  validate,
  cartController.applyCoupon
);
router.delete('/coupon', cartIdentifierMiddleware, cartController.removeCoupon);

// --- Rotas do Carrinho ---

// Middleware híbrido para identificar o carrinho (logado ou guest)
router.use(cartIdentifierMiddleware);

router.get('/', cartController.getCart);

router.post('/items', addItemRules(), validate, cartController.addItemToCart);

router.put('/items/:productId', updateItemRules(), validate, cartController.updateItemQuantity);

router.delete('/items/:productId', removeItemRules(), validate, cartController.removeItemFromCart);

// A rota de merge requer autenticação estrita, por isso tem seu próprio middleware
router.post('/merge', authMiddleware, mergeCartRules(), validate, cartController.mergeCarts);

export default router;
