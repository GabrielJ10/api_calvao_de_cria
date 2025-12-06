"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cart_model_1 = __importDefault(require("../models/cart.model"));
/**
 * Encontra um carrinho pelo seu identificador (userId ou guestCartId).
 */
const findByIdentifier = async ({ userId, guestCartId }) => {
    if (userId) {
        return cart_model_1.default.findOne({ userId });
    }
    if (guestCartId) {
        return cart_model_1.default.findOne({ guestCartId });
    }
    return null;
};
/**
 * Encontra um carrinho pelo ID de convidado.
 */
const findByGuestCartId = async (guestCartId) => {
    return cart_model_1.default.findOne({ guestCartId });
};
/**
 * Cria um novo carrinho no banco de dados.
 */
const create = async (cartData) => {
    return cart_model_1.default.create(cartData);
};
/**
 * Deleta um carrinho de convidado pelo seu ID.
 */
const deleteByGuestCartId = async (guestCartId) => {
    return cart_model_1.default.deleteOne({ guestCartId });
};
exports.default = {
    findByIdentifier,
    findByGuestCartId,
    create,
    deleteByGuestCartId,
};
