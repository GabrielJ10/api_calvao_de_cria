import express, { Router } from 'express';
import cartController, { CartController } from '../controllers/cart.controller';
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

/**
 * Factory function to create cart routes with injected controller.
 * Used for Top-Down testing where we can inject mocked controllers.
 */
export const createCartRoutes = (controller: CartController): Router => {
  const router = express.Router();

  // --- Rotas de Cupom ---
  // A aplicação de cupom exige um carrinho (logado ou guest), por isso usa o middleware híbrido.
  router.post(
    '/coupon',
    cartIdentifierMiddleware,
    applyCouponRules(),
    validate,
    controller.applyCoupon
  );
  router.delete('/coupon', cartIdentifierMiddleware, controller.removeCoupon);

  // --- Rotas do Carrinho ---

  // Middleware híbrido para identificar o carrinho (logado ou guest)
  router.use(cartIdentifierMiddleware);

  router.get('/', controller.getCart);

  router.post('/items', addItemRules(), validate, controller.addItemToCart);

  router.put('/items/:productId', updateItemRules(), validate, controller.updateItemQuantity);

  router.delete('/items/:productId', removeItemRules(), validate, controller.removeItemFromCart);

  // A rota de merge requer autenticação estrita, por isso tem seu próprio middleware
  router.post('/merge', authMiddleware, mergeCartRules(), validate, controller.mergeCarts);

  return router;
};

// Default export for backward compatibility
export default createCartRoutes(cartController);
