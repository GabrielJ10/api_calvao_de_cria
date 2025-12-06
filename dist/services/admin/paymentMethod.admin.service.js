"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paymentMethod_repository_1 = __importDefault(require("../../repositories/paymentMethod.repository"));
const AppError_1 = __importDefault(require("../../utils/AppError"));
const listPaymentMethods = async () => {
    const methods = await paymentMethod_repository_1.default.findAll();
    return { data: methods, message: 'Métodos de pagamento retornados com sucesso.' };
};
const createPaymentMethod = async (data) => {
    const newMethod = await paymentMethod_repository_1.default.create(data);
    return { data: newMethod, message: 'Método de pagamento criado com sucesso.' };
};
const updatePaymentMethod = async (methodId, updateData) => {
    // Proíbe a alteração do campo 'identifier' após a criação
    if (updateData.identifier) {
        throw new AppError_1.default('O identificador não pode ser alterado após a criação.', 400);
    }
    const method = await paymentMethod_repository_1.default.updateById(methodId, updateData);
    if (!method) {
        throw new AppError_1.default('Método de pagamento não encontrado.', 404);
    }
    return { data: method, message: 'Método de pagamento atualizado com sucesso.' };
};
exports.default = {
    listPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
};
