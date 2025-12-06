"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const cart_model_1 = __importDefault(require("../models/cart.model"));
/**
 * Cria um pedido, abate o estoque e limpa o carrinho de forma transacional.
 */
const createOrderTransactional = async (orderData) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // 1. Criar o pedido
        const newOrder = new order_model_1.default(orderData);
        await newOrder.save({ session });
        // 2. Abater o estoque de cada produto
        for (const item of newOrder.items) {
            await product_model_1.default.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: -item.quantity } }, { session });
        }
        // 3. Deletar o carrinho antigo
        await cart_model_1.default.deleteOne({ userId: orderData.userId }).session(session);
        // 4. Criar um novo carrinho vazio
        await cart_model_1.default.create([{ userId: orderData.userId }], { session });
        await session.commitTransaction();
        return newOrder;
    }
    catch (error) {
        await session.abortTransaction();
        throw error; // Propaga o erro para o service tratar
    }
    finally {
        session.endSession();
    }
};
/**
 * [ADMIN] Encontra todos os pedidos com filtros, paginação e dados do cliente.
 */
const findAllAdmin = async (filters, options) => {
    const query = order_model_1.default.find(filters)
        .populate('userId', 'name email') // Popula dados do cliente
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit);
    const orders = await query;
    const total = await order_model_1.default.countDocuments(filters);
    return { orders, total };
};
/**
 * [ADMIN] Encontra um pedido pelo ID com os dados do cliente.
 */
const findByIdAdmin = async (orderId) => {
    return order_model_1.default.findById(orderId).populate('userId', 'name email');
};
/**
 * [ADMIN] Atualiza um pedido pelo ID.
 */
const updateByIdAdmin = async (orderId, updateData) => {
    return order_model_1.default.findByIdAndUpdate(orderId, { $set: updateData }, { new: true, runValidators: true });
};
/**
 * [ADMIN] Retorna um resumo dos pedidos de um usuário específico.
 */
const findSummaryByUserId = async (userId) => {
    const orders = await order_model_1.default.find({ userId }).sort({ createdAt: -1 });
    if (orders.length === 0) {
        return {
            totalCount: 0,
            totalValue: 0,
            lastOrders: [],
        };
    }
    const totalValue = orders.reduce((sum, order) => sum + order.totals.total, 0);
    const lastOrders = orders.slice(0, 5).map((order) => ({
        // Retorna os últimos 5
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.totals.total,
        createdAt: order.createdAt,
    }));
    return {
        totalCount: orders.length,
        totalValue,
        lastOrders,
    };
};
const findLastByDatePrefix = async (datePrefix) => {
    return order_model_1.default.findOne({ orderNumber: { $regex: `^${datePrefix}` } }).sort({ orderNumber: -1 });
};
/**
 * [CLIENTE] Encontra todos os pedidos de um usuário com paginação.
 */
const findAllByUserId = async (userId, options) => {
    const filters = { userId };
    const query = order_model_1.default.find(filters).sort(options.sort).skip(options.skip).limit(options.limit);
    const orders = await query;
    const total = await order_model_1.default.countDocuments(filters);
    return { orders, total };
};
/**
 * [CLIENTE] Encontra um pedido específico pelo seu ID e pelo ID do usuário.
 */
const findByIdAndUserId = async (orderId, userId) => {
    return order_model_1.default.findOne({ _id: orderId, userId });
};
exports.default = {
    createOrderTransactional,
    findAllAdmin,
    findByIdAdmin,
    updateByIdAdmin,
    findSummaryByUserId,
    findLastByDatePrefix,
    findAllByUserId,
    findByIdAndUserId,
};
