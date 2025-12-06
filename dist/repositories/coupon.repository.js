"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coupon_model_1 = __importDefault(require("../models/coupon.model"));
/**
 * [PUBLIC] Encontra um cupom ativo pelo seu código.
 */
const findByCode = async (code) => {
    return coupon_model_1.default.findOne({ code, isActive: true, expiresAt: { $gt: new Date() } });
};
/**
 * [ADMIN] Encontra um cupom pelo código, independentemente do status.
 */
const findByCodeAdmin = async (code) => {
    return coupon_model_1.default.findOne({ code });
};
/**
 * [ADMIN] Cria um novo cupom.
 */
const create = async (couponData) => {
    return coupon_model_1.default.create(couponData);
};
/**
 * [ADMIN] Retorna todos os cupons com filtros e paginação.
 */
const findAll = async (filters, options) => {
    const query = coupon_model_1.default.find(filters).sort(options.sort).skip(options.skip).limit(options.limit);
    const coupons = await query;
    const total = await coupon_model_1.default.countDocuments(filters);
    return { coupons, total };
};
/**
 * [ADMIN] Encontra um cupom pelo seu ID.
 */
const findById = async (id) => {
    return coupon_model_1.default.findById(id);
};
/**
 * [ADMIN] Atualiza um cupom pelo seu ID.
 */
const updateById = async (id, updateData) => {
    return coupon_model_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};
/**
 * [ADMIN] Deleta um cupom pelo seu ID.
 */
const deleteById = async (id) => {
    return coupon_model_1.default.findByIdAndDelete(id);
};
exports.default = {
    findByCode,
    findByCodeAdmin,
    create,
    findAll,
    findById,
    updateById,
    deleteById,
};
