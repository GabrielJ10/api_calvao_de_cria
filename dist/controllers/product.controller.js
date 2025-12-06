"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_service_1 = __importDefault(require("../services/product.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const responseBuilder_1 = __importDefault(require("../utils/responseBuilder"));
const getAllProducts = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await product_service_1.default.listPublicProducts(req.query);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withDetails(result.details)
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
const getOneProduct = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await product_service_1.default.getPublicProductDetails(req.params.productId);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage('Detalhes do produto retornados com sucesso.')
        .withData(result.data)
        .withDetails(null)
        .build();
    res.status(200).json(response);
});
exports.default = {
    getAllProducts,
    getOneProduct,
};
