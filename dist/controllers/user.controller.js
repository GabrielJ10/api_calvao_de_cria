"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../services/user.service"));
const address_service_1 = __importDefault(require("../services/address.service"));
const order_service_1 = __importDefault(require("../services/order.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const responseBuilder_1 = __importDefault(require("../utils/responseBuilder"));
const getMyProfile = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await user_service_1.default.getUserProfile(req.user.id);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message || '')
        .withData(result.user)
        .withDetails(result.details)
        .build();
    res.status(200).json(response);
});
const updateMyProfile = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await user_service_1.default.updateUserProfile(req.user.id, req.body);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(200).json(response);
});
const changeMyPassword = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await user_service_1.default.changePassword(req.user.id, req.body.password);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.user) // Fixed: result.user was null in service, check consistency
        .withDetails(result.details)
        .build();
    res.status(200).json(response);
});
const listMyAddresses = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await address_service_1.default.listAddressesSummary(req.user.id);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withExtra('totalItems', result.details.totalItens)
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
const getMyAddressDetails = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { addressId } = req.params;
    const result = await address_service_1.default.getAddressDetails(addressId, req.user.id);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(200).json(response);
});
const addMyAddress = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await address_service_1.default.addAddress(req.user.id, req.body);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(201).json(response);
});
const updateMyAddress = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { addressId } = req.params;
    const result = await address_service_1.default.updateAddress(addressId, req.user.id, req.body);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(200).json(response);
});
const deleteMyAddress = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { addressId } = req.params;
    const result = await address_service_1.default.removeAddress(addressId, req.user.id);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(200).json(response);
});
const listMyOrders = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await order_service_1.default.listUserOrders(req.user.id, req.query);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withPagination(result.details)
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
const getMyOrderDetails = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { orderId } = req.params;
    const result = await order_service_1.default.getUserOrderDetails(req.user.id, orderId);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
exports.default = {
    getMyProfile,
    updateMyProfile,
    changeMyPassword,
    listMyAddresses,
    getMyAddressDetails,
    addMyAddress,
    updateMyAddress,
    deleteMyAddress,
    listMyOrders,
    getMyOrderDetails,
};
