import express, { Router } from 'express';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import paymentMethodAdminController, {
  PaymentMethodAdminController,
} from '../../controllers/admin/paymentMethod.admin.controller';
import {
  createPaymentMethodRules,
  updatePaymentMethodRules,
} from '../../utils/validators/admin/paymentMethod.validator';
import { validate } from '../../utils/validators/auth.validator';

/**
 * Factory function to create payment method admin routes with injected controller.
 * Used for Top-Down testing where we can inject mocked controllers.
 */
export const createPaymentMethodAdminRoutes = (
  controller: PaymentMethodAdminController
): Router => {
  const router = express.Router();

  // Aplica segurança de admin para TODAS as rotas neste arquivo
  router.use(authMiddleware, restrictTo('admin'));

  router
    .route('/')
    .get(controller.listPaymentMethods)
    .post(createPaymentMethodRules(), validate, controller.createPaymentMethod);

  router
    .route('/:methodId')
    .put(updatePaymentMethodRules(), validate, controller.updatePaymentMethod);

  return router;
};

// Default export for backward compatibility
export default createPaymentMethodAdminRoutes(paymentMethodAdminController);
