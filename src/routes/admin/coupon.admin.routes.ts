import express, { Router } from 'express';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import couponAdminController, {
  CouponAdminController,
} from '../../controllers/admin/coupon.admin.controller';
import {
  createCouponRules,
  updateCouponRules,
} from '../../utils/validators/admin/coupon.validator';
import { validate } from '../../utils/validators/auth.validator';

/**
 * Factory function to create coupon admin routes with injected controller.
 * Used for Top-Down testing where we can inject mocked controllers.
 */
export const createCouponAdminRoutes = (controller: CouponAdminController): Router => {
  const router = express.Router();

  // Aplica segurança de admin para TODAS as rotas neste arquivo
  router.use(authMiddleware, restrictTo('admin'));

  router
    .route('/')
    .get(controller.listCoupons)
    .post(createCouponRules(), validate, controller.createCoupon);

  router
    .route('/:couponId')
    .get(controller.getCouponDetails)
    .put(updateCouponRules(), validate, controller.updateCoupon)
    .delete(controller.deleteCoupon);

  return router;
};

// Default export for backward compatibility
export default createCouponAdminRoutes(couponAdminController);
