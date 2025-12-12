import express, { Express } from 'express';
import cors from 'cors';
import { vi } from 'vitest';
import errorHandler from '../../../src/middlewares/errorHandler';

// Route Factories
import { createAuthRoutes } from '../../../src/routes/auth.routes';
import { createUserRoutes } from '../../../src/routes/user.routes';
import { createProductRoutes } from '../../../src/routes/product.routes';
import { createCartRoutes } from '../../../src/routes/cart.routes';
import { createCheckoutRoutes } from '../../../src/routes/checkout.routes';
import { createProductAdminRoutes } from '../../../src/routes/admin/product.admin.routes';
import { createOrderAdminRoutes } from '../../../src/routes/admin/order.admin.routes';
import { createUserAdminRoutes } from '../../../src/routes/admin/user.admin.routes';
import { createCouponAdminRoutes } from '../../../src/routes/admin/coupon.admin.routes';
import { createPaymentMethodAdminRoutes } from '../../../src/routes/admin/paymentMethod.admin.routes';

// Controller Types
import { AuthController } from '../../../src/controllers/auth.controller';
import { UserController } from '../../../src/controllers/user.controller';
import { ProductController } from '../../../src/controllers/product.controller';
import { CartController } from '../../../src/controllers/cart.controller';
import { CheckoutController } from '../../../src/controllers/checkout.controller';
import { ProductAdminController } from '../../../src/controllers/admin/product.admin.controller';
import { OrderAdminController } from '../../../src/controllers/admin/order.admin.controller';
import { UserAdminController } from '../../../src/controllers/admin/user.admin.controller';
import { CouponAdminController } from '../../../src/controllers/admin/coupon.admin.controller';
import { PaymentMethodAdminController } from '../../../src/controllers/admin/paymentMethod.admin.controller';

/**
 * Partial dependencies for minimal app creation.
 * Only include the controllers you need for your test.
 */
export interface PartialAppDependencies {
  authController?: AuthController;
  userController?: UserController;
  productController?: ProductController;
  cartController?: CartController;
  checkoutController?: CheckoutController;
  productAdminController?: ProductAdminController;
  orderAdminController?: OrderAdminController;
  userAdminController?: UserAdminController;
  couponAdminController?: CouponAdminController;
  paymentMethodAdminController?: PaymentMethodAdminController;
}

/**
 * Creates a minimal no-op controller that won't throw errors.
 * Use when you need a placeholder controller for routes you're not testing.
 */
const createNoOpController = () => {
  return new Proxy(
    {},
    {
      get: () =>
        vi.fn((req: any, res: any) => {
          res.status(501).json({ message: 'Not implemented in test' });
        }),
    }
  );
};

/**
 * Creates a minimal Express app with only the provided controllers.
 * Missing controllers are replaced with no-op stubs.
 *
 * @example
 * // Testing only the checkout controller
 * const mockService = { createOrder: vi.fn() };
 * const controller = new CheckoutController(mockService as any);
 * const app = createMinimalApp({ checkoutController: controller });
 *
 * const res = await request(app).post('/api/v1/checkout').send({...});
 */
export const createMinimalApp = (overrides: PartialAppDependencies = {}): Express => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  // Apply routes only if controller is provided, otherwise use no-op
  if (overrides.authController) {
    app.use('/api/v1/auth', createAuthRoutes(overrides.authController));
  }
  if (overrides.userController) {
    app.use('/api/v1/users', createUserRoutes(overrides.userController));
  }
  if (overrides.productController) {
    app.use('/api/v1/products', createProductRoutes(overrides.productController));
  }
  if (overrides.cartController) {
    app.use('/api/v1/cart', createCartRoutes(overrides.cartController));
  }
  if (overrides.checkoutController) {
    app.use('/api/v1', createCheckoutRoutes(overrides.checkoutController));
  }

  // Admin routes
  if (overrides.productAdminController) {
    app.use('/api/v1/admin/products', createProductAdminRoutes(overrides.productAdminController));
  }
  if (overrides.orderAdminController) {
    app.use('/api/v1/admin/orders', createOrderAdminRoutes(overrides.orderAdminController));
  }
  if (overrides.userAdminController) {
    app.use('/api/v1/admin/users', createUserAdminRoutes(overrides.userAdminController));
  }
  if (overrides.couponAdminController) {
    app.use('/api/v1/admin/coupons', createCouponAdminRoutes(overrides.couponAdminController));
  }
  if (overrides.paymentMethodAdminController) {
    app.use(
      '/api/v1/admin/payment-methods',
      createPaymentMethodAdminRoutes(overrides.paymentMethodAdminController)
    );
  }

  // Global error handler
  app.use(errorHandler);

  return app;
};

/**
 * Creates mock service response for testing.
 */
export const createMockServiceResponse = <T>(data: T, message?: string) => ({
  data,
  message: message || 'Success',
  details: null,
});
