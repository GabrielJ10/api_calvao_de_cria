import express, { Router } from 'express';
import checkoutController, { CheckoutController } from '../controllers/checkout.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../utils/validators/auth.validator';
import { previewCouponRules, checkoutRules } from '../utils/validators/checkout.validator';

/**
 * Factory function to create checkout routes with injected controller.
 * Used for Top-Down testing where we can inject mocked controllers.
 */
export const createCheckoutRoutes = (controller: CheckoutController): Router => {
  const router = express.Router();

  // Rota pública para listar métodos de pagamento
  router.get('/payment-methods', controller.getPaymentMethods);

  // A partir daqui, todas as rotas exigem autenticação
  router.use(authMiddleware);

  router.post('/checkout/preview', previewCouponRules(), validate, controller.previewCoupon);
  router.post('/checkout', checkoutRules(), validate, controller.createOrder);

  return router;
};

// Default export for backward compatibility
export default createCheckoutRoutes(checkoutController);
