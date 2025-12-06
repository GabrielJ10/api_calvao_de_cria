"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paymentMethod_admin_service_1 = __importDefault(require("../../services/admin/paymentMethod.admin.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const responseBuilder_1 = __importDefault(require("../../utils/responseBuilder"));
const listPaymentMethods = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await paymentMethod_admin_service_1.default.listPaymentMethods();
    res
        .status(200)
        .json(new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build());
});
const createPaymentMethod = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await paymentMethod_admin_service_1.default.createPaymentMethod(req.body);
    res
        .status(201)
        .json(new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build());
});
const updatePaymentMethod = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { methodId } = req.params;
    const result = await paymentMethod_admin_service_1.default.updatePaymentMethod(methodId, req.body);
    res
        .status(200)
        .json(new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build());
});
exports.default = {
    listPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
};
