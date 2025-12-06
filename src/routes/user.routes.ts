import express from 'express';
import userController from '../controllers/user.controller';
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

const router = express.Router();

router.use(authMiddleware);

// --- ROTAS DE PERFIL ---
router.get('/me', userController.getMyProfile);
router.patch('/me', updateProfileRules(), validate, userController.updateMyProfile);
router.put('/me/password', changePasswordRules(), validate, userController.changeMyPassword);

// --- ROTAS DE ENDEREÇO ---
router
  .route('/me/addresses')
  .get(userController.listMyAddresses)
  .post(createAddressRules(), validate, userController.addMyAddress);

router
  .route('/me/addresses/:addressId')
  .get(getAddressDetailsRules(), validate, userController.getMyAddressDetails)
  .patch(updateAddressRules(), validate, userController.updateMyAddress)
  .delete(deleteAddressRules(), validate, userController.deleteMyAddress);

// --- ROTAS DE PEDIDOS ---
router.get('/me/orders', userController.listMyOrders);
router.get(
  '/me/orders/:orderId',
  mongoIdRule('orderId', 'ID de pedido inválido.'),
  validate,
  userController.getMyOrderDetails
);

export default router;
