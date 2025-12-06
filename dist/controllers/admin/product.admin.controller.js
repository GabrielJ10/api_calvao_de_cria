"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_admin_service_1 = __importDefault(require("../../services/admin/product.admin.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const responseBuilder_1 = __importDefault(require("../../utils/responseBuilder"));
const createNewProduct = (0, asyncHandler_1.default)(async (req, res, next) => {
    const files = req.files;
    const result = await product_admin_service_1.default.createProduct(req.body, files);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withDetails(result.details)
        .withMessage(result.message)
        .withData(result.data)
        .build();
    res.status(201).json(response);
});
const getAllProducts = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await product_admin_service_1.default.listProducts(req.query);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withDetails(result.details)
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
const getOneProduct = (0, asyncHandler_1.default)(async (req, res, next) => {
    const result = await product_admin_service_1.default.productDetails(req.params.productId);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .withDetails(null)
        .build();
    res.status(200).json(response);
});
const updateExistingProduct = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { productId } = req.params;
    const result = await product_admin_service_1.default.updateProduct(productId, req.body);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(200).json(response);
});
const deleteExistingProduct = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { productId } = req.params;
    const result = await product_admin_service_1.default.deleteProduct(productId);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage('Produto deletado com sucesso.') // Fixed null message to string or handle null in builder
        .withData(result.data)
        .withDetails(result.details)
        .build();
    res.status(204).json(response);
});
const addProductImages = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { productId } = req.params;
    const files = req.files;
    const result = await product_admin_service_1.default.addProductImages(productId, req.body, files);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build();
    res.status(201).json(response);
});
const updateProductImages = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { productId } = req.params;
    const result = await product_admin_service_1.default.updateProductImages(productId, req.body);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
const deleteProductImages = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { productId } = req.params;
    const result = await product_admin_service_1.default.deleteProductImages(productId, req.body);
    const response = new responseBuilder_1.default()
        .withStatus('success')
        .withMessage('Imagens deletadas com sucesso.') // Fixed null message
        .withData(result.data)
        .build();
    res.status(200).json(response);
});
exports.default = {
    createNewProduct,
    getAllProducts,
    getOneProduct,
    updateExistingProduct,
    deleteExistingProduct,
    addProductImages,
    updateProductImages,
    deleteProductImages,
};
