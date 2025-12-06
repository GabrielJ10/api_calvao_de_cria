import express from 'express';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import couponAdminController from '../../controllers/admin/coupon.admin.controller';
import {
  createCouponRules,
  updateCouponRules,
} from '../../utils/validators/admin/coupon.validator';
import { validate } from '../../utils/validators/auth.validator';

const router = express.Router();

// Aplica segurança de admin para TODAS as rotas neste arquivo
router.use(authMiddleware, restrictTo('admin'));

router
  .route('/')
  .get(couponAdminController.listCoupons)
  .post(createCouponRules(), validate, couponAdminController.createCoupon);

router
  .route('/:couponId')
  .get(couponAdminController.getCouponDetails)
  .put(updateCouponRules(), validate, couponAdminController.updateCoupon)
  .delete(couponAdminController.deleteCoupon);

export default router;
