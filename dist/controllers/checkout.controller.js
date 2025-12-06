"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const checkout_service_1 = __importDefault(require("../services/checkout.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const responseBuilder_1 = __importDefault(require("../utils/responseBuilder"));
const getPaymentMethods = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await checkout_service_1.default.getPaymentMethods();
    const response = new responseBuilder_1.default().withStatus('success').withData(result.data).build();
    res.status(200).json(response);
});
const previewCoupon = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { couponCode } = req.body;
    const result = await checkout_service_1.default.previewCoupon(req.user.id, couponCode);
    const response = new responseBuilder_1.default().withStatus('success').withData(result.data).build();
    res.status(200).json(response);
});
const createOrder = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await checkout_service_1.default.createOrder(req.user.id, req.body);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build();
    res.status(201).json(response);
});
exports.default = {
    getPaymentMethods,
    previewCoupon,
    createOrder,
};
