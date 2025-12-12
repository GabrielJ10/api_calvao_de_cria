import express, { Router } from 'express';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import userAdminController, {
  UserAdminController,
} from '../../controllers/admin/user.admin.controller';

/**
 * Factory function to create user admin routes with injected controller.
 * Used for Top-Down testing where we can inject mocked controllers.
 */
export const createUserAdminRoutes = (controller: UserAdminController): Router => {
  const router = express.Router();

  // Aplica segurança de admin para TODAS as rotas neste arquivo
  router.use(authMiddleware, restrictTo('admin'));

  router.route('/').get(controller.listCustomers);

  router.route('/:userId').get(controller.getCustomerDetails);

  router.route('/:userId/force-password-reset').post(controller.forcePasswordReset);

  return router;
};

// Default export for backward compatibility
export default createUserAdminRoutes(userAdminController);
