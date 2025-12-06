import express from 'express';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import orderAdminController from '../../controllers/admin/order.admin.controller';
import { updateOrderRules } from '../../utils/validators/admin/order.validator';
import { validate } from '../../utils/validators/auth.validator';

const router = express.Router();

// Aplica segurança de admin para TODAS as rotas neste arquivo
router.use(authMiddleware, restrictTo('admin'));

router.route('/').get(orderAdminController.listOrders);

router
  .route('/:orderId')
  .get(orderAdminController.getOrderDetails)
  .patch(updateOrderRules(), validate, orderAdminController.updateOrder);

export default router;
