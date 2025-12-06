"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paymentMethod_model_1 = __importDefault(require("../models/paymentMethod.model"));
/**
 * Retorna todos os métodos de pagamento ativos para os clientes.
 */
const findAllEnabled = async () => {
    return paymentMethod_model_1.default.find({ isEnabled: true }).sort({ name: 1 });
};
/**
 * Retorna todos os métodos de pagamento para o painel de admin.
 */
const findAll = async () => {
    return paymentMethod_model_1.default.find().sort({ name: 1 });
};
/**
 * [ADMIN] Encontra um método de pagamento pelo seu ID.
 */
const findById = async (id) => {
    return paymentMethod_model_1.default.findById(id);
};
/**
 * [ADMIN] Encontra um método de pagamento pelo seu identificador único.
 */
const findByIdentifier = async (identifier) => {
    return paymentMethod_model_1.default.findOne({ identifier });
};
/**
 * [ADMIN] Cria um novo método de pagamento.
 */
const create = async (data) => {
    return paymentMethod_model_1.default.create(data);
};
/**
 * [ADMIN] Atualiza um método de pagamento pelo seu ID.
 */
const updateById = async (id, updateData) => {
    return paymentMethod_model_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};
exports.default = {
    findAllEnabled,
    findAll,
    findById,
    findByIdentifier,
    create,
    updateById,
};
