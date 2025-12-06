"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const address_repository_1 = __importDefault(require("../repositories/address.repository"));
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../utils/AppError"));
const address_transformer_1 = __importDefault(require("../utils/transformers/address.transformer"));
const addAddress = async (userId, addressData) => {
    const address = await address_repository_1.default.createAddress({
        ...addressData,
        userId: new mongoose_1.Types.ObjectId(userId),
    });
    return {
        data: address_transformer_1.default.detailed(address),
        message: 'Endereço adicionado com sucesso.',
        details: null,
    };
};
const listAddressesSummary = async (userId) => {
    const addresses = await address_repository_1.default.findAllAddressesByUserIdSummary(userId);
    const quantity = addresses.length;
    return {
        data: addresses.map(address_transformer_1.default.detailed),
        message: `Endereços retornados com sucesso`,
        details: { totalItens: quantity },
    };
};
const getAddressDetails = async (addressId, userId) => {
    const address = await address_repository_1.default.findAddressByIdAndUserIdDetail(addressId, userId);
    if (!address)
        throw new AppError_1.default('Endereço não encontrado ou não pertence a este usuário.', 404);
    return {
        data: address_transformer_1.default.detailed(address),
        message: 'Detalhes do endereço obtidos com sucesso.',
        details: null,
    };
};
const updateAddress = async (addressId, userId, updateData) => {
    const address = await address_repository_1.default.updateAddress(addressId, userId, updateData);
    if (!address)
        throw new AppError_1.default('Endereço não encontrado ou não pertence a este usuário.', 404);
    return {
        data: address_transformer_1.default.detailed(address),
        message: 'Endereço atualizado com sucesso.',
        details: null,
    };
};
const removeAddress = async (addressId, userId) => {
    const deleted = await address_repository_1.default.deleteAddress(addressId, userId);
    if (!deleted)
        throw new AppError_1.default('Endereço não encontrado ou não pertence a este usuário.', 404);
    return {
        data: null,
        message: 'Endereço removido com sucesso.',
        details: null,
    };
};
exports.default = {
    addAddress,
    listAddressesSummary,
    getAddressDetails,
    updateAddress,
    removeAddress,
};
