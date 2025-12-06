"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_admin_service_1 = __importDefault(require("../../services/admin/user.admin.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const responseBuilder_1 = __importDefault(require("../../utils/responseBuilder"));
const listCustomers = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await user_admin_service_1.default.listCustomers(req.query);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withPagination(result.details)
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
const getCustomerDetails = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { userId } = req.params;
    const result = await user_admin_service_1.default.getCustomerDetails360(userId);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
const forcePasswordReset = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { userId } = req.params;
    const result = await user_admin_service_1.default.forcePasswordResetForUser(userId, req.protocol, req.get('host'));
    const response = new responseBuilder_1.default().withStatus('success').withMessage(result.message).build();
    res.status(200).json(response);
});
exports.default = {
    listCustomers,
    getCustomerDetails,
    forcePasswordReset,
};
