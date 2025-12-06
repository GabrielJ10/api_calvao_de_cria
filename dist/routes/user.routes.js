"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_validator_1 = require("../utils/validators/auth.validator");
const user_validator_1 = require("../utils/validators/user.validator");
const address_validator_1 = require("../utils/validators/address.validator");
const validation_utils_1 = require("../utils/validators/validation.utils");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
// --- ROTAS DE PERFIL ---
router.get('/me', user_controller_1.default.getMyProfile);
router.patch('/me', (0, user_validator_1.updateProfileRules)(), auth_validator_1.validate, user_controller_1.default.updateMyProfile);
router.put('/me/password', (0, user_validator_1.changePasswordRules)(), auth_validator_1.validate, user_controller_1.default.changeMyPassword);
// --- ROTAS DE ENDEREÇO ---
router
    .route('/me/addresses')
    .get(user_controller_1.default.listMyAddresses)
    .post((0, address_validator_1.createAddressRules)(), auth_validator_1.validate, user_controller_1.default.addMyAddress);
router
    .route('/me/addresses/:addressId')
    .get((0, address_validator_1.getAddressDetailsRules)(), auth_validator_1.validate, user_controller_1.default.getMyAddressDetails)
    .patch((0, address_validator_1.updateAddressRules)(), auth_validator_1.validate, user_controller_1.default.updateMyAddress)
    .delete((0, address_validator_1.deleteAddressRules)(), auth_validator_1.validate, user_controller_1.default.deleteMyAddress);
// --- ROTAS DE PEDIDOS ---
router.get('/me/orders', user_controller_1.default.listMyOrders);
router.get('/me/orders/:orderId', (0, validation_utils_1.mongoIdRule)('orderId', 'ID de pedido inválido.'), auth_validator_1.validate, user_controller_1.default.getMyOrderDetails);
exports.default = router;
