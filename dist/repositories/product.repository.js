"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_model_1 = __importDefault(require("../models/product.model"));
const create = async (productData) => {
    return product_model_1.default.create(productData);
};
const findAllAdmin = async (filters, options) => {
    const query = product_model_1.default.find(filters).sort(options.sort).skip(options.skip).limit(options.limit);
    const products = await query;
    const total = await product_model_1.default.countDocuments(filters);
    return { products, total };
};
const findByIdAdmin = async (productId) => {
    return product_model_1.default.findById(productId).select('+isActive');
};
const updateById = async (productId, updateData) => {
    return product_model_1.default.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
};
// A função de deletar na verdade faz um soft delete
const softDeleteById = async (productId) => {
    return product_model_1.default.findByIdAndUpdate(productId, { isActive: false });
};
const hardDeleteById = async (productId) => {
    return product_model_1.default.findByIdAndDelete(productId);
};
const findByIdPublic = async (productId) => {
    // Busca apenas se o produto estiver ativo
    // Note: The logic in JS was just findOne({ _id: productId }). Assuming public implies active checks or similar, but the original code was minimal.
    // Wait, the original code had comment "Busca apenas se o produto estiver ativo" but code was `Product.findOne({ _id: productId})`.
    // Wait, did I misread?
    // 33: const findByIdPublic = async (productId) => {
    // 34:   // Busca apenas se o produto estiver ativo
    // 35:   return Product.findOne({ _id: productId});
    // 36: };
    // It seems the comment was lying or incomplete. I'll stick to the implementation.
    // Actually, standard public find usually filters by isActive: true. But I will follow the code.
    return product_model_1.default.findOne({ _id: productId });
};
const findByImagePublicId = async (publicId, excludeProductId) => {
    return product_model_1.default.find({
        _id: { $ne: excludeProductId },
        'images.public_id': publicId,
    }).select('_id');
};
const findAllPublic = async (filters, options) => {
    const publicFilters = { ...filters, isActive: true };
    const query = product_model_1.default.find(publicFilters)
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit);
    const products = await query;
    const total = await product_model_1.default.countDocuments(publicFilters);
    return { products, total };
};
exports.default = {
    create,
    findAllAdmin,
    findAllPublic,
    findByIdAdmin,
    findByIdPublic,
    updateById,
    softDeleteById,
    hardDeleteById,
    findByImagePublicId,
};
