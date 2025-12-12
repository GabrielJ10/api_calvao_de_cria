import express, { Router } from 'express';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import orderAdminController, {
  OrderAdminController,
} from '../../controllers/admin/order.admin.controller';
import { updateOrderRules } from '../../utils/validators/admin/order.validator';
import { validate } from '../../utils/validators/auth.validator';

/**
 * Factory function to create order admin routes with injected controller.
 * Used for Top-Down testing where we can inject mocked controllers.
 */
export const createOrderAdminRoutes = (controller: OrderAdminController): Router => {
  const router = express.Router();

  // Aplica segurança de admin para TODAS as rotas neste arquivo
  router.use(authMiddleware, restrictTo('admin'));

  router.route('/').get(controller.listOrders);

  router
    .route('/:orderId')
    .get(controller.getOrderDetails)
    .patch(updateOrderRules(), validate, controller.updateOrder);

  return router;
};

// Default export for backward compatibility
export default createOrderAdminRoutes(orderAdminController);
