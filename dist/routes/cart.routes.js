"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_controller_1 = __importDefault(require("../controllers/cart.controller"));
const auth_validator_1 = require("../utils/validators/auth.validator");
const cart_validator_1 = require("../utils/validators/cart.validator");
const cart_middleware_1 = require("../middlewares/cart.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// --- Rotas de Cupom ---
// A aplicação de cupom exige um carrinho (logado ou guest), por isso usa o middleware híbrido.
router.post('/coupon', cart_middleware_1.cartIdentifierMiddleware, (0, cart_validator_1.applyCouponRules)(), auth_validator_1.validate, cart_controller_1.default.applyCoupon);
router.delete('/coupon', cart_middleware_1.cartIdentifierMiddleware, cart_controller_1.default.removeCoupon);
// --- Rotas do Carrinho ---
// Middleware híbrido para identificar o carrinho (logado ou guest)
router.use(cart_middleware_1.cartIdentifierMiddleware);
router.get('/', cart_controller_1.default.getCart);
router.post('/items', (0, cart_validator_1.addItemRules)(), auth_validator_1.validate, cart_controller_1.default.addItemToCart);
router.put('/items/:productId', (0, cart_validator_1.updateItemRules)(), auth_validator_1.validate, cart_controller_1.default.updateItemQuantity);
router.delete('/items/:productId', (0, cart_validator_1.removeItemRules)(), auth_validator_1.validate, cart_controller_1.default.removeItemFromCart);
// A rota de merge requer autenticação estrita, por isso tem seu próprio middleware
router.post('/merge', auth_middleware_1.authMiddleware, (0, cart_validator_1.mergeCartRules)(), auth_validator_1.validate, cart_controller_1.default.mergeCarts);
exports.default = router;
