"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cart_service_1 = __importDefault(require("../services/cart.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const responseBuilder_1 = __importDefault(require("../utils/responseBuilder"));
const getCart = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { data } = await cart_service_1.default.getCart(req.cartIdentifier);
    const response = new responseBuilder_1.default().withData(data).build();
    res.status(200).json(response);
});
const addItemToCart = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { data, newGuestCartId, details } = await cart_service_1.default.addItemToCart(req.cartIdentifier, req.body);
    const responseBuilder = new responseBuilder_1.default().withData(data);
    if (newGuestCartId) {
        // Retorna no header e no body, conforme solicitado
        res.setHeader('X-Guest-Cart-Id-Created', newGuestCartId);
        responseBuilder.withExtra('guestCartId', newGuestCartId);
    }
    if (details) {
        responseBuilder.withDetails(details);
    }
    res.status(200).json(responseBuilder.build());
});
const updateItemQuantity = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const { data, details } = await cart_service_1.default.updateItemQuantity(req.cartIdentifier, productId, quantity);
    const responseBuilder = new responseBuilder_1.default().withData(data);
    if (details) {
        responseBuilder.withDetails(details);
    }
    res.status(200).json(responseBuilder.build());
});
const removeItemFromCart = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { productId } = req.params;
    const { data, details } = await cart_service_1.default.removeItemFromCart(req.cartIdentifier, productId);
    const responseBuilder = new responseBuilder_1.default().withData(data);
    if (details) {
        responseBuilder.withDetails(details);
    }
    res.status(200).json(responseBuilder.build());
});
const mergeCarts = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { guestCartId } = req.body;
    const { data } = await cart_service_1.default.mergeCarts(req.user.id, guestCartId);
    res.status(200).json(new responseBuilder_1.default().withData(data).build());
});
const applyCoupon = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { couponCode } = req.body;
    const { data } = await cart_service_1.default.applyCoupon(req.cartIdentifier, couponCode);
    res
        .status(200)
        .json(new responseBuilder_1.default().withData(data).withMessage('Cupom aplicado com sucesso.').build());
});
const removeCoupon = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { data } = await cart_service_1.default.removeCoupon(req.cartIdentifier);
    res
        .status(200)
        .json(new responseBuilder_1.default().withData(data).withMessage('Cupom removido com sucesso.').build());
});
exports.default = {
    getCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    mergeCarts,
    applyCoupon,
    removeCoupon,
};
