"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const address_model_1 = __importDefault(require("../models/address.model"));
const createAddress = async (addressData) => {
    return address_model_1.default.create(addressData);
};
// Retorna apenas os campos necessários para a listagem
const findAllAddressesByUserIdSummary = async (userId) => {
    const summaryFields = 'alias street number city neighborhood';
    return address_model_1.default.find({ userId });
    // .select(summaryFields);
};
// Retorna todos os campos de um endereço específico
const findAddressByIdAndUserIdDetail = async (addressId, userId) => {
    return address_model_1.default.findOne({ _id: addressId, userId });
};
const updateAddress = async (addressId, userId, updateData) => {
    return address_model_1.default.findOneAndUpdate({ _id: addressId, userId }, updateData, {
        new: true,
        runValidators: true,
    });
};
const deleteAddress = async (addressId, userId) => {
    return address_model_1.default.findOneAndDelete({ _id: addressId, userId });
};
exports.default = {
    createAddress,
    findAllAddressesByUserIdSummary,
    findAddressByIdAndUserIdDetail,
    updateAddress,
    deleteAddress,
};
