import express, { Router } from 'express';
import userController, { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../utils/validators/auth.validator';
import { updateProfileRules, changePasswordRules } from '../utils/validators/user.validator';
import {
  createAddressRules,
  updateAddressRules,
  getAddressDetailsRules,
  deleteAddressRules,
} from '../utils/validators/address.validator';
import { mongoIdRule } from '../utils/validators/validation.utils';

/**
 * Factory function to create user routes with injected controller.
 * Used for Top-Down testing where we can inject mocked controllers.
 */
export const createUserRoutes = (controller: UserController): Router => {
  const router = express.Router();

  router.use(authMiddleware);

  // --- ROTAS DE PERFIL ---
  router.get('/me', controller.getMyProfile);
  router.patch('/me', updateProfileRules(), validate, controller.updateMyProfile);
  router.put('/me/password', changePasswordRules(), validate, controller.changeMyPassword);

  // --- ROTAS DE ENDEREÇO ---
  router
    .route('/me/addresses')
    .get(controller.listMyAddresses)
    .post(createAddressRules(), validate, controller.addMyAddress);

  router
    .route('/me/addresses/:addressId')
    .get(getAddressDetailsRules(), validate, controller.getMyAddressDetails)
    .patch(updateAddressRules(), validate, controller.updateMyAddress)
    .delete(deleteAddressRules(), validate, controller.deleteMyAddress);

  // --- ROTAS DE PEDIDOS ---
  router.get('/me/orders', controller.listMyOrders);
  router.get(
    '/me/orders/:orderId',
    mongoIdRule('orderId', 'ID de pedido inválido.'),
    validate,
    controller.getMyOrderDetails
  );

  return router;
};

// Default export for backward compatibility
export default createUserRoutes(userController);
