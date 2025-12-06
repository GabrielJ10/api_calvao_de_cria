"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coupon_admin_service_1 = __importDefault(require("../../services/admin/coupon.admin.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const responseBuilder_1 = __importDefault(require("../../utils/responseBuilder"));
const listCoupons = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await coupon_admin_service_1.default.listCoupons(req.query);
    res
        .status(200)
        .json(new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withPagination(result.details)
        .withData(result.data)
        .build());
});
const createCoupon = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await coupon_admin_service_1.default.createCoupon(req.body);
    res
        .status(201)
        .json(new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build());
});
const getCouponDetails = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { couponId } = req.params;
    const result = await coupon_admin_service_1.default.getCouponDetails(couponId);
    res
        .status(200)
        .json(new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build());
});
const updateCoupon = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { couponId } = req.params;
    const result = await coupon_admin_service_1.default.updateCoupon(couponId, req.body);
    res
        .status(200)
        .json(new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build());
});
const deleteCoupon = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { couponId } = req.params;
    await coupon_admin_service_1.default.deleteCoupon(couponId);
    res.status(204).send();
});
exports.default = {
    listCoupons,
    createCoupon,
    getCouponDetails,
    updateCoupon,
    deleteCoupon,
};
