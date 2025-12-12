import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler';

// Controllers
import authController, { AuthController } from './controllers/auth.controller';
import userController, { UserController } from './controllers/user.controller';
import productController, { ProductController } from './controllers/product.controller';
import cartController, { CartController } from './controllers/cart.controller';
import checkoutController, { CheckoutController } from './controllers/checkout.controller';

// Admin Controllers
import productAdminController, {
  ProductAdminController,
} from './controllers/admin/product.admin.controller';
import orderAdminController, {
  OrderAdminController,
} from './controllers/admin/order.admin.controller';
import userAdminController, {
  UserAdminController,
} from './controllers/admin/user.admin.controller';
import couponAdminController, {
  CouponAdminController,
} from './controllers/admin/coupon.admin.controller';
import paymentMethodAdminController, {
  PaymentMethodAdminController,
} from './controllers/admin/paymentMethod.admin.controller';

// Route Factories
import { createAuthRoutes } from './routes/auth.routes';
import { createUserRoutes } from './routes/user.routes';
import { createProductRoutes } from './routes/product.routes';
import { createCartRoutes } from './routes/cart.routes';
import { createCheckoutRoutes } from './routes/checkout.routes';
import { createProductAdminRoutes } from './routes/admin/product.admin.routes';
import { createOrderAdminRoutes } from './routes/admin/order.admin.routes';
import { createUserAdminRoutes } from './routes/admin/user.admin.routes';
import { createCouponAdminRoutes } from './routes/admin/coupon.admin.routes';
import { createPaymentMethodAdminRoutes } from './routes/admin/paymentMethod.admin.routes';

/**
 * Interface for all application dependencies.
 * Used for dependency injection in Top-Down testing.
 */
export interface AppDependencies {
  authController: AuthController;
  userController: UserController;
  productController: ProductController;
  cartController: CartController;
  checkoutController: CheckoutController;
  // Admin controllers
  productAdminController: ProductAdminController;
  orderAdminController: OrderAdminController;
  userAdminController: UserAdminController;
  couponAdminController: CouponAdminController;
  paymentMethodAdminController: PaymentMethodAdminController;
}

/**
 * Factory function to create the Express application with injected dependencies.
 * This enables Top-Down testing by allowing injection of mocked controllers.
 *
 * @param deps - All controller dependencies
 * @returns Configured Express application
 */
export const createApp = (deps: AppDependencies): Express => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  // Public Routes
  app.use('/api/v1/auth', createAuthRoutes(deps.authController));
  app.use('/api/v1/users', createUserRoutes(deps.userController));
  app.use('/api/v1/products', createProductRoutes(deps.productController));
  app.use('/api/v1/cart', createCartRoutes(deps.cartController));
  app.use('/api/v1', createCheckoutRoutes(deps.checkoutController));

  // Admin Routes
  app.use('/api/v1/admin/products', createProductAdminRoutes(deps.productAdminController));
  app.use('/api/v1/admin/orders', createOrderAdminRoutes(deps.orderAdminController));
  app.use('/api/v1/admin/users', createUserAdminRoutes(deps.userAdminController));
  app.use('/api/v1/admin/coupons', createCouponAdminRoutes(deps.couponAdminController));
  app.use(
    '/api/v1/admin/payment-methods',
    createPaymentMethodAdminRoutes(deps.paymentMethodAdminController)
  );

  // Health check route
  app.get('/', (req: Request, res: Response) => {
    res.send('API Calvão de Cria está no ar!');
  });

  // Global error handler middleware
  app.use(errorHandler);

  return app;
};

/**
 * Default dependencies using real controller instances.
 * Used for production and existing tests.
 */
const defaultDependencies: AppDependencies = {
  authController,
  userController,
  productController,
  cartController,
  checkoutController,
  productAdminController,
  orderAdminController,
  userAdminController,
  couponAdminController,
  paymentMethodAdminController,
};

// Default export for backward compatibility
export default createApp(defaultDependencies);
