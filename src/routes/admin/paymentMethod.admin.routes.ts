import express from 'express';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import paymentMethodAdminController from '../../controllers/admin/paymentMethod.admin.controller';
import {
  createPaymentMethodRules,
  updatePaymentMethodRules,
} from '../../utils/validators/admin/paymentMethod.validator';
import { validate } from '../../utils/validators/auth.validator';

const router = express.Router();

// Aplica segurança de admin para TODAS as rotas neste arquivo
router.use(authMiddleware, restrictTo('admin'));

router
  .route('/')
  .get(paymentMethodAdminController.listPaymentMethods)
  .post(createPaymentMethodRules(), validate, paymentMethodAdminController.createPaymentMethod);

router
  .route('/:methodId')
  .put(updatePaymentMethodRules(), validate, paymentMethodAdminController.updatePaymentMethod);

export default router;
