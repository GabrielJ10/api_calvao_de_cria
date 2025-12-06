"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const paymentMethod_admin_controller_1 = __importDefault(require("../../controllers/admin/paymentMethod.admin.controller"));
const paymentMethod_validator_1 = require("../../utils/validators/admin/paymentMethod.validator");
const auth_validator_1 = require("../../utils/validators/auth.validator");
const router = express_1.default.Router();
// Aplica segurança de admin para TODAS as rotas neste arquivo
router.use(auth_middleware_1.authMiddleware, (0, auth_middleware_1.restrictTo)('admin'));
router
    .route('/')
    .get(paymentMethod_admin_controller_1.default.listPaymentMethods)
    .post((0, paymentMethod_validator_1.createPaymentMethodRules)(), auth_validator_1.validate, paymentMethod_admin_controller_1.default.createPaymentMethod);
router
    .route('/:methodId')
    .put((0, paymentMethod_validator_1.updatePaymentMethodRules)(), auth_validator_1.validate, paymentMethod_admin_controller_1.default.updatePaymentMethod);
exports.default = router;
