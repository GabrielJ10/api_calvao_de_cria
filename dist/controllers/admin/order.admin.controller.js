"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_admin_service_1 = __importDefault(require("../../services/admin/order.admin.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const responseBuilder_1 = __importDefault(require("../../utils/responseBuilder"));
const listOrders = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await order_admin_service_1.default.listAllOrders(req.query);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withPagination(result.details)
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
const getOrderDetails = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { orderId } = req.params;
    const result = await order_admin_service_1.default.getOrderDetails(orderId);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
const updateOrder = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { orderId } = req.params;
    const result = await order_admin_service_1.default.updateOrder(orderId, req.body);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
exports.default = {
    listOrders,
    getOrderDetails,
    updateOrder,
};
