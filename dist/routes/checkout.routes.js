"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkout_controller_1 = __importDefault(require("../controllers/checkout.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_validator_1 = require("../utils/validators/auth.validator");
const checkout_validator_1 = require("../utils/validators/checkout.validator");
const router = express_1.default.Router();
// Rota pública para listar métodos de pagamento
router.get('/payment-methods', checkout_controller_1.default.getPaymentMethods);
// A partir daqui, todas as rotas exigem autenticação
router.use(auth_middleware_1.authMiddleware);
router.post('/checkout/preview', (0, checkout_validator_1.previewCouponRules)(), auth_validator_1.validate, checkout_controller_1.default.previewCoupon);
router.post('/checkout', (0, checkout_validator_1.checkoutRules)(), auth_validator_1.validate, checkout_controller_1.default.createOrder);
exports.default = router;
