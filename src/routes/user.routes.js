const express = require('express');
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validate } = require('../utils/validators/auth.validator');
const { updateProfileRules, changePasswordRules } = require('../utils/validators/user.validator');
const {
  createAddressRules,
  updateAddressRules,
  getAddressDetailsRules,
  deleteAddressRules,
} = require('../utils/validators/address.validator');
const { mongoIdRule } = require('../utils/validators/validation.utils'); 

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
router.get('/me/orders', userController.listMyOrders); // [cite: 161, 162]
router.get('/me/orders/:orderId', mongoIdRule('orderId', 'ID de pedido inválido.'), validate, userController.getMyOrderDetails); // [cite: 200, 201]

module.exports = router;
