"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const responseBuilder_1 = __importDefault(require("../utils/responseBuilder"));
const register = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await auth_service_1.default.register(req.body);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message || '')
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(201).json(response);
});
const login = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await auth_service_1.default.login(req.body.email, req.body.password);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message || '')
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(200).json(response);
});
const logout = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await auth_service_1.default.logout(req.user.id);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message || '')
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(200).json(response);
});
const refreshToken = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await auth_service_1.default.refreshAccessToken(req.body.refreshToken);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message || '')
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(200).json(response);
});
const forgotPassword = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await auth_service_1.default.forgotPassword(req.body.email, req.protocol, req.get('host'));
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result?.message)
        .withData(result?.data)
        .withDetails(result?.details)
        .build();
    res.status(200).json(response);
});
const resetPassword = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { resetToken } = req.params;
    const result = await auth_service_1.default.resetPassword(resetToken, req.body.password);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(200).json(response);
});
exports.default = {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
};
