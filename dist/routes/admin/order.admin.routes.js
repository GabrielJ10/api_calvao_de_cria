"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const order_admin_controller_1 = __importDefault(require("../../controllers/admin/order.admin.controller"));
const order_validator_1 = require("../../utils/validators/admin/order.validator");
const auth_validator_1 = require("../../utils/validators/auth.validator");
const router = express_1.default.Router();
// Aplica segurança de admin para TODAS as rotas neste arquivo
router.use(auth_middleware_1.authMiddleware, (0, auth_middleware_1.restrictTo)('admin'));
router.route('/').get(order_admin_controller_1.default.listOrders);
router
    .route('/:orderId')
    .get(order_admin_controller_1.default.getOrderDetails)
    .patch((0, order_validator_1.updateOrderRules)(), auth_validator_1.validate, order_admin_controller_1.default.updateOrder);
exports.default = router;
