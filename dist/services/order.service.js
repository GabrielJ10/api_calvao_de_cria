"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_repository_1 = __importDefault(require("../repositories/order.repository"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const order_transformer_1 = __importDefault(require("../utils/transformers/order.transformer"));
const listUserOrders = async (userId, queryParams) => {
    const limit = parseInt(queryParams.limit, 10) || 10;
    const page = parseInt(queryParams.page, 10) || 1;
    const skip = (page - 1) * limit;
    const options = { limit, skip, sort: { createdAt: 'desc' } };
    const { orders, total } = await order_repository_1.default.findAllByUserId(userId, options);
    const transformedOrders = orders.map(order_transformer_1.default.transformOrderForCustomer);
    const details = {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
    };
    return { data: transformedOrders, details, message: 'Pedidos retornados com sucesso.' };
};
const getUserOrderDetails = async (userId, orderId) => {
    const order = await order_repository_1.default.findByIdAndUserId(orderId, userId);
    if (!order) {
        throw new AppError_1.default('Pedido não encontrado ou não pertence a este usuário.', 404);
    }
    return {
        data: order_transformer_1.default.transformOrderForCustomer(order),
        message: 'Detalhes do pedido retornados com sucesso.',
    };
};
exports.default = {
    listUserOrders,
    getUserOrderDetails,
};
