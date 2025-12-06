"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const coupon_admin_controller_1 = __importDefault(require("../../controllers/admin/coupon.admin.controller"));
const coupon_validator_1 = require("../../utils/validators/admin/coupon.validator");
const auth_validator_1 = require("../../utils/validators/auth.validator");
const router = express_1.default.Router();
// Aplica segurança de admin para TODAS as rotas neste arquivo
router.use(auth_middleware_1.authMiddleware, (0, auth_middleware_1.restrictTo)('admin'));
router
    .route('/')
    .get(coupon_admin_controller_1.default.listCoupons)
    .post((0, coupon_validator_1.createCouponRules)(), auth_validator_1.validate, coupon_admin_controller_1.default.createCoupon);
router
    .route('/:couponId')
    .get(coupon_admin_controller_1.default.getCouponDetails)
    .put((0, coupon_validator_1.updateCouponRules)(), auth_validator_1.validate, coupon_admin_controller_1.default.updateCoupon)
    .delete(coupon_admin_controller_1.default.deleteCoupon);
exports.default = router;
